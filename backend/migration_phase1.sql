-- Phase 1: Mentor Dashboard Enhancements
-- Adds columns and tables for schedule, earnings, and session history

-- 1. Add session_status to bookings table (track: scheduled, completed, no_show, cancelled)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS session_status VARCHAR(50) DEFAULT 'scheduled';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS follow_up_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS mentor_notes TEXT;

-- 2. Add columns to mentors table for availability management
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS availability_status VARCHAR(50) DEFAULT 'available';
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS session_count INT DEFAULT 0;
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS no_show_count INT DEFAULT 0;

-- 3. Create blocked_slots table for mentor availability management
CREATE TABLE IF NOT EXISTS blocked_slots (
  id SERIAL PRIMARY KEY,
  mentor_id INT NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mentor_id) REFERENCES mentors(id) ON DELETE CASCADE,
  UNIQUE(mentor_id, start_time, end_time)
);

-- 4. Create index for performance
CREATE INDEX IF NOT EXISTS idx_blocked_slots_mentor_time ON blocked_slots(mentor_id, start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_session_status ON bookings(session_status);
CREATE INDEX IF NOT EXISTS idx_bookings_mentor_payment ON bookings(mentor_id, payment_status);

-- 5. Update time_slots table to track session status
ALTER TABLE time_slots ADD COLUMN IF NOT EXISTS session_status VARCHAR(50) DEFAULT 'available';

-- 6. Add reminder tracking to bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reminder_24h_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reminder_1h_sent BOOLEAN DEFAULT FALSE;

-- 7. Create notifications table for in-app notifications
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('mentor', 'mentee')),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  related_booking_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (related_booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  INDEX idx_notifications_user (user_id, user_type)
);

-- 8. Add rating fields to bookings for mentor ratings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS mentor_rating INT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS mentor_feedback TEXT;

COMMIT;
