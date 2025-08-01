// server/player-routes.ts
// New home for all /api/players endpoints (CRUD)
import { Express, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from './unified-auth';
import { pool } from './db';
import { storage } from './storage';
import { createSuccessResponse, createErrorResponse, ErrorCodes } from './api-response-standards';
import { insertPlayerSchema, importPlayerSchema, POSITIONS, Position, players } from '@shared/schema';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { transformToApiFormat } from './api-utils';
import { calculatePlayerStats } from './utils/playerStatsService';

// Frontend-compatible schema (camelCase) for club player creation
const camelCasePlayerSchema = z.object({
  displayName: z.string().min(1, 'Display name is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().optional(),
  positionPreferences: z.array(z.enum(POSITIONS)).min(1, 'At least one position is required'),
  active: z.boolean().default(true),
});

export function registerPlayerRoutes(app: Express) {
  console.log('🚀 Registering player routes...');
  
  // GET /api/clubs/:clubId/players
  app.get('/api/clubs/:clubId/players', async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    try {
      const clubId = parseInt(req.params.clubId);
      if (!clubId || isNaN(clubId)) {
        return res.status(400).json(createErrorResponse(
          ErrorCodes.INVALID_PARAMETER,
          'Invalid club ID format'
        ));
      }
      const players = await storage.getPlayersByClub(clubId);
      res.json(createSuccessResponse(transformToApiFormat(players)));
    } catch (error) {
      res.status(500).json(createErrorResponse(
        ErrorCodes.INTERNAL_ERROR,
        'Failed to fetch players'
      ));
    }
  });

  // GET /api/players (legacy, club context from user)
  app.get('/api/players', async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    try {
      const clubId = req.user?.currentClubId;
      if (!clubId) {
        return res.status(400).json(createErrorResponse(
          ErrorCodes.INVALID_PARAMETER,
          'Club context not available'
        ));
      }
      const players = await storage.getPlayersByClub(clubId);
      res.json(createSuccessResponse(transformToApiFormat(players)));
    } catch (error) {
      res.status(500).json(createErrorResponse(
        ErrorCodes.INTERNAL_ERROR,
        'Failed to fetch players'
      ));
    }
  });

  // POST /api/clubs/:clubId/players (NEW - club-scoped player creation)
  app.post('/api/clubs/:clubId/players', async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    try {
      console.log('🎯 POST /api/clubs/:clubId/players - Request body:', JSON.stringify(req.body, null, 2));
      
      const clubId = parseInt(req.params.clubId);
      if (!clubId || isNaN(clubId)) {
        return res.status(400).json(createErrorResponse(
          ErrorCodes.INVALID_PARAMETER,
          'Invalid club ID format'
        ));
      }

      // Middleware converts camelCase to snake_case, so we validate with snake_case schema
      const parsedData = insertPlayerSchema.safeParse(req.body);
      if (!parsedData.success) {
        console.log('🚨 Validation failed:', JSON.stringify(parsedData.error.errors, null, 2));
        return res.status(400).json(createErrorResponse(
          ErrorCodes.VALIDATION_ERROR,
          'Invalid player data',
          parsedData.error.errors
        ));
      }

      // Data is already in snake_case format for storage layer
      const playerData = parsedData.data;

      // Create the player using storage layer
      const player = await storage.createPlayer(playerData);
      
      // Associate with club
      if (player.id) {
        try {
          await storage.addPlayerToClub(player.id, clubId);
          console.log(`Associated player ${player.id} with club ${clubId}`);
        } catch (clubError) {
          console.error(`Club association failed:`, clubError);
          // Don't fail the player creation if club association fails
        }
      }

      const responseData = transformToApiFormat(player, `/api/clubs/${clubId}/players`);
      res.status(201).json(createSuccessResponse(responseData));
    } catch (error) {
      res.status(500).json(createErrorResponse(
        ErrorCodes.INTERNAL_ERROR,
        'Failed to create player',
        error instanceof Error ? error.message : String(error)
      ));
    }
  });

  // PATCH /api/clubs/:clubId/players/:id (NEW - club-scoped player update)
  app.patch('/api/clubs/:clubId/players/:id', async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    try {
      console.log('🔄 CLUB PATCH ENDPOINT HIT!', { clubId: req.params.clubId, playerId: req.params.id, body: req.body });
      
      const clubId = parseInt(req.params.clubId);
      const playerId = parseInt(req.params.id);
      
      if (!clubId || isNaN(clubId)) {
        return res.status(400).json(createErrorResponse(
          ErrorCodes.INVALID_PARAMETER,
          'Invalid club ID format'
        ));
      }
      
      if (!playerId || isNaN(playerId)) {
        return res.status(400).json(createErrorResponse(
          ErrorCodes.INVALID_PARAMETER,
          'Invalid player ID format'
        ));
      }

      // Middleware converts camelCase to snake_case, so we validate with snake_case schema
      // Create base schema from table for partial updates
      const basePlayerSchema = createInsertSchema(players).omit({ id: true });
      const parsedData = basePlayerSchema.partial().safeParse(req.body);
      if (!parsedData.success) {
        console.log('🚨 Update validation failed:', JSON.stringify(parsedData.error.errors, null, 2));
        return res.status(400).json(createErrorResponse(
          ErrorCodes.VALIDATION_ERROR,
          'Invalid player data',
          parsedData.error.errors
        ));
      }

      // Data is already in snake_case format for storage layer
      const playerData: any = {};
      if (parsedData.data.display_name !== undefined) playerData.display_name = parsedData.data.display_name;
      if (parsedData.data.first_name !== undefined) playerData.first_name = parsedData.data.first_name;
      if (parsedData.data.last_name !== undefined) playerData.last_name = parsedData.data.last_name;
      if (parsedData.data.date_of_birth !== undefined) playerData.date_of_birth = parsedData.data.date_of_birth;
      if (parsedData.data.position_preferences !== undefined) playerData.position_preferences = parsedData.data.position_preferences;
      if (parsedData.data.active !== undefined) playerData.active = parsedData.data.active;

      // Update the player using storage layer
      const updatedPlayer = await storage.updatePlayer(playerId, playerData);
      if (!updatedPlayer) {
        return res.status(404).json(createErrorResponse(
          ErrorCodes.RESOURCE_NOT_FOUND,
          'Player not found'
        ));
      }

      const responseData = transformToApiFormat(updatedPlayer, `/api/clubs/${clubId}/players`);
      res.json(createSuccessResponse(responseData));
    } catch (error) {
      res.status(500).json(createErrorResponse(
        ErrorCodes.INTERNAL_ERROR,
        'Failed to update player',
        error instanceof Error ? error.message : String(error)
      ));
    }
  });

  // DELETE /api/clubs/:clubId/players/:id (NEW - club-scoped player deletion)
  app.delete('/api/clubs/:clubId/players/:id', async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    try {
      console.log('🗑️ DELETE /api/clubs/:clubId/players/:id - Request:', { clubId: req.params.clubId, playerId: req.params.id });
      
      const clubId = parseInt(req.params.clubId);
      const playerId = parseInt(req.params.id);
      
      if (!clubId || isNaN(clubId)) {
        return res.status(400).json(createErrorResponse(
          ErrorCodes.INVALID_PARAMETER,
          'Invalid club ID format'
        ));
      }
      
      if (!playerId || isNaN(playerId)) {
        return res.status(400).json(createErrorResponse(
          ErrorCodes.INVALID_PARAMETER,
          'Invalid player ID format'
        ));
      }

      // Verify player exists and belongs to this club
      const players = await storage.getPlayersByClub(clubId);
      const playerExists = players.some(p => p.id === playerId);
      
      if (!playerExists) {
        return res.status(404).json(createErrorResponse(
          ErrorCodes.RESOURCE_NOT_FOUND,
          'Player not found in this club'
        ));
      }

      // Delete the player
      const success = await storage.deletePlayer(playerId);
      if (!success) {
        return res.status(404).json(createErrorResponse(
          ErrorCodes.RESOURCE_NOT_FOUND,
          'Player not found'
        ));
      }

      const responseData = { success: true, message: 'Player deleted successfully' };
      res.json(createSuccessResponse(responseData));
    } catch (error) {
      res.status(500).json(createErrorResponse(
        ErrorCodes.INTERNAL_ERROR,
        'Failed to delete player',
        error instanceof Error ? error.message : String(error)
      ));
    }
  });

  // POST /api/players
  app.post('/api/players', async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    try {
      console.log('🔍 POST /api/players - Request body:', JSON.stringify(req.body, null, 2));
      console.log('🔍 POST /api/players - Headers club-id:', req.headers['x-current-club-id']);
      
      const clubId = req.body.clubId || req.headers['x-current-club-id'];
      console.log('🔍 POST /api/players - Resolved clubId:', clubId);
      
      if (!clubId) {
        return res.status(400).json(createErrorResponse(
          ErrorCodes.INVALID_PARAMETER,
          'Club context required'
        ));
      }
      const numericClubId = typeof clubId === 'string' ? parseInt(clubId, 10) : clubId;
      if (isNaN(numericClubId)) {
        return res.status(400).json(createErrorResponse(
          ErrorCodes.INVALID_PARAMETER,
          'Invalid club ID format'
        ));
      }
      const hasId = req.body.id !== undefined;
      const schema = hasId ? importPlayerSchema : insertPlayerSchema;
      const { clubId: _, teamId: __, ...playerDataForValidation } = req.body;
      const parsedData = schema.safeParse(playerDataForValidation);
      if (!parsedData.success) {
        return res.status(400).json(createErrorResponse(
          ErrorCodes.VALIDATION_ERROR,
          'Invalid player data',
          parsedData.error.errors
        ));
      }
      const player = await storage.createPlayer(parsedData.data);
      if (player.id && numericClubId) {
        try {
          await storage.addPlayerToClub(player.id, numericClubId);
        } catch (clubError) {
          // Don't fail the player creation if club association fails
        }
      }
      const responseData = transformToApiFormat(player, '/api/players');
      res.status(201).json(createSuccessResponse(responseData));
    } catch (error) {
      res.status(500).json(createErrorResponse(
        ErrorCodes.INTERNAL_ERROR,
        'Failed to create player',
        error instanceof Error ? error.message : String(error)
      ));
    }
  });

  // GET /api/players/:id
  app.get('/api/players/:id', async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    try {
      const player = await storage.getPlayer(Number(req.params.id));
      if (!player) {
        return res.status(404).json(createErrorResponse(
          ErrorCodes.RESOURCE_NOT_FOUND,
          'Player not found'
        ));
      }
      res.json(createSuccessResponse(transformToApiFormat(player)));
    } catch (error) {
      res.status(500).json(createErrorResponse(
        ErrorCodes.INTERNAL_ERROR,
        'Failed to fetch player'
      ));
    }
  });

  // GET /api/players/:id/stats - Aggregated player stats with breakdowns
  app.get('/api/players/:id/stats', async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const playerId = parseInt(req.params.id, 10);
    const allowedGroups = ['season', 'team', 'club'] as const;
    let groupBy = req.query.groupBy ? String(req.query.groupBy).split(',') : [];
    groupBy = groupBy.filter(g => allowedGroups.includes(g as any));
    try {
      const stats = await calculatePlayerStats(playerId, { groupBy: groupBy as ('season' | 'team' | 'club')[] });
      res.json(stats);
    } catch (error) {
      console.error('Error calculating player stats:', error);
      res.status(500).json({ message: 'Failed to calculate player stats' });
    }
  });

  // PATCH /api/players/:id
  app.patch('/api/players/:id', async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const updateData = { ...req.body };
      delete updateData.seasonIds;
      
      // Middleware has converted camelCase to snake_case, use converted fields directly
      const validPlayerData = {
        display_name: updateData.display_name,
        first_name: updateData.first_name,
        last_name: updateData.last_name,
        date_of_birth: updateData.date_of_birth,
        position_preferences: updateData.position_preferences,
        active: updateData.active,
        avatar_color: updateData.avatar_color
      };
      const updatedPlayer = await storage.updatePlayer(id, validPlayerData);
      if (!updatedPlayer) {
        return res.status(404).json(createErrorResponse(
          ErrorCodes.RESOURCE_NOT_FOUND,
          'Player not found'
        ));
      }
      res.json(createSuccessResponse(transformToApiFormat(updatedPlayer)));
    } catch (error) {
      res.status(500).json(createErrorResponse(
        ErrorCodes.INTERNAL_ERROR,
        'Failed to update player'
      ));
    }
  });

  // DELETE /api/players/:id
  app.delete('/api/players/:id', async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.deletePlayer(id);
      if (!success) {
        return res.status(404).json(createErrorResponse(
          ErrorCodes.RESOURCE_NOT_FOUND,
          'Player not found'
        ));
      }
      res.json(createSuccessResponse({ success: true, message: 'Player deleted successfully' }));
    } catch (error) {
      res.status(500).json(createErrorResponse(
        ErrorCodes.INTERNAL_ERROR,
        'Failed to delete player'
      ));
    }
  });

  // GET /api/players/:playerId/clubs - Get clubs for a player
  app.get('/api/players/:playerId/clubs', async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    console.log('🔍 GET /api/players/:playerId/clubs endpoint hit!', {
      playerId: req.params.playerId,
      url: req.url,
      method: req.method
    });
    
    try {
      const playerId = parseInt(req.params.playerId);
      
      if (isNaN(playerId)) {
        return res.status(400).json(createErrorResponse(ErrorCodes.INVALID_PARAMETER, 'Invalid player ID'));
      }
      
      // Verify player exists
      const player = await storage.getPlayer(playerId);
      if (!player) {
        return res.status(404).json(createErrorResponse(ErrorCodes.RESOURCE_NOT_FOUND, 'Player not found'));
      }
      
      // Get player clubs
      const clubs = await storage.getPlayerClubs(playerId);
      
      return res.json(createSuccessResponse(transformToApiFormat(clubs)));
    } catch (error) {
      console.error('Error fetching player clubs:', error);
      return res.status(500).json(createErrorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch player clubs'));
    }
  });

  // GET /api/players/:playerId/teams - Get teams for a player
  app.get('/api/players/:playerId/teams', async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    console.log('🔍 GET /api/players/:playerId/teams endpoint hit!', {
      playerId: req.params.playerId,
      url: req.url,
      method: req.method
    });
    
    try {
      const playerId = parseInt(req.params.playerId);
      
      if (isNaN(playerId)) {
        return res.status(400).json(createErrorResponse(ErrorCodes.INVALID_PARAMETER, 'Invalid player ID'));
      }
      
      // Verify player exists
      const player = await storage.getPlayer(playerId);
      if (!player) {
        return res.status(404).json(createErrorResponse(ErrorCodes.RESOURCE_NOT_FOUND, 'Player not found'));
      }
      
      // Get player teams using SQL query
      const result = await pool.query(`
        SELECT t.*, s.name as season_name, c.name as club_name, d.display_name as division
        FROM team_players tp
        JOIN teams t ON tp.team_id = t.id
        JOIN seasons s ON t.season_id = s.id
        JOIN clubs c ON t.club_id = c.id
        LEFT JOIN divisions d ON t.division_id = d.id
        WHERE tp.player_id = $1
        ORDER BY s.name, t.name
      `, [playerId]);
      
      const teams = result.rows.map(row => ({
        id: row.id,
        name: row.name,
        division: row.division || 'No Division',
        clubId: row.club_id,
        seasonId: row.season_id,
        seasonName: row.season_name,
        clubName: row.club_name
      }));
      
      return res.json(createSuccessResponse(teams));
    } catch (error) {
      console.error('Error fetching player teams:', error);
      return res.status(500).json(createErrorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch player teams'));
    }
  });

  // POST /api/players/:playerId/teams - Update teams for a player
  app.post('/api/players/:playerId/teams', async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    console.log('🔥 POST /api/players/:playerId/teams endpoint hit!', {
      playerId: req.params.playerId,
      body: req.body,
      url: req.url,
      method: req.method
    });
    
    try {
      const playerId = parseInt(req.params.playerId);
      const { team_ids } = req.body; // Note: expecting snake_case after middleware conversion
      
      console.log('🔍 Detailed request analysis:', {
        playerId,
        'req.body': req.body,
        'team_ids': team_ids,
        'team_ids type': typeof team_ids,
        'is array': Array.isArray(team_ids),
        'body keys': Object.keys(req.body || {})
      });
      
      if (isNaN(playerId)) {
        return res.status(400).json(createErrorResponse(ErrorCodes.INVALID_PARAMETER, 'Invalid player ID'));
      }
      
      if (!Array.isArray(team_ids)) {
        console.log('❌ team_ids validation failed:', { team_ids, type: typeof team_ids });
        return res.status(400).json(createErrorResponse(ErrorCodes.INVALID_PARAMETER, 'teamIds must be an array'));
      }
      
      // Verify player exists
      const player = await storage.getPlayer(playerId);
      if (!player) {
        return res.status(404).json(createErrorResponse(ErrorCodes.RESOURCE_NOT_FOUND, 'Player not found'));
      }
      
      // Get current team associations
      const currentResult = await pool.query(`
        SELECT team_id FROM team_players WHERE player_id = $1
      `, [playerId]);
      const currentTeamIds = currentResult.rows.map(row => row.team_id);
      
      // Find teams to add and remove
      const teamsToAdd = team_ids.filter(teamId => !currentTeamIds.includes(teamId));
      const teamsToRemove = currentTeamIds.filter(teamId => !team_ids.includes(teamId));
      
      let teamsAdded = 0;
      let teamsRemoved = 0;
      
      // Add player to new teams
      for (const teamId of teamsToAdd) {
        try {
          await pool.query(`
            INSERT INTO team_players (team_id, player_id, is_regular)
            VALUES ($1, $2, true)
            ON CONFLICT (team_id, player_id) DO NOTHING
          `, [teamId, playerId]);
          teamsAdded++;
        } catch (error) {
          console.error(`Error adding player ${playerId} to team ${teamId}:`, error);
        }
      }
      
      // Remove player from teams
      for (const teamId of teamsToRemove) {
        try {
          await pool.query(`
            DELETE FROM team_players 
            WHERE team_id = $1 AND player_id = $2
          `, [teamId, playerId]);
          teamsRemoved++;
        } catch (error) {
          console.error(`Error removing player ${playerId} from team ${teamId}:`, error);
        }
      }
      
      // Build a natural message
      let message = 'Player teams updated successfully.';
      if (teamsAdded > 0 && teamsRemoved > 0) {
        message += ` ${teamsAdded} ${teamsAdded === 1 ? 'team' : 'teams'} added, ${teamsRemoved} ${teamsRemoved === 1 ? 'team' : 'teams'} removed.`;
      } else if (teamsAdded > 0) {
        message += ` ${teamsAdded} ${teamsAdded === 1 ? 'team' : 'teams'} added.`;
      } else if (teamsRemoved > 0) {
        message += ` ${teamsRemoved} ${teamsRemoved === 1 ? 'team' : 'teams'} removed.`;
      }

      res.json(createSuccessResponse({
        message,
        teamsAdded,
        teamsRemoved,
        totalTeams: team_ids.length
      }));
    } catch (error) {
      console.error('Error updating player teams:', error);
      res.status(500).json(createErrorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to update player teams'));
    }
  });

  // GET /api/players/:id/games - Get games for a player
  app.get('/api/players/:id/games', async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    try {
      const playerId = parseInt(req.params.id);
      
      if (isNaN(playerId)) {
        return res.status(400).json(createErrorResponse(ErrorCodes.INVALID_PARAMETER, 'Invalid player ID'));
      }
      
      // Verify player exists
      const player = await storage.getPlayer(playerId);
      if (!player) {
        return res.status(404).json(createErrorResponse(ErrorCodes.RESOURCE_NOT_FOUND, 'Player not found'));
      }
      
      // Get games where player was in roster
      const result = await pool.query(`
        SELECT DISTINCT 
          g.id,
          g.date,
          g.time,
          ht.name as home_team_name,
          at.name as away_team_name,
          CASE 
            WHEN tp.team_id = g.home_team_id THEN ht.name 
            ELSE at.name 
          END as team_name,
          CASE 
            WHEN tp.team_id = g.home_team_id THEN at.name 
            ELSE ht.name 
          END as opponent_name,
          COALESCE(gs_home.score, 0) as home_score,
          COALESCE(gs_away.score, 0) as away_score,
          CASE 
            WHEN tp.team_id = g.home_team_id THEN COALESCE(gs_home.score, 0)
            ELSE COALESCE(gs_away.score, 0)
          END as team_score,
          CASE 
            WHEN tp.team_id = g.home_team_id THEN COALESCE(gs_away.score, 0)
            ELSE COALESCE(gs_home.score, 0)
          END as opponent_score,
          s.name as season_name,
          c.name as club_name
        FROM rosters r
        JOIN games g ON r.game_id = g.id
        JOIN team_players tp ON tp.player_id = r.player_id
        JOIN teams ht ON g.home_team_id = ht.id
        JOIN teams at ON g.away_team_id = at.id
        JOIN seasons s ON ht.season_id = s.id
        JOIN clubs c ON ht.club_id = c.id
        LEFT JOIN game_scores gs_home ON g.id = gs_home.game_id AND g.home_team_id = gs_home.team_id
        LEFT JOIN game_scores gs_away ON g.id = gs_away.game_id AND g.away_team_id = gs_away.team_id
        WHERE r.player_id = $1
          AND (tp.team_id = g.home_team_id OR tp.team_id = g.away_team_id)
        ORDER BY g.date DESC, g.time DESC
      `, [playerId]);
      
      const games = result.rows.map(row => ({
        id: row.id,
        date: row.date,
        time: row.time,
        teamName: row.team_name,
        opponentName: row.opponent_name,
        teamScore: row.team_score,
        opponentScore: row.opponent_score,
        homeScore: row.home_score,
        awayScore: row.away_score,
        seasonName: row.season_name,
        clubName: row.club_name,
        result: row.team_score > row.opponent_score ? 'Win' : 
                row.team_score < row.opponent_score ? 'Loss' : 'Draw'
      }));
      
      return res.json(createSuccessResponse(transformToApiFormat(games)));
    } catch (error) {
      console.error('Error fetching player games:', error);
      return res.status(500).json(createErrorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch player games'));
    }
  });

  // POST /api/players/:playerId/clubs - Update clubs for a player
  app.post('/api/players/:playerId/clubs', async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    console.log('🔥 POST /api/players/:playerId/clubs endpoint hit!', {
      playerId: req.params.playerId,
      body: req.body,
      url: req.url,
      method: req.method
    });
    
    try {
      const playerId = parseInt(req.params.playerId);
      const { club_ids } = req.body; // Note: expecting snake_case after middleware conversion

      console.log('🔍 Detailed clubs request analysis:', {
        playerId,
        'req.body': req.body,
        'club_ids': club_ids,
        'club_ids type': typeof club_ids,
        'is array': Array.isArray(club_ids),
        'body keys': Object.keys(req.body || {})
      });

      if (isNaN(playerId)) {
        return res.status(400).json(createErrorResponse(ErrorCodes.INVALID_PARAMETER, 'Invalid player ID'));
      }

      if (!Array.isArray(club_ids)) {
        console.log('❌ club_ids validation failed:', { club_ids, type: typeof club_ids });
        return res.status(400).json(createErrorResponse(ErrorCodes.INVALID_PARAMETER, 'clubIds must be an array'));
      }

      // Verify player exists
      const player = await storage.getPlayer(playerId);
      if (!player) {
        return res.status(404).json(createErrorResponse(ErrorCodes.RESOURCE_NOT_FOUND, 'Player not found'));
      }

      // Get current club associations
      const currentClubs = await storage.getPlayerClubs(playerId);
      const currentClubIds = currentClubs.map(club => club.id);

      // Find clubs to add and remove
      const clubsToAdd = club_ids.filter(clubId => !currentClubIds.includes(clubId));
      const clubsToRemove = currentClubIds.filter(clubId => !club_ids.includes(clubId));

      let clubsAdded = 0;
      let clubsRemoved = 0;

      // Add player to new clubs
      for (const clubId of clubsToAdd) {
        try {
          await pool.query(`
            INSERT INTO club_players (club_id, player_id)
            VALUES ($1, $2)
            ON CONFLICT (club_id, player_id) DO NOTHING
          `, [clubId, playerId]);
          clubsAdded++;
        } catch (error) {
          console.error(`Error adding player ${playerId} to club ${clubId}:`, error);
        }
      }

      // Remove player from clubs
      for (const clubId of clubsToRemove) {
        try {
          await pool.query(`
            DELETE FROM club_players 
            WHERE club_id = $1 AND player_id = $2
          `, [clubId, playerId]);
          clubsRemoved++;
        } catch (error) {
          console.error(`Error removing player ${playerId} from club ${clubId}:`, error);
        }
      }

      // Build a natural message
      let message = 'Player clubs updated successfully.';
      if (clubsAdded > 0 && clubsRemoved > 0) {
        message += ` ${clubsAdded} ${clubsAdded === 1 ? 'club' : 'clubs'} added, ${clubsRemoved} ${clubsRemoved === 1 ? 'club' : 'clubs'} removed.`;
      } else if (clubsAdded > 0) {
        message += ` ${clubsAdded} ${clubsAdded === 1 ? 'club' : 'clubs'} added.`;
      } else if (clubsRemoved > 0) {
        message += ` ${clubsRemoved} ${clubsRemoved === 1 ? 'club' : 'clubs'} removed.`;
      }

      res.json(createSuccessResponse({
        message,
        clubsAdded,
        clubsRemoved,
        totalClubs: club_ids.length
      }));
    } catch (error) {
      console.error('Error updating player clubs:', error);
      res.status(500).json(createErrorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to update player clubs'));
    }
  });
} 