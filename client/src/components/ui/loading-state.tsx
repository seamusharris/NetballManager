
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './alert';

interface LoadingStateProps {
  isLoading?: boolean;
  error?: string | Error | null;
  children?: React.ReactNode;
  loadingText?: string;
  showSpinner?: boolean;
  className?: string;
}

export function LoadingState({
  isLoading = false,
  error,
  children,
  loadingText = "Loading...",
  showSpinner = true,
  className = ""
}: LoadingStateProps) {
  if (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        {showSpinner && <Loader2 className="h-6 w-6 animate-spin mr-2" />}
        <span className="text-muted-foreground">{loadingText}</span>
      </div>
    );
  }

  return <>{children}</>;
}

// Simplified version for inline use
export function LoadingSpinner({ size = 'sm', className = '' }: { size?: 'sm' | 'md' | 'lg', className?: string }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };

  return <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />;
}
