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