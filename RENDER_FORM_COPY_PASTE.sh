#!/bin/bash

# RENDER DEPLOYMENT HELPER
# Copy-paste all values from this script into the Render form

cat << 'EOF'

╔═══════════════════════════════════════════════════════════════╗
║         RENDER DEPLOYMENT FORM - COPY AND PASTE              ║
╚═══════════════════════════════════════════════════════════════╝

Go to: https://render.com → New → Web Service → Connect megaverselive repo

═══════════════════════════════════════════════════════════════

FORM FIELDS (Copy exactly):

Name:
    megaverselive-backend

Branch:
    main

Build Command:
    npm install

Start Command:
    node backend/index.js

Runtime:
    Node

Plan:
    Free

═══════════════════════════════════════════════════════════════

ENVIRONMENT VARIABLES (Add 11 variables):

Click "Add Environment Variable" 11 times and fill:

1️⃣
   Key: DB_HOST
   Value: [YOUR_AZURE_DB_HOST]

2️⃣
   Key: DB_USER
   Value: [YOUR_AZURE_DB_USER]

3️⃣
   Key: DB_PASSWORD
   Value: [YOUR_AZURE_DB_PASSWORD]

4️⃣
   Key: DB_NAME
   Value: bookings

5️⃣
   Key: DB_PORT
   Value: 5432

6️⃣
   Key: RAZORPAY_KEY_ID
   Value: [YOUR_RAZORPAY_KEY_ID]

7️⃣
   Key: RAZORPAY_KEY_SECRET
   Value: [YOUR_RAZORPAY_KEY_SECRET]

8️⃣
   Key: PAYPAL_CLIENT_ID
   Value: [YOUR_PAYPAL_CLIENT_ID]

9️⃣
   Key: PAYPAL_CLIENT_SECRET
   Value: [YOUR_PAYPAL_CLIENT_SECRET]

🔟
   Key: PAYPAL_API_URL
   Value: https://api.sandbox.paypal.com

1️⃣1️⃣
   Key: FRONTEND_URL
   Value: https://megaverselive.netlify.app

═══════════════════════════════════════════════════════════════

FINAL STEP:

Click: "Create Web Service"
Wait: 2-3 minutes for deployment
Result: You'll see a URL like https://megaverselive-backend.onrender.com

Copy that URL and tell me!

═══════════════════════════════════════════════════════════════

EOF
