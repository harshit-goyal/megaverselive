#!/bin/bash

# Deploy database schema
# Prerequisites: Azure resources created, .env configured

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🗄️  Deploying Database Schema${NC}"
echo "================================"

# Load .env
if [ ! -f backend/.env ]; then
    echo -e "${RED}❌ .env not found. Copy from .env.example and fill in credentials${NC}"
    exit 1
fi

source backend/.env

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}📦 Installing PostgreSQL client...${NC}"
    brew install libpq
    brew link --force libpq
fi

echo -e "${YELLOW}📝 Running database schema...${NC}"

# Run schema
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U "${DB_USER}" -d $DB_NAME -f backend/schema.sql

echo -e "${GREEN}✅ Database schema deployed!${NC}"
echo -e "${GREEN}✅ Mentors table created with Harshit as the mentor${NC}"
