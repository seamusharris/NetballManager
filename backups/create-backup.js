const fs = require('fs');
const path = require('path');
const https = require('https');

// Function to make API requests
async function fetchData(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: process.env.PORT || 3000,
      path: endpoint,
      method: 'GET',
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(new Error(`Failed to parse JSON: ${err.message}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

// Main backup function
async function createBackup() {
  try {
    // Create timestamp for the backup file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilename = `backup-${timestamp}.json`;
    const backupPath = path.join(__dirname, backupFilename);
    
    // Get all data from the API endpoints
    const players = await fetchData('/api/players');
    const opponents = await fetchData('/api/opponents');
    const games = await fetchData('/api/games');
    
    // Get roster and stats for each game
    const rosters = [];
    const gameStats = [];
    
    for (const game of games) {
      const gameRosters = await fetchData(`/api/rosters/${game.id}`);
      const gameStatsData = await fetchData(`/api/gamestats/${game.id}`);
      
      rosters.push(...gameRosters);
      gameStats.push(...gameStatsData);
    }
    
    // Create the backup object
    const backupData = {
      players,
      opponents,
      games,
      rosters,
      gameStats
    };
    
    // Write the backup file
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
    
    console.log(`Backup created successfully: ${backupPath}`);
    return backupPath;
  } catch (error) {
    console.error('Backup failed:', error);
    throw error;
  }
}

// Execute the backup
createBackup().catch(console.error);