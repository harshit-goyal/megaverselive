# Deployment Checklist: UPI + PayPal

## Pre-Deployment (Get Credentials)

### Razorpay Setup (5 minutes)
- [ ] Go to https://razorpay.com and create account
- [ ] Complete KYC verification
- [ ] Go to Settings → API Keys
- [ ] Copy **Key ID** and **Key Secret**
- [ ] Save in safe place (password manager)

### PayPal Setup (5 minutes)
- [ ] Go to https://developer.paypal.com
- [ ] Sign in with your PayPal account
- [ ] Go to Apps & Credentials
- [ ] Copy **Client ID** and **Secret** from Sandbox tab
- [ ] Save in safe place

### Email Setup (2 minutes)
- [ ] Enable Gmail App Passwords: https://myaccount.google.com/apppasswords
- [ ] Copy the 16-character app password
- [ ] Save in safe place

---

## Deployment Steps

### Step 1: Deploy Backend to Render (5 minutes)

1. Go to https://render.com
2. Sign in with GitHub (authorize if needed)
3. Click **New** → **Web Service**
4. Select `megaverselive` repository
5. Configure:
   - Name: `megaverse-api`
   - Root Directory: `backend`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Click **Advanced**
7. Add these 13 environment variables:

| Variable | Value |
|----------|-------|
| `DB_HOST` | megaverse-db.postgres.database.azure.com |
| `DB_PORT` | 5432 |
| `DB_USER` | dbadmin |
| `DB_PASSWORD` | (your Azure password) |
| `DB_NAME` | megaverse_db |
| `RAZORPAY_KEY_ID` | (from Razorpay Settings) |
| `RAZORPAY_KEY_SECRET` | (from Razorpay Settings) |
| `PAYPAL_CLIENT_ID` | (from PayPal Developer) |
| `PAYPAL_SECRET` | (from PayPal Developer) |
| `EMAIL_USER` | harshit-goyal@hotmail.com |
| `EMAIL_PASSWORD` | (Gmail app password) |
| `FRONTEND_URL` | https://megaverselive.com |
| `NODE_ENV` | production |

8. Click **Create Web Service**
9. Wait 2-3 minutes for deployment
10. Copy your Render URL: `https://megaverse-api-xxxxx.onrender.com`

### Step 2: Configure Webhooks (5 minutes)

#### Razorpay Webhook
1. Go to https://dashboard.razorpay.com
2. Settings → Webhooks
3. Click **Add Webhook**
4. Enter:
   - URL: `https://megaverse-api-xxxxx.onrender.com/api/webhook/razorpay`
   - Events: `payment.authorized` and `payment.failed`
5. Click **Create**
6. Save webhook ID

#### PayPal Webhook
1. Go to https://developer.paypal.com/dashboard
2. Apps & Credentials → Webhooks
3. Click **Create Webhook**
4. Enter:
   - URL: `https://megaverse-api-xxxxx.onrender.com/api/webhook/paypal`
   - Event Types: `CHECKOUT.ORDER.COMPLETED`
5. Click **Create**
6. Save webhook ID

### Step 3: Test Backend (2 minutes)

1. Open terminal
2. Test API health:
   ```bash
   curl https://megaverse-api-xxxxx.onrender.com/health
   ```
   Should return: `{"status":"ok"}`

3. Test booking endpoint:
   ```bash
   curl -X POST https://megaverse-api-xxxxx.onrender.com/api/book \
     -H "Content-Type: application/json" \
     -d '{
       "customer_name": "Test User",
       "customer_email": "test@example.com",
       "customer_phone": "+919999999999",
       "session_topic": "Test Session",
       "start_time": "2024-12-25T14:00:00Z"
     }'
   ```

   Should return booking with `payment_methods` showing both `upi` and `international` available.

### Step 4: Update DNS (2 minutes)

1. Go to GoDaddy → megaverselive.com
2. DNS Management
3. Add/Update CNAME record:
   - Name: `api`
   - Value: `megaverse-api-xxxxx.onrender.com`
   - TTL: 3600
4. Save
5. Wait 15-30 minutes for propagation

Test: `nslookup api.megaverselive.com` should show Render URL

### Step 5: Update Frontend (3 minutes)

Edit `index.html` - add payment method selection:

```html
<div id="payment-method">
  <label>
    <input type="radio" name="payment" value="upi" checked> UPI (₹ Pay in India)
  </label>
  <label>
    <input type="radio" name="payment" value="paypal"> PayPal (International)
  </label>
</div>

<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID"></script>

<script>
  async function bookSession() {
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
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

    if (paymentMethod === 'upi') {
      // Process Razorpay UPI
      const orderRes = await fetch('https://api.megaverselive.com/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id, amount })
      });
      const orderData = await orderRes.json();
      
      new Razorpay({
        key: orderData.razorpay_key,
        order_id: orderData.order_id,
        handler: function(response) {
          alert('Payment successful! Check your email for confirmation.');
        }
      }).open();
    } else {
      // Process PayPal
      const orderRes = await fetch('https://api.megaverselive.com/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id, amount })
      });
      const orderData = await orderRes.json();
      
      paypal.Buttons({
        createOrder: () => orderData.id,
        onApprove: () => {
          alert('Payment successful! Check your email for confirmation.');
        }
      }).render('#paypal-container');
    }
  }
</script>
```

Push to GitHub (Netlify auto-deploys)

### Step 6: End-to-End Testing (5 minutes)

#### Test UPI (India)
1. Visit https://megaverselive.com
2. Select slot and choose UPI payment
3. Complete Razorpay test payment:
   - Use UPI ID: `success@razorpay`
   - Or virtual card test
4. Check:
   - [ ] Booking confirmed message
   - [ ] Email received at harshit-goyal@hotmail.com
   - [ ] Database shows booking with `payment_status='completed'`

#### Test PayPal (International)
1. Visit https://megaverselive.com
2. Select slot and choose PayPal
3. Complete PayPal sandbox payment
4. Check:
   - [ ] Booking confirmed message
   - [ ] Email received
   - [ ] Database shows booking with `payment_status='completed'`

### Step 7: Go Live (2 minutes)

#### Switch Razorpay to Production
1. Get live credentials from Razorpay:
   - Go to Settings → API Keys
   - Switch toggle to Live
   - Copy live Key ID and Secret
2. Update Render env vars:
   - `RAZORPAY_KEY_ID` = live key
   - `RAZORPAY_KEY_SECRET` = live secret
3. Update webhooks to use live credentials
4. Service restarts automatically

#### Switch PayPal to Production
1. Get live credentials from PayPal:
   - Go to Apps & Credentials → Live tab
   - Copy live Client ID and Secret
2. Update Render env vars:
   - `PAYPAL_CLIENT_ID` = live ID
   - `PAYPAL_SECRET` = live secret
   - `PAYPAL_API` = `https://api-m.paypal.com`
3. Update PayPal webhooks for live
4. Service restarts automatically

---

## Success Criteria

- [ ] Backend deployed on Render
- [ ] API responding at api.megaverselive.com
- [ ] UPI payments working in test mode
- [ ] PayPal payments working in test mode
- [ ] Confirmation emails sending
- [ ] Bookings appearing in database
- [ ] Both payment methods available to users
- [ ] DNS propagated (api.megaverselive.com works)
- [ ] Live credentials configured
- [ ] Ready for first real booking!

---

## Troubleshooting

### Backend not starting
```bash
# Check logs on Render Dashboard
# Look for env var issues or database connection errors
```

### Payments not processing
```bash
# 1. Verify credentials in Render dashboard
# 2. Check webhook endpoints are correctly formatted
# 3. Review logs in Razorpay/PayPal dashboard
# 4. Test with curl to API endpoints
```

### Webhooks not firing
```bash
# 1. Verify webhook URLs in Razorpay/PayPal dashboards
# 2. Ensure URLs are publicly accessible (not localhost)
# 3. Check firewall/CORS settings
# 4. Review webhook logs in provider dashboards
```

### Database not connecting
```bash
# 1. Verify all DB_* env vars are correct
# 2. Check Azure PostgreSQL firewall allows Render IP
# 3. Verify database and schema exist
```

---

## Support Resources

- **Razorpay Docs**: https://razorpay.com/docs/
- **PayPal Docs**: https://developer.paypal.com/docs/
- **Render Docs**: https://render.com/docs/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

