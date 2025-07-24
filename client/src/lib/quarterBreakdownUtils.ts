// Shared utility for quarter-by-quarter position breakdowns and data quality

export interface GameWithPositionStats {
  id: number;
  quarterStats: {
    [quarter: string]: { GS: number; GA: number; GK: number; GD: number };
  };
}

export interface OfficialQuarterScore {
  quarter: string; // e.g., 'Q1', 'Q2', etc.
  for: number;
  against: number;
}

export interface PositionPercentages {
  GS: number;
  GA: number;
  GK: number;
  GD: number;
}

export interface QuarterBreakdown {
  quarter: string;
  GS: number;
  GA: number;
  GK: number;
  GD: number;
  for: number;
  against: number;
  dataQuality: number; // number of games with stats for this quarter
  usedFallback: boolean;
}

export function calculateQuarterPositionBreakdowns(
  gamesWithPositionStats: GameWithPositionStats[],
  officialQuarterScores: OfficialQuarterScore[],
  fallbackPercentages?: PositionPercentages
): {
  breakdowns: QuarterBreakdown[];
  dataQuality: { gamesWithStats: number; perQuarter: number[] };
} {
  const breakdowns: QuarterBreakdown[] = [];
  const perQuarterStats: number[] = [];
  const allQuarters = officialQuarterScores.map(q => q.quarter);
  let totalGamesWithStats = 0;

  // Calculate season-wide fallback if not provided
  let seasonFallback: PositionPercentages = fallbackPercentages || { GS: 0.5, GA: 0.5, GK: 0.5, GD: 0.5 };
  if (!fallbackPercentages && gamesWithPositionStats.length > 0) {
    let gs = 0, ga = 0, gk = 0, gd = 0, attack = 0, defense = 0;
    gamesWithPositionStats.forEach(g => {
      Object.values(g.quarterStats).forEach(pos => {
        gs += pos.GS || 0;
        ga += pos.GA || 0;
        gk += pos.GK || 0;
        gd += pos.GD || 0;
      });
    });
    attack = gs + ga;
    defense = gk + gd;
    seasonFallback = {
      GS: attack > 0 ? gs / attack : 0.5,
      GA: attack > 0 ? ga / attack : 0.5,
      GK: defense > 0 ? gk / defense : 0.5,
      GD: defense > 0 ? gd / defense : 0.5,
    };
  }

  for (const q of allQuarters) {
    // Gather all games with stats for this quarter
    const gamesWithStats = gamesWithPositionStats.filter(g => g.quarterStats[q]);
    perQuarterStats.push(gamesWithStats.length);
    totalGamesWithStats += gamesWithStats.length;
    let usedFallback = false;
    let gsPct = seasonFallback.GS, gaPct = seasonFallback.GA, gkPct = seasonFallback.GK, gdPct = seasonFallback.GD;
    if (gamesWithStats.length > 0) {
      let gs = 0, ga = 0, gk = 0, gd = 0, attack = 0, defense = 0;
      gamesWithStats.forEach(g => {
        const pos = g.quarterStats[q];
        gs += pos.GS || 0;
        ga += pos.GA || 0;
        gk += pos.GK || 0;
        gd += pos.GD || 0;
      });
      attack = gs + ga;
      defense = gk + gd;
      gsPct = attack > 0 ? gs / attack : seasonFallback.GS;
      gaPct = attack > 0 ? ga / attack : seasonFallback.GA;
      gkPct = defense > 0 ? gk / defense : seasonFallback.GK;
      gdPct = defense > 0 ? gd / defense : seasonFallback.GD;
    } else {
      usedFallback = true;
    }
    // Find official score for this quarter
    const official = officialQuarterScores.find(s => s.quarter === q);
    const forScore = official ? official.for : 0;
    const againstScore = official ? official.against : 0;
    // Apply percentages and round to 1dp
    let GS = round1dp(forScore * gsPct);
    let GA = round1dp(forScore * gaPct);
    let GK = round1dp(againstScore * gkPct);
    let GD = round1dp(againstScore * gdPct);
    // Adjust for rounding so GS+GA=forScore, GK+GD=againstScore
    [GS, GA] = adjustForRounding([GS, GA], forScore);
    [GK, GD] = adjustForRounding([GK, GD], againstScore);
    breakdowns.push({
      quarter: q,
      GS,
      GA,
      GK,
      GD,
      for: forScore,
      against: againstScore,
      dataQuality: gamesWithStats.length,
      usedFallback
    });
  }
  return {
    breakdowns,
    dataQuality: { gamesWithStats: totalGamesWithStats, perQuarter: perQuarterStats }
  };
}

function round1dp(val: number) {
  return Math.round(val * 10) / 10;
}

function adjustForRounding(values: number[], targetSum: number): number[] {
  // Ensure sum matches targetSum after rounding
  let sum = round1dp(values[0] + values[1]);
  let diff = round1dp(targetSum - sum);
  if (Math.abs(diff) < 0.11 && diff !== 0) {
    // Adjust the larger value
    if (values[0] >= values[1]) {
      values[0] = round1dp(values[0] + diff);
    } else {
      values[1] = round1dp(values[1] + diff);
    }
  }
  return values;
} 