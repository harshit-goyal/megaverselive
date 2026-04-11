# PayPal Sandbox Integration - Next Steps

## What I Just Did

✅ Updated PayPal Client ID to **sandbox**: `AetetOH9B0dYcKCX244OpOogchqJvftbLCwfOtFSvhxKNChhxvMxYAmL-kzB5p7MbvUgCucEwk-jEgrd`
✅ Changed backend to use sandbox API: `https://api.sandbox.paypal.com`
✅ Deployed to Render (waiting for redeploy now)

## What's Still Needed

The backend needs your **PayPal Sandbox Client Secret** to create test payments.

### Step 1: Get Your Sandbox Secret

Go to: https://developer.paypal.com/dashboard/

1. Make sure you're viewing **SANDBOX** (toggle at top, or check "Sandbox Apps")
2. Find your app in the list
3. Click on your app
4. Look for **"Secret"** field
5. Click **"Show"** to reveal it
6. **Copy** the entire secret string

### Step 2: Add to Render

Go to: https://dashboard.render.com

1. Click service: **megaverse-live**
2. Click tab: **Environment**
3. Find or create: **PAYPAL_CLIENT_SECRET**
   - Value: Paste your sandbox secret from Step 1
4. Make sure **PAYPAL_MODE** is NOT set (or set to anything other than "live")
   - This tells the backend to use sandbox API
5. Click **Save**
6. Wait 2-3 minutes for auto-redeploy

### Step 3: Test It

After redeploy:

1. Hard refresh: **Cmd+Shift+R** (Mac) or **Ctrl+F5** (Windows)
2. Click **"Book a Session"**
3. Click **blue PayPal button** in modal
4. Should open PayPal sandbox checkout (test mode)
5. Complete test payment with sandbox account
6. Should redirect to cal.com

## Sandbox Testing Account

If you don't have a PayPal sandbox account for testing:
1. Go to https://developer.paypal.com/dashboard/
2. Click on **Accounts** in left sidebar
3. Look for a pre-created sandbox buyer account
4. Use it to log in during checkout

## Important Note

The app URL `https://api-m.sandbox.paypal.com` is correct - that's the sandbox endpoint.

Just need the Client Secret now!
