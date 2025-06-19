
import React from 'react';
import { cn } from '@/lib/utils';

interface GamesContainerProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'tight' | 'normal' | 'loose';
}

export function GamesContainer({ 
  children, 
  className,
  spacing = 'normal'
}: GamesContainerProps) {
  const spacingClasses = {
    tight: 'space-y-2',
    normal: 'space-y-4', 
    loose: 'space-y-6'
  };

  return (
    <div className={cn(spacingClasses[spacing], className)}>
      {children}
    </div>
  );
}

export default GamesContainer;
