
// ============================================================================
// STANDARDIZED SIZE SYSTEM
// ============================================================================

export const STANDARD_SIZES = {
  sm: 'sm',
  md: 'md', 
  lg: 'lg',
  xl: 'xl'
} as const;

export type StandardSize = keyof typeof STANDARD_SIZES;

// Standard size mappings for common properties
export const SIZE_MAPPINGS = {
  // Padding scales
  padding: {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4',
    xl: 'p-6'
  },
  
  // Text scales  
  text: {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  },
  
  // Gap scales
  gap: {
    sm: 'gap-2',
    md: 'gap-3', 
    lg: 'gap-4',
    xl: 'gap-6'
  },
  
  // Border radius scales
  radius: {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg', 
    xl: 'rounded-xl'
  }
};

// Avatar/circle size mappings
export const AVATAR_SIZES = {
  sm: { width: 8, height: 8, text: 'text-sm' },    // 32px
  md: { width: 12, height: 12, text: 'text-base' }, // 48px
  lg: { width: 16, height: 16, text: 'text-xl' },   // 64px
  xl: { width: 20, height: 20, text: 'text-2xl' }   // 80px
};
