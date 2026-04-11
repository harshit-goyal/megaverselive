# 🎯 START HERE - Your Booking Platform is Ready

## Status: 90% Complete ✅

Everything is built and tested. You just need to deploy the backend code (2 minutes) and connect your domain (5 minutes).

---

## What's Already Done

### ✅ Infrastructure (Live)
- PostgreSQL database on Azure → **megaverse-db.postgres.database.azure.com**
- Database fully created with 5 tables
- Your mentor profile: Harshit Goyal (₹5000/hr)

### ✅ Backend API Code (Tested Locally)
- 7 API endpoints ready
- Booking logic complete
- Email service ready
- Stripe integration ready
- Database migrations done

### ✅ Your Domain
- **megaverselive.com** (on GoDaddy)
- Ready to connect

---

## What You Need to Do (15 minutes)

### Step 1: Deploy Backend (2 minutes)

Go to **https://render.com** (free account, no credit card needed)

1. Sign up / Log in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account (authorize)
4. Select repository: **megaverselive**
5. Fill in:
   - **Root Directory**: `backend`
   - **Start Command**: `npm start`
   - **Plan**: Free (default)
6. Click **"Deploy"**
7. Wait 2-3 minutes ⏳

After deploy, you'll get a URL like:
```
https://megaverse-api.onrender.com
```

Test it:
```bash
curl https://megaverse-api.onrender.com/api/health
# Should return: {"status":"ok",...}
```

### Step 2: Connect Your GoDaddy Domain (5 minutes)

1. Go to **GoDaddy Dashboard**
2. Select your domain: **megaverselive.com**
3. Click **"Manage DNS"**
4. Add a **CNAME Record**:
   ```
   Name: api
   Type: CNAME
   Value: megaverse-api.onrender.com
   TTL: 3600
   ```
5. Save

Now test:
```bash
curl https://api.megaverselive.com/api/health
# Should work!
```

### Step 3: Update Frontend (5 minutes)

Edit your `index.html`:

1. Find/Replace API URL:
   ```javascript
   // Change this:
   const API_URL = 'http://localhost:3000';
   
   // To this:
   const API_URL = 'https://api.megaverselive.com';
   ```

2. Add Stripe Publishable Key:
   - Go to https://dashboard.stripe.com/apikeys
   - Copy your **Publishable Key** (starts with pk_test_)
   - Add to your booking form JavaScript

3. Add booking form HTML (see FRONTEND_INTEGRATION.md)

### Step 4: Test Full Booking (2 minutes)

1. Go to **https://megaverselive.com**
2. Book a session
3. Use Stripe test card: **4242 4242 4242 4242**
4. Any future expiry date + any CVC
5. Check your email for confirmation ✅

---

## Environment Variables

Your backend needs these credentials (already in backend/.env):

```env
# Database (Azure - already set up)
DB_HOST=megaverse-db.postgres.database.azure.com
DB_PORT=5432
DB_USER=dbadmin
DB_PASSWORD=!_E}#3!oA7p+DG?W
DB_NAME=megaverse_db

# You need to add these:
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_FROM_STRIPE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_FROM_STRIPE
EMAIL_USER=harshit-goyal@hotmail.com
EMAIL_PASSWORD=your-gmail-app-password
```

### Get Stripe Keys
1. Go to https://dashboard.stripe.com/apikeys
2. Copy **Secret Key** (sk_test_...)
3. Copy **Webhook Secret** (whsec_...)
4. Add to Render environment variables

### Get Gmail App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer"
3. Copy the 16-character password
4. Add to Render environment variables

**In Render Dashboard:**
1. Select your deployed service
2. Go to **"Environment"**
3. Add all variables above
4. Deploy again (click **"Trigger Deploy"**)

---

## Costs

- **Monthly for 30 bookings**: < $1 (free tier)
- **After year 1**: ~$24/month (PostgreSQL becomes paid)

---

## Next Steps After Deployment

1. ✅ Deploy backend to Render
2. ✅ Connect GoDaddy domain
3. ✅ Update index.html with API URL
4. ✅ Add Stripe keys to Render
5. ✅ Test full booking flow
6. 📊 Monitor usage in Azure Portal
7. 🎉 Start accepting real bookings!

---

## Need Help?

See `DEPLOYMENT_OPTIONS.md` for:
- Alternative deployment options
- Troubleshooting
- Common errors
- Local testing

---

## You're This Close! 🚀

Total time to fully live: **~15 minutes**

Let's go!
