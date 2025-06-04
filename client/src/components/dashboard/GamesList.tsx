import { GamesList } from '@/components/games/GamesList';
import { Game, Opponent } from '@shared/schema';

interface DashboardGamesListProps {
  games: Game[];
  className?: string;
}

export default function DashboardGamesList({ games, className }: DashboardGamesListProps): JSX.Element {
  return (
    <GamesList
      games={games}
      className={className}
      isDashboard={true}
      showFilters={true}
      showActions={false}
      maxRows={10}
      title="Game Schedule"
    />
  );
}