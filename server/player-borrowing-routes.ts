
import { Express, Request, Response } from 'express';
import { db } from './db';
import { sql } from 'drizzle-orm';
import { AuthenticatedRequest, requireClubAccess } from './auth-middleware';
import { z } from 'zod';

const borrowPlayerSchema = z.object({
  playerId: z.number(),
  gameId: z.number(),
  lendingTeamId: z.number(),
  borrowingTeamId: z.number(),
  jerseyNumber: z.number().optional(),
  notes: z.string().optional(),
});

export function registerPlayerBorrowingRoutes(app: Express) {
  // Get all borrowing requests within the current club
  app.get('/api/club/:clubId/player-borrowing', requireClubAccess(), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const clubId = parseInt(req.params.clubId);
      
      const result = await db.execute(sql`
        SELECT 
          pb.*,
          p.display_name as player_name,
          lt.name as lending_team_name,
          bt.name as borrowing_team_name,
          g.date as game_date,
          g.time as game_time,
          ls.name as lending_season_name,
          bs.name as borrowing_season_name
        FROM player_borrowing pb
        JOIN players p ON pb.player_id = p.id
        JOIN teams lt ON pb.lending_team_id = lt.id
        JOIN teams bt ON pb.borrowing_team_id = bt.id
        JOIN games g ON pb.game_id = g.id
        JOIN seasons ls ON lt.season_id = ls.id
        JOIN seasons bs ON bt.season_id = bs.id
        WHERE lt.club_id = ${clubId} AND bt.club_id = ${clubId}
        ORDER BY g.date DESC, pb.created_at DESC
      `);

      const borrowingRequests = result.rows.map(row => ({
        id: row.id,
        gameId: row.game_id,
        playerId: row.player_id,
        playerName: row.player_name,
        borrowingTeamId: row.borrowing_team_id,
        borrowingTeamName: row.borrowing_team_name,
        borrowingSeasonName: row.borrowing_season_name,
        lendingTeamId: row.lending_team_id,
        lendingTeamName: row.lending_team_name,
        lendingSeasonName: row.lending_season_name,
        approved: row.approved_by_lending_club && row.approved_by_borrowing_club,
        jerseyNumber: row.jersey_number,
        notes: row.notes,
        gameDate: row.game_date,
        gameTime: row.game_time,
        createdAt: row.created_at
      }));

      res.json(borrowingRequests);
    } catch (error) {
      console.error('Error fetching borrowing requests:', error);
      res.status(500).json({ error: 'Failed to fetch borrowing requests' });
    }
  });

  // Create a new borrowing request within the same club
  app.post('/api/clubs/:clubId/player-borrowing', requireClubAccess('canManageGames'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const clubId = parseInt(req.params.clubId);
      const validatedData = borrowPlayerSchema.parse(req.body);
      
      // Verify both teams belong to the current club
      const teamsResult = await db.execute(sql`
        SELECT 
          lt.club_id as lending_club_id,
          bt.club_id as borrowing_club_id
        FROM teams lt, teams bt
        WHERE lt.id = ${validatedData.lendingTeamId} 
        AND bt.id = ${validatedData.borrowingTeamId}
      `);

      if (teamsResult.rows.length === 0) {
        return res.status(404).json({ error: 'One or both teams not found' });
      }

      const { lending_club_id, borrowing_club_id } = teamsResult.rows[0];

      if (lending_club_id !== clubId || borrowing_club_id !== clubId) {
        return res.status(403).json({ error: 'Both teams must belong to your club' });
      }

      if (validatedData.lendingTeamId === validatedData.borrowingTeamId) {
        return res.status(400).json({ error: 'Cannot borrow from the same team' });
      }

      // Verify the player is actually on the lending team
      const playerTeamResult = await db.execute(sql`
        SELECT id FROM team_players 
        WHERE team_id = ${validatedData.lendingTeamId} AND player_id = ${validatedData.playerId}
      `);

      if (playerTeamResult.rows.length === 0) {
        return res.status(400).json({ error: 'Player is not on the lending team' });
      }

      // Check if request already exists
      const existingResult = await db.execute(sql`
        SELECT id FROM player_borrowing 
        WHERE game_id = ${validatedData.gameId} AND player_id = ${validatedData.playerId}
      `);

      if (existingResult.rows.length > 0) {
        return res.status(400).json({ error: 'Borrowing request already exists for this player and game' });
      }

      // Create borrowing request (automatically approved since it's within the same club)
      await db.execute(sql`
        INSERT INTO player_borrowing (
          game_id, player_id, borrowing_team_id, lending_team_id,
          approved_by_borrowing_club, approved_by_lending_club, jersey_number, notes
        ) VALUES (
          ${validatedData.gameId}, ${validatedData.playerId}, 
          ${validatedData.borrowingTeamId}, ${validatedData.lendingTeamId},
          true, true, ${validatedData.jerseyNumber || null}, ${validatedData.notes || null}
        )
      `);

      res.json({ message: 'Player borrowing request created and approved successfully' });
    } catch (error) {
      console.error('Error creating borrowing request:', error);
      res.status(500).json({ error: 'Failed to create borrowing request' });
    }
  });

  // Update a borrowing request (mainly for notes or jersey number)
  app.patch('/api/clubs/:clubId/player-borrowing/:borrowingId', requireClubAccess('canManageGames'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const clubId = parseInt(req.params.clubId);
      const borrowingId = parseInt(req.params.borrowingId);
      const { notes } = req.body;
      
      // Verify the borrowing request belongs to this club
      const borrowingResult = await db.execute(sql`
        SELECT pb.*, lt.club_id as lending_club_id, bt.club_id as borrowing_club_id
        FROM player_borrowing pb
        JOIN teams lt ON pb.lending_team_id = lt.id
        JOIN teams bt ON pb.borrowing_team_id = bt.id
        WHERE pb.id = ${borrowingId}
      `);

      if (borrowingResult.rows.length === 0) {
        return res.status(404).json({ error: 'Borrowing request not found' });
      }

      const borrowing = borrowingResult.rows[0];

      if (borrowing.lending_club_id !== clubId || borrowing.borrowing_club_id !== clubId) {
        return res.status(403).json({ error: 'Not authorized to modify this request' });
      }

      // Update the borrowing request
      await db.execute(sql`
        UPDATE player_borrowing 
        SET notes = ${notes || null}
        WHERE id = ${borrowingId}
      `);

      res.json({ message: 'Borrowing request updated successfully' });
    } catch (error) {
      console.error('Error updating borrowing request:', error);
      res.status(500).json({ error: 'Failed to update borrowing request' });
    }
  });

  // Remove a borrowing request
  app.delete('/api/clubs/:clubId/player-borrowing/:borrowingId', requireClubAccess('canManageGames'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const clubId = parseInt(req.params.clubId);
      const borrowingId = parseInt(req.params.borrowingId);
      
      // Verify the borrowing request belongs to this club
      const borrowingResult = await db.execute(sql`
        SELECT pb.*, lt.club_id as lending_club_id, bt.club_id as borrowing_club_id
        FROM player_borrowing pb
        JOIN teams lt ON pb.lending_team_id = lt.id
        JOIN teams bt ON pb.borrowing_team_id = bt.id
        WHERE pb.id = ${borrowingId}
      `);

      if (borrowingResult.rows.length === 0) {
        return res.status(404).json({ error: 'Borrowing request not found' });
      }

      const borrowing = borrowingResult.rows[0];

      if (borrowing.lending_club_id !== clubId || borrowing.borrowing_club_id !== clubId) {
        return res.status(403).json({ error: 'Not authorized to delete this request' });
      }

      await db.execute(sql`
        DELETE FROM player_borrowing WHERE id = ${borrowingId}
      `);

      res.json({ message: 'Borrowing request removed successfully' });
    } catch (error) {
      console.error('Error removing borrowing request:', error);
      res.status(500).json({ error: 'Failed to remove borrowing request' });
    }
  });

  // Get available players for borrowing from other teams in the same club
  app.get('/api/clubs/:clubId/players/available-for-borrowing', requireClubAccess(), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const clubId = parseInt(req.params.clubId);
      const gameId = req.query.gameId as string;
      const excludeTeamId = req.query.excludeTeamId as string;
      
      if (!gameId) {
        return res.status(400).json({ error: 'gameId query parameter is required' });
      }

      let excludeClause = '';
      let excludeParams = [];

      if (excludeTeamId) {
        excludeClause = 'AND t.id != $3';
        excludeParams = [excludeTeamId];
      }

      const result = await db.execute(sql`
        SELECT 
          p.id, p.display_name, p.position_preferences,
          t.id as team_id, t.name as team_name,
          s.name as season_name
        FROM players p
        JOIN team_players tp ON p.id = tp.player_id
        JOIN teams t ON tp.team_id = t.id
        JOIN seasons s ON t.season_id = s.id
        WHERE t.club_id = ${clubId}
          AND p.active = true
          ${excludeTeamId ? sql`AND t.id != ${parseInt(excludeTeamId)}` : sql``}
          AND p.id NOT IN (
            SELECT player_id FROM player_borrowing 
            WHERE game_id = ${gameId}
          )
        ORDER BY s.name, t.name, p.display_name
      `);

      const availablePlayers = result.rows.map(row => ({
        id: row.id,
        displayName: row.display_name,
        positionPreferences: row.position_preferences,
        teamId: row.team_id,
        teamName: row.team_name,
        seasonName: row.season_name
      }));

      res.json(availablePlayers);
    } catch (error) {
      console.error('Error fetching available players for borrowing:', error);
      res.status(500).json({ error: 'Failed to fetch available players' });
    }
  });

  // Get borrowed players for a specific game
  app.get('/api/games/:gameId/borrowed-players', requireClubAccess(), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const gameId = parseInt(req.params.gameId);
      
      const result = await db.execute(sql`
        SELECT 
          pb.*,
          p.display_name as player_name,
          p.position_preferences,
          lt.name as lending_team_name,
          bt.name as borrowing_team_name,
          ls.name as lending_season_name,
          bs.name as borrowing_season_name
        FROM player_borrowing pb
        JOIN players p ON pb.player_id = p.id
        JOIN teams lt ON pb.lending_team_id = lt.id
        JOIN teams bt ON pb.borrowing_team_id = bt.id
        JOIN seasons ls ON lt.season_id = ls.id
        JOIN seasons bs ON bt.season_id = bs.id
        WHERE pb.game_id = ${gameId}
        ORDER BY p.display_name
      `);

      const borrowedPlayers = result.rows.map(row => ({
        id: row.id,
        playerId: row.player_id,
        playerName: row.player_name,
        positionPreferences: row.position_preferences,
        borrowingTeamId: row.borrowing_team_id,
        borrowingTeamName: row.borrowing_team_name,
        borrowingSeasonName: row.borrowing_season_name,
        lendingTeamId: row.lending_team_id,
        lendingTeamName: row.lending_team_name,
        lendingSeasonName: row.lending_season_name,
        jerseyNumber: row.jersey_number,
        notes: row.notes
      }));

      res.json(borrowedPlayers);
    } catch (error) {
      console.error('Error fetching borrowed players for game:', error);
      res.status(500).json({ error: 'Failed to fetch borrowed players' });
    }
  });
}
