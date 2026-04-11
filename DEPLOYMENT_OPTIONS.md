# 🚀 DEPLOYMENT GUIDE - Megaverse Live with Your GoDaddy Domain

## ✅ What's Already Working
- PostgreSQL Database (Azure) ✅
- Database Schema (5 tables) ✅
- Backend API Code ✅ (tested locally)
- Booking Logic ✅

## ❌ What We Need to Fix
- Deploy Node.js backend (Azure App Service has runtime issues)
- Connect your GoDaddy domain

---

## SOLUTION: Deploy Backend to Render (Free Tier)

### Why Render?
- ✅ Free tier for Node.js
- ✅ Works perfectly with PostgreSQL
- ✅ Deploy from Git (takes 2 minutes)
- ✅ Custom domain support
- ✅ Automatic SSL/HTTPS

### Step 1: Push Code to GitHub

```bash
cd /Users/harshit/megaverselive
git init
git add .
git commit -m "Megaverse Live booking backend"
git remote add origin https://github.com/YOUR_USERNAME/megaverselive.git
git branch -M main
git push -u origin main
```

### Step 2: Create Render Account & Deploy

1. Go to: https://render.com (sign up free)
2. Click **"New+"** → **"Web Service"**
3. Connect GitHub (authorize Render)
4. Select `megaverselive` repository
5. Fill in:
   - **Name**: `megaverse-api`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### Step 3: Add Environment Variables

In Render dashboard for your service:
- Click **"Environment"**
- Add these variables:
  ```
  DB_HOST=megaverse-db.postgres.database.azure.com
  DB_PORT=5432
  DB_USER=dbadmin
  DB_PASSWORD=!_E}#3!oA7p+DG?W
  DB_NAME=megaverse_db
  NODE_ENV=production
  PORT=10000
  
  STRIPE_SECRET_KEY=sk_test_YOUR_KEY (from Stripe)
  STRIPE_WEBHOOK_SECRET=whsec_YOUR_KEY (from Stripe)
  
  EMAIL_SERVICE=gmail
  EMAIL_USER=harshit-goyal@hotmail.com
  EMAIL_PASSWORD=your-app-password
  
  FRONTEND_URL=https://megaverselive.com
  ```

### Step 4: Deploy & Get URL

- Click **"Deploy"**
- Wait 2-3 minutes
- You'll get a URL like: `https://megaverse-api.onrender.com`
- Test: `curl https://megaverse-api.onrender.com/api/health`

---

## Connect Your GoDaddy Domain

### Option A: Use GoDaddy's Subdomain Forwarding (Simplest)
1. Go to GoDaddy → Domain Settings
2. Add subdomain: `api.megaverselive.com` → Points to Render URL
3. In Render: Add Custom Domain `api.megaverselive.com`

### Option B: Use CNAME Record (Better)
1. Go to GoDaddy → Domain Settings → DNS Management
2. Add CNAME Record:
   - **Name**: `api`
   - **Value**: (your Render URL, e.g., `megaverse-api.onrender.com`)
   - **TTL**: 3600
3. Wait 15-30 minutes for DNS propagation
4. Access backend at: `https://api.megaverselive.com/api/health`

---

## Update Frontend (index.html)

Change all API calls to use your domain:

```javascript
const API_URL = 'https://api.megaverselive.com'; // Or full Render URL
```

---

## Alternative: Keep Using Azure (Fix the Issue)

If you want to stick with Azure App Service, the issue is that F1 tier doesn't auto-detect Node.js runtime. Fix:

```bash
# Set explicit start command
az webapp config appsettings set \
  -n megaverse-api \
  -g megaverse-rg \
  --settings SCM_DO_BUILD_DURING_DEPLOYMENT=true

# Deploy
cd backend
npm install
zip -r ../app.zip .
az webapp deployment source config-zip -n megaverse-api -g megaverse-rg --src ../app.zip

# Add custom domain to App Service
az webapp config hostname add -n megaverse-api -g megaverse-rg --hostname api.megaverselive.com

# Update GoDaddy DNS to point to Azure App Service
# CNAME: api.megaverselive.com → megaverse-api.azurewebsites.net
```

---

## QUICK COMPARISON

| Approach | Setup Time | Free Tier | Reliability | Domain Support |
|----------|-----------|-----------|-------------|-----------------|
| Render   | 5 min     | ✅ Yes    | ✅ Excellent | ✅ CNAME       |
| Azure App | 10 min   | ✅ Yes    | ⚠️ Needs fix | ✅ CNAME       |
| Railway  | 10 min    | ✅ Yes    | ✅ Excellent | ✅ CNAME       |

---

## RECOMMENDATION

**Use Render** because:
1. Deploy in 5 minutes (just connect GitHub)
2. Works out of the box
3. No runtime issues
4. Free tier is generous
5. Easy custom domain setup

---

## Testing Checklist After Deployment

```bash
# 1. Health check
curl https://api.megaverselive.com/api/health

# 2. Test database connection
curl https://api.megaverselive.com/api/slots

# 3. Create a booking (test)
curl -X POST https://api.megaverselive.com/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"slotId":1,"name":"Test","email":"test@example.com"}'

# 4. Check database
psql -h megaverse-db.postgres.database.azure.com -U dbadmin -d megaverse_db
SELECT * FROM bookings;
```

---

## File Locations
- Backend code: `/Users/harshit/megaverselive/backend/`
- Database: `megaverse-db.postgres.database.azure.com`
- Static HTML: `/Users/harshit/megaverselive/index.html`
- API Docs: `API_DOCS.md`

---

## Next: Frontend Integration

Once backend is deployed:
1. Update `index.html` with booking calendar (see FRONTEND_INTEGRATION.md)
2. Add Stripe Publishable Key
3. Test full booking flow
4. Deploy static HTML to GoDaddy

---

**Choose Render or Azure and let me know!** 🚀
