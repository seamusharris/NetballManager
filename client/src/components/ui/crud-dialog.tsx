import { ReactNode } from 'react';
import { Button } from './button';

interface CrudDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  maxWidth?: string;
}

export function CrudDialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "max-w-lg"
}: CrudDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div className={`relative bg-white dark:bg-slate-900 p-6 rounded-lg ${maxWidth} w-full max-h-[90vh] overflow-y-auto`}>
        <button 
          className="absolute right-4 top-4 rounded-sm opacity-70 text-gray-600 hover:opacity-100" 
          onClick={onClose}
        >
          ✕
          <span className="sr-only">Close</span>
        </button>

        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        {description && (
          <p className="text-sm text-gray-500 mb-4">{description}</p>
        )}

        {children}
      </div>
    </div>
  );
}

interface FormDialogProps extends CrudDialogProps {
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
  submitText?: string;
  showCancel?: boolean;
}

export function FormDialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  onSubmit,
  isSubmitting = false,
  submitText = "Save",
  showCancel = true,
  maxWidth = "max-w-lg"
}: FormDialogProps) {
  return (
    <CrudDialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      maxWidth={maxWidth}
    >
      <form onSubmit={onSubmit}>
        {children}
        <div className="flex justify-end space-x-2 mt-4">
          {showCancel && (
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button type="submit" className="bg-primary text-white" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : submitText}
          </Button>
        </div>
      </form>
    </CrudDialog>
  );
}