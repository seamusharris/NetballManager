
import React from 'react';
import { cn } from '@/lib/utils';

interface GameBadgeProps {
  children: React.ReactNode;
  variant?: 'round' | 'status' | 'score' | 'default';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const badgeVariants = {
  variant: {
    round: 'bg-gray-200 text-gray-800',
    status: 'bg-blue-100 text-blue-700', 
    score: 'bg-gray-100 text-gray-700',
    default: 'bg-gray-100 text-gray-600'
  },
  size: {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5'
  }
};

export function GameBadge({ 
  children, 
  variant = 'default', 
  size = 'sm', 
  className 
}: GameBadgeProps) {
  return (
    <span 
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        badgeVariants.variant[variant],
        badgeVariants.size[size],
        className
      )}
    >
      {children}
    </span>
  );
}
