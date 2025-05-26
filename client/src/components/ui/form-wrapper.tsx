
import React from 'react';
import { Button } from './button';

interface FormWrapperProps {
  onSubmit: (e: React.FormEvent) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitText?: string;
  cancelText?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormWrapper({
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitText = "Save",
  cancelText = "Cancel",
  children,
  className = ""
}: FormWrapperProps) {
  return (
    <form onSubmit={onSubmit} className={`space-y-4 ${className}`}>
      {children}
      
      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {cancelText}
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary text-white"
        >
          {isSubmitting ? 'Saving...' : submitText}
        </Button>
      </div>
    </form>
  );
}
