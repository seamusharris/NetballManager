
# Design System Implementation Guide

## Overview
This guide outlines the implementation of our comprehensive design system for consistent UI/UX across the netball management application.

## 1. Color System

### Action Colors
- **Create**: Green (`--netball-green`) - Used for adding new items
- **Edit**: Blue (`--netball-court-blue`) - Used for modifying existing items  
- **Delete**: Red (`--netball-red`) - Used for removing items
- **Manage**: Orange (`--netball-orange`) - Used for management/admin actions
- **View**: Neutral gray - Used for viewing/displaying information
- **Secondary**: White/light gray - Used for secondary actions

### Player Avatar Colors
Continue using existing avatar color system: `bg-red-500`, `bg-orange-500`, `bg-teal-600`, etc.

## 2. Typography & Headers

### Page Headers (H1)
```jsx
<PageHeader 
  title="Team Dashboard"
  subtitle="Team performance overview and quick actions"
  metadata={["Club: WNC", "Division: 13U/3s", "Season: Active"]}
  actions={<ActionButton action="create">New Game</ActionButton>}
/>
```

### Section Headers (H2)
```jsx
<SectionHeader 
  title="Player Performance"
  subtitle="Individual player statistics and analytics"
  actions={<ActionButton action="view">View All</ActionButton>}
/>
```

### Card Headers (H3)
```jsx
<ContentBox 
  title="Recent Games"
  subtitle="Last 5 completed matches"
  actions={<ActionButton action="view" size="sm">View All</ActionButton>}
>
  {/* Content */}
</ContentBox>
```

## 3. Layout & Spacing

### Page Structure
```jsx
<div className="page-layout">          // Container with standard padding
  <PageHeader />                       // Page title, subtitle, metadata, actions
  
  <section className="page-section">   // 8-unit gap between sections
    <SectionHeader />                  // Section title and actions
    <div className="content-grid-2">   // Responsive grid layout
      <ContentBox />
      <ContentBox />
    </div>
  </section>
</div>
```

### Grid Systems
- `content-grid`: Basic grid with gap-6
- `content-grid-2`: 1 col mobile, 2 cols desktop
- `content-grid-3`: 1 col mobile, 2 cols tablet, 3 cols desktop  
- `content-grid-4`: 1 col mobile, 2 cols tablet, 4 cols desktop

## 4. Content Boxes

### Variants
- `default`: Standard content box with padding and shadow
- `compact`: Smaller padding for tight layouts
- `highlighted`: Gradient background for emphasis
- `metric`: Center-aligned for statistics
- `interactive`: Hover effects for clickable boxes

### Usage
```jsx
<ContentBox 
  variant="default"
  title="Game Statistics"
  subtitle="Performance metrics"
  actions={<ActionButton action="edit" size="sm">Edit</ActionButton>}
>
  {/* Content */}
</ContentBox>
```

## 5. Action Buttons

### Standard Actions
```jsx
<ActionButton action="create" icon={Plus}>Create Player</ActionButton>
<ActionButton action="edit" icon={Edit}>Edit Team</ActionButton>
<ActionButton action="delete" icon={Trash}>Delete Game</ActionButton>
<ActionButton action="manage" icon={Settings}>Manage</ActionButton>
<ActionButton action="view" icon={Eye}>View Details</ActionButton>
```

### Variants
- `solid`: Full color background (default)
- `outline`: Border with transparent background
- `ghost`: Minimal styling with hover effects

## 6. Migration Strategy

### Phase 1: Core Components (Week 1)
1. ✅ Create design system files
2. ✅ Update Dashboard page as example
3. Update ClubDashboard page
4. Update main navigation pages (Games, Players, Teams)

### Phase 2: Detail Pages (Week 2)
1. Update GameDetails page
2. Update PlayerDetails page  
3. Update team analysis pages
4. Update roster management pages

### Phase 3: Forms & Modals (Week 3)
1. Update all form components
2. Update modal dialogs
3. Update settings pages
4. Update statistics pages

### Phase 4: Polish & Refinement (Week 4)
1. Fine-tune spacing and colors
2. Add animations and micro-interactions
3. Test responsive layouts
4. Performance optimization

## 7. Fallback Plan

### Component Fallbacks
Each new component includes fallback to existing styling:
```jsx
// If new component fails, falls back to existing classes
<div className={cn(contentBoxStyles[variant], 'page-card', className)}>
```

### CSS Class Fallbacks
Maintain existing CSS classes alongside new system:
```css
/* New system */
.page-layout { /* new styles */ }

/* Legacy fallback */
.container.mx-auto.px-6.py-8 { /* existing styles */ }
```

### Rollback Strategy
1. Keep all existing components until migration complete
2. Use feature flags for new design system
3. Git branch strategy allows quick rollback
4. Incremental adoption prevents breaking changes

## 8. Testing Checklist

### Visual Testing
- [ ] Headers display correctly across all pages
- [ ] Action buttons have consistent colors
- [ ] Content boxes maintain proper spacing
- [ ] Responsive layouts work on mobile/tablet/desktop

### Functional Testing  
- [ ] All interactive elements work
- [ ] Color contrast meets accessibility standards
- [ ] Focus states are visible
- [ ] Loading states display properly

### Performance Testing
- [ ] No CSS bloat from unused classes
- [ ] Fast render times maintained
- [ ] Smooth animations and transitions

## 9. Usage Examples

See updated Dashboard.tsx for complete implementation example.

Key principles:
- Use semantic HTML structure
- Maintain consistent spacing
- Apply action colors consistently  
- Structure content with proper headers
- Use responsive grid systems
- Implement proper focus/hover states
