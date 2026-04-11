# Azure Deployment Guide

## Quick Start (30 minutes)

### Step 1: Create Azure Resources
1. Go to https://portal.azure.com (sign in with harshit_goyal@outlook.com)
2. Create App Service:
   - Runtime: Node 20 LTS
   - Plan: F1 (Free)
   - Region: India Central
   - Name: `megaverse-api`
3. Create PostgreSQL Database:
   - Compute: Burstable B1ms (Free tier)
   - Admin: `dbadmin`
   - Region: India Central
   - Name: `megaverse-db`
4. Save connection details (server name, password)

### Step 2: Setup Database
1. In Azure Portal → PostgreSQL → Query Editor
2. Create database:
```sql
CREATE DATABASE megaverse_db;
```
3. Run schema.sql

### Step 3: Configure Environment
1. Copy .env.example to .env
2. Fill in Azure PostgreSQL credentials
3. Add Stripe API keys
4. Add email service credentials

### Step 4: Deploy
Push code to Azure App Service using Git or Azure CLI.

## Environment Variables Needed
See `.env.example` for all required variables.
