
import React from 'react';
import { cn } from '@/lib/utils';
import { headerStyles } from '@/lib/designSystem';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  metadata?: string[];
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ 
  title, 
  subtitle, 
  metadata, 
  actions, 
  className 
}: PageHeaderProps) {
  return (
    <div className={cn(headerStyles.page.container, className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h1 className={headerStyles.page.title}>{title}</h1>
          {subtitle && (
            <p className={headerStyles.page.subtitle}>{subtitle}</p>
          )}
          {metadata && metadata.length > 0 && (
            <div className="flex flex-wrap gap-4 mt-2">
              {metadata.map((item, index) => (
                <span key={index} className={headerStyles.page.metadata}>
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>
        {actions && (
          <div className="flex gap-3 ml-6">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
