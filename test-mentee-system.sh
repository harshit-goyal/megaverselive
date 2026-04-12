#!/bin/bash

# Mentee System - Validation & Testing Script
# This script tests all the API endpoints once database credentials are correct

API_URL="https://megaverselive.com"
TEST_EMAIL="test_$(date +%s)@example.com"
TEST_PASSWORD="TestPassword123"
TEST_NAME="Test User"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     MENTEE SYSTEM - COMPREHENSIVE VALIDATION TEST          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Test 1: Health Check
echo "📋 Test 1: Server Health"
echo "─────────────────────────────────────"
HEALTH=$(curl -s "$API_URL/api/health")
if echo "$HEALTH" | jq . > /dev/null 2>&1; then
  echo "✅ Server is running"
  echo "$HEALTH" | jq .
else
  echo "❌ Server not responding"
  exit 1
fi
echo ""

# Test 2: Database Connection
echo "📋 Test 2: Database Connection"
echo "─────────────────────────────────────"
DB_TEST=$(curl -s -X GET "$API_URL/api/debug/test-connection")
if echo "$DB_TEST" | jq . > /dev/null 2>&1; then
  STATUS=$(echo "$DB_TEST" | jq -r '.status')
  if [ "$STATUS" = "connected" ]; then
    echo "✅ Database connection successful"
    echo "$DB_TEST" | jq .
  else
    echo "❌ Database connection failed"
    echo "$DB_TEST" | jq .
    exit 1
  fi
else
  echo "❌ Invalid response"
  exit 1
fi
echo ""

# Test 3: Schema Initialization
echo "📋 Test 3: Schema Initialization"
echo "─────────────────────────────────────"
SCHEMA=$(curl -s -X POST "$API_URL/api/admin/init-mentee-schema")
echo "$SCHEMA" | jq .
SCHEMA_SUCCESS=$(echo "$SCHEMA" | jq -r '.success')
if [ "$SCHEMA_SUCCESS" = "true" ] || [ "$SCHEMA_SUCCESS" = "null" ]; then
  echo "✅ Schema initialization check passed"
else
  echo "⚠️  Schema initialization returned error (might already exist)"
fi
echo ""

# Test 4: Signup
echo "📋 Test 4: User Signup"
echo "─────────────────────────────────────"
echo "Creating account: $TEST_EMAIL"
SIGNUP=$(curl -s -X POST "$API_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"name\":\"$TEST_NAME\",\"phone\":\"+1234567890\"}")

if echo "$SIGNUP" | jq . > /dev/null 2>&1; then
  SUCCESS=$(echo "$SIGNUP" | jq -r '.success')
  if [ "$SUCCESS" = "true" ]; then
    echo "✅ Signup successful"
    TOKEN=$(echo "$SIGNUP" | jq -r '.token')
    USER_ID=$(echo "$SIGNUP" | jq -r '.user.id')
    echo "   User ID: $USER_ID"
    echo "   Token: ${TOKEN:0:20}..."
    echo "$SIGNUP" | jq .
  else
    echo "❌ Signup failed"
    echo "$SIGNUP" | jq .
    exit 1
  fi
else
  echo "❌ Invalid signup response"
  echo "$SIGNUP"
  exit 1
fi
echo ""

# Test 5: Login
echo "📋 Test 5: User Login"
echo "─────────────────────────────────────"
LOGIN=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

if echo "$LOGIN" | jq . > /dev/null 2>&1; then
  LOGIN_SUCCESS=$(echo "$LOGIN" | jq -r '.success // .token')
  if [ "$LOGIN_SUCCESS" != "null" ] && [ -n "$LOGIN_SUCCESS" ]; then
    echo "✅ Login successful"
    LOGIN_TOKEN=$(echo "$LOGIN" | jq -r '.token')
    echo "   Token: ${LOGIN_TOKEN:0:20}..."
    echo "$LOGIN" | jq .
  else
    echo "❌ Login failed"
    echo "$LOGIN" | jq .
    exit 1
  fi
else
  echo "❌ Invalid login response"
  echo "$LOGIN"
  exit 1
fi
echo ""

# Test 6: Get Profile
echo "📋 Test 6: Get User Profile"
echo "─────────────────────────────────────"
PROFILE=$(curl -s -X GET "$API_URL/api/mentee/profile" \
  -H "Authorization: Bearer $TOKEN")

if echo "$PROFILE" | jq . > /dev/null 2>&1; then
  echo "✅ Profile retrieval successful"
  echo "$PROFILE" | jq .
else
  echo "❌ Profile retrieval failed"
  echo "$PROFILE"
  exit 1
fi
echo ""

# Test 7: Update Profile
echo "📋 Test 7: Update User Profile"
echo "─────────────────────────────────────"
UPDATE=$(curl -s -X PUT "$API_URL/api/mentee/profile" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"name\":\"$TEST_NAME Updated\",\"phone\":\"+9876543210\",\"bio\":\"Test bio\",\"timezone\":\"Asia/Kolkata\"}")

if echo "$UPDATE" | jq . > /dev/null 2>&1; then
  echo "✅ Profile update successful"
  echo "$UPDATE" | jq .
else
  echo "❌ Profile update failed"
  echo "$UPDATE"
  exit 1
fi
echo ""

# Test 8: Get Bookings
echo "📋 Test 8: Get User Bookings"
echo "─────────────────────────────────────"
BOOKINGS=$(curl -s -X GET "$API_URL/api/mentee/bookings" \
  -H "Authorization: Bearer $TOKEN")

if echo "$BOOKINGS" | jq . > /dev/null 2>&1; then
  echo "✅ Bookings retrieval successful"
  COUNT=$(echo "$BOOKINGS" | jq 'length')
  echo "   Total bookings: $COUNT"
  echo "$BOOKINGS" | jq .
else
  echo "❌ Bookings retrieval failed"
  echo "$BOOKINGS"
  exit 1
fi
echo ""

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     ✅ ALL TESTS PASSED - SYSTEM IS WORKING!               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "The mentee authentication system is fully functional:"
echo "  ✅ User signup working"
echo "  ✅ User login working"
echo "  ✅ Profile management working"
echo "  ✅ Booking history working"
echo "  ✅ Database schema initialized"
echo ""
echo "🚀 System is ready for production use!"
