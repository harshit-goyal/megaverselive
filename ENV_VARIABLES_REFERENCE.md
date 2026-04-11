# PayPal + Razorpay - Environment Variables Quick Reference

## The 3 Things You Need to Set in Render

### From PayPal Dashboard (Get these)
```
PAYPAL_CLIENT_ID     = [Get from PayPal Developer Dashboard]
PAYPAL_CLIENT_SECRET = [Get from PayPal Developer Dashboard]
```

### NOT from PayPal (Just copy-paste)
```
PAYPAL_API_URL       = https://api.sandbox.paypal.com   (for testing)
PAYPAL_API_URL       = https://api.paypal.com            (for production)
```

---

## Complete Render Environment Variables

Copy-paste this into Render. Fill in the `[...]` parts:

```
DB_HOST              = megaverse-db.postgres.database.azure.com
DB_USER              = dbadmin@megaverse-db
DB_PASSWORD          = !_E}#3!oA7p+DG?W
DB_NAME              = bookings
DB_PORT              = 5432
RAZORPAY_KEY_ID      = [Get from Razorpay API Keys page]
RAZORPAY_KEY_SECRET  = [Get from Razorpay API Keys page]
PAYPAL_CLIENT_ID     = [Get from PayPal Developer Dashboard]
PAYPAL_CLIENT_SECRET = [Get from PayPal Developer Dashboard]
PAYPAL_API_URL       = https://api.sandbox.paypal.com
FRONTEND_URL         = https://megaverselive.netlify.app
```

---

## Testing Phase

All variables above (exactly as shown) for testing with sandbox/test credentials.

---

## Before Going Live

Only change these 3 variables (everything else stays the same):

```
RAZORPAY_KEY_ID      = [Your LIVE Razorpay key]
RAZORPAY_KEY_SECRET  = [Your LIVE Razorpay secret]
PAYPAL_API_URL       = https://api.paypal.com
PAYPAL_CLIENT_ID     = [Your LIVE PayPal client ID]
PAYPAL_CLIENT_SECRET = [Your LIVE PayPal secret]
```

---

## Where to Get Each Credential

| Variable | Where to Find | How Long |
|----------|---|---|
| `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT` | Already provided | ✅ Done |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Razorpay Dashboard → Settings → API Keys | 5-10 min |
| `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` | PayPal Developer → Apps & Credentials (Sandbox tab) | 5 min |
| `PAYPAL_API_URL` | Copy-paste from this doc | 1 sec |
| `FRONTEND_URL` | Already provided | ✅ Done |

---

## Common Mistakes

❌ **Looking for PAYPAL_API_URL in PayPal Dashboard**
- It's not there!
- Just copy-paste: `https://api.sandbox.paypal.com`

❌ **Using Sandbox credentials for production**
- Test phase: Use sandbox/test credentials
- Production phase: Get live credentials and update

❌ **Forgetting to change PAYPAL_API_URL when going live**
- It MUST change from `sandbox.paypal.com` to just `paypal.com`

❌ **Putting credentials in code**
- Only in Render environment variables
- Never commit to GitHub

---

## Step-by-Step for Render

1. Go to Render Dashboard
2. Click your service name
3. Click **Environment** tab
4. Add all 11 variables (use table above)
5. Click Save
6. Backend redeploys automatically ✅

---

## Verification

After adding all variables, test:

1. Backend should start (no errors in Render logs)
2. Database connection works
3. UPI payment with Razorpay
4. PayPal payment

If any fail, check:
- All 11 variables are present
- No typos in variable names
- Credentials are correct (copy-paste again)
- For Razorpay: Using test credentials or live?
- For PayPal: Using sandbox credentials or live?
