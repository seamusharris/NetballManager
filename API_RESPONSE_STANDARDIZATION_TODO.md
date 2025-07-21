# API Response Standardization TODO

## Issue
Response structures vary inconsistently across endpoints, making client-side handling unpredictable and complex.

## Current Inconsistencies Found

### 1. Game Statistics (`/api/games/*/stats`)
```json
{
  "data": {
    "id": 1221,
    "gameId": 1441,
    "teamId": 3373,
    // ... other fields
  },
  "meta": {
    "timestamp": "2025-07-21T03:43:52.619Z"
  }
}
```

### 2. Game Scores (`/api/games/*/scores`)
```json
{
  "data": {
    "0": {
      "id": 394,
      "gameId": 1581,
      "teamId": 3653,
      // ... other fields
    },
    "1": {
      "id": 395,
      "gameId": 1581,
      "teamId": 3654,
      // ... other fields
    }
  },
  "meta": {
    "timestamp": "2025-07-21T03:49:24.400Z"
  }
}
```

### 3. Other Endpoints (varies)
- Some return direct objects
- Some return arrays
- Some have `data` wrapper, some don't
- Meta information inconsistent

## Proposed Standardization

### Standard Response Format
```json
{
  "data": <actual_data>,
  "meta": {
    "timestamp": "ISO_DATE_STRING",
    "count": <number_if_array>,
    "page": <page_info_if_paginated>
  },
  "success": true
}
```

### Error Response Format
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": <additional_error_info>
  },
  "meta": {
    "timestamp": "ISO_DATE_STRING"
  },
  "success": false
}
```

## Implementation Plan

### Phase 1: Audit Current Responses
- [ ] Document all endpoint response formats
- [ ] Identify patterns and inconsistencies
- [ ] Categorize by response type (single, array, nested)

### Phase 2: Create Response Wrapper Utilities
- [ ] Create `createSuccessResponse(data, meta?)` utility
- [ ] Create `createErrorResponse(error, meta?)` utility
- [ ] Update `transformToApiFormat` to use standard wrapper

### Phase 3: Migrate Endpoints Systematically
- [ ] Start with newly fixed endpoints (stats, scores)
- [ ] Update existing endpoints in batches
- [ ] Update tests to expect standard format

### Phase 4: Client-Side Updates
- [ ] Update API client to handle standard format
- [ ] Update React hooks and components
- [ ] Add response validation/typing

## Benefits
- Consistent client-side handling
- Easier error handling
- Better debugging with timestamps
- Future-proof for pagination/metadata
- Improved developer experience

## Priority
**Medium** - Should be done after case conversion is complete but before major new features.

## Related Files
- `server/api-utils.ts` - Response transformation utilities
- `server/api-response-standards.ts` - Response format definitions
- All route handlers - Need to use standard response format
- Client-side API utilities - Need to handle standard format

## Notes
- This was discovered during case conversion testing
- Current inconsistency makes testing more complex
- Should maintain backward compatibility during migration