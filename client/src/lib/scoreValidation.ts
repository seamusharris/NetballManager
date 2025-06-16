import { OfficialScore } from '@shared/schema';

export function hasOfficialScores(officialScores: OfficialScore[]): boolean {
  return officialScores && officialScores.length > 0;
}

export function getOfficialGameScore(
  officialScores: OfficialScore[],
  currentTeamId: number
): { team: number; opponent: number } | null {
  if (!hasOfficialScores(officialScores)) {
    return null;
  }

  const teamTotal = officialScores
    .filter(score => score.teamId === currentTeamId)
    .reduce((sum, score) => sum + score.score, 0);

  const opponentTotal = officialScores
    .filter(score => score.teamId !== currentTeamId)
    .reduce((sum, score) => sum + score.score, 0);

  return { team: teamTotal, opponent: opponentTotal };
}

export interface TeamStats {
  teamId: number;
  goalsFor: number;
  goalsAgainst: number;
}

export interface ScoreValidationResult {
  hasDiscrepancy: boolean;
  homeTeamDiscrepancy?: number;
  awayTeamDiscrepancy?: number;
  message?: string;
}

export function validateInterClubScores(
  homeTeamStats: TeamStats,
  awayTeamStats: TeamStats
): ScoreValidationResult {
  const homeDiscrepancy = homeTeamStats.goalsFor - awayTeamStats.goalsAgainst;
  const awayDiscrepancy = awayTeamStats.goalsFor - homeTeamStats.goalsAgainst;
  
  const hasDiscrepancy = homeDiscrepancy !== 0 || awayDiscrepancy !== 0;
  
  return {
    hasDiscrepancy,
    homeTeamDiscrepancy: homeDiscrepancy,
    awayTeamDiscrepancy: awayDiscrepancy,
    message: hasDiscrepancy ? 'Score mismatch detected between team statistics' : undefined
  };
}

export function getScoreDiscrepancyWarning(validation: ScoreValidationResult): string | null {
  if (!validation.hasDiscrepancy) {
    return null;
  }
  
  return `Score mismatch detected: Home team discrepancy ${validation.homeTeamDiscrepancy}, Away team discrepancy ${validation.awayTeamDiscrepancy}`;
}

export function getReconciledScore(
  homeTeamStats: TeamStats,
  awayTeamStats: TeamStats
): { homeScore: number; awayScore: number } {
  // Use the average of both teams' reported scores as reconciled score
  const homeScore = Math.round((homeTeamStats.goalsFor + awayTeamStats.goalsAgainst) / 2);
  const awayScore = Math.round((awayTeamStats.goalsFor + homeTeamStats.goalsAgainst) / 2);
  
  return { homeScore, awayScore };
}