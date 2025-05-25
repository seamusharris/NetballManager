import { useEffect, useMemo } from 'react';
import { useBatchGameStatistics } from '../statistics/hooks/useBatchGameStatistics';
import { isForfeitGame, getForfeitGameScore } from '@/lib/utils';
import { Game, GameStat } from '@shared/schema';
import { getCachedScores, cacheScores } from '@/lib/scoresCache';
import { statisticsService } from '@/lib/statisticsService';

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
    games?.filter(g => g.completed) || [], 
    [games]
  );
  
  // Get all game IDs for batch fetching
  const gameIds = useMemo(() => 
    completedGames.map(g => g.id),
    [completedGames]
  );
  
  // Log batch request for debugging
  useEffect(() => {
    if (gameIds.length > 0) {
      console.log(`Dashboard batch loading scores for ${gameIds.length} completed games`);
    }
  }, [gameIds]);
  
  // Use the statisticsService directly for consistent behavior
  useEffect(() => {
    async function loadAndCacheBatchStats() {
      if (gameIds.length === 0) return;
      
      try {
        // Use the service to fetch stats in a batch
        const batchStats = await statisticsService.getBatchGameStats(gameIds);
        
        // Process results in the same way as the individual calls
        completedGames.forEach(game => {
          // Process forfeit games specially
          if (isForfeitGame(game)) {
            const forfeitScore = getForfeitGameScore(game);
            cacheScores(game.id, forfeitScore, undefined, game.status);
            return;
          }
          
          // Skip if we don't have stats for this game
          const stats = batchStats[game.id];
          if (!stats || !stats.length) return;
          
          try {
            // Calculate scores using the statisticsService to ensure consistency
            statisticsService.calculateGameScores(game.id, true);
          } catch (calcError) {
            console.warn(`Error calculating scores for game ${game.id}:`, calcError);
          }
        });
        
        console.log(`Successfully cached scores for ${completedGames.length} games using batch endpoint`);
      } catch (error) {
        console.error("Error loading batch game statistics:", error);
      }
    }
    
    loadAndCacheBatchStats();
  }, [gameIds, completedGames]);
  
  // This component doesn't render anything directly
  // It just efficiently loads and caches scores for other components to use
  return null;
}