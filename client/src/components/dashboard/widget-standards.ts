/**
 * Widget Standardization Guide
 * 
 * All dashboard widgets should follow this structure for consistency:
 * 
 * 1. Use StandardWidget, MinimalWidget, or ContentWidget as containers
 * 2. Standard naming convention for props
 * 3. Consistent spacing and typography
 * 
 * Widget Types:
 * - StandardWidget: For widgets with titles/descriptions (most common)
 * - MinimalWidget: For widgets that need card styling but no header
 * - ContentWidget: For widgets that are just content areas (no card wrapper)
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
  gameWidget: 'unified-game-widget',
} as const;

// Widget Type Guidelines
export const WIDGET_GUIDELINES = {
  // Use StandardWidget when:
  standardWidget: [
    'Widget has a clear title/description',
    'Widget is a standalone component',
    'Widget needs consistent card styling',
    'Widget will be placed in grid layouts'
  ],
  
  // Use MinimalWidget when:
  minimalWidget: [
    'Widget needs card styling but no header',
    'Widget content is self-explanatory',
    'Widget is part of a larger component'
  ],
  
  // Use ContentWidget when:
  contentWidget: [
    'Widget is just content without card styling',
    'Widget is embedded in another component',
    'Widget needs custom styling'
  ]
} as const;

// Unified Game Widget Standard Configurations
export const GAME_WIDGET_CONFIGS = {
  dashboard: {
    maxGames: 5,
    compact: true,
    showViewMore: true,
    showQuarterScores: false,
    showAnalytics: false
  },
  teamPage: {
    maxGames: 10,
    compact: false,
    showViewMore: true,
    showQuarterScores: true,
    showAnalytics: true
  },
  sidebar: {
    maxGames: 3,
    compact: true,
    showViewMore: false,
    showQuarterScores: false,
    showAnalytics: false
  }
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

// Migration guide for existing widgets
export const MIGRATION_GUIDE = {
  // Replace BaseWidget with StandardWidget
  baseWidget: 'StandardWidget',
  
  // Replace CustomHeaderWidget with StandardWidget + headerContent
  customHeaderWidget: 'StandardWidget with headerContent prop',
  
  // Replace direct Card usage with StandardWidget
  directCard: 'StandardWidget',
  
  // Replace custom div containers with ContentWidget
  customDiv: 'ContentWidget'
} as const;