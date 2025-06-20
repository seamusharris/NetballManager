import React from 'react';
import { printClasses } from '@/lib/printUtils';

interface PrintWrapperProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function PrintWrapper({ children, title, subtitle, className = '' }: PrintWrapperProps) {
  return (
    <div className={className}>
      {/* Print-only header - only visible when printing */}
      {title && (
        <div className="hidden print:block">
          <h1 className="text-2xl font-bold mb-2">{title}</h1>
          {subtitle && <p className="text-lg text-gray-600 mb-4">{subtitle}</p>}
          <hr className="my-4" />
        </div>
      )}

      {/* Main content - always visible */}
      {children}
    </div>
  );
}