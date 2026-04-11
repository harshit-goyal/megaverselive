# ⚡ DEPLOY IN 30 MINUTES - ONE PAGE

## 📋 What You Do Right Now

### STEP 1: Get 3 Credentials (5 min)
1. Stripe Secret Key → https://dashboard.stripe.com/apikeys (copy `sk_test_...`)
2. Gmail App Password → https://myaccount.google.com/apppasswords (copy 16-char code)
3. Stripe Webhook Secret → https://dashboard.stripe.com/webhooks (copy `whsec_...`)

✅ **DONE?** → Go to Step 2

---

### STEP 2: Create Render Account (1 min)
1. Open: https://render.com
2. Click "Get Started"
3. Sign up with GitHub → Authorize

✅ **DONE?** → Go to Step 3

---

### STEP 3: Deploy Service (5 min)
1. Click "New +" in Render
2. Select "Web Service"
3. Choose `megaverselive` repo
4. Fill form:
   - Name: `megaverse-api`
   - Root: `backend`
   - Runtime: `Node`
   - Build: `npm install`
   - Start: `npm start`
5. Click "Create Web Service"
6. **WAIT** for Logs to show "Server running on port 8080" (3-5 min)

✅ **DONE?** → Go to Step 4

---

### STEP 4: Add Credentials to Render (2 min)
While Render builds, go to "Environment" tab and add 12 variables:

```
DB_HOST = megaverse-db.postgres.database.azure.com
DB_PORT = 5432
DB_USER = dbadmin
DB_PASSWORD = !_E}#3!oA7p+DG?W
DB_NAME = megaverse_db
NODE_ENV = production
PORT = 8080
STRIPE_SECRET_KEY = sk_test_... (YOUR KEY)
STRIPE_WEBHOOK_SECRET = whsec_... (YOUR KEY)
FRONTEND_URL = https://megaverselive.com
EMAIL_SERVICE = gmail
EMAIL_USER = harshit-goyal@hotmail.com
EMAIL_PASSWORD = ... (YOUR 16-CHAR CODE)
```

✅ **DONE?** → Go to Step 5

---

### STEP 5: Get Your API URL (1 min)
1. Check Render Logs
2. Note the URL at top: `https://megaverse-api-xxxx.onrender.com`
3. Test it: `curl https://megaverse-api-xxxx.onrender.com/health`
4. Should return: `{"status":"ok"}`

✅ **DONE?** → Go to Step 6

---

### STEP 6: Update DNS at GoDaddy (5 min)
1. Go: https://godaddy.com → My Products → megaverselive.com → Manage → DNS
2. Click "Add Record"
3. Type: CNAME
4. Name: `api`
5. Value: `megaverse-api-xxxx.onrender.com` (from Step 5)
6. TTL: 1 hour
7. Click Save
8. **WAIT 15-30 minutes** for DNS to propagate

✅ **DONE?** → Go to Step 7

---

### STEP 7: Update Website (2 min)
Edit `index.html` and add to `<script>`:

```javascript
const API_URL = 'https://api.megaverselive.com';
const STRIPE_PUBLIC_KEY = 'pk_test_...'; // Get from Stripe dashboard
```

Push to GitHub:
```bash
git add index.html
git commit -m "Add API configuration"
git push origin main
```

Netlify auto-deploys (1-2 min).

✅ **DONE?** → Go to Step 8

---

### STEP 8: Test Booking (3 min)
1. Visit: https://megaverselive.com
2. Book a session
3. Pay with test card: `4242 4242 4242 4242` (any future date, any CVC)
4. Check email: harshit-goyal@hotmail.com
5. Email arrived? **YOU'RE LIVE!** 🎉

✅ **DONE?** → You're finished!

---

## ⏱️ Timeline

| Step | Time | What |
|------|------|------|
| 1 | 5 min | Get credentials |
| 2 | 1 min | Create Render account |
| 3 | 5 min | Deploy service |
| 4 | 2 min | Add environment vars |
| 5 | 1 min | Get API URL |
| 6 | 20 min | Update DNS (+ wait) |
| 7 | 2 min | Update website |
| 8 | 3 min | Test booking |
| **TOTAL** | **30 min** | **You're Live!** |

---

## 🚀 YOU'RE DONE!

Your booking platform is live at: **https://megaverselive.com**

Start accepting sessions and payments! 💰
