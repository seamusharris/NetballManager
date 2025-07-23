import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// StandardWidget - Most common use case for widgets with titles and descriptions
interface StandardWidgetProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  showBorder?: boolean;
  headerContent?: React.ReactNode; // Optional custom header content
}

export function StandardWidget({
  title,
  description,
  children,
  className,
  headerClassName,
  contentClassName,
  showBorder = true,
  headerContent,
}: StandardWidgetProps) {
  return (
    <Card className={cn(showBorder && "border border-gray-200", className)}>
      <CardHeader className={cn("pb-1", headerClassName)}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-800">
              {title}
            </CardTitle>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
          {headerContent && (
            <div className="ml-4">
              {headerContent}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className={cn("pt-0", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}

// MinimalWidget - For widgets that need card styling but no header
interface MinimalWidgetProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  showBorder?: boolean;
}

export function MinimalWidget({
  children,
  className,
  contentClassName,
  showBorder = true,
}: MinimalWidgetProps) {
  return (
    <Card className={cn(showBorder && "border border-gray-200", className)}>
      <CardContent className={cn("p-4", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}

// ContentWidget - For widgets that are just content without card styling
interface ContentWidgetProps {
  children: React.ReactNode;
  className?: string;
}

export function ContentWidget({
  children,
  className,
}: ContentWidgetProps) {
  return (
    <div className={cn(className)}>
      {children}
    </div>
  );
} 