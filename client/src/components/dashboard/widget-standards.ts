
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
} as const;

// Standard typography classes
export const WIDGET_TYPOGRAPHY = {
  title: 'text-lg font-semibold text-gray-800',
  subtitle: 'text-sm font-medium text-gray-600',
  description: 'text-sm text-gray-600',
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
