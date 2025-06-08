
// Design System Constants
// This file defines all the design tokens and standards for the application

export const spacing = {
  // Standard spacing scale
  xs: '0.5rem',    // 8px
  sm: '0.75rem',   // 12px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '2.5rem', // 40px
  '3xl': '3rem',   // 48px
  '4xl': '4rem',   // 64px
} as const;

export const actionColors = {
  // Standard action colors with consistent theming
  create: {
    bg: 'bg-netball-green',
    hover: 'hover:bg-netball-green-dark',
    text: 'text-white',
    border: 'border-netball-green',
    ring: 'focus:ring-netball-green/50'
  },
  edit: {
    bg: 'bg-netball-court-blue',
    hover: 'hover:bg-netball-court-blue-dark',
    text: 'text-white',
    border: 'border-netball-court-blue',
    ring: 'focus:ring-netball-court-blue/50'
  },
  delete: {
    bg: 'bg-netball-red',
    hover: 'hover:bg-netball-red-dark',
    text: 'text-white',
    border: 'border-netball-red',
    ring: 'focus:ring-netball-red/50'
  },
  manage: {
    bg: 'bg-netball-orange',
    hover: 'hover:bg-netball-orange-dark',
    text: 'text-white',
    border: 'border-netball-orange',
    ring: 'focus:ring-netball-orange/50'
  },
  view: {
    bg: 'bg-neutral-100',
    hover: 'hover:bg-neutral-200',
    text: 'text-neutral-800',
    border: 'border-neutral-300',
    ring: 'focus:ring-neutral-400/50'
  },
  secondary: {
    bg: 'bg-white',
    hover: 'hover:bg-neutral-50',
    text: 'text-neutral-700',
    border: 'border-neutral-300',
    ring: 'focus:ring-neutral-400/50'
  }
} as const;

export const contentBoxStyles = {
  // Standard content box variations
  default: 'bg-card rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-all duration-200',
  compact: 'bg-card rounded-lg border border-border p-4 hover:shadow-sm transition-all duration-200',
  highlighted: 'bg-gradient-to-br from-card to-card/80 rounded-lg border border-border p-4 hover:shadow-md transition-all duration-200',
  metric: 'bg-card rounded-lg border border-border p-4 text-center hover:bg-muted/50 transition-all duration-200',
  interactive: 'bg-card rounded-xl shadow-sm border border-border p-6 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer'
} as const;

export const headerStyles = {
  // Page header structure
  page: {
    container: 'flex flex-col gap-2 mb-8 pb-6 border-b border-border',
    title: 'text-4xl font-bold text-foreground tracking-tight',
    subtitle: 'text-xl text-muted-foreground',
    metadata: 'text-sm text-muted-foreground font-medium'
  },
  section: {
    container: 'flex items-center justify-between mb-6 pb-4 border-b border-border',
    title: 'text-2xl font-semibold text-foreground',
    subtitle: 'text-base text-muted-foreground mt-1'
  },
  card: {
    container: 'mb-4',
    title: 'text-lg font-semibold text-foreground',
    subtitle: 'text-sm text-muted-foreground mt-1'
  }
} as const;

export const layoutSpacing = {
  // Standard layout spacing
  pageContainer: 'container mx-auto px-6 py-8',
  sectionGap: 'space-y-8',
  cardGrid: 'grid gap-6',
  buttonGroup: 'flex gap-3',
  formGroup: 'space-y-4',
  listSpacing: 'space-y-3'
} as const;

export type ActionType = keyof typeof actionColors;
export type ContentBoxType = keyof typeof contentBoxStyles;
export type HeaderType = keyof typeof headerStyles;
