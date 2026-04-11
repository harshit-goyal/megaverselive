#!/bin/bash

# Megaverse Live - Complete Azure Deployment Script
# Usage: bash deploy-azure.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Megaverse Live - Azure Deployment${NC}"
echo "========================================"

# Configuration
RESOURCE_GROUP="megaverse-rg"
APP_SERVICE_NAME="megaverse-api"
APP_SERVICE_PLAN="megaverse-plan"
DB_SERVER="megaverse-db"
DB_NAME="megaverse_db"
DB_ADMIN="dbadmin"
REGION="centralindia"
ENVIRONMENT_FILE=".env"

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI not found. Install it:${NC}"
    echo "   https://learn.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Step 1: Login to Azure
echo -e "\n${YELLOW}📝 Step 1: Logging in to Azure...${NC}"
az login

# Step 2: Create Resource Group
echo -e "\n${YELLOW}🏗️  Step 2: Creating Resource Group...${NC}"
az group create --name $RESOURCE_GROUP --location $REGION
echo -e "${GREEN}✅ Resource group created${NC}"

# Step 3: Create App Service Plan (Free tier)
echo -e "\n${YELLOW}🏗️  Step 3: Creating App Service Plan (F1 free tier)...${NC}"
az appservice plan create \
  --name $APP_SERVICE_PLAN \
  --resource-group $RESOURCE_GROUP \
  --sku F1 \
  --is-linux
echo -e "${GREEN}✅ App Service Plan created${NC}"

# Step 4: Create App Service
echo -e "\n${YELLOW}🏗️  Step 4: Creating App Service...${NC}"
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan $APP_SERVICE_PLAN \
  --name $APP_SERVICE_NAME \
  --runtime "NODE|20-lts"
echo -e "${GREEN}✅ App Service created${NC}"

# Step 5: Create PostgreSQL Database
echo -e "\n${YELLOW}🏗️  Step 5: Creating PostgreSQL Database (B1ms free tier)...${NC}"
az postgres flexible-server create \
  --resource-group $RESOURCE_GROUP \
  --name $DB_SERVER \
  --location $REGION \
  --admin-user $DB_ADMIN \
  --admin-password "$(openssl rand -base64 12)" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --public-access all \
  --yes
echo -e "${GREEN}✅ PostgreSQL Database created${NC}"

# Step 6: Get database connection string
echo -e "\n${YELLOW}📋 Step 6: Getting database credentials...${NC}"
DB_HOST=$(az postgres flexible-server show --resource-group $RESOURCE_GROUP --name $DB_SERVER --query "fqdnFullyQualified" -o tsv)
DB_PASSWORD=$(az postgres flexible-server show --resource-group $RESOURCE_GROUP --name $DB_SERVER --query "administratorLoginPassword" -o tsv 2>/dev/null || echo "Check Azure Portal")
echo -e "${GREEN}✅ Database Host: $DB_HOST${NC}"

# Step 7: Create database
echo -e "\n${YELLOW}📋 Step 7: Creating database...${NC}"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U "${DB_ADMIN}@${DB_SERVER}" -d postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo "Database may already exist"
echo -e "${GREEN}✅ Database created${NC}"

# Step 8: Get App Service details
echo -e "\n${YELLOW}📋 Step 8: Getting App Service details...${NC}"
APP_SERVICE_URL=$(az webapp show --resource-group $RESOURCE_GROUP --name $APP_SERVICE_NAME --query "defaultHostName" -o tsv)
echo -e "${GREEN}✅ App Service URL: https://$APP_SERVICE_URL${NC}"

# Summary
echo -e "\n${GREEN}========================================"
echo "✅ DEPLOYMENT COMPLETE!"
echo "========================================${NC}"
echo -e "\n${YELLOW}📊 Your Azure Resources:${NC}"
echo "   Resource Group: $RESOURCE_GROUP"
echo "   App Service: https://$APP_SERVICE_URL"
echo "   Database Host: $DB_HOST"
echo "   Database Name: $DB_NAME"
echo "   Database Admin: $DB_ADMIN"

echo -e "\n${YELLOW}📝 Next Steps:${NC}"
echo "1. Check your email/portal for database password"
echo "2. Update .env with credentials:"
echo "   DB_HOST=$DB_HOST"
echo "   DB_USER=${DB_ADMIN}@${DB_SERVER}"
echo "   DB_NAME=$DB_NAME"
echo "3. Run: bash deploy-database.sh"
echo "4. Run: bash deploy-backend.sh"

echo -e "\n${GREEN}🎉 Done!${NC}"
