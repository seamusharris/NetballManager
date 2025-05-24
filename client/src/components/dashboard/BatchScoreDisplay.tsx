import { useEffect, useMemo } from 'react';
import { useBatchGameStatistics } from '../statistics/hooks/useBatchGameStatistics';
import { isForfeitGame, getForfeitGameScore } from '@/lib/utils';
import { Game } from '@shared/schema';
import { getCachedScores, cacheScores } from '@/lib/scoresCache';

interface BatchScoreDisplayProps {
  games: Game[];
  className?: string;
}

/**
 * Efficiently displays scores for multiple games using a single batch API request
 * instead of separate requests for each game
 */
export default function BatchScoreDisplay({ games, className }: BatchScoreDisplayProps) {
  // Filter to only get completed games
  const completedGames = useMemo(() => 
    games.filter(g => g.completed), 
    [games]
  );
  
  // Get all game IDs for batch fetching
  const gameIds = useMemo(() => 
    completedGames.map(g => g.id),
    [completedGames]
  );
  
  // Use the batch statistics hook
  const { statsMap, isLoading } = useBatchGameStatistics(gameIds);
  
  // Calculate and cache scores once we have the stats
  useEffect(() => {
    if (Object.keys(statsMap).length > 0) {
      // Process each game's stats and calculate scores
      completedGames.forEach(game => {
        // Skip if we don't have stats for this game
        if (!statsMap[game.id]) return;
        
        // For forfeit games, use the forfeit score
        if (isForfeitGame(game)) {
          const forfeitScore = getForfeitGameScore(game);
          cacheScores(game.id, forfeitScore, undefined, game.status);
          return;
        }
        
        // For regular games, calculate scores from stats
        const stats = statsMap[game.id];
        
        // Initialize score structure
        const quarterScores = {
          '1': { for: 0, against: 0 },
          '2': { for: 0, against: 0 },
          '3': { for: 0, against: 0 },
          '4': { for: 0, against: 0 }
        };
        
        // Create a map of the latest stats for each position/quarter
        const latestPositionStats: Record<string, GameStat> = {};
        
        // Find the latest stat for each position/quarter combination
        stats.forEach(stat => {
          if (!stat || !stat.quarter) return;
          
          if (stat.position) {
            const key = `${stat.position}-${stat.quarter}`;
            
            // Always use the data with the highest ID for each position/quarter
            if (!latestPositionStats[key] || stat.id > latestPositionStats[key].id) {
              latestPositionStats[key] = stat;
            }
          }
        });
        
        // Sum up goals from all positions for each quarter
        Object.values(latestPositionStats).forEach(stat => {
          if (stat && stat.quarter >= 1 && stat.quarter <= 4) {
            const quarterKey = stat.quarter.toString() as '1' | '2' | '3' | '4';
            quarterScores[quarterKey].for += (stat.goalsFor || 0);
            quarterScores[quarterKey].against += (stat.goalsAgainst || 0);
          }
        });
        
        // Calculate final score
        const finalScore = {
          for: quarterScores['1'].for + quarterScores['2'].for + 
               quarterScores['3'].for + quarterScores['4'].for,
          against: quarterScores['1'].against + quarterScores['2'].against +
                  quarterScores['3'].against + quarterScores['4'].against
        };
        
        const scores = { quarterScores, finalScore };
        
        // Cache the calculated scores
        cacheScores(game.id, scores, stats);
      });
    }
  }, [statsMap, completedGames]);
  
  // This component doesn't render anything directly
  // It just efficiently loads and caches scores for other components to use
  return null;
}