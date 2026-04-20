#!/bin/bash

# Azure VM - Application Deployment Script
# Run this on the VM to deploy the app

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

APP_DIR="$HOME/megaverselive"
APP_NAME="megaverse"

echo -e "${GREEN}📦 Megaverse Live - Deployment Script${NC}"
echo "========================================="

# Step 1: Clone/Pull Repository
if [ -d "$APP_DIR" ]; then
    echo -e "\n${YELLOW}🔄 Updating repository...${NC}"
    cd "$APP_DIR"
    git pull origin main
else
    echo -e "\n${YELLOW}📥 Cloning repository...${NC}"
    cd "$HOME"
    git clone https://github.com/harshit-goyal/megaverselive.git
    cd "$APP_DIR"
fi

echo -e "${GREEN}✅ Repository updated${NC}"

# Step 2: Install Dependencies
echo -e "\n${YELLOW}📚 Installing npm dependencies...${NC}"
npm install

echo -e "${GREEN}✅ Dependencies installed${NC}"

# Step 3: Check if .env exists
if [ ! -f "$APP_DIR/.env" ]; then
    echo -e "\n${RED}❌ ERROR: .env file not found!${NC}"
    echo -e "${YELLOW}Please create $APP_DIR/.env with the following:${NC}"
    cat << 'EOF'

DB_HOST=megaverse-db.postgres.database.azure.com
DB_USER=dbadmin@megaverse-db
DB_PASSWORD=your_password
DB_NAME=bookings
DB_PORT=5432
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
PAYPAL_CLIENT_ID=your_id
PAYPAL_CLIENT_SECRET=your_secret
PAYPAL_API_URL=https://api.sandbox.paypal.com
FRONTEND_URL=https://megaverselive.com
NODE_ENV=production
PORT=8080

EOF
    exit 1
fi

echo -e "${GREEN}✅ .env file found${NC}"

# Step 4: Start/Restart with PM2
echo -e "\n${YELLOW}🚀 Starting application with PM2...${NC}"

# Check if app is already running
if pm2 list | grep -q "$APP_NAME"; then
    echo "Restarting existing app..."
    pm2 restart "$APP_NAME"
else
    echo "Starting new app..."
    pm2 start backend/index.js --name "$APP_NAME"
fi

# Save PM2 config
pm2 save

echo -e "${GREEN}✅ Application started${NC}"

# Step 5: Verify
sleep 2
echo -e "\n${YELLOW}✓ Verifying application...${NC}"

pm2 status | grep "$APP_NAME"

# Try to connect to app
if curl -s http://localhost:8080/index.html > /dev/null 2>&1; then
    echo -e "${GREEN}✅ App is responding on port 8080${NC}"
else
    echo -e "${RED}⚠️  App may not be responding. Check logs:${NC}"
    echo "   pm2 logs $APP_NAME"
fi

# Summary
echo -e "\n${GREEN}========================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "==========================================${NC}"

echo -e "\n${YELLOW}📊 Status:${NC}"
pm2 list

echo -e "\n${YELLOW}🔍 Logs:${NC}"
echo "   pm2 logs $APP_NAME"

echo -e "\n${YELLOW}🌐 Access application:${NC}"
echo "   http://megaverselive.com (should redirect to HTTPS)"
echo "   https://megaverselive.com"

echo -e "\n${YELLOW}📝 Useful Commands:${NC}"
echo "   pm2 status              — Show app status"
echo "   pm2 logs $APP_NAME      — View logs"
echo "   pm2 stop $APP_NAME      — Stop app"
echo "   pm2 restart $APP_NAME   — Restart app"
echo "   pm2 delete $APP_NAME    — Remove from PM2"

echo -e "\n${GREEN}🎉 Done!${NC}"
