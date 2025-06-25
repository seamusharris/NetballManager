import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { useNextGame } from '@/hooks/use-next-game';
import { 
  X, Menu, Home, Users, ClipboardList, Calendar, CalendarRange, 
  BarChart, Database, SettingsIcon, Zap, Trophy, Building2, Target
} from 'lucide-react';
import { TEAM_NAME } from '@/lib/settings';

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  isTablet: boolean;
}

export default function Sidebar({ isMobileOpen, setIsMobileOpen, isTablet }: SidebarProps) {
  const [location] = useLocation();
  const { data: nextGame, isLoading: isLoadingNextGame } = useNextGame();

  const isActive = (path: string) => {
    if (path === '/' && location === '/') return true;
    if (path !== '/' && location.startsWith(path)) return true;
    return false;
  };

  // Create team-aware navigation links following proposed architecture
  const getNavLinks = () => {
    const clubWideLinks = [
      { path: '/', label: 'Club Dashboard', icon: <Building2 className="w-5 h-5" />, section: 'club' },
      { path: `/club/${clubId}/players`, label: 'All Players', icon: <Users className="w-5 h-5" />, section: 'club' },
      { path: `/club/${clubId}/teams`, label: 'All Teams', icon: <Users className="w-5 h-5" />, section: 'club' },
      { path: `/club/${clubId}/games`, label: 'All Games', icon: <Calendar className="w-5 h-5" />, section: 'club' },
    ];

    const adminLinks = [
      { path: '/seasons', label: 'Season Management', icon: <CalendarRange className="w-5 h-5" />, section: 'admin' },
      { path: '/clubs', label: 'Club Management', icon: <Building2 className="w-5 h-5" />, section: 'admin' },
      { path: '/settings', label: 'System Settings', icon: <SettingsIcon className="w-5 h-5" />, section: 'admin' },
    ];

    const devLinks = [
      { path: '/component-examples', label: 'All Examples', icon: <Zap className="w-5 h-5" />, section: 'dev' },
    ];

    // Team-specific links following proposed architecture
    const teamLinks = currentTeamId ? [
      { 
        path: `/team/${currentTeamId}/dashboard`, 
        label: 'Team Dashboard', 
        icon: <Home className="w-5 h-5" />,
        section: 'team'
      },
      { 
        path: `/team/${currentTeamId}/games`, 
        label: 'Team Games', 
        icon: <Calendar className="w-5 h-5" />,
        section: 'team'
      },
      { 
        path: nextGame ? `/team/${currentTeamId}/availability/${nextGame.id}` : `/team/${currentTeamId}/availability`,
        label: 'Player Availability', 
        icon: <Users className="w-5 h-5" />,
        section: 'team'
      },
      { 
        path: nextGame ? `/team/${currentTeamId}/roster/${nextGame.id}` : `/team/${currentTeamId}/roster`,
        label: 'Roster Management', 
        icon: <ClipboardList className="w-5 h-5" />,
        section: 'team'
      },
      { 
        path: nextGame ? `/team/${currentTeamId}/preparation/${nextGame.id}` : `/team/${currentTeamId}/preparation`,
        label: 'Game Preparation', 
        icon: <Target className="w-5 h-5" />,
        section: 'team'
      },
      { 
        path: `/team/${currentTeamId}/analysis`, 
        label: 'Opponent Analysis', 
        icon: <Target className="w-5 h-5" />,
        section: 'team'
      },
      { 
        path: `/team/${currentTeamId}/players`, 
        label: 'Player Management', 
        icon: <Users className="w-5 h-5" />,
        section: 'team'
      },
    ] : [];

    // Return organized navigation structure
    return {
      club: clubWideLinks,
      team: teamLinks,
      admin: adminLinks,
      dev: devLinks
    };
  };

  const navSections = getNavLinks();

  const renderNavSection = (sectionName: string, links: any[]) => {
    if (!links.length) return null;

    return (
      <div key={sectionName} className="mb-6">
        <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-3 px-2">
          {sectionName === 'club' ? 'Club Wide' : 
           sectionName === 'team' ? `Team: ${currentTeam?.name || 'Select Team'}` :
           sectionName === 'admin' ? 'Administration' : 'Development'}
        </p>
        <div className="space-y-1">
          {links.map((link) => {
            const isDisabled = 'disabled' in link && link.disabled;
            const displayLabel = isDisabled && 'fallbackLabel' in link ? link.fallbackLabel : link.label;

            if (isDisabled) {
              return (
                <div 
                  key={link.path}
                  className="flex items-center px-3 py-2 rounded-lg border-l-4 border-transparent text-gray-400 cursor-not-allowed"
                  title={`${link.label} - Please select a team first`}
                >
                  <span className="w-5 h-5 mr-3 text-gray-400">
                    {link.icon}
                  </span>
                  <span className="font-medium text-sm">{displayLabel}</span>
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
                    "flex items-center px-3 py-2 rounded-lg transition-all duration-200 group border-l-4",
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
                  <span className="font-medium text-sm">{displayLabel}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    );
  };

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
      <div className="px-4 py-6 space-y-2">
        {renderNavSection('club', navSections.club)}
        {renderNavSection('team', navSections.team)}
        {renderNavSection('admin', navSections.admin)}
        {renderNavSection('dev', navSections.dev)}
      </div>
    </aside>
  );
}