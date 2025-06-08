
import React from 'react';
import { cn } from '@/lib/utils';
import { PAGE_STRUCTURE, SPACING_STANDARDS, WIDGET_COMPONENTS } from '@/components/dashboard/widget-standards';

// ============================================================================
// CONTENT SECTION COMPONENTS
// ============================================================================

interface ContentSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'bordered' | 'elevated';
  spacing?: 'default' | 'compact' | 'loose';
}

export function ContentSection({ 
  title, 
  description, 
  children, 
  className,
  variant = 'default',
  spacing = 'default'
}: ContentSectionProps) {
  const spacingClass = {
    default: SPACING_STANDARDS.contentGap,
    compact: SPACING_STANDARDS.smallGap,
    loose: SPACING_STANDARDS.sectionGap
  }[spacing];

  const variantClass = {
    default: '',
    bordered: 'border border-border rounded-lg p-6',
    elevated: WIDGET_COMPONENTS.contentBox
  }[variant];

  return (
    <section className={cn(PAGE_STRUCTURE.section, spacingClass, variantClass, className)}>
      {(title || description) && (
        <div className={SPACING_STANDARDS.contentGap}>
          {title && <h2 className={PAGE_STRUCTURE.sectionTitle}>{title}</h2>}
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

// ============================================================================
// CONTENT BOX COMPONENT
// ============================================================================

interface ContentBoxProps {
  children: React.ReactNode;
  className?: string;
  size?: 'default' | 'small';
  padding?: 'default' | 'large' | 'small';
}

export function ContentBox({ 
  children, 
  className, 
  size = 'default',
  padding = 'default'
}: ContentBoxProps) {
  const sizeClass = size === 'small' ? WIDGET_COMPONENTS.contentBoxSm : WIDGET_COMPONENTS.contentBox;
  
  const paddingClass = {
    default: '',
    large: SPACING_STANDARDS.pagePadding,
    small: SPACING_STANDARDS.boxPadding
  }[padding];

  return (
    <div className={cn(sizeClass, paddingClass, className)}>
      {children}
    </div>
  );
}
