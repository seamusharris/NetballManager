#!/bin/bash

# Case Conversion Test Runner
# Runs comprehensive tests for the bidirectional case conversion system

echo "🧪 Case Conversion Test Suite"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if server is running
echo -e "${BLUE}📡 Checking if server is running...${NC}"
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo -e "${GREEN}✅ Server is running${NC}"
    SERVER_WAS_RUNNING=true
else
    echo -e "${YELLOW}⚠️ Server not running, starting test server...${NC}"
    SERVER_WAS_RUNNING=false
    # Start server in background for tests
    npm run dev &
    SERVER_PID=$!
    
    # Wait for server to start
    echo -e "${BLUE}⏳ Waiting for server to start...${NC}"
    for i in {1..30}; do
        if curl -s http://localhost:3000/api/health > /dev/null; then
            echo -e "${GREEN}✅ Server started successfully${NC}"
            break
        fi
        sleep 1
        if [ $i -eq 30 ]; then
            echo -e "${RED}❌ Server failed to start within 30 seconds${NC}"
            exit 1
        fi
    done
fi

# Run the case conversion tests
echo -e "${BLUE}🧪 Running case conversion tests...${NC}"
echo ""

# Run tests with verbose output
npm run test:case-conversion -- --reporter=verbose

TEST_EXIT_CODE=$?

# Cleanup
if [ "$SERVER_WAS_RUNNING" = false ] && [ ! -z "$SERVER_PID" ]; then
    echo -e "${YELLOW}🧹 Stopping test server...${NC}"
    kill $SERVER_PID 2>/dev/null || true
    wait $SERVER_PID 2>/dev/null || true
fi

echo ""
echo "=============================="

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}🎉 All case conversion tests passed!${NC}"
    echo -e "${GREEN}✅ Bidirectional case conversion system is working correctly${NC}"
else
    echo -e "${RED}❌ Some tests failed${NC}"
    echo -e "${RED}🔧 Check the output above for details${NC}"
fi

echo ""
echo -e "${BLUE}📊 Test Summary:${NC}"
echo "- Self-contained tests (create, test, cleanup)"
echo "- Comprehensive case conversion validation"
echo "- Field mapping verification"
echo "- Batch endpoint protection"
echo "- Legacy endpoint compatibility"
echo "- Error handling with proper case conversion"

exit $TEST_EXIT_CODE