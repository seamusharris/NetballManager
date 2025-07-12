#!/bin/bash

# NeballManager API Testing Script
# This script tests API endpoints before and after pluralization changes

set -e

echo "🧪 Starting API testing for pluralization changes..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test an endpoint
test_endpoint() {
    local method=$1
    local url=$2
    local expected_status=$3
    local description=$4
    
    echo -n "Testing $method $url... "
    
    # Make the request
    response=$(curl -s -o /dev/null -w "%{http_code}" -X $method "http://localhost:3000$url" 2>/dev/null || echo "000")
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} ($response)"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (expected $expected_status, got $response)"
        return 1
    fi
}

# Function to test endpoint existence
test_endpoint_exists() {
    local url=$1
    local description=$2
    
    echo -n "Checking if $url exists... "
    
    # Try both GET and HEAD to see if endpoint exists
    response=$(curl -s -o /dev/null -w "%{http_code}" -X GET "http://localhost:3000$url" 2>/dev/null || echo "000")
    
    if [ "$response" != "000" ] && [ "$response" != "404" ]; then
        echo -e "${GREEN}✅ EXISTS${NC} ($response)"
        return 0
    else
        echo -e "${YELLOW}⚠️  NOT FOUND${NC} ($response)"
        return 1
    fi
}

# Check if server is running
echo "🔍 Checking if server is running..."
if ! curl -s http://localhost:3000/api/seasons > /dev/null 2>&1; then
    echo -e "${RED}❌ Server not running on localhost:3000${NC}"
    echo "Please start the server with: npm run dev"
    exit 1
fi

echo -e "${GREEN}✅ Server is running${NC}"

echo ""
echo "📋 Testing current API endpoints..."

# Test current endpoints (should work)
echo ""
echo "🔍 Testing existing endpoints (should work):"
test_endpoint "GET" "/api/seasons" "200" "Get seasons"
test_endpoint "GET" "/api/clubs/54" "200" "Get club details"
test_endpoint "GET" "/api/clubs/54/players" "200" "Get club players"
test_endpoint "GET" "/api/clubs/54/teams" "200" "Get club teams"

# Test old singular endpoints (should fail)
echo ""
echo "🔍 Testing old singular endpoints (should fail):"
test_endpoint "GET" "/api/club/54" "404" "Old singular club endpoint"
test_endpoint "GET" "/api/team" "404" "Old singular team endpoint"
test_endpoint "GET" "/api/player" "404" "Old singular player endpoint"

# Test new plural endpoints (should work)
echo ""
echo "🔍 Testing new plural endpoints (should work):"
test_endpoint "GET" "/api/clubs/54" "200" "New plural club endpoint"
test_endpoint "GET" "/api/teams" "200" "New plural teams endpoint"
test_endpoint "GET" "/api/players" "200" "New plural players endpoint"

echo ""
echo "📊 Summary:"
echo "- ✅ Server is running"
echo "- ✅ Current endpoints are working"
echo "- ❌ Old singular endpoints should return 404"
echo "- ✅ New plural endpoints should work"

echo ""
echo "🎯 Next steps:"
echo "1. Run the pluralization changes"
echo "2. Re-run this script to verify changes"
echo "3. Update frontend API calls"
echo "4. Run full test suite"

echo ""
echo "🧪 API testing complete!" 