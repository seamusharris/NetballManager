
import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BackButton } from '@/components/ui/back-button';
import { PAGE_STRUCTURE, SPACING_STANDARDS } from '@/components/dashboard/widget-standards';

// ============================================================================
// PAGE TEMPLATE COMPONENT
// ============================================================================

interface PageTemplateProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  showBackButton?: boolean;
  backButtonProps?: {
    fallbackPath?: string;
    className?: string;
  };
}

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export function PageTemplate({ 
  title, 
  subtitle, 
  breadcrumbs, 
  actions, 
  children, 
  className,
  showBackButton = false,
  backButtonProps
}: PageTemplateProps) {
  return (
    <div className={cn(PAGE_STRUCTURE.container, className)}>
      {showBackButton && (
        <BackButton 
          fallbackPath={backButtonProps?.fallbackPath}
          className={backButtonProps?.className}
        />
      )}
      
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      
      <div className={PAGE_STRUCTURE.headerSection}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className={PAGE_STRUCTURE.pageTitle}>{title}</h1>
            {subtitle && <p className={PAGE_STRUCTURE.pageSubtitle}>{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      </div>
      
      <div className={SPACING_STANDARDS.sectionGap}>
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// BREADCRUMB NAVIGATION
// ============================================================================

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="breadcrumb-nav">
      <Home className="h-4 w-4" />
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-4 w-4 breadcrumb-separator" />
          {item.href || item.onClick ? (
            <button
              onClick={item.onClick}
              className="breadcrumb-item"
            >
              {item.label}
            </button>
          ) : (
            <span className={index === items.length - 1 ? "breadcrumb-current" : "breadcrumb-item"}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
