#!/bin/bash

# Azure VM - Environment Setup Script
# Automates installation of Node.js, PM2, nginx, and Certbot
# Run this AFTER SSHing into the VM

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 Azure VM Environment Setup${NC}"
echo "========================================"

# Step 1: Update system
echo -e "\n${YELLOW}📦 Step 1: Updating system packages...${NC}"
sudo apt update
sudo apt upgrade -y
sudo apt install -y curl wget git build-essential

echo -e "${GREEN}✅ System updated${NC}"

# Step 2: Install Node.js 20 LTS
echo -e "\n${YELLOW}🔧 Step 2: Installing Node.js 20 LTS...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

echo -e "${GREEN}✅ Node.js installed${NC}"
echo "   Version: $(node --version)"
echo "   npm: $(npm --version)"

# Step 3: Install PM2
echo -e "\n${YELLOW}⚙️  Step 3: Installing PM2...${NC}"
sudo npm install -g pm2

echo -e "${GREEN}✅ PM2 installed${NC}"
echo "   Version: $(pm2 --version)"

# Step 4: Setup PM2 startup
echo -e "\n${YELLOW}🔄 Step 4: Setting up PM2 auto-startup...${NC}"
pm2 startup
echo -e "${YELLOW}📝 IMPORTANT: Copy and run the command shown above!${NC}"
echo -e "${YELLOW}    It will look like: sudo env PATH=\$PATH:/usr/bin ...${NC}"
read -p "Press Enter after you've run the startup command... "

# Step 5: Install nginx
echo -e "\n${YELLOW}🌐 Step 5: Installing nginx...${NC}"
sudo apt install -y nginx

sudo systemctl enable nginx
sudo systemctl start nginx

echo -e "${GREEN}✅ nginx installed and started${NC}"

# Step 6: Install Certbot
echo -e "\n${YELLOW}🔐 Step 6: Installing Certbot (Let's Encrypt)...${NC}"
sudo apt install -y certbot python3-certbot-nginx

echo -e "${GREEN}✅ Certbot installed${NC}"

# Summary
echo -e "\n${GREEN}========================================"
echo "✅ ENVIRONMENT SETUP COMPLETE!"
echo "========================================${NC}"

echo -e "\n${YELLOW}📊 Installed Versions:${NC}"
echo "   Node.js: $(node --version)"
echo "   npm: $(npm --version)"
echo "   PM2: $(pm2 --version)"
echo "   nginx: $(nginx -v 2>&1 | cut -d' ' -f3)"

echo -e "\n${YELLOW}📝 Next Steps:${NC}"
echo "1. Clone repository:"
echo "   cd ~ && git clone https://github.com/harshit-goyal/megaverselive.git"
echo ""
echo "2. Install dependencies:"
echo "   cd megaverselive && npm install"
echo ""
echo "3. Create .env file with your credentials"
echo ""
echo "4. Configure nginx (edit /etc/nginx/sites-available/default)"
echo ""
echo "5. Start app with PM2:"
echo "   pm2 start backend/index.js --name 'megaverse'"
echo ""
echo "6. Setup SSL:"
echo "   sudo certbot --nginx -d megaverselive.com"

echo -e "\n${GREEN}🎉 Ready to deploy!${NC}"
