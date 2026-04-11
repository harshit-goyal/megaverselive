#!/bin/bash

# DEPLOYMENT HELPER - Guides you through each step
# This script helps you deploy without exposing credentials

set -e

echo "================================================"
echo "🚀 MEGAVERSE LIVE - DEPLOYMENT HELPER"
echo "================================================"
echo ""
echo "This script will guide you through deployment."
echo "Credentials will be entered directly into Render."
echo ""

# Step 1: Razorpay
echo "📋 STEP 1: Razorpay Credentials"
echo "================================"
echo ""
echo "Go to: https://dashboard.razorpay.com/app/settings/api-keys"
echo ""
read -p "Enter your Razorpay Key ID (rzp_live_...): " RAZORPAY_KEY_ID
read -sp "Enter your Razorpay Key Secret: " RAZORPAY_KEY_SECRET
echo ""
echo ""

# Step 2: PayPal
echo "📋 STEP 2: PayPal Credentials"
echo "==============================="
echo ""
echo "Go to: https://developer.paypal.com"
echo "Navigate to: Apps & Credentials → Sandbox tab"
echo ""
read -p "Enter your PayPal Client ID: " PAYPAL_CLIENT_ID
read -sp "Enter your PayPal Client Secret: " PAYPAL_CLIENT_SECRET
echo ""
echo ""

# Step 3: Azure DB
echo "📋 STEP 3: Azure Database"
echo "=========================="
echo ""
echo "Go to: https://portal.azure.com"
echo "Search for your PostgreSQL database"
echo "Copy connection details from 'Connection strings'"
echo ""
read -p "Enter Azure DB Host (postgresql-xxx.postgres.database.azure.com): " DB_HOST
read -p "Enter Azure DB User (xxx@servername): " DB_USER
read -sp "Enter Azure DB Password: " DB_PASSWORD
echo ""
echo ""

# Step 4: Confirm
echo "✅ READY TO DEPLOY"
echo "=================="
echo ""
echo "Your credentials are ready."
echo ""
echo "Next steps:"
echo "1. Go to https://render.com"
echo "2. Create a new Web Service"
echo "3. Connect your GitHub repo (megaverselive)"
echo "4. Use these settings:"
echo ""
echo "  Name: megaverselive-backend"
echo "  Branch: main"
echo "  Build Command: npm install"
echo "  Start Command: node backend/index.js"
echo "  Runtime: Node"
echo "  Plan: Free"
echo ""
echo "5. Add these environment variables:"
cat << EOF

  DB_HOST = ${DB_HOST}
  DB_USER = ${DB_USER}
  DB_PASSWORD = ${DB_PASSWORD}
  DB_NAME = bookings
  DB_PORT = 5432
  RAZORPAY_KEY_ID = ${RAZORPAY_KEY_ID}
  RAZORPAY_KEY_SECRET = ${RAZORPAY_KEY_SECRET}
  PAYPAL_CLIENT_ID = ${PAYPAL_CLIENT_ID}
  PAYPAL_CLIENT_SECRET = ${PAYPAL_CLIENT_SECRET}
  PAYPAL_API_URL = https://api.sandbox.paypal.com
  FRONTEND_URL = https://megaverselive.netlify.app

EOF

echo "6. Click 'Create Web Service'"
echo "7. Wait 2-3 minutes for deployment"
echo "8. Copy your Render URL (e.g., https://megaverselive-backend.onrender.com)"
echo ""
echo "✨ Then follow WEBHOOK_CONFIGURATION.md to complete setup"
echo ""
