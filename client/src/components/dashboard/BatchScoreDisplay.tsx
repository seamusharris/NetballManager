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
  // Filter to only get completed games and ensure we have valid data
  const completedGames = useMemo(() => {
    if (!games || !Array.isArray(games)) return [];
    return games.filter(g => g && g.completed && g.status !== 'upcoming' && typeof g.id === 'number');
  }, [games]);

  // Get all game IDs for batch fetching - ensure we have valid data
  const gameIds = useMemo(() => {
    if (!completedGames || completedGames.length === 0) {
      return [];
    }
    const validIds = completedGames
      .map(g => g?.id)
      .filter(id => id && typeof id === 'number' && id > 0 && !isNaN(id));
    
    return validIds.length > 0 ? validIds : [];
  }, [completedGames]);

  // Log batch request for debugging
  useEffect(() => {
    if (gameIds.length > 0) {
      console.log(`Dashboard batch loading scores for ${gameIds.length} completed games`);
    } else if (games) {
      console.log(`No completed games found to batch load scores for`);
    }
  }, [gameIds, games]);

  // Use the statisticsService directly for consistent behavior
  useEffect(() => {
    async function loadAndCacheBatchStats() {
      if (!gameIds || gameIds.length === 0) {
        console.log('No valid game IDs to batch load stats for');
        return;
      }

      try {
        console.log(`Dashboard batch loading scores for games: ${gameIds.join(',')}`);

        // Only proceed if we have valid game IDs
        if (!gameIds || gameIds.length === 0) {
          console.log('BatchScoreDisplay: No valid game IDs to process');
          return;
        }
        
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
            // Calculate and cache scores directly instead of calling the service again
            const scores = statisticsService['calculateScoresFromStats'](stats, game.id);
            cacheScores(game.id, scores, stats);
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