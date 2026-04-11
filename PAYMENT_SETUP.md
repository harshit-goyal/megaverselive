# Payment Setup: UPI (India) + PayPal (International)

Your booking platform now supports **two payment methods**:
- **UPI via Razorpay** (for India customers)
- **PayPal** (for international customers)

---

## 1. Razorpay Setup (UPI for India)

### Step 1: Create Razorpay Account
1. Go to https://razorpay.com
2. Click **"Sign Up"**
3. Create account with your business email
4. Complete KYC verification (required for UPI)
5. Once verified, you can accept UPI payments

### Step 2: Get API Keys
1. Log in to Razorpay Dashboard
2. Go to **Settings** → **API Keys**
3. Copy:
   - **Key ID** (public key)
   - **Key Secret** (private key)
4. Keep these safe (don't share with anyone)

### Step 3: Test Mode vs Live Mode
- **Sandbox**: Use test credentials initially
- **Live**: Switch after testing successful transactions

---

## 2. PayPal Setup (International)

### Step 1: Log In to PayPal Developer
1. Go to https://developer.paypal.com
2. Sign in with your PayPal account
3. Go to **Dashboard** → **Apps & Credentials**

### Step 2: Get PayPal Credentials
1. Make sure you're on the **Sandbox** tab
2. Copy:
   - **Client ID** (public)
   - **Secret** (private)
3. Keep the Secret safe

### Step 3: Get PayPal Test Account
1. In Dashboard, go to **Accounts** tab
2. Under **Sandbox accounts**, you'll see:
   - Business account: Use this as your merchant account
   - Personal account: Use this to test payments
3. Test credentials are already set up for you

---

## 3. Environment Variables Setup

Update your `.env` file with both credentials:

```bash
# Database
DB_HOST=megaverse-db.postgres.database.azure.com
DB_PORT=5432
DB_USER=dbadmin
DB_PASSWORD=YourPasswordHere
DB_NAME=megaversedb

# Razorpay (UPI for India)
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx      # Get from Razorpay Settings
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxx       # Get from Razorpay Settings

# PayPal (International)
PAYPAL_CLIENT_ID=xxxxxxxxxxxxxx          # Get from PayPal Developer Dashboard
PAYPAL_SECRET=xxxxxxxxxxxxxx             # Get from PayPal Developer Dashboard
PAYPAL_API=https://api-m.sandbox.paypal.com  # Change to https://api-m.paypal.com for live

# Email
EMAIL_SERVICE=gmail                       # or 'sendgrid'
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=app-specific-password      # Use app passwords, not your main password

# Frontend
FRONTEND_URL=https://megaverselive.com
NODE_ENV=production
PORT=8080
```

---

## 4. Deployment to Render

### Create Web Service on Render

1. Go to https://render.com
2. Sign in with GitHub
3. Click **New** → **Web Service**
4. Select your megaverselive repository
5. Configure:
   - **Name**: megaverse-api
   - **Root Directory**: backend
   - **Runtime**: Node
   - **Build Command**: npm install
   - **Start Command**: npm start

### Add Environment Variables

Click **Advanced** and add all 11 variables from `.env`:

| Variable | Value |
|----------|-------|
| DB_HOST | megaverse-db.postgres.database.azure.com |
| DB_PORT | 5432 |
| DB_USER | dbadmin |
| DB_PASSWORD | (your Azure password) |
| DB_NAME | megaversedb |
| RAZORPAY_KEY_ID | (from Razorpay) |
| RAZORPAY_KEY_SECRET | (from Razorpay) |
| PAYPAL_CLIENT_ID | (from PayPal) |
| PAYPAL_SECRET | (from PayPal) |
| EMAIL_USER | (your email) |
| EMAIL_PASSWORD | (app password) |
| FRONTEND_URL | https://megaverselive.com |

Then click **Create Web Service**.

---

## 5. Webhook Configuration

### Razorpay Webhook

1. Log in to Razorpay Dashboard
2. Go to **Settings** → **Webhooks**
3. Click **Add New Webhook**
4. Enter:
   - **URL**: `https://api.megaverselive.com/api/webhook/razorpay`
   - **Events**: Select `payment.authorized` and `payment.failed`
5. Save webhook

### PayPal Webhook

1. Go to PayPal Developer Dashboard
2. Go to **Apps & Credentials** → **Webhooks**
3. Click **Create Webhook**
4. Enter:
   - **Webhook URL**: `https://api.megaverselive.com/api/webhook/paypal`
   - **Event Types**: Select `CHECKOUT.ORDER.COMPLETED`
5. Click **Create**

---

## 6. Frontend Integration

Update your `index.html` booking form:

```html
<!-- Load both payment SDKs -->
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID"></script>

<script>
  async function bookSession() {
    // 1. Create booking
    const response = await fetch('https://api.megaverselive.com/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: document.getElementById('name').value,
        customer_email: document.getElementById('email').value,
        customer_phone: document.getElementById('phone').value,
        session_topic: document.getElementById('topic').value,
        start_time: selectedSlot
      })
    });

    const { booking_id, amount, payment_methods } = await response.json();

    // 2. Detect location (India = UPI, else = PayPal)
    const isIndia = await detectUserLocation(); // Use IP geolocation API

    if (isIndia && payment_methods.upi.available) {
      // Use Razorpay UPI
      processRazorpayPayment(booking_id, amount);
    } else if (payment_methods.international.available) {
      // Use PayPal
      processPayPalPayment(booking_id, amount);
    }
  }

  function processRazorpayPayment(bookingId, amount) {
    // Create Razorpay order
    fetch('https://api.megaverselive.com/api/razorpay/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_id: bookingId, amount })
    })
    .then(res => res.json())
    .then(data => {
      const options = {
        key: data.razorpay_key,
        order_id: data.order_id,
        handler: function(response) {
          // Payment successful - webhook handles confirmation
          alert('Payment successful! Confirmation sent to your email.');
        },
        prefill: {
          email: document.getElementById('email').value,
          contact: document.getElementById('phone').value
        }
      };
      new Razorpay(options).open();
    });
  }

  function processPayPalPayment(bookingId, amount) {
    paypal.Buttons({
      createOrder: (data, actions) => {
        return fetch('https://api.megaverselive.com/api/paypal/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ booking_id: bookingId, amount })
        })
        .then(res => res.json())
        .then(data => data.id);
      },
      onApprove: (data, actions) => {
        alert('Payment successful! Confirmation sent to your email.');
      },
      onError: (err) => {
        alert('Payment failed: ' + err);
      }
    }).render('#paypal-button-container');
  }
</script>
```

---

## 7. Testing

### Test UPI Payment (Razorpay Sandbox)
1. Use Razorpay test credentials in `.env`
2. In payment form, select UPI
3. Amount: ₹100 (test amount)
4. Use test UPI ID: `success@razorpay`
5. Verify booking appears in database with `payment_status='completed'`

### Test International Payment (PayPal Sandbox)
1. Use PayPal sandbox credentials
2. In payment form, select PayPal
3. Log in with PayPal personal test account
4. Complete payment
5. Verify booking confirmed and email sent

---

## 8. Go Live

### Switch Razorpay to Live
1. Log in to Razorpay Dashboard
2. Complete all verification requirements
3. Go to **Settings** → **API Keys**
4. Switch to **Live** credentials
5. Update `.env` with live credentials

### Switch PayPal to Live
1. Log in to PayPal Business Account
2. Go to Developer Dashboard
3. Switch from **Sandbox** to **Live** credentials
4. Update `PAYPAL_API` to `https://api-m.paypal.com` (remove sandbox)
5. Update `.env` with live credentials

### Update Production Environment
1. Log in to Render Dashboard
2. Update all environment variables with live credentials
3. Service will restart automatically

---

## API Endpoints

### Create Booking
```
POST /api/book
Body: {
  customer_name: "John Doe",
  customer_email: "john@example.com",
  customer_phone: "+91 9999999999",
  session_topic: "Career Guidance",
  start_time: "2024-02-15T10:00:00Z"
}
Response: {
  booking_id: 123,
  amount: 5000,
  currency: "INR",
  payment_methods: {
    upi: { available: true, provider: "razorpay" },
    international: { available: true, provider: "paypal" }
  }
}
```

### Create Razorpay Order (UPI)
```
POST /api/razorpay/create-order
Body: {
  booking_id: 123,
  amount: 5000
}
Response: {
  order_id: "order_xxxxx",
  razorpay_key: "rzp_live_xxxxx",
  booking_id: 123
}
```

### Create PayPal Order (International)
```
POST /api/paypal/create-order
Body: {
  booking_id: 123,
  amount: 5000
}
Response: {
  id: "7JH18949KS298384K", // PayPal order ID
  status: "CREATED"
}
```

### Razorpay Webhook
- **Endpoint**: `POST /api/webhook/razorpay`
- **Events**: `payment.authorized`, `payment.failed`
- **Signature Verification**: Yes (HMAC-SHA256)

### PayPal Webhook
- **Endpoint**: `POST /api/webhook/paypal`
- **Events**: `CHECKOUT.ORDER.COMPLETED`
- **Signature Verification**: Yes (PayPal signature)

---

## Troubleshooting

### Razorpay Payment Not Working
1. Verify credentials in `.env`
2. Check Razorpay account is verified (KYC complete)
3. Check webhook URL is accessible
4. View Razorpay Dashboard logs for payment status

### PayPal Payment Not Working
1. Verify credentials in `.env`
2. Make sure you're using sandbox credentials for testing
3. Check webhook endpoint in PayPal Dashboard
4. View PayPal transaction history for payment status

### Emails Not Sending
1. Verify Gmail app password (not main password)
2. Enable "Less secure app access" in Gmail settings
3. Check email logs in backend console
4. Verify recipient email in database

---

## Support

**Razorpay Support**: https://razorpay.com/support
**PayPal Support**: https://www.paypal.com/in/webapps/helpcenter
**Email Support**: support@megaverselive.com

