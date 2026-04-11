# Quick Start Guide - Megaverse Live Booking Platform

## 📊 What You Have Now

```
✅ Complete Node.js backend with 7 API endpoints
✅ PostgreSQL database schema
✅ Stripe payment integration (ready to connect)
✅ Email service (confirmations, reminders)
✅ Booking management system
✅ Complete documentation
✅ Frontend integration code
```

## 🚀 Get Live in 8 Steps (2 hours)

### 1️⃣ Azure Setup (15 min)
Go to https://portal.azure.com → Create:
- App Service: Name `megaverseapi`, F1 free, Node 20 LTS
- PostgreSQL: Name `megaverse-db`, B1ms free tier
Save the password!

### 2️⃣ Create Database (5 min)
In PostgreSQL Query Editor:
```sql
CREATE DATABASE megaverse_db;
```
Then paste backend/schema.sql and run it.

### 3️⃣ Get Stripe Keys (10 min)
https://dashboard.stripe.com → Developers → API Keys
Copy Secret Key, Publishable Key, Webhook Secret

### 4️⃣ Email Setup (5 min)
Gmail: https://myaccount.google.com/apppasswords
Generate app password

### 5️⃣ Configure Backend (5 min)
```
cd backend
cp .env.example .env
# Edit .env with all credentials
```

### 6️⃣ Deploy (10 min)
Push to GitHub, connect to Azure Deployment Center
Set environment variables in Azure Portal

### 7️⃣ Initialize Slots (1 min)
```
POST https://megaverseapi.azurewebsites.net/api/admin/init-slots
```

### 8️⃣ Add to Website (15 min)
Follow FRONTEND_INTEGRATION.md to add booking calendar

---

## 📁 Key Files to Know

**Backend Setup**
- backend/README.md - Start here
- backend/.env.example - Config template
- backend/schema.sql - Database setup

**Deployment**
- DEPLOYMENT_CHECKLIST.md - Step-by-step
- backend/AZURE_DEPLOYMENT.md - Azure details
- backend/FRONTEND_INTEGRATION.md - Website integration

**API Reference**
- backend/API_DOCS.md - All endpoints

---

## 🧪 Test Locally

```
cd backend
npm run dev
curl http://localhost:8080/api/health
```

---

## 🎯 The Booking Flow

Customer visits website
       ↓
Selects 45-min slot
       ↓
Fills form (name, email, topic)
       ↓
Enters card details
       ↓
Backend creates booking
       ↓
Stripe charges card
       ↓
Email confirmation sent
       ↓
Done!

---

## 💰 Cost: FREE for your volume

- App Service F1: Free
- PostgreSQL B1ms: Free
- Stripe: 2.9% + $0.30 per transaction

---

## ✅ Launch Checklist

- [ ] Azure resources created
- [ ] Database running
- [ ] Stripe API keys obtained
- [ ] Email service configured
- [ ] Backend deployed
- [ ] Slots initialized
- [ ] Booking calendar added
- [ ] Test booking completed
- [ ] Confirmation email received

---

## 🆘 Issues?

1. API questions → backend/API_DOCS.md
2. Azure setup → backend/AZURE_DEPLOYMENT.md
3. Website integration → backend/FRONTEND_INTEGRATION.md

---

**Ready? Start with Azure setup! 🚀**
