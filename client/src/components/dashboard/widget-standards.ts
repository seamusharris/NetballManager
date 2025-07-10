/**
 * Widget Standardization Guide
 * 
 * All dashboard widgets should follow this structure for consistency:
 * 
 * 1. Use BaseWidget or CustomHeaderWidget as the container
 * 2. Standard naming convention for props
 * 3. Consistent spacing and typography
 */

export interface StandardWidgetProps {
  title: string;
  description?: string;
  className?: string;
  showBorder?: boolean;
}

export interface WidgetContentProps {
  isLoading?: boolean;
  error?: string;
  emptyMessage?: string;
}

// Standard spacing classes to use consistently
export const WIDGET_SPACING = {
  // Margins
  sectionMargin: 'mt-6',
  itemMargin: 'mt-4',
  smallMargin: 'mt-2',

  // Padding
  containerPadding: 'p-6',
  contentPadding: 'p-4',
  smallPadding: 'p-3',

  // Gaps
  gridGap: 'gap-4',
  smallGap: 'gap-2',

  // Text spacing
  titleMargin: 'mb-1',
  descriptionMargin: 'mb-2',
  label: 'text-xs text-gray-500 font-medium',
  value: 'text-xl font-bold text-gray-700',
  smallValue: 'text-lg font-semibold text-gray-700',
} as const;

// Action color standards (use with button components)
export const ACTION_STYLES = {
  create: 'btn-create',
  edit: 'btn-edit',
  delete: 'btn-delete',
  manage: 'btn-manage',
  view: 'btn-view',
} as const;

// Standard component classes
export const WIDGET_COMPONENTS = {
  statBox: 'text-center bg-muted/30 p-3 rounded-lg border border-border',
  chartContainer: 'bg-card rounded-lg border border-border shadow-sm p-4',
  contentBox: 'content-box',
  contentBoxSm: 'content-box-sm',
  widgetContainer: 'widget-container',
  dataBox: 'data-box',
} as const;

// Standard page structure classes
export const PAGE_STRUCTURE = {
  container: 'page-container',
  section: 'content-section',
  headerSection: 'page-header-section',
  pageTitle: 'page-header',
  pageSubtitle: 'page-subtitle',
  sectionTitle: 'section-header',
  widgetTitle: 'widget-header',
} as const;

// Standard spacing utilities 
export const SPACING_STANDARDS = {
  // Use these for consistent spacing throughout the app
  sectionGap: 'mb-8',      // Between major page sections
  widgetGap: 'mb-6',       // Between widgets
  contentGap: 'mb-4',      // Between content items
  smallGap: 'mb-2',        // Between related items

  // Padding standards
  pagePadding: 'p-6',      // Main page content
  widgetPadding: 'p-4',    // Widget content
  boxPadding: 'p-3',       // Small boxes

  // Grid gaps
  gridGap: 'gap-6',        // Main grid layouts
  smallGridGap: 'gap-4',   // Compact grids
  tightGridGap: 'gap-2',   // Very compact layouts
} as const;

// Game Result Card Spacing - Use GamesContainer with these semantic values
export const GAME_CARD_SPACING = {
  // For different contexts
  tight: 'tight',      // Sidebar widgets, compact views
  normal: 'normal',    // Dashboard widgets, main content
  loose: 'loose',      // Feature pages, detailed views
  none: 'none',        // Special cases only
} as const;

// Widget Content Spacing - Consistent spacing within widgets
export const WIDGET_CONTENT_SPACING = {
  // Standard classes for widget internals
  itemSpacing: 'space-y-3',     // Between items in widgets
  sectionSpacing: 'space-y-4',  // Between sections in widgets
  compactSpacing: 'space-y-2',  // For compact widgets
  
  // Use these instead of arbitrary spacing values
  standardGap: 'gap-4',         // Standard gap for flex/grid
  compactGap: 'gap-2',          // Compact gap
  generousGap: 'gap-6',         // Generous gap
} as const;

// Helper functions for consistent spacing application
export const SPACING_HELPERS = {
  // Get the appropriate spacing for game card lists
  getGameCardSpacing: (context: 'dashboard' | 'sidebar' | 'page' | 'compact') => {
    const map = {
      dashboard: GAME_CARD_SPACING.normal,
      sidebar: GAME_CARD_SPACING.tight,
      page: GAME_CARD_SPACING.loose,
      compact: GAME_CARD_SPACING.tight,
    };
    return map[context];
  },
  
  // Get widget content spacing
  getWidgetSpacing: (size: 'compact' | 'normal' | 'generous') => {
    const map = {
      compact: WIDGET_CONTENT_SPACING.compactSpacing,
      normal: WIDGET_CONTENT_SPACING.itemSpacing,
      generous: WIDGET_CONTENT_SPACING.sectionSpacing,
    };
    return map[size];
  },
} as const;

// Helper function to get action button class
export function getActionButtonClass(action: keyof typeof ACTION_STYLES): string {
  return ACTION_STYLES[action];
}

// Page template helper functions
export const PAGE_HELPERS = {
  // Create breadcrumb items for common navigation patterns
  createBreadcrumbs: (items: Array<{label: string, href?: string, onClick?: () => void}>) => items,

  // Generate page title with club/team context
  createPageTitle: (baseName: string, teamName?: string, clubName?: string) => {
    if (teamName) return `${baseName} - ${teamName}`;
    if (clubName) return `${baseName} - ${clubName}`;
    return baseName;
  },

  // Generate page subtitle with context
  createPageSubtitle: (description: string, context?: string) => {
    return context ? `${description} • ${context}` : description;
  }
} as const;

// Content section helper functions
export const CONTENT_HELPERS = {
  // Standard section configurations
  getSectionConfig: (type: 'main' | 'sidebar' | 'footer') => {
    const configs = {
      main: { variant: 'default' as const, spacing: 'default' as const },
      sidebar: { variant: 'bordered' as const, spacing: 'compact' as const },
      footer: { variant: 'default' as const, spacing: 'loose' as const }
    };
    return configs[type];
  }
} as const;