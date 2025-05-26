
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

interface NavigationStackItem {
  path: string;
  title: string;
  timestamp: number;
}

// Map paths to user-friendly page titles
const getPageTitle = (path: string): string => {
  // Handle dynamic routes
  if (path.match(/^\/games\/\d+$/)) return 'Game Details';
  if (path.match(/^\/games\/\d+\/live-stats$/)) return 'Live Stats';
  if (path.match(/^\/games\/\d+\/live-stats-by-position$/)) return 'Live Stats by Position';
  if (path.match(/^\/players\/\d+$/)) return 'Player Details';
  if (path.match(/^\/opponents\/\d+$/)) return 'Opponent Details';
  
  // Static routes
  const routeMap: Record<string, string> = {
    '/': 'Dashboard',
    '/dashboard': 'Dashboard',
    '/games': 'Games',
    '/players': 'Players',
    '/opponents': 'Opponents',
    '/opponent-analysis': 'Opponent Analysis',
    '/roster': 'Roster',
    '/statistics': 'Statistics',
    '/seasons': 'Seasons',
    '/settings': 'Settings',
    '/data-management': 'Data Management',
    '/stats-debug': 'Stats Debug'
  };
  
  return routeMap[path] || 'Previous Page';
};

export const useNavigationStack = () => {
  const [location] = useLocation();
  const [navigationStack, setNavigationStack] = useState<NavigationStackItem[]>([]);

  // Initialize with current location if stack is empty
  useEffect(() => {
    if (navigationStack.length === 0 && location) {
      setNavigationStack([{
        path: location,
        title: getPageTitle(location),
        timestamp: Date.now()
      }]);
    }
  }, [location, navigationStack.length]);

  useEffect(() => {
    setNavigationStack(prev => {
      // Don't add the same path consecutively
      if (prev.length > 0 && prev[prev.length - 1].path === location) {
        return prev;
      }
      
      // Add current location to stack with title
      const newStack = [...prev, { 
        path: location, 
        title: getPageTitle(location),
        timestamp: Date.now() 
      }];
      
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

  const getPreviousTitle = (fallback: string = 'Back'): string => {
    if (navigationStack.length < 2) {
      return fallback;
    }
    return navigationStack[navigationStack.length - 2].title;
  };

  const canGoBack = (): boolean => {
    return navigationStack.length > 1;
  };

  return {
    navigationStack,
    getPreviousPath,
    getPreviousTitle,
    canGoBack
  };
};
