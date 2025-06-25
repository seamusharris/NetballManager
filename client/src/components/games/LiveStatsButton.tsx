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

  // Use team from club context - determine which team the user represents
  const handleRecordStats = () => {
    // Prefer current team context if available and matches one of the game teams
    const userTeamId = currentTeam?.id;
    let targetTeamId;
    
    if (userTeamId && (userTeamId === game.homeTeamId || userTeamId === game.awayTeamId)) {
      targetTeamId = userTeamId;
      // Fallback to home team (could be away team based on user preference)
      targetTeamId = game.homeTeamId;
    }
    
    if (targetTeamId) {
      navigate(`/game/${game.id}/team/${targetTeamId}/stats/record`);
      // Last resort: legacy stats
      navigate(`/game/${game.id}/livestats`);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRecordStats}
      className={`flex items-center gap-1 ${className}`}
    >
      <ActivitySquare className="h-4 w-4" />
      <span>Record Stats</span>
    </Button>
  );
}