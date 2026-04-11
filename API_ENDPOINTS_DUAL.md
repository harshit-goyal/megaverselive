# API Endpoints Reference - UPI + PayPal

## Quick API Overview

Your backend now exposes endpoints for **both payment systems**:

```
POST /api/book                    → Create booking (returns both payment options)
POST /api/razorpay/create-order   → Create Razorpay order (UPI)
POST /api/webhook/razorpay        → Razorpay webhook handler (payment confirmation)
POST /api/paypal/create-order     → Create PayPal order
POST /api/webhook/paypal          → PayPal webhook handler (payment confirmation)
GET  /health                       → Health check
```

---

## 1. Create Booking

**Endpoint:** `POST /api/book`

**Request:**
```bash
curl -X POST https://api.megaverselive.com/api/book \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Rajesh Kumar",
    "customer_email": "rajesh@example.com",
    "customer_phone": "+91 9876543210",
    "session_topic": "Career Guidance",
    "start_time": "2024-02-15T14:00:00Z",
    "mentor_id": 1
  }'
```

**Response (200 OK):**
```json
{
  "booking_id": 42,
  "amount": 5000,
  "currency": "INR",
  "payment_methods": {
    "upi": {
      "available": true,
      "provider": "razorpay"
    },
    "international": {
      "available": true,
      "provider": "paypal",
      "client_id": "ARxxx..."
    }
  },
  "booking_details": {
    "mentor_id": 1,
    "customer_email": "rajesh@example.com",
    "customer_name": "Rajesh Kumar",
    "session_topic": "Career Guidance",
    "start_time": "2024-02-15T14:00:00Z",
    "end_time": "2024-02-15T14:45:00Z"
  }
}
```

**Errors:**
- 400: Missing required fields
- 400: Slot not available
- 500: Server error

---

## 2. Create Razorpay Order (UPI Payment)

**Endpoint:** `POST /api/razorpay/create-order`

**When to Use:** When customer chooses **UPI payment** (India)

**Request:**
```bash
curl -X POST https://api.megaverselive.com/api/razorpay/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": 42,
    "amount": 5000
  }'
```

**Response (200 OK):**
```json
{
  "order_id": "order_JWuSrEjS2HJLHZ",
  "razorpay_key": "rzp_live_XXXXXXXXXXXX",
  "amount": 5000,
  "booking_id": 42
}
```

**Frontend Usage:**
```javascript
fetch('https://api.megaverselive.com/api/razorpay/create-order', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ booking_id: 42, amount: 5000 })
})
.then(res => res.json())
.then(data => {
  new Razorpay({
    key: data.razorpay_key,
    order_id: data.order_id,
    handler: function(response) {
      console.log('Payment successful', response.razorpay_payment_id);
      // Webhook will handle confirmation
    },
    prefill: {
      email: 'customer@example.com',
      contact: '9876543210'
    }
  }).open();
});
```

**Errors:**
- 404: Booking not found
- 400: Invalid credentials
- 500: Razorpay service error

---

## 3. Razorpay Webhook Handler

**Endpoint:** `POST /api/webhook/razorpay`

**Triggered By:** Razorpay when payment is completed

**Webhook Payload:**
```json
{
  "razorpay_payment_id": "pay_JWuSrEjS2HJLHZ",
  "razorpay_order_id": "order_JWuSrEjS2HJLHZ",
  "razorpay_signature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d"
}
```

**What Happens:**
1. Validates signature (security)
2. Updates booking: `payment_status = 'completed'`
3. Marks time slot: `is_booked = TRUE`
4. Sends confirmation email
5. Stores payment record

**Response (200 OK):**
```json
{
  "success": true
}
```

**Signature Verification:**
```
HMAC-SHA256(razorpay_order_id | razorpay_payment_id, RAZORPAY_KEY_SECRET)
= razorpay_signature
```

---

## 4. Create PayPal Order

**Endpoint:** `POST /api/paypal/create-order`

**When to Use:** When customer chooses **PayPal** (International)

**Request:**
```bash
curl -X POST https://api.megaverselive.com/api/paypal/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": 42,
    "amount": 5000
  }'
```

**Response (200 OK):**
```json
{
  "id": "7JH18949KS298384K",
  "status": "CREATED",
  "links": [...]
}
```

**Frontend Usage:**
```javascript
fetch('https://api.megaverselive.com/api/paypal/create-order', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ booking_id: 42, amount: 5000 })
})
.then(res => res.json())
.then(data => {
  paypal.Buttons({
    createOrder: () => data.id,
    onApprove: function(data, actions) {
      console.log('Payment captured:', data.orderID);
      // Webhook will handle confirmation
    },
    onError: function(err) {
      console.error('Payment failed:', err);
    }
  }).render('#paypal-button-container');
});
```

**Errors:**
- 404: Booking not found
- 400: Invalid credentials
- 500: PayPal service error

---

## 5. PayPal Webhook Handler

**Endpoint:** `POST /api/webhook/paypal`

**Triggered By:** PayPal when order is completed

**Webhook Payload:**
```json
{
  "event_type": "CHECKOUT.ORDER.COMPLETED",
  "resource": {
    "id": "7JH18949KS298384K",
    "status": "COMPLETED",
    "purchase_units": [
      {
        "amount": {
          "currency_code": "INR",
          "value": "5000.00"
        },
        "custom_id": "42"
      }
    ]
  }
}
```

**What Happens:**
1. Verifies webhook authenticity (security)
2. Extracts booking_id from custom_id
3. Updates booking: `payment_status = 'completed'`
4. Marks time slot: `is_booked = TRUE`
5. Sends confirmation email
6. Stores payment record

**Response (200 OK):**
```json
{
  "success": true
}
```

**Signature Verification:**
- PayPal sends X-PAYPAL-TRANSMISSION-ID, X-PAYPAL-TRANSMISSION-TIME, X-PAYPAL-CERT-URL, X-PAYPAL-AUTH-ALGO, X-PAYPAL-TRANSMISSION-SIG
- Backend verifies certificate chain and signature

---

## 6. Health Check

**Endpoint:** `GET /health`

**Request:**
```bash
curl https://api.megaverselive.com/health
```

**Response (200 OK):**
```json
{
  "status": "ok"
}
```

---

## Database Updates After Payment

### After Successful Payment:

**Bookings Table:**
```sql
UPDATE bookings SET 
  payment_status = 'completed',
  booking_status = 'confirmed'
WHERE id = :booking_id;
```

**Time Slots Table:**
```sql
UPDATE time_slots SET 
  is_booked = TRUE
WHERE mentor_id = :mentor_id 
  AND start_time = :start_time;
```

**Payments Table:**
```sql
INSERT INTO payments (
  booking_id, 
  amount, 
  payment_method,  -- 'razorpay_upi' or 'paypal'
  payment_id,      -- razorpay_payment_id or paypal_order_id
  status           -- 'completed'
) VALUES (...);
```

**Emails Sent Table:**
```sql
INSERT INTO emails_sent (
  booking_id,
  email_type,  -- 'booking_confirmation'
  recipient_email,
  sent_at
) VALUES (...);
```

---

## Testing Flow

### Test UPI Payment

```bash
# 1. Create booking
BOOKING=$(curl -X POST https://api.megaverselive.com/api/book \
  -H "Content-Type: application/json" \
  -d '{...}' | jq -r '.booking_id')

echo "Booking ID: $BOOKING"

# 2. Create Razorpay order
ORDER=$(curl -X POST https://api.megaverselive.com/api/razorpay/create-order \
  -H "Content-Type: application/json" \
  -d "{\"booking_id\": $BOOKING, \"amount\": 5000}" | jq -r '.order_id')

echo "Order ID: $ORDER"

# 3. In browser, use Razorpay SDK with order_id
# Use test UPI: success@razorpay
```

### Test PayPal Payment

```bash
# 1. Create booking (same as above)
BOOKING=$(curl -X POST https://api.megaverselive.com/api/book \
  -H "Content-Type: application/json" \
  -d '{...}' | jq -r '.booking_id')

# 2. Create PayPal order
ORDER=$(curl -X POST https://api.megaverselive.com/api/paypal/create-order \
  -H "Content-Type: application/json" \
  -d "{\"booking_id\": $BOOKING, \"amount\": 5000}" | jq -r '.id')

echo "PayPal Order ID: $ORDER"

# 3. In browser, use PayPal SDK with order_id
# Login with PayPal sandbox account
```

---

## Environment Variables Required

For UPI (Razorpay):
```
RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
```

For International (PayPal):
```
PAYPAL_CLIENT_ID=XXXXXXXXXXXXXX
PAYPAL_SECRET=XXXXXXXXXXXXXX
PAYPAL_API=https://api-m.sandbox.paypal.com
```

For Database:
```
DB_HOST=megaverse-db.postgres.database.azure.com
DB_PORT=5432
DB_USER=dbadmin
DB_PASSWORD=XXXXXXXXXXXXXXXXXXXX
DB_NAME=megaverse_db
```

For Emails:
```
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=16-char-app-password
```

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| 400 Invalid Razorpay credentials | Wrong Key ID/Secret | Check Razorpay dashboard |
| 400 Invalid PayPal credentials | Wrong Client ID/Secret | Check PayPal developer dashboard |
| 400 Slot not available | Slot already booked | Fetch fresh slots from /api/slots |
| 404 Booking not found | Webhook referencing wrong booking | Check booking_id in request |
| 500 Database connection error | DB credentials wrong | Verify DB_* env vars |
| Invalid webhook signature | Tampered request | Verify provider's IP whitelist |

---

## Rate Limiting

No rate limiting implemented. Add if needed:
- Razorpay: Max 1 order per booking (automatic via unique booking_id)
- PayPal: Max 1 order per booking (automatic via custom_id)
- General: Recommend rate limit 100 req/min per IP for production

---

## CORS Configuration

Backend allows requests from:
```
https://megaverselive.com
```

Update FRONTEND_URL env var to allow different domain.

---

## Support

- Razorpay: https://razorpay.com/support
- PayPal: https://www.paypal.com/in/webapps/helpcenter
- Backend: Check logs on Render dashboard

