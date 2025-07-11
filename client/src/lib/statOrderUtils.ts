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
import { Target, Shield, RotateCcw, ArrowUp, Ban, Play, Zap, RefreshCw, Users, Coffee } from 'lucide-react';

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

// Centralized stat ordering and display configuration
export const STAT_CONFIG = {
  goalsFor: { 
    key: 'goalsFor', 
    label: 'Goal', 
    icon: Target, 
    color: 'bg-green-100 hover:bg-green-200 border-green-300',
    category: 'attacking'
  },
  goalsAgainst: { 
    key: 'goalsAgainst', 
    label: 'Goal Against', 
    icon: Shield, 
    color: 'bg-red-100 hover:bg-red-200 border-red-300',
    category: 'defending'
  },
  missedGoals: { 
    key: 'missedGoals', 
    label: 'Miss', 
    icon: RotateCcw, 
    color: 'bg-orange-100 hover:bg-orange-200 border-orange-300',
    category: 'attacking'
  },
  rebounds: { 
    key: 'rebounds', 
    label: 'Rebound', 
    icon: ArrowUp, 
    color: 'bg-purple-100 hover:bg-purple-200 border-purple-300',
    category: 'attacking'
  },
  intercepts: { 
    key: 'intercepts', 
    label: 'Intercept', 
    icon: Zap, 
    color: 'bg-blue-100 hover:bg-blue-200 border-blue-300',
    category: 'all'
  },
  deflections: { 
    key: 'deflections', 
    label: 'Deflection', 
    icon: RefreshCw, 
    color: 'bg-cyan-100 hover:bg-cyan-200 border-cyan-300',
    category: 'all'
  },
  turnovers: { 
    key: 'turnovers', 
    label: 'Turnover', 
    icon: Ban, 
    color: 'bg-red-100 hover:bg-red-200 border-red-300',
    category: 'all'
  },
  gains: { 
    key: 'gains', 
    label: 'Gain', 
    icon: Play, 
    color: 'bg-green-100 hover:bg-green-200 border-green-300',
    category: 'all'
  },
  receives: { 
    key: 'receives', 
    label: 'Receive', 
    icon: Users, 
    color: 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300',
    category: 'all'
  },
  penalties: { 
    key: 'penalties', 
    label: 'Penalty', 
    icon: Coffee, 
    color: 'bg-amber-100 hover:bg-amber-200 border-amber-300',
    category: 'all'
  }
} as const;