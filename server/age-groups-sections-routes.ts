import type { Express } from "express";
import { sql, eq, and, desc } from "drizzle-orm";
import { db } from "./db";
import { 
  ageGroups, 
  divisions, 
  teams,
  insertAgeGroupSchema,
  insertDivisionSchema
} from "@shared/schema";
import { AuthenticatedRequest, standardAuth } from "./auth-middleware";

export function registerAgeGroupsSectionsRoutes(app: Express) {
  console.log("🔧 Registering age groups sections routes...");
  
  // Test endpoint
  app.get("/api/test-divisions", (req, res) => {
    console.log("🎯 Test divisions endpoint hit!");
    res.json({ message: "Test divisions endpoint working" });
  });
  
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
        description: row.description as string,
        isActive: row.is_active as boolean,
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string,
        divisionCount: parseInt(row.division_count as string) || 0
      }));

      res.json(ageGroupsWithCounts);
    } catch (error) {
      console.error("Error fetching age groups:", error);
      res.status(500).json({ error: "Failed to fetch age groups" });
    }
  });

  // Create a new age group
  app.post("/api/age-groups", standardAuth(), async (req: AuthenticatedRequest, res) => {
    try {
      const parsedData = insertAgeGroupSchema.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({ 
          error: "Invalid age group data", 
          details: parsedData.error.errors 
        });
      }

      const result = await db.insert(ageGroups).values(parsedData.data as any).returning();
      res.status(201).json(result[0]);
    } catch (error) {
      console.error("Error creating age group:", error);
      if (error.message?.includes("duplicate key")) {
        res.status(400).json({ error: "An age group with this name already exists" });
      } else {
        res.status(500).json({ error: "Failed to create age group" });
      }
    }
  });

  // Update an age group
  app.patch("/api/age-groups/:id", standardAuth(), async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid age group ID" });
      }

      const result = await db
        .update(ageGroups)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(ageGroups.id, id))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ error: "Age group not found" });
      }

      res.json(result[0]);
    } catch (error) {
      console.error("Error updating age group:", error);
      res.status(500).json({ error: "Failed to update age group" });
    }
  });

  // Delete an age group (only if no divisions use it)
  app.delete("/api/age-groups/:id", standardAuth(), async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid age group ID" });
      }

      // Check if any divisions use this age group
      const divisionsCount = await db.execute(sql`
        SELECT COUNT(*) as count FROM divisions WHERE age_group_id = ${id} AND is_active = true
      `);

      if (parseInt(divisionsCount.rows[0].count as string) > 0) {
        return res.status(400).json({ 
          error: "Cannot delete age group with active divisions. Please delete divisions first." 
        });
      }

      const result = await db.delete(ageGroups).where(eq(ageGroups.id, id)).returning();

      if (result.length === 0) {
        return res.status(404).json({ error: "Age group not found" });
      }

      res.json({ success: true, message: "Age group deleted successfully" });
    } catch (error) {
      console.error("Error deleting age group:", error);
      res.status(500).json({ error: "Failed to delete age group" });
    }
  });

  // ===== DIVISIONS ENDPOINTS =====
  
  // Get all divisions for a season
  app.get("/api/seasons/:seasonId/divisions", standardAuth(), async (req: AuthenticatedRequest, res) => {
    try {
      const seasonId = parseInt(req.params.seasonId);

      if (isNaN(seasonId)) {
        return res.status(400).json({ error: "Invalid season ID" });
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
        GROUP BY d.id, ag.name, ag.display_name
        ORDER BY ag.name
      `);

      const divisionsWithDetails = result.rows.map(row => ({
        id: row.id,
        ageGroupId: row.age_group_id,
        ageGroupName: row.age_group_name,
        ageGroupDisplayName: row.age_group_display_name,
        seasonId: row.season_id,
        displayName: row.display_name,
        description: row.description,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        teamCount: parseInt(row.team_count as string) || 0
      }));

      res.json(divisionsWithDetails);
    } catch (error) {
      console.error("Error fetching divisions:", error);
      res.status(500).json({ error: "Failed to fetch divisions" });
    }
  });

  // Create a new division
  app.post("/api/seasons/:seasonId/divisions", async (req: AuthenticatedRequest, res) => {
    console.log("🎯 Division creation endpoint hit!");
    try {
      const seasonId = parseInt(req.params.seasonId);

      if (isNaN(seasonId)) {
        return res.status(400).json({ error: "Invalid season ID" });
      }

      console.log("Creating division with data:", req.body);
      console.log("Season ID:", seasonId);

      // If no display name provided, generate one from age group and section names
      let displayName = req.body.displayName;
      if (!displayName) {
        const ageGroup = await db.select().from(ageGroups).where(eq(ageGroups.id, req.body.ageGroupId));
        
        console.log("Found age group:", ageGroup);
        
        if (ageGroup.length > 0) {
          displayName = ageGroup[0].name;
        } else {
          return res.status(400).json({ error: "Invalid age group ID" });
        }
      }

      const divisionData = {
        ...req.body,
        seasonId,
        displayName
      };

      console.log("Final division data:", divisionData);

      const parsedData = insertDivisionSchema.safeParse(divisionData);
      if (!parsedData.success) {
        console.log("Schema validation failed:", parsedData.error.errors);
        return res.status(400).json({ 
          error: "Invalid division data", 
          details: parsedData.error.errors 
        });
      }

      console.log("Schema validation passed, inserting data:", parsedData.data);

      const result = await db.insert(divisions).values(parsedData.data as any).returning();
      res.status(201).json(result[0]);
    } catch (error) {
      console.error("Error creating division:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        detail: error.detail,
        hint: error.hint
      });
      if (error.message?.includes("duplicate key")) {
        res.status(400).json({ error: "A division with this age group already exists for this season" });
      } else {
        res.status(500).json({ error: "Failed to create division" });
      }
    }
  });

  // Update a division
  app.patch("/api/divisions/:id", standardAuth(), async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid division ID" });
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
        return res.status(404).json({ error: "Division not found" });
      }

      res.json(result[0]);
    } catch (error) {
      console.error("Error updating division:", error);
      res.status(500).json({ error: "Failed to update division" });
    }
  });

  // Delete a division (only if no teams are assigned)
  app.delete("/api/divisions/:id", standardAuth(), async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid division ID" });
      }

      // Check if any teams are assigned to this division
      const teamsCount = await db.execute(sql`
        SELECT COUNT(*) as count FROM teams WHERE division_id = ${id} AND is_active = true
      `);

      if (parseInt(teamsCount.rows[0].count as string) > 0) {
        return res.status(400).json({ 
          error: "Cannot delete division with assigned teams. Please reassign teams first." 
        });
      }

      const result = await db.delete(divisions).where(eq(divisions.id, id)).returning();

      if (result.length === 0) {
        return res.status(404).json({ error: "Division not found" });
      }

      res.json({ success: true, message: "Division deleted successfully" });
    } catch (error) {
      console.error("Error deleting division:", error);
      res.status(500).json({ error: "Failed to delete division" });
    }
  });

  // Get teams in a specific division
  app.get("/api/divisions/:id/teams", standardAuth(), async (req: AuthenticatedRequest, res) => {
    try {
      const divisionId = parseInt(req.params.id);

      if (isNaN(divisionId)) {
        return res.status(400).json({ error: "Invalid division ID" });
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

      res.json(teamsWithDetails);
    } catch (error) {
      console.error("Error fetching teams for division:", error);
      res.status(500).json({ error: "Failed to fetch teams" });
    }
  });

  // ===== UTILITY ENDPOINTS =====
  
  // Get available age groups for creating divisions
  app.get("/api/seasons/:seasonId/division-options", standardAuth(), async (req: AuthenticatedRequest, res) => {
    try {
      const seasonId = parseInt(req.params.seasonId);

      if (isNaN(seasonId)) {
        return res.status(400).json({ error: "Invalid season ID" });
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

      res.json({
        ageGroups: ageGroupsResult.rows,
        usedCombinations
      });
    } catch (error) {
      console.error("Error fetching division options:", error);
      res.status(500).json({ error: "Failed to fetch division options" });
    }
  });
} 