/**
 * Dedicated module for handling player-season relationships
 */
import { Express, Request, Response } from 'express';
import { players, playerSeasons } from '@shared/schema';
import { db } from './db';
import { eq } from 'drizzle-orm';
import { createSuccessResponse, createErrorResponse } from './api-utils';

async function updatePlayerSeasonRelationships(req: Request, res: Response) {
  const playerId = parseInt(req.params.id, 10);
  let seasonIds = req.body.season_ids || [];

  console.log('Received seasonIds:', seasonIds);

  if (isNaN(playerId)) {
    return res.status(400).json({ message: "Invalid player ID" });
  }

  try {
    // Validate that player exists
    const player = await db.query.players.findFirst({
      where: eq(players.id, playerId)
    });
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }
    if (!Array.isArray(seasonIds)) {
      seasonIds = [seasonIds].filter(Boolean);
    }
    const processedSeasonIds = seasonIds
      .map((id: any) => typeof id === 'string' ? parseInt(id, 10) : id)
      .filter((id: number) => !isNaN(id) && id > 0);

    console.log('Processed seasonIds:', processedSeasonIds);

    const success = await updatePlayerSeasons(playerId, processedSeasonIds);
    if (success) {
      return res.json(createSuccessResponse({ 
        message: `Updated player ${playerId} seasons to ${processedSeasonIds.join(', ')}` 
      }));
    } else {
      return res.status(500).json(createErrorResponse(
        'SERVER_ERROR',
        "Failed to update player-season relationships"
      ));
    }
  } catch (error) {
    console.error(`Error updating player-season relationships for player ${playerId}:`, error);
    return res.status(500).json(createErrorResponse(
      'SERVER_ERROR',
      "Failed to update player-season relationships",
      { error: error instanceof Error ? error.message : "Unknown error" }
    ));
  }
}

async function getPlayerSeasons(req: Request, res: Response) {
  const playerId = parseInt(req.params.id, 10);
  if (isNaN(playerId)) {
    return res.status(400).json({ message: "Invalid player ID" });
  }
  try {
    const player = await db.query.players.findFirst({
      where: eq(players.id, playerId)
    });
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }
    const { pool } = await import('./db');
    const { rows } = await pool.query(
      `SELECT 
        s.id,
        s.name,
        s.start_date,
        s.end_date,
        s.is_active
      FROM seasons s
      JOIN player_seasons ps ON ps.season_id = s.id
      WHERE ps.player_id = $1
      ORDER BY s.name`,
      [playerId]
    );
    return res.json(createSuccessResponse(rows));
  } catch (error) {
    console.error(`Error fetching player seasons for player ${playerId}:`, error);
    return res.status(500).json(createErrorResponse(
      'SERVER_ERROR',
      "Failed to fetch player seasons",
      { error: error instanceof Error ? error.message : "Unknown error" }
    ));
  }
}

async function updatePlayerSeasons(playerId: number, seasonIds: number[]): Promise<boolean> {
  // Remove all existing player_seasons for this player
  await db.delete(playerSeasons).where(eq(playerSeasons.player_id, playerId));
  // Insert new associations
  if (seasonIds.length === 0) return true;
  const values = seasonIds.map(seasonId => ({ player_id: playerId, season_id: seasonId }));
  await db.insert(playerSeasons).values(values);
  return true;
}

export function registerPlayerSeasonRoutes(app: Express) {
  app.get('/api/players/:id/seasons', getPlayerSeasons);
  app.post('/api/players/:id/seasons', updatePlayerSeasonRelationships);
}