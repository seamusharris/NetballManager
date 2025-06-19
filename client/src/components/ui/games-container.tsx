
import React from 'react';
import { cn } from '@/lib/utils';

export type GamesSpacing = 'none' | 'tight' | 'normal' | 'loose';

interface GamesContainerProps {
  children: React.ReactNode;
  spacing?: GamesSpacing;
  className?: string;
}

const spacingClasses: Record<GamesSpacing, string> = {
  none: 'space-y-0',
  tight: 'space-y-2',
  normal: 'space-y-4',
  loose: 'space-y-6'
};

export function GamesContainer({ 
  children, 
  spacing = 'normal', 
  className 
}: GamesContainerProps) {
  return (
    <div className={cn(spacingClasses[spacing], className)}>
      {React.Children.map(children, (child, index) => (
        <div key={index} className={index > 0 ? 'mt-4' : ''}>
          {child}
        </div>
      ))}
    </div>
  );
}
