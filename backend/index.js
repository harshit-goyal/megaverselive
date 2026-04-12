require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const https = require('https');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const emailService = require('./services/email');
const { generateAvailableSlots, getAvailableSlots } = require('./services/slots');

const app = express();
const PORT = process.env.PORT || 8080;

// Database connection
// Fix DB_USER if it contains @domain (e.g., "dbadmin@megaverse-db" -> "dbadmin")
let dbUser = process.env.DB_USER || '';
if (dbUser.includes('@')) {
  dbUser = dbUser.split('@')[0];
}

// Fix DB_NAME - use megaverse_db if bookings doesn't work
let dbName = process.env.DB_NAME || 'megaverse_db';
if (dbName === 'bookings') {
  dbName = 'megaverse_db';  // Azure has megaverse_db, not bookings
}

const pool = new Pool({
  host: process.env.DB_HOST,
  user: dbUser,
  password: process.env.DB_PASSWORD,
  database: dbName,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }, // Required for Azure
});

// Initialize database schema
async function initializeDatabase() {
  try {
    // Create mentee_accounts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mentee_accounts (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        bio TEXT,
        avatar_url VARCHAR(512),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create mentee_profiles table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mentee_profiles (
        id SERIAL PRIMARY KEY,
        mentee_id INT UNIQUE NOT NULL,
        timezone VARCHAR(50) DEFAULT 'America/New_York',
        preferences JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (mentee_id) REFERENCES mentee_accounts(id) ON DELETE CASCADE
      )
    `);
    
    // Create mentors table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mentors (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        bio TEXT,
        avatar_url VARCHAR(512),
        tracks TEXT[] DEFAULT ARRAY[]::TEXT[],
        rating DECIMAL(3, 2) DEFAULT 5.0,
        session_count INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Try to add mentee_id column to bookings (non-fatal if fails)
    try {
      await pool.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS mentee_id INT DEFAULT NULL`);
    } catch (e) {
      // Column might already exist
    }

    // Migrate mentors table - add missing columns if they don't exist
    try {
      await pool.query(`ALTER TABLE mentors ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)`);
      await pool.query(`ALTER TABLE mentors ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE`);
      await pool.query(`ALTER TABLE mentors ADD COLUMN IF NOT EXISTS bio TEXT`);
      await pool.query(`ALTER TABLE mentors ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(512)`);
      await pool.query(`ALTER TABLE mentors ADD COLUMN IF NOT EXISTS tracks TEXT[] DEFAULT ARRAY[]::TEXT[]`);
      await pool.query(`ALTER TABLE mentors ADD COLUMN IF NOT EXISTS rating DECIMAL(3, 2) DEFAULT 5.0`);
      await pool.query(`ALTER TABLE mentors ADD COLUMN IF NOT EXISTS session_count INT DEFAULT 0`);
      await pool.query(`ALTER TABLE mentors ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE`);
      await pool.query(`ALTER TABLE mentors ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
      await pool.query(`ALTER TABLE mentors ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
    } catch (e) {
      // Columns might already exist
    }
    
    // Create indexes (non-fatal if constraint already exists)
    try {
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_mentee_email ON mentee_accounts(email)`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_mentor_email ON mentors(email)`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_mentor_tracks ON mentors USING GIN(tracks)`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_bookings_mentee ON bookings(mentee_id)`);
    } catch (e) {
      // Indexes might already exist
    }
    
    console.log('✓ Database schema initialized');
  } catch (error) {
    console.error('Database initialization error:', error.message);
    // Non-fatal error, continue startup
  }
}

// Call on startup
initializeDatabase();

// Middleware
app.use(cors());
app.use(express.json());

// Add cache-busting headers for index.html
app.use((req, res, next) => {
  if (req.path === '/' || req.path === '/index.html') {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
  next();
});

// Serve static files (index.html, CSS, JS)
// Looking for files in 'public' folder, or root if not found
const path = require('path');
app.use(express.static(path.join(__dirname, '../public')));

// Fallback: serve index.html for root path if no API match
// This allows frontend to be served from backend while keeping API routes intact

// ============= JWT MIDDLEWARE =============

// Verify JWT token from Authorization header
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.MENTEE_JWT_SECRET || 'your_secret_key_change_in_env');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// ============= ROUTES =============

// Root endpoint - serve API info or frontend
app.get('/', (req, res) => {
  // Check if client wants JSON (API request) or HTML (browser)
  if (req.accepts('json') && !req.accepts('html')) {
    res.json({ 
      service: 'Megaverse Live API',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        health: 'GET /api/health',
        slots: 'GET /api/slots',
        book: 'POST /api/book',
        razorpayOrder: 'POST /api/razorpay/create-order',
        paypalOrder: 'POST /api/paypal/create-order',
        bookingDetails: 'GET /api/booking/:id',
        cancelBooking: 'POST /api/booking/:id/cancel'
      }
    });
  } else {
    // Try to serve index.html
    res.sendFile(path.join(__dirname, '../public/index.html'));
  }
});

// Auth pages
app.get('/auth', (req, res) => {
  res.sendFile(path.join(__dirname, '../auth.html'));
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../auth.html'));
});
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '../auth.html'));
});
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../auth.html'));
});
app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, '../auth.html'));
});

// Database debug endpoint
app.get('/api/debug/db', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    res.json({ 
      tables: result.rows.map(r => r.table_name),
      status: 'connected'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Credentials diagnostic endpoint
app.get('/api/debug/credentials', (req, res) => {
  res.json({
    configured: {
      DB_HOST: process.env.DB_HOST ? '✓ Set' : '✗ Missing',
      DB_USER: process.env.DB_USER ? '✓ Set' : '✗ Missing',
      DB_PASSWORD: process.env.DB_PASSWORD ? '✓ Set' : '✗ Missing',
      DB_NAME: process.env.DB_NAME ? '✓ Set' : '✗ Missing',
      DB_PORT: process.env.DB_PORT || 'Not set (default: 5432)'
    },
    connectionString: process.env.DB_HOST 
      ? `postgres://${process.env.DB_USER}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`
      : 'Not fully configured',
    note: 'This shows what environment variables are set. If all show ✓, the credentials should be correct.'
  });
});

// List available databases
app.get('/api/debug/list-databases', async (req, res) => {
  let adminPool;
  try {
    // Connect to default 'postgres' database to list all databases
    adminPool = new Pool({
      host: process.env.DB_HOST,
      user: dbUser,
      password: process.env.DB_PASSWORD,
      database: 'postgres',  // Connect to default db
      port: process.env.DB_PORT,
      ssl: { rejectUnauthorized: false },
    });
    
    const result = await adminPool.query(`
      SELECT datname FROM pg_database 
      WHERE datistemplate = false 
      ORDER BY datname
    `);
    
    adminPool.end();
    
    res.json({
      status: 'ok',
      databases: result.rows.map(r => r.datname),
      currentDatabase: process.env.DB_NAME
    });
  } catch (error) {
    if (adminPool) adminPool.end();
    res.status(500).json({
      error: error.message,
      code: error.code,
      hint: 'Could not list databases'
    });
  }
});

// Advanced database test endpoint
app.get('/api/debug/test-connection', async (req, res) => {
  try {
    // Try a simple query
    const result = await pool.query('SELECT NOW() as current_time');
    res.json({
      status: 'connected',
      message: 'Database connection successful!',
      serverTime: result.rows[0].current_time,
      note: 'If you see this, your credentials are correct and mentee signup should work.'
    });
  } catch (error) {
    res.status(500).json({
      status: 'connection_failed',
      error: error.message,
      code: error.code,
      errorHint: error.code === '28P01' 
        ? 'Authentication failed. Check DB_USER and DB_PASSWORD in environment variables.'
        : 'Database connection error. Check DB_HOST and DB_NAME.',
      note: 'Fix the error and redeploy to try again.'
    });
  }
});

// Manual database initialization endpoint (for fixing credential issues)
app.post('/api/admin/init-mentee-schema', async (req, res) => {
  try {
    // Check if tables already exist
    const checkResult = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'mentee_accounts'
    `);
    
    if (checkResult.rows.length > 0) {
      return res.json({ 
        success: true, 
        message: 'Mentee schema already exists',
        status: 'already_initialized'
      });
    }
    
    // Create mentee_accounts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mentee_accounts (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        bio TEXT,
        avatar_url VARCHAR(512),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create mentee_profiles table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mentee_profiles (
        id SERIAL PRIMARY KEY,
        mentee_id INT UNIQUE NOT NULL,
        timezone VARCHAR(50) DEFAULT 'America/New_York',
        preferences JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (mentee_id) REFERENCES mentee_accounts(id) ON DELETE CASCADE
      )
    `);
    
    // Add mentee_id column to bookings if not exists
    try {
      await pool.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS mentee_id INT DEFAULT NULL`);
    } catch (e) {
      // Column might already exist, that's fine
    }
    
    // Create indexes
    try {
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_mentee_email ON mentee_accounts(email)`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_bookings_mentee ON bookings(mentee_id)`);
    } catch (e) {
      // Indexes might already exist, that's fine
    }
    
    res.json({
      success: true,
      message: 'Mentee schema initialized successfully',
      tables_created: ['mentee_accounts', 'mentee_profiles'],
      note: 'You can now use signup at /api/auth/signup'
    });
  } catch (error) {
    console.error('Schema initialization error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
      hint: error.code === '28P01'
        ? 'Database credentials are incorrect. Update DB_USER and DB_PASSWORD environment variables and redeploy.'
        : 'Database error. Check connection settings.'
    });
  }
});

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
// Payment processing for UPI via Razorpay


// Create Razorpay order
app.post('/api/razorpay/create-order', express.json(), async (req, res) => {
  try {
    const { amount } = req.body;

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
      receipt: `order_${Date.now()}`,
      notes: {
        merchant: 'Megaverse Live'
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
              amount: amount
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
    const { amount, currency } = req.body;
    
    // Check if credentials are configured
    if (!process.env.PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID === 'YOUR_PAYPAL_CLIENT_ID' ||
        !process.env.PAYPAL_CLIENT_SECRET || process.env.PAYPAL_CLIENT_SECRET === 'YOUR_PAYPAL_SECRET') {
      console.error('PayPal credentials not configured properly');
      return res.status(400).json({ 
        error: 'PayPal credentials not configured. Please add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to environment variables.' 
      });
    }

    // Use sandbox endpoint (api.sandbox.paypal.com) or live based on environment
    const isLive = process.env.PAYPAL_MODE === 'live';
    const apiHost = isLive ? 'api-m.paypal.com' : 'api.sandbox.paypal.com';
    const createOrderUrl = `https://${apiHost}/v2/checkout/orders`;
    
    const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');

    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: currency || 'USD',
          value: amount.toString()
        },
        description: 'Megaverse Live - 1:1 Mentorship Session'
      }],
      application_context: {
        brand_name: 'Megaverse Live',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        return_url: `https://megaverse-live.onrender.com/`,
        cancel_url: `https://megaverse-live.onrender.com/`
      }
    };

    const options = {
      hostname: apiHost,
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
        try {
          const response = JSON.parse(data);
          if (response.id) {
            res.json({ order_id: response.id });
          } else {
            console.error('PayPal order creation failed:', response);
            res.status(400).json({ error: 'Failed to create PayPal order' });
          }
        } catch (e) {
          console.error('Error parsing PayPal response:', e);
          res.status(500).json({ error: 'Invalid response from PayPal' });
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
    console.error('PayPal order creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
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

// ============= PAYMENT WEBHOOKS =============

// Razorpay Webhook Handler
app.post('/api/razorpay/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.warn('Razorpay webhook secret not configured');
      return res.status(400).json({ error: 'Webhook secret not configured' });
    }

    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (digest !== req.headers['x-razorpay-signature']) {
      console.error('Razorpay webhook signature verification failed');
      return res.status(403).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    console.log('Razorpay webhook event:', event.event);

    // Handle payment success
    if (event.event === 'payment.authorized' || event.event === 'payment.captured') {
      const paymentData = event.payload.payment.entity;
      console.log('Payment successful:', paymentData.id);
      
      // Store payment record
      await pool.query(
        `INSERT INTO payment_records (payment_id, provider, amount, currency, status, metadata) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         ON CONFLICT (payment_id) DO UPDATE SET status = $5`,
        [
          paymentData.id,
          'razorpay',
          paymentData.amount / 100, // Convert paise to rupees
          paymentData.currency,
          'completed',
          JSON.stringify(paymentData)
        ]
      );

      res.json({ success: true });
    }
    // Handle payment failure
    else if (event.event === 'payment.failed') {
      const paymentData = event.payload.payment.entity;
      console.log('Payment failed:', paymentData.id);
      
      await pool.query(
        `INSERT INTO payment_records (payment_id, provider, amount, currency, status, metadata) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         ON CONFLICT (payment_id) DO UPDATE SET status = $5`,
        [
          paymentData.id,
          'razorpay',
          paymentData.amount / 100,
          paymentData.currency,
          'failed',
          JSON.stringify(paymentData)
        ]
      );

      res.json({ success: true });
    } else {
      res.json({ success: true });
    }
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// PayPal Webhook Handler
app.post('/api/paypal/webhook', express.json(), async (req, res) => {
  try {
    const event = req.body;
    console.log('PayPal webhook event:', event.event_type);

    // Handle payment success
    if (event.event_type === 'CHECKOUT.ORDER.COMPLETED') {
      const order = event.resource;
      console.log('PayPal order completed:', order.id);
      
      // Store payment record
      await pool.query(
        `INSERT INTO payment_records (payment_id, provider, amount, currency, status, metadata) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         ON CONFLICT (payment_id) DO UPDATE SET status = $5`,
        [
          order.id,
          'paypal',
          order.purchase_units[0].amount.value,
          order.purchase_units[0].amount.currency_code,
          'completed',
          JSON.stringify(order)
        ]
      );

      res.json({ success: true });
    }
    // Handle payment failure
    else if (event.event_type === 'CHECKOUT.ORDER.DECLINED') {
      const order = event.resource;
      console.log('PayPal order declined:', order.id);
      
      await pool.query(
        `INSERT INTO payment_records (payment_id, provider, amount, currency, status, metadata) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         ON CONFLICT (payment_id) DO UPDATE SET status = $5`,
        [
          order.id,
          'paypal',
          order.purchase_units[0].amount.value,
          order.purchase_units[0].amount.currency_code,
          'failed',
          JSON.stringify(order)
        ]
      );

      res.json({ success: true });
    } else {
      res.json({ success: true });
    }
  } catch (error) {
    console.error('PayPal webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Get payment status endpoint
app.get('/api/payment/:paymentId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM payment_records WHERE payment_id = $1',
      [req.params.paymentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({ error: 'Failed to fetch payment status' });
  }
});

// ============= AUTHENTICATION ENDPOINTS =============

// POST /api/auth/signup - Create new mentee account
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }
    
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    
    try {
      // Try to insert mentee account
      const result = await pool.query(
        'INSERT INTO mentee_accounts (email, password_hash, name, phone) VALUES ($1, $2, $3, $4) RETURNING id, email, name',
        [email, passwordHash, name, phone || null]
      );
      
      const mentee = result.rows[0];
      
      // Create mentee profile
      await pool.query(
        'INSERT INTO mentee_profiles (mentee_id, timezone) VALUES ($1, $2)',
        [mentee.id, 'America/New_York']
      );
      
      // Generate JWT token
      const token = jwt.sign(
        { id: mentee.id, email: mentee.email, name: mentee.name },
        process.env.MENTEE_JWT_SECRET || 'your_secret_key_change_in_env',
        { expiresIn: '24h' }
      );
      
      return res.status(201).json({
        success: true,
        user: mentee,
        token: token,
        expiresIn: 86400
      });
    } catch (dbError) {
      // If table doesn't exist, try to initialize schema
      if (dbError.code === '42P01' || dbError.message?.includes('mentee_accounts')) {
        console.log('Tables not found, attempting to initialize schema...');
        
        try {
          // Create tables
          await pool.query(`
            CREATE TABLE IF NOT EXISTS mentee_accounts (
              id SERIAL PRIMARY KEY,
              email VARCHAR(255) UNIQUE NOT NULL,
              password_hash VARCHAR(255) NOT NULL,
              name VARCHAR(255) NOT NULL,
              phone VARCHAR(20),
              bio TEXT,
              avatar_url VARCHAR(512),
              is_active BOOLEAN DEFAULT TRUE,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `);
          
          await pool.query(`
            CREATE TABLE IF NOT EXISTS mentee_profiles (
              id SERIAL PRIMARY KEY,
              mentee_id INT UNIQUE NOT NULL,
              timezone VARCHAR(50) DEFAULT 'America/New_York',
              preferences JSONB DEFAULT '{}',
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (mentee_id) REFERENCES mentee_accounts(id) ON DELETE CASCADE
            )
          `);
          
          // Create indexes
          try {
            await pool.query(`CREATE INDEX IF NOT EXISTS idx_mentee_email ON mentee_accounts(email)`);
          } catch (e) {}
          
          console.log('Schema initialized, retrying signup...');
          
          // Retry the signup
          const result = await pool.query(
            'INSERT INTO mentee_accounts (email, password_hash, name, phone) VALUES ($1, $2, $3, $4) RETURNING id, email, name',
            [email, passwordHash, name, phone || null]
          );
          
          const mentee = result.rows[0];
          
          await pool.query(
            'INSERT INTO mentee_profiles (mentee_id, timezone) VALUES ($1, $2)',
            [mentee.id, 'America/New_York']
          );
          
          const token = jwt.sign(
            { id: mentee.id, email: mentee.email, name: mentee.name },
            process.env.MENTEE_JWT_SECRET || 'your_secret_key_change_in_env',
            { expiresIn: '24h' }
          );
          
          return res.status(201).json({
            success: true,
            user: mentee,
            token: token,
            expiresIn: 86400
          });
        } catch (initError) {
          console.error('Failed to initialize schema:', initError);
          throw dbError; // Throw original error if initialization fails
        }
      }
      
      throw dbError;
    }
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email already registered' });
    }
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed', details: error.message });
  }
});

// POST /api/auth/login - Login with email and password
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Get mentee from database
    const result = await pool.query(
      'SELECT id, email, name, password_hash FROM mentee_accounts WHERE email = $1 AND is_active = true',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const mentee = result.rows[0];
    
    // Verify password
    const passwordMatch = await bcrypt.compare(password, mentee.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: mentee.id, email: mentee.email, name: mentee.name },
      process.env.MENTEE_JWT_SECRET || 'your_secret_key_change_in_env',
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      user: { id: mentee.id, email: mentee.email, name: mentee.name },
      token: token,
      expiresIn: 86400
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/mentee/profile - Get current user profile (requires JWT)
app.get('/api/mentee/profile', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ma.id, ma.email, ma.name, ma.phone, ma.bio, ma.avatar_url, ma.created_at,
              mp.timezone
       FROM mentee_accounts ma
       LEFT JOIN mentee_profiles mp ON ma.id = mp.mentee_id
       WHERE ma.id = $1 AND ma.is_active = true`,
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /api/mentee/profile - Update profile (requires JWT)
app.put('/api/mentee/profile', verifyToken, async (req, res) => {
  try {
    const { name, phone, bio, timezone } = req.body;
    
    // Update mentee_accounts
    const accountResult = await pool.query(
      'UPDATE mentee_accounts SET name = COALESCE($1, name), phone = COALESCE($2, phone), bio = COALESCE($3, bio), updated_at = NOW() WHERE id = $4 RETURNING id, email, name, phone, bio, avatar_url',
      [name || null, phone || null, bio || null, req.user.id]
    );
    
    // Update mentee_profiles
    if (timezone) {
      await pool.query(
        'UPDATE mentee_profiles SET timezone = $1, updated_at = NOW() WHERE mentee_id = $2',
        [timezone, req.user.id]
      );
    }
    
    res.json({
      success: true,
      user: accountResult.rows[0]
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// GET /api/mentee/bookings - Get all mentee's bookings (requires JWT)
app.get('/api/mentee/bookings', verifyToken, async (req, res) => {
  try {
    // First ensure mentee_id column exists on bookings table
    try {
      await pool.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS mentee_id INT DEFAULT NULL`);
    } catch (e) {
      // Column might already exist
    }
    
    const result = await pool.query(
      `SELECT b.id, b.mentor_id, b.customer_name, b.customer_email, b.session_topic,
              b.start_time, b.end_time, b.payment_status, b.booking_status, b.notes, b.created_at
       FROM bookings b
       WHERE b.mentee_id = $1 OR b.customer_email = $2
       ORDER BY b.start_time DESC`,
      [req.user.id, req.user.email]
    );
    
    const upcoming = result.rows.filter(b => new Date(b.start_time) > new Date());
    const past = result.rows.filter(b => new Date(b.start_time) <= new Date());
    
    res.json({
      bookings: result.rows,
      upcoming: upcoming.length,
      past: past.length
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings', details: error.message });
  }
});

// GET /api/mentee/bookings/:id - Get booking details (requires JWT)
app.get('/api/mentee/bookings/:id', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.id, b.mentor_id, b.customer_name, b.customer_email, b.session_topic,
              b.start_time, b.end_time, b.payment_status, b.booking_status, b.notes,
              m.name as mentor_name, m.bio as mentor_bio,
              pr.payment_id, pr.amount, pr.currency, pr.status as payment_verified
       FROM bookings b
       LEFT JOIN mentors m ON b.mentor_id = m.id
       LEFT JOIN payment_records pr ON b.id = pr.id
       WHERE b.id = $1 AND (b.mentee_id = $2 OR b.customer_email = $3)`,
      [req.params.id, req.user.id, req.user.email]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json({ booking: result.rows[0] });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// ============= MENTOR AUTH ENDPOINTS =============

// POST /api/mentor/signup - Create new mentor account
app.post('/api/mentor/signup', async (req, res) => {
  try {
    const { email, password, name, bio, tracks } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }
    
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    
    if (!tracks || !Array.isArray(tracks) || tracks.length === 0) {
      return res.status(400).json({ error: 'At least one track must be selected (english, backend)' });
    }
    
    // Validate tracks
    const validTracks = ['english', 'backend'];
    const normalizedTracks = tracks.map(t => t.toLowerCase());
    if (!normalizedTracks.every(t => validTracks.includes(t))) {
      return res.status(400).json({ error: 'Invalid tracks. Valid options: english, backend' });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    
    try {
      // Insert mentor account
      const result = await pool.query(
        `INSERT INTO mentors (email, password_hash, name, bio, tracks) 
         VALUES ($1, $2, $3, $4, $5::TEXT[]) 
         RETURNING id, email, name, bio, tracks`,
        [email, passwordHash, name, bio || null, normalizedTracks]
      );
      
      const mentor = result.rows[0];
      
      // Generate JWT token
      const token = jwt.sign(
        { id: mentor.id, email: mentor.email, name: mentor.name, type: 'mentor' },
        process.env.MENTOR_JWT_SECRET || 'mentor_secret_key_change_in_env',
        { expiresIn: '24h' }
      );
      
      return res.status(201).json({
        success: true,
        user: mentor,
        token: token,
        expiresIn: 86400
      });
    } catch (dbError) {
      // If table doesn't exist, try to initialize schema
      if (dbError.code === '42P01' || dbError.message?.includes('mentors')) {
        console.log('Mentors table not found, attempting to initialize schema...');
        
        try {
          await pool.query(`
            CREATE TABLE IF NOT EXISTS mentors (
              id SERIAL PRIMARY KEY,
              email VARCHAR(255) UNIQUE NOT NULL,
              password_hash VARCHAR(255) NOT NULL,
              name VARCHAR(255) NOT NULL,
              bio TEXT,
              avatar_url VARCHAR(512),
              tracks TEXT[] DEFAULT ARRAY[]::TEXT[],
              rating DECIMAL(3, 2) DEFAULT 5.0,
              session_count INT DEFAULT 0,
              is_active BOOLEAN DEFAULT TRUE,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `);
          
          try {
            await pool.query(`CREATE INDEX IF NOT EXISTS idx_mentor_email ON mentors(email)`);
            await pool.query(`CREATE INDEX IF NOT EXISTS idx_mentor_tracks ON mentors USING GIN(tracks)`);
          } catch (e) {}
          
          console.log('Mentors schema initialized, retrying signup...');
          
          // Retry the signup
          const result = await pool.query(
            `INSERT INTO mentors (email, password_hash, name, bio, tracks) 
             VALUES ($1, $2, $3, $4, $5::TEXT[]) 
             RETURNING id, email, name, bio, tracks`,
            [email, passwordHash, name, bio || null, normalizedTracks]
          );
          
          const mentor = result.rows[0];
          
          const token = jwt.sign(
            { id: mentor.id, email: mentor.email, name: mentor.name, type: 'mentor' },
            process.env.MENTOR_JWT_SECRET || 'mentor_secret_key_change_in_env',
            { expiresIn: '24h' }
          );
          
          return res.status(201).json({
            success: true,
            user: mentor,
            token: token,
            expiresIn: 86400
          });
        } catch (initError) {
          console.error('Failed to initialize mentors schema:', initError);
          throw dbError;
        }
      }
      
      throw dbError;
    }
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email already registered' });
    }
    console.error('Mentor signup error:', error);
    res.status(500).json({ error: 'Mentor signup failed', details: error.message });
  }
});

// POST /api/mentor/login - Login mentor with email and password
app.post('/api/mentor/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Find mentor
    const result = await pool.query(
      'SELECT id, email, password_hash, name, bio, tracks FROM mentors WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const mentor = result.rows[0];
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, mentor.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: mentor.id, email: mentor.email, name: mentor.name, type: 'mentor' },
      process.env.MENTOR_JWT_SECRET || 'mentor_secret_key_change_in_env',
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      user: {
        id: mentor.id,
        email: mentor.email,
        name: mentor.name,
        bio: mentor.bio,
        tracks: mentor.tracks
      },
      token: token,
      expiresIn: 86400
    });
  } catch (error) {
    console.error('Mentor login error:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

// GET /api/mentors - Get all mentors (public)
app.get('/api/mentors', async (req, res) => {
  try {
    const { track } = req.query;
    
    let query = `SELECT id, name, bio, COALESCE(avatar_url, '') as avatar_url, tracks, rating, session_count FROM mentors WHERE is_active = TRUE`;
    const params = [];
    
    // If track is specified, filter by track
    if (track) {
      query += ' AND $1 = ANY(tracks)';
      params.push(track.toLowerCase());
    }
    
    query += ' ORDER BY session_count DESC, rating DESC';
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      mentors: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching mentors:', error);
    res.status(500).json({ error: 'Failed to fetch mentors', details: error.message });
  }
});

// GET /api/mentor/profile - Get current logged-in mentor profile (requires JWT)
// IMPORTANT: Define this BEFORE /api/mentor/:id to avoid route matching conflict
const verifyMentorToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(
      token,
      process.env.MENTOR_JWT_SECRET || 'mentor_secret_key_change_in_env'
    );
    
    if (decoded.type !== 'mentor') {
      return res.status(403).json({ error: 'Invalid token type' });
    }
    
    req.mentor = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

app.get('/api/mentor/profile', verifyMentorToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, bio, avatar_url, tracks, rating, session_count FROM mentors WHERE id = $1',
      [req.mentor.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mentor not found' });
    }
    
    res.json({
      success: true,
      mentor: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching mentor profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile', details: error.message });
  }
});

// GET /api/mentor/:id - Get specific mentor profile (public)
app.get('/api/mentor/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, bio, COALESCE(avatar_url, '') as avatar_url, tracks, rating, session_count, created_at FROM mentors WHERE id = $1 AND is_active = TRUE`,
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mentor not found' });
    }
    
    res.json({
      success: true,
      mentor: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching mentor:', error);
    res.status(500).json({ error: 'Failed to fetch mentor', details: error.message });
  }
});

// PUT /api/mentor/profile - Update mentor profile (requires JWT)
app.put('/api/mentor/profile', verifyMentorToken, async (req, res) => {
  try {
    const { name, bio, avatar_url, tracks } = req.body;
    
    if (tracks && Array.isArray(tracks)) {
      const validTracks = ['english', 'backend'];
      const normalizedTracks = tracks.map(t => t.toLowerCase());
      if (!normalizedTracks.every(t => validTracks.includes(t))) {
        return res.status(400).json({ error: 'Invalid tracks. Valid options: english, backend' });
      }
    }
    
    const result = await pool.query(
      `UPDATE mentors 
       SET name = COALESCE($1, name),
           bio = COALESCE($2, bio),
           avatar_url = COALESCE($3, avatar_url),
           tracks = COALESCE($4::TEXT[], tracks),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, email, name, bio, avatar_url, tracks, rating, session_count`,
      [
        name || null,
        bio || null,
        avatar_url || null,
        tracks ? tracks.map(t => t.toLowerCase()) : null,
        req.mentor.id
      ]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mentor not found' });
    }
    
    res.json({
      success: true,
      mentor: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating mentor profile:', error);
    res.status(500).json({ error: 'Failed to update profile', details: error.message });
  }
});

// ============= START SERVER =============

app.listen(PORT, () => {
  console.log(`Megaverse Live API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
