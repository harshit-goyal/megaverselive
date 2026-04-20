# Azure Free VM Deployment Guide (B1S Ubuntu)

## 📋 Overview

This guide walks through deploying Megaverse Live on Azure's free B1S Ubuntu VM. The entire setup is free for 12 months, then approximately $10-15/month (vs $50+ for managed App Service).

**Total Setup Time:** ~30-45 minutes (mostly automated)

---

## ✅ Prerequisites

- [ ] Azure account with free credits
- [ ] SSH client installed (all OS have this)
- [ ] GitHub account with repo access
- [ ] Database credentials from AZURE_DB_CREDENTIALS.md
- [ ] Payment gateway credentials (Razorpay, PayPal)

---

## 🚀 Phase 1: Create and Configure Azure VM

### Step 1.1: Create B1S Ubuntu VM

```bash
# Via Azure Portal
1. Go to https://portal.azure.com
2. Click "Create a resource"
3. Search for "Ubuntu Server 22.04 LTS"
4. Click "Create"
5. Configure:
   - Subscription: Your free subscription
   - Resource group: Create new (e.g., "megaverse-rg")
   - Virtual machine name: "megaverse-vm"
   - Region: (Central India recommended for latency)
   - Image: Ubuntu Server 22.04 LTS - Gen2
   - Size: B1s (Free tier eligible!)
   - Authentication: SSH public key
     → Generate new key pair (download and save securely)
     → Or use existing key
6. Networking tab:
   - Virtual network: Create new or use existing
   - Public IP: Create new (allocate Standard)
   - NIC network security group: Advanced
     → Create network security group
7. Review and Create
```

### Step 1.2: Configure Security Group (Firewall Rules)

```bash
# Via Portal:
1. Go to Network Security Groups
2. Find "megaverse-vm-nsg"
3. Add Inbound Rules:
   - SSH (port 22) - Allow from your IP (or 0.0.0.0/0)
   - HTTP (port 80) - Allow from 0.0.0.0/0
   - HTTPS (port 443) - Allow from 0.0.0.0/0
```

### Step 1.3: Get VM Details

```bash
# After VM is created:
1. Go to Virtual Machines → megaverse-vm
2. Note down:
   - Public IP address (e.g., 52.xxx.xxx.xxx)
   - Private IP address
3. Test SSH connection:

ssh -i your-key.pem azureuser@52.xxx.xxx.xxx
# You should see Ubuntu command prompt
```

---

## 🛠️ Phase 2: Setup Environment

### Step 2.1: SSH Into VM

```bash
ssh -i your-key.pem azureuser@52.xxx.xxx.xxx
# Now you're inside the VM!
```

### Step 2.2: Update System

```bash
# Update package manager
sudo apt update
sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git build-essential
```

### Step 2.3: Install Node.js 20 LTS

```bash
# Install Node.js 20 LTS using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version    # Should show v20.x.x
npm --version     # Should show npm version
```

### Step 2.4: Install PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Setup PM2 to start on system reboot
pm2 startup
# Copy the output command and run it
# Example: sudo env PATH=$PATH:/usr/bin /usr/local/lib/node_modules/pm2/bin/pm2 startup...
```

### Step 2.5: Install nginx (Reverse Proxy)

```bash
sudo apt install -y nginx

# Enable nginx to start on reboot
sudo systemctl enable nginx

# Start nginx
sudo systemctl start nginx

# Test nginx is running
curl http://localhost
# Should see default nginx page
```

### Step 2.6: Install Certbot (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx

# Note: We'll use this in Phase 5
```

---

## 📦 Phase 3: Deploy Application

### Step 3.1: Clone Repository

```bash
# Navigate to home directory
cd ~

# Clone the repository
git clone https://github.com/harshit-goyal/megaverselive.git
cd megaverselive
```

### Step 3.2: Install Dependencies

```bash
npm install

# This may take 2-3 minutes
```

### Step 3.3: Create Environment File

```bash
# Create .env file with your credentials
cat > .env << 'EOF'
# Database Configuration
DB_HOST=megaverse-db.postgres.database.azure.com
DB_USER=dbadmin@megaverse-db
DB_PASSWORD=!_E}#3!oA7p+DG?W
DB_NAME=bookings
DB_PORT=5432

# Razorpay Credentials
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# PayPal Credentials
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_API_URL=https://api.sandbox.paypal.com

# Frontend URL
FRONTEND_URL=https://megaverselive.com

# Node Environment
NODE_ENV=production
PORT=8080
EOF
```

**⚠️ Important:** Replace credentials with your actual values!

### Step 3.4: Test App Runs

```bash
# Start app in foreground to test
npm start

# You should see:
# "Megaverse Live API running on port 8080"
# "✅ Server started and ready to accept requests"

# Press Ctrl+C to stop
```

### Step 3.5: Start with PM2

```bash
# Start app with PM2
pm2 start backend/index.js --name "megaverse"

# Save PM2 configuration to start on reboot
pm2 save

# Verify app is running
pm2 list
pm2 logs megaverse  # To see logs (Ctrl+C to exit)

# Test app is accessible
curl http://localhost:8080/index.html
```

---

## 🔄 Phase 4: Configure nginx Reverse Proxy

### Step 4.1: Backup Default nginx Config

```bash
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup
```

### Step 4.2: Edit nginx Configuration

```bash
# Edit the default site config
sudo nano /etc/nginx/sites-available/default
```

**Replace the entire file content with:**

```nginx
upstream megaverse_app {
    server 127.0.0.1:8080;
}

server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name _;

    # Redirect all HTTP to HTTPS (after we setup SSL)
    # location / {
    #     return 301 https://$host$request_uri;
    # }

    location / {
        proxy_pass http://megaverse_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files (if needed)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://megaverse_app;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Health check endpoint
    location /health {
        access_log off;
        proxy_pass http://megaverse_app;
    }
}
```

### Step 4.3: Test nginx Config

```bash
# Test configuration syntax
sudo nginx -t

# Should output:
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### Step 4.4: Reload nginx

```bash
sudo systemctl reload nginx

# Test it works
curl http://localhost/index.html
```

---

## 🔐 Phase 5: Setup SSL/TLS with Let's Encrypt

### Step 5.1: Create DNS Record First

**⚠️ Important:** You need to create DNS A record BEFORE getting certificate!

```bash
# Go to your domain registrar and add:
# A record: megaverselive.com → 52.xxx.xxx.xxx (your VM public IP)
# Wait 5-10 minutes for DNS to propagate

# Test DNS is working:
nslookup megaverselive.com
# Should return your VM's IP
```

### Step 5.2: Get Free SSL Certificate

```bash
# Run Certbot with nginx plugin
sudo certbot --nginx -d megaverselive.com

# Follow prompts:
# 1. Enter email for certificate expiration notices
# 2. Accept terms
# 3. Choose whether to redirect HTTP to HTTPS (Choose Y)

# This will:
# - Generate free certificate
# - Automatically update nginx config
# - Enable HTTPS on port 443
# - Setup HTTP→HTTPS redirect
```

### Step 5.3: Verify SSL/TLS

```bash
# Test HTTPS is working
curl https://megaverselive.com/index.html

# Check certificate details
openssl s_client -connect megaverselive.com:443

# Should show "CN = megaverselive.com"
```

### Step 5.4: Setup Auto-Renewal

```bash
# Certbot auto-renewal is usually already enabled
# Test renewal (dry run):
sudo certbot renew --dry-run

# If successful, you're all set!
# Certificates will auto-renew every 60 days
```

---

## 🧪 Phase 6: Testing

### Step 6.1: Test Application

```bash
# From your local machine:

# Test HTTP
curl http://megaverselive.com/index.html

# Test HTTPS (should auto-redirect)
curl https://megaverselive.com/index.html

# Test API
curl https://megaverselive.com/api/health

# Test mentor signup
curl -X POST https://megaverselive.com/api/mentor/onboarding \
  -H "Content-Type: application/json" \
  -d '{
    "track": "tech",
    "fullName": "Test Mentor",
    "email": "test@example.com",
    "password": "TestPass123!",
    "currentRole": "SDE @ Google",
    "linkedinUrl": "https://linkedin.com/in/test",
    "mentorCategories": ["DSA"],
    "bio": "Test bio"
  }'
```

### Step 6.2: Monitor Performance

```bash
# Check cold start time (should be <1 second)
time curl https://megaverselive.com/index.html

# Monitor logs
pm2 logs megaverse

# Check server resources
free -h              # Memory usage
df -h                # Disk usage
top -b -n 1          # CPU usage
```

### Step 6.3: Verify Auto-Restart

```bash
# Kill the app process
pm2 kill megaverse

# Wait 10 seconds - PM2 should auto-restart
pm2 list

# Should show "megaverse" is running again
```

---

## 📊 Maintenance & Monitoring

### Regular Checks

```bash
# Check app status
pm2 status

# View recent logs
pm2 logs megaverse --lines 100

# Check system resources
free -h && df -h && uptime

# Check nginx status
sudo systemctl status nginx

# Check certificate expiration
sudo certbot certificates
```

### Deployment Updates

```bash
# When you have new code to deploy:
cd ~/megaverselive
git pull origin main
npm install  # If dependencies changed
pm2 restart megaverse

# Or do a full reload:
pm2 restart megaverse --force
```

### Troubleshooting

```bash
# If app won't start:
pm2 logs megaverse
npm start  # Run manually to see errors

# If nginx not proxying:
sudo nginx -t
sudo systemctl reload nginx

# If SSL certificate issues:
sudo certbot certificates
sudo certbot renew --force-renewal

# If out of disk space:
du -sh ~/*
sudo apt clean
```

---

## 🎯 Success Criteria

- ✅ VM created and running
- ✅ SSH access working
- ✅ Node.js and npm installed
- ✅ App running on http://localhost:8080
- ✅ nginx serving on port 80
- ✅ SSL certificate installed
- ✅ megaverselive.com resolving to VM
- ✅ https://megaverselive.com working
- ✅ Auto-restart (PM2) working
- ✅ All mentor features working
- ✅ Cold start time <1 second

---

## 💰 Cost Summary

| Resource | First 12 Months | After 12 Months |
|----------|-----------------|-----------------|
| B1S VM | FREE | $10-15/month |
| PostgreSQL | FREE (basic) | $15-30/month |
| Total | **FREE** | **~$25-45/month** |

---

## 🆘 Support & Troubleshooting

### Common Issues

**"Connection refused" when accessing https://megaverselive.com**
- Check if VM is running: Azure Portal → Virtual Machines
- Check if app is running: `pm2 status`
- Check if nginx is running: `sudo systemctl status nginx`
- Check firewall rules allow port 443

**"Certificate domain mismatch"**
- Verify DNS A record points to correct IP
- Wait for DNS to propagate (5-10 minutes)
- Run `nslookup megaverselive.com` to confirm

**"Out of memory" errors**
- Check memory usage: `free -h`
- Stop unnecessary services
- Consider upgrading to B2s ($30/month)

**"PM2 not auto-starting"**
- Run: `pm2 startup`
- Copy and paste the output command
- Run: `pm2 save`

### Getting Help

- Check PM2 logs: `pm2 logs megaverse`
- Check nginx errors: `sudo tail -50 /var/log/nginx/error.log`
- SSH into VM and run commands manually
- Check Azure Portal for VM status and metrics

---

## ✨ Next Steps

1. Go through each phase step-by-step
2. Test each phase completion
3. Monitor performance
4. Setup any additional monitoring tools
5. Plan backup strategy if needed
