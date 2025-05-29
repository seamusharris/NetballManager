
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface BaseWidgetProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  showBorder?: boolean;
}

export function BaseWidget({
  title,
  description,
  children,
  className,
  headerClassName,
  contentClassName,
  showBorder = true,
}: BaseWidgetProps) {
  return (
    <Card className={cn(showBorder && "border border-gray-200", className)}>
      <CardHeader className={cn("pb-1", headerClassName)}>
        <CardTitle className="text-lg font-semibold text-gray-800">
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </CardHeader>
      <CardContent className={cn("pt-0", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}

// For widgets that need custom header content
interface CustomHeaderWidgetProps {
  title: string;
  description?: string;
  headerContent?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  showBorder?: boolean;
}

export function CustomHeaderWidget({
  title,
  description,
  headerContent,
  children,
  className,
  headerClassName,
  contentClassName,
  showBorder = true,
}: CustomHeaderWidgetProps) {
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
