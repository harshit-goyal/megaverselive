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

-- Indexes for performance
CREATE INDEX idx_time_slots_mentor_start ON time_slots(mentor_id, start_time);
CREATE INDEX idx_bookings_mentor_start ON bookings(mentor_id, start_time);
CREATE INDEX idx_bookings_email ON bookings(customer_email);
CREATE INDEX idx_bookings_payment_id ON bookings(stripe_payment_id);

-- Insert Harshit as the initial mentor
INSERT INTO mentors (name, email, bio, specialties, hourly_rate)
VALUES (
  'Harshit Goyal',
  'harshit@megaverselive.com',
  'Founder of Megaverse Live. 1:1 coaching for Backend Interviews & English Proficiency.',
  'Backend Interview Prep, System Design, English Coaching, IELTS',
  5000
) ON CONFLICT (email) DO NOTHING;
