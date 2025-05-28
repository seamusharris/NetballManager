
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

// Standard component classes
export const WIDGET_COMPONENTS = {
  statBox: 'text-center bg-gray-100 p-3 rounded-lg border border-gray-200',
  chartContainer: 'bg-gray-50 rounded-lg border border-gray-200',
  contentBox: 'p-3 bg-gray-50 rounded-lg border border-gray-200',
} as const;
