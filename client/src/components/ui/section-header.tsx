
import React from 'react';
import { cn } from '@/lib/utils';
import { headerStyles } from '@/lib/designSystem';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ title, subtitle, actions, className }: SectionHeaderProps) {
  return (
    <div className={cn(headerStyles.section.container, className)}>
      <div>
        <h2 className={headerStyles.section.title}>{title}</h2>
        {subtitle && (
          <p className={headerStyles.section.subtitle}>{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}
