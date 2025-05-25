import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { 
  X, Menu, Home, Users, ClipboardList, Calendar, CalendarRange, Flag, 
  BarChart, Database, Settings as SettingsIcon, Zap 
} from 'lucide-react';
import { TEAM_NAME } from '@/lib/settings';

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  isTablet: boolean;
}

export default function Sidebar({ isMobileOpen, setIsMobileOpen, isTablet }: SidebarProps) {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === '/' && location === '/') return true;
    if (path !== '/' && location.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { path: '/', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
    { path: '/players', label: 'Players', icon: <Users className="w-5 h-5" /> },
    { path: '/roster', label: 'Roster', icon: <ClipboardList className="w-5 h-5" /> },
    { path: '/games', label: 'Games', icon: <Calendar className="w-5 h-5" /> },
    { path: '/seasons', label: 'Seasons', icon: <Calendar className="w-5 h-5" /> },
    { path: '/opponents', label: 'Opponents', icon: <Flag className="w-5 h-5" /> },
    { path: '/statistics', label: 'Statistics', icon: <BarChart className="w-5 h-5" /> },
    { path: '/data-management', label: 'Data Management', icon: <Database className="w-5 h-5" /> },
    { path: '/performance', label: 'Performance', icon: <Zap className="w-5 h-5" /> },
    { path: '/settings', label: 'Settings', icon: <SettingsIcon className="w-5 h-5" /> },
  ];

  return (
    <aside 
      className={cn(
        "bg-sidebar-background w-64 h-full fixed inset-y-0 left-0 z-30 shadow-lg transform transition-transform duration-300",
        // Only show by default on large screens
        isTablet ? "" : "translate-x-0 static inset-0",
        // Slide in/out on tablet
        isTablet && isMobileOpen ? "translate-x-0" : "",
        // Hidden by default on tablet
        isTablet && !isMobileOpen ? "-translate-x-full" : ""
      )}
    >
      <div className="flex items-center justify-between h-16 bg-sidebar-accent px-4">
        <div className="flex items-center space-x-2">
          <span className="text-white text-xl">🏐</span>
          <h1 className="text-white font-heading font-bold text-lg truncate max-w-[160px]">{TEAM_NAME} Stats</h1>
        </div>
        <button 
          className="text-white focus:outline-none"
          style={{ display: isTablet ? 'block' : 'none' }}
          onClick={() => setIsMobileOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="px-4 py-2">
        <p className="text-sidebar-foreground text-xs uppercase font-bold tracking-wider mb-3">Main Menu</p>
        <nav>
          {navLinks.map((link) => (
            <div key={link.path} className="mb-1">
              <Link 
                href={link.path}
                onClick={() => isTablet && setIsMobileOpen(false)}
              >
                <div 
                  className={cn(
                    "sidebar-link flex items-center p-2 rounded-md hover:bg-sidebar-accent transition-colors",
                    isActive(link.path) ? "bg-sidebar-accent text-white font-semibold" : "text-sidebar-foreground"
                  )}
                >
                  <span className="w-6">{link.icon}</span>
                  <span className="ml-2">{link.label}</span>
                </div>
              </Link>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
