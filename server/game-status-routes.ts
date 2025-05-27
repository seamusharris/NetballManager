
import { Hono } from "hono";
import { db } from "./db";
import { gameStatuses, games } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { log } from "./vite";

const app = new Hono();

// Get all game statuses
app.get("/", async (c) => {
  try {
    const statuses = await db
      .select()
      .from(gameStatuses)
      .where(eq(gameStatuses.isActive, true))
      .orderBy(gameStatuses.sortOrder);
    
    return c.json(statuses);
  } catch (error) {
    log(`Error fetching game statuses: ${error}`, "error");
    return c.json({ error: "Failed to fetch game statuses" }, 500);
  }
});

// Get a specific game status by ID
app.get("/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    const status = await db
      .select()
      .from(gameStatuses)
      .where(eq(gameStatuses.id, id))
      .limit(1);
    
    if (status.length === 0) {
      return c.json({ error: "Game status not found" }, 404);
    }
    
    return c.json(status[0]);
  } catch (error) {
    log(`Error fetching game status: ${error}`, "error");
    return c.json({ error: "Failed to fetch game status" }, 500);
  }
});

// Create a new game status
app.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const newStatus = await db
      .insert(gameStatuses)
      .values(body)
      .returning();
    
    return c.json(newStatus[0], 201);
  } catch (error) {
    log(`Error creating game status: ${error}`, "error");
    return c.json({ error: "Failed to create game status" }, 500);
  }
});

// Update a game status
app.put("/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    const body = await c.req.json();
    
    const updatedStatus = await db
      .update(gameStatuses)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(gameStatuses.id, id))
      .returning();
    
    if (updatedStatus.length === 0) {
      return c.json({ error: "Game status not found" }, 404);
    }
    
    return c.json(updatedStatus[0]);
  } catch (error) {
    log(`Error updating game status: ${error}`, "error");
    return c.json({ error: "Failed to update game status" }, 500);
  }
});

// Delete a game status (soft delete by setting isActive to false)
app.delete("/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    
    // Check if any games are using this status
    const gamesUsingStatus = await db
      .select({ count: sql<number>`count(*)` })
      .from(games)
      .where(eq(games.statusId, id));
    
    if (gamesUsingStatus[0].count > 0) {
      return c.json({ 
        error: "Cannot delete game status that is in use by games" 
      }, 400);
    }
    
    const deletedStatus = await db
      .update(gameStatuses)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(gameStatuses.id, id))
      .returning();
    
    if (deletedStatus.length === 0) {
      return c.json({ error: "Game status not found" }, 404);
    }
    
    return c.json({ message: "Game status deleted successfully" });
  } catch (error) {
    log(`Error deleting game status: ${error}`, "error");
    return c.json({ error: "Failed to delete game status" }, 500);
  }
});

export default app;
