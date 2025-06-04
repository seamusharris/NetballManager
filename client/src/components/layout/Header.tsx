import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Bell, Search, ChevronDown, Home, Users, ClipboardList, Calendar, CalendarRange, Flag, BarChart, Database, Zap, Settings as SettingsIcon, Trophy, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';
import { ClubSwitcher } from './ClubSwitcher';

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

  const navLinks = [
    { path: '/', label: 'Dashboard', icon: <Home className="w-4 h-4" /> },
    { path: '/players', label: 'Players', icon: <Users className="w-4 h-4" /> },
    { path: '/roster', label: 'Roster', icon: <ClipboardList className="w-4 h-4" /> },
    { path: '/games', label: 'Games', icon: <Calendar className="w-4 h-4" /> },
    { path: '/seasons', label: 'Seasons', icon: <CalendarRange className="w-4 h-4" /> },
    { path: '/opponents', label: 'Opponents', icon: <Users className="w-4 h-4" /> },
    { path: '/opponent-analysis', label: 'Matchup Analysis', icon: <Trophy className="w-4 h-4" /> },
    { path: '/statistics', label: 'Statistics', icon: <BarChart className="w-4 h-4" /> },
    { path: '/data-management', label: 'Data Management', icon: <Database className="w-4 h-4" /> },
    { path: '/performance', label: 'Performance', icon: <Zap className="w-4 h-4" /> },
    { path: '/settings', label: 'Settings', icon: <SettingsIcon className="w-4 h-4" /> },
    { path: '/club-dashboard', label: 'Club Dashboard', icon: <Trophy className="w-4 h-4" /> },
  ];

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm z-20">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center space-x-4">
          {/* Mobile hamburger button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-600 hover:bg-gray-100 focus:outline-none lg:hidden"
            onClick={() => setIsMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Desktop navigation dropdown - hide when sidebar is visible */}
          <div className="hidden md:flex lg:hidden items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-blue-600 hover:bg-blue-600 hover:text-white transition-colors duration-200 focus:outline-none">
                  <Menu className="h-5 w-5 mr-2" />
                  Navigation
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 space-y-1 p-2">
                {navLinks.map((link) => {
                  const isActive = location === link.path || (link.path !== '/' && location.startsWith(link.path));
                  return (
                    <DropdownMenuItem key={link.path} asChild className="p-0">
                      <Link 
                        href={link.path} 
                        className={cn(
                          "flex items-center w-full px-3 py-2.5 rounded-lg transition-all duration-200 border-l-4",
                          isActive 
                            ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold" 
                            : "border-transparent text-blue-600 hover:bg-blue-600 hover:text-white"
                        )}
                      >
                        <span className={cn(
                          "w-5 h-5 mr-3 transition-colors",
                          isActive ? "text-blue-700" : "text-blue-600 group-hover:text-white"
                        )}>
                          {link.icon}
                        </span>
                        <span className="font-medium">{link.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            <h2 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h2>
          </div>

          {/* Page title for large screens when sidebar is visible */}
          <div className="hidden lg:block">
            <h2 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h2>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Club Switcher */}
          <ClubSwitcher />

          {/* Show search only on larger screens to save space on tablet */}
          <div className={`relative ${isTablet ? 'hidden md:block' : ''}`}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              type="text" 
              placeholder="Search..." 
              className="pl-10 pr-4 w-full border rounded-md text-sm focus:border-accent focus:outline-none" 
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="text-gray-600 focus:outline-none relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-secondary"></span>
          </Button>

          <div className="flex items-center space-x-2">
            {/* Hide coach name on tablet to save space */}
            <span className={`text-sm font-semibold ${isTablet ? 'hidden md:inline' : ''}`}>Coach Smith</span>
            <Avatar className="w-8 h-8 bg-accent text-white">
              <span className="text-xs font-bold">CS</span>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}