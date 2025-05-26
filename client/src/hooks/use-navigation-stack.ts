
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

interface NavigationStackItem {
  path: string;
  timestamp: number;
}

export const useNavigationStack = () => {
  const [location] = useLocation();
  const [navigationStack, setNavigationStack] = useState<NavigationStackItem[]>([]);

  useEffect(() => {
    setNavigationStack(prev => {
      // Don't add the same path consecutively
      if (prev.length > 0 && prev[prev.length - 1].path === location) {
        return prev;
      }
      
      // Add current location to stack
      const newStack = [...prev, { path: location, timestamp: Date.now() }];
      
      // Keep only last 10 entries to prevent memory bloat
      return newStack.slice(-10);
    });
  }, [location]);

  const getPreviousPath = (fallback: string = '/'): string => {
    if (navigationStack.length < 2) {
      return fallback;
    }
    return navigationStack[navigationStack.length - 2].path;
  };

  const canGoBack = (): boolean => {
    return navigationStack.length > 1;
  };

  return {
    navigationStack,
    getPreviousPath,
    canGoBack
  };
};
