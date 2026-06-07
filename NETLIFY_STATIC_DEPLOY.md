# Deploy Static Megaverse Live to Netlify

## Quick Deploy (5 minutes)

### Step 1: Prepare for Netlify
```bash
# Everything is ready - just push to GitHub
git add -A
git commit -m "Deploy: Switch to static website version"
git push origin main
```

### Step 2: Create Netlify Account & Link Repo
1. Go to https://netlify.com
2. Click "Sign up" → "Continue with GitHub"
3. Authorize and select repo: `harshit-goyal/megaverselive`

### Step 3: Configure Build Settings
When Netlify asks for build settings:
- **Base directory:** (leave empty)
- **Build command:** (leave empty - we don't need one)
- **Publish directory:** `public`

### Step 4: Click Deploy
- Netlify will auto-deploy your site
- You'll get a URL like: `https://megaverselive.netlify.app`

### Step 5: Custom Domain (Optional)
1. In Netlify dashboard → **Domain settings**
2. Add custom domain: `megaverselive.com`
3. Update DNS at your provider (Netlify shows instructions)
4. SSL auto-generated (HTTPS free)

---

## What's Included

✅ **Your Profile** - Hardcoded mentor info with avatar
✅ **Calendar Booking** - Select date/time for sessions
✅ **Payment Options** - UPI, PhonePe, PayPal, Bank Transfer
✅ **Copy-to-Clipboard** - Easy payment details sharing
✅ **Mobile Responsive** - Works great on phone
✅ **Zero Backend** - No database, no API calls
✅ **Zero Cost** - Netlify free tier covers it all

---

## How It Works

1. **User Books Session**
   - Fills name, email, phone, topic
   - Selects date & time from calendar
   - Gets confirmation message

2. **User Pays**
   - Copies UPI/PhonePe/PayPal details
   - Sends payment
   - Messages you on WhatsApp with booking details

3. **You Confirm**
   - Receive WhatsApp confirmation
   - Send Google Meet link
   - Hold session

---

## Customize Payment Details

Edit `public/index.html` and find these lines:

```html
<!-- UPI -->
<div class="payment-details" id="upi-details">harshit@upi</div>

<!-- PhonePe -->
<div class="payment-details" id="phonepay-details">+91 98765 43210</div>

<!-- PayPal -->
<div class="payment-details" id="paypal-details">harshit@paypal.me</div>
```

Replace with your actual payment details.

---

## Customize Mentor Info

Edit `public/index.html` and find these sections:

```html
<h2 class="mentor-name">Harshit Goyal</h2>
<p class="mentor-title">Senior Technology Mentor</p>
<p class="mentor-bio">Your bio here...</p>
```

And update the expertise tags:
```html
<span class="tag">Your Skill 1</span>
<span class="tag">Your Skill 2</span>
```

---

## Customize Session Price

Find this line and update:
```html
<div class="session-price">
    ₹500 / 1 Hour Session
</div>
```

---

## Set Up WhatsApp for Confirmations

1. Create a WhatsApp Business account (free)
2. Add your number to website header or booking form
3. Users can message directly from their phone

---

## Costs

- **Netlify Free Tier:** ₹0/month
  - 100 GB bandwidth
  - Auto HTTPS
  - Auto deployments
  - Perfect for static sites

- **Your Earnings:** 100% from session fees

**Total Cost: ₹0** 🎉

---

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Deploy to Netlify
3. ✅ Test booking flow
4. ✅ Share link with students
5. ✅ Collect payments

Done! 🚀
