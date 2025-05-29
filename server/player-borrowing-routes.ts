
import { Express, Request, Response } from 'express';
import { db } from './db';
import { sql } from 'drizzle-orm';
import { AuthenticatedRequest, requireClubAccess, requireGameAccess } from './auth-middleware';
import { z } from 'zod';

const borrowPlayerSchema = z.object({
  playerId: z.number(),
  gameId: z.number(),
  lendingTeamId: z.number(),
  borrowingTeamId: z.number(),
  jerseyNumber: z.number().optional(),
  notes: z.string().optional(),
});

const approveBorrowingSchema = z.object({
  approve: z.boolean(),
});

export function registerPlayerBorrowingRoutes(app: Express) {
  // Get all borrowing requests for a club
  app.get('/api/clubs/:clubId/player-borrowing', requireClubAccess(), async (req: AuthenticatedRequest, res: Response) => {
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
          lc.name as lending_club_name,
          bc.name as borrowing_club_name
        FROM player_borrowing pb
        JOIN players p ON pb.player_id = p.id
        JOIN teams lt ON pb.lending_team_id = lt.id
        JOIN teams bt ON pb.borrowing_team_id = bt.id
        JOIN games g ON pb.game_id = g.id
        JOIN clubs lc ON lt.club_id = lc.id
        JOIN clubs bc ON bt.club_id = bc.id
        WHERE lt.club_id = ${clubId} OR bt.club_id = ${clubId}
        ORDER BY g.date DESC, pb.created_at DESC
      `);

      const borrowingRequests = result.rows.map(row => ({
        id: row.id,
        gameId: row.game_id,
        playerId: row.player_id,
        playerName: row.player_name,
        borrowingTeamId: row.borrowing_team_id,
        borrowingTeamName: row.borrowing_team_name,
        borrowingClubName: row.borrowing_club_name,
        lendingTeamId: row.lending_team_id,
        lendingTeamName: row.lending_team_name,
        lendingClubName: row.lending_club_name,
        approvedByLendingClub: row.approved_by_lending_club,
        approvedByBorrowingClub: row.approved_by_borrowing_club,
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

  // Create a new borrowing request
  app.post('/api/clubs/:clubId/player-borrowing', requireClubAccess('canManageGames'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const validatedData = borrowPlayerSchema.parse(req.body);
      
      // Verify the borrowing team belongs to the current club
      const teamResult = await db.execute(sql`
        SELECT club_id FROM teams WHERE id = ${validatedData.borrowingTeamId}
      `);

      if (teamResult.rows.length === 0 || teamResult.rows[0].club_id !== req.user?.currentClubId) {
        return res.status(403).json({ error: 'Can only create borrowing requests for your own teams' });
      }

      // Check if request already exists
      const existingResult = await db.execute(sql`
        SELECT id FROM player_borrowing 
        WHERE game_id = ${validatedData.gameId} AND player_id = ${validatedData.playerId}
      `);

      if (existingResult.rows.length > 0) {
        return res.status(400).json({ error: 'Borrowing request already exists for this player and game' });
      }

      // Create borrowing request
      await db.execute(sql`
        INSERT INTO player_borrowing (
          game_id, player_id, borrowing_team_id, lending_team_id,
          approved_by_borrowing_club, jersey_number, notes
        ) VALUES (
          ${validatedData.gameId}, ${validatedData.playerId}, 
          ${validatedData.borrowingTeamId}, ${validatedData.lendingTeamId},
          true, ${validatedData.jerseyNumber || null}, ${validatedData.notes || null}
        )
      `);

      res.json({ message: 'Borrowing request created successfully' });
    } catch (error) {
      console.error('Error creating borrowing request:', error);
      res.status(500).json({ error: 'Failed to create borrowing request' });
    }
  });

  // Approve/deny a borrowing request
  app.patch('/api/clubs/:clubId/player-borrowing/:borrowingId', requireClubAccess('canManageGames'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const borrowingId = parseInt(req.params.borrowingId);
      const validatedData = approveBorrowingSchema.parse(req.body);
      
      // Get borrowing request details
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
      const currentClubId = req.user?.currentClubId;

      // Determine which club is approving
      let updateField: string;
      if (borrowing.lending_club_id === currentClubId) {
        updateField = 'approved_by_lending_club';
      } else if (borrowing.borrowing_club_id === currentClubId) {
        updateField = 'approved_by_borrowing_club';
      } else {
        return res.status(403).json({ error: 'Not authorized to approve this request' });
      }

      // Update approval status
      await db.execute(sql`
        UPDATE player_borrowing 
        SET ${sql.raw(updateField)} = ${validatedData.approve}
        WHERE id = ${borrowingId}
      `);

      res.json({ message: 'Borrowing request updated successfully' });
    } catch (error) {
      console.error('Error updating borrowing request:', error);
      res.status(500).json({ error: 'Failed to update borrowing request' });
    }
  });

  // Get available players for borrowing from other clubs
  app.get('/api/clubs/:clubId/players/available-for-borrowing', requireClubAccess(), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const clubId = parseInt(req.params.clubId);
      const gameId = req.query.gameId as string;
      
      if (!gameId) {
        return res.status(400).json({ error: 'gameId query parameter is required' });
      }

      const result = await db.execute(sql`
        SELECT 
          p.id, p.display_name, p.position_preferences,
          t.id as team_id, t.name as team_name,
          c.id as club_id, c.name as club_name
        FROM players p
        JOIN team_players tp ON p.id = tp.player_id
        JOIN teams t ON tp.team_id = t.id
        JOIN clubs c ON t.club_id = c.id
        WHERE c.id != ${clubId}
          AND p.active = true
          AND p.id NOT IN (
            SELECT player_id FROM player_borrowing 
            WHERE game_id = ${gameId}
          )
        ORDER BY c.name, t.name, p.display_name
      `);

      const availablePlayers = result.rows.map(row => ({
        id: row.id,
        displayName: row.display_name,
        positionPreferences: row.position_preferences,
        teamId: row.team_id,
        teamName: row.team_name,
        clubId: row.club_id,
        clubName: row.club_name
      }));

      res.json(availablePlayers);
    } catch (error) {
      console.error('Error fetching available players for borrowing:', error);
      res.status(500).json({ error: 'Failed to fetch available players' });
    }
  });
}
