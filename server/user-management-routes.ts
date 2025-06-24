
import { Express, Request, Response } from 'express';
import { db } from './db';
import { sql } from 'drizzle-orm';
import { AuthenticatedRequest, requireClubAccess } from './auth-middleware';
import { z } from 'zod';

const inviteUserSchema = z.object({
  username: z.string().min(3).max(50),
  role: z.enum(['admin', 'manager', 'coach', 'viewer']),
  permissions: z.object({
    canManagePlayers: z.boolean(),
    canManageGames: z.boolean(),
    canManageStats: z.boolean(),
    canViewOtherTeams: z.boolean(),
  })
});

const updateUserRoleSchema = z.object({
  role: z.enum(['admin', 'manager', 'coach', 'viewer']),
  permissions: z.object({
    canManagePlayers: z.boolean(),
    canManageGames: z.boolean(),
    canManageStats: z.boolean(),
    canViewOtherTeams: z.boolean(),
  })
});

export function registerUserManagementRoutes(app: Express) {
  // Get all users in the current club
  app.get('/api/club/:clubId/users', requireClubAccess('canManagePlayers'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const clubId = parseInt(req.params.clubId);
      
      const result = await db.execute(sql`
        SELECT 
          u.id,
          u.username,
          cu.role,
          cu.can_manage_players,
          cu.can_manage_games,
          cu.can_manage_stats,
          cu.can_view_other_teams,
          cu.is_active,
          cu.created_at
        FROM users u
        JOIN club_users cu ON u.id = cu.user_id
        WHERE cu.club_id = ${clubId}
        ORDER BY cu.role, u.username
      `);

      const users = result.rows.map(row => ({
        id: row.id,
        username: row.username,
        role: row.role,
        permissions: {
          canManagePlayers: row.can_manage_players,
          canManageGames: row.can_manage_games,
          canManageStats: row.can_manage_stats,
          canViewOtherTeams: row.can_view_other_teams,
        },
        isActive: row.is_active,
        createdAt: row.created_at
      }));

      res.json(users);
    } catch (error) {
      console.error('Error fetching club users:', error);
      res.status(500).json({ error: 'Failed to fetch club users' });
    }
  });

  // Invite a user to the club
  app.post('/api/clubs/:clubId/users/invite', requireClubAccess('canManagePlayers'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const clubId = parseInt(req.params.clubId);
      const validatedData = inviteUserSchema.parse(req.body);

      // Check if user exists
      const userResult = await db.execute(sql`
        SELECT id FROM users WHERE username = ${validatedData.username}
      `);

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userId = userResult.rows[0].id;

      // Check if user is already in the club
      const existingResult = await db.execute(sql`
        SELECT id FROM club_users 
        WHERE club_id = ${clubId} AND user_id = ${userId}
      `);

      if (existingResult.rows.length > 0) {
        return res.status(400).json({ error: 'User is already a member of this club' });
      }

      // Add user to club
      await db.execute(sql`
        INSERT INTO club_users (
          club_id, user_id, role, 
          can_manage_players, can_manage_games, 
          can_manage_stats, can_view_other_teams
        ) VALUES (
          ${clubId}, ${userId}, ${validatedData.role},
          ${validatedData.permissions.canManagePlayers},
          ${validatedData.permissions.canManageGames},
          ${validatedData.permissions.canManageStats},
          ${validatedData.permissions.canViewOtherTeams}
        )
      `);

      res.json({ message: 'User invited successfully' });
    } catch (error) {
      console.error('Error inviting user:', error);
      res.status(500).json({ error: 'Failed to invite user' });
    }
  });

  // Update user role and permissions
  app.patch('/api/clubs/:clubId/users/:userId', requireClubAccess('canManagePlayers'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const clubId = parseInt(req.params.clubId);
      const userId = parseInt(req.params.userId);
      const validatedData = updateUserRoleSchema.parse(req.body);

      // Prevent users from removing their own admin privileges
      if (req.user?.id === userId && validatedData.role !== 'admin') {
        return res.status(400).json({ error: 'Cannot demote yourself from admin role' });
      }

      await db.execute(sql`
        UPDATE club_users SET
          role = ${validatedData.role},
          can_manage_players = ${validatedData.permissions.canManagePlayers},
          can_manage_games = ${validatedData.permissions.canManageGames},
          can_manage_stats = ${validatedData.permissions.canManageStats},
          can_view_other_teams = ${validatedData.permissions.canViewOtherTeams}
        WHERE club_id = ${clubId} AND user_id = ${userId}
      `);

      res.json({ message: 'User role updated successfully' });
    } catch (error) {
      console.error('Error updating user role:', error);
      res.status(500).json({ error: 'Failed to update user role' });
    }
  });

  // Remove user from club
  app.delete('/api/clubs/:clubId/users/:userId', requireClubAccess('canManagePlayers'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const clubId = parseInt(req.params.clubId);
      const userId = parseInt(req.params.userId);

      // Prevent users from removing themselves
      if (req.user?.id === userId) {
        return res.status(400).json({ error: 'Cannot remove yourself from the club' });
      }

      await db.execute(sql`
        DELETE FROM club_users 
        WHERE club_id = ${clubId} AND user_id = ${userId}
      `);

      res.json({ message: 'User removed from club successfully' });
    } catch (error) {
      console.error('Error removing user from club:', error);
      res.status(500).json({ error: 'Failed to remove user from club' });
    }
  });

  // Get available users (not in current club)
  app.get('/api/club/:clubId/users/available', requireClubAccess('canManagePlayers'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const clubId = parseInt(req.params.clubId);
      
      const result = await db.execute(sql`
        SELECT u.id, u.username
        FROM users u
        WHERE u.id NOT IN (
          SELECT cu.user_id 
          FROM club_users cu 
          WHERE cu.club_id = ${clubId}
        )
        ORDER BY u.username
      `);

      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching available users:', error);
      res.status(500).json({ error: 'Failed to fetch available users' });
    }
  });
}
