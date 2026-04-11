# 🚀 PayPal Setup Guide (5 MINUTES)

Since you already have a PayPal account, you just need to get your API credentials.

---

## STEP 1: Get Your PayPal API Credentials (5 minutes)

### Go to PayPal Developer Dashboard

1. Open: **https://developer.paypal.com**
2. Sign in with your PayPal account (the one you already have)
3. Click on **"Apps & Credentials"** (left sidebar)
4. Make sure you're in **"Sandbox"** tab (NOT Live yet)

### Get Client ID and Secret

In the Sandbox tab:
1. Under "REST API apps" section, you'll see an app (or create one)
2. Click on the app name
3. You'll see:
   - **Client ID** (starts with `AWx...` or `Af...`)
   - **Secret** (long string of characters)
4. Copy both and save them

---

## STEP 2: Copy Your Credentials

You now have:
```
PAYPAL_CLIENT_ID = AWx_1234567890abcdefghij...
PAYPAL_SECRET = EOfL1234567890abcdefghijklmnopqrst...
```

---

## STEP 3: Add to Render Environment

When you deploy to Render:

1. Go to Render dashboard → Environment tab
2. Add 2 new variables:

```
PAYPAL_CLIENT_ID = AWx_... (your Client ID from PayPal)
PAYPAL_SECRET = EOfL1... (your Secret from PayPal)
```

3. Keep the database credentials (same as before)
4. Add Gmail app password (same as before)

**That's it!** PayPal is ready to go.

---

## STEP 4: How PayPal Payments Will Work

When someone books a session:

1. They click "Pay with PayPal"
2. We create a PayPal order with the booking amount (in INR)
3. They're redirected to PayPal to complete payment
4. PayPal confirms payment back to us
5. We confirm the booking and send confirmation email
6. Done!

---

## STEP 5: Get Your PayPal Webhook URL

After you deploy to Render:

1. Your webhook URL will be: `https://api.megaverselive.com/webhook/paypal`
2. Go back to PayPal: Accounts → Webhooks
3. Create new webhook:
   - Endpoint URL: `https://api.megaverselive.com/webhook/paypal`
   - Events: Select "Checkout Order Completed"
4. Save

---

## TESTING WITH SANDBOX

When you first deploy, PayPal runs in SANDBOX mode (test payments).

**Test Buyer Account Credentials:**
You can create a test account at: https://developer.paypal.com/dashboard/accounts

Use any amount to test. No real money is charged.

---

## SWITCHING TO LIVE (When Ready)

When you want real payments:

1. Go to PayPal Developer Dashboard
2. Switch from "Sandbox" to "Live" tab
3. Get your **Live Client ID** and **Live Secret**
4. Update Render environment variables with Live credentials
5. Update webhook URL at PayPal with Live endpoint
6. Done! Real payments now work.

---

## YOUR DEPLOYMENT STEPS

1. Get PayPal credentials (above)
2. Go to https://render.com
3. Deploy backend from GitHub
4. Add environment variables:
   - DB credentials (same)
   - PayPal Client ID (new)
   - PayPal Secret (new)
   - Gmail app password (same)
5. Deploy website with API URL
6. Update PayPal webhook settings
7. Test booking with PayPal

**Everything else stays the same!**

---

## ADVANTAGES OF PAYPAL

✅ Works in India (with your account)
✅ Trusted internationally
✅ No invite needed (you have it)
✅ Simple integration
✅ Secure payments
✅ Sandbox for testing
✅ Easy to switch to Live

---

## QUICK CREDENTIAL REFERENCE

```
PAYPAL_CLIENT_ID = [From PayPal Developer Dashboard]
PAYPAL_SECRET = [From PayPal Developer Dashboard]

PAYPAL_WEBHOOK_URL = https://api.megaverselive.com/webhook/paypal
```

---

**You're all set! Just get those 2 credentials and deploy.** 🚀
