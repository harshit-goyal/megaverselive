-- Megaverse Live Database Schema

-- Mentors table
CREATE TABLE IF NOT EXISTS mentors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  bio TEXT,
  email VARCHAR(255) NOT NULL UNIQUE,
  specialties VARCHAR(255), -- e.g., "Backend Interview Prep, System Design"
  hourly_rate INT, -- in cents (e.g., 5000 = $50)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Available time slots (45-min sessions)
CREATE TABLE IF NOT EXISTS time_slots (
  id SERIAL PRIMARY KEY,
  mentor_id INT NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  is_booked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mentor_id) REFERENCES mentors(id),
  UNIQUE(mentor_id, start_time)
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  mentor_id INT NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  session_topic TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  stripe_payment_id VARCHAR(255) UNIQUE,
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed
  booking_status VARCHAR(50) DEFAULT 'confirmed', -- confirmed, completed, cancelled
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mentor_id) REFERENCES mentors(id),
  FOREIGN KEY (start_time, mentor_id) REFERENCES time_slots(start_time, mentor_id)
);

-- Payment history
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  booking_id INT NOT NULL,
  stripe_payment_id VARCHAR(255) UNIQUE,
  amount_cents INT NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) DEFAULT 'pending', -- pending, succeeded, failed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- Payment records from webhooks (for Razorpay and PayPal verification)
CREATE TABLE IF NOT EXISTS payment_records (
  id SERIAL PRIMARY KEY,
  payment_id VARCHAR(255) UNIQUE NOT NULL,
  provider VARCHAR(50) NOT NULL, -- razorpay, paypal
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  status VARCHAR(50) NOT NULL, -- completed, failed, pending
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Emails sent (for tracking confirmations, reminders)
CREATE TABLE IF NOT EXISTS emails_sent (
  id SERIAL PRIMARY KEY,
  booking_id INT NOT NULL,
  email_type VARCHAR(50), -- confirmation, reminder, cancellation
  recipient_email VARCHAR(255) NOT NULL,
  subject TEXT,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- Mentee accounts (user authentication)
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
);

-- Mentee profiles (extensible preferences)
CREATE TABLE IF NOT EXISTS mentee_profiles (
  id SERIAL PRIMARY KEY,
  mentee_id INT UNIQUE NOT NULL,
  timezone VARCHAR(50) DEFAULT 'America/New_York',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mentee_id) REFERENCES mentee_accounts(id) ON DELETE CASCADE
);

-- Update bookings to link to mentee accounts (optional, for backward compatibility)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS mentee_id INT DEFAULT NULL;
ALTER TABLE bookings ADD CONSTRAINT fk_bookings_mentee FOREIGN KEY (mentee_id) REFERENCES mentee_accounts(id) ON DELETE SET NULL;

-- Update payment_records to link to mentee accounts
ALTER TABLE payment_records ADD COLUMN IF NOT EXISTS mentee_id INT DEFAULT NULL;
ALTER TABLE payment_records ADD CONSTRAINT fk_payment_records_mentee FOREIGN KEY (mentee_id) REFERENCES mentee_accounts(id) ON DELETE SET NULL;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_time_slots_mentor_start ON time_slots(mentor_id, start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_mentor_start ON bookings(mentor_id, start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_id ON bookings(stripe_payment_id);
CREATE INDEX IF NOT EXISTS idx_bookings_mentee ON bookings(mentee_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_payment_id ON payment_records(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_provider ON payment_records(provider);
CREATE INDEX IF NOT EXISTS idx_payment_records_status ON payment_records(status);
CREATE INDEX IF NOT EXISTS idx_payment_records_mentee ON payment_records(mentee_id);
CREATE INDEX IF NOT EXISTS idx_mentee_email ON mentee_accounts(email);
CREATE INDEX IF NOT EXISTS idx_mentee_profiles_mentee ON mentee_profiles(mentee_id);

-- Insert Harshit as the initial mentor
INSERT INTO mentors (name, email, bio, specialties, hourly_rate)
VALUES (
  'Harshit Goyal',
  'harshit@megaverselive.com',
  'Founder of Megaverse Live. 1:1 coaching for Backend Interviews & English Proficiency.',
  'Backend Interview Prep, System Design, English Coaching, IELTS',
  5000
) ON CONFLICT (email) DO NOTHING;
