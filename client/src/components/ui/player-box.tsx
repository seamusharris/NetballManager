import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PlayerBox({ 
  player, 
  actions, 
  showPositions = true, 
  className = "",
  size = "md" 
}: PlayerBoxProps) {
  // Add null safety check
  if (!player) {
    return null;
  }

  const sizeClasses = {
    sm: "p-2",
    md: "p-3", 
    lg: "p-4"
  };

  const avatarSizes = {
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-base",
    lg: "h-12 w-12 text-lg"
  };

  const getInitials = () => {
    if (player.firstName && player.lastName) {
      return `${player.firstName[0]}${player.lastName[0]}`;
    }
    if (player.displayName) {
      const nameParts = player.displayName.split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`;
      }
      return player.displayName[0] || '';
    }
    return '';
  };

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

  const playerColor = getPlayerColorHex(player.avatarColor);
  const lightBackgroundColor = `${playerColor}15`; // Add transparency for background

  return (
    <div 
      className={`flex items-center justify-between border-2 rounded-lg shadow-sm ${sizeClasses[size]} ${className}`}
      style={{
        borderColor: playerColor,
        backgroundColor: lightBackgroundColor
      }}
    >
      <div className="flex items-center space-x-3">
        <div className={`${avatarSizes[size]} rounded-full flex items-center justify-center text-white font-semibold ${player.avatarColor || 'bg-gray-700'}`}>
          {getInitials()}
        </div>
        <div className="flex-1">
          <div 
            className="font-bold text-base"
            style={{ color: playerColor }}
          >
            {player.displayName}
          </div>
          {showPositions && (
            <div 
              className="text-sm"
              style={{ color: `${playerColor}AA` }} // Add some transparency
            >
              {Array.isArray(player.positionPreferences) && player.positionPreferences.length > 0 
                ? player.positionPreferences.join(', ') 
                : 'No position preferences'}
            </div>
          )}
          {player.active === false && (
            <Badge variant="secondary" className="text-xs mt-1">Inactive</Badge>
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