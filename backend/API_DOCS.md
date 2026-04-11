# API Documentation

## Endpoints

### GET /api/health
Check if the API is running.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-04-11T12:00:00.000Z",
  "message": "Megaverse Live API is running"
}
```

---

### GET /api/slots
Get available time slots for booking.

**Query Parameters:**
- `mentor_id` (optional, default: 1)
- `limit` (optional, default: 20)

**Response:**
```json
{
  "slots": [
    {
      "id": 1,
      "start_time": "2024-04-15T09:00:00Z",
      "end_time": "2024-04-15T09:45:00Z",
      "display": "Mon, Apr 15, 09:00 IST"
    }
  ],
  "count": 1
}
```

---

### POST /api/book
Create a new booking and initiate Stripe payment.

**Request Body:**
```json
{
  "mentor_id": 1,
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "+91-9876543210",
  "session_topic": "Backend Interview Prep",
  "start_time": "2024-04-15T09:00:00Z"
}
```

**Response:**
```json
{
  "booking_id": 5,
  "client_secret": "pi_1234_secret_5678",
  "amount": 5000,
  "currency": "usd"
}
```

**Error Response:**
```json
{
  "error": "Slot not available"
}
```

---

### POST /api/webhook/stripe
Stripe webhook handler for payment confirmations. Automatically called by Stripe.

---

### GET /api/booking/:id
Get details of a specific booking.

**Response:**
```json
{
  "id": 5,
  "mentor_id": 1,
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "+91-9876543210",
  "session_topic": "Backend Interview Prep",
  "start_time": "2024-04-15T09:00:00Z",
  "end_time": "2024-04-15T09:45:00Z",
  "stripe_payment_id": "pi_1234567890",
  "payment_status": "completed",
  "booking_status": "confirmed",
  "created_at": "2024-04-11T12:00:00Z"
}
```

---

### POST /api/booking/:id/cancel
Cancel a booking and free up the time slot.

**Response:**
```json
{
  "success": true,
  "message": "Booking cancelled"
}
```

---

### POST /api/admin/init-slots
Generate available time slots for the next N days.

**Response:**
```json
{
  "success": true,
  "message": "Generated 120 available slots"
}
```

---

## Error Handling

All errors follow this format:
```json
{
  "error": "Error description"
}
```

Common errors:
- `"Slot not available"` - The selected time slot is already booked
- `"Missing required fields"` - Required fields in request are missing
- `"Booking not found"` - Booking ID doesn't exist

---

## Authentication

Currently, the API is open. For production, add authentication:
- Add API key header validation
- Implement JWT tokens for admin endpoints
- Use Azure AD or Stripe API keys

---

## Payment Flow

1. User selects a time slot
2. Frontend calls `POST /api/book` with booking details
3. Backend creates a Stripe `PaymentIntent` and returns `client_secret`
4. Frontend uses Stripe.js to handle card payment with `client_secret`
5. After payment succeeds, Stripe sends a webhook to `POST /api/webhook/stripe`
6. Webhook handler confirms booking, marks slot as booked, sends confirmation email
7. User receives confirmation email with session details

---

## Database Schema

### mentors
- `id` (PK)
- `name`
- `email`
- `bio`
- `specialties`
- `hourly_rate` (in cents, e.g., 5000 = $50)

### time_slots
- `id` (PK)
- `mentor_id` (FK)
- `start_time`
- `end_time`
- `is_booked` (boolean)

### bookings
- `id` (PK)
- `mentor_id` (FK)
- `customer_name`
- `customer_email`
- `customer_phone`
- `session_topic`
- `start_time`
- `end_time`
- `stripe_payment_id`
- `payment_status` (pending, completed, failed)
- `booking_status` (confirmed, completed, cancelled)

### payments
- `id` (PK)
- `booking_id` (FK)
- `stripe_payment_id`
- `amount_cents`
- `currency`
- `status`

---

## Local Testing

### 1. Start server
```bash
npm run dev
```

### 2. Check health
```bash
curl http://localhost:8080/api/health
```

### 3. Initialize slots
```bash
curl -X POST http://localhost:8080/api/admin/init-slots
```

### 4. Get available slots
```bash
curl http://localhost:8080/api/slots
```

### 5. Create test booking
```bash
curl -X POST http://localhost:8080/api/book \
  -H "Content-Type: application/json" \
  -d '{
    "mentor_id": 1,
    "customer_name": "Test User",
    "customer_email": "test@example.com",
    "customer_phone": "+91-9876543210",
    "session_topic": "Testing",
    "start_time": "2024-04-15T09:00:00Z"
  }'
```
