/**
 * DEPRECATED: BYE team management is no longer needed.
 * BYE games now use away_team_id = NULL instead of special BYE teams.
 * This file is kept for reference but all functions are disabled.
 */
import { log } from './vite';

/**
 * @deprecated BYE games now use away_team_id = NULL
 */
export async function ensureByeTeamsExist(): Promise<void> {
  log("BYE team creation skipped - using null away_team_id system", "bye-teams");
}

/**
 * @deprecated BYE games now use away_team_id = NULL
 */
export async function createByeTeamsForClub(clubId: number): Promise<void> {
  log(`BYE team creation skipped for club ${clubId} - using null away_team_id system`, "bye-teams");
}

/**
 * @deprecated BYE games now use away_team_id = NULL
 */
export async function createByeTeamsForSeason(seasonId: number): Promise<void> {
  log(`BYE team creation skipped for season ${seasonId} - using null away_team_id system`, "bye-teams");
}

/**
 * @deprecated BYE games now use away_team_id = NULL
 * @returns false since no teams are BYE teams anymore
 */
export async function isByeTeam(teamId: number): Promise<boolean> {
  return false;
}