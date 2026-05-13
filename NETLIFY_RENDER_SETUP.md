# Deploy Megaverse Live to Netlify + Render (FREE)

This guide will get your app running on free tier services in 10 minutes.

## Step 1: Deploy Backend to Render (5 minutes)

### 1a. Create Render Account
1. Go to https://render.com and sign up (connect GitHub)
2. Click "New +" → "Web Service"
3. Select your GitHub repo: `harshit-goyal/megaverselive`
4. Use these settings:
   - **Name:** `megaverse-api`
   - **Environment:** `Node`
   - **Branch:** `main`
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `node backend/index.js`
   - **Plan:** `Free`

### 1b. Add Database (PostgreSQL on Render)
1. In Render dashboard, click "New +" → "PostgreSQL"
2. Use settings:
   - **Name:** `megaverse-db`
   - **Database:** `bookings`
   - **User:** `megaverse_user`
   - **Plan:** `Free`
3. Copy the **Internal Database URL**

### 1c. Add Environment Variables
In your Web Service settings, go to **Environment** and add:
```
DB_HOST=your-db-host.onrender.com
DB_USER=megaverse_user
DB_PASSWORD=your-password
DB_NAME=bookings
DB_PORT=5432
RAZORPAY_KEY_ID=your-key
RAZORPAY_KEY_SECRET=your-secret
PAYPAL_CLIENT_ID=your-id
PAYPAL_CLIENT_SECRET=your-secret
PAYPAL_API_URL=https://api.sandbox.paypal.com
FRONTEND_URL=https://megaverselive.netlify.app
ADMIN_JWT_SECRET=your-secret-key
JWT_SECRET=your-jwt-secret
NODE_ENV=production
```

### 1d. Deploy
- Render auto-deploys when you push to main
- Copy your backend URL: `https://megaverse-api.onrender.com`

---

## Step 2: Deploy Frontend to Netlify (3 minutes)

### 2a. Create Netlify Account
1. Go to https://netlify.com and sign up (connect GitHub)
2. Click "Add new site" → "Import an existing project"
3. Select your GitHub repo: `harshit-goyal/megaverselive`
4. Use these settings:
   - **Build command:** Leave empty (or use: `echo 'Static'`)
   - **Publish directory:** `public`
   - **Branch:** `main`
   - **Plan:** Free

### 2b. Add Environment Variables
In Netlify, go to **Site settings** → **Build & deploy** → **Environment** and add:
```
API_URL=https://megaverse-api.onrender.com
```

### 2c. Deploy
- Click "Deploy site"
- Netlify auto-deploys on every push
- Your site URL: `https://megaverselive.netlify.app`

---

## Step 3: Migrate Database from Azure to Render

If you have data in Azure PostgreSQL:

### 3a. Export from Azure
```bash
pg_dump -h old-azure-host.postgres.database.azure.com \
  -U admin@servername \
  -d bookings > backup.sql
```

### 3b. Import to Render
```bash
psql -h your-render-db.onrender.com \
  -U megaverse_user \
  -d bookings \
  -f backup.sql
```

---

## Step 4: Update API URL in Frontend

Edit `public/auth.html` and change:
```javascript
// OLD:
const API_URL = 'https://megaverselive.com';

// NEW:
const API_URL = 'https://megaverse-api.onrender.com';
```

Or Netlify will automatically inject via environment variables.

---

## Step 5: Point Domain to Netlify (Optional)

If you have `megaverselive.com`:
1. In Netlify, go to **Domain settings**
2. Add custom domain: `megaverselive.com`
3. Update DNS records (Netlify will show you how)
4. SSL certificate auto-generated

---

## Troubleshooting

### Database Connection Fails
- Check if PostgreSQL is running: `psql -h host -U user -c "SELECT 1"`
- Verify firewall allows Render IP
- Check DB credentials match environment variables

### Backend Not Deploying
- Check Render logs: Dashboard → Web Service → Logs
- Ensure `backend/package.json` exists
- Verify start command is correct

### Frontend Not Loading API
- Check browser console for CORS errors
- Verify API_URL environment variable is set
- Test API directly: `curl https://megaverse-api.onrender.com/api/health`

---

## Cost Summary
- **Netlify Frontend:** FREE (300 build minutes/month)
- **Render Backend:** FREE (up to 0.5GB RAM, auto-sleep after 15 min inactivity)
- **Render PostgreSQL:** FREE (500MB storage)
- **Total:** ₹0/month ✅

**Saves ₹773/month vs Azure!**
