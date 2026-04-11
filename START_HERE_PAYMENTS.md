# 🚀 START HERE - Dual Payment System Deployment

Welcome! Your Megaverse Live booking platform is ready to accept payments from India (UPI) and international customers (PayPal).

**Total time to go live: 30-45 minutes**

---

## Quick Start (Read This First)

### What You Have
✅ Complete Node.js backend with both payment methods  
✅ PostgreSQL database live on Azure  
✅ Netlify frontend (megaverselive.com)  
✅ All code on GitHub  
✅ Comprehensive documentation  

### What You Need
❌ Razorpay credentials (UPI for India)  
❌ PayPal credentials (International)  
❌ Gmail app password (for emails)  

### Your Next 8 Steps
1. Collect credentials (10 minutes)
2. Deploy backend to Render (5 minutes)
3. Configure webhooks (5 minutes)
4. Update frontend (3 minutes)
5. Test both payment methods (5 minutes)
6. Go live with production credentials (2 minutes)

---

## Documentation Guide

| Document | Purpose | Read When |
|----------|---------|-----------|
| **PAYMENT_SETUP.md** | How to set up Razorpay & PayPal | Getting credentials |
| **DEPLOYMENT_CHECKLIST_PAYMENTS.md** | Step-by-step deployment guide | Ready to deploy |
| **API_ENDPOINTS_DUAL.md** | API reference & examples | Building frontend |
| **DUAL_PAYMENTS_READY.md** | Overview & FAQ | Want quick summary |

**Pick based on your preference:**
- Visual learner? → Start with DUAL_PAYMENTS_READY.md
- Follow steps? → Start with DEPLOYMENT_CHECKLIST_PAYMENTS.md
- Need details? → Start with PAYMENT_SETUP.md

---

## Architecture Overview

```
Customer visits megaverselive.com
           ↓
    Selects Payment Method
    ├─ UPI (₹) → Razorpay → India payment
    └─ PayPal → PayPal → International payment
           ↓
    Payment Confirmed
           ↓
    Booking Status Updated
    - Booking confirmed
    - Time slot locked
    - Email confirmation sent
    - Record in database
```

---

## Step 1: Get Your Credentials

### Razorpay (UPI for India)
1. Go to https://razorpay.com
2. Create account with your email
3. Complete KYC (identity verification) - takes 5-10 minutes
4. After approval, go to **Settings → API Keys**
5. Copy:
   - **Key ID** (starts with `rzp_live_`)
   - **Key Secret** (long string)
6. Save in password manager

### PayPal (International)
1. Go to https://developer.paypal.com
2. Sign in with your PayPal account
3. Click **Apps & Credentials**
4. Make sure you're on **Sandbox** tab
5. Copy:
   - **Client ID**
   - **Secret**
6. Save in password manager

### Gmail App Password (for emails)
1. Go to https://myaccount.google.com/apppasswords
2. Sign in if needed
3. Generate app password (select Gmail & your device)
4. Copy the 16-character password
5. Save in password manager

**Total Time: 15 minutes**

---

## Step 2: Deploy Backend

1. Go to https://render.com
2. Sign in with GitHub (create account if needed)
3. Click **New** → **Web Service**
4. Authorize Render to access GitHub
5. Select `megaverselive` repository
6. Configure:
   - Name: `megaverse-api`
   - Root Directory: `backend`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
7. Click **Advanced** and add these 13 environment variables:

```
DB_HOST = megaverse-db.postgres.database.azure.com
DB_PORT = 5432
DB_USER = dbadmin
DB_PASSWORD = (your Azure password)
DB_NAME = megaverse_db
RAZORPAY_KEY_ID = (from Razorpay Settings)
RAZORPAY_KEY_SECRET = (from Razorpay Settings)
PAYPAL_CLIENT_ID = (from PayPal Developer)
PAYPAL_SECRET = (from PayPal Developer)
EMAIL_USER = harshit-goyal@hotmail.com
EMAIL_PASSWORD = (Gmail app password)
FRONTEND_URL = https://megaverselive.com
NODE_ENV = production
```

8. Click **Create Web Service**
9. Wait 2-3 minutes for deployment
10. Once deployed, you'll see a Render URL like: `https://megaverse-api-xxxxx.onrender.com`
11. Copy this URL - you'll need it for webhooks

**Total Time: 5 minutes (+ 2-3 min deployment)**

---

## Step 3: Configure Webhooks

### Razorpay Webhook

1. Go to https://dashboard.razorpay.com
2. Click **Settings** → **Webhooks**
3. Click **Add Webhook**
4. Fill in:
   - **URL**: `https://megaverse-api-xxxxx.onrender.com/api/webhook/razorpay`
     (replace xxxxx with your Render subdomain)
   - **Events**: Select `payment.authorized` and `payment.failed`
5. Click **Create**
6. Save the webhook ID (shown after creation)

### PayPal Webhook

1. Go to https://developer.paypal.com/dashboard
2. Click **Apps & Credentials** (stay on **Sandbox**)
3. Look for **Webhooks** section
4. Click **Create Webhook**
5. Fill in:
   - **URL**: `https://megaverse-api-xxxxx.onrender.com/api/webhook/paypal`
     (replace xxxxx with your Render subdomain)
   - **Event Types**: Select `CHECKOUT.ORDER.COMPLETED`
6. Click **Create**

**Total Time: 5 minutes**

---

## Step 4: Update Frontend

Edit `index.html` and add:

```html
<!-- Add to <head> section -->
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID"></script>

<!-- Add to booking form -->
<div id="payment-method">
  <label>
    <input type="radio" name="payment" value="upi" checked> 
    UPI (₹ Pay in India)
  </label>
  <label>
    <input type="radio" name="payment" value="paypal"> 
    PayPal (International)
  </label>
</div>

<!-- Add booking script -->
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
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

    if (paymentMethod === 'upi') {
      // 2a. Create Razorpay order (UPI)
      const orderRes = await fetch('https://api.megaverselive.com/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id, amount })
      });
      const orderData = await orderRes.json();
      
      // 3a. Open Razorpay payment
      new Razorpay({
        key: orderData.razorpay_key,
        order_id: orderData.order_id,
        handler: function(response) {
          alert('Payment successful! Confirmation sent to your email.');
        }
      }).open();
    } else {
      // 2b. Create PayPal order
      const orderRes = await fetch('https://api.megaverselive.com/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id, amount })
      });
      const orderData = await orderRes.json();
      
      // 3b. Open PayPal payment
      paypal.Buttons({
        createOrder: () => orderData.id,
        onApprove: function(data, actions) {
          alert('Payment successful! Confirmation sent to your email.');
        },
        onError: function(err) {
          alert('Payment failed: ' + err);
        }
      }).render('#paypal-button-container');
    }
  }
</script>
```

Push to GitHub - Netlify auto-deploys.

**Total Time: 3 minutes**

---

## Step 5: Test Both Payment Methods

### Test UPI (Razorpay)

1. Visit https://megaverselive.com
2. Select a time slot
3. Choose **UPI (₹ Pay in India)**
4. Click book
5. In Razorpay popup:
   - Use UPI ID: `success@razorpay`
   - Or use virtual card option
6. Verify:
   - Payment successful message
   - Email received (check spam folder)
   - Booking appears in database

### Test PayPal

1. Visit https://megaverselive.com
2. Select a time slot
3. Choose **PayPal**
4. Click book
5. Log in with PayPal sandbox account
6. Complete payment
7. Verify:
   - Payment successful message
   - Email received
   - Booking appears in database

**Total Time: 5 minutes**

---

## Step 6: Go Live (Switch to Production)

### Switch Razorpay to Live

1. Log in to Razorpay Dashboard
2. Go to **Settings** → **API Keys**
3. Switch from **Sandbox** to **Live**
4. Copy live Key ID and Secret
5. Go to Render Dashboard
6. Update environment variables:
   - `RAZORPAY_KEY_ID` = live key
   - `RAZORPAY_KEY_SECRET` = live secret
7. Service auto-restarts

### Switch PayPal to Live

1. Log in to PayPal Developer Dashboard
2. Switch from **Sandbox** to **Live**
3. Copy live Client ID and Secret
4. Go to Render Dashboard
5. Update environment variables:
   - `PAYPAL_CLIENT_ID` = live ID
   - `PAYPAL_SECRET` = live secret
   - `PAYPAL_API` = `https://api-m.paypal.com`
6. Service auto-restarts

**Total Time: 2 minutes**

---

## Verification Checklist

After following all 6 steps:

- [ ] Razorpay credentials collected
- [ ] PayPal credentials collected
- [ ] Gmail app password generated
- [ ] Backend deployed on Render
- [ ] API URL accessible (check health endpoint)
- [ ] Razorpay webhook configured
- [ ] PayPal webhook configured
- [ ] Frontend updated with payment methods
- [ ] UPI payment tested (sandbox)
- [ ] PayPal payment tested (sandbox)
- [ ] Confirmation emails received
- [ ] Database bookings created
- [ ] Live credentials configured
- [ ] Ready to accept real payments!

---

## Troubleshooting

### Backend not starting on Render
- Check environment variables (copy exactly)
- Check Render logs (Dashboard → Services → Logs)
- Verify database connectivity

### Payment not processing
- Check webhook URLs are correct
- Verify credentials in Render dashboard
- Check provider dashboards for payment status
- Review backend logs

### Emails not sending
- Verify Gmail app password (not main password)
- Check EMAIL_USER and EMAIL_PASSWORD in Render
- Enable "Less secure app access" in Gmail settings

### Slot showing as unavailable
- Try selecting a different time
- Slots are generated 60 days in advance
- Check database for duplicates

---

## Success! 🎉

You're now live with dual payments!

**What customers can do:**
- India customers book via UPI (easiest way to pay)
- International customers book via PayPal
- Automatic payment method selection based on location (optional)
- Instant confirmation emails
- Session details secured

**What you can do:**
- View all bookings in database
- Track payments by method (UPI vs PayPal)
- Monitor transaction history
- Manage schedule availability
- Send session reminders

---

## Next Steps

1. **Monitor First Payments**
   - Watch dashboard for test vs. real bookings
   - Review payment notifications from providers
   - Check confirmation emails arrive

2. **Optimize**
   - Adjust session pricing if needed
   - Add more mentor profiles later
   - Enable calendar view
   - Add automated reminders

3. **Scale**
   - Add more payment methods as needed
   - Support more mentors
   - Implement reviews/ratings
   - Create mobile app

---

## Support

📖 **Need help?** Check the documentation:
- PAYMENT_SETUP.md - Detailed setup guide
- DEPLOYMENT_CHECKLIST_PAYMENTS.md - Step-by-step checklist
- API_ENDPOINTS_DUAL.md - API reference
- DUAL_PAYMENTS_READY.md - Overview & FAQ

🔗 **Provider support:**
- Razorpay: https://razorpay.com/support
- PayPal: https://www.paypal.com/in/webapps/helpcenter
- Render: https://render.com/support

📧 **GitHub:** https://github.com/harshit-goyal/megaverselive

---

**You're all set! Good luck with your bookings! 🚀**
