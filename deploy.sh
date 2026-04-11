#!/bin/bash

# Master deployment script - orchestrates entire deployment

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

clear
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════╗"
echo "║  Megaverse Live - One-Click Azure Deploy   ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"

# Check prerequisites
echo -e "\n${YELLOW}Checking prerequisites...${NC}"

if ! command -v az &> /dev/null; then
    echo -e "${RED}Error: Azure CLI not installed${NC}"
    echo "Install: https://learn.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo -e "${RED}Error: Git not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites OK${NC}"

# Step 1: Setup
echo -e "\n${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${YELLOW}STEP 1: Azure Infrastructure Setup${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo "This will create:"
echo "  • Resource Group (megaverse-rg)"
echo "  • App Service F1 (free tier)"
echo "  • PostgreSQL Database B1ms (free tier)"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    bash deploy-azure.sh
else
    echo "Skipped"
    exit 1
fi

# Step 2: Database
echo -e "\n${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${YELLOW}STEP 2: Database Schema${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"

if [ ! -f backend/.env ]; then
    echo -e "${RED}Error: backend/.env not found${NC}"
    echo "Copy backend/.env.example to backend/.env and fill in database credentials"
    exit 1
fi

read -p "Continue with database setup? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    bash deploy-database.sh
else
    echo "Skipped"
fi

# Step 3: Backend
echo -e "\n${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${YELLOW}STEP 3: Deploy Backend${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo "This will push code to Azure"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    bash deploy-backend.sh
else
    echo "Skipped"
fi

# Success
echo -e "\n${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ DEPLOYMENT COMPLETE!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"

echo -e "\n${YELLOW}Next Steps:${NC}"
echo "1. Get your API URL from Azure Portal"
echo "2. Update FRONTEND_INTEGRATION.md with your API URL"
echo "3. Add booking calendar to index.html"
echo "4. Test a booking!"
echo ""
echo -e "${GREEN}🚀 Your Megaverse Live platform is live!${NC}"

