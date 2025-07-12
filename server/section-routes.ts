
import type { Express } from "express";
import { sql, eq, and } from "drizzle-orm";
import { db } from "./db";
import { sections, insertSectionSchema } from "@shared/schema";
import { AuthenticatedRequest, standardAuth } from "./auth-middleware";

export function registerSectionRoutes(app: Express) {
  // Get all sections for a season
  app.get("/api/seasons/:seasonId/sections", standardAuth(), async (req: AuthenticatedRequest, res) => {
    try {
      const seasonId = parseInt(req.params.seasonId);
      
      if (isNaN(seasonId)) {
        return res.status(400).json({ error: "Invalid season ID" });
      }

      const result = await db.execute(sql`
        SELECT 
          s.*,
          COUNT(t.id) as team_count
        FROM sections s
        LEFT JOIN teams t ON s.id = t.section_id AND t.is_active = true
        WHERE s.season_id = ${seasonId} AND s.is_active = true
        GROUP BY s.id
        ORDER BY s.age_group, s.section_name
      `);

      const sectionsWithCounts = result.rows.map(row => ({
        id: row.id,
        seasonId: row.season_id,
        ageGroup: row.age_group,
        sectionName: row.section_name,
        displayName: row.display_name,
        description: row.description,
        maxTeams: row.max_teams,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        teamCount: parseInt(row.team_count) || 0
      }));

      res.json(sectionsWithCounts);
    } catch (error) {
      console.error("Error fetching sections:", error);
      res.status(500).json({ error: "Failed to fetch sections" });
    }
  });

  // Create a new section
  app.post("/api/seasons/:seasonId/sections", standardAuth(), async (req: AuthenticatedRequest, res) => {
    try {
      const seasonId = parseInt(req.params.seasonId);
      
      if (isNaN(seasonId)) {
        return res.status(400).json({ error: "Invalid season ID" });
      }

      const sectionData = {
        ...req.body,
        seasonId,
        displayName: req.body.displayName || `${req.body.ageGroup}/${req.body.sectionName}`
      };

      const parsedData = insertSectionSchema.safeParse(sectionData);
      if (!parsedData.success) {
        return res.status(400).json({ 
          error: "Invalid section data", 
          details: parsedData.error.errors 
        });
      }

      const result = await db.insert(sections).values(parsedData.data).returning();
      res.status(201).json(result[0]);
    } catch (error) {
      console.error("Error creating section:", error);
      if (error.message?.includes("duplicate key")) {
        res.status(400).json({ error: "A section with this age group and section name already exists" });
      } else {
        res.status(500).json({ error: "Failed to create section" });
      }
    }
  });

  // Update a section
  app.patch("/api/sections/:id", standardAuth(), async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid section ID" });
      }

      // Update display name if age group or section name changed
      const updateData = { ...req.body };
      if (updateData.ageGroup || updateData.sectionName) {
        const currentSection = await db.select().from(sections).where(eq(sections.id, id));
        if (currentSection.length > 0) {
          const current = currentSection[0];
          const ageGroup = updateData.ageGroup || current.ageGroup;
          const sectionName = updateData.sectionName || current.sectionName;
          updateData.displayName = `${ageGroup}/${sectionName}`;
        }
      }

      const result = await db
        .update(sections)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(sections.id, id))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ error: "Section not found" });
      }

      res.json(result[0]);
    } catch (error) {
      console.error("Error updating section:", error);
      res.status(500).json({ error: "Failed to update section" });
    }
  });

  // Delete a section (only if no teams are assigned)
  app.delete("/api/sections/:id", standardAuth(), async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid section ID" });
      }

      // Check if any teams are assigned to this section
      const teamsCount = await db.execute(sql`
        SELECT COUNT(*) as count FROM teams WHERE section_id = ${id} AND is_active = true
      `);

      if (parseInt(teamsCount.rows[0].count) > 0) {
        return res.status(400).json({ 
          error: "Cannot delete section with assigned teams. Please reassign teams first." 
        });
      }

      const result = await db.delete(sections).where(eq(sections.id, id)).returning();
      
      if (result.length === 0) {
        return res.status(404).json({ error: "Section not found" });
      }

      res.json({ success: true, message: "Section deleted successfully" });
    } catch (error) {
      console.error("Error deleting section:", error);
      res.status(500).json({ error: "Failed to delete section" });
    }
  });

  // Get teams in a specific section
  app.get("/api/sections/:id/teams", standardAuth(), async (req: AuthenticatedRequest, res) => {
    try {
      const sectionId = parseInt(req.params.id);
      
      if (isNaN(sectionId)) {
        return res.status(400).json({ error: "Invalid section ID" });
      }

      const result = await db.execute(sql`
        SELECT 
          t.*,
          c.name as club_name,
          c.code as club_code,
          s.display_name as section_name
        FROM teams t
        JOIN clubs c ON t.club_id = c.id
        LEFT JOIN sections s ON t.section_id = s.id
        WHERE t.section_id = ${sectionId} AND t.is_active = true
        ORDER BY c.name, t.name
      `);

      const teams = result.rows.map(row => ({
        id: row.id,
        name: row.name,
        division: row.division,
        clubId: row.club_id,
        seasonId: row.season_id,
        sectionId: row.section_id,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        clubName: row.club_name,
        clubCode: row.club_code,
        sectionName: row.section_name
      }));

      res.json(teams);
    } catch (error) {
      console.error("Error fetching section teams:", error);
      res.status(500).json({ error: "Failed to fetch section teams" });
    }
  });

  // Assign team to section
  app.patch("/api/teams/:id/section", standardAuth(), async (req: AuthenticatedRequest, res) => {
    try {
      const teamId = parseInt(req.params.id);
      const { sectionId } = req.body;
      
      if (isNaN(teamId)) {
        return res.status(400).json({ error: "Invalid team ID" });
      }

      const result = await db.execute(sql`
        UPDATE teams 
        SET section_id = ${sectionId || null}, updated_at = NOW()
        WHERE id = ${teamId}
        RETURNING *
      `);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Team not found" });
      }

      res.json({ 
        success: true, 
        message: sectionId ? "Team assigned to section" : "Team removed from section",
        team: result.rows[0]
      });
    } catch (error) {
      console.error("Error updating team section:", error);
      res.status(500).json({ error: "Failed to update team section" });
    }
  });
}
