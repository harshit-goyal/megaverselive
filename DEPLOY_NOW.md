# 🚀 DEPLOY NOW - 38 Minutes to Production

Your booking platform is 100% ready. Follow these 13 steps.

---

## STEP 1: Extract Azure Database Credentials (2 min)

Run:
```bash
bash extract-azure-db.sh
```

This will:
1. Ask you to paste your Azure connection string
2. Extract DB_HOST, DB_USER, DB_PASSWORD
3. Create `RENDER_ENV_VARS.txt`

**Get connection string from:**
- https://portal.azure.com
- Search: "postgres"
- Click database
- Settings → Connection Strings
- Copy ANY connection string

---

## STEP 2: Edit RENDER_ENV_VARS.txt (1 min)

Open the file and replace:
```
[YOUR_RAZORPAY_KEY_ID] → Your Razorpay Key
[YOUR_RAZORPAY_KEY_SECRET] → Your Razorpay Secret
[YOUR_PAYPAL_CLIENT_ID] → Your PayPal Client ID
[YOUR_PAYPAL_CLIENT_SECRET] → Your PayPal Secret
```

---

## STEP 3: Create Render Account (2 min)

Go to: https://render.com
Sign up (GitHub login recommended)

---

## STEP 4: Create Web Service (3 min)

1. Click "New" → "Web Service"
2. Select `megaverselive` repository
3. Fill form:
```
Name: megaverselive-backend
Branch: main
Build Command: npm install
Start Command: node backend/index.js
Runtime: Node
Plan: Free
```

---

## STEP 5: Add Environment Variables (3 min)

Copy all 11 values from `RENDER_ENV_VARS.txt` into Render form.

---

## STEP 6: Deploy (3 min)

Click "Create Web Service" and wait 2-3 minutes.

When you see green **"Live"** status, copy your Render URL:
```
https://megaverselive-backend.onrender.com
```

---

## STEP 7: Test Backend (1 min)

```bash
bash test-backend.sh https://YOUR_RENDER_URL
```

Should see: ✅ Backend is responding

---

## STEP 8: Generate Webhook URLs (1 min)

```bash
bash configure-webhooks.sh https://YOUR_RENDER_URL
```

Creates: `WEBHOOK_URLS_TO_ADD.md`

---

## STEP 9: Add Razorpay Webhook (5 min)

1. https://dashboard.razorpay.com/app/settings/webhooks
2. Click "Add New Webhook"
3. Paste Razorpay URL from `WEBHOOK_URLS_TO_ADD.md`
4. Events: `payment.authorized`, `order.paid`
5. Click Create

---

## STEP 10: Add PayPal Webhook (5 min)

1. https://developer.paypal.com → Apps & Credentials → Sandbox
2. Business Account → menu → Manage Webhooks
3. Click "Add Webhook"
4. Paste PayPal URL from `WEBHOOK_URLS_TO_ADD.md`
5. Event: `PAYMENT.SALE.COMPLETED`
6. Click Add

---

## STEP 11: Test UPI Payment (5 min)

1. https://megaverselive.netlify.app
2. Fill booking form
3. Select "UPI (Razorpay)"
4. Book
5. Use test card: `4111 1111 1111 1111`
6. Verify payment success

---

## STEP 12: Test PayPal (5 min)

1. Same site, new booking
2. Select "PayPal"
3. Book
4. Log in with PayPal sandbox account
5. Approve payment
6. Verify success

---

## STEP 13: Go Live (2 min)

Get **live credentials** from Razorpay and PayPal.

Update Render environment variables with live keys.

**Platform accepts real payments!**

---

## Timeline

- Step 1: 2 min
- Step 2: 1 min
- Step 3: 2 min
- Step 4: 3 min
- Step 5: 3 min
- Step 6: 3 min
- Step 7: 1 min
- Step 8: 1 min
- Step 9: 5 min
- Step 10: 5 min
- Step 11: 5 min
- Step 12: 5 min
- Step 13: 2 min

**TOTAL: 38 minutes to production!**

---

## START HERE

```bash
bash extract-azure-db.sh
```

Then follow steps 2-13 above.

**Let's go!**
