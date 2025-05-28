import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { ActivitySquare } from 'lucide-react';
import { Game } from '@shared/schema';

interface LiveStatsButtonProps {
  game: Game;
  className?: string;
}

export default function LiveStatsButton({ game, className = "" }: LiveStatsButtonProps) {
  const [, navigate] = useLocation();

  // Only show the button if the game status is "in-progress"
  if (game.gameStatus?.name !== 'in-progress') {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => navigate(`/game/${game.id}/livestats`)}
      className={`flex items-center gap-1 ${className}`}
    >
      <ActivitySquare className="h-4 w-4" />
      <span>Live Stats</span>
    </Button>
  );
}