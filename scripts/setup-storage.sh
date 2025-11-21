#!/bin/bash
# Setup Supabase Storage Buckets and RLS Policies

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Setting up Supabase Storage Buckets...${NC}"

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo -e "${RED}Error: .env.local file not found${NC}"
  echo "Please create .env.local with your Supabase credentials"
  exit 1
fi

# Load environment variables
source .env.local

# Check required variables
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo -e "${RED}Error: Missing required environment variables${NC}"
  echo "Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
  exit 1
fi

echo -e "${BLUE}Applying storage migration...${NC}"

# Apply the migration using psql or the Supabase API
# You can run this SQL directly in your Supabase SQL Editor
# Or use the Supabase CLI if installed

# For now, we'll just display instructions
echo -e "${GREEN}To complete setup, run the following SQL in your Supabase SQL Editor:${NC}"
echo -e "${BLUE}https://app.supabase.com/project/_/sql${NC}"
echo ""
cat migrations/002_setup_storage_buckets.sql
echo ""
echo -e "${GREEN}Or use the Supabase CLI:${NC}"
echo -e "supabase db push"
