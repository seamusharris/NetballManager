import React from 'react';
import { useLocation } from 'wouter';
import { Home, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import BackButton from '@/components/ui/back-button';
import { PAGE_STRUCTURE, SPACING_STANDARDS } from '@/components/dashboard/widget-standards';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { DynamicBreadcrumbs } from './DynamicBreadcrumbs';

// ============================================================================
// PAGE TEMPLATE COMPONENT
// ============================================================================

interface PageTemplateProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  showBreadcrumbs?: boolean;
  showBackButton?: boolean;
  backButtonProps?: {
    fallbackPath?: string;
    className?: string;
  };
}

function PageTemplate({ 
  title, 
  subtitle, 
  showBreadcrumbs = true,
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

      {showBreadcrumbs && <DynamicBreadcrumbs />}

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

export default PageTemplate;