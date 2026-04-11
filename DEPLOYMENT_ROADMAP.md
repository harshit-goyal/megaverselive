# Complete Deployment Roadmap

**Your complete guide to deploy Megaverse Live with dual payments (UPI + PayPal)**

This document ties together all deployment steps with links to detailed guides.

---

## System Overview

```
Users visit: https://megaverselive.com
                    ↓
            Choose payment method
            ├─ UPI (India) → Razorpay
            └─ PayPal (International)
                    ↓
            Book a 1:1 session
                    ↓
            Pay securely
                    ↓
            Instant booking confirmation
                    ↓
            Email with session details
```

---

## 8-Step Deployment Roadmap

### Step 1: Get Razorpay Credentials (5 min)
**Goal:** Set up UPI payments for India customers

**Detailed Guide:** See `PAYMENT_SETUP.md` → "Razorpay Setup" section

**What to do:**
1. Go to https://razorpay.com
2. Sign up with business email
3. Complete KYC verification
4. Get API Key ID and Secret
5. **Save:** Key ID and Secret (you'll need these)

**After completion:**
- ✅ Have Razorpay Key ID
- ✅ Have Razorpay Key Secret
- ⏳ Move to Step 2

---

### Step 2: Get PayPal Developer Credentials (2 min)
**Goal:** Set up payments for international customers

**Detailed Guide:** See `PAYMENT_SETUP.md` → "PayPal Setup" section

**What to do:**
1. Go to https://developer.paypal.com
2. Sign in with your PayPal Business account
3. Go to Apps & Credentials
4. Click Sandbox tab (for testing)
5. Get Client ID and Secret
6. **Save:** Client ID and Secret

**After completion:**
- ✅ Have PayPal Client ID
- ✅ Have PayPal Secret
- ⏳ Move to Step 3

---

### Step 3: Get Gmail App Password (2 min)
**Goal:** Enable automated confirmation emails

**Detailed Guide:** See `PAYMENT_SETUP.md` → "Gmail App Password" section

**What to do:**
1. Go to https://myaccount.google.com/apppasswords
2. Select Gmail and your device
3. Generate app password
4. **Save:** 16-character password

**After completion:**
- ✅ Have Gmail app password
- ✅ Have all 3 credentials needed
- ⏳ Move to Step 4

---

### Step 4: Deploy Backend to Render (5 min + 2-3 min deployment)
**Goal:** Get backend API live and accessible

**Detailed Guide:** See `RENDER_DEPLOYMENT_GUIDE.md`

**Quick summary:**
1. Go to https://render.com
2. Sign up with GitHub
3. Create Web Service
4. Select `megaverselive` repo
5. Configure:
   - Name: `megaverse-api`
   - Root: `backend`
   - Build: `npm install`
   - Start: `npm start`
6. Add 13 environment variables (all credentials + database)
7. Click "Create Web Service"
8. Wait for deployment (2-3 min)

**Key variables to add:**
```
DB_HOST = megaverse-db.postgres.database.azure.com
DB_PORT = 5432
DB_USER = dbadmin
DB_PASSWORD = (Azure password)
DB_NAME = megaverse_db
RAZORPAY_KEY_ID = (from Step 1)
RAZORPAY_KEY_SECRET = (from Step 1)
PAYPAL_CLIENT_ID = (from Step 2)
PAYPAL_SECRET = (from Step 2)
EMAIL_USER = harshit-goyal@hotmail.com
EMAIL_PASSWORD = (Gmail password from Step 3)
FRONTEND_URL = https://megaverselive.com
NODE_ENV = production
```

**After completion:**
- ✅ Backend deployed on Render
- ✅ Got API URL: `https://megaverse-api-xxxxx.onrender.com`
- ✅ Health check working
- ⏳ Move to Step 5

---

### Step 5: Configure Webhooks (5 min)
**Goal:** Connect payment providers to backend

**Detailed Guide:** See `WEBHOOK_CONFIGURATION.md`

**Razorpay Webhook:**
1. Go to https://dashboard.razorpay.com
2. Settings → Webhooks → Add Webhook
3. URL: `https://megaverse-api-xxxxx.onrender.com/api/webhook/razorpay`
4. Events: `payment.authorized`, `payment.failed`
5. Create

**PayPal Webhook:**
1. Go to https://developer.paypal.com/dashboard
2. Apps & Credentials → Webhooks → Create Webhook
3. URL: `https://megaverse-api-xxxxx.onrender.com/api/webhook/paypal`
4. Event: `CHECKOUT.ORDER.COMPLETED`
5. Create

**After completion:**
- ✅ Razorpay webhook configured
- ✅ PayPal webhook configured
- ✅ Both webhooks active
- ⏳ Move to Step 6

---

### Step 6: Update Frontend (3 min)
**Goal:** Add payment UI to booking page

**Detailed Guide:** See `FRONTEND_PAYMENT_INTEGRATION.md`

**What to update in `index.html`:**

1. Add payment SDKs to `<head>`:
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID"></script>
```

2. Add booking modal (copy from guide)
3. Add JavaScript integration code (copy from guide)
4. Replace Render URL in JavaScript
5. Replace PayPal Client ID in SDK script

**After completion:**
- ✅ Booking modal with payment options
- ✅ UPI option functional
- ✅ PayPal option functional
- ✅ Confirmation emails configured
- ⏳ Move to Step 7

---

### Step 7: Test Both Payment Methods (5 min)
**Goal:** Verify everything works before going live

**Sandbox Testing:**

**Test UPI:**
1. Visit https://megaverselive.com
2. Click "Book a 1:1 Session"
3. Fill form (any name/email)
4. Select "UPI (₹ For India)"
5. Click "Proceed to Payment"
6. In Razorpay popup, use UPI ID: `success@razorpay`
7. Verify:
   - ✅ Payment successful message
   - ✅ Confirmation email received
   - ✅ Booking in database

**Test PayPal:**
1. Same as above but select "PayPal"
2. Log in with PayPal sandbox account (created auto)
3. Complete payment
4. Verify:
   - ✅ Payment successful message
   - ✅ Confirmation email received
   - ✅ Booking in database

**After completion:**
- ✅ UPI payments working
- ✅ PayPal payments working
- ✅ Emails sending
- ✅ Database updating
- ⏳ Move to Step 8

---

### Step 8: Switch to Production (2 min)
**Goal:** Go live with real money

**Razorpay Switch:**
1. Go to Razorpay Dashboard → Settings → API Keys
2. Switch from Sandbox to Live mode
3. Copy Live Key ID and Secret
4. Go to Render Dashboard
5. Update env vars:
   - `RAZORPAY_KEY_ID` = Live Key ID
   - `RAZORPAY_KEY_SECRET` = Live Secret
6. Service auto-restarts

**PayPal Switch:**
1. Go to PayPal Developer Dashboard
2. Switch from Sandbox to Live tab
3. Copy Live Client ID and Secret
4. Go to Render Dashboard
5. Update env vars:
   - `PAYPAL_CLIENT_ID` = Live ID
   - `PAYPAL_SECRET` = Live Secret
   - `PAYPAL_API` = `https://api-m.paypal.com` (remove sandbox)
6. Service auto-restarts

**After completion:**
- ✅ Razorpay live credentials active
- ✅ PayPal live credentials active
- ✅ Ready to accept real payments!

---

## Quick Reference Links

| Step | What | Link | Time |
|------|------|------|------|
| 1 | Get Razorpay | `PAYMENT_SETUP.md` | 5 min |
| 2 | Get PayPal | `PAYMENT_SETUP.md` | 2 min |
| 3 | Gmail Password | `PAYMENT_SETUP.md` | 2 min |
| 4 | Deploy Render | `RENDER_DEPLOYMENT_GUIDE.md` | 5+3 min |
| 5 | Webhooks | `WEBHOOK_CONFIGURATION.md` | 5 min |
| 6 | Frontend | `FRONTEND_PAYMENT_INTEGRATION.md` | 3 min |
| 7 | Test | This guide | 5 min |
| 8 | Go Live | This guide | 2 min |

---

## Troubleshooting Guide

### Issue: Razorpay KYC taking too long

**Solution:**
- KYC usually takes 5-10 minutes
- Check email for approval notification
- If "Verification Pending", wait or contact Razorpay support
- You can use Sandbox mode for testing while waiting

### Issue: Backend deployment failed

**Solution:**
1. Check Render logs for specific error
2. Most common: wrong env var or DB password
3. Go to Settings → fix env vars
4. Redeploy: "Deploy latest commit"

### Issue: Webhook not firing

**Solution:**
1. Verify webhook URL has no typos
2. Test webhook from provider dashboard
3. Check Render logs for incoming requests
4. Verify backend is running (not crashed)

### Issue: Payment goes through but booking doesn't update

**Solution:**
1. Usually means webhook didn't fire
2. Check webhook configuration (see Issue above)
3. Verify database credentials
4. Check backend logs for errors

### Issue: Emails not sending

**Solution:**
1. Verify Gmail app password is correct (not main password)
2. Check EMAIL_USER env var is set
3. Verify customer email is correct in form
4. Check Render logs for email service errors

---

## Success Criteria

After all 8 steps, you should have:

- [ ] Backend deployed on Render and live
- [ ] API health endpoint responding
- [ ] Razorpay credentials configured (live mode)
- [ ] PayPal credentials configured (live mode)
- [ ] Webhooks configured and tested
- [ ] Frontend booking modal updated
- [ ] UPI payments working
- [ ] PayPal payments working
- [ ] Confirmation emails sending
- [ ] Test bookings in database
- [ ] Ready to accept real payments!

---

## After Going Live

### Daily Tasks
- Monitor bookings in database
- Check payment notifications from providers
- Verify confirmation emails arrive

### Weekly Tasks
- Review payment transactions
- Check for any failed payments
- Monitor API performance

### Monthly Tasks
- Review earnings
- Update session pricing if needed
- Check provider fee structures

---

## Support Resources

### Getting Help
1. Check relevant guide first (see links above)
2. Check troubleshooting section
3. Contact provider support:
   - Razorpay: https://razorpay.com/support
   - PayPal: https://www.paypal.com/in/webapps/helpcenter
   - Render: https://render.com/support

### Important Files
- Backend: `/backend/index.js`
- Database: `/backend/schema.sql`
- Environment template: `/backend/.env`
- All guides: Root directory (*.md files)

### GitHub Repository
- Repository: https://github.com/harshit-goyal/megaverselive
- All code committed and documented
- Ready for production deployment

---

## Timeline Summary

| Phase | Steps | Time | Status |
|-------|-------|------|--------|
| Credential Collection | 1-3 | 9 min | ⏳ User action |
| Backend Deployment | 4-5 | 15 min | ⏳ User action |
| Frontend Integration | 6 | 3 min | ⏳ User action |
| Testing | 7 | 5 min | ⏳ User action |
| Production | 8 | 2 min | ⏳ User action |
| **Total** | **8 steps** | **~30-45 min** | **Ready!** |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    megaverselive.com                        │
│                  (Netlify - Frontend)                       │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Payment Modal (UPI + PayPal selection)              │  │
│  │  Customer form (name, email, phone, topic, time)     │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────┬─────────────────┬────────────────────────┘
                 │                 │
         ┌───────▼───┐    ┌────────▼─────┐
         │ Razorpay  │    │    PayPal    │
         │  (UPI)    │    │ (International)
         └───────┬───┘    └────────┬─────┘
                 │                 │
                 └────────┬────────┘
                          │
         ┌────────────────▼──────────────────┐
         │   Render Backend (Node.js)        │
         │   (megaverse-api.onrender.com)    │
         │                                   │
         │  ┌──────────────────────────┐    │
         │  │ POST /api/book           │    │
         │  │ POST /api/razorpay/*     │    │
         │  │ POST /api/paypal/*       │    │
         │  │ POST /api/webhook/*      │    │
         │  └──────────────────────────┘    │
         └────────────────┬──────────────────┘
                          │
         ┌────────────────▼──────────────────┐
         │  PostgreSQL Database (Azure)      │
         │  (megaverse-db.postgres....)      │
         │                                   │
         │  Tables:                          │
         │  - mentors                        │
         │  - time_slots                     │
         │  - bookings                       │
         │  - payments                       │
         │  - emails_sent                    │
         └───────────────────────────────────┘
```

---

## You're Ready to Deploy! 🚀

Start with **Step 1:** Get Razorpay Credentials

Follow each step one by one using the detailed guides. By the end, you'll have:
- ✅ Dual payment system (UPI + PayPal)
- ✅ Live booking platform
- ✅ Automated confirmations
- ✅ Professional payment processing

**Total time: 30-45 minutes**

Let's go live! 🎉

