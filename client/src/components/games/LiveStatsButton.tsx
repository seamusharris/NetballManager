import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { ActivitySquare } from 'lucide-react';
import { Game } from '@shared/schema';
import { useClub } from '@/contexts/ClubContext';

interface LiveStatsButtonProps {
  game: Game;
  className?: string;
}

export default function LiveStatsButton({ game, className = "" }: LiveStatsButtonProps) {
  const [, navigate] = useLocation();
  const { currentTeam } = useClub();

  // Show the button if the game allows statistics
  if (!game.statusAllowsStatistics) {
    return null;
  }

  // Use team from club context - determine which team the user represents
  const handleRecordStats = () => {
    console.log('LiveStatsButton: Routing to game-centric StatsRecorder');
    
    // Prefer current team context if available and matches one of the game teams
    const userTeamId = currentTeam?.id;
    let targetTeamId;
    
    if (userTeamId && (userTeamId === game.homeTeamId || userTeamId === game.awayTeamId)) {
      targetTeamId = userTeamId;
      console.log(`LiveStatsButton: Using current team ${targetTeamId} for game ${game.id}`);
    } else {
      // Fallback to home team (could be away team based on user preference)
      targetTeamId = game.homeTeamId;
      console.log(`LiveStatsButton: Fallback to home team ${targetTeamId} for game ${game.id}`);
    }
    
    if (targetTeamId) {
      const route = `/game/${game.id}/team/${targetTeamId}/stats/record`;
      console.log(`LiveStatsButton: Navigating to game-centric route: ${route}`);
      navigate(route);
    } else {
      console.warn('LiveStatsButton: No valid team ID found, falling back to legacy route');
      // Last resort: legacy stats (this should rarely happen)
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