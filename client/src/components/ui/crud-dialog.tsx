
import { ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from "./button";
import { X } from 'lucide-react';

interface CrudDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  maxWidth?: string;
}

export function CrudDialog({
  isOpen,
  setIsOpen,
  title,
  description,
  children,
  maxWidth = "max-w-lg"
}: CrudDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className={`${maxWidth} max-h-[90vh] overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
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
  setIsOpen,
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className={`${maxWidth} max-h-[90vh] overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </DialogHeader>
        <form onSubmit={onSubmit}>
          {children}
          <div className="flex justify-end space-x-2 mt-4">
            {showCancel && (
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : submitText}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
