# Complete Razorpay Setup Guide

## Overview
Razorpay handles UPI (India) and international payments. You'll use test credentials first, then switch to live.

---

## Phase 1: Create Razorpay Account

### 1.1 Sign Up
1. Go to: **https://razorpay.com**
2. Click **Sign Up**
3. Enter email, phone, password
4. Select **Individual** or **Business** (your choice)
5. Complete verification (email + SMS)
6. ✅ You now have a Razorpay account

---

## Phase 2: Get Test Credentials

### 2.1 Complete KYC (Know Your Customer)
Razorpay requires KYC verification to activate live mode.

1. Log into: **https://dashboard.razorpay.com**
2. Go to **Settings** → **Profile**
3. Upload ID proof (Aadhar/Passport), address proof
4. Takes 5-30 minutes (sometimes instant)
5. You'll get email confirmation ✅

### 2.2 Get Test API Keys
1. Go to **Settings** → **API Keys**
2. Click **Generate Key**
3. You'll see:
   ```
   Key ID:     rzp_test_ABC123DEF456...
   Key Secret: Test_XYZ789ABC123DEF...
   ```
4. **Copy both and save them** ✅

---

## Phase 3: Add to Render Deployment

### 3.1 Environment Variables
When deploying to Render, add these 2 variables:

```
RAZORPAY_KEY_ID     = [YOUR_TEST_KEY_ID_FROM_STEP_2.2]
RAZORPAY_KEY_SECRET = [YOUR_TEST_SECRET_FROM_STEP_2.2]
```

### 3.2 Test Payment Flow
1. Your frontend should now show "Pay with UPI"
2. Click it
3. Enter test UPI ID: `success@razorpay` (for testing)
4. Select any bank
5. Backend verifies payment ✅

### 3.3 Test Payment IDs
Use these for testing without real payment:

```
Test Success (UPI):     success@razorpay
Test Failure (UPI):     failed@razorpay
Test Pending (UPI):     pending@razorpay
```

---

## Phase 4: Webhook Configuration (Test Mode)

### 4.1 Add Webhook
This confirms payments in your backend.

1. Go to **Settings** → **Webhooks**
2. Click **Add New Webhook**
3. Enter webhook URL:
   ```
   https://YOUR_RENDER_URL/api/webhook/razorpay
   ```
4. Select these events:
   - ☑ payment.authorized
   - ☑ payment.failed
5. Click **Create**
6. You'll see **Webhook Secret**
7. Update Render env var:
   ```
   RAZORPAY_WEBHOOK_SECRET = [Your webhook secret]
   ```

---

## Phase 5: Go Live

When you're ready for real money:

### 5.1 KYC Verification (if not already done)
1. Go to **Settings** → **Profile**
2. Make sure KYC shows **Verified** ✅

### 5.2 Request Live Mode
1. Go to **Settings** → **Account**
2. Look for "Enable Live Mode" button
3. Click it
4. Razorpay will review (usually instant)
5. You'll get confirmation email

### 5.3 Get Live API Keys
1. Go to **Settings** → **API Keys**
2. Switch to **Live** mode (toggle at top)
3. You'll see:
   ```
   Key ID:     rzp_live_ABC123DEF456...
   Key Secret: Live_XYZ789ABC123DEF...
   ```
4. Copy both

### 5.4 Update Render
1. Go to Render Dashboard
2. Find your deployed service
3. Go to **Environment** tab
4. Update:
   ```
   RAZORPAY_KEY_ID     = [YOUR_LIVE_KEY_ID]
   RAZORPAY_KEY_SECRET = [YOUR_LIVE_SECRET]
   ```
5. Save & redeploy (automatic)

### 5.5 Update Webhook Secret (Live Mode)
1. Go to **Settings** → **Webhooks**
2. Add new webhook for live mode (or update existing)
3. Get the live webhook secret
4. Update Render:
   ```
   RAZORPAY_WEBHOOK_SECRET = [Your live webhook secret]
   ```

### 5.6 You're Live!
✅ Now Razorpay processes real UPI payments to your account

---

## Timeline

| Phase | Time | Action |
|-------|------|--------|
| Create Account | 5 min | Sign up form |
| KYC Verification | 10 min | Upload documents |
| Get Test Keys | 2 min | API Keys page |
| Deploy to Render | 3 min | Add env vars |
| Test Payment | 5 min | Book session via UPI |
| **Total Testing** | **25 min** | Ready to accept test payments |
| --- | --- | --- |
| Enable Live Mode | 2 min | Request approval (instant) |
| Get Live Keys | 2 min | Switch to Live tab |
| Update Render | 2 min | Change env vars |
| Update Webhooks | 2 min | Get live secret |
| **Go Live** | **8 min** | Ready to accept real payments |

---

## International Payments

Razorpay supports international payments via:
- **Cards** (Visa, Mastercard, Amex)
- **Wallets** (Apple Pay, Google Pay)
- **Bank transfers** (in some countries)

To enable, no extra setup needed - it's automatic when you go live!

---

## Troubleshooting

### "Invalid Key ID"
- ❌ Wrong credentials
- ✅ Copy-paste again from API Keys page
- ✅ Make sure it's the full ID (starts with rzp_test or rzp_live)

### "Payment failed: Webhook signature mismatch"
- ❌ Wrong webhook secret
- ✅ Get it from Settings → Webhooks
- ✅ Make sure you update RAZORPAY_WEBHOOK_SECRET

### "KYC not verified"
- ❌ Documents rejected
- ✅ Go to Settings → Profile
- ✅ Check rejection reason
- ✅ Resubmit with correct documents

### Still need help?
See: **WEBHOOK_CONFIGURATION.md** for detailed webhook setup

---

## Security Notes

✅ **DO:**
- Keep Key Secret safe (like a password)
- Never commit it to GitHub
- Only put it in Render environment variables
- Verify webhook signature in backend (we do this for you)

❌ **DON'T:**
- Share Key Secret in chat or email
- Put it in code files
- Use it in frontend code (only backend!)

---

## What's Next?

1. ✅ Follow Steps 1-2 above to get test credentials
2. ✅ Add them to Render (Step 3)
3. ✅ Test a payment (Step 3.2)
4. ✅ Later: Get live credentials and go live (Step 5)

**Estimated time: 30 minutes to first test payment!**
(Most time is KYC verification - can be instant to 30 min)
