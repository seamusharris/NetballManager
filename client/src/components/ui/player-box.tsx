
import React from 'react';
import { cn, getInitials } from '@/lib/utils';

interface PlayerBoxProps {
  playerId?: number;
  playerName: string | null;
  playerColor?: string;
  displayName?: string;
  subtitle?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  showAvatar?: boolean;
  variant?: 'default' | 'compact' | 'position';
}

export const PlayerBox: React.FC<PlayerBoxProps> = ({
  playerId,
  playerName,
  playerColor,
  displayName,
  subtitle,
  children,
  onClick,
  className,
  showAvatar = true,
  variant = 'default'
}) => {
  // Always use red for unassigned positions
  const unassignedColor = '#e11d48'; // red-600
  
  // Use player color if player assigned, otherwise use red for unassigned
  const displayColor = playerName ? playerColor || '#6b7280' : unassignedColor;
  
  // Determine if this is an assigned or unassigned position
  const isAssigned = !!playerName;
  
  const finalDisplayName = displayName || playerName || 'Unassigned';
  
  const baseClasses = cn(
    "rounded-lg transition-colors",
    variant === 'compact' ? 'p-2' : 'p-3',
    onClick && "cursor-pointer hover:opacity-90",
    className
  );

  return (
    <div 
      className={baseClasses}
      style={{ 
        backgroundColor: `${displayColor}10`,
        border: `2px solid ${displayColor}`
      }}
      onClick={onClick}
    >
      <div className={cn(
        "flex items-center",
        variant === 'compact' ? 'space-x-2' : 'space-x-3'
      )}>
        {showAvatar && (
          <div 
            className={cn(
              "rounded-full flex items-center justify-center text-white",
              variant === 'compact' ? 'h-6 w-6' : 'h-8 w-8'
            )}
            style={{ backgroundColor: displayColor }}
          >
            <span className={cn(
              "font-semibold",
              variant === 'compact' ? 'text-xs' : 'text-xs'
            )}>
              {playerName ? getInitials(playerName.split(' ')[0] || '', playerName.split(' ')[1] || '') : '?'}
            </span>
          </div>
        )}
        
        <div className="flex-1">
          <p 
            className={cn(
              "font-medium truncate",
              variant === 'compact' ? 'text-xs' : 'text-sm'
            )}
            style={{ color: isAssigned ? displayColor : '#a5183d' }}
            title={finalDisplayName}
          >
            {finalDisplayName}
          </p>
          {subtitle && (
            <p className={cn(
              "text-gray-500",
              variant === 'compact' ? 'text-xs' : 'text-xs'
            )}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      
      {children && (
        <div className={cn(variant === 'compact' ? 'mt-1' : 'mt-2')}>
          {children}
        </div>
      )}
    </div>
  );
};
