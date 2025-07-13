# Testing Setup Report

## Static Analysis Results

### Unused Code Found (ts-prune)

**Server-side unused exports:**
- `flattenRelationshipData` in `server/api-utils.ts`
- `loadUserClubPermissions` in `server/auth-middleware.ts`
- `createBackup` in `server/backup.ts`
- `dbMonitor` in `server/db-monitor.ts`
- `safePoolQuery` and `executeBatchQueries` in `server/db-wrapper.ts`
- `grantWarrandyteAccessToAllGames` in `server/grant-warrandyte-access.ts`

**Shared schema unused exports:**
- Multiple unused schema types and functions
- Many migration functions that are no longer needed

**Client-side unused exports:**
- Many unused hooks and utility functions
- Unused UI components and types
- Legacy backup files and components

### Unused Dependencies Found (depcheck)

**Unused Dependencies:**
- `@jridgewell/trace-mapping`
- `connect-pg-simple`
- `express-session`
- `framer-motion`
- `memorystore`
- `next-themes`
- `passport`
- `passport-local`
- `react-helmet-async`
- `react-icons`
- `ts-node`
- `tw-animate-css`
- `zod-validation-error`

**Unused DevDependencies:**
- `@tailwindcss/vite`
- `@types/connect-pg-simple`
- `@types/express-session`
- `@types/passport`
- `@types/passport-local`
- `@types/supertest`
- `@types/ws`
- `@vitest/coverage-v8`
- `autoprefixer`
- `eslint-plugin-unused-imports`
- `postcss`
- `supertest`

**Missing Dependencies:**
- `pg` (used in `server/db.ts`)
- `@shared/schema` (used in `server/db.ts`)
- `@neondatabase/serverless` (used in `server/update-bye-status.mjs`)
- `nanoid` (used in `server/vite.ts`)

## E2E Testing Setup

### Playwright Configuration
- **Test Directory**: `./tests/e2e`
- **Browsers**: Chromium, Firefox, WebKit
- **Base URL**: `http://localhost:3000`
- **Web Server**: Automatically starts dev server
- **Screenshots**: On failure only
- **Traces**: On first retry

### Test Categories Created

1. **Navigation Tests** (`navigation.spec.ts`)
   - App loading and club switcher visibility
   - Teams page navigation
   - Games page navigation
   - Players page navigation

2. **Club-Scoped Data Tests** (`club-scoped-data.spec.ts`)
   - Team data isolation verification
   - Player data isolation verification
   - Game data isolation verification

## Available Scripts

### Static Analysis
```bash
npm run analyze:unused    # Find unused TypeScript exports
npm run analyze:deps      # Find unused dependencies
npm run analyze:all       # Run both analyses
```

### E2E Testing
```bash
npm run test:e2e          # Run all E2E tests
npm run test:e2e:ui       # Run with Playwright UI
npm run test:e2e:headed   # Run with browser visible
npm run test:e2e:debug    # Run in debug mode
```

## Recommendations

### Immediate Actions
1. **Remove unused dependencies** - Clean up the 13 unused dependencies
2. **Add missing dependencies** - Install `pg`, `nanoid`, etc.
3. **Remove unused code** - Clean up unused exports (especially server-side)
4. **Add data-testid attributes** - For better E2E test selectors

### Next Steps
1. **Expand E2E tests** - Add form submission, CRUD operations
2. **Add visual regression tests** - Using Playwright's screenshot comparison
3. **Add performance tests** - Monitor Core Web Vitals
4. **Add accessibility tests** - Using Playwright's accessibility features

### Legacy Code Cleanup Priority
1. **High Priority**: Remove unused dependencies (security + bundle size)
2. **Medium Priority**: Remove unused server-side code
3. **Low Priority**: Remove unused client-side components (after confirming they're truly unused)

## Test Coverage Goals

### Current Coverage
- ✅ API endpoint tests (Vitest + Supertest)
- ✅ Static analysis tools
- ✅ Basic E2E navigation tests
- ✅ Club-scoped data isolation tests

### Planned Coverage
- 🔄 Form submission and CRUD operations
- 🔄 Error handling scenarios
- 🔄 Performance monitoring
- 🔄 Accessibility testing
- 🔄 Visual regression testing

## Confidence Level

With the current setup, we have:
- **High confidence** in API functionality (comprehensive API tests)
- **Medium confidence** in UI functionality (basic E2E tests)
- **High confidence** in data isolation (club-scoped tests)
- **Good visibility** into unused code (static analysis)

The combination of API tests, E2E tests, and static analysis provides a solid foundation for catching regressions during legacy code cleanup. 