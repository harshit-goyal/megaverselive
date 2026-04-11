#!/bin/bash

# TEST BACKEND AFTER DEPLOYMENT
# Run this to verify your backend is working

RENDER_URL="${1}"

if [ -z "$RENDER_URL" ]; then
    echo "Usage: bash test-backend.sh <RENDER_URL>"
    echo "Example: bash test-backend.sh https://megaverselive-backend.onrender.com"
    exit 1
fi

echo "════════════════════════════════════════════════════════"
echo "  BACKEND DEPLOYMENT TEST"
echo "════════════════════════════════════════════════════════"
echo ""
echo "Testing: $RENDER_URL"
echo ""

# Test 1: Basic connectivity
echo "1️⃣  Testing basic connectivity..."
if curl -s -f "$RENDER_URL/api/book" > /dev/null 2>&1; then
    echo "   ✅ Backend is responding"
else
    echo "   ⚠️  Backend might still be starting (wait 2-3 min)"
    echo "   Retrying..."
    sleep 5
fi

# Test 2: Check endpoints
echo ""
echo "2️⃣  Available endpoints:"
echo "   • GET  $RENDER_URL/api/book (booking endpoints)"
echo "   • POST $RENDER_URL/api/razorpay/create-order"
echo "   • POST $RENDER_URL/api/webhook/razorpay"
echo "   • POST $RENDER_URL/api/paypal/create-order"
echo "   • POST $RENDER_URL/api/webhook/paypal"
echo ""

# Test 3: Sample request
echo "3️⃣  Testing sample Razorpay order creation..."
SAMPLE_RESPONSE=$(curl -s -X POST "$RENDER_URL/api/razorpay/create-order" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","phone":"9999999999","date":"2026-04-15T10:00:00Z"}' 2>&1)

if echo "$SAMPLE_RESPONSE" | grep -q "razorpay_order_id\|error"; then
    echo "   ✅ Backend is working!"
    echo "   Response: $SAMPLE_RESPONSE" | head -c 100
    echo ""
else
    echo "   ⚠️  Check backend logs on Render"
fi

echo ""
echo "════════════════════════════════════════════════════════"
echo "  SUMMARY"
echo "════════════════════════════════════════════════════════"
echo ""
echo "✅ Backend deployed to: $RENDER_URL"
echo ""
echo "Next steps:"
echo "1. Configure webhooks (see WEBHOOK_URLS_TO_ADD.md)"
echo "2. Update frontend with payment methods"
echo "3. Test payments in sandbox"
echo "4. Go live!"
echo ""
echo "════════════════════════════════════════════════════════"
echo ""
