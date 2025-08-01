// server/club-routes.ts
// New home for all /api/clubs endpoints (CRUD)
import { Express } from 'express';
import { db, pool } from './db';
import { createSuccessResponse, createErrorResponse, ErrorCodes } from './api-response-standards';

export function registerClubRoutes(app: Express) {
  // Get all clubs with statistics
  app.get('/api/clubs', async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT 
          c.*,
          COUNT(DISTINCT cp.player_id) as players_count,
          COUNT(DISTINCT t.id) as teams_count
        FROM clubs c
        LEFT JOIN club_players cp ON c.id = cp.club_id AND cp.is_active = true
        LEFT JOIN teams t ON c.id = t.club_id AND t.is_active = true
        GROUP BY c.id, c.name, c.code, c.address, c.contact_email, c.contact_phone, c.primary_color, c.secondary_color, c.is_active, c.created_at, c.updated_at
        ORDER BY c.name`
      );
      const clubs = result.rows.map(row => ({
        id: row.id,
        name: row.name,
        code: row.code,
        address: row.address,
        contactEmail: row.contact_email,
        contactPhone: row.contact_phone,
        logoUrl: row.logo_url,
        primaryColor: row.primary_color,
        secondaryColor: row.secondary_color,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        playersCount: parseInt(row.players_count) || 0,
        teamsCount: parseInt(row.teams_count) || 0
      }));
      res.json(createSuccessResponse(clubs));
    } catch (error) {
      console.error('Error fetching clubs:', error);
      res.status(500).json(createErrorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch clubs'));
    }
  });

  // Club details endpoint
  app.get('/api/clubs/:clubId', async (req, res) => {
    try {
      const clubId = parseInt(req.params.clubId);
      if (isNaN(clubId)) {
        return res.status(400).json(createErrorResponse(ErrorCodes.INVALID_PARAMETER, 'Invalid club ID format'));
      }
      const result = await pool.query('SELECT * FROM clubs WHERE id = $1', [clubId]);
      if (result.rows.length === 0) {
        return res.status(404).json(createErrorResponse(ErrorCodes.RESOURCE_NOT_FOUND, 'Club not found'));
      }
      const club = result.rows[0];
      const clubData = {
        id: club.id,
        name: club.name,
        code: club.code,
        address: club.address,
        contactEmail: club.contact_email,
        contactPhone: club.contact_phone,
        logoUrl: club.logo_url,
        primaryColor: club.primary_color,
        secondaryColor: club.secondary_color,
        isActive: club.is_active,
        createdAt: club.created_at,
        updatedAt: club.updated_at
      };
      res.json(createSuccessResponse(clubData));
    } catch (error) {
      console.error('Error fetching club details:', error);
      res.status(500).json(createErrorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch club details'));
    }
  });

  // Create club
  app.post('/api/clubs', async (req, res) => {
    try {
      const { name, code, description, address, contactEmail, contactPhone, primaryColor = '#1f2937', secondaryColor = '#ffffff' } = req.body;
      if (!name || !code) {
        return res.status(400).json(createErrorResponse(ErrorCodes.INVALID_PARAMETER, 'Name and code are required'));
      }
      const codeCheck = await pool.query(
        'SELECT id FROM clubs WHERE UPPER(code) = UPPER($1)',
        [code]
      );
      if (codeCheck.rowCount > 0) {
        return res.status(409).json(createErrorResponse(ErrorCodes.INVALID_REQUEST, 'Club code already exists'));
      }
      const result = await pool.query(`
        INSERT INTO clubs (name, code, description, address, contact_email, contact_phone, primary_color, secondary_color)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, name, code, description, address, contact_email, contact_phone, primary_color, secondary_color, is_active, created_at, updated_at
      `, [name, code.toUpperCase(), description, address, contactEmail, contactPhone, primaryColor, secondaryColor]);
      const club = result.rows[0];
      res.status(201).json(createSuccessResponse({
        id: club.id,
        name: club.name,
        code: club.code,
        description: club.description,
        address: club.address,
        contactEmail: club.contact_email,
        contactPhone: club.contact_phone,
        primaryColor: club.primary_color,
        secondaryColor: club.secondary_color,
        isActive: club.is_active,
        createdAt: club.created_at,
        updatedAt: club.updated_at
      }));
    } catch (error) {
      console.error('Error creating club:', error);
      res.status(500).json(createErrorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to create club'));
    }
  });

  // Update club
  app.patch('/api/clubs/:id', async (req, res) => {
    try {
      const clubId = parseInt(req.params.id, 10);
      const { name, code, description, address, contactEmail, contactPhone, primaryColor, secondaryColor } = req.body;
      if (isNaN(clubId)) {
        return res.status(400).json(createErrorResponse(ErrorCodes.INVALID_PARAMETER, 'Invalid club ID'));
      }
      if (!name || !code) {
        return res.status(400).json(createErrorResponse(ErrorCodes.INVALID_PARAMETER, 'Name and code are required'));
      }
      const clubCheck = await pool.query('SELECT id FROM clubs WHERE id = $1', [clubId]);
      if (clubCheck.rowCount === 0) {
        return res.status(404).json(createErrorResponse(ErrorCodes.RESOURCE_NOT_FOUND, 'Club not found'));
      }
      const codeCheck = await pool.query(
        'SELECT id FROM clubs WHERE UPPER(code) = UPPER($1) AND id != $2',
        [code, clubId]
      );
      if (codeCheck.rowCount > 0) {
        return res.status(409).json(createErrorResponse(ErrorCodes.INVALID_REQUEST, 'Club code already exists'));
      }
      const result = await pool.query(`
        UPDATE clubs 
        SET name = $1, code = $2, description = $3, address = $4, 
            contact_email = $5, contact_phone = $6, primary_color = $7, secondary_color = $8
        WHERE id = $9
        RETURNING id, name, code, description, address, contact_email, contact_phone, primary_color, secondary_color, is_active, created_at, updated_at
      `, [name, code.toUpperCase(), description, address, contactEmail, contactPhone, primaryColor, secondaryColor, clubId]);
      const club = result.rows[0];
      res.json(createSuccessResponse({
        id: club.id,
        name: club.name,
        code: club.code,
        description: club.description,
        address: club.address,
        contactEmail: club.contact_email,
        contactPhone: club.contact_phone,
        primaryColor: club.primary_color,
        secondaryColor: club.secondary_color,
        isActive: club.is_active,
        createdAt: club.created_at,
        updatedAt: club.updated_at
      }));
    } catch (error) {
      console.error('Error updating club:', error);
      res.status(500).json(createErrorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to update club'));
    }
  });

  // GET /api/clubs/:clubId/players - Get players in a club
  app.get('/api/clubs/:clubId/players', async (req, res) => {
    try {
      const clubId = parseInt(req.params.clubId);
      
      if (isNaN(clubId)) {
        return res.status(400).json(createErrorResponse(ErrorCodes.INVALID_PARAMETER, 'Invalid club ID'));
      }
      
      // Verify club exists
      const clubCheck = await pool.query('SELECT id FROM clubs WHERE id = $1', [clubId]);
      if (clubCheck.rowCount === 0) {
        return res.status(404).json(createErrorResponse(ErrorCodes.RESOURCE_NOT_FOUND, 'Club not found'));
      }
      
      // Get club players
      const result = await pool.query(`
        SELECT p.*, cp.joined_date, cp.notes
        FROM club_players cp
        JOIN players p ON cp.player_id = p.id
        WHERE cp.club_id = $1
        ORDER BY p.first_name, p.last_name
      `, [clubId]);
      
      const players = result.rows.map(row => ({
        id: row.id,
        displayName: row.display_name,
        firstName: row.first_name,
        lastName: row.last_name,
        dateOfBirth: row.date_of_birth,
        positionPreferences: row.position_preferences,
        active: row.active,
        avatarColor: row.avatar_color,
        joinedDate: row.joined_date,
        notes: row.notes
      }));
      
      return res.json(createSuccessResponse(players));
    } catch (error) {
      console.error('Error fetching club players:', error);
      return res.status(500).json(createErrorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch club players'));
    }
  });

  // POST /api/clubs/:clubId/players/assign - Add existing players to a club
  app.post('/api/clubs/:clubId/players/assign', async (req, res) => {
    try {
      const clubId = parseInt(req.params.clubId);
      const { player_ids } = req.body; // Expect snake_case after middleware conversion
      
      if (isNaN(clubId)) {
        return res.status(400).json(createErrorResponse(ErrorCodes.INVALID_PARAMETER, 'Invalid club ID'));
      }
      
      if (!Array.isArray(player_ids)) {
        return res.status(400).json(createErrorResponse(ErrorCodes.INVALID_PARAMETER, 'playerIds must be an array'));
      }
      
      // Verify club exists
      const clubCheck = await pool.query('SELECT id FROM clubs WHERE id = $1', [clubId]);
      if (clubCheck.rowCount === 0) {
        return res.status(404).json(createErrorResponse(ErrorCodes.RESOURCE_NOT_FOUND, 'Club not found'));
      }
      
      // Get current player associations for this club
      const currentPlayersResult = await pool.query(`
        SELECT player_id FROM club_players 
        WHERE club_id = $1
      `, [clubId]);
      const currentPlayerIds = currentPlayersResult.rows.map(row => row.player_id);

      // Find players to add and remove
      const playersToAdd = player_ids.filter(playerId => !currentPlayerIds.includes(playerId));
      const playersToRemove = currentPlayerIds.filter(playerId => !player_ids.includes(playerId));

      let playersAdded = 0;
      let playersRemoved = 0;

      // Add new players to club
      for (const playerId of playersToAdd) {
        try {
          await pool.query(`
            INSERT INTO club_players (club_id, player_id)
            VALUES ($1, $2)
            ON CONFLICT (club_id, player_id) DO NOTHING
          `, [clubId, playerId]);
          playersAdded++;
        } catch (error) {
          console.error(`Error adding player ${playerId} to club ${clubId}:`, error);
        }
      }

      // Remove players from club
      for (const playerId of playersToRemove) {
        try {
          await pool.query(`
            DELETE FROM club_players 
            WHERE club_id = $1 AND player_id = $2
          `, [clubId, playerId]);
          playersRemoved++;
        } catch (error) {
          console.error(`Error removing player ${playerId} from club ${clubId}:`, error);
        }
      }
      
            // Build a natural message
      let message = `Club ${clubId} successfully updated.`;
      if (playersAdded > 0 && playersRemoved > 0) {
        message += ` ${playersAdded} ${playersAdded === 1 ? 'player' : 'players'} added, ${playersRemoved} ${playersRemoved === 1 ? 'player' : 'players'} removed.`;
      } else if (playersAdded > 0) {
        message += ` ${playersAdded} ${playersAdded === 1 ? 'player' : 'players'} added.`;
      } else if (playersRemoved > 0) {
        message += ` ${playersRemoved} ${playersRemoved === 1 ? 'player' : 'players'} removed.`;
      }

      return res.json(createSuccessResponse({
        message,
        playersAdded,
        playersRemoved,
        totalPlayers: player_ids.length
      }));
    } catch (error) {
      console.error('Error updating club players:', error);
      return res.status(500).json(createErrorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to update club players'));
    }
  });

  // Delete club
  app.delete('/api/clubs/:id', async (req, res) => {
    try {
      const clubId = parseInt(req.params.id, 10);
      if (isNaN(clubId)) {
        return res.status(400).json(createErrorResponse(ErrorCodes.INVALID_PARAMETER, 'Invalid club ID'));
      }
      const playersCheck = await pool.query(
        'SELECT COUNT(*) as count FROM club_players WHERE club_id = $1 AND is_active = true',
        [clubId]
      );
      if (parseInt(playersCheck.rows[0].count) > 0) {
        return res.status(400).json(createErrorResponse(ErrorCodes.INVALID_REQUEST, 'Cannot delete club with active players. Please remove all players first.'));
      }
      const result = await pool.query('DELETE FROM clubs WHERE id = $1', [clubId]);
      if (result.rowCount === 0) {
        return res.status(404).json(createErrorResponse(ErrorCodes.RESOURCE_NOT_FOUND, 'Club not found'));
      }
      res.json(createSuccessResponse({ success: true, message: 'Club deleted successfully' }));
    } catch (error) {
      console.error('Error deleting club:', error);
      res.status(500).json(createErrorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to delete club'));
    }
  });
} 