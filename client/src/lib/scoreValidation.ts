export interface TeamStats {
  teamId: number;
  goalsFor: number;
  goalsAgainst: number;
}

export interface ScoreMismatch {
  homeTeamStats: TeamStats;
  awayTeamStats: TeamStats;
  homeDiscrepancy: number;
  awayDiscrepancy: number;
  isValid: boolean;
}

export function validateInterClubScores(
  homeTeamStats: TeamStats, 
  awayTeamStats: TeamStats
): ScoreMismatch {
  // Home team's "for" should equal away team's "against" and vice versa
  const homeDiscrepancy = homeTeamStats.goalsFor - awayTeamStats.goalsAgainst;
  const awayDiscrepancy = awayTeamStats.goalsFor - homeTeamStats.goalsAgainst;

  const isValid = homeDiscrepancy === 0 && awayDiscrepancy === 0;

  return {
    homeTeamStats,
    awayTeamStats,
    homeDiscrepancy,
    awayDiscrepancy,
    isValid
  };
}

export function getReconciledScore(
  homeTeamStats: TeamStats,
  awayTeamStats: TeamStats,
  strategy: 'average' | 'home-priority' | 'away-priority' | 'higher' | 'lower' = 'home-priority'
): { homeScore: number; awayScore: number; method: string } {
  const validation = validateInterClubScores(homeTeamStats, awayTeamStats);

  if (validation.isValid) {
    return {
      homeScore: homeTeamStats.goalsFor,
      awayScore: awayTeamStats.goalsFor,
      method: 'exact-match'
    };
  }

  // Handle mismatches based on strategy
  let homeScore: number;
  let awayScore: number;
  let method: string;

  switch (strategy) {
    case 'home-priority':
      homeScore = homeTeamStats.goalsFor;
      awayScore = homeTeamStats.goalsAgainst;
      method = 'home-team-priority';
      break;

    case 'away-priority':
      homeScore = awayTeamStats.goalsAgainst;
      awayScore = awayTeamStats.goalsFor;
      method = 'away-team-priority';
      break;

    case 'higher':
      homeScore = Math.max(homeTeamStats.goalsFor, awayTeamStats.goalsAgainst);
      awayScore = Math.max(awayTeamStats.goalsFor, homeTeamStats.goalsAgainst);
      method = 'higher-value';
      break;

    case 'lower':
      homeScore = Math.min(homeTeamStats.goalsFor, awayTeamStats.goalsAgainst);
      awayScore = Math.min(awayTeamStats.goalsFor, homeTeamStats.goalsAgainst);
      method = 'lower-value';
      break;

    case 'average':
      homeScore = Math.round((homeTeamStats.goalsFor + awayTeamStats.goalsAgainst) / 2);
      awayScore = Math.round((awayTeamStats.goalsFor + homeTeamStats.goalsAgainst) / 2);
      method = 'averaged';
      break;

    default:
      homeScore = homeTeamStats.goalsFor;
      awayScore = awayTeamStats.goalsFor;
      method = 'team-perspective';
  }

  return { homeScore, awayScore, method };
}

export function getScoreDiscrepancyWarning(mismatch: ScoreMismatch): string | null {
  if (mismatch.isValid) return null;

  const homeDisc = Math.abs(mismatch.homeDiscrepancy);
  const awayDisc = Math.abs(mismatch.awayDiscrepancy);

  if (homeDisc > 0 || awayDisc > 0) {
    return `Score mismatch detected: Home team discrepancy: ${mismatch.homeDiscrepancy}, Away team discrepancy: ${mismatch.awayDiscrepancy}`;
  }

  return null;
}