# Megaverse Live - Booking Backend

A complete booking platform for 1:1 mentor sessions with integrated Stripe payments and email confirmations.

## Features

✅ **Booking Management**
- Calendar-based slot selection
- Prevent double-booking
- 45-minute session slots
- Support for multiple mentors (future-ready)

✅ **Payment Integration**
- Stripe payment processing
- Support for USD and international payments
- Secure webhook handling
- Payment status tracking

✅ **Email Notifications**
- Booking confirmation emails
- Session reminders
- Cancellation notifications
- HTML formatted emails

✅ **Frontend Integration**
- Interactive slot calendar
- Real-time availability
- Responsive design
- Works with existing Megaverse Live website

## Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL (Azure)
- **Payments**: Stripe
- **Hosting**: Azure App Service (Free tier)
- **Email**: Nodemailer (Gmail/SendGrid)

## Quick Start

### Prerequisites
- Node.js 20+
- Azure account (free tier)
- Stripe account (free)
- Gmail or SendGrid account for emails

### Local Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your credentials
nano .env

# Start server
npm run dev
```

Server runs on `http://localhost:8080`

### Initialize Available Slots

```bash
curl -X POST http://localhost:8080/api/admin/init-slots
```

### Test Booking API

```bash
# Check health
curl http://localhost:8080/api/health

# Get available slots
curl http://localhost:8080/api/slots

# Create test booking
curl -X POST http://localhost:8080/api/book \
  -H "Content-Type: application/json" \
  -d '{
    "mentor_id": 1,
    "customer_name": "Test User",
    "customer_email": "test@example.com",
    "session_topic": "Backend Interview Prep",
    "start_time": "2024-04-15T09:00:00Z"
  }'
```

## Project Structure

```
backend/
├── index.js                 # Main API server
├── schema.sql              # Database schema
├── services/
│   ├── email.js           # Email service
│   └── slots.js           # Slot management
├── .env.example           # Environment template
├── package.json           # Dependencies
├── API_DOCS.md           # API documentation
├── FRONTEND_INTEGRATION.md # Frontend setup guide
├── AZURE_DEPLOYMENT.md   # Azure deployment steps
└── README.md             # This file
```

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/health` | Health check |
| GET | `/api/slots` | Get available slots |
| POST | `/api/book` | Create booking |
| GET | `/api/booking/:id` | Get booking details |
| POST | `/api/booking/:id/cancel` | Cancel booking |
| POST | `/api/admin/init-slots` | Generate time slots |
| POST | `/api/webhook/stripe` | Stripe webhook handler |

See `API_DOCS.md` for full documentation.

## Environment Variables

```env
# Azure PostgreSQL
DB_HOST=megaverse-db.postgres.database.azure.com
DB_USER=dbadmin@megaverse-db
DB_PASSWORD=your_strong_password
DB_NAME=megaverse_db
DB_PORT=5432

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
EMAIL_SERVICE=gmail  # or sendgrid
EMAIL_USER=your@gmail.com
EMAIL_PASSWORD=app_password
# OR
SENDGRID_API_KEY=SG...

# Server
PORT=8080
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## Deployment

### To Azure
See `AZURE_DEPLOYMENT.md` for step-by-step guide.

**Quick summary:**
1. Create Azure App Service (Node.js, F1 free)
2. Create PostgreSQL Database (B1ms free tier)
3. Push code to GitHub
4. Connect to Azure Deployment Center
5. Set environment variables in Azure portal

### Local Testing
```bash
npm run dev
# Server runs on http://localhost:8080
```

## Database Schema

**Mentors**: ID, Name, Email, Bio, Specialties, Hourly Rate
**Time Slots**: ID, Mentor ID, Start/End Time, Booked Status
**Bookings**: ID, Mentor, Customer Details, Payment Info, Status
**Payments**: ID, Booking ID, Stripe ID, Amount, Status
**Emails Sent**: ID, Booking ID, Email Type, Timestamp

## Frontend Integration

Add the booking calendar to your `index.html`. See `FRONTEND_INTEGRATION.md` for complete instructions.

Key points:
1. Include Stripe.js script
2. Add booking section HTML
3. Include JavaScript manager
4. Update API URL and Stripe key

## Payment Flow

1. User selects time slot
2. Fills booking form
3. Frontend creates payment intent via `/api/book`
4. Stripe handles card payment
5. Webhook confirms booking
6. User receives confirmation email
7. Slot marked as booked

## Testing with Stripe

**Test card**: `4242 4242 4242 4242`
**Expiry**: Any future date
**CVC**: Any 3 digits

## Production Checklist

- [ ] Replace test Stripe keys with live keys
- [ ] Set up database backups
- [ ] Configure email service
- [ ] Add SSL certificate
- [ ] Set up monitoring/logging
- [ ] Test payment flow end-to-end
- [ ] Configure Azure auto-scaling

## Troubleshooting

**"Connection refused"** → Check .env credentials, ensure database is running

**"Payment failed"** → Verify Stripe keys in .env

**"Email not sending"** → Check EMAIL_SERVICE setting and credentials

**"Slots not showing"** → Run POST `/api/admin/init-slots`

## Support

For issues or questions:
- Check API_DOCS.md for API details
- Check AZURE_DEPLOYMENT.md for setup help
- Check FRONTEND_INTEGRATION.md for frontend help

## License

MIT - Open source booking platform
