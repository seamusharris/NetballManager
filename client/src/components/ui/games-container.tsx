
import React from 'react';
import { cn } from '@/lib/utils';

export type GamesSpacing = 'none' | 'tight' | 'normal' | 'loose' | 'compact';

interface GamesContainerProps {
  children: React.ReactNode;
  spacing?: GamesSpacing;
  className?: string;
  /** Use when displaying in dashboard widgets or sidebars */
  widget?: boolean;
  /** Use when displaying in full-width lists or tables */
  list?: boolean;
}

const spacingClasses: Record<GamesSpacing, string> = {
  none: 'gap-0',
  tight: 'gap-1',      // For very dense displays
  compact: 'gap-2',    // For dashboard widgets
  normal: 'gap-3',     // Default for most lists
  loose: 'gap-4'       // For spacious layouts
};

export function GamesContainer({ 
  children, 
  spacing = 'normal', 
  className,
  widget = false,
  list = false
}: GamesContainerProps) {
  // Auto-select spacing based on context
  const effectiveSpacing = widget ? 'compact' : list ? 'normal' : spacing;
  
  return (
    <div className={cn(
      'flex flex-col',
      spacingClasses[effectiveSpacing], 
      className
    )}>
      {children}
    </div>
  );
}
