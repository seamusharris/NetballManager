import { GamesList } from '@/components/games/GamesList';
import { Game, Opponent } from '@shared/schema';

interface DashboardGamesListProps {
  games: Game[];
  opponents: Opponent[];
  className?: string;
}

export default function DashboardGamesList({ games, opponents, className }: DashboardGamesListProps): JSX.Element {
  return (
    <GamesList
      games={games}
      opponents={opponents}
      className={className}
      isDashboard={true}
      showFilters={true}
      showActions={false}
      maxRows={10}
      title="Game Schedule"
    />
  );
}