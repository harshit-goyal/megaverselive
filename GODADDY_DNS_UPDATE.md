# 🔴 GoDaddy DNS Update - Step by Step

Your domain **megaverselive.com** is registered with **GoDaddy**.

**Current Status:** Points to Render (216.24.57.1)  
**New Value:** Azure VM (4.193.100.53)  
**Time to Complete:** 3-5 minutes

---

## Quick Steps

### Step 1: Login to GoDaddy

1. Go to https://www.godaddy.com
2. Click "Sign In" (top right)
3. Enter your GoDaddy email and password
4. Complete any 2FA if prompted

### Step 2: Access DNS Manager

1. After login, click "My Products" (top left)
2. Scroll down to "Domains" section
3. Find **megaverselive.com** in the list
4. Click the three-dot menu icon next to it
5. Select **"Manage DNS"**

### Step 3: Edit A Record

1. You'll see a list of DNS records
2. Find the **"A"** record (usually the first one)
3. Look for a value like **216.24.57.1** (Render IP)
4. Click the **pencil icon** next to it to edit

### Step 4: Change the IP

1. A dialog box will open
2. Find the field labeled **"Points to"** or **"Value"**
3. Clear the current value (216.24.57.1)
4. Enter the new value: **4.193.100.53**
5. Click **"Save"**

### Step 5: Confirm the Change

1. You should see a success message
2. The A record should now show **4.193.100.53**
3. The change has been saved

### Step 6: Wait for Propagation

1. DNS changes take 5-15 minutes to propagate globally
2. Some nameservers update faster than others
3. You can verify in the meantime

---

## Verification

**Check if DNS updated:**

```bash
nslookup megaverselive.com
```

When successful, you should see:
```
Name:	megaverselive.com
Address: 4.193.100.53
```

**Check online:**
https://whatsmydns.net/?domain=megaverselive.com

All nameservers should show **4.193.100.53**

---

## After DNS Updates

Once DNS shows 4.193.100.53, run:

```bash
bash AFTER_DNS_UPDATE.sh
```

This script will:
- ✅ Verify DNS is updated
- ✅ Test HTTPS connection
- ✅ Install Let's Encrypt certificate
- ✅ Configure production SSL
- ✅ Test API endpoints

---

## Troubleshooting

**"I don't see the DNS Manager button"**
→ Make sure you're on the right domain's page. Click directly on the domain name.

**"The A record shows a different IP"**
→ That's the old Render IP. Edit it and change to 4.193.100.53

**"I only see CNAME records"**
→ Scroll down or look for a tab. You need the A record specifically.

**"DNS still shows old IP after 15 minutes"**
→ Clear your local DNS cache:
  - Mac: `sudo dscacheutil -flushcache`
  - Windows: `ipconfig /flushdns`
  - Linux: `sudo systemctl restart nscd`

**"Stuck on step 2?"**
→ Try: https://dcc.godaddy.com/ → My Products → Domains → Manage DNS

---

## Expected Timeline

| Step | Time | Task |
|------|------|------|
| 1-5 | 3-5 min | Update DNS at GoDaddy |
| 6 | 5-15 min | DNS propagates (automatic) |
| After | 3-5 min | Run AFTER_DNS_UPDATE.sh script |
| Total | ~15 min | Complete! |

---

## What Happens After DNS Update

✅ megaverselive.com points to Azure VM (4.193.100.53)  
✅ SSL certificate automatically installed  
✅ Zero cold starts  
✅ <100ms response times  
✅ 24/7 uptime  
✅ Production ready  

---

## Need Help?

**DNS showing old IP?**
- Wait 5-15 minutes for global propagation
- Check: https://whatsmydns.net/?domain=megaverselive.com

**API not responding?**
- Verify DNS first: `nslookup megaverselive.com`
- Then run: `bash AFTER_DNS_UPDATE.sh`

**Complete migration guide:**
- See: FINAL_NEXT_STEPS.md
- See: MIGRATION_SUMMARY.md

---

**You're 3-5 minutes away from completing the migration! 🚀**

Go to GoDaddy now and update that A record to **4.193.100.53**
