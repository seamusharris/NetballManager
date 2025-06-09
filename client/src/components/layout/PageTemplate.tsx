import React from 'react';
import { useLocation } from 'wouter';
import { Home, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BackButton } from '@/components/ui/back-button';
import { PAGE_STRUCTURE, SPACING_STANDARDS } from '@/components/dashboard/widget-standards';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

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
  const [, navigate] = useLocation();

  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink 
            onClick={() => navigate('/dashboard')}
            className="cursor-pointer flex items-center"
          >
            <Home className="h-4 w-4" />
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {index === items.length - 1 ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink 
                  onClick={() => item.href && navigate(item.href)}
                  className={item.href ? "cursor-pointer" : ""}
                >
                  {item.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}