import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Game } from '@shared/schema';
import { getWinLoseLabel } from '@/lib/utils';

interface TeamPerformanceProps {
  games: Game[];
  className?: string;
}

export default function TeamPerformance({ games, className }: TeamPerformanceProps) {
  // Calculate performance metrics
  const totalGames = games.length;
  const completedGames = games.filter(game => game.completed).length;
  
  // Placeholder for win rate calculation
  // In a real app, you would calculate this based on actual game results
  const winCount = Math.floor(completedGames * 0.75); // Placeholder
  const winRate = completedGames > 0 ? Math.round((winCount / completedGames) * 100) : 0;
  
  // Placeholder for average score
  const avgScore = 42.6; // Placeholder
  
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-heading font-semibold text-neutral-dark">Team Performance</h3>
          <Badge variant="outline" className="bg-accent/10 text-accent px-2 py-1 rounded-full text-xs font-semibold">
            Season 2023
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-gray-500 text-sm">Win Rate</p>
            <p className="text-3xl font-bold text-primary mt-1">{winRate}%</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-sm">Avg. Score</p>
            <p className="text-3xl font-bold text-primary mt-1">{avgScore}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-sm">Games Played</p>
            <p className="text-3xl font-bold text-primary mt-1">{completedGames}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-sm">Upcoming</p>
            <p className="text-3xl font-bold text-primary mt-1">{Math.max(0, totalGames - completedGames)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
