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