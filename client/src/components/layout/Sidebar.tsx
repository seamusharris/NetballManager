import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { 
  X, Menu, Home, Users, ClipboardList, Calendar, CalendarRange, 
  BarChart, Database, SettingsIcon, Zap, Trophy, Building2
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
    { path: '/', label: 'Team Dashboard', icon: <Home className="w-5 h-5" /> },
    { path: '/club-dashboard', label: 'Club Dashboard', icon: <Building2 className="w-5 h-5" /> },
    { path: '/players', label: 'Players', icon: <Users className="w-5 h-5" /> },
    { path: '/teams', label: 'Teams', icon: <Users className="w-5 h-5" /> },
    { path: '/roster', label: 'Roster', icon: <ClipboardList className="w-5 h-5" /> },
    { path: '/games', label: 'Games', icon: <Calendar className="w-5 h-5" /> },
    { path: '/seasons', label: 'Seasons', icon: <CalendarRange className="w-5 h-5" /> },
    { path: '/opponent-analysis', label: 'Matchup Analysis', icon: <Trophy className="w-5 h-5" /> },
    { path: '/statistics', label: 'Statistics', icon: <BarChart className="w-5 h-5" /> },
    { path: '/team-analysis', label: 'Team Analysis', icon: <Trophy className="w-5 h-5" /> },
    { path: '/data-management', label: 'Data Management', icon: <Database className="w-5 h-5" /> },
    { path: '/performance', label: 'Performance', icon: <Zap className="w-5 h-5" /> },
    { path: '/clubs', label: 'Club Management', icon: <Building2 className="w-5 h-5" /> },
    { path: '/settings', label: 'Settings', icon: <SettingsIcon className="w-5 h-5" /> },
  ];

  return (
    <aside 
      className={cn(
        "bg-white w-64 h-full fixed inset-y-0 left-0 z-30 shadow-lg transform transition-transform duration-300",
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
      <div className="px-4 py-6">
        <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-4 px-2">Navigation</p>
        <nav className="space-y-2">
          {navLinks.map((link) => (
            <Link 
              key={link.path}
              href={link.path}
              onClick={() => isTablet && setIsMobileOpen(false)}
            >
              <div 
                className={cn(
                  "flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group border-l-4",
                  isActive(link.path) 
                    ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold" 
                    : "border-transparent text-blue-600 hover:bg-blue-600 hover:text-white"
                )}
              >
                <span className={cn(
                  "w-5 h-5 mr-3 transition-colors",
                  isActive(link.path) ? "text-blue-700" : "text-blue-600 group-hover:text-white"
                )}>
                  {link.icon}
                </span>
                <span className="font-medium">{link.label}</span>
              </div>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}