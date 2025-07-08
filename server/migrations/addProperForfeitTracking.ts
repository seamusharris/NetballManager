
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

    // Insert new statuses one by one to avoid conflicts
    for (const status of newForfeitStatuses) {
      try {
        await db.insert(gameStatuses).values(status);
        log(`Added ${status.name} status`, "migration");
      } catch (insertError: any) {
        if (insertError.message?.includes('duplicate') || insertError.code === '23505') {
          log(`Status ${status.name} already exists, skipping`, "migration");
        } else {
          throw insertError;
        }
      }
    }

    // Mark old forfeit statuses as inactive (keep for backward compatibility)
    try {
      await db.execute(sql`
        UPDATE game_statuses 
        SET is_active = false, display_name = display_name || ' (Legacy)'
        WHERE name IN ('forfeit-win', 'forfeit-loss') AND is_active = true
      `);
      log("Marked legacy forfeit statuses as inactive", "migration");
    } catch (updateError: any) {
      log(`Warning: Could not update legacy statuses: ${updateError.message}`, "migration");
    }

    log("Forfeit tracking migration completed successfully", "migration");
    return true;

  } catch (error: any) {
    log(`Error in forfeit tracking migration: ${error.message}`, "migration");
    return false;
  }
}
