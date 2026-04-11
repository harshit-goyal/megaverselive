# PayPal Credentials Setup for Live Integration

## Status
✅ **PayPal SDK Integration**: Complete - Valid Client ID deployed
⚠️ **PayPal Backend Integration**: Awaiting credentials

## What's Working
1. PayPal SDK script tag loads with your valid Client ID
2. PayPal buttons render in the payment modal
3. UPI payments work via Razorpay
4. Frontend shows both payment options

## What's Needed to Complete PayPal Payments

You need to add your PayPal credentials to the server environment. The backend currently shows a placeholder error because the credentials are not configured.

### Step 1: Get Your PayPal Credentials

In your PayPal Dashboard:
1. Go to **Apps & Credentials** → **Sandbox** or **Live** (depending on which environment you want to use)
2. Find your app and click **Show** next to "App ID"
3. Copy your **Client ID** (you already have this: `AQmTZVVP8P1VLSWPj9lVkh_M5f_KkOmhLJdKKPEb`)
4. Copy your **Client Secret** (keep this safe!)

### Step 2: Update Environment Variables on Render

Your app is deployed on Render. You need to update the environment variables:

**Option A: Via Render Dashboard**
1. Go to https://dashboard.render.com
2. Select your service: `megaverse-live`
3. Go to **Environment** tab
4. Update these variables:
   ```
   PAYPAL_CLIENT_ID=AQmTZVVP8P1VLSWPj9lVkh_M5f_KkOmhLJdKKPEb
   PAYPAL_CLIENT_SECRET=<your-client-secret-here>
   ```
5. Save changes (service will auto-redeploy)

**Option B: Via Git (Local)**
1. Edit `backend/.env`:
   ```
   PAYPAL_CLIENT_ID=AQmTZVVP8P1VLSWPj9lVkh_M5f_KkOmhLJdKKPEb
   PAYPAL_CLIENT_SECRET=<your-client-secret-here>
   ```
2. Run: `git add backend/.env && git commit -m "Add PayPal credentials" && git push`
3. Render will auto-redeploy

### Step 3: Test Payment Flow

After updating credentials:

1. **Hard refresh** your website: `Cmd+Shift+R` (Mac) or `Ctrl+F5` (Windows)
2. Click **"Book a Session"** button
3. In the payment modal, you should see:
   - ✅ UPI button (Razorpay)
   - ✅ PayPal button below it
4. Click **PayPal button** and complete a test transaction
5. **Success** = Auto-redirect to cal.com

## Test vs Live Mode

Currently, the backend is configured for **Sandbox** (test) mode:
- Endpoint: `https://api.sandbox.paypal.com`
- Use sandbox PayPal account credentials
- No real money charged

To switch to **Live** (production) mode later:
1. Change `api.sandbox.paypal.com` → `api-m.paypal.com` in backend
2. Update environment variables with your **Live** app credentials
3. Redeploy

## Troubleshooting

**Q: PayPal buttons don't appear?**
- A: Check browser console (F12) for errors. Likely SDK loading issue or Client ID mismatch.

**Q: Payment fails with "credentials not configured"?**
- A: The PAYPAL_CLIENT_SECRET environment variable is missing or set to placeholder.

**Q: Getting "client-id not recognized"?**
- A: The Client ID doesn't match your app. Verify it's correct in both places:
  1. `index.html` (PayPal SDK script tag, line ~395)
  2. `backend/.env` (PAYPAL_CLIENT_ID)

## Important Files

- **Frontend**: `index.html` (PayPal SDK integration, payment modal)
- **Backend**: `backend/index.js` (PayPal order creation endpoint)
- **Environment**: `backend/.env` (credentials - local) or Render Dashboard (deployed)

## API Endpoint

```
POST /api/paypal/create-order
Body: { "amount": "15.00", "currency": "USD" }
Response: { "order_id": "xxx" }
```

This endpoint is automatically called by the PayPal SDK when user clicks the PayPal button.
