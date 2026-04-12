# Render Database Authentication Fix

## Current Problem

**Error:** `password authentication failed for user "dbadmin@megaverse-db"`
**Code:** 28P01 (PostgreSQL authentication failure)

This means the credentials in your Node.js service don't match the actual PostgreSQL database on Render.

---

## Diagnostic Steps

### Step 1: Check Configured Credentials
Visit this URL to see what credentials are configured:
```
https://megaverselive.com/api/debug/credentials
```

You should see:
```json
{
  "configured": {
    "DB_HOST": "✓ Set",
    "DB_USER": "✓ Set",
    "DB_PASSWORD": "✓ Set",
    "DB_NAME": "✓ Set",
    "DB_PORT": "5432"
  },
  "connectionString": "postgres://dbadmin@...",
  "note": "..."
}
```

If any show "✗ Missing", that's the problem.

---

## The Real Issue

Your Node.js service environment variables **don't match** your PostgreSQL database credentials.

### Common Causes

1. **Database password was reset** - Render sometimes resets credentials
2. **Copied credentials wrong** - Special characters weren't URL-encoded  
3. **Username format wrong** - Using "dbadmin@megaverse-db" instead of "dbadmin"
4. **Wrong database selected** - Using credentials from different Render service

---

## Solution: Update Credentials

### Part A: Get Real Credentials from Render

1. Log in to https://dashboard.render.com
2. Go to **Services** → find **megaverse-db** (PostgreSQL)
3. Click on it
4. Find the **Connections** section
5. Look for connection string that looks like:
   ```
   postgres://dbadmin:PASSWORD@dpg-xxx.render.com:5432/megaverse_db
   ```

Copy these values:
- **Host:** `dpg-xxx.render.com`
- **User:** `dbadmin` (not dbadmin@megaverse-db)
- **Password:** `xxxxxxxxxxxxx`
- **Database:** `megaverse_db` (or whatever it actually says)
- **Port:** `5432`

### Part B: Update Node.js Service Environment

1. Go to **Services** → find your Node.js service (megaverse-live or similar)
2. Click on **Environment**
3. Update these variables with values from Part A:

```
DB_HOST = dpg-xxx.render.com
DB_USER = dbadmin
DB_PASSWORD = xxxxxxxxxxxxx
DB_NAME = megaverse_db
DB_PORT = 5432
```

⚠️ **IMPORTANT:** 
- Don't include `@megaverse-db` in the username
- Special characters in password don't need URL encoding in environment variables
- Make sure there are NO extra spaces

4. Click **Save**
5. Render will auto-redeploy (watch the logs)

---

## Verify It's Fixed

### Test 1: Check Credentials Endpoint
After redeployment, visit:
```
https://megaverselive.com/api/debug/credentials
```

All should show "✓ Set".

### Test 2: Check Database Connection (MOST IMPORTANT)
Visit this - it actually tests if the connection works:
```
https://megaverselive.com/api/debug/test-connection
```

Expected success response:
```json
{
  "status": "connected",
  "message": "Database connection successful!",
  "serverTime": "2026-04-12T06:30:00.000Z"
}
```

Expected error response (if credentials wrong):
```json
{
  "status": "connection_failed",
  "error": "password authentication failed for user dbadmin",
  "code": "28P01",
  "errorHint": "Authentication failed. Check DB_USER and DB_PASSWORD in environment variables."
}
```

If you get the error response, your credentials are still wrong. Go back to Step 2 and double-check.

### Test 3: Check Database Tables
Visit:
```
https://megaverselive.com/api/debug/db
```

Should return:
```json
{
  "tables": ["bookings", "mentee_accounts", "mentee_profiles", "available_slots", ...],
  "status": "connected"
}
```

### Test 4: Try Signup
Go to https://megaverselive.com/auth and create an account.

---

## If Still Failing

1. Check Render logs:
   - Click your Node.js service
   - Look at "Logs" tab
   - Search for "Signup error" or "authentication failed"

2. Try connecting locally:
   ```bash
   psql -h <DB_HOST> -U <DB_USER> -d <DB_NAME> -p 5432
   ```
   
   When prompted, enter the password. If it works, credentials are correct.

3. Reset and try again:
   - In Render, click PostgreSQL service → **Settings** → **Reset Password**
   - Note the new credentials
   - Update environment variables again

---

## Payment System Works - Why?

Payment endpoints (Razorpay, PayPal) work because they:
- Query **existing** tables that were created before
- Don't require database initialization
- May use a different connection or credentials

Mentee signup fails because:
- It tries to **create new tables** on first signup
- This requires proper authentication
- Connection initialization fails, blocks new queries

Both use the same database credentials configured in environment variables. If one works, check why the other doesn't with the debug endpoint.

---

## Next Steps

1. Get real credentials from Render database
2. Update environment variables in Node.js service
3. Wait for auto-redeploy (~2 min)
4. Test debug endpoints
5. Try signup
6. Let me know if it works!
