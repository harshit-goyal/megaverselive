# Webhook Configuration - Razorpay & PayPal

This guide explains how to set up webhooks so payments automatically confirm bookings.

---

## What are Webhooks?

When a customer pays via Razorpay or PayPal:
1. Payment processes
2. Razorpay/PayPal sends a message to your backend
3. Backend confirms the booking
4. Customer receives confirmation email

**Without webhooks:** Payment goes through but booking stays "pending"
**With webhooks:** Payment → Booking confirmed → Email sent (automatic)

---

## Prerequisites

Before configuring webhooks, you need:
- [ ] Render backend deployed (from Step 4)
- [ ] Your Render API URL: `https://megaverse-api-xxxxx.onrender.com`
- [ ] Razorpay account with credentials
- [ ] PayPal Developer account with credentials

---

## WEBHOOK 1: Razorpay UPI Payments

### Step 1: Go to Razorpay Dashboard

1. Open https://dashboard.razorpay.com
2. Sign in with your email/password
3. You should see the main dashboard

### Step 2: Navigate to Webhooks

1. Click **Settings** (gear icon, usually top right)
2. Look for **Webhooks** or **Notifications**
3. Click **Webhooks** or **Add Webhook** button

### Step 3: Add Webhook

You'll see a form. Fill it like this:

```
Webhook URL: https://megaverse-api-xxxxx.onrender.com/api/webhook/razorpay
             (Replace xxxxx with your Render subdomain)

Events to notify me about:
  ✓ payment.authorized  (check this)
  ✓ payment.failed      (check this)
  
Active: [Toggle ON]
```

### Step 4: Create Webhook

1. Click **Create Webhook** or **Add** button
2. You'll see confirmation: "Webhook created successfully"
3. Save the Webhook ID shown (for records)

### Step 5: Verify Webhook Works

1. In Render dashboard, check logs:
   - Dashboard → Services → megaverse-api → Logs
   - Look for any webhook test messages

2. Razorpay will automatically test the webhook
   - You'll see it in Razorpay logs if successful

---

## WEBHOOK 2: PayPal International Payments

### Step 1: Go to PayPal Developer Dashboard

1. Open https://developer.paypal.com/dashboard
2. Sign in with your PayPal Business account
3. Click **Apps & Credentials** (top menu)

### Step 2: Make Sure You're in Sandbox Mode

1. Look for two tabs: **Sandbox** and **Live**
2. Click **Sandbox** tab
3. (We'll switch to Live later)

### Step 3: Navigate to Webhooks

1. In the left sidebar, look for **Webhooks** or **Subscription Webhooks**
2. Under Webhook Endpoints, click **Create Webhook**

### Step 4: Add Webhook Endpoint

A form will appear. Fill it:

```
Webhook URL: https://megaverse-api-xxxxx.onrender.com/api/webhook/paypal
             (Replace xxxxx with your Render subdomain)

Event Types to listen for:
  ✓ CHECKOUT.ORDER.COMPLETED (check this one)
  
Listen for all events: [Leave unchecked - we only need orders]
```

### Step 5: Create Webhook

1. Click **Create Webhook**
2. You'll see: "Webhook endpoint has been created"
3. Save the Webhook ID (for records)
4. Note: Status should show "Active"

### Step 6: Verify Webhook

1. Click on the webhook you just created
2. Scroll down to "Recent Deliveries"
3. You'll see test/sample deliveries

---

## Webhook Testing

### Test Razorpay Webhook

1. Go to Razorpay Dashboard → Settings → Webhooks
2. Find your webhook
3. Click **Test Webhook** or similar button
4. Check Render logs to confirm delivery

### Test PayPal Webhook

1. Go to PayPal Developer Dashboard → Webhooks
2. Find your webhook endpoint
3. Look for **Send test webhook** option
4. Check Render logs to confirm delivery

---

## Checking Webhook Logs

### In Render

1. Go to https://render.com/dashboard
2. Select **megaverse-api** service
3. Click **Logs** tab
4. Look for incoming webhook requests:

```
POST /api/webhook/razorpay 200
POST /api/webhook/paypal 200
```

Status `200` = Success ✅
Status `500` = Error ❌

If you see errors, check:
- Environment variables are correct
- Database connection working
- API keys not revoked

### In Razorpay

1. Settings → Webhooks
2. Click your webhook
3. See "Webhook Events" or "Recent Events"
4. Check Status: should show "Delivered" (not "Failed")

### In PayPal

1. Apps & Credentials → Webhooks
2. Click your webhook
3. See "Recent Deliveries"
4. Check Status: should show "200" (not errors)

---

## Webhook URL Format

### For Razorpay
```
https://megaverse-api-XXXXX.onrender.com/api/webhook/razorpay
```

### For PayPal
```
https://megaverse-api-XXXXX.onrender.com/api/webhook/paypal
```

**Important:** Replace `XXXXX` with your actual Render subdomain!

Example:
- If Render URL is: `https://megaverse-api-abc123.onrender.com`
- Then Razorpay webhook: `https://megaverse-api-abc123.onrender.com/api/webhook/razorpay`
- And PayPal webhook: `https://megaverse-api-abc123.onrender.com/api/webhook/paypal`

---

## What Happens When Payment is Made

### Razorpay UPI Payment Flow

```
Customer pays via UPI (Google Pay, PhonePe, etc)
         ↓
Razorpay processes payment
         ↓
Razorpay sends webhook to your backend
         ↓
Backend webhook receives and verifies signature
         ↓
Backend updates booking: payment_status = completed
         ↓
Backend marks time slot: is_booked = TRUE
         ↓
Backend sends confirmation email
         ↓
Customer sees: "Payment successful!"
         ↓
Customer receives confirmation email with session details
```

### PayPal Payment Flow

```
Customer pays via PayPal
         ↓
PayPal processes payment
         ↓
PayPal sends webhook to your backend
         ↓
Backend webhook receives and verifies signature
         ↓
Backend updates booking: payment_status = completed
         ↓
Backend marks time slot: is_booked = TRUE
         ↓
Backend sends confirmation email
         ↓
Customer sees: "Payment successful!"
         ↓
Customer receives confirmation email with session details
```

---

## Troubleshooting Webhooks

### Webhook not being called

**Problem:** Payment completes but booking doesn't update

**Solutions:**
1. Verify webhook URL is correct (no typos)
2. Test webhook from provider dashboard
3. Check Render logs for incoming requests
4. Verify webhook endpoint is accessible (test with curl):
   ```bash
   curl https://megaverse-api-xxxxx.onrender.com/api/webhook/razorpay
   # Should return 404 or error, not "Connection refused"
   ```

### Webhook returns 500 error

**Problem:** Webhook delivery shows 500 error

**Solutions:**
1. Check Render logs for specific error
2. Verify database credentials are correct
3. Verify payment provider credentials are correct
4. Check if backend service crashed (restart if needed)

### Signature verification fails

**Problem:** Webhook received but signature verification failed

**Solutions:**
1. Verify credentials are exactly correct (no extra spaces)
2. Check if you're mixing Sandbox/Live credentials
3. For Razorpay: ensure Key Secret is used (not Key ID)
4. For PayPal: ensure Secret is used (not Client ID)

### Email not sent after webhook

**Problem:** Webhook works but no confirmation email

**Solutions:**
1. Check Gmail app password is correct
2. Verify email address is correct
3. Check Render logs for email service errors
4. Check spam folder for email
5. Verify EMAIL_USER env var is set

---

## Webhook Security

### How Webhooks Verify It's Really From Razorpay/PayPal

Both providers sign the webhook request with a secret key. Your backend verifies:

```
Received Webhook
    ↓
Extract: payload + signature
    ↓
Verify signature using provider's public key
    ↓
If valid: process payment
    ↓
If invalid: reject (security protection)
```

This prevents attackers from sending fake webhook requests.

**Your backend already handles this!** No extra setup needed.

---

## Webhook Configuration Checklist

- [ ] Razorpay webhook URL configured
- [ ] Razorpay webhook events selected (payment.authorized, payment.failed)
- [ ] PayPal webhook URL configured
- [ ] PayPal webhook event selected (CHECKOUT.ORDER.COMPLETED)
- [ ] Both webhooks show as "Active"
- [ ] Tested webhook delivery (both providers)
- [ ] Render logs show successful webhook delivery
- [ ] Can see "POST /api/webhook/razorpay 200" in logs
- [ ] Can see "POST /api/webhook/paypal 200" in logs

---

## After Webhook Configuration

You've now completed:
- ✅ Step 1: Get Razorpay Credentials
- ✅ Step 2: Get PayPal Credentials
- ✅ Step 3: Get Gmail App Password
- ✅ Step 4: Deploy to Render
- ✅ Step 5: Configure Webhooks

**Next Steps:**
- ⏳ Step 6: Update Frontend (add payment UI)
- ⏳ Step 7: Test Both Payment Methods
- ⏳ Step 8: Go Live with Production

