
import React from 'react';
import { cn } from '@/lib/utils';
import { contentBoxStyles, type ContentBoxType, headerStyles } from '@/lib/designSystem';

interface ContentBoxProps {
  variant?: ContentBoxType;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function ContentBox({ 
  variant = 'default', 
  title, 
  subtitle, 
  actions, 
  children, 
  className,
  onClick 
}: ContentBoxProps) {
  const Component = onClick ? 'button' : 'div';
  
  return (
    <Component
      className={cn(contentBoxStyles[variant], className)}
      onClick={onClick}
    >
      {(title || actions) && (
        <div className={headerStyles.card.container}>
          <div className="flex items-start justify-between">
            <div>
              {title && (
                <h3 className={headerStyles.card.title}>{title}</h3>
              )}
              {subtitle && (
                <p className={headerStyles.card.subtitle}>{subtitle}</p>
              )}
            </div>
            {actions && (
              <div className="flex gap-2 ml-4">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
      {children}
    </Component>
  );
}
