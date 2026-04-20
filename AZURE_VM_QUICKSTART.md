# 🚀 Quick Start: Deploy to Azure Free VM

**Total time to production:** ~30 minutes

---

## Step 1: Create Azure VM (5 minutes)

```
Azure Portal → Create Resource → Ubuntu Server 22.04 LTS
- Size: B1S (free tier)
- Region: Central India (or your region)
- Authentication: SSH key pair
- Network: Allow ports 22, 80, 443
```

**After creation:**
- Copy Public IP address (e.g., 52.xxx.xxx.xxx)
- Download SSH key pair

---

## Step 2: SSH Into VM

```bash
# On your local machine:
ssh -i your-key.pem azureuser@52.xxx.xxx.xxx
```

---

## Step 3: Setup Environment (5 minutes)

```bash
# Inside VM:
curl -O https://raw.githubusercontent.com/harshit-goyal/megaverselive/main/scripts/azure-vm-setup.sh
chmod +x azure-vm-setup.sh
./azure-vm-setup.sh

# When prompted, copy and paste the PM2 startup command
```

---

## Step 4: Deploy App (5 minutes)

```bash
# Inside VM:
curl -O https://raw.githubusercontent.com/harshit-goyal/megaverselive/main/scripts/azure-vm-deploy.sh
chmod +x azure-vm-deploy.sh

# Before running, create .env file:
cat > ~/megaverselive/.env << 'EOF'
DB_HOST=megaverse-db.postgres.database.azure.com
DB_USER=dbadmin@megaverse-db
DB_PASSWORD=!_E}#3!oA7p+DG?W
DB_NAME=bookings
DB_PORT=5432
RAZORPAY_KEY_ID=your_key_here
RAZORPAY_KEY_SECRET=your_secret_here
PAYPAL_CLIENT_ID=your_id_here
PAYPAL_CLIENT_SECRET=your_secret_here
PAYPAL_API_URL=https://api.sandbox.paypal.com
FRONTEND_URL=https://megaverselive.com
NODE_ENV=production
PORT=8080
EOF

# Then deploy:
./azure-vm-deploy.sh
```

---

## Step 5: Configure nginx (5 minutes)

```bash
# Edit nginx config
sudo nano /etc/nginx/sites-available/default

# Replace with content from AZURE_VM_DEPLOYMENT.md, Phase 4
# (Copy the full nginx upstream config)

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

---

## Step 6: Setup SSL (5 minutes)

```bash
# First, update DNS A record to point to your VM IP
# Wait 5-10 minutes for DNS to propagate
# Then:

sudo certbot --nginx -d megaverselive.com

# Follow prompts:
# - Enter email
# - Accept terms
# - Choose to redirect HTTP to HTTPS
```

---

## Step 7: Test & Verify

```bash
# From your local machine:

# Test HTTP (should redirect to HTTPS)
curl -i http://megaverselive.com

# Test HTTPS
curl https://megaverselive.com

# Test API
curl https://megaverselive.com/api/mentor/applications

# Verify cold start (<1 second)
time curl https://megaverselive.com
```

---

## 📊 That's It! You're Live 🎉

- ✅ App deployed to Azure VM
- ✅ Domain: megaverselive.com pointing to VM
- ✅ SSL/HTTPS enabled
- ✅ Auto-restart on crash (PM2)
- ✅ Auto-start on reboot
- ✅ <1 second cold start
- ✅ ~$0 for 12 months, then $10-15/month

---

## 📚 Detailed Guide

For more details, see: **AZURE_VM_DEPLOYMENT.md**

---

## 🆘 Troubleshooting

**Can't SSH?**
- Check security group allows port 22
- Verify IP matches Azure Portal
- Try: `ssh -v -i key.pem azureuser@IP` for debug

**App not responding?**
- Check: `pm2 status`
- View logs: `pm2 logs megaverse`
- Check nginx: `sudo systemctl status nginx`

**Certificate issues?**
- Verify DNS: `nslookup megaverselive.com`
- Renew: `sudo certbot renew --force-renewal`

**Out of space?**
- Check: `df -h`
- Clean: `sudo apt clean`

---

## 📞 Support Commands

```bash
# Application
pm2 status                           # Check status
pm2 logs megaverse                   # View logs
pm2 restart megaverse                # Restart app
sudo systemctl restart nginx         # Restart nginx

# System
free -h                              # Memory usage
df -h                                # Disk usage
uptime                               # Server uptime
sudo systemctl status certbot.timer  # SSL renewal

# Monitoring
curl https://megaverselive.com       # Test endpoint
curl -i https://megaverselive.com    # With headers
```

---

**Next:** Check AZURE_VM_DEPLOYMENT.md for detailed instructions!
