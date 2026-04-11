require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const emailService = require('./services/email');
const { generateAvailableSlots, getAvailableSlots } = require('./services/slots');

const app = express();
const PORT = process.env.PORT || 8080;

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }, // Required for Azure
});

// Middleware
app.use(cors());
app.use(express.json());

// ============= ROUTES =============

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date(), message: 'Megaverse Live API is running' });
});

// Initialize available slots (run once on startup)
app.post('/api/admin/init-slots', async (req, res) => {
  try {
    const slotsCount = await generateAvailableSlots(1, 60, 4); // 60 days, 4 slots/day
    res.json({ success: true, message: `Generated ${slotsCount} available slots` });
  } catch (error) {
    console.error('Error initializing slots:', error);
    res.status(500).json({ error: 'Failed to initialize slots' });
  }
});

// Get available slots for a mentor
app.get('/api/slots', async (req, res) => {
  try {
    const { mentor_id = 1, limit = 20 } = req.query;
    const slots = await getAvailableSlots(mentor_id, parseInt(limit));
    res.json({ slots, count: slots.length });
  } catch (error) {
    console.error('Error fetching slots:', error);
    res.status(500).json({ error: 'Failed to fetch slots' });
  }
});

// Create a booking (initiate payment)
app.post('/api/book', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { 
      mentor_id = 1, 
      customer_name, 
      customer_email, 
      customer_phone, 
      start_time, 
      session_topic 
    } = req.body;

    // Validate required fields
    if (!customer_name || !customer_email || !start_time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get the time slot
    const slotResult = await client.query(
      `SELECT end_time FROM time_slots 
       WHERE mentor_id = $1 AND start_time = $2 AND is_booked = FALSE`,
      [mentor_id, start_time]
    );

    if (slotResult.rows.length === 0) {
      return res.status(400).json({ error: 'Slot not available' });
    }

    const end_time = slotResult.rows[0].end_time;

    // Get mentor details for pricing
    const mentorResult = await client.query(
      'SELECT hourly_rate FROM mentors WHERE id = $1',
      [mentor_id]
    );

    const amount_cents = mentorResult.rows[0].hourly_rate; // Assuming full session price

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount_cents,
      currency: 'usd',
      metadata: {
        mentor_id,
        customer_email,
        start_time: start_time.toISOString(),
      },
    });

    // Create booking record (payment_status: pending)
    const bookingResult = await client.query(
      `INSERT INTO bookings 
       (mentor_id, customer_name, customer_email, customer_phone, session_topic, start_time, end_time, stripe_payment_id, payment_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [mentor_id, customer_name, customer_email, customer_phone, session_topic, start_time, end_time, paymentIntent.id, 'pending']
    );

    res.json({
      booking_id: bookingResult.rows[0].id,
      client_secret: paymentIntent.client_secret,
      amount: amount_cents,
      currency: 'usd',
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  } finally {
    client.release();
  }
});

// Stripe webhook handler
app.post('/api/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      
      // Get booking details
      const bookingResult = await pool.query(
        'SELECT * FROM bookings WHERE stripe_payment_id = $1',
        [paymentIntent.id]
      );

      if (bookingResult.rows.length > 0) {
        const booking = bookingResult.rows[0];

        // Update booking status
        await pool.query(
          `UPDATE bookings 
           SET payment_status = 'completed', booking_status = 'confirmed'
           WHERE stripe_payment_id = $1`,
          [paymentIntent.id]
        );

        // Mark time slot as booked
        await pool.query(
          `UPDATE time_slots 
           SET is_booked = TRUE 
           WHERE mentor_id = $1 AND start_time = $2`,
          [booking.mentor_id, booking.start_time]
        );

        // Get mentor info for email
        const mentorResult = await pool.query(
          'SELECT name, email FROM mentors WHERE id = $1',
          [booking.mentor_id]
        );

        // Send confirmation email
        if (mentorResult.rows.length > 0) {
          await emailService.sendBookingConfirmation(booking, mentorResult.rows[0]);
        }

        console.log(`✅ Booking confirmed: ${booking.id} for ${booking.customer_email}`);
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// Get booking details
app.get('/api/booking/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM bookings WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// Cancel booking
app.post('/api/booking/:id/cancel', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const bookingResult = await client.query(
      'SELECT * FROM bookings WHERE id = $1',
      [req.params.id]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];

    // Cancel booking
    await client.query(
      'UPDATE bookings SET booking_status = $1 WHERE id = $2',
      ['cancelled', req.params.id]
    );

    // Free up time slot
    await client.query(
      'UPDATE time_slots SET is_booked = FALSE WHERE mentor_id = $1 AND start_time = $2',
      [booking.mentor_id, booking.start_time]
    );

    res.json({ success: true, message: 'Booking cancelled' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  } finally {
    client.release();
  }
});

// ============= START SERVER =============

app.listen(PORT, () => {
  console.log(`Megaverse Live API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
