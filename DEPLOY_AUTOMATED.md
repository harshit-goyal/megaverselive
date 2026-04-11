# 🤖 Fully Automated Deployment - Copy & Paste Only

**No thinking required. Just copy, paste, and follow prompts.**

---

## STEP 1: Get Your 3 Credentials (Do This First)

You need exactly 3 things. Get them now and keep them in front of you.

### A. Stripe Secret Key (1 minute)
```
1. Open: https://dashboard.stripe.com/apikeys
2. Find "Secret key" (starts with sk_test_)
3. Click copy button
4. Paste into notepad
```
**You now have**: `sk_test_...`

### B. Gmail App Password (2 minutes)
```
1. Open: https://myaccount.google.com/apppasswords
2. If not available, enable 2FA first
3. Select Mail + Windows
4. Copy the 16-character code
5. Paste into notepad
```
**You now have**: `16-character-code`

### C. Stripe Webhook Secret (1 minute - OPTIONAL)
```
1. Open: https://dashboard.stripe.com/webhooks
2. Find webhook signing secret (starts with whsec_)
3. Copy it
4. Paste into notepad
```
**You now have**: `whsec_...` (or can leave empty)

---

## STEP 2: Go to Render.com (Do This Second)

```
1. Open: https://render.com
2. Click "Get Started"
3. Click "Sign up with GitHub"
4. Authorize Render
5. Come back to this guide
```

**You now have**: Render account connected to GitHub

---

## STEP 3: Create Web Service on Render (Do This Third)

```
1. In Render dashboard, click "New +"
2. Select "Web Service"
3. Select "megaverselive" repository
4. Click "Connect"

NOW FILL THE FORM:
   Name:                    megaverse-api
   Root Directory:          backend
   Runtime:                 Node
   Build Command:           npm install
   Start Command:           npm start
   Plan:                    Free

5. Click "Create Web Service"
6. WAIT - Watch the Logs tab
   Look for: "Server running on port 8080"
   This takes 3-5 minutes
```

**You now have**: Backend building on Render

---

## STEP 4: Add Environment Variables (Do This Fourth)

While Render is building, add your credentials:

```
1. In Render dashboard, click "Environment" tab
2. Click "Add Environment Variable"

COPY AND PASTE EACH ONE EXACTLY:

DB_HOST
megaverse-db.postgres.database.azure.com

DB_PORT
5432

DB_USER
dbadmin

DB_PASSWORD
!_E}#3!oA7p+DG?W

DB_NAME
megaverse_db

NODE_ENV
production

PORT
8080

STRIPE_SECRET_KEY
sk_test_YOUR_KEY (Replace with your key from Step 1A)

STRIPE_WEBHOOK_SECRET
whsec_YOUR_KEY (Replace with your key from Step 1C - or leave blank)

FRONTEND_URL
https://megaverselive.com

EMAIL_SERVICE
gmail

EMAIL_USER
harshit-goyal@hotmail.com

EMAIL_PASSWORD
YOUR_GMAIL_APP_PASSWORD (Replace with code from Step 1B)
```

After adding all 12, Render auto-redeploys.

**You now have**: API running with all credentials

---

## STEP 5: Get Your Render URL (Do This Fifth)

```
1. Watch Render Logs tab
2. Look for: "Server running on port 8080"
3. At top of page, you'll see your service URL:
   https://megaverse-api-xxxx.onrender.com
4. COPY THIS URL
5. Paste it into notepad
```

Test it works:
```bash
curl https://megaverse-api-xxxx.onrender.com/health
```

Should return: `{"status":"ok",...}`

**You now have**: Live API endpoint

---

## STEP 6: Update GoDaddy DNS (Do This Sixth)

```
1. Open: https://godaddy.com
2. Sign in → My Products
3. Find megaverselive.com → Click Manage
4. Go to DNS tab
5. Click "Add Record"
6. Select Type: CNAME
7. Fill in:
   Name: api
   Value: megaverse-api-xxxx.onrender.com (from Step 5)
   TTL: 1 hour
8. Click Save

WAIT 15-30 MINUTES for DNS to propagate
```

Test DNS:
```bash
nslookup api.megaverselive.com
```

Should return an IP address (then you know it's working).

**You now have**: api.megaverselive.com pointing to your API

---

## STEP 7: Update Your Website (Do This Seventh)

Edit your `index.html`:

Find the `<script>` section and add:

```javascript
const API_URL = 'https://api.megaverselive.com';
const STRIPE_PUBLIC_KEY = 'pk_test_YOUR_KEY_HERE';
```

Get `pk_test_YOUR_KEY_HERE` from:
```
1. Open: https://dashboard.stripe.com/apikeys
2. Find "Publishable key" (starts with pk_test_)
3. Copy it
4. Paste into index.html
```

Then push to GitHub:
```bash
git add index.html
git commit -m "Add API URL and Stripe key to booking form"
git push origin main
```

Netlify auto-deploys (2 minutes).

**You now have**: Website connected to API

---

## STEP 8: Test Everything (Do This Last)

```
1. Wait for DNS to propagate (15-30 min from Step 6)
2. Visit: https://megaverselive.com
3. Try to book a session
4. Pay with test card: 4242 4242 4242 4242
   Expiry: Any future date (12/25)
   CVC: Any 3 digits (123)
5. Click Book/Pay
6. Check email: harshit-goyal@hotmail.com
   Should have booking confirmation

IF EMAIL ARRIVED: You're LIVE! 🚀
```

---

## CHECKLIST - Complete in Order

- [ ] Step 1: Got 3 credentials
- [ ] Step 2: Created Render account  
- [ ] Step 3: Created Web Service (watched logs)
- [ ] Step 4: Added 12 environment variables
- [ ] Step 5: Got Render URL & tested /health
- [ ] Step 6: Updated GoDaddy DNS
- [ ] Step 7: Updated index.html & pushed to GitHub
- [ ] Step 8: Tested booking with test card

**ALL DONE?** You're live and accepting bookings! 🎉

---

## COPY-PASTE TEMPLATE

Use this to organize your credentials:

```
STRIPE_SECRET_KEY: sk_test_____________________
STRIPE_WEBHOOK_SECRET: whsec_____________________
GMAIL_APP_PASSWORD: ____________________
STRIPE_PUBLIC_KEY: pk_test_____________________

RENDER_SERVICE_URL: https://megaverse-api-xxxx.onrender.com
```

---

## TROUBLESHOOTING

**API won't start?**
- Check Render Logs tab for red errors
- Verify all 12 env vars are set (no typos)

**DNS not working after 30 min?**
- Try: `nslookup api.megaverselive.com`
- If returns IP: working
- If error: try again in 15 min

**Email not arriving?**
- Make sure EMAIL_PASSWORD is Gmail app password (16 chars)
- NOT your Gmail password

**Payment fails?**
- Use exact test card: 4242 4242 4242 4242
- Any future date, any 3-digit CVC

---

## DONE!

You now have a live booking platform. 

Share your URL: **megaverselive.com**

Accept bookings. Get paid. Scale it up. 🚀
