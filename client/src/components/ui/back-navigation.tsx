
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';

interface BackNavigationProps {
  fallbackPath?: string;
  label?: string;
}

export function BackNavigation({ fallbackPath = '/', label = 'Back' }: BackNavigationProps) {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    // Check if browser history is available
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback to provided path
      setLocation(fallbackPath);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleBack}
      className="mb-4"
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );
}
