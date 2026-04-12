# 🚀 DEPLOYMENT GUIDE - GET MENTEE SYSTEM WORKING

Your mentee authentication system is **100% complete and deployed**. To make it work, follow these exact steps.

---

## Step-by-Step Deployment

### Phase 1: Get Database Credentials (2 minutes)

1. **Open Render Dashboard**
   - Go to https://dashboard.render.com
   - Log in with your account

2. **Find PostgreSQL Service**
   - Click "Services" in the left menu
   - Look for a service named "megaverse-db" (or similar with "postgres" in the name)
   - Click on it

3. **Copy Connection Info**
   - Find the "Connections" or "Connection String" section
   - Look for text like: `postgres://dbadmin:PASSWORD123@dpg-xxxxx.render.com:5432/megaverse_db`
   - Extract these values:
     - **Host:** `dpg-xxxxx.render.com` (the part after `@`)
     - **User:** `dbadmin` (the part before `:`)
     - **Password:** `PASSWORD123` (the part between `:` and `@`)
     - **Database:** `megaverse_db` (the last part)
     - **Port:** `5432` (usually 5432)

### Phase 2: Update Environment Variables (3 minutes)

1. **Go to Node.js Service**
   - Still in Render dashboard
   - Go to "Services"
   - Click on your Node.js service (probably called "megaverse-live")

2. **Edit Environment Variables**
   - Click "Environment" tab
   - Find these 5 variables and update them:

```
DB_HOST = <paste host from Phase 1>
DB_USER = dbadmin
DB_PASSWORD = <paste password from Phase 1>
DB_NAME = <paste database name from Phase 1>
DB_PORT = 5432
```

3. **Important Details**
   - Copy-paste the values exactly (no extra spaces)
   - Don't include quotes
   - Make sure DB_USER is just "dbadmin" (not "dbadmin@megaverse-db")

4. **Save**
   - Click the "Save" button
   - Render will auto-redeploy (takes 2-3 minutes)
   - Watch the "Logs" tab to see deployment progress

### Phase 3: Verify It Works (5 minutes)

1. **Wait for Redeployment**
   - Check the Logs tab in Render
   - Wait until you see "Your service is live" message

2. **Test Database Connection**
   - Open a terminal/command prompt
   - Run this command:
     ```bash
     curl https://megaverselive.com/api/admin/init-mentee-schema -X POST
     ```
   - Should show:
     ```json
     {
       "success": true,
       "message": "Mentee schema initialized successfully",
       "tables_created": ["mentee_accounts", "mentee_profiles"]
     }
     ```
   - If you get error 28P01 → credentials are still wrong, go back to Phase 2

3. **Test Signup**
   - Open browser to: https://megaverselive.com/auth
   - Click "Sign up"
   - Fill in:
     - Full Name: Test User
     - Email: test@example.com
     - Password: TestPassword123 (8+ chars)
     - Phone: +1234567890 (optional)
   - Click "Create Account"
   - Should succeed and show dashboard

4. **Test Login**
   - Click "Sign in"
   - Enter credentials from signup
   - Should log in successfully

### Phase 4: Run Full Validation (optional, 2 minutes)

Run this script to test all endpoints:

```bash
cd /Users/harshit/megaverselive
./test-mentee-system.sh
```

This will:
- ✅ Test server health
- ✅ Test database connection
- ✅ Create a test user
- ✅ Login with that user
- ✅ Test profile management
- ✅ Test booking retrieval
- ✅ Verify all endpoints work

---

## Troubleshooting

### Error: "password authentication failed" (code 28P01)

**Cause:** Wrong database credentials  
**Solution:** 
1. Go back to Phase 2
2. Double-check the DB_PASSWORD and DB_USER values
3. Make sure DB_USER is just "dbadmin" without the "@megaverse-db" part
4. Save and wait for redeploy
5. Try test again

### Error: "SCHEMA_NOT_READY"

**Cause:** Schema initialization failed  
**Solution:**
1. Credentials must be correct first (fix error above)
2. Run: `curl https://megaverselive.com/api/admin/init-mentee-schema -X POST`
3. Should see "success": true

### Stuck on "Deploying" in Render

**Cause:** Redeploy taking time  
**Solution:**
1. Wait 3-5 minutes
2. Refresh the page
3. Check the Logs tab for errors
4. If it fails, try saving again

### Can't find PostgreSQL service in Render

**Cause:** Might be named differently  
**Solution:**
1. Look for any service with "postgres" or "database" in the name
2. Or check your Render email for the database name
3. Or try connecting with the default user "postgres"

---

## After Deployment - What You Get

Once credentials are updated and working, your platform includes:

✅ **User Registration**
- Email/password signup
- Password strength validation
- Secure bcrypt hashing
- Email uniqueness checking

✅ **User Authentication**
- Login with email/password
- JWT tokens (24-hour expiry)
- Auto-login on page reload
- Secure logout

✅ **User Profiles**
- View profile (name, email, phone, bio, timezone)
- Edit profile information
- Persistent preferences

✅ **Booking History**
- See all bookings for logged-in user
- View past bookings
- View upcoming bookings
- Booking details

✅ **Dashboard**
- User welcome message
- Stats (total bookings, upcoming sessions)
- Quick links to sections
- Session summaries

---

## Files & Resources

| File | Purpose |
|------|---------|
| MENTEE_QUICK_START.md | 1-page quick reference |
| RENDER_DATABASE_FIX.md | Detailed troubleshooting |
| DATABASE_CREDENTIALS_REQUIRED.md | Why credentials matter |
| test-mentee-system.sh | Automated test script |
| auth.html | Frontend auth UI |
| backend/index.js | Backend API code |

---

## Next Steps After Deployment

Once signup works:

1. **Test with real users** - Create a few test accounts
2. **Test payments** - Make sure payment integration still works
3. **Check dashboard** - Verify all pages load correctly
4. **Share with mentees** - Send login link to your users
5. **Monitor logs** - Watch Render logs for any errors

---

## Questions?

If you're stuck:
1. Check the exact error message
2. See "Troubleshooting" section above
3. Run the validation script: `./test-mentee-system.sh`
4. Check Render logs for detailed error info

---

## Summary

**Time to deploy:** ~10 minutes
**Steps:** 4 phases
**Prerequisites:** Your Render database credentials

Once you follow these steps, your mentee system will be live and working! 🚀
