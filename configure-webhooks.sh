#!/bin/bash

# WEBHOOK CONFIGURATION AUTOMATION
# After deploying to Render, run this to set up webhooks

set -e

RENDER_URL="${1}"

if [ -z "$RENDER_URL" ]; then
    echo "Usage: bash configure-webhooks.sh <RENDER_URL>"
    echo "Example: bash configure-webhooks.sh https://megaverselive-backend.onrender.com"
    exit 1
fi

echo "════════════════════════════════════════════════════════"
echo "  WEBHOOK CONFIGURATION AUTOMATION"
echo "════════════════════════════════════════════════════════"
echo ""
echo "Backend URL: $RENDER_URL"
echo ""

# Generate webhook URLs
RAZORPAY_WEBHOOK="$RENDER_URL/api/webhook/razorpay"
PAYPAL_WEBHOOK="$RENDER_URL/api/webhook/paypal"

echo "Razorpay Webhook URL: $RAZORPAY_WEBHOOK"
echo "PayPal Webhook URL:   $PAYPAL_WEBHOOK"
echo ""

# Create a markdown file with instructions
cat > WEBHOOK_URLS_TO_ADD.md << EOF
# Webhook Configuration - Copy These URLs

## Razorpay Webhook

**URL:** \`$RAZORPAY_WEBHOOK\`

**Setup Steps:**
1. Go to https://dashboard.razorpay.com/app/settings/webhooks
2. Click "Add New Webhook"
3. Paste URL: \`$RAZORPAY_WEBHOOK\`
4. Events: Check \`payment.authorized\` and \`order.paid\`
5. Click "Create Webhook"

---

## PayPal Webhook

**URL:** \`$PAYPAL_WEBHOOK\`

**Setup Steps:**
1. Go to https://developer.paypal.com
2. Click "Apps & Credentials" → Sandbox tab
3. Find your Business Account and click (•••) menu
4. Select "Manage Webhooks"
5. Click "Add Webhook"
6. Paste URL: \`$PAYPAL_WEBHOOK\`
7. Event: Select \`PAYMENT.SALE.COMPLETED\`
8. Click "Add Webhook"

---

✅ After setting up both webhooks, your platform is ready to test!

EOF

echo "✅ Generated: WEBHOOK_URLS_TO_ADD.md"
echo ""
echo "════════════════════════════════════════════════════════"
echo ""
echo "📋 MANUAL WEBHOOK SETUP (Copy & Paste):"
echo ""
echo "1️⃣  RAZORPAY:"
echo "   URL: $RAZORPAY_WEBHOOK"
echo "   Dashboard: https://dashboard.razorpay.com/app/settings/webhooks"
echo ""
echo "2️⃣  PAYPAL:"
echo "   URL: $PAYPAL_WEBHOOK"
echo "   Dashboard: https://developer.paypal.com → Sandbox"
echo ""
echo "════════════════════════════════════════════════════════"
echo ""
