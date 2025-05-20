import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create a backup using the API
async function createBackup() {
  try {
    // Create timestamp for the backup file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilename = `backup-${timestamp}.json`;
    const backupPath = path.join(__dirname, backupFilename);
    
    // Fetch all data from the API
    console.log('Fetching data from API...');
    const response = await fetch('http://localhost:3000/api/backup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const backupData = await response.json();
    
    // Write the backup file
    console.log('Writing backup file...');
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
    
    console.log(`Backup created successfully at: ${backupPath}`);
    
    // Summary of backed up data
    console.log('\nBackup Summary:');
    console.log(`- Players: ${backupData.players.length}`);
    console.log(`- Opponents: ${backupData.opponents.length}`);
    console.log(`- Games: ${backupData.games.length}`);
    console.log(`- Roster entries: ${backupData.rosters.length}`);
    console.log(`- Game statistics: ${backupData.gameStats.length}`);
    
    return backupPath;
  } catch (error) {
    console.error('Backup failed:', error);
    throw error;
  }
}

// Execute backup
createBackup().catch(console.error);