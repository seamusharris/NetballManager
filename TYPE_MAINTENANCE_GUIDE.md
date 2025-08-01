# Type Maintenance Guide

How to keep `/shared/types.ts` accurate and up-to-date as the codebase evolves.

## Automated Checks

### 1. TypeScript Strict Mode
Add to `tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### 2. ESLint Rules
Add to `.eslintrc.js`:
```json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-member-access": "error",
    "@typescript-eslint/no-unsafe-call": "error"
  }
}
```

### 3. Pre-commit Hook
Create `.husky/pre-commit`:
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Prevent commits with any types
echo "🔍 Checking for 'any' types..."
if grep -r ": any" src/ --include="*.ts" --include="*.tsx" -q; then
  echo "❌ Found 'any' types in code. Please fix before committing:"
  grep -r ": any" src/ --include="*.ts" --include="*.tsx" -n
  exit 1
fi

# Run type checking
echo "🔍 Running TypeScript type check..."
npx tsc --noEmit

echo "✅ All type checks passed!"
```

## Manual Maintenance Workflows

### When Adding New Database Fields

1. **Update Database Schema** (`shared/schema.ts`)
2. **Update Types** (`shared/types.ts`)
3. **Update Forms** (form data types)
4. **Update API responses** (if needed)

**Example:**
```typescript
// 1. Added to schema.ts
export const players = pgTable("players", {
  // ... existing fields
  phoneNumber: text("phone_number"), // NEW FIELD
});

// 2. Update types.ts
export interface Player {
  // ... existing fields
  phoneNumber?: string; // ADD THIS
}

// 3. Update form types
export interface PlayerFormData {
  // ... existing fields
  phoneNumber?: string; // ADD THIS
}
```

### When Changing API Responses

**Always update types first, then fix the errors:**

```typescript
// 1. Change the type
export interface Game {
  // Old: homeTeamId: number;
  homeTeam: Team; // NEW: full team object instead of ID
}

// 2. TypeScript will show errors everywhere Game is used
// 3. Fix each error one by one
```

### When Adding New Endpoints

1. **Add Response Type**:
```typescript
export type ApiNewResourceResponse = ApiResponse<NewResource[]>;
```

2. **Add Form Type** (if needed):
```typescript
export interface NewResourceFormData {
  // form fields
}
```

3. **Export from index** (if using barrel exports)

## Validation Strategies

### 1. Runtime Type Validation

Use Zod schemas to validate API responses match your types:

```typescript
// Create runtime validators
import { z } from 'zod';

const PlayerSchema = z.object({
  id: z.number(),
  displayName: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  // ... all fields from Player interface
});

// Use in API client
const response = await fetch('/api/players');
const data = await response.json();
const players = PlayerSchema.array().parse(data); // Throws if types don't match
```

### 2. API Response Testing

Create tests that verify API responses match your types:

```typescript
// tests/api-types.test.ts
describe('API Type Validation', () => {
  test('GET /api/players returns Player[]', async () => {
    const response = await fetch('/api/players');
    const data = await response.json();
    
    expect(data).toMatchObject({
      success: true,
      data: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          displayName: expect.any(String),
          firstName: expect.any(String),
          // ... all required fields
        })
      ])
    });
  });
});
```

### 3. Database-to-Type Sync

Use a script to generate types from your database:

```typescript
// scripts/generate-types.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import { introspect } from 'drizzle-kit';

async function generateTypes() {
  // Extract schema from database
  const schema = await introspect(db);
  
  // Generate TypeScript interfaces
  const types = generateInterfacesFromSchema(schema);
  
  // Write to file
  fs.writeFileSync('shared/generated-types.ts', types);
}
```

## Developer Workflow

### Daily Development

1. **Use TypeScript errors as guidance** - When you see red squiggles, the types need updating
2. **Update types before implementation** - Add the type first, then implement
3. **Use type-first development** - Define interfaces before writing components

### Code Reviews

**Type Review Checklist:**
- [ ] New API endpoints have corresponding types
- [ ] Form components use proper form data types  
- [ ] No new `any` types introduced
- [ ] Types match actual API responses
- [ ] Optional vs required fields are correct

### Release Process

**Before each release:**
1. Run full type check: `npx tsc --noEmit`
2. Verify no `any` types: `grep -r ": any" src/`
3. Test API endpoints match types
4. Update type documentation if needed

## Common Patterns

### Adding New Resource

```typescript
// 1. Database entity type
export interface NewResource {
  id: number;
  name: string;
  // ... database fields
  createdAt: string;
  updatedAt: string;
}

// 2. Form data type (subset of entity)
export interface NewResourceFormData {
  name: string;
  // ... editable fields only
}

// 3. API response types
export type ApiNewResourceResponse = ApiResponse<NewResource>;
export type ApiNewResourcesResponse = ApiResponse<NewResource[]>;

// 4. Update type (partial for PATCH)
export type NewResourceUpdate = Partial<Omit<NewResource, 'id' | 'createdAt' | 'updatedAt'>>;
```

### Adding New Form

```typescript
// 1. Form data interface
export interface MyFormData {
  field1: string;
  field2: number;
  field3?: boolean;
}

// 2. Component props
export interface MyFormProps {
  initialData?: MyFormData;
  onSubmit: FormSubmitHandler<MyFormData>;
  onCancel?: () => void;
}
```

## Monitoring & Alerts

### CI/CD Integration

```yaml
# .github/workflows/type-check.yml
name: Type Check
on: [push, pull_request]
jobs:
  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npx tsc --noEmit
      - run: |
          if grep -r ": any" src/ --include="*.ts" --include="*.tsx" -q; then
            echo "Found 'any' types:"
            grep -r ": any" src/ --include="*.ts" --include="*.tsx" -n
            exit 1
          fi
```

### VS Code Settings

Add to `.vscode/settings.json`:
```json
{
  "typescript.preferences.strictPropertyInitialization": true,
  "typescript.preferences.strictFunctionTypes": true,
  "typescript.preferences.noImplicitAny": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true,
    "source.fixAll.eslint": true
  }
}
```

## Migration Strategy

### Phase 1: Start Using Types (Week 1)
- Import types in new components
- Fix obvious `any` types as you encounter them
- Don't break working code

### Phase 2: Systematic Replacement (Week 2-3)  
- Replace `any[]` with proper array types
- Fix error handler types
- Update component props

### Phase 3: Strict Mode (Week 4)
- Enable TypeScript strict mode
- Fix all remaining issues
- Add ESLint rules

## Success Metrics

Track progress with:
```bash
# Count remaining any types
grep -r ": any" src/ --include="*.ts" --include="*.tsx" | wc -l

# TypeScript error count
npx tsc --noEmit 2>&1 | grep "error TS" | wc -l

# Type coverage (if using type-coverage tool)
npx type-coverage --detail
```

---

The key is making type maintenance part of your normal development workflow, not a separate chore!