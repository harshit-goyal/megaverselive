# Deploy Backend to Render (5 Minutes)

## What's Happening
- Your **HTML stays on Netlify** (as it is now)
- Your **backend API** goes to **Render** (free tier, Node.js friendly)
- Your **database stays on Azure** (PostgreSQL, already live)

## Prerequisites Checklist
- [ ] GitHub repo has `backend/` folder pushed
- [ ] Stripe API keys ready (from https://dashboard.stripe.com/apikeys)
- [ ] Gmail app password ready (from https://myaccount.google.com/apppasswords)
- [ ] Database credentials (in backend/.env)

---

## Step 1: Sign Up on Render (2 min)

1. Go to https://render.com
2. Click **"Get Started"** button
3. Select **"Sign up with GitHub"**
4. Authorize Render to access your GitHub repos

**Result**: You're logged into Render and can see your repos

---

## Step 2: Create Web Service (1 min)

1. Click **"New +"** button (top right)
2. Select **"Web Service"**
3. Select your **megaverselive** repository
4. Click **"Connect"**

**Form Fields to Fill:**

| Field | Value |
|-------|-------|
| **Name** | megaverse-api |
| **Root Directory** | backend |
| **Runtime** | Node |
| **Build Command** | npm install |
| **Start Command** | npm start |
| **Plan** | Free (pre-selected) |

5. Click **"Create Web Service"**

**Result**: Deployment begins (takes 3-5 minutes)

---

## Step 3: Add Environment Variables (1 min)

While deployment is running, add credentials:

1. Go to **"Environment"** tab (in deployment page)
2. Click **"Add Environment Variable"** 
3. Add these one by one:

```
DB_HOST = megaverse-db.postgres.database.azure.com
DB_PORT = 5432
DB_USER = dbadmin
DB_PASSWORD = !_E}#3!oA7p+DG?W
DB_NAME = megaverse_db
NODE_ENV = production
PORT = 8080
STRIPE_SECRET_KEY = sk_test_YOUR_STRIPE_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET = whsec_YOUR_WEBHOOK_SECRET_HERE
FRONTEND_URL = https://megaverselive.com
EMAIL_SERVICE = gmail
EMAIL_USER = harshit-goyal@hotmail.com
EMAIL_PASSWORD = YOUR_GMAIL_APP_PASSWORD_HERE
```

**Important**: 
- Replace `sk_test_...` with your actual Stripe secret key
- Replace `whsec_...` with your Stripe webhook secret
- Replace Gmail password with your **app password** (not your Gmail password)

4. After adding all variables, the service will **automatically redeploy**

**Result**: Service runs with all credentials

---

## Step 4: Get Your API URL (wait 5 min)

1. Watch the **"Logs"** tab until you see: `Server running on port 8080`
2. Your service URL appears at the top of the page
3. It will look like: `https://megaverse-api-xxxx.onrender.com`
4. Copy this URL

**Test it works:**
```bash
curl https://megaverse-api-xxxx.onrender.com/health
```

Should return:
```json
{"status":"ok"}
```

---

## Step 5: Update GoDaddy DNS (5 min)

1. Go to https://godaddy.com → Your Account → My Products
2. Find **megaverselive.com** → Click **"Manage"**
3. Go to **"DNS"** tab
4. Find the **DNS Records** section
5. Click **"Add Record"**
6. Select **CNAME** from dropdown
7. Fill in:
   - **Name (Host)**: api
   - **Value (Points to)**: megaverse-api-xxxx.onrender.com (from Step 4)
   - **TTL**: 1 hour (default)
8. Click **"Save"**

**Wait 15-30 minutes for DNS propagation**

---

## Step 6: Verify Everything Works

Test after DNS propagation (wait 15-30 min):

```bash
# Test API health
curl https://api.megaverselive.com/health

# Test getting available slots
curl https://api.megaverselive.com/slots

# Test cancellation endpoint
curl -X POST https://api.megaverselive.com/cancel-booking \
  -H "Content-Type: application/json" \
  -d '{"booking_id":"test"}'
```

---

## Step 7: Update Frontend (2 min)

Edit your `index.html` on Netlify:

1. Find this line and replace the URL:
```javascript
const API_URL = 'https://api.megaverselive.com';
const STRIPE_PUBLIC_KEY = 'pk_test_YOUR_KEY_HERE';
```

2. Add your Stripe **publishable key** (from https://dashboard.stripe.com/apikeys)

3. Add the booking form HTML from `FRONTEND_INTEGRATION.md`

4. Deploy to Netlify (Netlify auto-deploys on git push, or manual deploy in dashboard)

---

## Troubleshooting

### Service won't start
- Check **Logs** tab for errors
- Verify all environment variables are set correctly
- Check database credentials are correct

### Can't reach api.megaverselive.com
- Wait 30 minutes for DNS propagation
- Test with full URL first: `https://megaverse-api-xxxx.onrender.com/health`
- Check GoDaddy CNAME record is correctly set

### Email not sending
- Verify EMAIL_PASSWORD is your **Gmail app password**, not your Gmail password
- Enable "Less secure apps" in Gmail if using regular password
- Check email service is "gmail" in environment variables

### Stripe payments failing
- Verify STRIPE_SECRET_KEY is in environment (not public key)
- Test with Stripe test card: 4242 4242 4242 4242
- Check webhook secret is correctly set

---

## What You've Built

| Component | Location | Status |
|-----------|----------|--------|
| Frontend HTML | Netlify | ✅ Live |
| Backend API | Render | ✅ Live (after Step 4) |
| Database | Azure PostgreSQL | ✅ Live |
| Domain | api.megaverselive.com | ✅ Live (after Step 5) |

**Total Time**: 15 minutes to go live with booking system!

---

## Next: Accept First Booking

Once everything is deployed:
1. Visit https://megaverselive.com
2. Book a 45-minute session
3. Pay with Stripe test card: `4242 4242 4242 4242` (any future date)
4. Confirm email received
5. Check booking in database

You're done! 🚀
