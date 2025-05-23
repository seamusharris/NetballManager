import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center' | 'between';
}

export function ButtonContainer({
  children,
  className,
  align = 'right',
  ...props
}: ButtonGroupProps) {
  const alignmentClass = 
    align === 'left' ? 'justify-start' :
    align === 'right' ? 'justify-end' :
    align === 'center' ? 'justify-center' :
    align === 'between' ? 'justify-between' : 'justify-end';

  return (
    <div 
      className={cn(
        'flex flex-wrap gap-2', 
        alignmentClass, 
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}