
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { actionColors, type ActionType } from '@/lib/designSystem';
import { LucideIcon } from 'lucide-react';

interface ActionButtonProps {
  action: ActionType;
  children: React.ReactNode;
  icon?: LucideIcon;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'solid' | 'outline' | 'ghost';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function ActionButton({ 
  action, 
  children, 
  icon: Icon, 
  size = 'default',
  variant = 'solid',
  className,
  ...props 
}: ActionButtonProps) {
  const colors = actionColors[action];
  
  const variantClasses = {
    solid: `${colors.bg} ${colors.hover} ${colors.text} border-0`,
    outline: `bg-transparent ${colors.border} border-2 ${colors.text.replace('text-white', 'text-foreground')} hover:${colors.bg} hover:text-white`,
    ghost: `bg-transparent hover:${colors.bg}/10 ${colors.text.replace('text-white', 'text-foreground')}`
  };

  return (
    <Button
      className={cn(
        variantClasses[variant],
        colors.ring,
        'font-medium transition-all duration-200 hover:shadow-md',
        Icon && 'inline-flex items-center gap-2',
        className
      )}
      size={size}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </Button>
  );
}
