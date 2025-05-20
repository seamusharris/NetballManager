import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { X, Menu, Home, Users, ClipboardList, Calendar, Flag, BarChart, Database } from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export default function Sidebar({ isMobileOpen, setIsMobileOpen }: SidebarProps) {
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
    { path: '/opponents', label: 'Opponents', icon: <Flag className="w-5 h-5" /> },
    { path: '/statistics', label: 'Statistics', icon: <BarChart className="w-5 h-5" /> },
  ];

  return (
    <aside 
      className={cn(
        "bg-sidebar-background w-64 h-full fixed inset-y-0 left-0 z-30 shadow-lg transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex items-center justify-between h-16 bg-sidebar-accent px-4">
        <div className="flex items-center space-x-2">
          <span className="text-white text-xl">🏐</span>
          <h1 className="text-white font-heading font-bold text-lg">NetballManager</h1>
        </div>
        <button 
          className="text-white focus:outline-none lg:hidden" 
          onClick={() => setIsMobileOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="px-4 py-2">
        <p className="text-sidebar-foreground text-xs uppercase font-bold tracking-wider mb-3">Main Menu</p>
        <nav>
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              href={link.path}
              onClick={() => window.innerWidth < 1024 && setIsMobileOpen(false)}
            >
              <a 
                className={cn(
                  "sidebar-link",
                  isActive(link.path) && "active"
                )}
              >
                <span className="w-6">{link.icon}</span>
                <span className="ml-2">{link.label}</span>
              </a>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
