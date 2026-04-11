# 🚀 Quick Deployment Checklist - Render

**Time: 15 minutes to go live**

---

## ✅ BEFORE YOU START

- [ ] Stripe Secret Key ready (from https://dashboard.stripe.com/apikeys)
- [ ] Gmail App Password ready (from https://myaccount.google.com/apppasswords)
- [ ] Stripe Webhook Secret ready (optional, from Stripe Webhooks)
- [ ] GitHub account (already have it)
- [ ] GoDaddy account (to update DNS)

---

## 🔴 STEP 1: Get Credentials (5 min)

### A. Stripe Secret Key
- [ ] Go to: https://dashboard.stripe.com/apikeys
- [ ] Copy **Secret key** (starts with `sk_test_`)
- [ ] Paste somewhere safe

### B. Gmail App Password
- [ ] Go to: https://myaccount.google.com/apppasswords
- [ ] If not available: Enable 2FA on Gmail first
- [ ] Generate password for "Mail"
- [ ] Copy 16-char password

### C. Stripe Webhook Secret (Optional)
- [ ] Go to: https://dashboard.stripe.com/webhooks
- [ ] Copy webhook signing secret (starts with `whsec_`)

---

## 🟡 STEP 2: Deploy to Render (5 min auto)

- [ ] Go to: https://render.com
- [ ] Sign up with GitHub → Authorize
- [ ] Click "New +" → "Web Service"
- [ ] Select: `megaverselive` repository
- [ ] Click "Connect"

**Fill form:**
- [ ] Name: `megaverse-api`
- [ ] Root Directory: `backend`
- [ ] Runtime: `Node`
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`
- [ ] Plan: `Free`

- [ ] Click "Create Web Service"
- [ ] Wait for build to complete (watch Logs)

---

## 🟢 STEP 3: Add Environment Variables (2 min)

In Render dashboard → Environment tab:

- [ ] Click "Add Environment Variable" for each:

```
DB_HOST = megaverse-db.postgres.database.azure.com
DB_PORT = 5432
DB_USER = dbadmin
DB_PASSWORD = !_E}#3!oA7p+DG?W
DB_NAME = megaverse_db
NODE_ENV = production
PORT = 8080
STRIPE_SECRET_KEY = sk_test_... (from Step 1A)
STRIPE_WEBHOOK_SECRET = whsec_... (from Step 1C)
FRONTEND_URL = https://megaverselive.com
EMAIL_SERVICE = gmail
EMAIL_USER = harshit-goyal@hotmail.com
EMAIL_PASSWORD = ... (from Step 1B)
```

- [ ] Service auto-redeploys

---

## 🔵 STEP 4: Verify Deployment (1 min)

Check Logs tab for: `Server running on port 8080`

Your service URL: `https://megaverse-api-xxxx.onrender.com`

Test:
```bash
curl https://megaverse-api-xxxx.onrender.com/health
```

Should return: `{"status":"ok",...}`

- [ ] API is responding ✓

---

## 🟣 STEP 5: Update GoDaddy DNS (5 min + wait)

- [ ] Go to: https://godaddy.com
- [ ] My Products → megaverselive.com → Manage → DNS
- [ ] Click "Add Record"
  - [ ] Type: `CNAME`
  - [ ] Name: `api`
  - [ ] Value: `megaverse-api-xxxx.onrender.com` (from Step 4)
  - [ ] TTL: `1 hour`
- [ ] Click Save
- [ ] **Wait 15-30 minutes for DNS to propagate**

Test DNS:
```bash
nslookup api.megaverselive.com
```

Should return an IP address.

- [ ] DNS is working ✓

---

## ⚪ STEP 6: Update Your Website (2 min)

Edit `index.html` (in Netlify or locally):

Add to `<script>` section:
```javascript
const API_URL = 'https://api.megaverselive.com';
const STRIPE_PUBLIC_KEY = 'pk_test_YOUR_KEY_HERE';
```

Get `STRIPE_PUBLIC_KEY` from:
https://dashboard.stripe.com/apikeys (Publishable key)

- [ ] Push to GitHub
- [ ] Netlify auto-deploys

---

## ⭐ STEP 7: Test End-to-End (5 min)

- [ ] Visit: https://megaverselive.com
- [ ] Try to book a session
- [ ] Pay with test card: `4242 4242 4242 4242`
  - [ ] Expiry: Any future date
  - [ ] CVC: Any 3 digits
- [ ] Click Book/Pay
- [ ] Check email: harshit-goyal@hotmail.com
  - [ ] Booking confirmation received ✓
- [ ] Verify in database:
  ```bash
  psql postgresql://dbadmin:!_E}#3!oA7p+DG?W@megaverse-db.postgres.database.azure.com:5432/megaverse_db
  SELECT * FROM bookings;
  ```
  - [ ] Booking appears in database ✓

---

## 🎉 SUCCESS!

All 7 steps done?

- [ ] Backend deployed to Render ✓
- [ ] API responding at api.megaverselive.com ✓
- [ ] Booking system working ✓
- [ ] Payment processed ✓
- [ ] Confirmation email sent ✓
- [ ] Data in database ✓

**YOU'RE LIVE! 🚀**

---

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| Render won't start | Check Logs for errors, verify all env vars |
| API returns 502 | Service still deploying, wait 5 min |
| DNS not resolving | DNS takes 30 min, try again later |
| Email not sending | Use Gmail app password, not Gmail password |
| Payment fails | Use test card 4242 4242 4242 4242 |

---

## 📞 Need Help?

- Read `GO_LIVE_NOW.md` for detailed guide
- Check `RENDER_CHECKLIST.md` for step-by-step
- Review `API_DOCS.md` for API reference

**You've got this! Deploy now!** 💪
