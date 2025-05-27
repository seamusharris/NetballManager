
import { Router } from "express";
import { db } from "./db";
import { gameStatuses, games } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { log } from "./vite";

const router = Router();

// Get all game statuses
router.get("/", async (req, res) => {
  try {
    const statuses = await db
      .select()
      .from(gameStatuses)
      .where(eq(gameStatuses.isActive, true))
      .orderBy(gameStatuses.sortOrder);
    
    res.json(statuses);
  } catch (error) {
    log(`Error fetching game statuses: ${error}`, "error");
    res.status(500).json({ error: "Failed to fetch game statuses" });
  }
});

// Get a specific game status by ID
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const status = await db
      .select()
      .from(gameStatuses)
      .where(eq(gameStatuses.id, id))
      .limit(1);
    
    if (status.length === 0) {
      return res.status(404).json({ error: "Game status not found" });
    }
    
    res.json(status[0]);
  } catch (error) {
    log(`Error fetching game status: ${error}`, "error");
    res.status(500).json({ error: "Failed to fetch game status" });
  }
});

// Create a new game status
router.post("/", async (req, res) => {
  try {
    const body = req.body;
    const newStatus = await db
      .insert(gameStatuses)
      .values(body)
      .returning();
    
    res.status(201).json(newStatus[0]);
  } catch (error) {
    log(`Error creating game status: ${error}`, "error");
    res.status(500).json({ error: "Failed to create game status" });
  }
});

// Update a game status
router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const body = req.body;
    
    const updatedStatus = await db
      .update(gameStatuses)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(gameStatuses.id, id))
      .returning();
    
    if (updatedStatus.length === 0) {
      return res.status(404).json({ error: "Game status not found" });
    }
    
    res.json(updatedStatus[0]);
  } catch (error) {
    log(`Error updating game status: ${error}`, "error");
    res.status(500).json({ error: "Failed to update game status" });
  }
});

// Delete a game status (soft delete by setting isActive to false)
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Check if any games are using this status
    const gamesUsingStatus = await db
      .select({ count: sql<number>`count(*)` })
      .from(games)
      .where(eq(games.statusId, id));
    
    if (gamesUsingStatus[0].count > 0) {
      return res.status(400).json({ 
        error: "Cannot delete game status that is in use by games" 
      });
    }
    
    const deletedStatus = await db
      .update(gameStatuses)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(gameStatuses.id, id))
      .returning();
    
    if (deletedStatus.length === 0) {
      return res.status(404).json({ error: "Game status not found" });
    }
    
    res.json({ message: "Game status deleted successfully" });
  } catch (error) {
    log(`Error deleting game status: ${error}`, "error");
    res.status(500).json({ error: "Failed to delete game status" });
  }
});

export default router;
