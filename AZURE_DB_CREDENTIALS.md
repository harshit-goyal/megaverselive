# Your Azure Database Credentials

## Database Connection Details

```
DB_HOST     = megaverse-db.postgres.database.azure.com
DB_USER     = dbadmin@megaverse-db
DB_PASSWORD = !_E}#3!oA7p+DG?W
DB_NAME     = bookings
DB_PORT     = 5432
```

## Full Connection String

```
postgresql://dbadmin:!_E}#3!oA7p+DG?W@megaverse-db.postgres.database.azure.com:5432/bookings
```

---

## For Render Deployment

Copy these 11 values exactly into your Render Web Service environment variables:

| Variable | Value |
|----------|-------|
| `DB_HOST` | `megaverse-db.postgres.database.azure.com` |
| `DB_USER` | `dbadmin@megaverse-db` |
| `DB_PASSWORD` | `!_E}#3!oA7p+DG?W` |
| `DB_NAME` | `bookings` |
| `DB_PORT` | `5432` |
| `RAZORPAY_KEY_ID` | [YOUR_NEW_RAZORPAY_KEY_ID] |
| `RAZORPAY_KEY_SECRET` | [YOUR_NEW_RAZORPAY_KEY_SECRET] |
| `PAYPAL_CLIENT_ID` | [YOUR_PAYPAL_CLIENT_ID] |
| `PAYPAL_CLIENT_SECRET` | [YOUR_PAYPAL_CLIENT_SECRET] |
| `PAYPAL_API_URL` | `https://api.sandbox.paypal.com` |
| `FRONTEND_URL` | `https://megaverselive.netlify.app` |

---

## Test Connection

To test connection locally:
```bash
psql postgresql://dbadmin:!_E}#3!oA7p+DG?W@megaverse-db.postgres.database.azure.com:5432/bookings
```

If successful, you'll see the `bookings=#` prompt.

---

## Next Steps

1. Go to https://render.com
2. Create new Web Service
3. Connect `megaverselive` repository
4. Fill in the environment variables above
5. Deploy!

That's it! Your backend will connect to this database automatically.
