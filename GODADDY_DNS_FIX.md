# 🔧 GoDaddy DNS Fix - Point megaverselive.com to Netlify

## Your Current DNS (GoDaddy)

```
Type  Name       Value                           TTL     Status
────────────────────────────────────────────────────────────────
A     @          20.193.243.56 (Azure - OLD)     1 Hour  
NS    @          ns23.domaincontrol.com          1 Hour  (Locked)
NS    @          ns24.domaincontrol.com          1 Hour  (Locked)
CNAME www        megaverse-live.onrender.com     1 Hour  (OLD)
CNAME _connect   _domainconnect.gd.domain...     1 Hour
```

---

## ✅ What to Do (3 Simple Steps)

### Step 1: Delete the Old A Record
1. Login to **GoDaddy.com**
2. Go to **Domains** → **megaverselive.com** → **Manage DNS**
3. Find the **A record** with value `20.193.243.56`
4. Click the **trash/delete icon**
5. Confirm deletion

### Step 2: Update the www CNAME Record
1. Find the **CNAME record for www** (currently: megaverse-live.onrender.com)
2. Click **Edit** (pencil icon) OR delete and recreate
3. Change the value to: **`rad-salamander-f70475.netlify.app`**
4. Leave TTL as **1 Hour**
5. Click **SAVE**

### Step 3: Add Root CNAME Record (Optional but Better)
1. Click **Add Record**
2. Set:
   - **Type:** CNAME
   - **Name:** @ (or leave blank)
   - **Value:** `rad-salamander-f70475.netlify.app`
   - **TTL:** 1 Hour
3. Click **Add Record**

---

## ⏳ Wait for Propagation

DNS changes take **5 minutes to 24 hours** to fully propagate.

### Check Progress:
1. Go to **https://dnschecker.org**
2. Paste: `megaverselive.com`
3. You'll see propagation % across different DNS servers

### Test Your Site:
- Try: https://megaverselive.com
- Try: https://www.megaverselive.com
- Should see your Netlify site ✅

---

## 📋 Before & After

| Before | After |
|--------|-------|
| A record → Azure IP (20.193.243.56) | ❌ Deleted |
| CNAME www → Render (onrender.com) | ✅ Changed to Netlify |
| Root @ → Azure IP | ✅ Changed to Netlify CNAME |
| Cost | ₹773/month → ₹0/month 🎉 |

---

## ✨ After DNS Works

Your site will be live at:
- **https://megaverselive.com**
- **https://www.megaverselive.com**
- **https://rad-salamander-f70475.netlify.app** (always works)

---

## 🆘 Troubleshooting

### "Still seeing old site after 1 hour"
1. Clear your browser cache (Ctrl+Shift+Delete)
2. Try incognito/private window
3. Try from different network (phone WiFi)
4. Verify changes actually saved in GoDaddy

### "Record won't delete"
- Some records are locked by GoDaddy (like NS records)
- Just delete the ones you can
- Update the CNAME records instead

### "Can't add CNAME at root (@)"
- GoDaddy sometimes doesn't allow CNAME at root
- That's okay! Just update the www CNAME
- Your site will work at: www.megaverselive.com

### "Want to add @ record"
- Use GoDaddy's "Forwarding" feature instead
- Or contact GoDaddy support for root CNAME help

---

## 🎯 Final Result

After completing these steps:
- ✅ megaverselive.com points to your Netlify site
- ✅ Students can book sessions
- ✅ Payments go to your account
- ✅ Zero hosting cost (Netlify free)
- ✅ No more Azure billing! 🎊

---

**That's it!** Just 3 minutes of DNS updates and you're golden! ✨
