import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';

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
  size?: 'sm' | 'md' | 'lg';
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
    md: "p-3", 
    lg: "p-4"
  };

  const avatarSizes = {
    sm: 8, // 32px
    md: 12, // 48px  
    lg: 16  // 64px
  };

  const textSizes = {
    sm: {
      name: "text-sm",
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

  // Helper function to convert Tailwind class to hex for dynamic styling
  const getPlayerColorHex = (avatarColor?: string): string => {
    if (!avatarColor) return '#6b7280'; // gray-500 fallback

    const colorMap: Record<string, string> = {
      'bg-red-500': '#ef4444', 'bg-red-600': '#dc2626', 'bg-red-700': '#b91c1c',
      'bg-orange-500': '#f97316', 'bg-orange-600': '#ea580c', 'bg-orange-700': '#c2410c',
      'bg-amber-500': '#f59e0b', 'bg-amber-600': '#d97706', 'bg-amber-700': '#b45309',
      'bg-yellow-500': '#eab308', 'bg-yellow-600': '#ca8a04', 'bg-yellow-700': '#a16207',
      'bg-lime-500': '#84cc16', 'bg-lime-600': '#65a30d', 'bg-lime-700': '#4d7c0f',
      'bg-green-500': '#22c55e', 'bg-green-600': '#16a34a', 'bg-green-700': '#15803d',
      'bg-emerald-500': '#10b981', 'bg-emerald-600': '#059669', 'bg-emerald-700': '#047857',
      'bg-teal-500': '#14b8a6', 'bg-teal-600': '#0d9488', 'bg-teal-700': '#0f766e',
      'bg-cyan-500': '#06b6d4', 'bg-cyan-600': '#0891b2', 'bg-cyan-700': '#0e7490',
      'bg-sky-500': '#0ea5e9', 'bg-sky-600': '#0284c7', 'bg-sky-700': '#0369a1',
      'bg-blue-500': '#3b82f6', 'bg-blue-600': '#2563eb', 'bg-blue-700': '#1d4ed8',
      'bg-indigo-500': '#6366f1', 'bg-indigo-600': '#4f46e5', 'bg-indigo-700': '#4338ca',
      'bg-violet-500': '#8b5cf6', 'bg-violet-600': '#7c3aed', 'bg-violet-700': '#6d28d9',
      'bg-purple-500': '#a855f7', 'bg-purple-600': '#9333ea', 'bg-purple-700': '#7e22ce',
      'bg-fuchsia-500': '#d946ef', 'bg-fuchsia-600': '#c026d3', 'bg-fuchsia-700': '#a21caf',
      'bg-pink-500': '#ec4899', 'bg-pink-600': '#db2777', 'bg-pink-700': '#be185d',
      'bg-rose-500': '#f43f5e', 'bg-rose-600': '#e11d48', 'bg-rose-700': '#be123c',
      'bg-gray-500': '#6b7280', 'bg-gray-600': '#4b5563', 'bg-gray-700': '#374151'
    };

    return colorMap[avatarColor] || '#6b7280';
  };

  const getDarkerColorHex = (avatarColor?: string): string => {
    if (!avatarColor) return '#374151'; // gray-700 fallback

    const darkerColorMap: Record<string, string> = {
      'bg-red-500': '#b91c1c', 'bg-red-600': '#991b1b', 'bg-red-700': '#7f1d1d',
      'bg-orange-500': '#c2410c', 'bg-orange-600': '#9a3412', 'bg-orange-700': '#7c2d12',
      'bg-amber-500': '#b45309', 'bg-amber-600': '#92400e', 'bg-amber-700': '#78350f',
      'bg-yellow-500': '#a16207', 'bg-yellow-600': '#854d0e', 'bg-yellow-700': '#713f12',
      'bg-lime-500': '#4d7c0f', 'bg-lime-600': '#365314', 'bg-lime-700': '#1a2e05',
      'bg-green-500': '#15803d', 'bg-green-600': '#166534', 'bg-green-700': '#14532d',
      'bg-emerald-500': '#047857', 'bg-emerald-600': '#065f46', 'bg-emerald-700': '#064e3b',
      'bg-teal-500': '#0f766e', 'bg-teal-600': '#0d9488', 'bg-teal-700': '#134e4a',
      'bg-cyan-500': '#0e7490', 'bg-cyan-600': '#0891b2', 'bg-cyan-700': '#155e75',
      'bg-sky-500': '#0369a1', 'bg-sky-600': '#0284c7', 'bg-sky-700': '#0c4a6e',
      'bg-blue-500': '#1d4ed8', 'bg-blue-600': '#1e40af', 'bg-blue-700': '#1e3a8a',
      'bg-indigo-500': '#4338ca', 'bg-indigo-600': '#3730a3', 'bg-indigo-700': '#312e81',
      'bg-violet-500': '#6d28d9', 'bg-violet-600': '#5b21b6', 'bg-violet-700': '#4c1d95',
      'bg-purple-500': '#7e22ce', 'bg-purple-600': '#6b21a8', 'bg-purple-700': '#581c87',
      'bg-fuchsia-500': '#a21caf', 'bg-fuchsia-600': '#86198f', 'bg-fuchsia-700': '#701a75',
      'bg-pink-500': '#be185d', 'bg-pink-600': '#9d174d', 'bg-pink-700': '#831843',
      'bg-rose-500': '#be123c', 'bg-rose-600': '#9f1239', 'bg-rose-700': '#881337',
      'bg-gray-500': '#374151', 'bg-gray-600': '#1f2937', 'bg-gray-700': '#111827'
    };

    return darkerColorMap[avatarColor] || '#374151';
  };

  const playerColorHex = getPlayerColorHex(player.avatarColor);
  const darkerBorderColor = getDarkerColorHex(player.avatarColor);
  const lightBackgroundColor = `${playerColorHex}15`; // Light background with transparency

  // Always apply default background and border, but allow overrides
  const defaultStyle = {
    backgroundColor: lightBackgroundColor,
    borderColor: darkerBorderColor,
    ...style
  };

  // Always include border
  const borderClass = "border-2";

  const playerBoxContent = (
    <div 
      className={cn(
        "flex items-center space-x-3 rounded-lg shadow-md transition-shadow duration-200",
        borderClass,
        sizeClasses[size],
        onClick && "cursor-pointer"
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
              ? (size === 'sm' ? "mr-12" : size === 'md' ? "mr-14" : "mr-16") // More space when select is present
              : (sizeClasses[size] === "p-2" ? "mr-2" : sizeClasses[size] === "p-3" ? "mr-3" : "mr-4") // Match avatar spacing when no select
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