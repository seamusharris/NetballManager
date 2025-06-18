import React from 'react';
import { cn, getInitials } from '@/lib/utils';
import { Player } from '@shared/schema';

interface PlayerAvatarProps {
  player: Player;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  style?: React.CSSProperties;
  showBorder?: boolean;
  useStandardStyling?: boolean; // New prop for consistent White Border + Shadow styling
}

export default function PlayerAvatar({ 
  player, 
  size = 'md', 
  className,
  style,
  showBorder = false,
  useStandardStyling = true // Default to true for consistent styling
}: PlayerAvatarProps) {
  if (!player) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full text-white font-bold",
        player.avatarColor || 'bg-gray-500',
        {
          'w-8 h-8 text-xs': size === 'sm',
          'w-12 h-12 text-sm': size === 'md',
          'w-16 h-16 text-base': size === 'lg',
          'w-20 h-20 text-lg': size === 'xl'
        },
        useStandardStyling && "border-4 border-white shadow-lg",
        showBorder && !useStandardStyling && "ring-2 ring-white ring-offset-2",
        className
      )}
      style={style}
    >
      {player.firstName?.[0]}{player.lastName?.[0]}
    </div>
  );
}