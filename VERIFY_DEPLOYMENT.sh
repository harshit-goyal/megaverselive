#!/bin/bash

echo "=== MEGAVERSE LIVE - DEPLOYMENT VERIFICATION ==="
echo ""

# Test Netlify subdomain
echo "1️⃣  Testing Netlify subdomain (https://megaverselive.netlify.app)..."
NETLIFY_TEST=$(curl -s -o /dev/null -w "%{http_code}" "https://megaverselive.netlify.app" 2>/dev/null)
if [ "$NETLIFY_TEST" = "200" ]; then
    echo "✅ WORKS! Site is live at https://megaverselive.netlify.app"
else
    echo "❌ NOT WORKING - HTTP status: $NETLIFY_TEST"
    echo "   Check if Netlify deployment is complete"
fi

echo ""

# Check git status
echo "2️⃣  Checking if code is on GitHub..."
LATEST_COMMIT=$(git log --oneline -1 2>/dev/null)
BRANCH=$(git branch --show-current 2>/dev/null)
if [ ! -z "$LATEST_COMMIT" ]; then
    echo "✅ Latest commit ($BRANCH): $LATEST_COMMIT"
else
    echo "❌ Not a git repository"
fi

echo ""

# Check for HTML
echo "3️⃣  Checking HTML file..."
if [ -f "public/index.html" ]; then
    SIZE=$(wc -l < public/index.html)
    echo "✅ public/index.html exists ($SIZE lines)"
    if grep -q "Megaverse Live" public/index.html; then
        echo "✅ Content looks correct"
    fi
else
    echo "❌ public/index.html not found!"
fi

echo ""
echo "=== WHAT TO DO NEXT ==="
echo ""
echo "📍 Option 1: Use the Netlify subdomain immediately"
echo "   Share: https://megaverselive.netlify.app"
echo "   This works NOW (no DNS wait needed)"
echo ""
echo "📍 Option 2: Point megaverselive.com to Netlify"
echo "   Steps:"
echo "   1. Find where you registered megaverselive.com"
echo "   2. Login and go to domain/DNS settings"
echo "   3. Change nameservers to:"
echo "      - dns1.p07.nsone.net"
echo "      - dns2.p07.nsone.net"
echo "      - dns3.p07.nsone.net"
echo "      - dns4.p07.nsone.net"
echo "   4. Wait 24-48 hours"
echo ""
echo "📍 For detailed instructions, see: DNS_SETUP_GUIDE.md"
echo ""
