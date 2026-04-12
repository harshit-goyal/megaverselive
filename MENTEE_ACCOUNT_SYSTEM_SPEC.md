# Mentee Account System - Detailed Specification

**Status:** Planned (Ready to implement)
**Effort:** 8-10 hours
**Priority:** High (foundation for user retention)

---

## Executive Summary

Add user authentication to Megaverse Live so mentees can:
- Create accounts with email/password
- Maintain profile data (name, bio, timezone, etc)
- See all their past sessions and upcoming bookings
- Track their payments and session history
- View session details and links

**Benefits:**
- Users see their booking history (better UX)
- Recurring users easier to identify
- Foundation for future features (email reminders, multi-mentor support)
- Better metrics on user engagement

---

## Feature List

### 1. Authentication (MVP)
- **Signup** - Create account with email, password, name
- **Login** - Email + password login, JWT token generation
- **Logout** - Clear session
- **Session Persistence** - Auto-login on page reload
- **Password Security** - bcrypt hashing (12 rounds), no plaintext

### 2. User Profile
- **Profile Fields:**
  - Full name
  - Email (unique)
  - Phone number (optional)
  - Bio (optional, max 500 chars)
  - Avatar/profile picture (optional)
  - Timezone (for session scheduling)
  
- **Profile Actions:**
  - View own profile
  - Edit profile details
  - Upload avatar image
  - Update timezone

### 3. Booking History & Dashboard
- **View Bookings:**
  - All upcoming sessions (sorted by date)
  - All past sessions (archived)
  - Count of bookings per month
  
- **Booking Details:**
  - Date and time of session
  - Session topic/notes
  - Payment status and amount paid
  - Link to reschedule (cal.com)
  - Session recording/notes (if applicable)

### 4. Account Management
- **Settings:**
  - Change password
  - Update email (with verification)
  - Delete account (optional)
  - Download booking history (optional)

---

## Database Schema

### Table: mentee_accounts
```sql
CREATE TABLE mentee_accounts (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  bio TEXT,
  avatar_url VARCHAR(512),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_mentee_email ON mentee_accounts(email);
```

### Table: mentee_profiles (extensible)
```sql
CREATE TABLE mentee_profiles (
  id SERIAL PRIMARY KEY,
  mentee_id INT UNIQUE NOT NULL,
  timezone VARCHAR(50) DEFAULT 'America/New_York',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mentee_id) REFERENCES mentee_accounts(id)
);
```

### Update: bookings table
```sql
ALTER TABLE bookings ADD COLUMN mentee_id INT DEFAULT NULL;
ALTER TABLE bookings ADD FOREIGN KEY (mentee_id) REFERENCES mentee_accounts(id);
CREATE INDEX idx_bookings_mentee ON bookings(mentee_id);
```

### Update: payment_records table
```sql
ALTER TABLE payment_records ADD COLUMN mentee_id INT DEFAULT NULL;
ALTER TABLE payment_records ADD FOREIGN KEY (mentee_id) REFERENCES mentee_accounts(id);
CREATE INDEX idx_payment_records_mentee ON payment_records(mentee_id);
```

---

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/signup
**Create new account**
```json
Request:
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe",
  "phone": "+1234567890"
}

Response (201):
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGci..."
}

Response (400):
{
  "error": "Email already registered"
}
```

#### POST /api/auth/login
**Login with email/password**
```json
Request:
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

Response (200):
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGci...",
  "expiresIn": 86400
}

Response (401):
{
  "error": "Invalid email or password"
}
```

#### POST /api/auth/logout
**Invalidate session**
```json
Response (200):
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Mentee Profile Endpoints

#### GET /api/mentee/profile
**Get current user profile (requires JWT)**
```json
Response (200):
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+1234567890",
    "bio": "Software engineer",
    "timezone": "America/New_York",
    "created_at": "2026-04-12T05:00:00Z"
  }
}
```

#### PUT /api/mentee/profile
**Update profile (requires JWT)**
```json
Request:
{
  "name": "Jane Doe",
  "phone": "+9876543210",
  "bio": "Updated bio",
  "timezone": "Asia/Kolkata"
}

Response (200):
{
  "success": true,
  "user": { ...updated user object... }
}
```

### Booking Endpoints

#### GET /api/mentee/bookings
**List all user's bookings (requires JWT)**
```json
Response (200):
{
  "bookings": [
    {
      "id": 1,
      "start_time": "2026-04-15T10:00:00Z",
      "end_time": "2026-04-15T10:45:00Z",
      "session_topic": "System Design",
      "payment_amount": 1200,
      "payment_currency": "INR",
      "booking_status": "confirmed"
    }
  ],
  "upcoming": 2,
  "past": 5
}
```

#### GET /api/mentee/bookings/:id
**Get booking details (requires JWT)**
```json
Response (200):
{
  "booking": {
    "id": 1,
    "mentor": {
      "name": "Harshit Goyal",
      "bio": "Backend engineer"
    },
    "start_time": "2026-04-15T10:00:00Z",
    "end_time": "2026-04-15T10:45:00Z",
    "session_topic": "System Design Interview",
    "payment": {
      "amount": 1200,
      "currency": "INR",
      "status": "completed"
    },
    "reschedule_link": "https://cal.com/harshit/..."
  }
}
```

---

## Frontend Pages

### 1. Login Page (/login)
- Email input field
- Password input field
- Login button
- "Don't have account? Sign up" link
- Error message display
- Redirect to dashboard on success

### 2. Signup Page (/signup)
- Name input field
- Email input field
- Password input field (with strength indicator)
- Confirm password field
- Phone input (optional)
- Terms & conditions checkbox
- Sign Up button
- "Already have account? Login" link

### 3. Dashboard (/dashboard)
- Welcome message: "Hi, [Name]!"
- Quick stats: Upcoming sessions, total bookings
- Upcoming bookings list
- Quick links: View all bookings, Edit profile, Book a session
- Logout button

### 4. Bookings Page (/bookings)
- Tabs: Upcoming | Past
- List of sessions with date, time, topic, status
- View details and reschedule options
- Empty state if no bookings

### 5. Profile Page (/profile)
- Avatar display and upload
- Editable profile fields: name, phone, bio, timezone
- Change password option
- Save changes button

---

## Security Implementation

1. **Password Hashing**
   - Use bcrypt with 12 salt rounds
   - Never store plaintext passwords
   - Validate password strength

2. **JWT Tokens**
   - Secret key in environment variable (MENTEE_JWT_SECRET)
   - 24-hour expiry
   - Include user ID in payload
   - Verify on every protected request

3. **Authorization**
   - Users access only their own data
   - Verify mentee_id matches authenticated user

4. **HTTPS**
   - All requests over HTTPS
   - megaverselive.com uses SSL

5. **Input Validation**
   - Email format validation
   - Password strength requirements
   - Sanitize user input
   - Use parameterized queries

---

## Implementation Steps

### Step 1: Database (1 hour)
- Add mentee_accounts table
- Add mentee_profiles table
- Update bookings with mentee_id
- Update payment_records with mentee_id

### Step 2: Backend Auth (2 hours)
- POST /api/auth/signup (with bcrypt)
- POST /api/auth/login (JWT token generation)
- JWT verification middleware
- GET /api/mentee/profile
- PUT /api/mentee/profile

### Step 3: Frontend Auth (2 hours)
- Create login page (/login)
- Create signup page (/signup)
- localStorage for JWT storage
- Auto-login on page load
- Navigation based on auth state

### Step 4: Dashboard & Bookings (2 hours)
- Create dashboard page (/dashboard)
- Create bookings page (/bookings)
- GET /api/mentee/bookings endpoint
- Display upcoming/past sessions

### Step 5: Testing (1 hour)
- Test signup/login flows
- Test booking history
- Test profile management
- Verify authorization (can't access other users' data)

**Total: 8-10 hours**

---

## Success Criteria

✓ User can signup with email/password
✓ User can login and see JWT token in localStorage
✓ User stays logged in after page reload
✓ User cannot access other users' bookings
✓ Passwords are bcrypt hashed (not plaintext)
✓ JWT tokens expire after 24 hours
✓ User profile is editable and persists
✓ Booking list shows correct data per user
✓ All error messages display properly
✓ Logout clears authentication

---

## Future Enhancements (v2)

1. Email verification on signup
2. Password reset via email
3. Social login (Google)
4. Two-factor authentication
5. Mentee reviews of mentors
6. Session recordings and notes
7. Payment invoices and receipts
8. Session cancellation and refunds

---

## Files to Update

- `backend/schema.sql` - Add mentee tables
- `backend/index.js` - Add auth and profile endpoints
- `index.html` - Add login/signup/dashboard pages
- `public/index.html` - Sync with main index.html
- `.env.example` - Add MENTEE_JWT_SECRET

---

## Environment Variables

Add to Render `.env`:
```
MENTEE_JWT_SECRET=your_jwt_secret_key_here_min_32_chars
BCRYPT_ROUNDS=12
JWT_EXPIRY=86400
```

---

## Testing Commands

```bash
# Test signup
curl -X POST https://megaverselive.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123","name":"Test User"}'

# Test login
curl -X POST https://megaverselive.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123"}'

# Test get profile (requires token)
curl https://megaverselive.com/api/mentee/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Test get bookings
curl https://megaverselive.com/api/mentee/bookings \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

Ready to implement? Let me know and we'll start building!
