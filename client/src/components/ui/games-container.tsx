
import React from 'react';
import { cn } from '@/lib/utils';

export type GamesSpacing = 'none' | 'tight' | 'normal' | 'loose';

interface GamesContainerProps {
  children: React.ReactNode;
  spacing?: GamesSpacing;
  className?: string;
}

const spacingClasses: Record<GamesSpacing, string> = {
  none: 'gap-0',
  tight: 'gap-2',
  normal: 'gap-4',
  loose: 'gap-6'
};

export function GamesContainer({ 
  children, 
  spacing = 'normal', 
  className 
}: GamesContainerProps) {
  return (
    <div className={cn(
      'flex flex-col',
      spacingClasses[spacing], 
      className
    )}>
      {children}
    </div>
  );
}
