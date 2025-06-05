
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
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-10 w-10 text-base"
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

  return (
    <div className={`flex items-center justify-between border rounded-lg ${sizeClasses[size]} ${className}`}>
      <div className="flex items-center space-x-3">
        <div className={`${avatarSizes[size]} rounded-full flex items-center justify-center text-white ${player.avatarColor || 'bg-gray-500'}`}>
          {getInitials()}
        </div>
        <div className="flex-1">
          <div className="font-medium">{player.displayName}</div>
          {showPositions && (
            <div className="text-sm text-gray-500">
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
