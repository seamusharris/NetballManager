#!/usr/bin/env node

// This script will update avatar colors for specific players that are missing them
// It ensures all players have their colors assigned properly in the database

import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq } from 'drizzle-orm';
import { players } from './shared/schema.js';
import ws from 'ws';

// Initialize the database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function updateMissingPlayerColors() {
  try {
    console.log('Updating missing player avatar colors...');
    
    // Define specific player colors to ensure they're set correctly
    const playerColorUpdates = [
      { id: 67, name: 'Holly', color: 'bg-violet-600' },
      // Add any other players with missing colors here if needed
    ];
    
    // Update each player's color
    for (const player of playerColorUpdates) {
      await db
        .update(players)
        .set({ avatarColor: player.color })
        .where(eq(players.id, player.id));
      
      console.log(`Updated ${player.name} (ID: ${player.id}) with color: ${player.color}`);
    }
    
    console.log('Player color updates completed successfully');
  } catch (error) {
    console.error('Error updating player colors:', error);
  } finally {
    // Close the database connection
    process.exit(0);
  }
}

// Run the update function
updateMissingPlayerColors();