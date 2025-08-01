# Naming Inconsistencies & File Cleanup Plan

## 📋 **Summary of Issues Found**

### **1. Naming Inconsistencies**
- **64 files** using kebab-case naming (should be PascalCase)
- **Mixed conventions** in the same directory (e.g., `ErrorBoundary.tsx` vs `error-boundary.tsx`)

### **2. Duplicate Files**
- **6 .backup files** that are clear duplicates
- **3 Legacy files** with newer implementations
- **3 error boundary implementations** doing the same thing
- **4 player availability managers** with overlapping functionality
- **4 roster managers** with similar purposes
- **4 statistics forms** with minor variations

### **3. Development Artifacts**
- **35+ example/test files** in production directories
- **Test components** mixed with production code

---

## 🎯 **Phase 1: Remove Clear Duplicates & Backups**

### **Files to Delete Immediately**
```bash
# Backup files (6 files)
rm client/src/components/ui/attack-defense-display.backup.tsx
rm client/src/components/ui/previous-games-display.tsx.backup
rm client/src/components/ui/selectable-player-box.tsx.backup
rm client/src/components/ui/shared-player-availability.tsx.backup
rm client/src/pages/StatsRecorder.backup.tsx
rm client/src/pages/PlayerDetails.backup.tsx

# Legacy files (if confirmed not in use)
rm client/src/components/players/PlayersListLegacy.tsx
rm client/src/pages/PlayersLegacy.tsx
rm client/src/pages/DashboardLegacy.tsx
```

### **Error Boundary Consolidation**
```bash
# Keep only the enhanced version
rm client/src/components/ui/ErrorBoundary.tsx
rm client/src/components/ui/error-boundary.tsx
# Keep: client/src/components/ui/enhanced-error-boundary.tsx
# Then rename to: ErrorBoundary.tsx
```

---

## 🔧 **Phase 2: Fix Naming Inconsistencies**

### **High Priority Renames (Most Used Components)**

| Current Name | New Name | Reason |
|-------------|----------|---------|
| `game-result-card.tsx` | `GameResultCard.tsx` | Fix case, high usage |
| `player-box.tsx` | `PlayerBox.tsx` | Fix case, core component |
| `player-avatar.tsx` | `PlayerAvatar.tsx` | Fix case, widely used |
| `team-avatar.tsx` | `TeamAvatar.tsx` | Fix case, widely used |
| `back-button.tsx` | `BackButton.tsx` | Fix case, navigation |
| `error-display.tsx` | `ErrorDisplay.tsx` | Fix case, error handling |
| `loading-state.tsx` | `LoadingState.tsx` | Fix case, common utility |

### **Dashboard Widget Renames**

| Current Name | New Name | Reason |
|-------------|----------|---------|
| `recent-games-widget.tsx` | `RecentGamesWidget.tsx` | Fix case |
| `compact-attack-defense-widget.tsx` | `AttackDefenseWidget.tsx` | Fix case + shorter |
| `quarter-performance-analysis-widget.tsx` | `QuarterPerformanceWidget.tsx` | Fix case + shorter |
| `stats-debug-table.tsx` | `StatsDebugTable.tsx` | Fix case |
| `upcoming-games-widget.tsx` | `UpcomingGamesWidget.tsx` | Fix case |
| `season-stats-widget.tsx` | `SeasonStatsWidget.tsx` | Fix case |
| `next-game-details-widget.tsx` | `NextGameWidget.tsx` | Fix case + shorter |

### **Form Component Renames**

| Current Name | New Name | Reason |
|-------------|----------|---------|
| `form-wrapper.tsx` | `FormWrapper.tsx` | Fix case |
| `crud-dialog.tsx` | `CrudDialog.tsx` | Fix case |
| `smart-select.tsx` | `SmartSelect.tsx` | Fix case |

### **Game Component Renames**

| Current Name | New Name | Reason |
|-------------|----------|---------|
| `game-badge.tsx` | `GameStatusBadge.tsx` | Fix case + clearer |
| `score-badge.tsx` | `GameScoreBadge.tsx` | Fix case + clearer |
| `result-badge.tsx` | `GameResultBadge.tsx` | Fix case + clearer |
| `simple-game-result-card.tsx` | `CompactGameCard.tsx` | Fix case + clearer |
| `unified-games-list.tsx` | `UnifiedGamesList.tsx` | Fix case |
| `simplified-games-list.tsx` | `SimpleGamesList.tsx` | Fix case + consistent |

### **Player Component Renames**

| Current Name | New Name | Reason |
|-------------|----------|---------|
| `player-availability.tsx` | `PlayerAvailabilityDisplay.tsx` | Fix case + clearer |
| `player-availability-selector.tsx` | `PlayerAvailabilitySelector.tsx` | Fix case |
| `selectable-player-box.tsx` | `SelectablePlayerBox.tsx` | Fix case |
| `enhanced-selectable-player-box.tsx` | `EnhancedPlayerBox.tsx` | Fix case + shorter |

### **UI Library Components (Keep kebab-case for shadcn/ui compatibility)**
These are from shadcn/ui library and should maintain their naming convention:
- `alert-dialog.tsx` ✅ Keep as-is
- `dropdown-menu.tsx` ✅ Keep as-is  
- `context-menu.tsx` ✅ Keep as-is
- `navigation-menu.tsx` ✅ Keep as-is
- `radio-group.tsx` ✅ Keep as-is
- `scroll-area.tsx` ✅ Keep as-is
- `toggle-group.tsx` ✅ Keep as-is
- `aspect-ratio.tsx` ✅ Keep as-is
- `hover-card.tsx` ✅ Keep as-is
- `input-otp.tsx` ✅ Keep as-is

---

## 🗑️ **Phase 3: Consolidate Duplicate Functionality**

### **Player Availability Components**
```typescript
// Keep ONE implementation based on features needed:
// Option 1: Full-featured for roster management
PlayerAvailabilityManager.tsx (in roster/)

// Option 2: Simple for just marking availability  
SimplePlayerAvailabilityManager.tsx

// Delete the rest after confirming usage
```

### **Statistics Forms**
```typescript
// Analyze which is most complete and used:
1. BasicStatForm.tsx - Check usage
2. SimpleStatForm.tsx - Check usage  
3. SimplifiedStatsForm.tsx - Likely duplicate of SimpleStatForm
4. StatisticsForm.tsx - Check if this is the main one

// Keep the most feature-complete, delete others
```

### **Roster Managers**
```typescript
// Keep based on specific use cases:
RosterManager.tsx - Main implementation
DragDropRosterManager.tsx - If drag-drop is required feature
// Delete SimpleRosterManager if functionality exists in main
```

---

## 📁 **Phase 4: Organize Development Files**

### **Move Example/Test Files**
```bash
# Create examples directory
mkdir -p client/src/examples

# Move all example files
mv client/src/pages/*Examples.tsx client/src/examples/
mv client/src/pages/*TestPage.tsx client/src/examples/
mv client/src/pages/*Reference.tsx client/src/examples/

# Or delete if not needed for documentation
```

---

## 🚀 **Implementation Steps**

### **Step 1: Backup Current State**
```bash
git checkout -b cleanup/naming-and-duplicates
git add .
git commit -m "Backup before naming cleanup"
```

### **Step 2: Delete Clear Duplicates**
```bash
# Remove .backup files
find . -name "*.backup.*" -type f -delete

# Remove legacy files after confirming
rm client/src/pages/DashboardLegacy.tsx
rm client/src/pages/PlayersLegacy.tsx
```

### **Step 3: Batch Rename Files**
```bash
# Create rename script
cat > rename-files.sh << 'EOF'
#!/bin/bash

# Game components
mv client/src/components/ui/game-result-card.tsx client/src/components/ui/GameResultCard.tsx
mv client/src/components/ui/simple-game-result-card.tsx client/src/components/ui/CompactGameCard.tsx

# Player components  
mv client/src/components/ui/player-box.tsx client/src/components/ui/PlayerBox.tsx
mv client/src/components/ui/player-avatar.tsx client/src/components/ui/PlayerAvatar.tsx

# Widgets
mv client/src/components/ui/recent-games-widget.tsx client/src/components/ui/RecentGamesWidget.tsx
mv client/src/components/ui/compact-attack-defense-widget.tsx client/src/components/ui/AttackDefenseWidget.tsx

# ... add all renames
EOF

chmod +x rename-files.sh
./rename-files.sh
```

### **Step 4: Update All Imports**
```typescript
// Use VS Code search & replace (with regex)
// Example patterns:

// From: from ['"].*\/game-result-card['"]
// To: from '$1/GameResultCard'

// From: from ['"].*\/player-box['"]  
// To: from '$1/PlayerBox'
```

### **Step 5: Verify No Broken Imports**
```bash
# Build to check for errors
npm run build

# Run type check
npm run type-check
```

---

## 📊 **Expected Impact**

### **Before Cleanup**
- 64 inconsistently named files
- 6 backup files
- 3 legacy files  
- Multiple duplicate implementations
- 35+ test files in production

### **After Cleanup**
- ✅ Consistent PascalCase naming
- ✅ No backup files
- ✅ No legacy code
- ✅ Single implementation per feature
- ✅ Clean production directories

### **Benefits**
1. **Reduced Confusion** - No more wondering which version to use
2. **Smaller Bundle** - Less duplicate code
3. **Easier Maintenance** - Clear which component is the source of truth
4. **Better Developer Experience** - Consistent naming patterns
5. **Cleaner Codebase** - No development artifacts in production

---

## ⚠️ **Risk Mitigation**

1. **Create Full Backup Branch** before starting
2. **Update Imports Systematically** using find/replace
3. **Run Tests** after each phase
4. **Check Build** frequently
5. **Review Usage** before deleting any file
6. **Document Decisions** for team knowledge

This cleanup will significantly improve code quality and developer experience!