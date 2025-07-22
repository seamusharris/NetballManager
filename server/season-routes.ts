import type { Express } from "express";
import { standardAuth } from "./auth-middleware";
import { storage } from "./storage";
import { insertSeasonSchema } from "@shared/schema";
import { createArrayResponse, createSuccessResponse, createErrorResponse, transformToApiFormat } from "./api-utils";

export function registerSeasonRoutes(app: Express) {
  // Get all seasons
  app.get('/api/seasons', standardAuth(), async (req, res) => {
    try {
      const allSeasons = await storage.getSeasons();
      res.json(createArrayResponse(allSeasons));
    } catch (error) {
      console.error('Error fetching seasons:', error);
      res.status(500).json(createErrorResponse('FETCH_ERROR', 'Failed to fetch seasons'));
    }
  });

  // Get active season
  app.get('/api/seasons/active', standardAuth(), async (req, res) => {
    try {
      const activeSeason = await storage.getActiveSeason();
      if (!activeSeason) {
        return res.status(404).json(createErrorResponse('NOT_FOUND', 'No active season found'));
      }
      res.json(createSuccessResponse(activeSeason));
    } catch (error) {
      console.error('Error fetching active season:', error);
      res.status(500).json(createErrorResponse('FETCH_ERROR', 'Failed to fetch active season'));
    }
  });

  // Get season by ID
  app.get('/api/seasons/:id', standardAuth(), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const season = await storage.getSeason(id);
      if (!season) {
        return res.status(404).json(createErrorResponse('NOT_FOUND', 'Season not found'));
      }
      res.json(createSuccessResponse(season));
    } catch (error) {
      console.error(`Error fetching season ${req.params.id}:`, error);
      res.status(500).json(createErrorResponse('FETCH_ERROR', 'Failed to fetch season'));
    }
  });

  // Create season
  app.post('/api/seasons', standardAuth(), async (req, res) => {
    try {
      const seasonData = insertSeasonSchema.parse(req.body);
      const season = await storage.createSeason(seasonData);
      res.status(201).json(createSuccessResponse(transformToApiFormat(season)));
    } catch (error) {
      console.error('Error creating season:', error);
      res.status(400).json(createErrorResponse('INVALID_DATA', 'Invalid season data'));
    }
  });

  // Update season
  app.patch('/api/seasons/:id', standardAuth(), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // Allow partial updates
      const seasonData = req.body;
      const updatedSeason = await storage.updateSeason(id, seasonData);
      if (!updatedSeason) {
        return res.status(404).json(createErrorResponse('NOT_FOUND', 'Season not found'));
      }
      res.json(createSuccessResponse(transformToApiFormat(updatedSeason)));
    } catch (error) {
      console.error(`Error updating season ${req.params.id}:`, error);
      res.status(400).json(createErrorResponse('INVALID_DATA', 'Invalid season data'));
    }
  });

  // Set active season
  app.post('/api/seasons/:id/activate', standardAuth(), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const season = await storage.setActiveSeason(id);
      if (!season) {
        return res.status(404).json(createErrorResponse('NOT_FOUND', 'Season not found'));
      }
      res.json(createSuccessResponse(season));
    } catch (error) {
      console.error(`Error activating season ${req.params.id}:`, error);
      res.status(500).json(createErrorResponse('SERVER_ERROR', 'Failed to activate season'));
    }
  });

  // Delete season
  app.delete('/api/seasons/:id', standardAuth(), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const activeSeason = await storage.getActiveSeason();
      // Prevent deleting the active season
      if (activeSeason && activeSeason.id === id) {
        return res.status(400).json(createErrorResponse(
          'INVALID_OPERATION', 
          'Cannot delete the active season. Activate another season first.'
        ));
      }
      const deleted = await storage.deleteSeason(id);
      if (!deleted) {
        return res.status(404).json(createErrorResponse('NOT_FOUND', 'Season not found'));
      }
      res.json(createSuccessResponse({ message: "Season deleted successfully" }));
    } catch (error) {
      console.error(`Error deleting season ${req.params.id}:`, error);
      res.status(500).json(createErrorResponse('SERVER_ERROR', 'Failed to delete season'));
    }
  });
} 