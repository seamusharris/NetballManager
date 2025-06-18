import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { getPlayerColorHex, getDarkerColorHex, getLighterColorHex } from '@/lib/playerColorUtils';
import { PLAYER_BOX_STYLES } from '@/lib/playerBoxStyles';

interface PlayerBoxProps {
  player: {
    id: number;
    displayName: string;
    firstName?: string;
    lastName?: string;
    positionPreferences?: string[];
    avatarColor?: string;
    active?: boolean;
  };
  actions?: React.ReactNode;
  showPositions?: boolean;
  stats?: {
    label: string;
    value: string | number;
  }[];
  className?: string;
  size?: 'sm' | 'ms' | 'md' | 'lg';
  style?: React.CSSProperties;
  onClick?: () => void;
  customBadge?: React.ReactNode;
  hasSelect?: boolean;
}

export function PlayerBox({ 
  player, 
  actions, 
  showPositions = true, 
  stats,
  className = "",
  size = "md",
  style = {},
  onClick,
  customBadge,
  hasSelect = false
}: PlayerBoxProps) {
  // Add null safety check
  if (!player) {
    return null;
  }

  // Size-based styling
  const sizeClasses = {
    sm: "p-2",
    ms: "p-2.5", // Medium-small: between small and medium
    md: "p-3", 
    lg: "p-4"
  };

  const avatarSizes = {
    sm: 8, // 32px
    ms: 10, // 40px - between small and medium
    md: 12, // 48px  
    lg: 16  // 64px
  };

  const textSizes = {
    sm: {
      name: "text-sm",
      position: "text-xs",
      stats: "text-sm"
    },
    ms: {
      name: "text-sm", // Same as small but with more space
      position: "text-xs",
      stats: "text-sm"
    },
    md: {
      name: "text-base",
      position: "text-sm", 
      stats: "text-base"
    },
    lg: {
      name: "text-lg",
      position: "text-base",
      stats: "text-lg"
    }
  };

  const playerInitials = (() => {
    if (player.firstName && player.lastName) {
      return getInitials(player.firstName, player.lastName);
    }
    if (player.displayName) {
      const nameParts = player.displayName.split(' ');
      if (nameParts.length >= 2) {
        return getInitials(nameParts[0], nameParts[nameParts.length - 1]);
      }
      return player.displayName[0]?.toUpperCase() || '';
    }
    return '';
  })();

  const playerColorHex = getPlayerColorHex(player.avatarColor);
  const darkerBorderColor = getDarkerColorHex(player.avatarColor);
  const lightBackgroundColor = getLighterColorHex(player.avatarColor);

  // Always apply default background and border, but allow overrides
  const defaultStyle = {
    backgroundColor: lightBackgroundColor,
    borderColor: darkerBorderColor,
    color: 'inherit', // Ensure text doesn't get colored
    ...style
  };

  // Always include border
  const borderClass = "border-2";

  const playerBoxContent = (
    <div 
      className={cn(
        "flex items-center space-x-3 rounded-lg shadow-md transition-all duration-200",
        borderClass,
        sizeClasses[size],
        onClick && PLAYER_BOX_STYLES.interactive
      )}
      style={defaultStyle}
      onClick={onClick}
    >
      <div 
        className={cn(
          "rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg",
          player.avatarColor || 'bg-gray-500',
          {
            'w-10 h-10 text-sm': size === 'sm',
            'w-12 h-12 text-sm': size === 'ms',
            'w-14 h-14 text-base': size === 'md',
            'w-20 h-20 text-2xl': size === 'lg'
          }
        )}
      >
        {playerInitials}
      </div>

      {/* Player Details */}
      <div className="flex-1 flex items-center">
        <div className="flex-1">
          <div className={`${textSizes[size].name} font-bold player-name`}>
            {player.displayName}
          </div>

          {showPositions && (
            <div className={`${textSizes[size].position} player-positions flex items-center gap-2`}>
              <span>
                {Array.isArray(player.positionPreferences) && player.positionPreferences.length > 0 
                  ? player.positionPreferences.join(', ') 
                  : 'No position preferences'}
              </span>
              {customBadge ? (
                <span className="inline-flex items-center">{customBadge}</span>
              ) : (
                player.active === false && (
                  <Badge variant="secondary" className="text-xs ml-1">Inactive</Badge>
                )
              )}
            </div>
          )}

          {!showPositions && (customBadge || player.active === false) && (
            <div className={`${textSizes[size].position} flex items-center gap-2`}>
              {customBadge ? (
                <span className="inline-flex items-center">{customBadge}</span>
              ) : (
                player.active === false && (
                  <Badge variant="secondary" className="text-xs">Inactive</Badge>
                )
              )}
            </div>
          )}
        </div>

        {/* Stats positioned on the right */}
        {stats && stats.length > 0 && (
          <div className={cn(
            "flex space-x-6 ml-6",
            // Adjust right margin based on select box presence and size
            hasSelect 
              ? (size === 'sm' ? "mr-12" : size === 'ms' ? "mr-13" : size === 'md' ? "mr-14" : "mr-16") // More space when select is present
              : (sizeClasses[size] === "p-2" ? "mr-2" : sizeClasses[size] === "p-2.5" ? "mr-2.5" : sizeClasses[size] === "p-3" ? "mr-3" : "mr-4") // Match avatar spacing when no select
          )}>
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`${size === 'sm' ? 'text-lg' : size === 'md' ? 'text-2xl' : 'text-3xl'} font-bold`}>
                  {stat.value}
                </div>
                <div className={`${textSizes[size].stats} opacity-75`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}</div>
    </div>
  );

  if (actions) {
    return (
      <div className={`space-y-3 ${className}`}>
        {playerBoxContent}
        <div className="flex items-center justify-end space-x-2">
          {actions}
        </div>
      </div>
    );
  }

  return <div className={className}>{playerBoxContent}</div>;
}