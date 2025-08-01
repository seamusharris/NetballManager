# Component Naming & Restructuring Analysis

## Current Naming Issues & Proposed Solutions

### 🎯 **Naming Conventions & Standards**

#### **Good Naming Principles:**
1. **Purpose over Implementation** - What it does, not how
2. **Domain Language** - Use business terms users understand  
3. **Consistency** - Follow established patterns
4. **Clarity** - Name should be self-explaining
5. **Hierarchy** - Show relationships through naming

---

## 📋 **Component Audit & Renaming Plan**

### **Form Components**
| Current Name | Issues | Proposed Name | Reasoning |
|-------------|---------|---------------|-----------|
| `GameForm` | ✅ Good | `GameForm` | Clear, follows convention |
| `PlayerForm` | ✅ Good | `PlayerForm` | Clear, follows convention |
| `TeamForm` | ✅ Good | `TeamForm` | Clear, follows convention |
| `ClubForm` | ✅ Good | `ClubForm` | Clear, follows convention |
| `SeasonForm` | ✅ Good | `SeasonForm` | Clear, follows convention |
| `DivisionForm` | ✅ Good | `DivisionForm` | Clear, follows convention |
| `AgeGroupForm` | ✅ Good | `AgeGroupForm` | Clear, follows convention |
| `SectionForm` | ✅ Good | `SectionForm` | Clear, follows convention |

### **List/Table Components**
| Current Name | Issues | Proposed Name | Reasoning |
|-------------|---------|---------------|-----------|
| `GamesList` | ✅ Good | `GamesList` | Clear, follows convention |
| `PlayersList` | ✅ Good | `PlayersList` | Clear, follows convention |
| `TeamsList` | ✅ Good | `TeamsList` | Clear, follows convention |
| `stats-debug-table` | ❌ kebab-case, unclear | `StatsDebugTable` | PascalCase, descriptive |

### **Dashboard/Widget Components**
| Current Name | Issues | Proposed Name | Reasoning |
|-------------|---------|---------------|-----------|
| `UpcomingGames` | ❌ Too generic | `UpcomingGamesWidget` | Indicates it's a widget |
| `RecentGames` | ❌ Too generic | `RecentGamesWidget` | Indicates it's a widget |
| `recent-games-widget` | ❌ kebab-case | `RecentGamesWidget` | PascalCase consistency |
| `compact-attack-defense-widget` | ❌ kebab-case | `AttackDefenseWidget` | Shorter, PascalCase |
| `quarter-performance-analysis-widget` | ❌ kebab-case, too long | `QuarterPerformanceWidget` | Shorter, PascalCase |
| `QuarterPerformanceWidget` | ❌ Inconsistent with file | `QuarterPerformanceWidget` | Align with component |
| `TopPlayersWidget` | ✅ Good | `TopPlayersWidget` | Clear widget naming |
| `PlayerAnalyticsWidget` | ✅ Good | `PlayerAnalyticsWidget` | Clear widget naming |

### **Manager/Container Components**
| Current Name | Issues | Proposed Name | Reasoning |
|-------------|---------|---------------|-----------|
| `DivisionManager` | ✅ Good | `DivisionManager` | Clear responsibility |
| `SeasonsManager` | ✅ Good | `SeasonsManager` | Clear responsibility |
| `RosterManager` | ✅ Good | `RosterManager` | Clear responsibility |
| `TeamPlayersManager` | ✅ Good | `TeamPlayersManager` | Clear responsibility |
| `PlayerClubsManager` | ✅ Good | `PlayerClubsManager` | Clear responsibility |

### **Selector/Input Components**
| Current Name | Issues | Proposed Name | Reasoning |
|-------------|---------|---------------|-----------|
| `ClubTeamSelector` | ✅ Good | `ClubTeamSelector` | Clear functionality |
| `PositionSelector` | ✅ Good | `PositionSelector` | Clear functionality |
| `PlayerAvailabilitySelector` | ✅ Good | `PlayerAvailabilitySelector` | Clear functionality |

### **Display/Card Components**
| Current Name | Issues | Proposed Name | Reasoning |
|-------------|---------|---------------|-----------|
| `GameResultCard` | ✅ Good | `GameResultCard` | Clear what it displays |
| `SimpleGameResultCard` | ❌ "Simple" is vague | `CompactGameCard` | Indicates size/style |
| `PlayerStatsCard` | ✅ Good | `PlayerStatsCard` | Clear content |
| `PlayerHeader` | ❌ Too generic | `PlayerDetailsHeader` | More specific |
| `game-result-card` | ❌ kebab-case | `GameResultCard` | PascalCase consistency |

### **Status/Badge Components**
| Current Name | Issues | Proposed Name | Reasoning |
|-------------|---------|---------------|-----------|
| `GameStatusBadge` | ✅ Good | `GameStatusBadge` | Clear purpose |
| `GameStatusButton` | ✅ Good | `GameStatusButton` | Clear interaction |
| `ResultBadge` | ❌ Too generic | `GameResultBadge` | More specific |
| `ScoreBadge` | ❌ Too generic | `GameScoreBadge` | More specific |

### **Specialized Game Components**
| Current Name | Issues | Proposed Name | Reasoning |
|-------------|---------|---------------|-----------|
| `AttackerStatsBox` | ✅ Good | `AttackerStatsBox` | Clear position focus |
| `DefenderStatsBox` | ✅ Good | `DefenderStatsBox` | Clear position focus |
| `MidCourtStatsBox` | ✅ Good | `MidCourtStatsBox` | Clear position focus |
| `PositionStatsBox` | ✅ Good | `PositionStatsBox` | Clear functionality |
| `StatItemBox` | ❌ Too generic | `GameStatItem` | More specific context |
| `PositionBox` | ❌ Too generic | `RosterPositionBox` | Indicates roster context |

### **Layout/Structure Components**
| Current Name | Issues | Proposed Name | Reasoning |
|-------------|---------|---------------|-----------|
| `Layout` | ❌ Too generic | `AppLayout` | Indicates main layout |
| `PageTemplate` | ✅ Good | `PageTemplate` | Clear purpose |
| `ContentSection` | ✅ Good | `ContentSection` | Clear purpose |
| `Sidebar` | ✅ Good | `Sidebar` | Clear purpose |
| `Header` | ❌ Too generic | `AppHeader` | More specific |

---

## 🏗️ **Feature-Based Restructuring Plan**

### **Phase 1: Group by Business Domain**

#### **Games Feature**
```
features/games/
├── components/
│   ├── forms/
│   │   ├── GameForm.tsx (✅ keep)
│   │   └── GameStatusDialog.tsx
│   ├── lists/
│   │   ├── GamesList.tsx (✅ keep)
│   │   └── GamesTable.tsx
│   ├── cards/
│   │   ├── GameResultCard.tsx (✅ keep)
│   │   ├── CompactGameCard.tsx (renamed from SimpleGameResultCard)
│   │   └── GameDetailsCard.tsx
│   ├── widgets/
│   │   ├── UpcomingGamesWidget.tsx (renamed from UpcomingGames)
│   │   ├── RecentGamesWidget.tsx (renamed from recent-games-widget)
│   │   └── GameStatsWidget.tsx
│   ├── status/
│   │   ├── GameStatusBadge.tsx (✅ keep)
│   │   ├── GameStatusButton.tsx (✅ keep)
│   │   └── GameResultBadge.tsx (renamed from ResultBadge)
│   └── selectors/
│       ├── ClubTeamSelector.tsx (✅ keep)
│       └── GameStatusSelector.tsx
```

#### **Players Feature**
```
features/players/
├── components/
│   ├── forms/
│   │   ├── PlayerForm.tsx (✅ keep)
│   │   └── PlayerAvailabilityForm.tsx
│   ├── lists/
│   │   ├── PlayersList.tsx (✅ keep)
│   │   └── PlayersTable.tsx
│   ├── cards/
│   │   ├── PlayerCard.tsx
│   │   ├── PlayerStatsCard.tsx (✅ keep)
│   │   └── PlayerAvailabilityCard.tsx
│   ├── headers/
│   │   └── PlayerDetailsHeader.tsx (renamed from PlayerHeader)
│   ├── managers/
│   │   ├── PlayerClubsManager.tsx (✅ keep)
│   │   ├── PlayerSeasonsManager.tsx (✅ keep)
│   │   └── PlayerTeamsManager.tsx (✅ keep)
│   └── widgets/
│       ├── PlayerAnalyticsWidget.tsx (✅ keep)
│       ├── TopPlayersWidget.tsx (✅ keep)
│       └── PlayerPerformanceWidget.tsx
```

#### **Statistics Feature**
```
features/statistics/
├── components/
│   ├── widgets/
│   │   ├── AttackDefenseWidget.tsx (renamed from compact-attack-defense-widget)
│   │   ├── QuarterPerformanceWidget.tsx (renamed from quarter-performance-analysis-widget)
│   │   └── PositionStatsWidget.tsx
│   ├── displays/
│   │   ├── GameStatsDisplay.tsx
│   │   ├── PlayerStatsDisplay.tsx
│   │   └── TeamStatsDisplay.tsx
│   ├── forms/
│   │   ├── StatsRecorderForm.tsx
│   │   └── QuickStatsForm.tsx
│   ├── tables/
│   │   ├── StatsTable.tsx
│   │   └── StatsDebugTable.tsx (renamed from stats-debug-table)
│   └── boxes/
│       ├── AttackerStatsBox.tsx (✅ keep)
│       ├── DefenderStatsBox.tsx (✅ keep)
│       ├── MidCourtStatsBox.tsx (✅ keep)
│       └── GameStatItem.tsx (renamed from StatItemBox)
```

#### **Roster Feature**
```
features/roster/
├── components/
│   ├── managers/
│   │   ├── RosterManager.tsx (✅ keep)
│   │   ├── SimpleRosterManager.tsx (✅ keep)
│   │   └── TeamAwareRosterManager.tsx (✅ keep)
│   ├── displays/
│   │   ├── CourtView.tsx (✅ keep)
│   │   ├── BalancedCourtView.tsx (✅ keep)
│   │   └── QuarterRoster.tsx (✅ keep)
│   ├── boxes/
│   │   └── RosterPositionBox.tsx (renamed from PositionBox)
│   └── editors/
│       ├── DragDropLineupEditor.tsx (✅ keep)
│       └── DragDropRosterManager.tsx (✅ keep)
```

---

## 🚀 **Implementation Strategy**

### **Step 1: File Naming Convention**
```typescript
// Naming Pattern: [Domain][Purpose][Type]
// Examples:
GameForm.tsx          // Game + Form + (Component)
PlayerStatsCard.tsx   // Player + Stats + Card
TeamListWidget.tsx    // Team + List + Widget
RosterPositionBox.tsx // Roster + Position + Box
```

### **Step 2: Gradual Migration Process**

#### **2.1 Create New Structure**
```bash
# Create feature directories
mkdir -p src/features/games/components/{forms,lists,cards,widgets,status,selectors}
mkdir -p src/features/players/components/{forms,lists,cards,headers,managers,widgets}
mkdir -p src/features/statistics/components/{widgets,displays,forms,tables,boxes}
mkdir -p src/features/roster/components/{managers,displays,boxes,editors}
```

#### **2.2 Move and Rename Files**
```typescript
// Example migration script structure
const migrations = [
  // Rename kebab-case to PascalCase
  {
    from: 'components/ui/recent-games-widget.tsx',
    to: 'features/games/components/widgets/RecentGamesWidget.tsx'
  },
  {
    from: 'components/ui/compact-attack-defense-widget.tsx', 
    to: 'features/statistics/components/widgets/AttackDefenseWidget.tsx'
  },
  {
    from: 'components/ui/stats-debug-table.tsx',
    to: 'features/statistics/components/tables/StatsDebugTable.tsx'
  },
  // Move domain-specific components
  {
    from: 'components/games/GameForm.tsx',
    to: 'features/games/components/forms/GameForm.tsx'
  },
  {
    from: 'components/players/PlayerForm.tsx', 
    to: 'features/players/components/forms/PlayerForm.tsx'
  }
];
```

#### **2.3 Update Imports Systematically**
```typescript
// Before
import GameForm from '@/components/games/GameForm';
import { RecentGamesWidget } from '@/components/ui/recent-games-widget';

// After
import { GameForm } from '@features/games';
import { RecentGamesWidget } from '@features/games';

// Or with explicit paths during migration
import { GameForm } from '@features/games/components/forms/GameForm';
import { RecentGamesWidget } from '@features/games/components/widgets/RecentGamesWidget';
```

### **Step 3: Create Feature Barrel Exports**
```typescript
// features/games/index.ts
export { GameForm } from './components/forms/GameForm';
export { GamesList } from './components/lists/GamesList';
export { GameResultCard } from './components/cards/GameResultCard';
export { UpcomingGamesWidget } from './components/widgets/UpcomingGamesWidget';
export { RecentGamesWidget } from './components/widgets/RecentGamesWidget';

// features/players/index.ts  
export { PlayerForm } from './components/forms/PlayerForm';
export { PlayersList } from './components/lists/PlayersList';
export { PlayerStatsCard } from './components/cards/PlayerStatsCard';
export { PlayerAnalyticsWidget } from './components/widgets/PlayerAnalyticsWidget';
```

### **Step 4: Update Path Aliases**
```typescript
// vite.config.ts or tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@features/*": ["./src/features/*"],
      "@shared/*": ["./src/shared/*"],
      "@app/*": ["./src/app/*"]
    }
  }
}
```

---

## 📋 **Migration Checklist**

### **Pre-Migration**
- [ ] Audit all current component names and usages
- [ ] Create naming convention document
- [ ] Set up new directory structure
- [ ] Create barrel export files

### **During Migration** 
- [ ] Move files to new locations
- [ ] Rename files following conventions
- [ ] Update all import statements
- [ ] Update barrel exports
- [ ] Test each feature after migration

### **Post-Migration**
- [ ] Remove old directories
- [ ] Update documentation
- [ ] Update build/test configurations
- [ ] Code review and cleanup

---

## 🎯 **Expected Benefits**

1. **Clearer Intent**: Component names clearly indicate purpose
2. **Better Organization**: Related components grouped logically
3. **Easier Navigation**: Find components by feature, not type
4. **Consistent Naming**: All components follow same patterns
5. **Reduced Coupling**: Features are more independent
6. **Improved Maintenance**: Changes isolated to specific features

This restructuring will make the NeballManager codebase much more maintainable and easier for new developers to understand and contribute to.