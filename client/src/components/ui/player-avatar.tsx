
import React from 'react';
import { cn, getInitials } from '@/lib/utils';

interface PlayerAvatarProps {
  firstName: string;
  lastName: string;
  avatarColor?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'h-6 w-6 text-xs',
  md: 'h-8 w-8 text-sm',
  lg: 'h-10 w-10 text-sm',
  xl: 'h-16 w-16 text-lg'
};

export function PlayerAvatar({ 
  firstName, 
  lastName, 
  avatarColor = 'bg-gray-500', 
  size = 'md',
  className 
}: PlayerAvatarProps) {
  return (
    <div 
      className={cn(
        "rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0",
        sizeClasses[size],
        avatarColor,
        className
      )}
    >
      <span className="font-semibold">
        {getInitials(firstName, lastName)}
      </span>
    </div>
  );
}
