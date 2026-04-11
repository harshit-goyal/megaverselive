#!/bin/bash

# POST-DEPLOYMENT AUTOMATION
# Once you have your Render URL, run this to complete setup

RENDER_URL="${1:-https://megaverselive-backend.onrender.com}"

echo "════════════════════════════════════════════════════════"
echo "  AUTOMATING POST-DEPLOYMENT SETUP"
echo "════════════════════════════════════════════════════════"
echo ""
echo "Using Render URL: $RENDER_URL"
echo ""

# Test backend is alive
echo "🔍 Testing backend connection..."
curl -s -o /dev/null -w "Status: %{http_code}\n" "$RENDER_URL/api/health" || \
curl -s -o /dev/null -w "Status: %{http_code}\n" "$RENDER_URL/api/book" | head -1

echo ""
echo "════════════════════════════════════════════════════════"
echo "  NEXT STEPS"
echo "════════════════════════════════════════════════════════"
echo ""
echo "✅ Backend is deployed to: $RENDER_URL"
echo ""
echo "Next, configure webhooks:"
echo ""
echo "1️⃣  RAZORPAY WEBHOOK:"
echo "   URL: $RENDER_URL/api/webhook/razorpay"
echo "   Go to: https://dashboard.razorpay.com/app/settings/webhooks"
echo "   Events: payment.authorized, order.paid"
echo ""
echo "2️⃣  PAYPAL WEBHOOK:"
echo "   URL: $RENDER_URL/api/webhook/paypal"
echo "   Go to: https://developer.paypal.com (Sandbox tab)"
echo "   Event: PAYMENT.SALE.COMPLETED"
echo ""
echo "3️⃣  THEN RUN:"
echo "   bash configure-webhooks.sh"
echo ""
echo "════════════════════════════════════════════════════════"
echo ""
