import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ChevronDown, Home, Users, ClipboardList, Calendar, CalendarRange, BarChart, Database, Zap, Settings as SettingsIcon, Trophy, Menu, Building2, Target } from 'lucide-react';
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
import { TeamSwitcher } from './TeamSwitcher';
import { useClub } from '@/contexts/ClubContext';

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

  // Import club context to match sidebar navigation
  const { currentTeamId, currentTeam, currentClubId } = useClub();

  // Create navigation links that match the sidebar structure
  const getNavLinks = () => {
    const clubWideLinks = [
      { path: '/', label: 'Club Dashboard', icon: <Building2 className="h-5 w-5" />, section: 'club' },
      { path: `/club/${currentClubId}/players`, label: 'All Players', icon: <Users className="h-5 w-5" />, section: 'club' },
      { path: `/club/${currentClubId}/teams`, label: 'All Teams', icon: <Users className="h-5 w-5" />, section: 'club' },
      { path: `/club/${currentClubId}/games`, label: 'All Games', icon: <Calendar className="h-5 w-5" />, section: 'club' },
    ];

    const teamLinks = currentTeamId ? [
      { path: `/team/${currentTeamId}`, label: 'Team Dashboard', icon: <Home className="h-5 w-5" />, section: 'team' },
      { path: `/team/${currentTeamId}/games`, label: 'Team Games', icon: <Calendar className="h-5 w-5" />, section: 'team' },
      { path: `/team/${currentTeamId}/roster`, label: 'Team Roster', icon: <ClipboardList className="h-5 w-5" />, section: 'team' },
      { path: `/team/${currentTeamId}/statistics`, label: 'Team Statistics', icon: <BarChart className="h-5 w-5" />, section: 'team' },
      { path: `/team/${currentTeamId}/preparation`, label: 'Game Preparation', icon: <Target className="h-5 w-5" />, section: 'team' },
      { path: `/team/${currentTeamId}/analysis`, label: 'Opponent Analysis', icon: <Target className="h-5 w-5" />, section: 'team' },
      { path: `/team/${currentTeamId}/players`, label: 'Player Management', icon: <Users className="h-5 w-5" />, section: 'team' },
    ] : [];

    const adminLinks = [
      { path: '/seasons', label: 'Season Management', icon: <CalendarRange className="h-5 w-5" />, section: 'admin' },
      { path: '/clubs', label: 'Club Management', icon: <Building2 className="h-5 w-5" />, section: 'admin' },
      { path: '/settings', label: 'System Settings', icon: <SettingsIcon className="h-5 w-5" />, section: 'admin' },
    ];

    const devLinks = [
      { path: '/component-examples', label: 'All Examples', icon: <Zap className="h-5 w-5" />, section: 'dev' },
    ];

    return { club: clubWideLinks, team: teamLinks, admin: adminLinks, dev: devLinks };
  };

  const navSections = getNavLinks();

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

          {/* Tablet navigation dropdown - show when sidebar is hidden */}
          <div className={cn("items-center space-x-4", isTablet ? "flex" : "hidden")}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-blue-600 hover:bg-blue-600 hover:text-white transition-colors duration-200 focus:outline-none">
                  <Menu className="h-5 w-5 mr-2" />
                  Navigation
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 space-y-1 p-3 max-h-96 overflow-y-auto">
                {/* Club Section */}
                {navSections.club.length > 0 && (
                  <div className="mb-4">
                    <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-2 px-2">Club Wide</p>
                    <div className="space-y-1">
                      {navSections.club.map((link) => {
                        const isActive = location === link.path || (link.path !== '/' && location.startsWith(link.path));
                        return (
                          <DropdownMenuItem key={link.path} asChild className="p-0">
                            <Link 
                              href={link.path} 
                              className={cn(
                                "flex items-center w-full px-3 py-2 rounded-lg transition-all duration-200 border-l-4",
                                isActive 
                                  ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold" 
                                  : "border-transparent text-blue-600 hover:bg-blue-600 hover:text-white"
                              )}
                            >
                              <span className={cn(
                                "w-5 h-5 mr-3 transition-colors",
                                isActive ? "text-blue-700" : "text-blue-600"
                              )}>
                                {link.icon}
                              </span>
                              <span className="font-medium text-sm">{link.label}</span>
                            </Link>
                          </DropdownMenuItem>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Team Section */}
                {navSections.team.length > 0 && (
                  <div className="mb-4">
                    <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-2 px-2">
                      Team: {currentTeam?.name || 'Select Team'}
                    </p>
                    <div className="space-y-1">
                      {navSections.team.map((link) => {
                        const isActive = location === link.path || (link.path !== '/' && location.startsWith(link.path));
                        return (
                          <DropdownMenuItem key={link.path} asChild className="p-0">
                            <Link 
                              href={link.path} 
                              className={cn(
                                "flex items-center w-full px-3 py-2 rounded-lg transition-all duration-200 border-l-4",
                                isActive 
                                  ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold" 
                                  : "border-transparent text-blue-600 hover:bg-blue-600 hover:text-white"
                              )}
                            >
                              <span className={cn(
                                "w-5 h-5 mr-3 transition-colors",
                                isActive ? "text-blue-700" : "text-blue-600"
                              )}>
                                {link.icon}
                              </span>
                              <span className="font-medium text-sm">{link.label}</span>
                            </Link>
                          </DropdownMenuItem>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Admin Section */}
                {navSections.admin.length > 0 && (
                  <div className="mb-4">
                    <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-2 px-2">Administration</p>
                    <div className="space-y-1">
                      {navSections.admin.map((link) => {
                        const isActive = location === link.path || (link.path !== '/' && location.startsWith(link.path));
                        return (
                          <DropdownMenuItem key={link.path} asChild className="p-0">
                            <Link 
                              href={link.path} 
                              className={cn(
                                "flex items-center w-full px-3 py-2 rounded-lg transition-all duration-200 border-l-4",
                                isActive 
                                  ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold" 
                                  : "border-transparent text-blue-600 hover:bg-blue-600 hover:text-white"
                              )}
                            >
                              <span className={cn(
                                "w-5 h-5 mr-3 transition-colors",
                                isActive ? "text-blue-700" : "text-blue-600"
                              )}>
                                {link.icon}
                              </span>
                              <span className="font-medium text-sm">{link.label}</span>
                            </Link>
                          </DropdownMenuItem>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Dev Section */}
                {navSections.dev.length > 0 && (
                  <div>
                    <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-2 px-2">Development</p>
                    <div className="space-y-1">
                      {navSections.dev.map((link) => {
                        const isActive = location === link.path || (link.path !== '/' && location.startsWith(link.path));
                        return (
                          <DropdownMenuItem key={link.path} asChild className="p-0">
                            <Link 
                              href={link.path} 
                              className={cn(
                                "flex items-center w-full px-3 py-2 rounded-lg transition-all duration-200 border-l-4",
                                isActive 
                                  ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold" 
                                  : "border-transparent text-blue-600 hover:bg-blue-600 hover:text-white"
                              )}
                            >
                              <span className={cn(
                                "w-5 h-5 mr-3 transition-colors",
                                isActive ? "text-blue-700" : "text-blue-600"
                              )}>
                                {link.icon}
                              </span>
                              <span className="font-medium text-sm">{link.label}</span>
                            </Link>
                          </DropdownMenuItem>
                        );
                      })}
                    </div>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <h2 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h2>
          </div>

          {/* Page title for large screens when sidebar is visible */}
          <div className="hidden lg:block">
            <h2 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h2>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Team filtering is now handled per-page */}
        </div>

        <div className="flex items-center space-x-4">
          {/* Show search only on larger screens to save space on tablet */}
          {/* Removing search functionality from header as per request */}
        </div>

        <div className="flex items-center space-x-4">
          {/* Removed notification and user profile sections */}
        </div>
      </div>
    </header>
  );
}