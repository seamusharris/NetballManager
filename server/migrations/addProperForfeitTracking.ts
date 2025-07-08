
import { db } from '../db';
import { gameStatuses } from '@shared/schema';
import { sql } from 'drizzle-orm';
import { log } from '../vite';

export async function addProperForfeitTracking(): Promise<boolean> {
  try {
    log("Adding team-specific forfeit tracking", "migration");

    // Add new forfeit statuses that specify which team forfeited
    const newForfeitStatuses = [
      {
        name: 'home-team-forfeit',
        displayName: 'Home Team Forfeit',
        points: 0,
        opponentPoints: 4,
        teamGoals: 0,  // Home team score
        opponentGoals: 10, // Away team score
        isCompleted: true,
        allowsStatistics: false,
        requiresOpponent: true,
        colorClass: 'bg-red-600',
        sortOrder: 8,
        isActive: true
      },
      {
        name: 'away-team-forfeit', 
        displayName: 'Away Team Forfeit',
        points: 4,
        opponentPoints: 0,
        teamGoals: 10, // Home team score
        opponentGoals: 0, // Away team score
        isCompleted: true,
        allowsStatistics: false,
        requiresOpponent: true,
        colorClass: 'bg-green-600',
        sortOrder: 9,
        isActive: true
      }
    ];

    await db.insert(gameStatuses).values(newForfeitStatuses);
    log(`Added ${newForfeitStatuses.length} new team-specific forfeit statuses`, "migration");

    // Mark old forfeit statuses as inactive (keep for backward compatibility)
    await db.execute(sql`
      UPDATE game_statuses 
      SET is_active = false, display_name = display_name || ' (Legacy)'
      WHERE name IN ('forfeit-win', 'forfeit-loss')
    `);

    log("Marked legacy forfeit statuses as inactive", "migration");
    return true;

  } catch (error) {
    log(`Error in forfeit tracking migration: ${error}`, "migration");
    return false;
  }
}
