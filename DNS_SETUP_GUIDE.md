# 🔧 Fix megaverselive.com DNS - 5 Minute Setup

## Problem
Your Netlify site deployed but `megaverselive.com` not responding. This is a **DNS issue** - your domain needs to point to Netlify.

## Solution: Update DNS at Your Registrar

### Step 1: Get Your Netlify DNS Settings
In Netlify dashboard:
1. Go to **Sites** → Select your site
2. Click **Domain settings**
3. Go to **DNS settings**
4. You'll see Netlify's nameservers or DNS records

Netlify typically provides:
```
Nameservers:
  dns1.p07.nsone.net
  dns2.p07.nsone.net
  dns3.p07.nsone.net
  dns4.p07.nsone.net
```

OR specific A/CNAME records:
```
Type: A
Name: megaverselive.com
Value: 75.2.60.5 (example)

Type: CNAME
Name: www
Value: megaverselive.netlify.app
```

### Step 2: Update DNS at Your Registrar

**If using GoDaddy:**
1. Go to https://godaddy.com
2. Login → My Products → Domains
3. Click **megaverselive.com** → **Manage DNS**
4. Replace nameservers with Netlify's ones
5. Save & wait 24-48 hours

**If using Namecheap:**
1. Go to https://namecheap.com
2. Login → Domain List
3. Click **Manage** next to megaverselive.com
4. Go to **Nameservers** tab
5. Select "Custom DNS"
6. Enter Netlify nameservers
7. Save

**If using Google Domains:**
1. Go to https://domains.google.com
2. Select megaverselive.com
3. Left sidebar → DNS
4. Scroll to "Custom nameservers"
5. Enter Netlify nameservers
6. Save

**If using AWS Route53:**
1. Go to https://console.aws.amazon.com/route53
2. Select hosted zone for megaverselive.com
3. Create records as per Netlify instructions
4. Save

### Step 3: Verify in Netlify

In Netlify dashboard:
1. Domain settings
2. Wait for "DNS records propagating..." to finish
3. Status should show "DNS configured"
4. Try https://megaverselive.com in browser

### Step 4: Wait for Propagation

DNS changes take **24-48 hours** to fully propagate globally. During this time:
- ✅ Your site IS live on the Netlify nameservers
- ✅ Some people can already access it
- ⏳ Some ISPs still serve old DNS

**You can check status here:**
- https://dnschecker.org - paste megaverselive.com
- https://www.whatsmydns.net - paste megaverselive.com

### Step 5: Force SSL/HTTPS

After DNS works:
1. In Netlify dashboard → Domain settings
2. Check "Force HTTPS"
3. This redirects http → https automatically

---

## Troubleshooting

### "Still not working after 2 days"
1. Check Netlify shows "DNS configured" status
2. Verify nameservers were actually saved at registrar
3. Try clearing browser cache (Ctrl+Shift+Delete)
4. Try incognito/private window
5. Try from different network (phone WiFi vs home internet)

### "Getting wrong site/old content"
- DNS cache issue
- Clear your browser cache completely
- Try: https://www.google.com/search?q=cache:megaverselive.com

### "Still showing registrar parking page"
- Nameservers not updated yet
- Check your registrar account to confirm changes saved
- Ask registrar support for help

---

## Quick Checklist

- [ ] Got Netlify nameservers/DNS records
- [ ] Updated nameservers at registrar
- [ ] Registrar shows changes "pending" or "active"
- [ ] Netlify shows "DNS configured"
- [ ] Waited 1-2 hours for initial propagation
- [ ] Tested in incognito window
- [ ] Enabled "Force HTTPS" in Netlify
- [ ] megaverselive.com now works! 🎉

---

## What If I Don't Know My Registrar?

Check your domain provider:
1. Go to https://whois.com
2. Paste megaverselive.com
3. Look for "Registrar" in results
4. That's your domain registrar!

Then follow the steps above for that registrar.

---

## Using Netlify's Free DNS (Recommended)

**Easiest way:** Let Netlify manage DNS

In Netlify dashboard:
1. Domain settings → Add custom domain → megaverselive.com
2. Follow prompts to change nameservers
3. Netlify auto-manages DNS records
4. No need to manually update anything!

---

**Result:** Your site at megaverselive.com will be live within 24-48 hours! 🚀
