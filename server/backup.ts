import fs from 'fs';
import path from 'path';
import { storage } from './storage';

/**
 * Creates a backup of all application data and saves it to the specified file
 */
export async function createBackup(filename: string): Promise<string> {
  try {
    // Get all data from storage
    const players = await storage.getPlayers();
    const games = await storage.getGames();
    
    // Get all rosters and game stats for each game
    const rosters = [];
    const gameStats = [];
    
    for (const game of games) {
      const gameRosters = await storage.getRostersByGame(game.id);
      const gameStatsData = await storage.getGameStatsByGame(game.id);
      
      rosters.push(...gameRosters);
      gameStats.push(...gameStatsData);
    }
    
    // Create the backup object
    const backupData = {
      players,
      games,
      rosters,
      gameStats
    };
    
    // Make sure the backups directory exists
    const backupDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Write the backup file
    const backupPath = path.join(backupDir, filename);
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
    
    console.log(`Backup created successfully: ${backupPath}`);
    return backupPath;
  } catch (error) {
    console.error('Backup failed:', error);
    throw error;
  }
}