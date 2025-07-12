# NeballManager API Testing Guide

This guide covers automated testing for the NeballManager API, specifically for the pluralization standardization project.

## 🧪 Testing Setup

### Prerequisites
- Node.js 18+
- Docker (for database)
- curl (for API testing)

### Installation
```bash
# Install testing dependencies
npm install

# Make test scripts executable
chmod +x scripts/test-api-changes.sh
```

## 🚀 Quick Start

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Run API Tests
```bash
# Test current API endpoints
./scripts/test-api-changes.sh

# Run Vitest tests
npm run test:api
```

## 📋 Test Types

### 1. API Endpoint Tests
Tests that verify API endpoints work correctly before and after changes.

**Files:**
- `tests/api/pluralization.test.ts` - Tests plural vs singular endpoints
- `tests/api/endpoint-consistency.test.ts` - Tests API consistency
- `tests/api/route-audit.test.ts` - Audits all current routes

**Usage:**
```bash
npm run test:api
```

### 2. Manual API Testing
Script-based testing for quick validation of endpoint changes.

**Files:**
- `scripts/test-api-changes.sh` - Bash script for API testing

**Usage:**
```bash
./scripts/test-api-changes.sh
```

### 3. Coverage Testing
Tests that ensure code coverage for API changes.

**Usage:**
```bash
npm run test:coverage
```

## 🎯 Testing Strategy for Pluralization

### Phase 1: Baseline Testing
1. **Document current endpoints** - List all existing API endpoints
2. **Test current functionality** - Ensure all endpoints work as expected
3. **Identify inconsistencies** - Find endpoints that need pluralization

### Phase 2: Implementation Testing
1. **Update backend routes** - Change singular to plural endpoints
2. **Test new endpoints** - Verify new plural endpoints work
3. **Test old endpoints** - Ensure old singular endpoints return 404
4. **Update frontend calls** - Change frontend API calls to use plural

### Phase 3: Validation Testing
1. **End-to-end testing** - Test complete user workflows
2. **Performance testing** - Ensure no performance regressions
3. **Integration testing** - Test with real data

## 📊 Test Coverage

### API Endpoints to Test

#### Club Endpoints
- [ ] `GET /api/clubs/:id` (should work)
- [ ] `PATCH /api/clubs/:id` (should work)
- [ ] `DELETE /api/clubs/:id` (should work)
- [ ] `GET /api/club/:id` (should return 404)

#### Player Endpoints
- [ ] `GET /api/players` (should work)
- [ ] `POST /api/players` (should work)
- [ ] `GET /api/clubs/:clubId/players` (should work)

#### Team Endpoints
- [ ] `GET /api/teams` (should work)
- [ ] `GET /api/clubs/:clubId/teams` (should work)

#### Game Endpoints
- [ ] `GET /api/games` (should work)
- [ ] `GET /api/clubs/:clubId/games` (should work)

#### Season Endpoints
- [ ] `GET /api/seasons` (should work)
- [ ] `GET /api/seasons/active` (should work)

#### Section Endpoints
- [ ] `GET /api/seasons/:seasonId/sections` (should work)

## 🔧 Test Commands

### Development
```bash
# Run tests in watch mode
npm run test:watch

# Run specific test file
npm run test tests/api/pluralization.test.ts

# Run with UI
npm run test:ui
```

### CI/CD
```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run API tests only
npm run test:api
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Server Not Running
```bash
# Error: Server not running on localhost:3000
# Solution: Start the development server
npm run dev
```

#### 2. Database Connection Issues
```bash
# Error: Database connection failed
# Solution: Start Docker database
docker-compose -f docker-compose.dev.yml up -d postgres
```

#### 3. Test Dependencies Missing
```bash
# Error: Cannot find module 'vitest'
# Solution: Install dependencies
npm install
```

### Debug Mode
```bash
# Run tests with verbose output
npm run test -- --verbose

# Run specific test with debug
npm run test -- --reporter=verbose tests/api/pluralization.test.ts
```

## 📈 Test Results

### Expected Outcomes

#### Before Pluralization
- ✅ `/api/clubs/:id` works
- ✅ `/api/teams` works
- ✅ `/api/players` works
- ❌ `/api/club/:id` returns 404 (expected)

#### After Pluralization
- ✅ `/api/clubs/:id` works
- ✅ `/api/teams` works
- ✅ `/api/players` works
- ❌ `/api/club/:id` returns 404 (correct)
- ❌ `/api/team` returns 404 (correct)
- ❌ `/api/player` returns 404 (correct)

## 🔄 Continuous Testing

### Pre-commit Hooks
```bash
# Add to package.json scripts
"precommit": "npm run test:api"
```

### GitHub Actions
```yaml
# .github/workflows/test.yml
name: API Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:api
```

## 📚 Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [REST API Testing Best Practices](https://restfulapi.net/testing-rest-api/)

---

**Happy Testing! 🧪** 