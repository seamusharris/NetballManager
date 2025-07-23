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
  teamId?: number; // Add teamId prop
}

export default function RecordStatsButton({ game, className = "", teamId }: RecordStatsButtonProps) {
  const [, navigate] = useLocation();
  const { currentTeam, currentClub } = useClub();

  // Use team from club context - determine which team the user represents
  const handleRecordStats = () => {
    // Debug the available data
    console.log('🔍 RecordStatsButton Debug:');
    console.log('🔍 game:', game);
    console.log('🔍 teamId prop:', teamId);
    console.log('🔍 currentTeam:', currentTeam);
    console.log('🔍 currentClub:', currentClub);
    console.log('🔍 game.home_team_id:', game.home_team_id);
    console.log('🔍 game.away_team_id:', game.away_team_id);

    // Use the teamId prop if provided, otherwise fall back to current team logic
    let targetTeamId = teamId;

    if (!targetTeamId) {
      // Prefer current team context if available and matches one of the game teams
      const userTeamId = currentTeam?.id;

      if (userTeamId && (userTeamId === game.home_team_id || userTeamId === game.away_team_id)) {
        targetTeamId = userTeamId;
        console.log('🔍 Using current team ID:', targetTeamId);
      } else {
        // Fallback: use home_team_id
        targetTeamId = game.home_team_id;
        console.log('🔍 Using home team ID as fallback:', targetTeamId);
      }
    } else {
      console.log('🔍 Using teamId prop:', targetTeamId);
    }

    console.log('🔍 Final targetTeamId:', targetTeamId);

    // Use RESTful team-centric URL pattern
    navigate(`/team/${targetTeamId}/game/${game.id}/stats/record`);
  };

  return (
    <Button 
      variant="outline" 
      size="sm"
      className={`border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-900 ${className}`}
      onClick={handleRecordStats}
    >
      <ActivitySquare className="mr-2 h-4 w-4" />
      Record Stats
    </Button>
  );
}