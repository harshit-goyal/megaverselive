# Megaverse Live Backend - Deployment Guide

## 📋 **Next Steps for You (Azure Portal)**

### **1. Create Azure Resources** (If not done already)
- [ ] App Service (Node.js, F1 free tier)
- [ ] PostgreSQL Database (Burstable B1ms, free eligible)
- [ ] Get connection string from PostgreSQL Overview

### **2. Setup Local Environment**
```bash
cd backend
cp .env.example .env
# Fill in your Azure & Stripe credentials in .env
```

### **3. Create Database Schema**
In Azure Portal → PostgreSQL → Query Editor (or psql CLI):
1. Create a new database: `CREATE DATABASE megaverse_db;`
2. Run `schema.sql` to create tables

### **4. Get Stripe Keys**
1. Sign up at https://dashboard.stripe.com
2. Get:
   - Secret Key (starts with `sk_test_`)
   - Publishable Key (starts with `pk_test_`)
   - Webhook Signing Secret (for production)
3. Add to `.env`

### **5. Deploy to Azure**
```bash
# Initialize git (if not done)
git init
git add .
git commit -m "Initial backend setup"

# Push to Azure App Service
# Option A: Azure DevOps (recommended)
# Option B: Git push directly to App Service
```

## 🚀 **API Endpoints Created**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/health` | Check if server is running |
| GET | `/api/slots?mentor_id=1` | Get available 45-min slots |
| POST | `/api/book` | Create booking & payment intent |
| POST | `/api/webhook/stripe` | Handle Stripe payment confirmation |
| GET | `/api/booking/:id` | Get booking details |
| POST | `/api/booking/:id/cancel` | Cancel booking |

## 📁 **File Structure**
```
backend/
├── index.js           # Main API server
├── schema.sql         # Database schema
├── .env.example       # Environment template
└── package.json       # Dependencies
```

## ⚙️ **Environment Variables Needed**
See `.env.example` for all required variables.

## Next: Connect Frontend to API
Once deployed, we'll update the HTML booking form to call these endpoints.
