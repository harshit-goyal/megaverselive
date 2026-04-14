#!/bin/bash

# 🚀 MEGAVERSE LIVE - PRODUCTION GO-LIVE SCRIPT
# This script automates switching from sandbox to production credentials
# Usage: bash go-live.sh

set -e  # Exit on any error

echo "=================================="
echo "🚀 MEGAVERSE LIVE - GO LIVE SCRIPT"
echo "=================================="
echo ""

# Check if running from correct directory
if [ ! -f "index.html" ] || [ ! -f "backend/index.js" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "⚠️  WARNING: This will switch your system to ACCEPT REAL PAYMENTS"
echo "   Ensure you have tested in sandbox mode first!"
echo ""
read -p "Do you want to proceed? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "❌ Cancelled go-live"
    exit 0
fi

echo ""
echo "📋 STEP 1: Gathering Production Credentials"
echo "==========================================="
echo ""
echo "Get these from:"
echo "  Razorpay Live: https://dashboard.razorpay.com/app/settings/api-keys (switch to Live Mode)"
echo "  PayPal Live:   https://developer.paypal.com (switch to Live tab)"
echo ""

read -p "Enter Razorpay LIVE Key ID (starts with rzp_live_): " RAZORPAY_KEY_ID
read -sp "Enter Razorpay LIVE Key Secret: " RAZORPAY_KEY_SECRET
echo ""

read -p "Enter PayPal LIVE Client ID: " PAYPAL_CLIENT_ID
read -sp "Enter PayPal LIVE Client Secret: " PAYPAL_CLIENT_SECRET
echo ""

# Validate inputs
if [ -z "$RAZORPAY_KEY_ID" ] || [ -z "$RAZORPAY_KEY_SECRET" ] || [ -z "$PAYPAL_CLIENT_ID" ] || [ -z "$PAYPAL_CLIENT_SECRET" ]; then
    echo "❌ Error: All credentials are required"
    exit 1
fi

if [[ ! "$RAZORPAY_KEY_ID" =~ ^rzp_live_ ]]; then
    echo "❌ Error: Razorpay Key ID must start with 'rzp_live_' (you provided a test key)"
    exit 1
fi

echo ""
echo "✅ Credentials received"
echo ""

# STEP 2: Update index.html
echo "📝 STEP 2: Updating index.html with live credentials"
echo "===================================================="
echo ""

# Find and replace Razorpay key
OLD_RAZORPAY_PATTERN="RAZORPAY_KEY_ID = '[^']*'"
NEW_RAZORPAY="RAZORPAY_KEY_ID = '$RAZORPAY_KEY_ID'"
sed -i.bak "s/$OLD_RAZORPAY_PATTERN/$NEW_RAZORPAY/g" index.html

# Find and replace PayPal key
OLD_PAYPAL_PATTERN="PAYPAL_CLIENT_ID = '[^']*'"
NEW_PAYPAL="PAYPAL_CLIENT_ID = '$PAYPAL_CLIENT_ID'"
sed -i.bak "s/$OLD_PAYPAL_PATTERN/$NEW_PAYPAL/g" index.html

# Ensure PAYPAL_API_URL is set to live (not sandbox)
sed -i.bak 's|https://api.sandbox.paypal.com|https://api.paypal.com|g' index.html

# Clean up backup files
rm -f index.html.bak

echo "✅ Updated index.html with production keys"
echo ""

# STEP 3: Create .env.production file (for reference)
echo "📝 STEP 3: Creating .env.production file (reference only)"
echo "========================================================"
cat > .env.production << EOF
# Production credentials - DO NOT COMMIT THIS FILE
# Add to .gitignore if not already there

DB_HOST=$DB_HOST
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=bookings
DB_PORT=5432

RAZORPAY_KEY_ID=$RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET=$RAZORPAY_KEY_SECRET

PAYPAL_CLIENT_ID=$PAYPAL_CLIENT_ID
PAYPAL_CLIENT_SECRET=$PAYPAL_CLIENT_SECRET
PAYPAL_API_URL=https://api.paypal.com

FRONTEND_URL=https://megaverselive.netlify.app
EOF

echo "✅ Created .env.production (for reference)"
echo "⚠️  Important: This file is for reference only"
echo "   Actually set these in Render dashboard!"
echo ""

# STEP 4: Display Render instructions
echo "🔧 STEP 4: Update Render Environment Variables"
echo "=============================================="
echo ""
echo "📌 You still need to manually update these in Render Dashboard:"
echo "   https://dashboard.render.com → megaverselive-backend → Environment"
echo ""
echo "   Set these variables:"
echo "   ├─ RAZORPAY_KEY_ID = $RAZORPAY_KEY_ID"
echo "   ├─ RAZORPAY_KEY_SECRET = [your secret]"
echo "   ├─ PAYPAL_CLIENT_ID = $PAYPAL_CLIENT_ID"
echo "   ├─ PAYPAL_CLIENT_SECRET = [your secret]"
echo "   └─ PAYPAL_API_URL = https://api.paypal.com"
echo ""
echo "⏱️  Render will auto-redeploy (2-3 minutes)"
echo ""

# STEP 5: Commit changes
echo "📤 STEP 5: Committing changes to Git"
echo "===================================="
echo ""

git add index.html public/index.html

git commit -m "🚀 Switch to production payment credentials - GOING LIVE

- Updated Razorpay live credentials (Key ID: ${RAZORPAY_KEY_ID:0:20}...)
- Updated PayPal live credentials (Client ID: ${PAYPAL_CLIENT_ID:0:20}...)
- Updated payment API endpoint to live (removed sandbox)
- Platform now accepting REAL payments

⚠️  Backend credentials must be updated in Render dashboard separately
    See: https://dashboard.render.com → Environment tab"

echo "✅ Changes committed"
echo ""

# STEP 6: Push to GitHub
echo "🔄 STEP 7: Pushing to GitHub (triggers Netlify deploy)"
echo "======================================================"
git push origin main

echo "✅ Pushed to GitHub"
echo "⏱️  Netlify will deploy in 1-2 minutes"
echo ""

# STEP 7: Summary
echo "=================================="
echo "✅ FRONTEND GO-LIVE COMPLETE!"
echo "=================================="
echo ""
echo "📋 REMAINING MANUAL STEPS:"
echo ""
echo "1️⃣  Update Render Backend Environment:"
echo "   Go to: https://dashboard.render.com"
echo "   → Select: megaverselive-backend"
echo "   → Click: Environment tab"
echo "   → Update 5 variables (paste your credentials)"
echo "   → Click: Save"
echo "   ⏱️  Wait 2-3 min for auto-redeploy"
echo ""
echo "2️⃣  Configure Razorpay Webhook (if changed):"
echo "   Go to: https://dashboard.razorpay.com"
echo "   → Settings → Webhooks"
echo "   → Update webhook to: https://YOUR_RENDER_URL/api/webhook/razorpay"
echo ""
echo "3️⃣  Configure PayPal Webhook (if changed):"
echo "   Go to: https://developer.paypal.com"
echo "   → Apps & Credentials → Live tab"
echo "   → Update webhook to: https://YOUR_RENDER_URL/api/webhook/paypal"
echo ""
echo "4️⃣  Test a REAL payment:"
echo "   Go to: https://megaverselive.netlify.app"
echo "   → Fill booking form"
echo "   → Complete payment (will be REAL)"
echo "   → Verify in Razorpay/PayPal dashboard"
echo ""
echo "=================================="
echo "🎉 You're ready to go live!"
echo "=================================="
echo ""
echo "Need help? See: GO_LIVE_PRODUCTION.md"
