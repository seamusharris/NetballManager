import React from 'react';
import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';

interface GameBadgeProps {
  children: React.ReactNode;
  variant?: 'round' | 'status' | 'score' | 'default' | "round-pill" | "round-outline" | "round-minimal" | "round-timeline";
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const gameBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        round: "border-gray-300 bg-gray-100 text-gray-800 hover:bg-gray-200",
        // New round styles
        "round-pill": "border-transparent bg-slate-200 text-slate-700 px-2 py-0.5 text-xs rounded-full",
        "round-outline": "border-slate-300 bg-transparent text-slate-700 hover:bg-slate-50",
        "round-minimal": "border-transparent bg-slate-800 text-white w-5 h-5 p-0 rounded-full flex items-center justify-center text-xs leading-none",
        "round-timeline": "border-transparent px-2 py-0.5 text-xs rounded-md font-medium",
        status: "border-blue-300 bg-blue-100 text-blue-800",
        division: "border-purple-300 bg-purple-100 text-purple-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);


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
        gameBadgeVariants({variant, className}),
      )}
    >
      {children}
    </span>
  );
}