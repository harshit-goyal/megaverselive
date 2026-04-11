# Deploy Your Booking Platform - Step by Step

**Total Time: 20-30 minutes to go live**

Everything is ready. Just follow these 7 steps in order. **Do NOT skip steps.**

---

## STEP 1: Get Razorpay Credentials (5 minutes)

Razorpay handles UPI payments for India.

### Instructions:
1. Go to https://razorpay.com
2. Click "Sign Up" → Select "Individual" 
3. Enter email, password, phone number
4. **Complete KYC verification** (submit Aadhar/PAN)
   - This takes 5-30 minutes, sometimes instant
   - You can proceed with test mode while waiting
5. Once KYC approved, go to **Settings → API Keys**
6. Copy both:
   - **Key ID** (starts with `rzp_live_`)
   - **Key Secret** (long string, keep it SECRET)
7. **Save these in a text file** - you'll need them in Step 4

### Test Credentials (use while KYC pending):
- **Key ID**: `rzp_test_...` (from test mode)
- **Key Secret**: `test_...` (from test mode)
- Use test mode for testing, switch to live keys later

### ✅ Done when: You have both Key ID and Key Secret

---

## STEP 2: Get PayPal Credentials (2 minutes)

PayPal handles international payments.

### Instructions:
1. Go to https://developer.paypal.com
2. Sign in with your PayPal account
   - If you don't have PayPal: Create one at https://paypal.com
3. Go to **Apps & Credentials** → **Sandbox tab**
4. Click **Business Account** in the "Accounts" section
5. Copy:
   - **Client ID** (under "Client ID" field)
   - **Secret** (under "Secret" field, click "Show")
6. **Save these in a text file** - you'll need them in Step 4

### ✅ Done when: You have both Client ID and Secret

---

## STEP 3: ✅ SKIP - Your calendar tool handles emails

Your existing calendar tool already sends confirmation emails. **You don't need Gmail.**

- ✅ Calendar sends confirmations automatically
- ✅ Skip email setup entirely
- ✅ Simplifies deployment

---

## STEP 4: Deploy Backend to Render (5-8 minutes)

Render hosts your backend API.

### Instructions:

1. **Go to https://render.com**
2. Sign up for a free account (GitHub login works too)
3. Click **New** → **Web Service**
4. **Connect GitHub**: Authorize Render to access your GitHub account
5. Select repository: `megaverselive`
6. Fill in:
   - **Name**: `megaverselive-backend`
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `node backend/index.js`
   - **Runtime**: `Node`
   - **Plan**: `Free`

7. **Add Environment Variables** (scroll down)

Click **Add Environment Variable** and enter these (copy from your text file):

| Key | Value |
|-----|-------|
| `DB_HOST` | Your Azure PostgreSQL host (check portal) |
| `DB_USER` | Your PostgreSQL username |
| `DB_PASSWORD` | Your PostgreSQL password |
| `DB_NAME` | `bookings` |
| `DB_PORT` | `5432` |
| `RAZORPAY_KEY_ID` | From Step 1 |
| `RAZORPAY_KEY_SECRET` | From Step 1 |
| `PAYPAL_CLIENT_ID` | From Step 2 |
| `PAYPAL_CLIENT_SECRET` | From Step 2 |
| `PAYPAL_API_URL` | `https://api.sandbox.paypal.com` |
| `FRONTEND_URL` | `https://megaverselive.netlify.app` |

8. Click **Create Web Service**
9. **Wait 2-3 minutes for deployment**
   - You'll see a live URL like: `https://megaverselive-backend.onrender.com`
10. **Copy this URL** - you'll need it for Steps 5 and 6

### ✅ Done when: You see a green "Live" status and have the URL

---

## STEP 5: Configure Webhooks (5 minutes)

Webhooks tell your backend when payments are completed.

### Razorpay Webhook:

1. Go to https://dashboard.razorpay.com → **Settings → Webhooks**
2. Click **Add New Webhook**
3. **URL**: `https://megaverselive-backend.onrender.com/api/webhook/razorpay`
   - Replace with YOUR Render URL from Step 4
4. **Events to send**: Select **payment.authorized** and **order.paid**
5. **Secret**: Copy and save the webhook secret (you may need it)
6. Click **Create Webhook**

### PayPal Webhook:

1. Go to https://developer.paypal.com → **Apps & Credentials** → **Sandbox tab**
2. Go to **Business Account** → Click the menu (•••) → **Manage Webhooks**
3. Click **Add Webhook**
4. **URL**: `https://megaverselive-backend.onrender.com/api/webhook/paypal`
   - Replace with YOUR Render URL from Step 4
5. **Events**: Check **Payment Sale Completed**
6. Click **Add Webhook**

### ✅ Done when: Both webhooks are registered and show "Active"

---

## STEP 6: Update Frontend (3 minutes)

Add payment methods to your booking form.

### Your frontend file: `index.html`

**Find this section** (around line 80):
```html
<!-- Payment Method Selection -->
<label>Choose Payment Method:</label>
```

**Replace it with this**:
```html
<!-- Payment Method Selection -->
<label>Choose Payment Method:</label>
<div style="margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
  <label style="display: block; margin: 10px 0;">
    <input type="radio" name="paymentMethod" value="razorpay_upi" checked> 
    <strong>UPI (Razorpay)</strong> - For India
  </label>
  <label style="display: block; margin: 10px 0;">
    <input type="radio" name="paymentMethod" value="paypal"> 
    <strong>PayPal</strong> - International
  </label>
</div>
```

**Find this section** (around line 150):
```javascript
// After booking is confirmed...
console.log('Booking confirmed:', response);
```

**Add this code before it**:
```javascript
// Determine payment method
const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

if (paymentMethod === 'razorpay_upi') {
  // Use Razorpay for UPI
  const options = {
    "key": "YOUR_RAZORPAY_KEY_ID", // Replace with your Razorpay Key ID
    "amount": sessionPrice * 100, // Amount in paise
    "currency": "INR",
    "name": "Megaverse Live",
    "description": "Book a Session",
    "order_id": response.razorpay_order_id,
    "handler": function(razorpayResponse) {
      console.log('Payment successful:', razorpayResponse);
      alert('Payment successful! Check your email for confirmation.');
    },
    "prefill": {
      "name": name,
      "email": email,
      "contact": phone
    }
  };
  const rzp1 = new Razorpay(options);
  rzp1.open();
} else if (paymentMethod === 'paypal') {
  // Use PayPal
  const options = {
    "clientId": "YOUR_PAYPAL_CLIENT_ID", // Replace with your PayPal Client ID
    "createOrder": function(data, actions) {
      return fetch('https://YOUR_RENDER_URL/api/paypal/create-order', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({booking_id: response.booking_id, amount: sessionPrice})
      })
      .then(res => res.json())
      .then(data => data.id);
    },
    "onApprove": function(data, actions) {
      return fetch('https://YOUR_RENDER_URL/api/paypal/capture-order', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({orderID: data.orderID})
      })
      .then(res => res.json())
      .then(data => {
        alert('Payment successful! Check your email for confirmation.');
      });
    }
  };
  paypal.Buttons(options).render('#paypal-container');
}
```

**Add these SDKs to your `<head>` section**:
```html
<!-- Razorpay SDK -->
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>

<!-- PayPal SDK -->
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID"></script>
```

**Replace**:
- `YOUR_RAZORPAY_KEY_ID` → Your Razorpay Key ID from Step 1
- `YOUR_PAYPAL_CLIENT_ID` → Your PayPal Client ID from Step 2
- `YOUR_RENDER_URL` → Your Render URL from Step 4

### ✅ Done when: Your index.html has payment radio buttons and both SDKs

---

## STEP 7: Test Both Payment Methods (5 minutes)

Test UPI and PayPal in sandbox mode.

### Test UPI (Razorpay):
1. Open your website (on Netlify)
2. Fill in booking form
3. Select **"UPI (Razorpay)"**
4. Click Book
5. You'll see Razorpay payment form
6. Use test credentials from Razorpay sandbox
7. Verify: Check your email for confirmation (if Gmail enabled)

### Test PayPal:
1. Open your website again
2. Fill in new booking
3. Select **"PayPal"**
4. Click Book
5. You'll be redirected to PayPal sandbox
6. Log in with your PayPal sandbox account
7. Complete payment
8. Verify: Check your email for confirmation

### ✅ Done when: Both payment methods work and you get confirmations

---

## STEP 7: Go Live (2 minutes)

Switch from test credentials to production.

### Get Live Credentials:

**Razorpay**:
1. Go to https://dashboard.razorpay.com → **Settings → API Keys**
2. Switch from **Test Mode** to **Live Mode**
3. Copy live **Key ID** and **Key Secret**

**PayPal**:
1. Go to https://developer.paypal.com → **Apps & Credentials**
2. Switch from **Sandbox** to **Live tab**
3. Copy live **Client ID** and **Secret**

### Update Render:
1. Go to https://dashboard.render.com → Your service
2. Click **Environment** tab
3. Update these variables with LIVE credentials:
   - `RAZORPAY_KEY_ID` → Live Key ID
   - `RAZORPAY_KEY_SECRET` → Live Key Secret
   - `PAYPAL_CLIENT_ID` → Live Client ID
   - `PAYPAL_CLIENT_SECRET` → Live Secret
   - `PAYPAL_API_URL` → `https://api.paypal.com` (remove "sandbox")

4. **Save** - service will auto-redeploy

### ✅ Done when: Real payments start working!

---

## Troubleshooting

### "Payment failed" error
- Check environment variables in Render are correct
- Check webhook URLs are correct in Razorpay/PayPal dashboards
- Check API credentials match deployment (live vs sandbox)

### "Email not sending"
- If email fails, payments still complete (email is optional)
- Check EMAIL_USER and EMAIL_PASSWORD are set
- Make sure it's a Gmail app password, not your main password

### "404 Not Found" on backend
- Check Render service is "Live" (green status)
- Check you're using correct Render URL in frontend

### Webhook not triggering
- Payment completes, but booking stays "pending"
- Check webhook URL in dashboard matches your Render URL exactly
- Check webhook secret matches

---

## You're Done! 🎉

Your booking platform is now LIVE with:
- ✅ UPI payments (Razorpay) for India
- ✅ PayPal for international customers
- ✅ Automatic confirmations
- ✅ 24/7 availability

**Your website**: https://megaverselive.netlify.app
**Your API**: https://megaverselive-backend.onrender.com
**Your domain**: https://megaverselive.com (point to Netlify)

**Next**: Monitor bookings, add more mentors, scale up as needed!
