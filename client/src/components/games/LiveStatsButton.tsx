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

  // Show the button if the game allows statistics
  if (!game.statusAllowsStatistics) {
    return null;
  }

  // For now, use home team ID as default - in practice this would be determined by user's team
  const teamId = game.homeTeamId;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => navigate(`/game/${game.id}/team/${teamId}/stats/record`)}
      className={`flex items-center gap-1 ${className}`}
    >
      <ActivitySquare className="h-4 w-4" />
      <span>Record Stats</span>
    </Button>
  );
}