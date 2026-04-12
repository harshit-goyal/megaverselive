# ⚠️ DATABASE CREDENTIALS ARE INCORRECT ON RENDER

Your Render service is trying to connect with credentials that don't match the PostgreSQL database.

## The Error

```
Code 28P01: password authentication failed for user "dbadmin@megaverse-db"
```

This means the `DB_PASSWORD` or `DB_USER` environment variables are wrong.

## What's Confirmed Working

- ✅ Server is running
- ✅ API endpoints exist  
- ✅ Code is deployed
- ✅ Payment system still works (uses existing tables)
- ❌ Can't create new tables (authentication fails)

## You Must Do This (5 minutes)

### 1. Get Correct Credentials from Render

```
1. Log in to https://dashboard.render.com
2. Go to Services
3. Click on "megaverse-db" (PostgreSQL service)
4. Find the "Connections" section
5. Look for the connection string like:
   postgres://dbadmin:PASSWORD123@dpg-xxxxx.render.com:5432/megaverse_db

Note these values:
- Host: dpg-xxxxx.render.com (the part after @)
- User: dbadmin (the part before :)
- Password: PASSWORD123 (the part between : and @)
- Database: megaverse_db
- Port: 5432
```

### 2. Update Environment Variables

```
1. Still in Render, go to Services
2. Click your Node.js service (megaverse-live or similar)
3. Click "Environment" tab
4. Update these 5 variables with values from step 1:
   
   DB_HOST = dpg-xxxxx.render.com
   DB_USER = dbadmin
   DB_PASSWORD = PASSWORD123
   DB_NAME = megaverse_db
   DB_PORT = 5432

5. IMPORTANT: Copy-paste exactly - no extra spaces, no quotes
6. Click "Save"
7. Render will auto-redeploy (takes 2-3 minutes)
```

### 3. Test It Works

Once redeployed, run this command:

```bash
curl -X POST https://megaverselive.com/api/admin/init-mentee-schema
```

Should show:
```json
{
  "success": true,
  "message": "Mentee schema initialized successfully",
  "tables_created": ["mentee_accounts", "mentee_profiles"]
}
```

If still getting error 28P01 → credentials are still wrong, repeat steps 1-2

### 4. Test Signup

Go to https://megaverselive.com/auth and create an account.

Should work now!

## Why This Matters

The mentee authentication system is **100% coded and deployed**. It just needs valid database credentials to:
- Create user accounts
- Store passwords securely (bcrypted)
- Generate login tokens
- Store profile information

Once credentials are fixed, the entire system will work.

## Need Help?

If you're stuck finding the credentials:
1. Make sure you're in the Render dashboard (dashboard.render.com)
2. Look for a service called "megaverse-db" - this is your PostgreSQL database
3. The connection string will have all the info you need
4. Copy it exactly as it appears

Let me know once you've updated the credentials!
