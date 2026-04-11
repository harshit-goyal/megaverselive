# Deployment Checklist

## Phase 1: Azure Resources
- [ ] Create App Service (Node 20, F1 free, India Central)
- [ ] Create PostgreSQL (B1ms, India Central)
- [ ] Save: server name, password, App Service URL

## Phase 2: Database
- [ ] Create database: CREATE DATABASE megaverse_db;
- [ ] Run backend/schema.sql script

## Phase 3: Stripe
- [ ] Get Secret Key (sk_test_...)
- [ ] Get Publishable Key (pk_test_...)
- [ ] Get Webhook Secret (whsec_...)
- [ ] Add webhook endpoint to Stripe dashboard

## Phase 4: Email Service
- [ ] Gmail: Generate app password OR
- [ ] SendGrid: Create API key

## Phase 5: Configure Backend
- [ ] Copy .env.example to .env
- [ ] Fill in all credentials

## Phase 6: Deploy
- [ ] Push to GitHub (or use Azure CLI)
- [ ] Add environment variables to Azure Portal
- [ ] Test: curl https://megaverse-api.azurewebsites.net/api/health

## Phase 7: Initialize
- [ ] POST /api/admin/init-slots to create time slots

## Phase 8: Frontend
- [ ] Follow FRONTEND_INTEGRATION.md
- [ ] Add booking calendar to index.html
- [ ] Update API URL to Azure endpoint
- [ ] Update Stripe publishable key
- [ ] Test booking flow

## Done!
- [ ] Book a test session
- [ ] Verify confirmation email received
- [ ] Check payment in Stripe dashboard
