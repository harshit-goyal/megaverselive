# 🚀 ONE-CLICK DEPLOYMENT - RUN THIS FIRST

## Ready to Deploy? Just 3 Steps!

### Step 1: Setup Environment (2 min)

```bash
cd /Users/harshit/megaverselive/backend
cp .env.example .env
```

Then edit `.env` and fill in:

**Required (get from https://dashboard.stripe.com):**
- STRIPE_SECRET_KEY
- STRIPE_PUBLISHABLE_KEY  
- STRIPE_WEBHOOK_SECRET

**Required (Gmail or SendGrid):**
- EMAIL_USER + EMAIL_PASSWORD (Gmail)
- OR SENDGRID_API_KEY

Database credentials will auto-fill!

### Step 2: Deploy to Azure (10 min)

```bash
cd /Users/harshit/megaverselive
bash deploy.sh
```

This will:
- ✅ Create Azure resources (FREE tier)
- ✅ Setup PostgreSQL database
- ✅ Deploy backend code
- ✅ Configure everything automatically

### Step 3: Add to Your Website (15 min)

1. Copy code from `backend/FRONTEND_INTEGRATION.md`
2. Add booking calendar to `index.html`
3. Update API URL: `https://megaverse-api.azurewebsites.net/api`
4. Update Stripe key: `pk_test_...` from .env

---

## 📋 Deployment Checklist

Before running `bash deploy.sh`:

- [ ] You have `.env` filled with Stripe keys
- [ ] You have `.env` filled with Email credentials
- [ ] You have `harshit_goyal@outlook.com` account ready
- [ ] You can login to Azure when browser opens

---

## What Gets Created (All FREE)

- App Service: megaverse-api (F1 free tier)
- PostgreSQL: megaverse-db (B1ms free tier)
- Resource Group: megaverse-rg
- Costs: $0-1/month for your volume

---

## 🎯 After Deployment

Get your API URL from Azure Portal:
```
https://megaverse-api.azurewebsites.net
```

Test it:
```bash
curl https://megaverse-api.azurewebsites.net/api/health
```

Should return: `{"status":"ok",...}`

---

## 🎉 Done!

Your platform is LIVE!

Next: Add booking calendar using `FRONTEND_INTEGRATION.md`

---

## Troubleshooting

**"Azure CLI not installed"**
```bash
brew install azure-cli
```

**Need help?**
- See: `AUTOMATED_DEPLOYMENT.md`
- See: `QUICK_START.md`
- See: `backend/README.md`

---

**Ready? Run:**
```bash
bash deploy.sh
```

**Let's go! 🚀**
