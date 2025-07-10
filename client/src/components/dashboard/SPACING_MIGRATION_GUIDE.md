
# Spacing Standardization Guide

## Overview
This guide outlines the migration from inconsistent spacing to standardized spacing patterns across the application.

## Current Problems
- Multiple spacing approaches (`space-y-*`, `gap-*`, `GamesContainer`)
- Inconsistent values (2px, 8px, 16px, 24px used arbitrarily)
- No clear guidance on which spacing to use when

## Standardized Solution

### For Game Result Card Lists
**ALWAYS use `GamesContainer` with semantic spacing:**

```tsx
// ✅ CORRECT - Use GamesContainer
<GamesContainer spacing="normal">
  {games.map(game => <GameResultCard key={game.id} game={game} />)}
</GamesContainer>

// ❌ INCORRECT - Don't use direct Tailwind
<div className="space-y-3">
  {games.map(game => <GameResultCard key={game.id} game={game} />)}
</div>
```

### Spacing Context Guide
- **`tight`** - Sidebar widgets, compact views, limited space
- **`normal`** - Dashboard widgets, main content areas (DEFAULT)
- **`loose`** - Feature pages, detailed views, generous space
- **`none`** - Special cases only (adjacent elements, etc.)

### Widget Content Spacing
```tsx
// ✅ CORRECT - Use standardized classes
<div className={WIDGET_CONTENT_SPACING.itemSpacing}>
  <div>Item 1</div>
  <div>Item 2</div>
</div>

// ❌ INCORRECT - Don't use arbitrary values
<div className="space-y-5">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

## Migration Checklist

### Phase 1: Game Result Lists
- [ ] GameAnalysisWidget
- [ ] RecentFormWidget  
- [ ] OpponentFormWidget
- [ ] Any other components using GameResultCard

### Phase 2: Other Card Lists
- [ ] Player card lists
- [ ] Team card lists
- [ ] General card collections

### Phase 3: Widget Internals
- [ ] Dashboard widget content spacing
- [ ] Form element spacing
- [ ] General component spacing

## Implementation Rules

1. **No arbitrary spacing values** - Use semantic names
2. **Consistent patterns** - Same spacing approach for similar components
3. **Single source of truth** - All spacing definitions in `widget-standards.ts`
4. **Context-aware** - Choose spacing based on usage context

## Testing Checklist
- [ ] Visual consistency across all game lists
- [ ] Responsive behavior maintained
- [ ] No layout shifts or broken spacing
- [ ] Consistent spacing in all contexts
