# Complete PayPal Setup Guide

## Overview
PayPal handles international payments. You'll use sandbox (test) credentials for testing, then switch to live credentials when you want real money.

---

## Phase 1: Create PayPal Business Account

### 1.1 Sign Up
1. Go to: **https://www.paypal.com**
2. Click **Sign Up**
3. Choose **Business Account**
4. Enter email, password, business info
5. Verify email
6. ✅ You now have a PayPal Business Account

---

## Phase 2: Get Sandbox Credentials (for testing)

### 2.1 Go to Developer Dashboard
1. Navigate to: **https://developer.paypal.com**
2. Click **Log In**
3. Use your PayPal business account credentials
4. You'll see the **Dashboard**

### 2.2 Create a Sandbox Account
This is a fake account for testing (separate from your real account).

1. In left sidebar, click **Accounts**
2. Click **Create Account**
3. Select **Business** account type
4. Click **Create**
5. You'll see a sandbox business account created

### 2.3 Get Sandbox Credentials
1. Go to **Dashboard** → **Apps & Credentials** (top menu)
2. Make sure **Sandbox** tab is selected (not Live)
3. Look for "REST API apps" section
4. If you don't see one, click **Create App**:
   - Name: "Megaverse Live"
   - Type: Merchant
   - Click **Create**
5. Click on the app name to view credentials
6. You'll see:
   ```
   Client ID:     ABC123DEF456GHI789...
   Secret:        XYZ789ABC123DEF456...
   ```
7. **Copy both and save them** ✅

---

## Phase 3: Add to Render Deployment

### 3.1 Environment Variables
When deploying to Render, add these 3 variables:

```
PAYPAL_CLIENT_ID     = [YOUR_CLIENT_ID_FROM_STEP_2.3]
PAYPAL_CLIENT_SECRET = [YOUR_SECRET_FROM_STEP_2.3]
PAYPAL_API_URL       = https://api.sandbox.paypal.com
```

**⚠️ IMPORTANT: PAYPAL_API_URL is NOT in PayPal dashboard!**
- It's a hardcoded URL that your backend uses
- For testing: `https://api.sandbox.paypal.com`
- For production: `https://api.paypal.com` (change later)
- Just copy-paste the value above

### 3.2 Test Payment Flow
1. Your frontend should now show "Pay with PayPal"
2. Click it
3. It redirects to PayPal sandbox login
4. Use the sandbox business account you created in Step 2.2
5. Approve payment
6. Backend verifies it ✅

---

## Phase 4: Go Live (Later)

When you're ready for real money:

### 4.1 Get Live Credentials
1. Go to **Dashboard** → **Apps & Credentials**
2. Switch from **Sandbox** tab → **Live** tab
3. You'll see your LIVE credentials:
   ```
   Client ID:     LIVE_ABC123...
   Secret:        LIVE_XYZ789...
   ```
4. Copy both

### 4.2 Update Render
1. Go to Render Dashboard
2. Find your deployed service
3. Go to **Environment** tab
4. Update:
   ```
   PAYPAL_CLIENT_ID     = [YOUR_LIVE_CLIENT_ID]
   PAYPAL_CLIENT_SECRET = [YOUR_LIVE_SECRET]
   PAYPAL_API_URL       = https://api.paypal.com
   ```
   **Note:** Only PAYPAL_API_URL changes from sandbox URL. Copy it exactly as shown.
5. Save & redeploy (automatic)

### 4.3 You're Live!
✅ Now PayPal will process real payments to your account

---

## Timeline

| Phase | Time | Action |
|-------|------|--------|
| Create Business Account | 5 min | Fill signup form |
| Get Sandbox Credentials | 5 min | Developer dashboard |
| Deploy to Render | 3 min | Add env vars |
| Test Payment | 5 min | Book session via PayPal |
| **Total Testing** | **18 min** | Ready to accept test payments |
| --- | --- | --- |
| Get Live Credentials | 2 min | Switch to Live tab |
| Update Render | 2 min | Change env vars |
| **Go Live** | **4 min** | Ready to accept real payments |

---

## Troubleshooting

### "Invalid Client ID"
- ❌ Wrong credentials
- ✅ Copy-paste again from Dashboard
- ✅ Make sure it's the full ID

### "API call failed"
- ❌ Wrong PAYPAL_API_URL
- ✅ For testing: use `https://api.sandbox.paypal.com`
- ✅ For live: use `https://api.paypal.com`

### "Sandbox account not working"
- ❌ Using wrong account to log in
- ✅ Log into your BUSINESS account (the one you created in Step 2.2)
- ✅ NOT your personal PayPal account

### Still need help?
See: **WEBHOOK_CONFIGURATION.md** for PayPal webhook setup (needed for payment confirmation)

---

## Security Notes

✅ **DO:**
- Keep Secret safe (like a password)
- Never commit it to GitHub
- Only put it in Render environment variables

❌ **DON'T:**
- Share Secret in chat or email
- Put it in code files
- Use it in frontend code (only backend!)

---

## What's Next?

1. ✅ Follow Steps 1-2 above to get sandbox credentials
2. ✅ Add them to Render (Step 3)
3. ✅ Test a payment (Step 3.2)
4. ✅ Later: Get live credentials and go live (Step 4)

**Estimated time: 20 minutes to first test payment!**
