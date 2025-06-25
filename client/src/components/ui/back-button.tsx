import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import { useNavigationStack } from '@/hooks/use-navigation-stack';

interface BackButtonProps {
  fallbackPath?: string;
  className?: string;
  children?: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export default function BackButton({ 
  fallbackPath = '/', 
  className = "mb-4",
  children,
  variant = "outline",
  size = "sm"
}: BackButtonProps) {
  const [, navigate] = useLocation();
  

  const handleBack = () => {
    if (canGoBack()) {
      const previousPath = getPreviousPath(fallbackPath);
      navigate(previousPath);
      // Fallback to browser back or specific route if no navigation history
      if (window.history.length > 1) {
        window.history.back();
        navigate(fallbackPath);
      }
    }
  };

  // Use children if provided, otherwise just "Back"
  const buttonText = children || 'Back';

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleBack}
      className={className}
    >
      <ChevronLeft className="mr-1 h-4 w-4" />
      {buttonText}
    </Button>
  );
}