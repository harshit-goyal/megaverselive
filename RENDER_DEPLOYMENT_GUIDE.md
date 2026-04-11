# Render Deployment - Step-by-Step Template

This guide provides exact steps to deploy the backend to Render with all required configuration.

---

## Prerequisites

Before starting, have these ready:
- [ ] Razorpay Key ID (from Step 1)
- [ ] Razorpay Key Secret (from Step 1)
- [ ] PayPal Client ID (from Step 2)
- [ ] PayPal Secret (from Step 2)
- [ ] Gmail app password (from Step 3)
- [ ] GitHub account with access to megaverselive repo

---

## Deployment Steps

### Step 1: Go to Render

1. Open https://render.com
2. Click **Sign Up** (or Sign In if you have account)
3. Choose **Sign up with GitHub**
4. Authorize Render to access your GitHub account

### Step 2: Create Web Service

1. After signing in, click **Dashboard**
2. Click **New +** button (top right)
3. Select **Web Service**
4. Under "Connect a repository":
   - Look for `megaverselive` in the list
   - If not visible, click "Connect new repository"
   - Search for `megaverselive`
   - Click **Connect**
5. Select `megaverselive` repository
6. Click **Connect** button

### Step 3: Configure Service

Fill in these exact values:

```
Name: megaverse-api
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
```

**Important:** 
- If you see "Auto-detected", make sure it shows:
  - Root Directory: `backend`
  - Build Command: `npm install`
  - Start Command: `npm start`

### Step 4: Add Environment Variables

Click **Advanced** button.

Find the **Environment** section and add these 13 variables ONE BY ONE:

| Variable | Value |
|----------|-------|
| `DB_HOST` | `megaverse-db.postgres.database.azure.com` |
| `DB_PORT` | `5432` |
| `DB_USER` | `dbadmin` |
| `DB_PASSWORD` | (Your Azure DB password) |
| `DB_NAME` | `megaverse_db` |
| `RAZORPAY_KEY_ID` | (From Step 1) |
| `RAZORPAY_KEY_SECRET` | (From Step 1) |
| `PAYPAL_CLIENT_ID` | (From Step 2) |
| `PAYPAL_SECRET` | (From Step 2) |
| `EMAIL_USER` | `harshit-goyal@hotmail.com` |
| `EMAIL_PASSWORD` | (Gmail app password from Step 3) |
| `FRONTEND_URL` | `https://megaverselive.com` |
| `NODE_ENV` | `production` |

**How to add variables:**
1. Click **Add Environment Variable**
2. Enter variable name in first field
3. Enter value in second field
4. Click **Add** button
5. Repeat for all 13 variables

### Step 5: Review Settings

Scroll down and verify:
- [ ] Name: `megaverse-api`
- [ ] Root Directory: `backend`
- [ ] Runtime: `Node`
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`
- [ ] Auto-deploy: ON (should be default)
- [ ] All 13 environment variables added

### Step 6: Deploy

1. Click **Create Web Service** button (at bottom)
2. You'll see a deployment log starting
3. Wait 2-3 minutes for deployment to complete
4. When it says "Your service is live!", note the URL
   - Will look like: `https://megaverse-api-xxxxx.onrender.com`
   - This is your API domain! Save it!

### Step 7: Verify Deployment

Test if backend is working:

1. In new browser tab, open:
   ```
   https://megaverse-api-xxxxx.onrender.com/health
   ```
   Should show: `{"status":"ok"}`

2. If you see "Cannot GET", wait 2 minutes and refresh (sometimes slow first load)

---

## Deployment Checklist

After deployment, verify:

- [ ] Render shows "Your service is live!"
- [ ] Health endpoint returns `{"status":"ok"}`
- [ ] API URL accessible from browser
- [ ] No errors in Render logs
- [ ] Database connection working (check logs for "Connected to database")

---

## Troubleshooting

### Deployment fails with error

**Error: Cannot find module 'express'**
- This usually resolves on its own
- Wait 30 seconds and refresh
- If persists, check that `root directory` is set to `backend`

**Error: Database connection failed**
- Verify `DB_PASSWORD` is correct
- Check `DB_HOST` is spelled exactly: `megaverse-db.postgres.database.azure.com`
- Ensure Azure PostgreSQL firewall allows Render IP

**Error: Missing environment variable**
- Go to Dashboard → Services → Select megaverse-api
- Click Settings
- Scroll to Environment and verify all 13 variables are present
- Redeploy if any missing

### Service is not responding

1. Check if service is running:
   - Dashboard → megaverse-api → Logs
   - Should show "Listening on port 8080" or similar

2. If logs show errors:
   - Read error message carefully
   - Usually means missing env var or DB connection issue

3. Restart service:
   - Dashboard → megaverse-api → Settings
   - Scroll to "Manual Deploy" section
   - Click "Deploy latest commit"

---

## After Deployment

Your Render URL is: `https://megaverse-api-xxxxx.onrender.com`

You need this URL for:
1. ✅ Already done - Testing health endpoint
2. ⏳ Next: Configure Razorpay webhook
3. ⏳ Next: Configure PayPal webhook
4. ⏳ Next: Update frontend integration code
5. ⏳ Next: Test end-to-end

---

## Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `DB_HOST` | PostgreSQL server | `megaverse-db.postgres.database.azure.com` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USER` | Database user | `dbadmin` |
| `DB_PASSWORD` | Database password | (your password) |
| `DB_NAME` | Database name | `megaverse_db` |
| `RAZORPAY_KEY_ID` | Razorpay public key | `rzp_live_XXXXXXXX` |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key | (long string) |
| `PAYPAL_CLIENT_ID` | PayPal client ID | (your ID) |
| `PAYPAL_SECRET` | PayPal secret | (your secret) |
| `EMAIL_USER` | Email sender address | `harshit-goyal@hotmail.com` |
| `EMAIL_PASSWORD` | Gmail app password | (16-char password) |
| `FRONTEND_URL` | Frontend domain | `https://megaverselive.com` |
| `NODE_ENV` | Environment | `production` |

---

## What Happens Next

After successful deployment:

1. Backend API is live and responding
2. Ready to configure webhooks (Step 5)
3. Ready to update frontend (Step 6)
4. Ready to test payments (Step 7)
5. Ready to go live with production (Step 8)

---

## Common Issues & Solutions

### "Service is building..."
- This is normal
- Wait 2-3 minutes for build to complete
- Don't close the page

### "Build failed"
- Check Render logs for specific error
- Most common: typo in environment variable
- Redeploy: Settings → "Deploy latest commit"

### "502 Bad Gateway"
- Usually means backend crashed
- Check logs for error
- Redeploy service

### "CORS error when calling from frontend"
- CORS is configured for `megaverselive.com`
- If testing from localhost, you'll see CORS error
- This is normal and will work in production

---

## Next Steps After Deployment

1. ✅ Copy your Render API URL
2. ⏳ Go to Step 5: Configure Webhooks
3. ⏳ Go to Step 6: Update Frontend
4. ⏳ Go to Step 7: Test Payments
5. ⏳ Go to Step 8: Go Live

