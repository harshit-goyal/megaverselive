# Payment Setup - Complete Guide

## Quick Overview

Your platform accepts payments from TWO sources:

| Payment Method | Region | Setup Time | Guide |
|---|---|---|---|
| **UPI (Razorpay)** | India | 30 min | RAZORPAY_SETUP_COMPLETE.md |
| **PayPal** | International | 20 min | PAYPAL_SETUP_COMPLETE.md |

Both can run simultaneously! Customers see both options at checkout.

---

## The Path Forward (Recommended Order)

### Option A: Go Razorpay First (Recommended for India market)
1. ✅ Deploy backend to Render (5 min) - see READY_NOW.md
2. 🔄 Set up Razorpay (30 min) - follow RAZORPAY_SETUP_COMPLETE.md
3. ✅ Test UPI payment (5 min)
4. 🔄 Set up PayPal (20 min) - follow PAYPAL_SETUP_COMPLETE.md
5. ✅ Test PayPal payment (5 min)
6. 🚀 Go live with both (2 min)

**Total time: ~90 minutes to full dual payment system**

### Option B: Go PayPal First (Recommended for international market)
1. ✅ Deploy backend to Render (5 min) - see READY_NOW.md
2. 🔄 Set up PayPal (20 min) - follow PAYPAL_SETUP_COMPLETE.md
3. ✅ Test PayPal payment (5 min)
4. 🔄 Set up Razorpay (30 min) - follow RAZORPAY_SETUP_COMPLETE.md
5. ✅ Test UPI payment (5 min)
6. 🚀 Go live with both (2 min)

**Total time: ~90 minutes to full dual payment system**

---

## Step-by-Step Timeline

```
MINUTE 0-5:     Deploy to Render (READY_NOW.md)
                └─ Backend live but no payments yet

MINUTE 5-35:    Setup Payment Method #1
                ├─ Option A: Razorpay (includes 10 min KYC)
                └─ Option B: PayPal (faster)

MINUTE 35-40:   Test Payment Method #1
                └─ Book a test session

MINUTE 40-60:   Setup Payment Method #2
                ├─ Option A: PayPal (if did Razorpay first)
                └─ Option B: Razorpay (if did PayPal first)

MINUTE 60-65:   Test Payment Method #2
                └─ Book another test session

MINUTE 65-67:   Go Live with Production Credentials
                ├─ Update Razorpay keys
                ├─ Update PayPal keys
                └─ Redeploy

MINUTE 67:      🎉 YOU'RE LIVE WITH DUAL PAYMENTS!
```

---

## What Customers Will See

### At Checkout
```
┌─────────────────────────────────┐
│  How do you want to pay?        │
├─────────────────────────────────┤
│  ○ Pay with UPI (Razorpay)     │  ← India customers prefer this
│  ○ Pay with PayPal             │  ← International customers use this
└─────────────────────────────────┘
```

### After Clicking "Pay"
- **UPI path**: Opens Razorpay checkout, customer enters UPI ID
- **PayPal path**: Redirects to PayPal, customer logs in

Both are secure and verified on your backend. ✅

---

## Current Status

| Component | Status | Location |
|-----------|--------|----------|
| Database | ✅ Live on Azure | megaverse-db.postgres.database.azure.com |
| Backend API | ✅ Ready to deploy | backend/index.js (550+ lines) |
| Razorpay integration | ✅ Built in | Ready for credentials |
| PayPal integration | ✅ Built in | Ready for credentials |
| Webhooks (security) | ✅ Built in | Signature verification for both |
| Frontend | ⏳ Update needed | Add payment modal HTML (template provided) |

---

## Environment Variables Needed

### From Azure Database (Already have)
```
DB_HOST              = megaverse-db.postgres.database.azure.com
DB_USER              = dbadmin@megaverse-db
DB_PASSWORD          = !_E}#3!oA7p+DG?W
DB_NAME              = bookings
DB_PORT              = 5432
```

### From Razorpay (Step 1 of setup)
```
RAZORPAY_KEY_ID      = [Get from API Keys page]
RAZORPAY_KEY_SECRET  = [Get from API Keys page]
```

### From PayPal (Step 2 of setup)
```
PAYPAL_CLIENT_ID     = [Get from Developer Dashboard]
PAYPAL_CLIENT_SECRET = [Get from Developer Dashboard]
PAYPAL_API_URL       = https://api.sandbox.paypal.com (test) or https://api.paypal.com (live)
```

### Other
```
FRONTEND_URL         = https://megaverselive.netlify.app
```

---

## Security Checklist

Before going live, verify:

- ✅ All credentials in Render environment (not in code)
- ✅ .env file excluded from git (.gitignore has it)
- ✅ Using test credentials during testing
- ✅ Webhook secrets configured in both payment dashboards
- ✅ HTTPS enforced (Render provides it automatically)
- ✅ Backend validates webhook signatures (code does this)

---

## Testing Checklist

During test phase, verify:

- ✅ UPI payment completes (use test ID: success@razorpay)
- ✅ PayPal payment completes (use sandbox account)
- ✅ Booking created in database
- ✅ Payment recorded in database
- ✅ Confirmation email sent (if enabled)
- ✅ Webhook received (check Render logs)

---

## Going Live Checklist

Before accepting real payments, verify:

- ✅ KYC complete for both payment providers
- ✅ Live credentials obtained (not test credentials)
- ✅ PAYPAL_API_URL updated to production URL
- ✅ Webhook secrets updated to live secrets
- ✅ Test payment processed successfully
- ✅ Confirm funds appear in your account

---

## Helpful Links

| Task | Link |
|------|------|
| Setup Razorpay | https://razorpay.com/sign-up |
| Razorpay Dashboard | https://dashboard.razorpay.com |
| Setup PayPal | https://www.paypal.com/signin |
| PayPal Developer | https://developer.paypal.com |
| Render Dashboard | https://dashboard.render.com |

---

## Still Have Questions?

| Topic | Document |
|-------|----------|
| Razorpay step-by-step | **RAZORPAY_SETUP_COMPLETE.md** |
| PayPal step-by-step | **PAYPAL_SETUP_COMPLETE.md** |
| Webhook configuration | **WEBHOOK_CONFIGURATION.md** |
| API endpoints | **API_ENDPOINTS_DUAL.md** |
| Deployment | **DEPLOY_NOW.md** or **READY_NOW.md** |

---

## Next Steps

### NOW:
1. Read READY_NOW.md
2. Deploy to Render

### THEN (choose one):
3. Follow RAZORPAY_SETUP_COMPLETE.md OR PAYPAL_SETUP_COMPLETE.md
4. Test first payment method

### FINALLY:
5. Follow second setup guide
6. Test second payment method
7. Update to live credentials
8. Go live! 🚀

**You're ready. Start with READY_NOW.md**
