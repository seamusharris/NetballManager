import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { useNextGame } from '@/hooks/use-next-game';
import { 
  X, Menu, Home, Users, ClipboardList, Calendar, CalendarRange, 
  BarChart, Database, SettingsIcon, Zap, Trophy, Building2, Target
} from 'lucide-react';
import { TEAM_NAME } from '@/lib/settings';
import { useClub } from '@/contexts/ClubContext';

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  isTablet: boolean;
}

export default function Sidebar({ isMobileOpen, setIsMobileOpen, isTablet }: SidebarProps) {
  const [location] = useLocation();
  const { currentTeamId, currentTeam } = useClub();
  const { data: nextGame, isLoading: isLoadingNextGame } = useNextGame();

  const isActive = (path: string) => {
    if (path === '/' && location === '/') return true;
    if (path !== '/' && location.startsWith(path)) return true;
    return false;
  };

  // Create team-aware navigation links
  const getNavLinks = () => {
    const baseLinks = [
      { path: '/', label: 'Club Dashboard', icon: <Building2 className="w-5 h-5" /> },
      { path: '/players', label: 'Players', icon: <Users className="w-5 h-5" /> },
      { path: '/teams', label: 'Teams', icon: <Users className="w-5 h-5" /> },
      { path: '/seasons', label: 'Seasons', icon: <CalendarRange className="w-5 h-5" /> },
      { path: '/preparation', label: 'Game Preparation', icon: <Target className="w-5 h-5" /> },
      { path: '/preparation-2', label: 'Game Preparation Pro', icon: <Target className="w-5 h-5" /> },
      { path: '/game-preparation/1', label: 'Game Preparation Claude', icon: <Target className="w-5 h-5" /> },
      { path: '/team-preparation', label: 'Team Preparation', icon: <Target className="w-5 h-5" /> },
      { path: '/team-analysis', label: 'Team Analysis', icon: <Trophy className="w-5 h-5" /> },
      { path: '/statistics', label: 'Statistics', icon: <BarChart className="w-5 h-5" /> },
      { path: '/clubs', label: 'Club Management', icon: <Building2 className="w-5 h-5" /> },
      { path: '/component-examples', label: 'All Examples', icon: <Zap className="w-5 h-5" /> },
      { path: '/settings', label: 'Settings', icon: <SettingsIcon className="w-5 h-5" /> },
    ];

    // Team-dependent links
    const teamLinks = currentTeamId ? [
      { 
        path: `/team-dashboard/${currentTeamId}`, 
        label: 'Team Dashboard', 
        icon: <Home className="w-5 h-5" /> 
      },
      { 
        path: `/games/${currentTeamId}`, 
        label: 'Games', 
        icon: <Calendar className="w-5 h-5" /> 
      },
      { 
        path: nextGame ? `/roster/${nextGame.id}` : `/roster`,
        label: 'Roster', 
        icon: <ClipboardList className="w-5 h-5" /> 
      },
      { 
        path: nextGame ? `/game-preparation/${nextGame.id}` : `/game-preparation/1`, 
        label: 'Game Preparation Claude', 
        icon: <Target className="w-5 h-5" /> 
      },
      { 
        path: `/opponent-preparation/${currentTeamId}`, 
        label: 'Opponent Preparation', 
        icon: <Target className="w-5 h-5" /> 
      },
    ] : [
      // Disabled links when no team selected
      { 
        path: '/teams-dashboard-disabled', 
        label: 'Team Dashboard', 
        icon: <Home className="w-5 h-5" />, 
        disabled: true,
        fallbackLabel: 'Select Team First'
      },
      { 
        path: '/games-disabled', 
        label: 'Games', 
        icon: <Calendar className="w-5 h-5" />, 
        disabled: true,
        fallbackLabel: 'Games (Select Team First)'
      },
      { 
        path: '/roster-disabled', 
        label: 'Roster', 
        icon: <ClipboardList className="w-5 h-5" />, 
        disabled: true,
        fallbackLabel: 'Roster (Select Team First)'
      },
      { 
        path: '/game-preparation-disabled', 
        label: 'Game Preparation', 
        icon: <Target className="w-5 h-5" />, 
        disabled: true,
        fallbackLabel: 'Game Preparation (Select Team First)'
      },
      { 
        path: '/opponent-preparation-disabled', 
        label: 'Opponent Preparation', 
        icon: <Target className="w-5 h-5" />, 
        disabled: true,
        fallbackLabel: 'Opponent Preparation (Select Team First)'
      },
      { 
        path: '/team-analysis-disabled', 
        label: 'Team Analysis', 
        icon: <Trophy className="w-5 h-5" />, 
        disabled: true,
        fallbackLabel: 'Team Analysis (Select Team First)'
      },
    ];

    // Insert team links after Club Dashboard
    return [
      baseLinks[0], // Club Dashboard
      ...teamLinks, // Team-dependent links
      ...baseLinks.slice(1) // Rest of base links
    ];
  };

  const navLinks = getNavLinks();

  return (
    <aside 
      className={cn(
        "bg-white w-64 h-full shadow-lg transform transition-transform duration-300",
        // Desktop: static positioning
        !isTablet ? "static inset-0 translate-x-0" : "",
        // Tablet: fixed positioning with slide animation
        isTablet ? "fixed inset-y-0 left-0 z-30" : "",
        isTablet && isMobileOpen ? "translate-x-0" : "",
        isTablet && !isMobileOpen ? "-translate-x-full" : ""
      )}
    >
      <div className="flex items-center justify-between h-16 bg-sidebar-accent px-4">
        <div className="flex items-center space-x-2">
          <span className="text-white text-xl">🏐</span>
          <h1 className="text-white font-heading font-bold text-lg truncate max-w-[160px]">{TEAM_NAME} Stats</h1>
        </div>
        {isTablet && (
          <button 
            className="text-white focus:outline-none"
            onClick={() => setIsMobileOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      <div className="px-4 py-6">
        <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-4 px-2">Navigation</p>
        <nav className="space-y-2">
          {navLinks.map((link) => {
            const isDisabled = 'disabled' in link && link.disabled;
            const displayLabel = isDisabled && 'fallbackLabel' in link ? link.fallbackLabel : link.label;

            if (isDisabled) {
              return (
                <div 
                  key={link.path}
                  className="flex items-center px-3 py-2.5 rounded-lg border-l-4 border-transparent text-gray-400 cursor-not-allowed"
                  title={`${link.label} - Please select a team first`}
                >
                  <span className="w-5 h-5 mr-3 text-gray-400">
                    {link.icon}
                  </span>
                  <span className="font-medium">{displayLabel}</span>
                </div>
              );
            }

            return (
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
                  <span className="font-medium">{displayLabel}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}