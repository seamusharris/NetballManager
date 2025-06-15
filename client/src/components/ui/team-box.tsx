
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Trophy, Target, TrendingUp } from 'lucide-react';

interface TeamBoxProps {
  team: {
    id: number;
    name: string;
    division?: string;
    clubName?: string;
    clubCode?: string;
    isActive?: boolean;
    seasonName?: string;
  };
  players?: {
    id: number;
    displayName: string;
    positionPreferences?: string[];
    avatarColor?: string;
    active?: boolean;
  }[];
  stats?: {
    label: string;
    value: string | number;
  }[];
  actions?: React.ReactNode;
  showPlayers?: boolean;
  showStats?: boolean;
  showClubInfo?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'minimal' | 'standard' | 'detailed';
}

export function TeamBox({ 
  team, 
  players = [],
  stats = [],
  actions, 
  showPlayers = false,
  showStats = false,
  showClubInfo = true,
  className = "",
  size = "md",
  variant = "standard"
}: TeamBoxProps) {
  if (!team) {
    return null;
  }

  const sizeClasses = {
    sm: "p-3",
    md: "p-4", 
    lg: "p-6"
  };

  const headerSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl"
  };

  const getTeamColor = (clubCode?: string): string => {
    // Generate a consistent color based on club code or team name
    const colorMap: Record<string, string> = {
      'WNC': '#ff2c36', // Warrandyte red
      'DC': '#10b981', // Deep Creek green
      'DO': '#3b82f6', // Doncaster blue
      'DV': '#8b5cf6', // Donvale purple
      'EP': '#f59e0b', // Eltham Panthers orange
      'EDNC': '#06b6d4', // East Doncaster cyan
      'WR': '#ec4899', // Waverley Rep pink
    };

    if (clubCode && colorMap[clubCode]) {
      return colorMap[clubCode];
    }

    // Fallback to hash-based color
    const hash = (team.name + (clubCode || '')).split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const colors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#ec4899'];
    return colors[Math.abs(hash) % colors.length];
  };

  const teamColor = getTeamColor(team.clubCode);
  const lightBackgroundColor = `${teamColor}15`;

  const activePlayers = players.filter(p => p.active !== false);
  const playerCount = activePlayers.length;

  if (variant === 'minimal') {
    return (
      <div 
        className={`flex items-center justify-between p-3 rounded-lg border-2 transition-shadow duration-300 hover:shadow-xl shadow-md cursor-pointer ${className}`}
        style={{ 
          backgroundColor: lightBackgroundColor,
          borderColor: teamColor
        }}
      >
        <div className="flex items-center space-x-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: teamColor }}
          >
            {team.clubCode || team.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div 
              className="font-semibold text-sm"
              style={{ color: teamColor }}
            >
              {team.name}
            </div>
            {team.division && (
              <div className="text-xs text-gray-600">{team.division}</div>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        )}
      </div>
    );
  }

  const teamBoxContent = (
    <div 
      className={`${sizeClasses[size]} rounded-lg border-2 transition-shadow duration-300 hover:shadow-xl shadow-md cursor-pointer`}
      style={{ 
        backgroundColor: lightBackgroundColor,
        borderColor: teamColor
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: teamColor }}
          >
            {team.clubCode || team.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 
              className={`font-bold ${headerSizes[size]}`}
              style={{ color: teamColor }}
            >
              {team.name}
            </h3>
            {team.division && (
              <p className="text-sm text-gray-600">{team.division}</p>
            )}
            {showClubInfo && team.clubName && (
              <p className="text-xs text-gray-500">{team.clubName}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {playerCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              <Users className="w-3 h-3 mr-1" />
              {playerCount} players
            </Badge>
          )}
          {team.isActive === false && (
            <Badge variant="destructive" className="text-xs">Inactive</Badge>
          )}
        </div>
      </div>

      {/* Stats Section */}
      {showStats && stats.length > 0 && (
        <div className="mb-3">
          <div className="grid grid-cols-3 gap-4">
            {stats.slice(0, 6).map((stat, index) => (
              <div key={index} className="text-center">
                <div 
                  className="text-lg font-bold"
                  style={{ color: teamColor }}
                >
                  {stat.value}
                </div>
                <div className="text-xs text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Players Section */}
      {showPlayers && activePlayers.length > 0 && (
        <div className="mb-3">
          <h4 className="text-sm font-semibold mb-2 flex items-center">
            <Users className="w-4 h-4 mr-1" />
            Team Players ({activePlayers.length})
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {activePlayers.slice(0, 8).map((player) => (
              <div key={player.id} className="flex items-center space-x-2 text-sm">
                <div 
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold ${player.avatarColor || 'bg-gray-500'}`}
                >
                  {player.displayName.substring(0, 2).toUpperCase()}
                </div>
                <span className="truncate">{player.displayName}</span>
              </div>
            ))}
            {activePlayers.length > 8 && (
              <div className="text-xs text-gray-500 col-span-2">
                +{activePlayers.length - 8} more players
              </div>
            )}
          </div>
        </div>
      )}

      {/* Season Info */}
      {team.seasonName && (
        <div className="mb-3">
          <Badge variant="outline" className="text-xs">
            {team.seasonName}
          </Badge>
        </div>
      )}

      
    </div>
  );

  if (actions) {
    return (
      <div className={`space-y-3 ${className}`}>
        {teamBoxContent}
        <div className="flex items-center justify-end space-x-2">
          {actions}
        </div>
      </div>
    );
  }

  return <div className={className}>{teamBoxContent}</div>;
}
