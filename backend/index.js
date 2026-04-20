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
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  max: 5, // Reduced for free tier Render
  min: 1
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
      await pool.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS is_cancelled BOOLEAN DEFAULT FALSE`);
      await pool.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancellation_reason TEXT`);
      await pool.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP`);
      await pool.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_by VARCHAR(50)`);
    } catch (e) {

      // Add verification columns to mentee_accounts
      await pool.query(`ALTER TABLE mentee_accounts ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE`);
      await pool.query(`ALTER TABLE mentee_accounts ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255)`);
      await pool.query(`ALTER TABLE mentee_accounts ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP`);
      await pool.query(`ALTER TABLE mentee_accounts ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP`);
      
      // Add verification columns to mentors
      await pool.query(`ALTER TABLE mentors ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE`);
      await pool.query(`ALTER TABLE mentors ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255)`);
      await pool.query(`ALTER TABLE mentors ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP`);
      await pool.query(`ALTER TABLE mentors ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP`);
      // Columns might already exist
    }

    // Create ratings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ratings (
        id SERIAL PRIMARY KEY,
        booking_id INT NOT NULL,
        mentor_id INT NOT NULL,
        mentee_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
        FOREIGN KEY (mentor_id) REFERENCES mentors(id) ON DELETE CASCADE,
        FOREIGN KEY (mentee_id) REFERENCES mentee_accounts(id) ON DELETE CASCADE,
        UNIQUE(booking_id)
      )
    `);

    // Create booking_reminders table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS booking_reminders (
        id SERIAL PRIMARY KEY,
        booking_id INT NOT NULL,
        reminder_type VARCHAR(20) NOT NULL,
        sent_at TIMESTAMP,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
        UNIQUE(booking_id, reminder_type)
      )
    `);


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

// Start DB initialization asynchronously (don't block server startup)
let dbInitPromise = null;
setImmediate(async () => {
  const startTime = Date.now();
  dbInitPromise = initializeDatabase();
  await dbInitPromise;
  console.log(`⏱ DB schema init took ${Date.now() - startTime}ms`);
});

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

    // Get mentee_id from auth token if available
    let mentee_id = null;
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.MENTEE_JWT_SECRET || 'mentee-secret-key');
        mentee_id = decoded.id || decoded.mentee_id;
        
        // Check if mentee is verified
        const menteeRes = await client.query(
          'SELECT is_verified FROM mentee_accounts WHERE id = $1',
          [mentee_id]
        );
        
        if (menteeRes.rows.length > 0 && !menteeRes.rows[0].is_verified) {
          return res.status(403).json({ 
            error: 'Email verification required', 
            message: 'Please verify your email before booking sessions'
          });
        }
      } catch (e) {
        // Token verification failed, continue without mentee_id
      }
    }

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

    // Create booking record with pending status and mentee_id if available
    const bookingResult = await client.query(
      `INSERT INTO bookings 
       (mentor_id, customer_name, customer_email, customer_phone, session_topic, start_time, end_time, payment_status, mentee_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [mentor_id, customer_name, customer_email, customer_phone, session_topic, start_time, end_time, 'pending', mentee_id]
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
    let errorMsg = 'Failed to create booking';
    let statusCode = 500;
    
    if (error.message.includes('duplicate')) {
      errorMsg = 'This booking already exists';
      statusCode = 400;
    } else if (error.message.includes('not found')) {
      errorMsg = 'Mentor not found';
      statusCode = 404;
    } else if (error.message.includes('no connection')) {
      errorMsg = 'Database connection error. Please try again later.';
      statusCode = 503;
    }
    
    res.status(statusCode).json({ error: errorMsg, details: process.env.NODE_ENV === 'development' ? error.message : undefined });
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


// POST /api/auth/send-verification - Send verification email
app.post('/api/auth/send-verification', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.body.userType || 'mentee'; // 'mentee' or 'mentor'
    
    const tableName = userType === 'mentor' ? 'mentors' : 'mentee_accounts';
    
    // Get user
    const userRes = await pool.query(`SELECT email, name, is_verified FROM ${tableName} WHERE id = $1`, [userId]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userRes.rows[0];
    
    if (user.is_verified) {
      return res.status(400).json({ error: 'User is already verified' });
    }
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Save token
    await pool.query(
      `UPDATE ${tableName} SET verification_token = $1, verification_token_expires = $2 WHERE id = $3`,
      [verificationToken, expiryTime, userId]
    );
    
    // Send email
    const verificationLink = `${process.env.FRONTEND_URL || 'https://megaverselive.com'}/verify?token=${verificationToken}&type=${userType}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7e22ce;">Verify Your Email ✅</h2>
        <p>Hi ${user.name},</p>
        <p>Thank you for joining Megaverse Live! Please verify your email address to complete your signup.</p>
        <p>
          <a href="${verificationLink}" style="display: inline-block; background: #7e22ce; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
            Verify Email
          </a>
        </p>
        <p style="color: #666; font-size: 12px;">
          This link will expire in 24 hours. If you didn't create this account, please ignore this email.
        </p>
      </div>
    `;
    
    await emailService.transporter.sendMail({
      from: process.env.EMAIL_FROM || 'hello@megaverselive.com',
      to: user.email,
      subject: 'Verify Your Email - Megaverse Live',
      html
    });
    
    res.json({ success: true, message: 'Verification email sent' });
  } catch (error) {
    console.error('Error sending verification:', error);
    res.status(500).json({ error: 'Failed to send verification email' });
  }
});

// GET /api/auth/verify - Verify email with token
app.get('/api/auth/verify', async (req, res) => {
  try {
    const { token, type } = req.query;
    
    if (!token || !type) {
      return res.status(400).json({ error: 'Token and type are required' });
    }
    
    const tableName = type === 'mentor' ? 'mentors' : 'mentee_accounts';
    
    // Find user with token
    const userRes = await pool.query(
      `SELECT id, email, name FROM ${tableName} WHERE verification_token = $1 AND verification_token_expires > CURRENT_TIMESTAMP`,
      [token]
    );
    
    if (userRes.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }
    
    const user = userRes.rows[0];
    
    // Mark as verified
    await pool.query(
      `UPDATE ${tableName} SET is_verified = TRUE, verified_at = CURRENT_TIMESTAMP, verification_token = NULL, verification_token_expires = NULL WHERE id = $1`,
      [user.id]
    );
    
    res.json({
      success: true,
      message: 'Email verified successfully!',
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ error: 'Failed to verify email' });
  }
});

// GET /api/auth/verification-status - Check if user is verified
app.get('/api/auth/verification-status', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.query.type || 'mentee';
    
    const tableName = userType === 'mentor' ? 'mentors' : 'mentee_accounts';
    
    const result = await pool.query(`SELECT is_verified, email FROM ${tableName} WHERE id = $1`, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ is_verified: result.rows[0].is_verified, email: result.rows[0].email });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check verification status' });
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

// Create mentor_applications table if it doesn't exist
async function initMentorApplicationsTable() {
  try {
    // Create table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mentor_applications (
        id SERIAL PRIMARY KEY,
        track VARCHAR(50) NOT NULL DEFAULT 'tech',
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        current_role VARCHAR(255) NOT NULL,
        linkedin_url VARCHAR(512) NOT NULL,
        mentor_categories TEXT[] DEFAULT ARRAY[]::TEXT[],
        bio VARCHAR(100),
        companies TEXT[] DEFAULT ARRAY[]::TEXT[],
        certifications TEXT[] DEFAULT ARRAY[]::TEXT[],
        languages TEXT[] DEFAULT ARRAY[]::TEXT[],
        session_rate INT DEFAULT 1200,
        session_length INT DEFAULT 60,
        profile_photo BYTEA,
        status VARCHAR(50) DEFAULT 'pending_review',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reviewed_at TIMESTAMP,
        reviewed_by VARCHAR(255),
        rejection_reason TEXT
      )
    `);
    
    // Add missing columns if they don't exist
    await pool.query(`
      ALTER TABLE mentor_applications
      ADD COLUMN IF NOT EXISTS track VARCHAR(50) NOT NULL DEFAULT 'tech'
    `);
    
    await pool.query(`
      ALTER TABLE mentor_applications
      ADD COLUMN IF NOT EXISTS certifications TEXT[] DEFAULT ARRAY[]::TEXT[]
    `);
    
    console.log('✓ Mentor applications table ready');
  } catch (error) {
    console.error('Error creating mentor_applications table:', error.message);
  }
}

initMentorApplicationsTable();

// Admin token verification middleware
const verifyAdminToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  try {
    const decoded = jwt.verify(token, ADMIN_JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// POST /api/mentor/onboarding - Submit mentor onboarding application
app.post('/api/mentor/onboarding', async (req, res) => {
  try {
    const {
      track,
      fullName,
      email,
      password,
      currentRole,
      linkedinUrl,
      mentorCategories,
      bio,
      companies,
      certifications,
      languages,
      sessionRate,
      sessionLength,
      profilePhoto
    } = req.body;

    // Validation
    if (!track || !fullName || !password || !currentRole || !linkedinUrl || !mentorCategories || mentorCategories.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['tech', 'english'].includes(track)) {
      return res.status(400).json({ error: 'Invalid track' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    try {
      // Insert mentor application
      const result = await pool.query(
        `INSERT INTO mentor_applications 
         (track, full_name, email, password_hash, current_role, linkedin_url, mentor_categories, 
          bio, companies, certifications, languages, session_rate, session_length, profile_photo, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
         RETURNING id, email, full_name, status, track`,
        [
          track,
          fullName,
          email,
          passwordHash,
          currentRole,
          linkedinUrl,
          mentorCategories,
          bio,
          companies || [],
          certifications || [],
          languages || [],
          sessionRate || (track === 'tech' ? 1200 : 900),
          sessionLength || 60,
          profilePhoto ? Buffer.from(profilePhoto, 'base64') : null,
          'pending_review'
        ]
      );

      const application = result.rows[0];

      // Send notification to admin (WhatsApp/Email)
      try {
        await fetch(`http://localhost:${PORT}/api/notify-admin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'mentor_application',
            title: `New mentor application from ${fullName}`,
            applicationId: application.id,
            email: application.email
          })
        }).catch(err => console.log('Notification skipped:', err.message));
      } catch (notifyError) {
        console.log('Admin notification error (non-blocking):', notifyError.message);
      }

      return res.status(201).json({
        success: true,
        message: 'Application submitted successfully. Your profile is under review.',
        applicationId: application.id,
        email: application.email
      });
    } catch (dbError) {
      if (dbError.code === '23505') {
        return res.status(409).json({ error: 'Email already registered' });
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Mentor onboarding error:', error);
    res.status(500).json({ error: 'Failed to submit application', details: error.message });
  }
});

// POST /api/mentor/onboarding/:id/approve - Approve mentor application (admin only)
app.post('/api/mentor/onboarding/:id/approve', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get application
    const appResult = await pool.query(
      'SELECT * FROM mentor_applications WHERE id = $1',
      [id]
    );

    if (appResult.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const app = appResult.rows[0];

    // Create actual mentor account
    const mentorResult = await pool.query(
      `INSERT INTO mentors 
       (email, password_hash, name, bio, tracks, avatar_url, rating, session_count, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, 5.0, 0, true)
       RETURNING id, email, name`,
      [
        app.email,
        app.password_hash,
        app.full_name,
        app.bio,
        app.mentor_categories,
        app.profile_photo ? `data:image/jpeg;base64,${Buffer.from(app.profile_photo).toString('base64')}` : null
      ]
    );

    const mentor = mentorResult.rows[0];

    // Update application status
    await pool.query(
      `UPDATE mentor_applications 
       SET status = $1, reviewed_at = CURRENT_TIMESTAMP, reviewed_by = $2
       WHERE id = $3`,
      ['approved', req.user.email, id]
    );

    // Send approval email/WhatsApp to mentor
    try {
      const emailService = require('./services/email');
      await emailService.send({
        to: app.email,
        subject: '🎉 Welcome to Megaverse Live as a Mentor!',
        html: `
          <h2>Your mentor profile is approved!</h2>
          <p>Hi ${app.full_name},</p>
          <p>Great news! Your application has been approved. Your mentor profile is now live on Megaverse Live.</p>
          <p><strong>Next steps:</strong></p>
          <ul>
            <li>Log in to your mentor dashboard</li>
            <li>Set your weekly availability</li>
            <li>Connect your calendar (optional)</li>
            <li>Start accepting bookings!</li>
          </ul>
          <p><a href="https://megaverselive.com/auth?type=mentor&action=login" style="background: #a855f7; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Log In to Dashboard</a></p>
          <p>Questions? Reply to this email or contact support on WhatsApp.</p>
        `
      });
    } catch (emailError) {
      console.log('Approval email error:', emailError.message);
    }

    res.json({
      success: true,
      message: 'Mentor application approved',
      mentor: mentor
    });
  } catch (error) {
    console.error('Mentor approval error:', error);
    res.status(500).json({ error: 'Failed to approve application', details: error.message });
  }
});

// POST /api/mentor/onboarding/:id/reject - Reject mentor application (admin only)
app.post('/api/mentor/onboarding/:id/reject', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const appResult = await pool.query(
      'SELECT email FROM mentor_applications WHERE id = $1',
      [id]
    );

    if (appResult.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const app = appResult.rows[0];

    // Update application status
    await pool.query(
      `UPDATE mentor_applications 
       SET status = $1, reviewed_at = CURRENT_TIMESTAMP, reviewed_by = $2, rejection_reason = $3
       WHERE id = $4`,
      ['rejected', req.user.email, reason || 'No reason provided', id]
    );

    // Send rejection email
    try {
      const emailService = require('./services/email');
      await emailService.send({
        to: app.email,
        subject: 'Megaverse Live Mentor Application Status',
        html: `
          <h2>Thank you for your application</h2>
          <p>We appreciate your interest in becoming a mentor with Megaverse Live.</p>
          <p>Unfortunately, we're unable to proceed with your application at this time.</p>
          <p><strong>Reason:</strong> ${reason || 'Your profile does not meet our current requirements'}</p>
          <p>Feel free to reapply in the future or contact us for more information.</p>
        `
      });
    } catch (emailError) {
      console.log('Rejection email error:', emailError.message);
    }

    res.json({
      success: true,
      message: 'Mentor application rejected'
    });
  } catch (error) {
    console.error('Mentor rejection error:', error);
    res.status(500).json({ error: 'Failed to reject application', details: error.message });
  }
});

// GET /api/mentor/applications - List pending mentor applications (admin only)
app.get('/api/mentor/applications', verifyAdminToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, full_name, email, current_role, mentor_categories, bio, status, created_at
       FROM mentor_applications
       ORDER BY created_at DESC`
    );

    res.json({
      applications: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

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
          // Check if it's a duplicate key error (email already exists)
          if (initError.code === '23505') {
            return res.status(400).json({ error: 'Email already registered' });
          }
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
      // Check if they have a pending application
      const appResult = await pool.query(
        'SELECT status FROM mentor_applications WHERE email = $1',
        [email]
      );
      
      if (appResult.rows.length > 0) {
        const status = appResult.rows[0].status;
        if (status === 'pending_review') {
          return res.status(403).json({ 
            error: 'Your profile is under review. We typically approve applications within 24 hours.',
            pending: true 
          });
        } else if (status === 'rejected') {
          return res.status(403).json({ 
            error: 'Your application was rejected. Please contact support for more information.',
            rejected: true 
          });
        }
      }
      
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
// GET /api/mentor/bookings - Get all bookings for current mentor (requires JWT)
app.get('/api/mentor/bookings', verifyMentorToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.id, b.mentor_id, b.customer_name, b.customer_email, b.session_topic,
              b.start_time, b.end_time, b.payment_status, b.booking_status, b.notes, b.created_at
       FROM bookings b
       WHERE b.mentor_id = $1
       ORDER BY b.start_time DESC`,
      [req.mentor.id]
    );
    
    const upcoming = result.rows.filter(b => new Date(b.start_time) > new Date());
    const past = result.rows.filter(b => new Date(b.start_time) <= new Date());
    
    res.json({
      bookings: result.rows,
      upcoming: upcoming.length,
      past: past.length,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching mentor bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings', details: error.message });
  }
});

// GET /api/mentor/stats - Get mentor statistics (requires JWT)
app.get('/api/mentor/stats', verifyMentorToken, async (req, res) => {
  try {
    const bookingsResult = await pool.query(
      `SELECT COUNT(*) as total, 
              SUM(CASE WHEN start_time > NOW() THEN 1 ELSE 0 END) as upcoming,
              SUM(CASE WHEN start_time <= NOW() THEN 1 ELSE 0 END) as completed
       FROM bookings
       WHERE mentor_id = $1`,
      [req.mentor.id]
    );
    
    const mentorResult = await pool.query(
      `SELECT rating, session_count FROM mentors WHERE id = $1`,
      [req.mentor.id]
    );
    
    const stats = bookingsResult.rows[0] || { total: 0, upcoming: 0, completed: 0 };
    const mentor = mentorResult.rows[0] || { rating: 0, session_count: 0 };
    
    res.json({
      total_bookings: parseInt(stats.total),
      upcoming_bookings: parseInt(stats.upcoming),
      completed_sessions: parseInt(stats.completed),
      average_rating: mentor.rating || 0,
      total_sessions: mentor.session_count || 0
    });
  } catch (error) {
    console.error('Error fetching mentor stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats', details: error.message });
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

// POST /api/bookings/:id/cancel - Cancel a booking (requires JWT)
app.post('/api/bookings/:id/cancel', verifyToken, async (req, res) => {
  try {
    const { booking_id } = req.params;
    const { reason } = req.body;
    
    // Get booking details
    const bookingRes = await pool.query(
      `SELECT b.*, pa.amount, pa.status as payment_status 
       FROM bookings b
       LEFT JOIN payment_records pa ON b.id = pa.id
       WHERE b.id = $1 AND (b.mentee_id = $2 OR b.customer_email = $3)`,
      [booking_id, req.user.id, req.user.email]
    );
    
    if (bookingRes.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found or unauthorized' });
    }
    
    const booking = bookingRes.rows[0];
    
    // Check if already cancelled
    if (booking.is_cancelled) {
      return res.status(400).json({ error: 'This booking has already been cancelled' });
    }
    
    // Check if session is within 24 hours (can't cancel)
    const hoursUntilSession = (new Date(booking.start_time) - new Date()) / (1000 * 60 * 60);
    if (hoursUntilSession < 24) {
      return res.status(400).json({ 
        error: 'Bookings can only be cancelled more than 24 hours before the session',
        hoursRemaining: hoursUntilSession.toFixed(1)
      });
    }
    
    // Mark as cancelled
    const cancelRes = await pool.query(
      `UPDATE bookings 
       SET is_cancelled = TRUE, 
           cancellation_reason = $1, 
           cancelled_at = NOW(), 
           cancelled_by = 'mentee',
           booking_status = 'cancelled'
       WHERE id = $2
       RETURNING *`,
      [reason || 'User cancelled', booking_id]
    );
    
    // TODO: Process refund via payment gateway
    // For now, mark payment as refunded
    if (booking.payment_status === 'completed') {
      await pool.query(
        `UPDATE payment_records SET status = 'refunded' WHERE id = $1`,
        [booking_id]
      );
    }
    
    res.json({
      success: true,
      message: 'Booking cancelled successfully. Refund will be processed.',
      booking: cancelRes.rows[0]
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Failed to cancel booking', details: error.message });
  }
});

// GET /api/bookings/:id/cancellation-policy - Get cancellation policy
app.get('/api/bookings/:id/cancellation-policy', async (req, res) => {
  try {
    const bookingRes = await pool.query(
      'SELECT start_time FROM bookings WHERE id = $1',
      [req.params.id]
    );
    
    if (bookingRes.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    const hoursUntilSession = (new Date(bookingRes.rows[0].start_time) - new Date()) / (1000 * 60 * 60);
    const canCancel = hoursUntilSession >= 24;
    
    res.json({
      can_cancel: canCancel,
      hours_remaining: hoursUntilSession.toFixed(1),
      refund_eligible: canCancel ? 'full' : 'none',
      cancellation_deadline: new Date(new Date(bookingRes.rows[0].start_time).getTime() - 24 * 60 * 60 * 1000).toISOString()
    });
  } catch (error) {
    console.error('Error checking cancellation policy:', error);
    res.status(500).json({ error: 'Failed to check policy', details: error.message });
  }
});


// POST /api/bookings/send-reminders - Send pending booking reminders
app.post('/api/bookings/send-reminders', async (req, res) => {
  try {
    console.log('🔔 Checking for bookings that need reminders...');
    
    // Get bookings within next 24 hours that haven't gotten a 24h reminder
    const bookings24h = await pool.query(`
      SELECT b.id, b.customer_email, b.start_time, m.name as mentor_name,
             (SELECT status FROM booking_reminders WHERE booking_id = b.id AND reminder_type = '24h') as reminder_24h_sent
      FROM bookings b
      JOIN mentors m ON b.mentor_id = m.id
      WHERE b.is_cancelled = FALSE
        AND b.payment_status = 'completed'
        AND b.start_time > CURRENT_TIMESTAMP
        AND b.start_time <= CURRENT_TIMESTAMP + INTERVAL '25 hours'
        AND (SELECT status FROM booking_reminders WHERE booking_id = b.id AND reminder_type = '24h') IS NULL
    `);
    
    // Get bookings within next 1 hour that haven't gotten a 1h reminder
    const bookings1h = await pool.query(`
      SELECT b.id, b.customer_email, b.start_time, m.name as mentor_name,
             (SELECT status FROM booking_reminders WHERE booking_id = b.id AND reminder_type = '1h') as reminder_1h_sent
      FROM bookings b
      JOIN mentors m ON b.mentor_id = m.id
      WHERE b.is_cancelled = FALSE
        AND b.payment_status = 'completed'
        AND b.start_time > CURRENT_TIMESTAMP
        AND b.start_time <= CURRENT_TIMESTAMP + INTERVAL '1 hour 5 minutes'
        AND (SELECT status FROM booking_reminders WHERE booking_id = b.id AND reminder_type = '1h') IS NULL
    `);

    let sent24h = 0, sent1h = 0;

    // Send 24-hour reminders
    for (const booking of bookings24h.rows) {
      try {
        const mentorInfo = { name: booking.mentor_name };
        await emailService.sendReminder(booking, mentorInfo);
        
        // Log reminder as sent
        await pool.query(
          `INSERT INTO booking_reminders (booking_id, reminder_type, status, sent_at)
           VALUES ($1, '24h', 'sent', CURRENT_TIMESTAMP)
           ON CONFLICT (booking_id, reminder_type) DO UPDATE SET status = 'sent', sent_at = CURRENT_TIMESTAMP`,
          [booking.id]
        );
        sent24h++;
        console.log(`✅ 24h reminder sent for booking ${booking.id}`);
      } catch (err) {
        console.error(`Failed to send 24h reminder for booking ${booking.id}:`, err.message);
      }
    }

    // Send 1-hour reminders
    for (const booking of bookings1h.rows) {
      try {
        const mentorInfo = { name: booking.mentor_name };
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f59e0b;">🚀 Your Session Starts in 1 Hour!</h2>
            <p>Hi ${booking.customer_email.split('@')[0]},</p>
            <p>Your session with <strong>${booking.mentor_name}</strong> starts in <strong>1 hour</strong>!</p>
            <p style="color: #ef4444; font-weight: bold;">
              ⏰ Join link will be sent 5 minutes before the session.
            </p>
            <p>Get ready and we'll see you soon!</p>
          </div>
        `;
        
        await emailService.transporter.sendMail({
          from: process.env.EMAIL_FROM || 'hello@megaverselive.com',
          to: booking.customer_email,
          subject: '⏰ Your session starts in 1 hour!',
          html
        });
        
        // Log reminder as sent
        await pool.query(
          `INSERT INTO booking_reminders (booking_id, reminder_type, status, sent_at)
           VALUES ($1, '1h', 'sent', CURRENT_TIMESTAMP)
           ON CONFLICT (booking_id, reminder_type) DO UPDATE SET status = 'sent', sent_at = CURRENT_TIMESTAMP`,
          [booking.id]
        );
        sent1h++;
        console.log(`✅ 1h reminder sent for booking ${booking.id}`);
      } catch (err) {
        console.error(`Failed to send 1h reminder for booking ${booking.id}:`, err.message);
      }
    }

    res.json({
      success: true,
      reminders_sent_24h: sent24h,
      reminders_sent_1h: sent1h,
      total_bookings_checked: bookings24h.rows.length + bookings1h.rows.length
    });
    
    console.log(`✅ Reminder check complete: ${sent24h} 24h reminders, ${sent1h} 1h reminders sent`);
  } catch (error) {
    console.error('Error sending reminders:', error);
    res.status(500).json({ error: 'Failed to send reminders', details: error.message });
  }
});

// POST /api/ratings - Submit a rating for a booking (requires JWT)
app.post('/api/ratings', verifyToken, async (req, res) => {
  try {
    const { booking_id, rating, review } = req.body;
    
    if (!booking_id || !rating) {
      return res.status(400).json({ error: 'booking_id and rating are required' });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    // Get booking details
    const bookingRes = await pool.query(
      'SELECT * FROM bookings WHERE id = $1 AND mentee_id = $2',
      [booking_id, req.user.id]
    );
    
    if (bookingRes.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found or unauthorized' });
    }
    
    const booking = bookingRes.rows[0];
    
    // Check if rating already exists
    const existingRes = await pool.query('SELECT id FROM ratings WHERE booking_id = $1', [booking_id]);
    if (existingRes.rows.length > 0) {
      return res.status(400).json({ error: 'You have already rated this session' });
    }
    
    // Insert rating
    const insertRes = await pool.query(
      `INSERT INTO ratings (booking_id, mentor_id, mentee_id, rating, review)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, booking_id, rating, review, created_at`,
      [booking_id, booking.mentor_id, req.user.id, rating, review || null]
    );
    
    // Update mentor's average rating
    const mentorStatsRes = await pool.query(
      `SELECT AVG(rating) as avg_rating, COUNT(*) as total_ratings FROM ratings WHERE mentor_id = $1`,
      [booking.mentor_id]
    );
    
    const avgRating = parseFloat(mentorStatsRes.rows[0].avg_rating) || 0;
    await pool.query(
      'UPDATE mentors SET rating = $1 WHERE id = $2',
      [avgRating.toFixed(2), booking.mentor_id]
    );
    
    res.json({
      success: true,
      rating: insertRes.rows[0]
    });
  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({ error: 'Failed to submit rating', details: error.message });
  }
});

// GET /api/ratings/mentor/:mentorId - Get all ratings for a mentor
app.get('/api/ratings/mentor/:mentorId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.id, r.rating, r.review, r.created_at, 
              ma.name as mentee_name
       FROM ratings r
       LEFT JOIN mentee_accounts ma ON r.mentee_id = ma.id
       WHERE r.mentor_id = $1
       ORDER BY r.created_at DESC`,
      [req.params.mentorId]
    );
    
    res.json({
      ratings: result.rows,
      average: result.rows.length > 0 
        ? (result.rows.reduce((sum, r) => sum + r.rating, 0) / result.rows.length).toFixed(1)
        : 0,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ error: 'Failed to fetch ratings', details: error.message });
  }
});

// GET /api/ratings/booking/:bookingId - Get rating for a booking (requires JWT)
app.get('/api/ratings/booking/:bookingId', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.id, r.rating, r.review, r.created_at FROM ratings 
       WHERE booking_id = $1 AND mentee_id = $2`,
      [req.params.bookingId, req.user.id]
    );
    
    res.json({
      rating: result.rows[0] || null
    });
  } catch (error) {
    console.error('Error fetching rating:', error);
    res.status(500).json({ error: 'Failed to fetch rating', details: error.message });
  }
});

// ============= ADMIN ROUTES =============

const ADMIN_EMAIL = 'admin@megaverselive.com';
const ADMIN_PASSWORD = 'Admin@123456';
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'admin-secret-key-change-in-production';

// Admin login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ role: 'admin', email }, ADMIN_JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, admin: { email } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

// GET /api/admin/analytics - Get analytics data (admin)
app.get('/api/admin/analytics', verifyAdminToken, async (req, res) => {
  try {
    // Total bookings
    const bookingsRes = await pool.query(`SELECT COUNT(*) as total FROM bookings`);
    const totalBookings = parseInt(bookingsRes.rows[0].total);

    // Bookings by status
    const statusRes = await pool.query(`
      SELECT booking_status, COUNT(*) as count 
      FROM bookings 
      GROUP BY booking_status
    `);
    const bookingsByStatus = {};
    statusRes.rows.forEach(row => {
      bookingsByStatus[row.booking_status || 'unknown'] = parseInt(row.count);
    });

    // Revenue calculation
    const revenueRes = await pool.query(`
      SELECT COALESCE(SUM(CAST(amount AS DECIMAL)), 0) as total 
      FROM payment_records 
      WHERE status = 'completed'
    `);
    const revenue = parseFloat(revenueRes.rows[0].total);

    // Active mentees and mentors
    const menteesRes = await pool.query(`SELECT COUNT(*) as total FROM mentee_accounts WHERE is_active = true`);
    const mentorsRes = await pool.query(`SELECT COUNT(*) as total FROM mentors WHERE is_active = true`);
    const activeMentees = parseInt(menteesRes.rows[0].total);
    const activeMentors = parseInt(mentorsRes.rows[0].total);

    // Upcoming sessions
    const upcomingRes = await pool.query(`
      SELECT COUNT(*) as total FROM bookings WHERE start_time > NOW()
    `);
    const upcomingSessions = parseInt(upcomingRes.rows[0].total);

    // Completed sessions
    const completedRes = await pool.query(`
      SELECT COUNT(*) as total FROM bookings WHERE start_time <= NOW()
    `);
    const completedSessions = parseInt(completedRes.rows[0].total);

    // Average rating
    const ratingRes = await pool.query(`
      SELECT AVG(rating) as avg_rating FROM ratings
    `);
    const averageRating = parseFloat(ratingRes.rows[0].avg_rating) || 0;

    // Total ratings
    const totalRatingsRes = await pool.query(`SELECT COUNT(*) as total FROM ratings`);
    const totalRatings = parseInt(totalRatingsRes.rows[0].total);

    res.json({
      totalBookings,
      bookingsByStatus,
      revenue: revenue.toFixed(2),
      activeMentees,
      activeMentors,
      upcomingSessions,
      completedSessions,
      averageRating: averageRating.toFixed(1),
      totalRatings
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics', details: error.message });
  }
});

// Get all mentors (admin)
app.get('/api/admin/mentors', verifyAdminToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM mentors ORDER BY name');
    res.json({ mentors: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mentors', details: error.message });
  }
});

// Get all mentees (admin)
app.get('/api/admin/mentees', verifyAdminToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM mentee_accounts ORDER BY name');
    res.json({ mentees: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch mentees', details: error.message });
  }
});

// Create mentor (admin)
app.post('/api/admin/mentor', verifyAdminToken, async (req, res) => {
  try {
    const { email, name, password, bio, tracks } = req.body;
    
    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Email, name, and password required' });
    }
    
    const passwordHash = await bcrypt.hash(password, 10);
    const tracksArray = Array.isArray(tracks) ? tracks : [];
    
    const result = await pool.query(
      'INSERT INTO mentors (email, name, password_hash, bio, tracks) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [email, name, passwordHash, bio || '', tracksArray]
    );
    
    res.status(201).json({ mentor: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create mentor', details: error.message });
  }
});

// Edit mentor (admin)
app.put('/api/admin/mentor/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, bio, tracks, rating } = req.body;
    
    const result = await pool.query(
      'UPDATE mentors SET name=$1, email=$2, bio=$3, tracks=$4, rating=$5 WHERE id=$6 RETURNING *',
      [name, email, bio, Array.isArray(tracks) ? tracks : [], rating, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mentor not found' });
    }
    
    res.json({ mentor: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update mentor', details: error.message });
  }
});

// Delete mentor (admin)
app.delete('/api/admin/mentor/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM mentors WHERE id=$1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mentor not found' });
    }
    
    res.json({ message: 'Mentor deleted', id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete mentor', details: error.message });
  }
});

// Create mentee (admin)
app.post('/api/admin/mentee', verifyAdminToken, async (req, res) => {
  try {
    const { email, name, password, phone } = req.body;
    
    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Email, name, and password required' });
    }
    
    const passwordHash = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      'INSERT INTO mentee_accounts (email, name, password_hash, phone) VALUES ($1, $2, $3, $4) RETURNING *',
      [email, name, passwordHash, phone || '']
    );
    
    res.status(201).json({ mentee: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create mentee', details: error.message });
  }
});

// Edit mentee (admin)
app.put('/api/admin/mentee/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, bio } = req.body;
    
    const result = await pool.query(
      'UPDATE mentee_accounts SET name=$1, email=$2, phone=$3, bio=$4 WHERE id=$5 RETURNING *',
      [name, email, phone, bio, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mentee not found' });
    }
    
    res.json({ mentee: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update mentee', details: error.message });
  }
});

// Delete mentee (admin)
app.delete('/api/admin/mentee/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM mentee_accounts WHERE id=$1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mentee not found' });
    }
    
    res.json({ message: 'Mentee deleted', id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete mentee', details: error.message });
  }
});

// ============= START SERVER =============

// Schedule reminder check every 15 minutes (defer until after server starts)
let reminderScheduleInterval = null;
function startReminderScheduler() {
  reminderScheduleInterval = setInterval(async () => {
    try {
      const response = await fetch(`http://localhost:${PORT}/api/bookings/send-reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.reminders_sent_24h > 0 || data.reminders_sent_1h > 0) {
        console.log(`✅ Reminders sent: 24h=${data.reminders_sent_24h}, 1h=${data.reminders_sent_1h}`);
      }
    } catch (error) {
      console.error('Error in reminder scheduler:', error.message);
    }
  }, 15 * 60 * 1000); // Run every 15 minutes
}

app.listen(PORT, () => {
  console.log(`Megaverse Live API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`✅ Server started and ready to accept requests`);
  
  // Start scheduler AFTER server is listening
  setImmediate(() => {
    startReminderScheduler();
    console.log(`✅ Booking reminder scheduler started (checks every 15 minutes)`);
  });
});

module.exports = app;
