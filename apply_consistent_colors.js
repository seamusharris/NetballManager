#!/usr/bin/env node

// This script will apply consistent avatar colors to all players
// It uses the original player color schema that's always been present in the app
// This ensures players maintain their visual identity across all parts of the app

import { db } from './server/db.js';
import { players, type Player } from './shared/schema.js';
import { eq } from 'drizzle-orm';

// The original avatar color schema from the application
const avatarColors = [
  'bg-blue-600',    // Blue
  'bg-purple-600',  // Purple
  'bg-pink-600',    // Pink
  'bg-green-600',   // Green
  'bg-accent',      // Accent (teal)
  'bg-secondary',   // Secondary
  'bg-orange-500',  // Orange
  'bg-primary',     // Primary
  'bg-red-500',     // Red
];

async function updatePlayerColors() {
  try {
    console.log('Starting to update player avatar colors...');
    
    // Get all players
    const allPlayers = await db.select().from(players);
    console.log();
    
    // Update each player with their consistent color
    for (const player of allPlayers) {
      const colorIndex = player.id % avatarColors.length;
      const avatarColor = avatarColors[colorIndex];
      
      await db
        .update(players)
        .set({ avatarColor })
        .where(eq(players.id, player.id));
      
      console.log();
    }
    
    console.log('All players have been updated with consistent colors');
  } catch (error) {
    console.error('Error updating player colors:', error);
  } finally {
    // Close the database connection
    process.exit(0);
  }
}

// Run the update function
updatePlayerColors();
