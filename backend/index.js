require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const https = require('https');
const crypto = require('crypto');
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

    const amount = Math.round(mentorResult.rows[0].hourly_rate * 100) / 100; // Amount in INR

    // Create booking record with pending status
    const bookingResult = await client.query(
      `INSERT INTO bookings 
       (mentor_id, customer_name, customer_email, customer_phone, session_topic, start_time, end_time, payment_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [mentor_id, customer_name, customer_email, customer_phone, session_topic, start_time, end_time, 'pending']
    );

    const booking_id = bookingResult.rows[0].id;

    // Return both payment options
    res.json({
      booking_id,
      amount,
      currency: 'INR',
      payment_methods: {
        upi: {
          available: !!process.env.RAZORPAY_KEY_ID,
          provider: 'razorpay'
        },
        international: {
          available: !!process.env.PAYPAL_CLIENT_ID,
          provider: 'paypal',
          client_id: process.env.PAYPAL_CLIENT_ID
        }
      },
      booking_details: {
        mentor_id,
        customer_email,
        customer_name,
        session_topic,
        start_time: start_time.toISOString(),
        end_time: end_time.toISOString(),
      }
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  } finally {
    client.release();
  }
});

// ============= RAZORPAY (UPI for India) =============

// Create Razorpay order
app.post('/api/razorpay/create-order', express.json(), async (req, res) => {
  try {
    const { booking_id, amount } = req.body;

    // Get booking details
    const bookingResult = await pool.query(
      'SELECT * FROM bookings WHERE id = $1',
      [booking_id]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];

    // Create Razorpay order using API
    const options = {
      hostname: 'api.razorpay.com',
      port: 443,
      path: '/v1/orders',
      method: 'POST',
      auth: `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const orderData = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `booking_${booking_id}`,
      notes: {
        booking_id,
        customer_email: booking.customer_email,
        session_topic: booking.session_topic
      }
    };

    const request = https.request(options, (razorpayRes) => {
      let data = '';
      razorpayRes.on('data', chunk => data += chunk);
      razorpayRes.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.id) {
            res.json({
              order_id: response.id,
              razorpay_key: process.env.RAZORPAY_KEY_ID,
              amount: amount,
              booking_id
            });
          } else {
            res.status(400).json({ error: 'Failed to create Razorpay order' });
          }
        } catch (e) {
          res.status(500).json({ error: 'Invalid response from Razorpay' });
        }
      });
    });

    request.on('error', error => {
      console.error('Razorpay request error:', error);
      res.status(500).json({ error: 'Razorpay service unavailable' });
    });

    request.write(JSON.stringify(orderData));
    request.end();
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ error: error.message });
  }
});

// Razorpay webhook handler
app.post('/api/webhook/razorpay', express.json(), async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    // Verify webhook signature
    const text = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Extract booking_id from receipt
    const bookingResult = await pool.query(
      'SELECT * FROM bookings WHERE payment_status = $1 ORDER BY created_at DESC LIMIT 1',
      ['pending']
    );

    if (bookingResult.rows.length > 0) {
      const booking = bookingResult.rows[0];

      // Update booking status
      await pool.query(
        `UPDATE bookings 
         SET payment_status = 'completed', booking_status = 'confirmed'
         WHERE id = $1`,
        [booking.id]
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

      // Store payment record
      await pool.query(
        `INSERT INTO payments (booking_id, amount, payment_method, payment_id, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [booking.id, booking.amount_paid || 0, 'razorpay_upi', razorpay_payment_id, 'completed']
      );

      console.log(`✅ Booking confirmed via UPI: ${booking.id} for ${booking.customer_email} (Razorpay: ${razorpay_payment_id})`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

// ============= PAYPAL (International) =============
app.post('/api/webhook/paypal', express.json(), async (req, res) => {
  try {
    const { event_type, resource } = req.body;
    
    // Only handle payment completed events
    if (event_type !== 'CHECKOUT.ORDER.COMPLETED') {
      return res.json({ success: true });
    }

    const order_id = resource.id;
    const booking_id = resource.purchase_units[0].custom_id; // We'll pass booking_id in custom field

    if (!booking_id) {
      return res.status(400).json({ error: 'No booking_id provided' });
    }

    // Get booking details
    const bookingResult = await pool.query(
      'SELECT * FROM bookings WHERE id = $1',
      [booking_id]
    );

    if (bookingResult.rows.length > 0) {
      const booking = bookingResult.rows[0];

      // Update booking status
      await pool.query(
        `UPDATE bookings 
         SET payment_status = 'completed', booking_status = 'confirmed'
         WHERE id = $1`,
        [booking_id]
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

      // Store payment record
      const amount = resource.purchase_units[0].amount.value;
      await pool.query(
        `INSERT INTO payments (booking_id, amount, payment_method, payment_id, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [booking_id, amount, 'paypal', order_id, 'completed']
      );

      console.log(`✅ Booking confirmed: ${booking_id} for ${booking.customer_email} (PayPal: ${order_id})`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Create PayPal order
app.post('/api/paypal/create-order', express.json(), async (req, res) => {
  try {
    const { booking_id, amount } = req.body;

    // Get booking details
    const bookingResult = await pool.query(
      'SELECT * FROM bookings WHERE id = $1',
      [booking_id]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];

    const createOrderUrl = 'https://api.sandbox.paypal.com/v2/checkout/orders';
    const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString('base64');

    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: booking_id,
        custom_id: booking_id,
        amount: {
          currency_code: 'INR',
          value: amount.toString()
        },
        description: `Booking with ${booking.session_topic || 'Mentor'}`
      }],
      application_context: {
        brand_name: 'Megaverse Live',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        return_url: `${process.env.FRONTEND_URL}/booking-success`,
        cancel_url: `${process.env.FRONTEND_URL}/booking-cancel`
      }
    };

    const options = {
      hostname: 'api.sandbox.paypal.com',
      port: 443,
      path: '/v2/checkout/orders',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      }
    };

    const request = https.request(options, (paypalRes) => {
      let data = '';
      paypalRes.on('data', chunk => data += chunk);
      paypalRes.on('end', () => {
        const response = JSON.parse(data);
        if (response.id) {
          res.json({ order_id: response.id });
        } else {
          res.status(400).json({ error: 'Failed to create PayPal order' });
        }
      });
    });

    request.on('error', error => {
      console.error('PayPal request error:', error);
      res.status(500).json({ error: 'PayPal service unavailable' });
    });

    request.write(JSON.stringify(orderData));
    request.end();
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    res.status(500).json({ error: error.message });
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
