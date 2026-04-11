# 🚀 GO LIVE IN 15 MINUTES - RENDER DEPLOYMENT

## ⏰ QUICK START

**You are 15 minutes away from accepting your first live payment.**

Everything is ready. You just need to:
1. Deploy backend to Render (5 min - mostly automated)
2. Add API credentials (2 min - copy/paste)
3. Update DNS (5 min - one record)
4. Test (3 min - book a session)

---

## 🎯 YOUR ACTION ITEMS TODAY

### BEFORE YOU START
Get these 3 things (5 minutes):

1. **Stripe Keys** - Go to https://dashboard.stripe.com/apikeys
   - Copy your **Secret Key** (starts with `sk_test_`)
   - Copy your **Publishable Key** (starts with `pk_test_`)
   - Copy your **Webhook Secret** (starts with `whsec_`)

2. **Gmail App Password** - Go to https://myaccount.google.com/apppasswords
   - If you don't see it, enable 2FA first on Gmail
   - Generate new app password for "Mail"
   - Copy the 16-character code (it's NOT your Gmail password)

3. **Your GitHub repo URL** - You have this already:
   - https://github.com/yourusername/megaverselive

---

## 🔴 STEP 1: Deploy to Render (5 minutes)

### 1a. Sign Up on Render
```
Visit: https://render.com
Click: "Get Started"
Choose: "Sign up with GitHub"
Authorize Render
```

### 1b. Create Web Service
```
Click: "New +" button (top right)
Select: "Web Service"
Select: megaverselive repository
Click: "Connect"
```

### 1c. Configure Service
```
Fill in the form:

Name:                    megaverse-api
Root Directory:          backend
Runtime:                 Node
Build Command:           npm install
Start Command:           npm start
Plan:                    Free (pre-selected)

Click: "Create Web Service"
```

**⏱️ Wait**: Render will start building. Takes 3-5 minutes. You'll see "Your service is live" when done.

---

## 🟡 STEP 2: Add Environment Variables (2 minutes)

While Render is building (or after it deploys):

### 2a. Go to Environment Tab
```
In Render dashboard, click "Environment" tab
Click "Add Environment Variable"
```

### 2b. Add These 12 Variables

Copy and paste each one:

```
DB_HOST                  megaverse-db.postgres.database.azure.com
DB_PORT                  5432
DB_USER                  dbadmin
DB_PASSWORD              !_E}#3!oA7p+DG?W
DB_NAME                  megaverse_db
NODE_ENV                 production
PORT                     8080
STRIPE_SECRET_KEY        sk_test_YOUR_KEY_FROM_STRIPE
STRIPE_WEBHOOK_SECRET    whsec_YOUR_WEBHOOK_FROM_STRIPE
FRONTEND_URL             https://megaverselive.com
EMAIL_SERVICE            gmail
EMAIL_USER               harshit-goyal@hotmail.com
EMAIL_PASSWORD           YOUR_GMAIL_APP_PASSWORD
```

**Important**: 
- STRIPE_SECRET_KEY: Get from Stripe dashboard (copy the whole key)
- STRIPE_WEBHOOK_SECRET: Get from Stripe Webhooks section (optional but good to add)
- EMAIL_PASSWORD: This is your Gmail app password (16 chars), NOT your Gmail password

### 2c. Save
```
After adding all 12, Render auto-redeploys with credentials
Watch "Logs" tab - should see: "Server running on port 8080"
```

**Result**: Your API is now LIVE on Render 🎉

---

## 🟢 STEP 3: Update GoDaddy DNS (5 minutes)

### 3a. Get Your Render API URL
```
In Render dashboard, look at top of page
Copy URL that looks like: https://megaverse-api-xxxx.onrender.com
(The xxxx part is random, yours will be different)
```

### 3b. Go to GoDaddy
```
Visit: https://godaddy.com
Sign in to your account
Go to "My Products"
Find megaverselive.com
Click "Manage"
```

### 3c. Add DNS Record
```
Go to "DNS" tab
Look for "DNS Records" section
Click "Add Record"
Select Type: CNAME
Fill in:
  Name (Host):  api
  Value:        megaverse-api-xxxx.onrender.com (from 3a)
  TTL:          1 hour (default)
Click "Save"
```

**⏱️ Wait**: DNS takes 15-30 minutes to propagate. While you wait, do Step 4.

---

## 🔵 STEP 4: Update Your Frontend (2 minutes)

### 4a. Edit index.html
```
On Netlify, go to your project
Click "Code" tab → "Edit" on your branch
Open index.html
```

### 4b. Add API Connection
```
Find the <script> section (usually in <head> or end of <body>)
Add these two lines near the top of your script:

const API_URL = 'https://api.megaverselive.com';
const STRIPE_PUBLIC_KEY = 'pk_test_YOUR_KEY_FROM_STRIPE';
```

Replace `pk_test_YOUR_KEY_FROM_STRIPE` with your Stripe publishable key.

### 4c. Add Booking Form
```
See: FRONTEND_INTEGRATION.md in your repo
Copy the HTML/JavaScript sections
Paste into your index.html

(Or keep your current HTML and just add the API_URL variable above)
```

### 4d. Deploy
```
Push your changes to GitHub
Netlify auto-deploys
(Takes 1-2 minutes)
```

---

## ✅ STEP 5: Test It Works (3 minutes)

### 5a. Test API is Live
```
After DNS propagates (15-30 min), run:

curl https://api.megaverselive.com/health

Should return:
{"status":"ok","timestamp":"...","message":"Megaverse Live API is running"}
```

### 5b. Book a Test Session
```
Visit: https://megaverselive.com
Try to book a session
Use Stripe test card: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
Click "Book" or "Pay"
```

### 5c. Verify Booking
```
Check email: harshit-goyal@hotmail.com
Should have booking confirmation from your system

Check database:
psql postgresql://dbadmin:!_E}#3!oA7p+DG?W@megaverse-db.postgres.database.azure.com:5432/megaverse_db
SELECT * FROM bookings;
Should show your test booking
```

**If all 3 work**: You're LIVE! 🚀

---

## 🆘 TROUBLESHOOTING

### "Render service won't start"
**Problem**: Logs show errors
**Solution**: 
- Check all 12 environment variables are added (no typos)
- Check DB credentials are correct
- Look at error message in Logs tab

### "curl returns error after DNS update"
**Problem**: Connection refused, 404, or 502
**Solution**:
- DNS takes 15-30 min to propagate
- Try: `nslookup api.megaverselive.com` (should return IP)
- First test with full Render URL: `https://megaverse-api-xxxx.onrender.com/health`
- Wait another 15 min

### "Email not sending"
**Problem**: No confirmation email received
**Solution**:
- EMAIL_PASSWORD must be Gmail app password (16 chars), NOT your Gmail password
- Enable 2FA on Gmail if you haven't
- Get app password from: https://myaccount.google.com/apppasswords
- Verify EMAIL_USER is correct: harshit-goyal@hotmail.com

### "Stripe payment failed"
**Problem**: Test card doesn't work
**Solution**:
- Use test card: `4242 4242 4242 4242` (exact)
- Any future expiry date
- Any 3-digit CVC
- Check STRIPE_SECRET_KEY is in environment (not public key)

---

## 📊 WHAT'S HAPPENING

### Architecture
```
Your Website (Netlify)
    ↓
Visitor books session
    ↓
API (Render) receives request
    ↓
Database (Azure) stores booking
    ↓
Email service sends confirmation
    ↓
Stripe processes payment
```

### Data Flow for One Booking
1. Visitor clicks "Book" on megaverselive.com
2. Browser sends request to api.megaverselive.com/book
3. Render API receives request
4. API checks available slots in Azure database
5. API creates booking in database
6. API charges card via Stripe
7. API sends confirmation email
8. Browser shows "Success!"

---

## 💰 COSTS

| Item | Cost | Notes |
|------|------|-------|
| Render (backend) | FREE | Unlimited, forever |
| Azure PostgreSQL | FREE (Year 1) | $15-20/month after |
| Stripe | 2.9% + $0.30 | Only on actual bookings |
| Gmail | FREE | Built into your account |
| **Total** | **< $1/month** | 30-100+ bookings supported |

---

## 📝 QUICK REFERENCE

### Your Database Connection
```
Host:     megaverse-db.postgres.database.azure.com
Port:     5432
User:     dbadmin
Password: !_E}#3!oA7p+DG?W
Database: megaverse_db
```

### Your Mentor Profile (Pre-loaded)
```
Name:     Harshit Goyal
Rate:     ₹5000/hour
Sessions: 45 minutes each
Status:   LIVE
```

### Test Data
```
Stripe Test Card: 4242 4242 4242 4242
Expiry:           Any future date
CVC:              Any 3 digits
```

---

## 🎯 SUCCESS CHECKLIST

- [ ] Stripe keys in environment variables
- [ ] Gmail app password in environment variables
- [ ] Render deployment completed
- [ ] curl https://api.megaverselive.com/health returns JSON
- [ ] DNS CNAME record added to GoDaddy
- [ ] DNS propagated (test with nslookup)
- [ ] index.html updated with API_URL
- [ ] Test booking created
- [ ] Confirmation email received
- [ ] Booking appears in database

✅ All checked = YOU'RE LIVE! Accept payments now! 💰

---

## 🚀 YOU'RE READY

Everything is built and tested. Just follow these 5 steps and you'll have a production booking platform.

**Start with Step 1. You've got this!** 💪

Questions? Check RENDER_CHECKLIST.md for more details.
