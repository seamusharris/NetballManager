import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { ActivitySquare } from 'lucide-react';
import { Game } from '@shared/schema';
import { useClub } from '@/contexts/ClubContext';
import { startTransition } from 'react';

// Rename component and export
export interface RecordStatsButtonProps {
  game: any; // Use 'any' for now to avoid type errors, ideally import the correct type
  className?: string;
}

export default function RecordStatsButton({ game, className = "" }: RecordStatsButtonProps) {
  const [, navigate] = useLocation();
  const { currentTeam, currentClub } = useClub();

  // If game.status_id does not allow stats, return null (replace 3 with correct status if needed)
  if (game.status_id !== 3) {
    return null;
  }

  // Use team from club context - determine which team the user represents
  const handleRecordStats = () => {
    // Prefer current team context if available and matches one of the game teams
    const userTeamId = currentTeam?.id;
    const clubId = currentClub?.id;
    let targetTeamId;

    if (userTeamId && (userTeamId === game.home_team_id || userTeamId === game.away_team_id)) {
      targetTeamId = userTeamId;
    } else {
      // Fallback: use home_team_id
      targetTeamId = game.home_team_id;
    }

    // Use simplified URL pattern - no need for club/team context in URL
    navigate(`/game/${game.id}/stats/record`);
  };

  return (
    <button className={`btn btn-primary ${className}`} onClick={handleRecordStats}>
      Record Stats
    </button>
  );
}