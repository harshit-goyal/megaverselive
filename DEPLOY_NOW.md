# 🎯 ONE-STEP DEPLOYMENT GUIDE

Your backend is **100% ready**. You just need to deploy it.

## Current Status
✅ Backend Code: Working (tested locally)
✅ Database: Live on Azure
✅ Domain: megaverselive.com (GoDaddy)

---

## Deploy in 2 Minutes - Choose One

### Option 1: Render (RECOMMENDED - Easiest)
**No credit card needed. Free forever for hobby projects.**

```bash
# 1. Create account at render.com
# 2. Connect GitHub (auth with your account)
# 3. Create New Web Service:
#    - Repository: megaverselive
#    - Root Directory: backend
#    - Start Command: npm start
# 4. Add Environment Variables (see below)
# 5. Deploy (click Deploy button)
```

**Environment Variables to Add:**
```
DB_HOST=megaverse-db.postgres.database.azure.com
DB_PORT=5432
DB_USER=dbadmin
DB_PASSWORD=!_E}#3!oA7p+DG?W
DB_NAME=megaverse_db
NODE_ENV=production
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_KEY
EMAIL_SERVICE=gmail
EMAIL_USER=harshit-goyal@hotmail.com
EMAIL_PASSWORD=your-16-char-app-password
FRONTEND_URL=https://megaverselive.com
```

**After Deploy:**
- You'll get URL: `https://megaverse-api.onrender.com`
- Point GoDaddy to it (see Domain Setup below)

---

### Option 2: Railway
Same as Render but different UI. Go to railway.app

---

### Option 3: Netlify Functions
Uses your GoDaddy domain directly. More complex setup.

---

## GoDaddy Domain Setup

### After Backend is Deployed

1. Go to **GoDaddy Dashboard** → Your Domain
2. Click **Manage DNS**
3. Add **CNAME Record**:
   ```
   Name: api
   Type: CNAME
   Value: megaverse-api.onrender.com (from Render)
   TTL: 3600
   ```
4. Save and wait 15-30 minutes for DNS update

5. Test it works:
   ```bash
   curl https://api.megaverselive.com/api/health
   ```

---

## Update Your Website

Once backend is deployed and domain is set up:

1. Edit `index.html`
2. Change API URL:
   ```javascript
   const API_URL = 'https://api.megaverselive.com';
   ```
3. Add Stripe Publishable Key (from dashboard)
4. Deploy HTML to your web hosting

---

## Testing

```bash
# 1. Check API is running
curl https://api.megaverselive.com/api/health
# Should return: {"status":"ok",...}

# 2. Check database connection
curl https://api.megaverselive.com/api/slots
# Should return slot data (no error)

# 3. Test full booking flow
curl -X POST https://api.megaverselive.com/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "slotId": 1,
    "name": "Test User",
    "email": "test@example.com",
    "timezone": "IST"
  }'
```

---

## Current Infrastructure

```
Your Website (megaverselive.com)
          ↓
    Booking Calendar (HTML)
          ↓
Backend API (Render) ← api.megaverselive.com
          ↓
PostgreSQL (Azure) ← megaverse-db.postgres.database.azure.com
          ↓
    Stripe (Payments)
    Gmail (Emails)
```

---

## NEXT STEPS

1. **Deploy Backend:** Choose Render or Railway (2 min)
2. **Update DNS:** Add CNAME to GoDaddy (5 min)
3. **Test API:** Run curl commands above (2 min)
4. **Update Frontend:** Add booking calendar to index.html (15 min)
5. **Test Full Flow:** Book a test session with Stripe test card

---

## Done! 🎉

Total time to fully working platform: **30 minutes**
