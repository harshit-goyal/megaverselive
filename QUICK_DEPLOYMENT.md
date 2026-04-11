# 🚀 One-Command Deployment

We've automated everything. Follow this simple process.

---

## Option 1: Automated Script (Easiest) ⭐

Run this on your computer:

```bash
cd /path/to/megaverselive
bash deploy-helper.sh
```

This script will:
1. Ask for your Razorpay credentials (Key ID + Secret)
2. Ask for your PayPal credentials (Client ID + Secret)
3. Ask for your Azure database details
4. Display exactly what to paste into Render
5. Keep everything secure (credentials never leave your computer)

---

## Option 2: Manual Deployment

### Step 1: Go to Render
https://render.com → Sign up → Click "New Web Service"

### Step 2: Connect GitHub
- Choose "Connect your GitHub repo"
- Select `megaverselive`

### Step 3: Fill in the form

| Field | Value |
|-------|-------|
| **Name** | `megaverselive-backend` |
| **Branch** | `main` |
| **Build Command** | `npm install` |
| **Start Command** | `node backend/index.js` |
| **Runtime** | `Node` |
| **Plan** | `Free` |

### Step 4: Add Environment Variables

Click "Add Environment Variable" for each:

```
DB_HOST                = [Your Azure DB host]
DB_USER                = [Your Azure DB username]
DB_PASSWORD            = [Your Azure DB password]
DB_NAME                = bookings
DB_PORT                = 5432
RAZORPAY_KEY_ID        = [Your Razorpay Key ID]
RAZORPAY_KEY_SECRET    = [Your Razorpay Secret]
PAYPAL_CLIENT_ID       = [Your PayPal Client ID]
PAYPAL_CLIENT_SECRET   = [Your PayPal Secret]
PAYPAL_API_URL         = https://api.sandbox.paypal.com
FRONTEND_URL           = https://megaverselive.netlify.app
```

### Step 5: Deploy

Click "Create Web Service" and wait 2-3 minutes.

You'll see your live URL like: `https://megaverselive-backend.onrender.com`

---

## Next Steps After Deployment

1. **Note your Render URL** (e.g., `https://megaverselive-backend.onrender.com`)
2. **Configure webhooks** → Follow `WEBHOOK_CONFIGURATION.md`
3. **Update frontend** → Follow `FRONTEND_PAYMENT_INTEGRATION.md`
4. **Test payments** → Book via UPI and PayPal
5. **Go live** → Switch to production credentials

---

## ✅ You're Deployed!

Once Step 5 is complete:
- ✅ Backend is live on Render
- ✅ Database connected
- ✅ Ready for webhooks
- ✅ Ready for payments

**Estimated remaining time: 15 minutes to full deployment**

---

## 🆘 Troubleshooting

### "Build failed" on Render
- Check: Did `npm install` work locally?
- Run: `npm install` in your repo folder
- Push: `git push` to GitHub
- Retry deployment on Render

### "Environment variables not working"
- Check: Spelling of each variable name (case-sensitive)
- Check: No extra spaces before/after values
- Restart service on Render (click the three dots menu)

### "Database connection failed"
- Check: DB_HOST has no extra text
- Check: DB_PORT is exactly `5432`
- Check: Your Azure DB still exists
- Test: Can you connect locally? → `psql -h [HOST] -U [USER] -d bookings`

### "Still stuck?"
- All debugging steps in `WEBHOOK_CONFIGURATION.md`
- API reference in `API_ENDPOINTS_DUAL.md`

---

## 🎯 Timeline

- **0-5 min:** Run deploy script (or fill Render form)
- **5-10 min:** Wait for Render deployment
- **10-15 min:** Configure webhooks
- **15-20 min:** Test payments
- **20-22 min:** Go live

**Total: ~22 minutes from now to production!**

---

## 💾 Your Credentials Are Safe

Using `deploy-helper.sh`:
- ✅ Credentials never sent to me
- ✅ Credentials never stored in chat
- ✅ Go directly to Render (encrypted)
- ✅ You control everything

---

Ready? Run:
```bash
bash deploy-helper.sh
```

Or go to https://render.com and follow "Option 2" above.

**You're 10 minutes away from a live backend! 🚀**
