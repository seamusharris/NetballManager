import { useState, useEffect } from 'react';
import { CustomHeaderWidget } from '@/components/ui/base-widget';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Game, GameStat, Season } from '@shared/schema';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

interface PerformanceChartsProps {
  games: Game[];
  className?: string;
  seasonFilter?: string;
  activeSeason?: Season | null;
}

interface ChartDataPoint {
  name: string;
  teamScore: number;
  opponentScore: number;
  reboundRate: number;
  interceptions: number;
  change: number;
}

interface QuarterStats {
  teamScore: number;
  opponentScore: number;
  rebounds: number;
  intercepts: number;
  totalReboundOpportunities: number;
}

export default function PerformanceCharts({ games, className, seasonFilter, activeSeason }: PerformanceChartsProps) {
  const [gameRange, setGameRange] = useState('all');
  const [metricType, setMetricType] = useState('all');
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  // Filter games by selected season first
  const seasonFilteredGames = games.filter(game => {
    if (seasonFilter === 'current' && activeSeason) {
      return game.seasonId === activeSeason.id;
    } else if (seasonFilter && seasonFilter !== 'current') {
      const seasonId = parseInt(seasonFilter);
      return game.seasonId === seasonId;
    }
    return true;
  });

  // Then filter by completion status
  const filteredGames = seasonFilteredGames.filter(game => game.completed);
  const gameIds = filteredGames.map(game => game.id);

  // Fetch game stats for all completed games
      if (gameIds.length === 0) {
        return {};
      }

      // Fetch stats for each completed game
      const statsPromises = gameIds.map(async (gameId) => {
        const stats = await response.json();
        return { gameId, stats };
      });

      const results = await Promise.all(statsPromises);

      // Create a map of game ID to stats array
      return results.reduce((statsMap: Record<number, GameStat[]>, result) => {
        statsMap[result.gameId] = result.stats;
        return statsMap;
      }, {});
    },
    enabled: gameIds.length > 0,
    staleTime: 60000 // 1 minute
  });

  // Calculate chart data from game stats
  useEffect(() => {
    if (!gameStatsMap || isLoading || Object.keys(gameStatsMap).length === 0) {
      return;
    }

    // Initialize quarter stats
    const quarterStats: Record<number, QuarterStats> = {
      1: { teamScore: 0, opponentScore: 0, rebounds: 0, intercepts: 0, totalReboundOpportunities: 0 },
      2: { teamScore: 0, opponentScore: 0, rebounds: 0, intercepts: 0, totalReboundOpportunities: 0 },
      3: { teamScore: 0, opponentScore: 0, rebounds: 0, intercepts: 0, totalReboundOpportunities: 0 },
      4: { teamScore: 0, opponentScore: 0, rebounds: 0, intercepts: 0, totalReboundOpportunities: 0 }
    };

    const quarterGamesCount: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };

    // Process all stats
    Object.values(gameStatsMap).forEach(gameStats => {
      if (!gameStats || gameStats.length === 0) return;

      // Create sets to track which quarters have data for this game
      const quartersWithData = new Set<number>();

      // Aggregate stats by quarter
      gameStats.forEach(stat => {
        if (stat.quarter < 1 || stat.quarter > 4) return;

        const quarter = stat.quarter;
        quartersWithData.add(quarter);

        // Add to quarter totals
        quarterStats[quarter].teamScore += stat.goalsFor || 0;
        quarterStats[quarter].opponentScore += stat.goalsAgainst || 0;
        quarterStats[quarter].rebounds += stat.rebounds || 0;
        quarterStats[quarter].intercepts += stat.intercepts || 0;
        quarterStats[quarter].totalReboundOpportunities += (stat.rebounds || 0) + (stat.missedGoals || 0);
      });

      // Increment game count for quarters that had data
      quartersWithData.forEach(quarter => {
        quarterGamesCount[quarter]++;
      });
    });

    // Calculate averages and create chart data
    const newChartData: ChartDataPoint[] = [];

    let prevQuarterTeamScore = 0;

    for (let quarter = 1; quarter <= 4; quarter++) {
      const gameCount = quarterGamesCount[quarter] || 1; // Avoid division by zero
      const teamScore = quarterStats[quarter].teamScore / gameCount;
      const opponentScore = quarterStats[quarter].opponentScore / gameCount;
      const intercepts = quarterStats[quarter].intercepts / gameCount;

      // Calculate rebound rate (rebounds as percentage of rebound opportunities)
      const totalReboundOps = quarterStats[quarter].totalReboundOpportunities || 1; // Avoid division by zero
      const reboundRate = (quarterStats[quarter].rebounds / totalReboundOps) * 100;

      // Calculate score change from previous quarter (for first quarter, compare to 0)
      const change = quarter === 1 
        ? teamScore 
        : ((teamScore - prevQuarterTeamScore) / Math.max(prevQuarterTeamScore, 0.1)) * 100;

      prevQuarterTeamScore = teamScore;

      newChartData.push({
        name: `Quarter ${quarter}`,
        teamScore: parseFloat(teamScore.toFixed(1)),
        opponentScore: parseFloat(opponentScore.toFixed(1)),
        reboundRate: parseFloat(reboundRate.toFixed(1)),
        interceptions: parseFloat(intercepts.toFixed(1)),
        change: parseFloat(change.toFixed(1))
      });
    }

    setChartData(newChartData);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStatsMap, isLoading]);

  // If no data yet, show loading state
  if (chartData.length === 0) {
    return (
      <CustomHeaderWidget 
        title="Quarter-by-Quarter Performance" 
        className={className}
        contentClassName="p-6"
        headerContent={
          <Select value={gameRange} onValueChange={setGameRange}>
            <SelectTrigger className="bg-white border rounded-md w-[130px]">
              <SelectValue placeholder="All Games" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Games</SelectItem>
            </SelectContent>
          </Select>
        }
      >
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-400">Loading chart data or no completed games yet...</p>
        </div>
      </CustomHeaderWidget>
    );
  }

  return (
    <CustomHeaderWidget 
      title="Quarter-by-Quarter Performance" 
      className={className}
      contentClassName="p-6"
      headerContent={
        <div className="flex space-x-3">
          <Select value={gameRange} onValueChange={setGameRange}>
            <SelectTrigger className="bg-white border rounded-md w-[130px]">
              <SelectValue placeholder="All Games" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Games</SelectItem>
            </SelectContent>
          </Select>

          <Select value={metricType} onValueChange={setMetricType}>
            <SelectTrigger className="bg-white border rounded-md w-[130px]">
              <SelectValue placeholder="All Metrics" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Metrics</SelectItem>
              <SelectItem value="goals">Goals Only</SelectItem>
              <SelectItem value="defense">Defense Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
    >

        <div className="h-64 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="teamScore" name="Team Score" fill="hsl(var(--primary))" />
              <Bar dataKey="opponentScore" name="Opponent Score" fill="hsl(var(--secondary))" />
              {metricType !== 'goals' && (
                <>
                  <Bar dataKey="reboundRate" name="Rebound %" fill="hsl(var(--accent))" />
                  <Bar dataKey="interceptions" name="Interceptions" fill="hsl(var(--success))" />
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {chartData.map((quarter, index) => (
            <div key={index} className="p-3 bg-primary/5 rounded-md">
              <p className="text-sm text-gray-500 mb-1">{quarter.name} Avg</p>
              <div className="flex justify-between items-center">
                <p className="text-lg font-bold text-primary">{quarter.teamScore}</p>
                <span className={cn(
                  "text-xs flex items-center",
                  quarter.change >= 0 ? "text-success" : "text-error"
                )}>
                  {quarter.change >= 0 ? (
                    <ArrowUp className="w-3 h-3 mr-0.5" />
                  ) : (
                    <ArrowDown className="w-3 h-3 mr-0.5" />
                  )}
                  {Math.abs(quarter.change)}%
                </span>
              </div>
            </div>
          ))}
        </div>
    </CustomHeaderWidget>
  );
}