# 🚀 Go Live in 15 Minutes - Render Deployment Checklist

## ✅ Backend Ready
- [x] `backend/index.js` - Express API with 7 endpoints
- [x] `backend/package.json` - npm start configured
- [x] `backend/services/` - Email and slot management
- [x] `backend/.env` - Database credentials populated
- [x] Database - LIVE on Azure PostgreSQL

**Your repo is ready to deploy.**

---

## 🎯 YOUR IMMEDIATE ACTION ITEMS (15 min)

### Phase 1: Create Render Account & Deploy (5 min)
**This is what deploys your API to the internet**

1. [ ] Go to https://render.com
2. [ ] Sign up with GitHub (authorize Render)
3. [ ] Click "New +" → "Web Service"
4. [ ] Select `megaverselive` repository
5. [ ] Fill form:
   - Name: `megaverse-api`
   - Root Directory: `backend`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
6. [ ] Click "Create Web Service"
7. [ ] **WAIT** - It will take 3-5 minutes to deploy

**Progress Check**: You should see "Your service is live" message

---

### Phase 2: Add Environment Variables (2 min)
**These are your API credentials (Stripe, email, database)**

While deployment is running (or after it completes):

1. [ ] Click on "Environment" tab
2. [ ] Click "Add Environment Variable" and add these 12 variables:

| Key | Value |
|-----|-------|
| `DB_HOST` | `megaverse-db.postgres.database.azure.com` |
| `DB_PORT` | `5432` |
| `DB_USER` | `dbadmin` |
| `DB_PASSWORD` | `!_E}#3!oA7p+DG?W` |
| `DB_NAME` | `megaverse_db` |
| `NODE_ENV` | `production` |
| `PORT` | `8080` |
| `STRIPE_SECRET_KEY` | Get from https://dashboard.stripe.com/apikeys (sk_test_...) |
| `STRIPE_WEBHOOK_SECRET` | Get from Stripe dashboard (whsec_...) |
| `FRONTEND_URL` | `https://megaverselive.com` |
| `EMAIL_SERVICE` | `gmail` |
| `EMAIL_USER` | `harshit-goyal@hotmail.com` |
| `EMAIL_PASSWORD` | Your Gmail app password from https://myaccount.google.com/apppasswords |

**After adding all 12**: Service auto-redeploys with credentials

**Progress Check**: Logs show "Server running on port 8080"

---

### Phase 3: Get Your API URL (instant)
**This is the live internet address of your API**

1. [ ] Open "Logs" tab
2. [ ] Look for: `Server running on port 8080`
3. [ ] Note the URL at the top of page (looks like `https://megaverse-api-xxxx.onrender.com`)
4. [ ] **Test it**:
   ```bash
   curl https://megaverse-api-xxxx.onrender.com/health
   ```
   Should return: `{"status":"ok"}`

**Progress Check**: curl returns JSON response

---

### Phase 4: Update GoDaddy DNS (5 min)
**This makes api.megaverselive.com point to your Render server**

1. [ ] Go to https://godaddy.com → Your Account → My Products
2. [ ] Find `megaverselive.com` → Click Manage
3. [ ] Go to DNS tab
4. [ ] Click "Add Record" 
5. [ ] Select Type: **CNAME**
6. [ ] Fill in:
   - **Name**: `api`
   - **Value**: `megaverse-api-xxxx.onrender.com` (from Phase 3)
   - **TTL**: 1 hour
7. [ ] Click Save

**⏱️ Wait 15-30 minutes for DNS to propagate**

**Progress Check**: 
```bash
curl https://api.megaverselive.com/health
```
Returns JSON response

---

### Phase 5: Update Frontend on Netlify (2 min)
**This connects your website to your new backend API**

1. [ ] Edit `index.html` (in your Netlify project)
2. [ ] Add near top of `<script>`:
   ```javascript
   const API_URL = 'https://api.megaverselive.com';
   const STRIPE_PUBLIC_KEY = 'pk_test_YOUR_STRIPE_PUBLISHABLE_KEY';
   ```
3. [ ] Get STRIPE_PUBLIC_KEY from https://dashboard.stripe.com/apikeys
4. [ ] Push to GitHub (Netlify auto-deploys)

**Progress Check**: Website loads without console errors

---

## 🎬 Test End-to-End (3 min)

1. [ ] Visit https://megaverselive.com
2. [ ] Try to book a session
3. [ ] Use Stripe test card: `4242 4242 4242 4242` (any future date, any CVC)
4. [ ] Confirm email arrives at `harshit-goyal@hotmail.com`
5. [ ] Check booking in database (ask me for verification query)

**Success**: You've completed your first live booking! 🎉

---

## 📋 Status After Each Phase

| Phase | If Working | If Not Working |
|-------|-----------|-----------------|
| 1 | Green checkmark in Render | Check Logs tab for errors |
| 2 | Service redeploys | Verify all 12 variables added |
| 3 | curl returns JSON | Render URL might still be deploying |
| 4 | DNS resolves | Wait 30 min, try again |
| 5 | Website connects | Check browser console for errors |

---

## ❓ Quick Help

**"My Render service won't start"**
- Go to Logs tab, look for red errors
- Most common: Missing environment variable
- Solution: Check all 12 variables are set

**"curl returns 404/502"**
- Service might still be deploying (takes 3-5 min)
- Wait 5 minutes and try again
- Check Logs for "Server running"

**"DNS still not working after 30 min"**
- Flush DNS cache: `sudo dscacheutil -flushcache` (Mac)
- Try: `nslookup api.megaverselive.com`
- Wait another 15-30 min, GoDaddy can be slow

**"Email not sending"**
- EMAIL_PASSWORD must be Gmail app password, NOT your Gmail password
- Get it at: https://myaccount.google.com/apppasswords
- Enable 2FA on Gmail first

**"Stripe payments failing"**
- Are you using test keys? (should start with `sk_test_` and `pk_test_`)
- Are you using test card: `4242 4242 4242 4242`?

---

## 💾 Persistence Check

After deployment, your data persists in Azure PostgreSQL. Even if Render restarts:
- ✅ All bookings saved
- ✅ All payments saved  
- ✅ All slots saved
- ✅ Database lives on Azure (independent)

**You can see it by connecting to database:**
```bash
psql postgresql://dbadmin:!_E}#3!oA7p+DG?W@megaverse-db.postgres.database.azure.com:5432/megaverse_db
SELECT * FROM bookings;
```

---

## 🎯 Final Result

After all phases:

```
📊 Your Booking Platform
├── 🌐 Frontend: https://megaverselive.com (Netlify)
├── ⚙️  Backend API: https://api.megaverselive.com (Render)
├── 💾 Database: Azure PostgreSQL
└── 💳 Payments: Stripe (international)
```

**Monthly Cost**: < $1 (free tier first year)
**Bookings Supported**: 30-100+/month
**Status**: LIVE 🚀

---

## 📞 Need Help?

If anything gets stuck:
1. Check the Logs tab in Render
2. Read troubleshooting section above
3. Let me know the error message

**You've got this! 15 minutes to go live.** 💪
