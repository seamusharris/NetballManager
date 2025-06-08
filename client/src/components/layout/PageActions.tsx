
import React from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// PAGE ACTIONS COMPONENT
// ============================================================================

interface PageActionsProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
  spacing?: 'tight' | 'normal' | 'loose';
}

export function PageActions({ 
  children, 
  className, 
  align = 'right',
  spacing = 'normal'
}: PageActionsProps) {
  const alignClass = {
    left: 'justify-start',
    right: 'justify-end',
    center: 'justify-center'
  }[align];

  const spacingClass = {
    tight: 'gap-2',
    normal: 'gap-3',
    loose: 'gap-4'
  }[spacing];

  return (
    <div className={cn('flex items-center flex-wrap', alignClass, spacingClass, className)}>
      {children}
    </div>
  );
}

// ============================================================================
// BUTTON GROUP COMPONENT
// ============================================================================

interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function ButtonGroup({ 
  children, 
  className, 
  orientation = 'horizontal' 
}: ButtonGroupProps) {
  const orientationClass = orientation === 'vertical' ? 'flex-col space-y-2' : 'space-x-2';
  
  return (
    <div className={cn('flex', orientationClass, className)}>
      {children}
    </div>
  );
}
