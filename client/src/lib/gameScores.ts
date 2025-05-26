
import { GameStat } from '@shared/schema';

export interface QuarterScore {
  for: number;
  against: number;
}

export interface GameScores {
  quarterScores: {
    '1': QuarterScore;
    '2': QuarterScore;
    '3': QuarterScore;
    '4': QuarterScore;
  };
  finalScore: QuarterScore;
}

export function calculateGameScores(stats: GameStat[]): GameScores {
  const quarterScores: GameScores['quarterScores'] = {
    '1': { for: 0, against: 0 },
    '2': { for: 0, against: 0 },
    '3': { for: 0, against: 0 },
    '4': { for: 0, against: 0 }
  };

  // Calculate scores for each quarter
  for (let quarter = 1; quarter <= 4; quarter++) {
    const quarterStats = stats.filter(stat => stat.quarter === quarter);
    
    quarterScores[quarter as keyof typeof quarterScores] = {
      for: quarterStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0),
      against: quarterStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0)
    };
  }

  // Calculate final scores
  const finalScore = {
    for: Object.values(quarterScores).reduce((sum, quarter) => sum + quarter.for, 0),
    against: Object.values(quarterScores).reduce((sum, quarter) => sum + quarter.against, 0)
  };

  return { quarterScores, finalScore };
}

export function getGameResult(finalScore: QuarterScore): 'win' | 'loss' | 'draw' {
  if (finalScore.for > finalScore.against) return 'win';
  if (finalScore.for < finalScore.against) return 'loss';
  return 'draw';
}
