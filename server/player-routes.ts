// server/player-routes.ts
// New home for all /api/players endpoints (CRUD)
import { Express } from 'express';
import { pool } from './db';
import { storage } from './storage';
import { createSuccessResponse, createErrorResponse, ErrorCodes } from './api-response-standards';
import { insertPlayerSchema, importPlayerSchema } from '@shared/schema';
import { transformToApiFormat } from './api-utils';

export function registerPlayerRoutes(app: Express) {
  // GET /api/clubs/:clubId/players
  app.get('/api/clubs/:clubId/players', async (req, res) => {
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
  app.get('/api/players', async (req: any, res) => {
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

  // POST /api/players
  app.post('/api/players', async (req, res) => {
    try {
      const clubId = req.body.clubId || req.headers['x-current-club-id'];
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
  app.get('/api/players/:id', async (req, res) => {
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

  // PATCH /api/players/:id
  app.patch('/api/players/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const updateData = { ...req.body };
      delete updateData.seasonIds;
      // Avatar color logic omitted for brevity
      const validPlayerData = {
        displayName: updateData.display_name,
        firstName: updateData.first_name,
        lastName: updateData.last_name,
        dateOfBirth: updateData.date_of_birth,
        positionPreferences: updateData.position_preferences,
        active: updateData.active,
        avatarColor: updateData.avatar_color
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
  app.delete('/api/players/:id', async (req, res) => {
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
} 