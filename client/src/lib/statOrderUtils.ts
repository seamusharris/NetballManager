
import { 
  STAT_ORDER_CONFIG, 
  getOrderedStatsForPosition, 
  getAllOrderedStats, 
  getStatsByCategory,
  STAT_LABELS,
  STAT_COLORS,
  StatCategory 
} from './constants';
import { Position } from '@shared/schema';

/**
 * Utility functions for consistent stat ordering across the application
 */

export interface OrderedStat {
  key: string;
  label: string;
  category: StatCategory;
  color?: string;
  value?: number;
}

/**
 * Get stats in the correct order for a specific position
 */
export function getPositionOrderedStats(position: Position, statsData?: Record<string, number>): OrderedStat[] {
  const orderedStats = getOrderedStatsForPosition(position);
  
  return orderedStats.map(stat => ({
    ...stat,
    color: STAT_COLORS[stat.key],
    value: statsData?.[stat.key] || 0
  }));
}

/**
 * Get all stats in the globally defined order
 */
export function getAllStatsOrdered(statsData?: Record<string, number>): OrderedStat[] {
  const orderedStats = getAllOrderedStats();
  
  return orderedStats.map(stat => ({
    ...stat,
    color: STAT_COLORS[stat.key],
    value: statsData?.[stat.key] || 0
  }));
}

/**
 * Get stats by category in order
 */
export function getStatsByCategoryOrdered(category: StatCategory, statsData?: Record<string, number>): OrderedStat[] {
  const orderedStats = getStatsByCategory(category);
  
  return orderedStats.map(stat => ({
    ...stat,
    color: STAT_COLORS[stat.key],
    value: statsData?.[stat.key] || 0
  }));
}

/**
 * Sort any array of stat objects according to the global ordering
 */
export function sortStatsByOrder<T extends { [K in keyof T]: T[K] }>(
  stats: T[], 
  keyProperty: keyof T
): T[] {
  const orderedKeys = getAllOrderedStats().map(s => s.key);
  
  return stats.sort((a, b) => {
    const aIndex = orderedKeys.indexOf(String(a[keyProperty]));
    const bIndex = orderedKeys.indexOf(String(b[keyProperty]));
    
    // If not found in order, put at end
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    
    return aIndex - bIndex;
  });
}

/**
 * Filter stats to only show relevant ones for a position
 */
export function filterStatsForPosition(position: Position, statsData: Record<string, number>): Record<string, number> {
  const relevantStats = getOrderedStatsForPosition(position);
  const filtered: Record<string, number> = {};
  
  relevantStats.forEach(stat => {
    if (statsData[stat.key] !== undefined) {
      filtered[stat.key] = statsData[stat.key];
    }
  });
  
  return filtered;
}

/**
 * Get stat display order as simple key array (for backward compatibility)
 */
export function getStatKeyOrder(position?: Position): string[] {
  if (position) {
    return getOrderedStatsForPosition(position).map(s => s.key);
  }
  return getAllOrderedStats().map(s => s.key);
}

/**
 * Check if a stat is relevant for a position
 */
export function isStatRelevantForPosition(statKey: string, position: Position): boolean {
  const relevantStats = getOrderedStatsForPosition(position);
  return relevantStats.some(stat => stat.key === statKey);
}
