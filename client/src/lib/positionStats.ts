// Position-based statistics utilities

import { Position } from '@shared/schema';

export const statLabels: Record<string, string> = {
  goalsFor: 'Goals Scored',
  goalsAgainst: 'Goals Conceded', 
  missedGoals: 'Missed Goals',
  rebounds: 'Rebounds',
  intercepts: 'Intercepts',
  badPass: 'Bad Passes',
  handlingError: 'Handling Errors',
  pickUp: 'Pick Ups',
  infringement: 'Infringements',
  rating: 'Performance Rating'
};

// Primary stats that are most important for each position
export const primaryPositionStats: Record<string, string[]> = {
  'GS': ['goalsFor', 'missedGoals'],
  'GA': ['goalsFor', 'missedGoals', 'rebounds'],
  'WA': ['pickUp', 'badPass'],
  'C': ['pickUp', 'badPass', 'intercepts'],
  'WD': ['intercepts', 'badPass'],
  'GD': ['intercepts', 'rebounds', 'goalsAgainst'],
  'GK': ['goalsAgainst', 'rebounds', 'intercepts']
};

// Secondary stats that provide additional context
export const secondaryPositionStats: Record<string, string[]> = {
  'GS': ['rebounds', 'handlingError'],
  'GA': ['handlingError', 'pickUp'],
  'WA': ['handlingError', 'intercepts'],
  'C': ['handlingError', 'rebounds'],
  'WD': ['handlingError', 'rebounds'],
  'GD': ['handlingError', 'pickUp'],
  'GK': ['handlingError', 'pickUp']
};

// Get the display name for a stat
export function getStatDisplayName(statKey: string): string {
  return statLabels[statKey] || statKey;
}

// Get position-specific stats for display
export function getPositionStats(position: Position): {
  primary: string[];
  secondary: string[];
} {
  return {
    primary: primaryPositionStats[position] || [],
    secondary: secondaryPositionStats[position] || []
  };
}

// Calculate position effectiveness based on primary stats
export function calculatePositionEffectiveness(
  position: Position,
  stats: Record<string, number>
): number {
  const primaryStats = primaryPositionStats[position] || [];
  if (primaryStats.length === 0) return 0;

  let totalScore = 0;
  let maxPossibleScore = 0;

  primaryStats.forEach(statKey => {
    const value = stats[statKey] || 0;
    // Weight positive stats (goals, intercepts, etc.) positively
    // Weight negative stats (errors, missed goals) negatively
    if (['goalsFor', 'intercepts', 'rebounds', 'pickUp'].includes(statKey)) {
      totalScore += value;
      maxPossibleScore += 10; // Arbitrary max for scaling
    } else if (['goalsAgainst', 'missedGoals', 'badPass', 'handlingError', 'infringement'].includes(statKey)) {
      totalScore -= value;
      maxPossibleScore += 10;
    }
  });

  return maxPossibleScore > 0 ? Math.max(0, Math.min(100, (totalScore / maxPossibleScore) * 100)) : 0;
}