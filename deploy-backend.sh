#!/bin/bash

# Deploy backend to Azure App Service

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🚀 Deploying Backend to Azure${NC}"
echo "=============================="

RESOURCE_GROUP="megaverse-rg"
APP_SERVICE_NAME="megaverse-api"

if [ ! -f backend/.env ]; then
    echo -e "${RED}Error: backend/.env not found${NC}"
    exit 1
fi

source backend/.env

echo -e "${YELLOW}Setting environment variables in Azure...${NC}"

# Set all env vars
az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $APP_SERVICE_NAME \
  --settings \
    DB_HOST="$DB_HOST" \
    DB_USER="$DB_USER" \
    DB_PASSWORD="$DB_PASSWORD" \
    DB_NAME="$DB_NAME" \
    DB_PORT=5432 \
    STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY" \
    STRIPE_PUBLISHABLE_KEY="$STRIPE_PUBLISHABLE_KEY" \
    STRIPE_WEBHOOK_SECRET="$STRIPE_WEBHOOK_SECRET" \
    EMAIL_SERVICE="$EMAIL_SERVICE" \
    PORT=8080 \
    NODE_ENV=production

echo -e "${GREEN}Environment variables set${NC}"

echo -e "${YELLOW}Pushing code to Azure...${NC}"

git config user.email "harshit@megaverselive.com"
git config user.name "Harshit Goyal"
git add .
git commit -m "Deploy Megaverse backend to Azure" || true
git push azure main

echo -e "${GREEN}✅ Deployment complete!${NC}"
