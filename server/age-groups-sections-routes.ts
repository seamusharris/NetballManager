import type { Express } from "express";
import { sql, eq, and, desc } from "drizzle-orm";
import { db, pool } from "./db";
import { 
  ageGroups, 
  divisions, 
  teams,
  insertAgeGroupSchema,
  insertDivisionSchema
} from "@shared/schema";
import { AuthenticatedRequest, standardAuth } from "./auth-middleware";
import express from "express";
import { createSuccessResponse, createErrorResponse } from "./api-utils";

export function registerAgeGroupsSectionsRoutes(app: Express) {
  console.log("🔧 Registering age groups sections routes...");
  
  
  // ===== AGE GROUPS ENDPOINTS =====
  
  // Get all age groups
  app.get("/api/age-groups", standardAuth(), async (req: AuthenticatedRequest, res) => {
    try {
      const result = await db.execute(sql`
        SELECT 
          ag.*,
          COUNT(DISTINCT d.id) as division_count
        FROM age_groups ag
        LEFT JOIN divisions d ON ag.id = d.age_group_id AND d.is_active = true
        WHERE ag.is_active = true
        GROUP BY ag.id
        ORDER BY ag.name
      `);

      const ageGroupsWithCounts = result.rows.map(row => ({
        id: row.id as number,
        name: row.name as string,
        displayName: row.display_name as string,
        isActive: row.is_active as boolean,
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string,
        divisionCount: parseInt(row.division_count as string) || 0
      }));

      res.status(200).json(createSuccessResponse(ageGroupsWithCounts, { count: ageGroupsWithCounts.length }));
    } catch (error) {
      console.error("Error fetching age groups:", error);
      res.status(500).json(createErrorResponse("internal_server_error", "Failed to fetch age groups"));
    }
  });

  // Create a new age group
  app.post("/api/age-groups", standardAuth(), async (req: AuthenticatedRequest, res) => {
    try {
      const parsedData = insertAgeGroupSchema.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json(createErrorResponse("invalid_input", "Invalid age group data", parsedData.error.errors));
      }

      const result = await db.insert(ageGroups).values(parsedData.data as any).returning();
      res.status(201).json(createSuccessResponse(result[0], { count: 1 }));
    } catch (error) {
      console.error("Error creating age group:", error);
      if (error.message?.includes("duplicate key")) {
        res.status(400).json(createErrorResponse("duplicate_entry", "An age group with this name already exists"));
      } else {
        res.status(500).json(createErrorResponse("internal_server_error", "Failed to create age group"));
      }
    }
  });

  // Update an age group
  app.patch("/api/age-groups/:id", standardAuth(), async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json(createErrorResponse("invalid_input", "Invalid age group ID"));
      }

      const result = await db
        .update(ageGroups)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(ageGroups.id, id))
        .returning();

      if (result.length === 0) {
        return res.status(404).json(createErrorResponse("not_found", "Age group not found"));
      }

      res.status(200).json(createSuccessResponse(result[0], { count: 1 }));
    } catch (error) {
      console.error("Error updating age group:", error);
      res.status(500).json(createErrorResponse("internal_server_error", "Failed to update age group"));
    }
  });

  // Delete an age group (only if no divisions use it)
  app.delete("/api/age-groups/:id", standardAuth(), async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json(createErrorResponse("invalid_input", "Invalid age group ID"));
      }

      // Check if any divisions use this age group
      const divisionsCount = await db.execute(sql`
        SELECT COUNT(*) as count FROM divisions WHERE age_group_id = ${id} AND is_active = true
      `);

      if (parseInt(divisionsCount.rows[0].count as string) > 0) {
        return res.status(409).json(createErrorResponse("conflict", "Cannot delete age group with active divisions. Please delete divisions first."));
      }

      const result = await db.delete(ageGroups).where(eq(ageGroups.id, id)).returning();

      if (result.length === 0) {
        return res.status(404).json(createErrorResponse("not_found", "Age group not found"));
      }

      res.status(200).json(createSuccessResponse({ success: true, message: "Age group deleted successfully" }, { count: 1 }));
    } catch (error) {
      console.error("Error deleting age group:", error);
      res.status(500).json(createErrorResponse("internal_server_error", "Failed to delete age group"));
    }
  });

  // ===== DIVISIONS ENDPOINTS =====
  
  // Get all divisions for a season
  app.get("/api/seasons/:seasonId/divisions", standardAuth(), async (req: AuthenticatedRequest, res) => {
    try {
      const seasonId = parseInt(req.params.seasonId);

      if (isNaN(seasonId)) {
        return res.status(400).json(createErrorResponse("invalid_input", "Invalid season ID"));
      }

      const result = await db.execute(sql`
        SELECT 
          d.*,
          ag.name as age_group_name,
          ag.display_name as age_group_display_name,
          COUNT(t.id) as team_count
        FROM divisions d
        JOIN age_groups ag ON d.age_group_id = ag.id
        LEFT JOIN teams t ON d.id = t.division_id AND t.is_active = true
        WHERE d.season_id = ${seasonId} AND d.is_active = true
        GROUP BY d.id, d.section_id, ag.name, ag.display_name
        ORDER BY ag.name
      `);

      const divisionsWithDetails = result.rows.map(row => ({
        id: row.id,
        ageGroupId: row.age_group_id,
        sectionId: row.section_id, // <-- Add this line
        ageGroupName: row.age_group_name,
        ageGroupDisplayName: row.age_group_display_name,
        seasonId: row.season_id,
        displayName: row.display_name,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        teamCount: parseInt(row.team_count as string) || 0
      }));

      res.status(200).json(createSuccessResponse(divisionsWithDetails, { count: divisionsWithDetails.length }));
    } catch (error) {
      console.error("Error fetching divisions:", error);
      res.status(500).json(createErrorResponse("internal_server_error", "Failed to fetch divisions"));
    }
  });

  // Create a new division
  app.post("/api/seasons/:seasonId/divisions", async (req: AuthenticatedRequest, res) => {
    try {
      const seasonId = parseInt(req.params.seasonId);

      if (isNaN(seasonId)) {
        return res.status(400).json(createErrorResponse("invalid_input", "Invalid season ID"));
      }

      // If no display name provided, generate one from age group and section names
      let displayName = req.body.display_name || req.body.displayName;
      if (!displayName) {
        const ageGroupId = req.body.age_group_id ?? req.body.ageGroupId;
        const ageGroup = await db.select().from(ageGroups).where(eq(ageGroups.id, ageGroupId));
        if (ageGroup.length > 0) {
          displayName = ageGroup[0].name;
        } else {
          return res.status(400).json(createErrorResponse("invalid_input", "Invalid age group ID"));
        }
      }

      // Use snake_case for all DB fields, including section_id
      const divisionData = {
        ...req.body,
        season_id: seasonId,
        display_name: displayName,
        section_id: req.body.section_id // Ensure section_id is included
      };

      const parsedData = insertDivisionSchema.safeParse(divisionData);
      if (!parsedData.success) {
        return res.status(400).json(createErrorResponse("invalid_input", "Invalid division data", parsedData.error.errors));
      }

      const result = await db.insert(divisions).values(parsedData.data as any).returning();
      res.status(201).json(createSuccessResponse(result[0], { count: 1 }));
    } catch (error) {
      console.error("Error creating division:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        detail: error.detail,
        hint: error.hint
      });
      if (error.message?.includes("duplicate key")) {
        res.status(400).json(createErrorResponse("duplicate_entry", "A division with this age group already exists for this season"));
      } else {
        res.status(500).json(createErrorResponse("internal_server_error", "Failed to create division"));
      }
    }
  });

  // Update a division
  app.patch("/api/divisions/:id", standardAuth(), async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json(createErrorResponse("invalid_input", "Invalid division ID"));
      }

      // Update display name if age group changed
      const updateData = { ...req.body };
      if (updateData.ageGroupId) {
        const currentDivision = await db.select().from(divisions).where(eq(divisions.id, id));
        if (currentDivision.length > 0) {
          const current = currentDivision[0];
          const ageGroup = await db.select().from(ageGroups).where(eq(ageGroups.id, updateData.ageGroupId));
          
          if (ageGroup.length > 0) {
            updateData.displayName = ageGroup[0].name;
          }
        }
      }

      const result = await db
        .update(divisions)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(divisions.id, id))
        .returning();

      if (result.length === 0) {
        return res.status(404).json(createErrorResponse("not_found", "Division not found"));
      }

      res.status(200).json(createSuccessResponse(result[0], { count: 1 }));
    } catch (error) {
      console.error("Error updating division:", error);
      res.status(500).json(createErrorResponse("internal_server_error", "Failed to update division"));
    }
  });

  // Delete a division (only if no teams are assigned)
  app.delete("/api/divisions/:id", standardAuth(), async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json(createErrorResponse("invalid_input", "Invalid division ID"));
      }

      // Check if any teams are assigned to this division
      const teamsCount = await db.execute(sql`
        SELECT COUNT(*) as count FROM teams WHERE division_id = ${id} AND is_active = true
      `);

      if (parseInt(teamsCount.rows[0].count as string) > 0) {
        return res.status(409).json(createErrorResponse("conflict", "Cannot delete division with assigned teams. Please reassign teams first."));
      }

      const result = await db.delete(divisions).where(eq(divisions.id, id)).returning();

      if (result.length === 0) {
        return res.status(404).json(createErrorResponse("not_found", "Division not found"));
      }

      res.status(200).json(createSuccessResponse({ success: true, message: "Division deleted successfully" }, { count: 1 }));
    } catch (error) {
      console.error("Error deleting division:", error);
      res.status(500).json(createErrorResponse("internal_server_error", "Failed to delete division"));
    }
  });

  // Get teams in a specific division
  app.get("/api/divisions/:id/teams", standardAuth(), async (req: AuthenticatedRequest, res) => {
    try {
      const divisionId = parseInt(req.params.id);

      if (isNaN(divisionId)) {
        return res.status(400).json(createErrorResponse("invalid_input", "Invalid division ID"));
      }

      const result = await db.execute(sql`
        SELECT 
          t.*,
          c.name as club_name,
          c.code as club_code,
          d.display_name as division_name
        FROM teams t
        JOIN clubs c ON t.club_id = c.id
        LEFT JOIN divisions d ON t.division_id = d.id
        WHERE t.division_id = ${divisionId} AND t.is_active = true
        ORDER BY c.name, t.name
      `);

      const teamsWithDetails = result.rows.map(row => ({
        id: row.id,
        name: row.name,
        clubId: row.club_id,
        clubName: row.club_name,
        clubCode: row.club_code,
        divisionId: row.division_id,
        divisionName: row.division_name,
        seasonId: row.season_id,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));

      res.status(200).json(createSuccessResponse(teamsWithDetails, { count: teamsWithDetails.length }));
    } catch (error) {
      console.error("Error fetching teams for division:", error);
      res.status(500).json(createErrorResponse("internal_server_error", "Failed to fetch teams"));
    }
  });

  // ===== UTILITY ENDPOINTS =====
  
  // Get available age groups for creating divisions
  app.get("/api/seasons/:seasonId/division-options", standardAuth(), async (req: AuthenticatedRequest, res) => {
    try {
      const seasonId = parseInt(req.params.seasonId);

      if (isNaN(seasonId)) {
        return res.status(400).json(createErrorResponse("invalid_input", "Invalid season ID"));
      }

      // Get all active age groups
      const ageGroupsResult = await db.execute(sql`
        SELECT * FROM age_groups WHERE is_active = true ORDER BY name
      `);

      // Get existing divisions to show what combinations are already used
      const existingDivisionsResult = await db.execute(sql`
        SELECT age_group_id FROM divisions 
        WHERE season_id = ${seasonId} AND is_active = true
      `);

      const usedCombinations = existingDivisionsResult.rows.map(row => ({
        ageGroupId: row.age_group_id
      }));

      res.status(200).json(createSuccessResponse({
        ageGroups: ageGroupsResult.rows,
        usedCombinations
      }, { count: ageGroupsResult.rows.length }));
    } catch (error) {
      console.error("Error fetching division options:", error);
      res.status(500).json(createErrorResponse("internal_server_error", "Failed to fetch division options"));
    }
  });

  // --- SECTION ENDPOINTS ---

  const router = express.Router();

  // List all sections (global only)
  router.get('/sections', async (req, res) => {
    try {
      const query = `
        SELECT s.id, s.display_name, s.is_active, s.created_at, s.updated_at, s.name, COUNT(d.id) as division_count
        FROM sections s
        LEFT JOIN divisions d ON s.id = d.section_id AND d.is_active = true
        GROUP BY s.id, s.display_name, s.is_active, s.created_at, s.updated_at, s.name
        ORDER BY s.id ASC
      `;
      const { rows } = await pool.query(query);
      res.status(200).json(createSuccessResponse(rows.map(row => ({
        id: row.id,
        displayName: row.display_name,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        name: row.name,
        divisionCount: parseInt(row.division_count, 10) || 0
      })), { count: rows.length }));
    } catch (err) {
      console.error('Error fetching sections:', err);
      res.status(500).json(createErrorResponse("internal_server_error", "Failed to fetch sections"));
    }
  });

  // Get section by id
  router.get('/sections/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { rows } = await pool.query(
        'SELECT id, display_name, is_active, created_at, updated_at, name FROM sections WHERE id = $1',
        [id]
      );
      if (rows.length === 0) return res.status(404).json(createErrorResponse("not_found", "Section not found"));
      const row = rows[0];
      res.status(200).json(createSuccessResponse({
        id: row.id,
        displayName: row.display_name,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        name: row.name
      }, { count: 1 }));
    } catch (err) {
      console.error('Error fetching section:', err);
      res.status(500).json(createErrorResponse("internal_server_error", "Failed to fetch section"));
    }
  });

  // Create section
  router.post('/sections', async (req, res) => {
    try {
      const { display_name, is_active = true, name } = req.body;
      if (!display_name) return res.status(400).json(createErrorResponse("invalid_input", "display_name is required"));
      const { rows } = await pool.query(
        'INSERT INTO sections (display_name, is_active, name) VALUES ($1, $2, $3) RETURNING id, display_name, is_active, created_at, updated_at, name',
        [display_name, is_active, name || null]
      );
      const row = rows[0];
      res.status(201).json(createSuccessResponse({
        id: row.id,
        displayName: row.display_name,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        name: row.name
      }, { count: 1 }));
    } catch (err) {
      console.error('Error creating section:', err);
      res.status(500).json(createErrorResponse("internal_server_error", "Failed to create section"));
    }
  });

  // Update section
  router.put('/sections/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { display_name, is_active, name } = req.body;
      const { rows } = await pool.query(
        'UPDATE sections SET display_name = COALESCE($1, display_name), is_active = COALESCE($2, is_active), name = COALESCE($3, name), updated_at = now() WHERE id = $4 RETURNING id, display_name, is_active, created_at, updated_at, name',
        [display_name, is_active, name, id]
      );
      if (rows.length === 0) return res.status(404).json(createErrorResponse("not_found", "Section not found"));
      const row = rows[0];
      res.status(200).json(createSuccessResponse({
        id: row.id,
        displayName: row.display_name,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        name: row.name
      }, { count: 1 }));
    } catch (err) {
      console.error('Error updating section:', err);
      res.status(500).json(createErrorResponse("internal_server_error", "Failed to update section"));
    }
  });

  // PATCH /api/sections/:id - partial update
  router.patch('/sections/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { display_name, is_active, name } = req.body;
      const { rows } = await pool.query(
        'UPDATE sections SET display_name = COALESCE($1, display_name), is_active = COALESCE($2, is_active), name = COALESCE($3, name), updated_at = now() WHERE id = $4 RETURNING id, display_name, is_active, created_at, updated_at, name',
        [display_name, is_active, name, id]
      );
      if (rows.length === 0) return res.status(404).json(createErrorResponse("not_found", "Section not found"));
      const row = rows[0];
      res.status(200).json(createSuccessResponse({
        id: row.id,
        displayName: row.display_name,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        name: row.name
      }, { count: 1 }));
    } catch (err) {
      console.error('Error patching section:', err);
      res.status(500).json(createErrorResponse("internal_server_error", "Failed to update section"));
    }
  });

  // Delete section
  router.delete('/sections/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { rowCount } = await pool.query('DELETE FROM sections WHERE id = $1', [id]);
      if (rowCount === 0) return res.status(404).json(createErrorResponse("not_found", "Section not found"));
      res.status(204).send();
    } catch (err) {
      console.error('Error deleting section:', err);
      res.status(500).json(createErrorResponse("internal_server_error", "Failed to delete section"));
    }
  });

  // Mount the router at /api
  app.use('/api', router);
} 