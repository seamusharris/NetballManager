
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ACTION_STYLES } from '@/components/dashboard/widget-standards';

// ============================================================================
// ACTION BUTTON COMPONENT
// ============================================================================

interface ActionButtonProps {
  action: keyof typeof ACTION_STYLES;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  icon?: React.ReactNode;
}

export function ActionButton({
  action,
  children,
  onClick,
  disabled,
  loading,
  className,
  size = "default",
  variant,
  icon
}: ActionButtonProps) {
  // Get the action-specific class
  const actionClass = ACTION_STYLES[action];
  
  // Override variant if not specified to use action styling
  const buttonVariant = variant || (action === 'delete' ? 'destructive' : 'default');

  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(actionClass, className)}
      size={size}
      variant={buttonVariant}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
          Loading...
        </>
      ) : (
        children
      )}
    </Button>
  );
}

// ============================================================================
// ACTION BUTTON HELPERS
// ============================================================================

// Pre-configured action buttons for common use cases
export const CreateButton = (props: Omit<ActionButtonProps, 'action'>) => (
  <ActionButton action="create" {...props} />
);

export const EditButton = (props: Omit<ActionButtonProps, 'action'>) => (
  <ActionButton action="edit" {...props} />
);

export const DeleteButton = (props: Omit<ActionButtonProps, 'action'>) => (
  <ActionButton action="delete" {...props} />
);

export const ManageButton = (props: Omit<ActionButtonProps, 'action'>) => (
  <ActionButton action="manage" {...props} />
);

export const ViewButton = (props: Omit<ActionButtonProps, 'action'>) => (
  <ActionButton action="view" {...props} />
);
