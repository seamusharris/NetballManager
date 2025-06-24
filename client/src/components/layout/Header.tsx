import { useLocation } from 'wouter';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ClubSwitcher } from './ClubSwitcher';
import { TeamSwitcher } from './TeamSwitcher';

interface HeaderProps {
  setIsMobileOpen: (open: boolean) => void;
  isTablet: boolean;
}

export default function Header({ setIsMobileOpen, isTablet }: HeaderProps) {
  const [location] = useLocation();

  const getPageTitle = () => {
    const path = location.split('/')[1] || 'dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ');
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm z-20">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center space-x-4">
          {/* Mobile menu button - show when sidebar is hidden */}
          <Button
            variant="ghost"
            size="sm"
            className={cn("text-blue-600 hover:bg-blue-600 hover:text-white", isTablet ? "block" : "hidden")}
            onClick={() => setIsMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Page title */}
          <h2 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Team filtering is now handled per-page */}
        </div>

        <div className="flex items-center space-x-4">
          {/* Club and Team switchers */}
          <ClubSwitcher />
          <TeamSwitcher />
        </div>
      </div>
    </header>
  );
}