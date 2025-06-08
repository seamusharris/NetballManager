import React from 'react';
import { Link } from 'wouter';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// PAGE STRUCTURE COMPONENTS
// ============================================================================

interface PageTemplateProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
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
  className 
}: PageTemplateProps) {
  return (
    <div className={cn("page-container", className)}>
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}

      <div className="page-header-section">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="page-header">{title}</h1>
            {subtitle && <p className="page-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      </div>

      {children}
    </div>
  );
}

// ============================================================================
// BREADCRUMB NAVIGATION
// ============================================================================

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="breadcrumb-nav">
      <Link href="/dashboard">
        <a className="breadcrumb-item">
          <Home size={16} />
        </a>
      </Link>

      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight size={16} className="breadcrumb-separator" />
          {index === items.length - 1 ? (
            <span className="breadcrumb-current">{item.label}</span>
          ) : item.href ? (
            <Link href={item.href}>
              <a className="breadcrumb-item">{item.label}</a>
            </Link>
          ) : (
            <button 
              className="breadcrumb-item"
              onClick={item.onClick}
            >
              {item.label}
            </button>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

// ============================================================================
// CONTENT SECTIONS
// ============================================================================

interface ContentSectionProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function ContentSection({ 
  title, 
  description, 
  actions, 
  children, 
  className 
}: ContentSectionProps) {
  return (
    <section className={cn("content-section", className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between mb-6">
          <div>
            {title && <h2 className="section-header">{title}</h2>}
            {description && <p className="text-muted-foreground mt-1">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

// ============================================================================
// CONTENT BOXES
// ============================================================================

interface ContentBoxProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  size?: 'default' | 'sm';
}

export function ContentBox({ 
  title, 
  description, 
  actions, 
  children, 
  className,
  size = 'default'
}: ContentBoxProps) {
  const boxClass = size === 'sm' ? 'content-box-sm' : 'content-box';

  return (
    <div className={cn(boxClass, className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && <h3 className="widget-header">{title}</h3>}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

// ============================================================================
// ACTION BUTTONS
// ============================================================================

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  action: 'create' | 'edit' | 'delete' | 'manage' | 'view';
  children: React.ReactNode;
  size?: 'sm' | 'default' | 'lg';
}

export function ActionButton({ action, children, className, size = 'default', ...props }: ActionButtonProps) {
  const actionClasses = {
    create: 'btn-create',
    edit: 'btn-edit', 
    delete: 'btn-delete',
    manage: 'btn-manage',
    view: 'btn-view'
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    default: 'px-6 py-2.5',
    lg: 'px-8 py-3 text-lg'
  };

  return (
    <button 
      className={cn(
        actionClasses[action], 
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      {icon && <div className="mb-4 flex justify-center text-muted-foreground">{icon}</div>}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {description && <p className="text-muted-foreground mb-6 max-w-md mx-auto">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}

interface DataGridProps {
  children: React.ReactNode;
  columns?: number;
  className?: string;
}

export function DataGrid({ children, columns = 1, className }: DataGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={cn('grid gap-6', gridCols[columns as keyof typeof gridCols], className)}>
      {children}
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export const UIStandards = {
  PageTemplate,
  ContentSection,
  ContentBox,
  ActionButton,
  Breadcrumbs,
  EmptyState,
  DataGrid,
};