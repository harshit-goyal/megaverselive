# 🌐 DNS Update Instructions - Complete Guide

**Current Status:** megaverselive.com still points to Render  
**Needed:** Update to Azure VM (4.193.100.53)  
**Time to Complete:** 5-10 minutes  
**Propagation Time:** 5-30 minutes (full global: up to 48 hours)

---

## ⚡ Quick Summary

Change your domain's A record from Render to **4.193.100.53**

---

## 📋 Detailed Instructions by Registrar

### 🔵 **GoDaddy** (Most Common)

1. Login to https://www.godaddy.com/en-uk
2. Click "My Products"
3. Find "Domains" section
4. Click your domain: **megaverselive.com**
5. Click "Manage DNS" button
6. Find the "A" record (usually first one)
7. Click the pencil icon to edit
8. Change the "Value" field to: **4.193.100.53**
9. Click "Save"
10. Wait 5-15 minutes for update

---

### 🔵 **Namecheap**

1. Login to https://www.namecheap.com/
2. Go to "Account" → "Dashboard"
3. Click "Manage" next to megaverselive.com
4. Click "Advanced DNS" tab
5. Find "A Record" row
6. Click edit pencil icon
7. Change "IPv4 Address" to: **4.193.100.53**
8. Click the checkmark to save
9. Wait 5-15 minutes

---

### 🔵 **Google Domains**

1. Login to https://domains.google.com/
2. Select megaverselive.com
3. Go to "DNS" in left sidebar
4. Scroll to "Custom records"
5. Find "A" record pointing to old IP
6. Click edit (pencil icon)
7. Change IPv4 to: **4.193.100.53**
8. Save changes
9. Wait 5-15 minutes

---

### 🔵 **AWS Route 53**

1. Login to AWS Console
2. Go to Route 53 → Hosted Zones
3. Find megaverselive.com
4. Click on "A" record
5. Edit the record
6. Change IP address to: **4.193.100.53**
7. Click "Save records changes"
8. Wait 5-15 minutes

---

### 🔵 **Cloudflare**

1. Login to https://dash.cloudflare.com/
2. Select megaverselive.com
3. Go to "DNS" section
4. Find "A" record
5. Click edit (pencil icon)
6. Change IPv4 address to: **4.193.100.53**
7. Click "Save"
8. Wait 5-15 minutes

---

### 🔵 **Render.com** (If hosted there)

1. Login to https://dashboard.render.com/
2. Go to your project
3. Find "Custom Domains"
4. Click on megaverselive.com
5. Update domain settings
6. Point to: **4.193.100.53**
7. Save
8. Wait 5-15 minutes

---

### 🔵 **Other Registrars**

General steps (works for most):
1. Login to your domain registrar
2. Find "DNS Management" or "Domain Settings"
3. Look for "A Records" or "DNS Records"
4. Find the record with type "A" pointing to old Render IP
5. Edit it
6. Change value to: **4.193.100.53**
7. Save
8. Wait 5-15 minutes

---

## ✅ Verify DNS Update

### Check via Terminal
```bash
nslookup megaverselive.com
```

Should show:
```
Address: 4.193.100.53
```

### Check via Online Tool
Visit: https://whatsmydns.net/
Enter: megaverselive.com
Should show 4.193.100.53 in results

### Test API Endpoint
```bash
curl https://megaverselive.com/api/health
```

Should return:
```json
{"status":"ok",...}
```

---

## 🔐 After DNS Update: Install Proper SSL Certificate

Once DNS is updated and working, upgrade from self-signed to Let's Encrypt:

```bash
# SSH to VM
ssh -i ~/.ssh/megaverse-vm-key.pem azureuser@4.193.100.53

# Install Let's Encrypt certificate
sudo certbot certonly --nginx -d megaverselive.com \
  --non-interactive \
  --agree-tos \
  -m your-email@example.com

# Reload nginx to use new certificate
sudo systemctl reload nginx

# Verify
curl https://megaverselive.com/api/health
```

---

## 🧪 Full Testing Checklist

After DNS update:

- [ ] Domain resolves to 4.193.100.53 (nslookup)
- [ ] HTTPS works (https://megaverselive.com)
- [ ] API health check responds (api/health)
- [ ] Mentor list loads (/api/mentors)
- [ ] SSL certificate is valid (no warnings)
- [ ] HTTP redirects to HTTPS
- [ ] Visit site in browser - displays correctly

---

## ⏱️ Timeline

| Step | Time |
|------|------|
| Update DNS at registrar | 2-3 minutes |
| DNS propagation | 5-15 minutes (can be up to 48 hours globally) |
| Certificate installation | 3-5 minutes |
| Testing | 2-3 minutes |
| **Total** | **~15 minutes** |

---

## 🆘 Troubleshooting

### DNS Still Shows Old IP

**Problem:** nslookup still shows Render IP  
**Solution:**
- Wait longer (up to 48 hours for full propagation)
- Clear DNS cache: `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (Mac)
- Try different DNS server: `nslookup megaverselive.com 8.8.8.8`

### SSL Certificate Error

**Problem:** Browser shows security warning  
**Solution:**
- Wait for certificate to install properly
- Hard refresh browser (Ctrl+F5 or Cmd+Shift+R)
- Clear browser cache
- Try in incognito mode

### App Not Responding

**Problem:** megaverselive.com connection refused  
**Solution:**
- Verify VM is still running: `az vm get-instance-view -d -g megaverse-rg -n megaverse-vm-sea`
- Check app status: `ssh azureuser@4.193.100.53 pm2 status`
- Check nginx: `ssh azureuser@4.193.100.53 sudo systemctl status nginx`

---

## 📞 Quick Reference

| Item | Value |
|------|-------|
| **Domain** | megaverselive.com |
| **New IP Address** | 4.193.100.53 |
| **Record Type** | A |
| **TTL** | 3600 (or automatic) |
| **SSH Command** | `ssh -i ~/.ssh/megaverse-vm-key.pem azureuser@4.193.100.53` |
| **VM Status URL** | https://4.193.100.53 (uses self-signed cert) |
| **DNS Check** | `nslookup megaverselive.com` |

---

## ✨ What Happens After DNS Update

1. ✅ megaverselive.com → 4.193.100.53 (Azure VM)
2. ✅ No more Render cold starts (~30 seconds gone!)
3. ✅ Instant API responses (<100ms)
4. ✅ Professional SSL certificate
5. ✅ Always-on deployment
6. ✅ Production ready!

---

**Next Action:** Follow the instructions for your registrar above, then verify DNS is updated.
