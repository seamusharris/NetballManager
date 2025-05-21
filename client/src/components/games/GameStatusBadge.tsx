import React from 'react';
import { Badge } from '@/components/ui/badge';
import { GameStatus } from '@shared/schema';
import { cn } from '@/lib/utils';

interface GameStatusBadgeProps {
  status: GameStatus;
  onClick?: () => void;
  className?: string;
}

export function GameStatusBadge({ status, onClick, className }: GameStatusBadgeProps) {
  // Map status to display text and style
  const statusConfig = {
    'upcoming': { 
      text: 'Upcoming', 
      style: 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
    },
    'in-progress': { 
      text: 'In Progress', 
      style: 'bg-amber-100 text-amber-800 hover:bg-amber-200'
    },
    'completed': { 
      text: 'Completed', 
      style: 'bg-green-100 text-green-800 hover:bg-green-200'
    },
    'forfeit': { 
      text: 'Forfeit', 
      style: 'bg-red-100 text-red-800 hover:bg-red-200'
    }
  };

  const config = statusConfig[status] || statusConfig.upcoming;

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'px-2 py-1 rounded-full cursor-pointer transition-colors', 
        config.style,
        className
      )}
      onClick={onClick}
    >
      {config.text}
    </Badge>
  );
}