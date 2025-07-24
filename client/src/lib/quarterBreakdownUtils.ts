// Shared utility for quarter-by-quarter position breakdowns and data quality

import { adjustValuesToTotal } from './roundingUtils';

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

// New: Centralized breakdown and sum-matching for all widgets
export function getConsistentStatsBreakdown(
  gamesWithPositionStats: GameWithPositionStats[],
  officialQuarterScores: OfficialQuarterScore[]
) {
  const numGames = gamesWithPositionStats.length || 1;
  // Per-quarter totals (for and against) as per-game averages
  const rawQuarterFor = officialQuarterScores.map(q => q.for / numGames);
  const rawQuarterAgainst = officialQuarterScores.map(q => q.against / numGames);
  const totalFor = rawQuarterFor.reduce((a, b) => a + b, 0);
  const totalAgainst = rawQuarterAgainst.reduce((a, b) => a + b, 0);
  // Sum-match per-quarter totals to season total
  const quarterFor = adjustValuesToTotal(rawQuarterFor, totalFor);
  const quarterAgainst = adjustValuesToTotal(rawQuarterAgainst, totalAgainst);

  // Per-quarter position breakdowns (GS, GA, GK, GD) as per-game averages
  const rawQuarterPositions = officialQuarterScores.map((q, i) => {
    let gs = 0, ga = 0, gk = 0, gd = 0, attack = 0, defense = 0;
    gamesWithPositionStats.forEach(g => {
      const pos = g.quarterStats[q.quarter];
      if (pos) {
        gs += pos.GS || 0;
        ga += pos.GA || 0;
        gk += pos.GK || 0;
        gd += pos.GD || 0;
      }
    });
    // Divide by number of games for per-game averages
    gs = gs / numGames;
    ga = ga / numGames;
    gk = gk / numGames;
    gd = gd / numGames;
    attack = gs + ga;
    defense = gk + gd;
    // Use percentages for this quarter
    const gsPct = attack > 0 ? gs / attack : 0.5;
    const gaPct = attack > 0 ? ga / attack : 0.5;
    const gkPct = defense > 0 ? gk / defense : 0.5;
    const gdPct = defense > 0 ? gd / defense : 0.5;
    // Apply to official score (already per-game average)
    let GS = round1dp(quarterFor[i] * gsPct);
    let GA = round1dp(quarterFor[i] * gaPct);
    let GK = round1dp(quarterAgainst[i] * gkPct);
    let GD = round1dp(quarterAgainst[i] * gdPct);
    // Sum-match per-position to per-quarter total
    [GS, GA] = adjustForRounding([GS, GA], quarterFor[i]);
    [GK, GD] = adjustForRounding([GK, GD], quarterAgainst[i]);
    return { GS, GA, GK, GD };
  });

  // Per-position totals (sum of per-quarter, already sum-matched)
  const totalGS = rawQuarterPositions.reduce((a, q) => a + q.GS, 0);
  const totalGA = rawQuarterPositions.reduce((a, q) => a + q.GA, 0);
  const totalGK = rawQuarterPositions.reduce((a, q) => a + q.GK, 0);
  const totalGD = rawQuarterPositions.reduce((a, q) => a + q.GD, 0);
  // Sum-match per-position totals to season total
  const [GS, GA] = adjustForRounding([totalGS, totalGA], totalFor);
  const [GK, GD] = adjustForRounding([totalGK, totalGD], totalAgainst);

  return {
    quarterFor,
    quarterAgainst,
    rawQuarterPositions,
    totalFor,
    totalAgainst,
    GS, GA, GK, GD,
    perQuarter: rawQuarterPositions.map(q => ({ GS: q.GS, GA: q.GA, GK: q.GK, GD: q.GD })),
  };
} 