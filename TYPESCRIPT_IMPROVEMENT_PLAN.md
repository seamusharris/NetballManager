# TypeScript Type Safety Improvement Plan

Generated: August 1, 2025

**Current Status**: 405+ instances of `any` types found across the codebase

## Analysis Summary

The most common `any` usage patterns are:

1. **Game arrays**: `games: any[]` (56 instances)
2. **Error handlers**: `error: any` (45 instances) 
3. **API responses**: Generic `data: any` (78 instances)
4. **Event handlers**: `props: any` (32 instances)
5. **Form data**: `formData: any` (28 instances)
6. **Statistics data**: `stats: any[]` (24 instances)

## Phase 1: Core Domain Types (Week 1)

### 1.1 Create Comprehensive Type Definitions

**File**: `/shared/types.ts` (new file)

```typescript
// ============================================================================
// CORE DOMAIN TYPES
// ============================================================================

export interface Player {
  id: number;
  displayName: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  positionPreferences: Position[];
  active: boolean;
  avatarColor?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Club {
  id: number;
  name: string;
  code: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  isActive: boolean;
  playersCount?: number;
  teamsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: number;
  name: string;
  clubId: number;
  seasonId: number;
  divisionId?: number;
  isActive: boolean;
  clubName?: string;
  clubCode?: string;
  divisionName?: string;
  playerCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Game {
  id: number;
  date: string;
  time?: string;
  round?: string;
  seasonId: number;
  homeTeamId: number;
  awayTeamId?: number;
  statusId: number;
  venue?: string;
  notes?: string;
  homeTeamName?: string;
  awayTeamName?: string;
  homeClubName?: string;
  awayClubName?: string;
  homeClubId?: number;
  awayClubId?: number;
  statusName?: string;
  statusDisplayName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GameStats {
  id: number;
  gameId: number;
  teamId: number;
  playerId: number;
  statType: StatType;
  quarter: number;
  position: Position;
  createdAt: string;
}

export interface GameScore {
  id: number;
  gameId: number;
  homeScore: number;
  awayScore: number;
  isOfficial: boolean;
  recordedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Roster {
  id: number;
  gameId: number;
  teamId: number;
  playerId: number;
  position: Position;
  jerseyNumber?: number;
  createdAt: string;
}

export interface Season {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Division {
  id: number;
  ageGroupId: number;
  sectionId?: number;
  seasonId: number;
  displayName: string;
  isActive: boolean;
  ageGroupName?: string;
  sectionName?: string;
  teamCount?: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// ENUMS AND UNIONS
// ============================================================================

export type Position = 
  | 'GS' | 'GA' | 'WA' | 'C' 
  | 'WD' | 'GD' | 'GK';

export type StatType = 
  | 'goal' | 'attempt' | 'turnover' 
  | 'intercept' | 'rebound' | 'penalty';

export type GameStatus = 
  | 'scheduled' | 'in_progress' | 'completed' 
  | 'cancelled' | 'forfeit' | 'bye';

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface ApiError {
  success: false;
  error: string;
  details?: string[];
  code?: string;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface PlayerFormData {
  displayName: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  positionPreferences: Position[];
  active: boolean;
  avatarColor?: string;
}

export interface ClubFormData {
  name: string;
  code: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface GameFormData {
  date: string;
  time?: string;
  round?: string;
  seasonId: number;
  homeTeamId: number;
  awayTeamId?: number;
  statusId: number;
  venue?: string;
  notes?: string;
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
}

// ============================================================================
// HOOK TYPES
// ============================================================================

export interface UseQueryResult<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseMutationResult<T, V> {
  mutate: (variables: V) => void;
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
}

// ============================================================================
// EVENT HANDLER TYPES
// ============================================================================

export type ClickHandler = (event: React.MouseEvent<HTMLElement>) => void;
export type ChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => void;
export type SubmitHandler = (event: React.FormEvent<HTMLFormElement>) => void;
export type SelectHandler<T> = (value: T) => void;

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Required<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type ID = number | string;
```

### 1.2 Update Existing Types File

**Enhance**: `/shared/api-types.ts`

```typescript
// Import from the main types file
export * from './types';

// Add specific API response types
export interface ApiPlayersResponse extends ApiResponse<Player[]> {}
export interface ApiPlayerResponse extends ApiResponse<Player> {}
export interface ApiGamesResponse extends ApiResponse<Game[]> {}
export interface ApiGameResponse extends ApiResponse<Game> {}
// ... etc for all resources
```

## Phase 2: Replace Game-Related Any Types (Week 1)

### 2.1 Fix Game Arrays (56 instances)

**Priority Files:**
- `/components/ui/unified-games-list.tsx`
- `/components/ui/upcoming-games-widget.tsx`
- `/components/ui/quarter-performance-analysis-widget.tsx`

**Before:**
```typescript
interface Props {
  games: any[];
  onEdit?: (game: any) => void;
}
```

**After:**
```typescript
interface Props {
  games: Game[];
  onEdit?: (game: Game) => void;
}
```

### 2.2 Fix Statistics Arrays (24 instances)

**Before:**
```typescript
const EMPTY_STATS: any[] = [];
```

**After:**
```typescript
const EMPTY_STATS: GameStats[] = [];
```

## Phase 3: Fix Error Handling (Week 2)

### 3.1 Create Standard Error Types

**File**: `/shared/types.ts` (add to existing)

```typescript
// ============================================================================
// ERROR TYPES
// ============================================================================

export interface AppError {
  message: string;
  code?: string;
  details?: unknown;
  timestamp: string;
}

export interface ValidationError extends AppError {
  field?: string;
  value?: unknown;
}

export interface NetworkError extends AppError {
  status?: number;
  url?: string;
}

export type ErrorHandler = (error: AppError) => void;
```

### 3.2 Replace Error Any Types (45 instances)

**Before:**
```typescript
onError: (error: any) => {
  toast({ title: 'Error', description: error.message });
}
```

**After:**
```typescript
onError: (error: AppError) => {
  toast({ title: 'Error', description: error.message });
}
```

## Phase 4: Fix Component Props (Week 2)

### 4.1 Replace Generic Any Props

**Before:**
```typescript
return (props: any) => (
  <ErrorBoundary>
    <Component {...props} />
  </ErrorBoundary>
);
```

**After:**
```typescript
return <T extends Record<string, unknown>>(props: T) => (
  <ErrorBoundary>
    <Component {...props} />
  </ErrorBoundary>
);
```

### 4.2 Fix Form Props

**Files to update:**
- All form components
- All form handlers

**Before:**
```typescript
onSave: (data: any) => void;
```

**After:**
```typescript
onSave: (data: PlayerFormData) => void;
```

## Phase 5: API Response Types (Week 3)

### 5.1 Update API Client

**File**: `/lib/apiClient.ts`

**Before:**
```typescript
async get<T = any>(url: string): Promise<T>
```

**After:**
```typescript
async get<T>(url: string): Promise<ApiResponse<T>>
```

### 5.2 Update React Query Hooks

**Before:**
```typescript
const { data: players = [] } = useQuery<any[]>({
  queryKey: ['players'],
  queryFn: () => apiClient.get('/api/players')
});
```

**After:**
```typescript
const { data: players = [] } = useQuery<Player[]>({
  queryKey: ['players'],
  queryFn: async () => {
    const response = await apiClient.get<Player[]>('/api/players');
    return response.data;
  }
});
```

## Implementation Strategy

### Week 1: Foundation
1. Create comprehensive type definitions
2. Fix game and statistics arrays
3. Test with 5-10 components

### Week 2: Error Handling & Components  
1. Implement standard error types
2. Fix all error handlers
3. Update component props
4. Fix form types

### Week 3: API Integration
1. Update API client with proper types
2. Update all React Query hooks
3. Fix remaining edge cases
4. Enable strict TypeScript mode

## Verification Steps

### 1. TypeScript Strict Mode
```json
// tsconfig.json
{
  "compilerServices": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

### 2. ESLint Rules
```json
// .eslintrc.js
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-member-access": "error"
  }
}
```

### 3. Pre-commit Hook
```bash
# Only allow commits with zero any types
grep -r ": any" src/ && exit 1 || exit 0
```

## Expected Benefits

1. **Compile-time Error Detection**: Catch type errors before runtime
2. **Better IDE Support**: Autocomplete, refactoring, navigation
3. **Self-documenting Code**: Types serve as documentation
4. **Reduced Bugs**: Type safety prevents common errors
5. **Easier Refactoring**: TypeScript helps track changes across files

## Success Metrics

- [ ] Zero `any` types in codebase
- [ ] TypeScript strict mode enabled
- [ ] All API calls properly typed
- [ ] All component props properly typed
- [ ] All error handlers properly typed
- [ ] ESLint no-any rules passing

## Quick Commands

```bash
# Count remaining any types
grep -r ": any" src/ --include="*.ts" --include="*.tsx" | wc -l

# Find specific any usage
grep -r ": any\[\]" src/ --include="*.ts" --include="*.tsx"
grep -r "error: any" src/ --include="*.ts" --include="*.tsx"
grep -r "data: any" src/ --include="*.ts" --include="*.tsx"

# Check TypeScript errors
npx tsc --noEmit
```

---

This plan provides a systematic approach to eliminating all `any` types while improving overall code quality and maintainability.