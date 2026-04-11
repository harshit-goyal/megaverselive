# PayPal Live API Integration - What You Need to Do

## Current Status
✅ PayPal SDK loads - Valid Client ID deployed  
✅ PayPal buttons render in modal  
✅ Backend now uses LIVE endpoint (api-m.paypal.com) instead of sandbox  
❌ Payment still failing - Credentials not configured in Render

## The Problem
When you click PayPal button, the error `PayPal error. Please try again or use UPI.` means:
- Backend can't create PayPal order (credentials missing or incorrect)
- OR credentials are for sandbox, not live

## Solution: Add PayPal Credentials to Render

Your app is deployed on **Render**. You must add environment variables there.

### Step-by-Step: Configure PayPal Credentials

**1. Get Your PayPal Live App Credentials**
   - Go to https://developer.paypal.com/dashboard/
   - Make sure you're viewing **LIVE** (not Sandbox)
   - Find your app in the list
   - Click on it and copy:
     - **Client ID**: `AQmTZVVP8P1VLSWPj9lVkh_M5f_KkOmhLJdKKPEb` (you already have this)
     - **Secret**: Click "Show" to reveal your secret (keep it safe!)

**2. Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Click on service: `megaverse-live`
   - Go to **Environment** tab (left sidebar)

**3. Add/Update These Environment Variables**
   ```
   PAYPAL_CLIENT_ID=AQmTZVVP8P1VLSWPj9lVkh_M5f_KkOmhLJdKKPEb
   PAYPAL_CLIENT_SECRET=<paste-your-secret-here>
   PAYPAL_MODE=live
   ```

**4. Save** - Render will automatically redeploy the service

**5. Wait 2-3 minutes** for deployment to complete

### Step-by-Step: Test It Works

**1. Hard Refresh Website**
   - Mac: `Cmd + Shift + R`
   - Windows: `Ctrl + F5`

**2. Click "Book a Session" Button**

**3. In Payment Modal:**
   - You should see UPI button
   - Below it: PayPal button (blue)

**4. Click PayPal Button**
   - Should open PayPal checkout (NOT error)
   - Log in with your PayPal account
   - Complete test payment
   - Should redirect to cal.com after payment

## If Still Getting Error

**Check 1: Are credentials in Render?**
- Go to Render dashboard → Environment tab
- Verify `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` are there
- If blank or say "hidden", that's correct (Render hides secrets)

**Check 2: Open Browser Console (F12)**
- Click PayPal button
- Look for error messages in console
- Screenshot and share if needed

**Check 3: Render Logs**
- In Render dashboard, go to **Logs** tab
- Look for PayPal error messages
- Should show what PayPal API returned

## API Endpoint Details

```
Endpoint: POST https://megaverse-live.onrender.com/api/paypal/create-order

Request Body:
{
  "amount": "15.00",
  "currency": "USD"
}

Expected Response (Success):
{
  "order_id": "7JF45789JKSD87F"
}

Error Response (Missing Credentials):
{
  "error": "PayPal credentials not configured. Please add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to environment variables."
}
```

## Payment Flow Diagram

```
1. Click "Book a Session" → Payment Modal Opens
2. Click "PayPal" button → Frontend calls PayPal SDK
3. PayPal SDK calls → backend /api/paypal/create-order
4. Backend creates order → Uses LIVE api-m.paypal.com
5. Backend returns order ID → PayPal SDK opens checkout
6. User completes payment → PayPal redirects to cal.com
```

## Configuration Summary

| Setting | Value | Where |
|---------|-------|-------|
| PayPal Mode | Live (not Sandbox) | ✅ Backend hardcoded |
| API Endpoint | api-m.paypal.com | ✅ Backend hardcoded |
| Client ID | `AQmTZVVP8P1VLSWPj9lVkh_M5f_KkOmhLJdKKPEb` | ⚠️ **Needs**: Render Env |
| Client Secret | Your secret from PayPal | ⚠️ **Needs**: Render Env |
| Frontend URL | https://megaverse-live.onrender.com | ✅ Backend hardcoded |

## What I've Already Done

✅ Updated backend to use `api-m.paypal.com` (live endpoint)  
✅ Made it configurable (defaults to live, can fallback to sandbox)  
✅ Fixed error handling for missing credentials  
✅ Deployed code to Render (commit fb9ec61)  
✅ Verified PayPal SDK loads with your valid Client ID  
✅ Verified PayPal buttons render in modal  

## Your Next Step

**→ Add PAYPAL_CLIENT_SECRET to Render environment variables**

That's all you need to do! Once credentials are in place, PayPal should work.
