#!/bin/bash

# AZURE DATABASE CREDENTIAL EXTRACTOR & RENDER FORM GENERATOR
# Paste your Azure connection string and this script will extract values and generate Render form

set -e

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     AZURE CONNECTION STRING DECODER                          ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "Go to: https://portal.azure.com"
echo "Search: postgresql"
echo "Click your database"
echo "Go to: Settings → Connection Strings"
echo "Copy the CONNECTION STRING (any of them: psql, ADO.NET, etc)"
echo ""
echo "Then paste it below and press Enter twice:"
echo ""

read -p "Paste your connection string: " CONN_STRING

echo ""
echo "Processing..."
echo ""

# Extract DB_HOST (domain part before :5432)
DB_HOST=$(echo "$CONN_STRING" | grep -oP '(?:Host=|dbhost=)([^;:]+)' | cut -d'=' -f2 | tr -d ' ')

# Extract DB_USER (the user@ part)
DB_USER=$(echo "$CONN_STRING" | grep -oP '(?:User Id=|user=)([^;@]+@[^;]+)' | cut -d'=' -f2 | tr -d ' ')
if [ -z "$DB_USER" ]; then
    DB_USER=$(echo "$CONN_STRING" | grep -oP '(?:User Id=|user=)([^;]+)' | cut -d'=' -f2 | tr -d ' ')
fi

# Extract DB_PASSWORD (password part)
DB_PASSWORD=$(echo "$CONN_STRING" | grep -oP '(?:Password=|password=)([^;]+)' | cut -d'=' -f2 | tr -d ' ')

# Extract DB_NAME (database name)
DB_NAME=$(echo "$CONN_STRING" | grep -oP '(?:Database=|database=)([^;]+)' | cut -d'=' -f2 | tr -d ' ')

# If DB_NAME not found, default to "bookings"
if [ -z "$DB_NAME" ]; then
    DB_NAME="bookings"
fi

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     EXTRACTED VALUES                                         ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "DB_HOST = $DB_HOST"
echo "DB_USER = $DB_USER"
echo "DB_PASSWORD = $DB_PASSWORD"
echo "DB_NAME = $DB_NAME"
echo "DB_PORT = 5432"
echo ""

# Verify values
if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ]; then
    echo "❌ Could not extract all values. Make sure you pasted a valid connection string."
    echo ""
    echo "Connection string should look like one of these:"
    echo "  psql 'host=xxx.postgres.database.azure.com user=xxx password=xxx database=bookings'"
    echo "  OR"
    echo "  Server=xxx.postgres.database.azure.com;Database=bookings;uid=xxx;password=xxx"
    exit 1
fi

echo "✅ All values extracted successfully!"
echo ""
echo "Now saving to file: RENDER_ENV_VARS.txt"
echo ""

# Save to file
cat > RENDER_ENV_VARS.txt << ENVFILE
# Copy these into Render environment variables

DB_HOST=$DB_HOST
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME
DB_PORT=5432
RAZORPAY_KEY_ID=[YOUR_RAZORPAY_KEY_ID]
RAZORPAY_KEY_SECRET=[YOUR_RAZORPAY_KEY_SECRET]
PAYPAL_CLIENT_ID=[YOUR_PAYPAL_CLIENT_ID]
PAYPAL_CLIENT_SECRET=[YOUR_PAYPAL_CLIENT_SECRET]
PAYPAL_API_URL=https://api.sandbox.paypal.com
FRONTEND_URL=https://megaverselive.netlify.app
ENVFILE

echo "✅ Saved to: RENDER_ENV_VARS.txt"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "NEXT STEPS:"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "1. Open your RENDER_ENV_VARS.txt file"
echo "2. Replace [YOUR_RAZORPAY_KEY_ID] with your actual Razorpay Key"
echo "3. Replace [YOUR_RAZORPAY_KEY_SECRET] with your actual Razorpay Secret"
echo "4. Replace [YOUR_PAYPAL_CLIENT_ID] with your PayPal Client ID"
echo "5. Replace [YOUR_PAYPAL_CLIENT_SECRET] with your PayPal Secret"
echo ""
echo "Then use these values when creating your Render Web Service"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
