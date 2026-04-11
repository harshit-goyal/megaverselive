#!/bin/bash
# Backend Deployment to Azure
# Run this to deploy your Node.js backend to the running App Service

set -e

echo "🚀 Deploying Megaverse Live backend to Azure..."
echo ""

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
cd /Users/harshit/megaverselive/backend
npm install --production

# Step 2: Test that it starts
echo "🧪 Testing backend starts..."
timeout 5 npm start || true

# Step 3: Create deployment zip
echo "📦 Creating deployment package..."
cd /Users/harshit/megaverselive
rm -f backend-deploy.zip
zip -r backend-deploy.zip backend/package.json backend/package-lock.json backend/index.js backend/services backend/.env backend/schema.sql

# Step 4: Deploy to Azure
echo "☁️  Uploading to Azure..."
az webapp deployment source config-zip \
  -n megaverse-api \
  -g megaverse-rg \
  --src backend-deploy.zip

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🧪 Testing API health (wait 30 seconds for app to start)..."
sleep 30

# Test health endpoint
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" https://megaverse-api.azurewebsites.net/api/health)
if [ "$HEALTH" = "200" ]; then
  echo "✅ API is responding!"
  echo ""
  echo "📋 Next steps:"
  echo "1. Add Stripe keys to backend/.env (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET)"
  echo "2. Add email credentials to backend/.env (EMAIL_USER, EMAIL_PASSWORD)"
  echo "3. Redeploy: ./deploy-backend.sh"
  echo "4. Initialize slots: curl -X POST https://megaverse-api.azurewebsites.net/api/admin/init-slots"
  echo "5. Add booking calendar to index.html (see FRONTEND_INTEGRATION.md)"
else
  echo "⚠️  API returned status: $HEALTH"
  echo "Check logs: az webapp log tail -n megaverse-api -g megaverse-rg"
fi
