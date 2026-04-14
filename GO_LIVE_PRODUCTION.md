# 🚀 PRODUCTION GO-LIVE GUIDE - Step-by-Step

## Your Current Status

✅ **Already Complete:**
- Backend code deployed to Render
- Database live on Azure
- All 3 payment systems integrated (UPI, PayPal, Email verification)
- Webhooks configured for sandbox
- Testing done in sandbox mode

⚠️ **What's Left:**
- Switch to LIVE payment credentials (your accounts only)
- Update 2 files with production keys
- Push to trigger auto-deployment

---

## 📋 Pre-Go-Live Checklist

Before proceeding, you should have:

- ✅ Tested at least 1 UPI payment (Razorpay sandbox)
- ✅ Tested at least 1 PayPal payment (sandbox)
- ✅ Verified bookings appear in database
- ✅ Confirmed emails are sending
- ✅ Checked Render logs for errors

If you haven't done this, **test first** using the DEPLOYMENT_CHECKLIST_FINAL.md guide.

---

## 🔐 STEP 1: Get Your Production Credentials (5 min)

### A. Razorpay Live Credentials

1. Open https://dashboard.razorpay.com
2. **Top right corner**: Look for "Test Mode" toggle
3. **Switch to "Live Mode"** (turn the toggle ON)
   - ⚠️ You may need to complete KYC verification
   - If KYC not done: Complete it first, it takes 5-15 min
4. Go to **Settings** → **API Keys**
5. Copy:
   - **Key ID** (starts with `rzp_live_...`)
   - **Key Secret** (long string)

**Save these in a safe place** (don't share with anyone!)

### B. PayPal Live Credentials

1. Open https://developer.paypal.com
2. Click **Apps & Credentials**
3. **Switch to "Live" tab** (top right)
4. Under your Business App, click the **View** button
5. Copy:
   - **Client ID**
   - **Client Secret**

**Save these in a safe place** (don't share with anyone!)

---

## 💻 STEP 2: Update Your Files (3 min)

You need to update 2 files with your production credentials:

### A. Update `backend/index.js` (Environment Variables)

Your backend uses environment variables. These are set in Render dashboard, but let me show you what they are:

**Current values (Sandbox):**
```javascript
RAZORPAY_KEY_ID = rzp_test_xxxxx
RAZORPAY_KEY_SECRET = test_secret_xxxxx
PAYPAL_CLIENT_ID = AXXXxxxxx
PAYPAL_CLIENT_SECRET = EYXXXxxxxx
PAYPAL_API_URL = https://api.sandbox.paypal.com
```

**Production values (What to change to):**
```javascript
RAZORPAY_KEY_ID = rzp_live_xxxxx (from Step 1.A)
RAZORPAY_KEY_SECRET = live_secret_xxxxx (from Step 1.A)
PAYPAL_CLIENT_ID = AXXXxxxxx (from Step 1.B)
PAYPAL_CLIENT_SECRET = EYXXXxxxxx (from Step 1.B)
PAYPAL_API_URL = https://api.paypal.com (remove "sandbox")
```

### B. Update `index.html` (Frontend Keys)

1. Open `index.html`
2. Search for: `RAZORPAY_KEY_ID = 'rzp_test`
3. Replace with your live key: `RAZORPAY_KEY_ID = 'rzp_live_xxxxx'`
4. Search for: `PAYPAL_CLIENT_ID = 'AXX`
5. Replace with your live key: `PAYPAL_CLIENT_ID = 'AXXXxxxxx'`

**Note:** Only change the KEYS, not the API URLs or other settings.

---

## 🔧 STEP 3: Update Render Environment Variables (2 min)

This is where the backend actually reads your credentials:

1. Open https://dashboard.render.com
2. Select service: **megaverselive-backend**
3. Click **Environment** tab
4. Find each variable and update:
   - `RAZORPAY_KEY_ID` → Paste your live Key ID
   - `RAZORPAY_KEY_SECRET` → Paste your live Key Secret
   - `PAYPAL_CLIENT_ID` → Paste your live Client ID
   - `PAYPAL_CLIENT_SECRET` → Paste your live Client Secret
   - `PAYPAL_API_URL` → Change from `https://api.sandbox.paypal.com` to `https://api.paypal.com`
5. Click **Save** at bottom
6. **Render will auto-redeploy** (takes 2-3 min)

✅ **When deployment is done**, your backend will use live credentials.

---

## 📤 STEP 4: Commit & Push Your Frontend Changes (1 min)

```bash
cd /Users/harshit/megaverselive

# Check what changed
git status

# Stage the changes
git add index.html

# Commit
git commit -m "Switch to production payment credentials - Go Live!"

# Push to GitHub
git push origin main
```

✅ **Netlify will auto-deploy** your frontend (takes 1-2 min)

---

## 🎯 STEP 5: Verify Everything is Live (5 min)

### Check 1: Backend is Using Live Mode

1. Open https://dashboard.render.com
2. Select **megaverselive-backend**
3. Click **Logs** tab
4. Scroll down to see recent logs
5. You should see: `✅ Booking reminder scheduler started`
   - This means backend is running with your new env vars

### Check 2: Test a Live Payment

1. Go to https://megaverselive.netlify.app
2. Fill in booking form:
   - Name: `Test Payment`
   - Email: Your email
   - Phone: Any number
   - Mentor: Any mentor
   - Date: Any future date
3. Click **Book**
4. Try UPI or PayPal payment
5. **Complete the payment** (now charging REAL money)
6. Check your Razorpay/PayPal dashboard to confirm

### Check 3: Verify Booking in Database

```bash
# Connect to your Azure DB and check:
SELECT * FROM bookings ORDER BY created_at DESC LIMIT 1;

# You should see your test booking with payment_status = 'completed'
```

---

## ⚠️ Important Reminders

1. **No More Sandbox Testing**
   - Any payments made now will be REAL
   - Razorpay/PayPal will actually transfer money to your account
   - Test payments will no longer work - they'll fail

2. **Verify Payment Settings**
   - Razorpay: Ensure bank account is linked for transfers
   - PayPal: Ensure live account is active

3. **Monitor Your First Payments**
   - Check Razorpay dashboard for incoming payments
   - Check PayPal for received payments
   - Settlement usually happens within 24-48 hours

4. **Keep Credentials Secure**
   - Never commit live keys to GitHub
   - Never share in public channels
   - Render stores them safely in encrypted environment

---

## 📞 Troubleshooting

### Payment Still Failing?

1. Check Render logs: https://dashboard.render.com → Logs
2. Look for error messages
3. Compare with `WEBHOOK_CONFIGURATION.md`
4. Check if credentials were pasted correctly (no extra spaces)

### Payment Went Through But Booking Not Saved?

1. Check database logs
2. Ensure webhook is configured correctly
3. See `WEBHOOK_CONFIGURATION.md` for webhook setup

### Need to Go Back to Sandbox?

1. Revert credentials to test keys in Render
2. Update `index.html` with test keys
3. Push to GitHub
4. Render will auto-deploy

---

## ✅ You're Done!

Once you complete these steps, your platform is **LIVE and TAKING REAL PAYMENTS**.

**Timeline**: ~15-20 minutes total

**Next**: Monitor payments and celebrate! 🎉

---

## Quick Reference

| Step | Time | Action |
|------|------|--------|
| 1 | 5 min | Get production credentials from Razorpay & PayPal |
| 2 | 3 min | Update index.html with live keys |
| 3 | 2 min | Update Render environment variables |
| 4 | 1 min | Commit & push to GitHub |
| 5 | 5 min | Verify everything works |
| **Total** | **~16 min** | **You're Live!** |

