# Automated Azure Deployment - Ready to Go!

## 🚀 One-Command Deployment

Everything is ready to deploy. Just run:

```bash
cd /Users/harshit/megaverselive
bash deploy.sh
```

This will:
1. **Create Azure Resources** (App Service F1 + PostgreSQL B1ms - both FREE)
2. **Setup Database** (Run schema.sql)
3. **Deploy Backend** (Push code to Azure)

**Total time: ~10-15 minutes**

---

## 📋 What You Need

1. **Azure Account** - Go to https://portal.azure.com (sign in with harshit_goyal@outlook.com)
2. **Stripe API Keys** - From https://dashboard.stripe.com
3. **Email Service** - Gmail app password or SendGrid API key

---

## 🔧 Configure Before Deployment

### 1. Create `.env` file

```bash
cd backend
cp .env.example .env
```

### 2. Edit `.env` with your credentials

**Database** (will be filled automatically after `deploy-azure.sh`):
```
DB_HOST=megaverse-db.postgres.database.azure.com
DB_USER=dbadmin@megaverse-db
DB_PASSWORD=<get from Azure Portal>
DB_NAME=megaverse_db
DB_PORT=5432
```

**Stripe** (get from https://dashboard.stripe.com):
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Email** (choose one):
```
# Gmail
EMAIL_SERVICE=gmail
EMAIL_USER=your@gmail.com
EMAIL_PASSWORD=app_password_here

# OR SendGrid
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG...
```

---

## 🚀 Deploy Now!

```bash
bash deploy.sh
```

The script will:
1. Log you in to Azure (opens browser)
2. Create all resources
3. Deploy the backend
4. Test the API

---

## 📊 Deployment Scripts

| Script | Purpose |
|--------|---------|
| `deploy.sh` | Master orchestrator (run this!) |
| `deploy-azure.sh` | Create Azure resources |
| `deploy-database.sh` | Setup PostgreSQL schema |
| `deploy-backend.sh` | Deploy code to App Service |

---

## ✅ After Deployment

1. **Get your API URL:**
   ```bash
   # You'll see this after deployment
   # https://megaverse-api.azurewebsites.net
   ```

2. **Update your website:**
   - Follow `backend/FRONTEND_INTEGRATION.md`
   - Update API URL in index.html
   - Add Stripe publishable key

3. **Test a booking:**
   - Visit your website
   - Select a time slot
   - Book with test card: `4242 4242 4242 4242`

4. **Verify:**
   - Confirmation email received
   - Payment shows in Stripe dashboard
   - Booking in database

---

## 🆘 Troubleshooting

**"Azure CLI not installed"**
```bash
brew install azure-cli
```

**"Connection timeout"**
- Check PostgreSQL firewall rules in Azure Portal
- Ensure server is running

**"Deployment failed"**
- Check environment variables are set correctly
- Review deployment logs: `az webapp log tail --resource-group megaverse-rg --name megaverse-api`

**"Payment not working"**
- Verify Stripe webhook is configured
- Check STRIPE_WEBHOOK_SECRET is set

---

## 💰 Cost Check

After deployment, verify free tier:

```bash
# Check app service
az appservice plan show --resource-group megaverse-rg --name megaverse-plan

# Check database
az postgres flexible-server show --resource-group megaverse-rg --name megaverse-db
```

Both should show **FREE or B1ms tier**.

---

## 🎉 You're Live!

Your Megaverse Live platform is now:
- ✅ Accepting bookings
- ✅ Processing payments
- ✅ Sending confirmations
- ✅ Storing data securely

**Total cost: ~$0-1/month for your current booking volume!**

---

## 📚 Next Steps

1. Add booking calendar to website (15 min)
2. Test full booking flow (5 min)
3. Start accepting real bookings!

See `QUICK_START.md` for frontend integration steps.
