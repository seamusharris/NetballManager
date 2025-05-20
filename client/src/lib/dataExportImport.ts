import { Player, Opponent, Game, Roster, GameStat } from '@shared/schema';
import { apiRequest } from './queryClient';
import { formatDate } from './utils';

interface ExportResult {
  fileContents: string;
  filename: string;
}

interface ImportResult {
  playersImported: number;
  opponentsImported: number;
  gamesImported: number;
  rostersImported: number;
  statsImported: number;
}

// Export data to JSON format
export async function exportAllData(): Promise<ExportResult> {
  try {
    // Fetch all data
    const playersResponse = await fetch('/api/players');
    const players = await playersResponse.json() as Player[];
    
    const opponentsResponse = await fetch('/api/opponents');
    const opponents = await opponentsResponse.json() as Opponent[];
    
    const gamesResponse = await fetch('/api/games');
    const games = await gamesResponse.json() as Game[];
    
    // Fetch rosters and stats for each game
    const gameRosters: Record<number, Roster[]> = {};
    const gameStats: Record<number, GameStat[]> = {};
    
    for (const game of games) {
      try {
        const rosterResponse = await fetch(`/api/games/${game.id}/rosters`);
        const rosters = await rosterResponse.json();
        gameRosters[game.id] = rosters as Roster[];
      } catch (error) {
        console.error(`Failed to fetch rosters for game ${game.id}:`, error);
        gameRosters[game.id] = [];
      }
      
      try {
        const statsResponse = await fetch(`/api/games/${game.id}/stats`);
        const stats = await statsResponse.json();
        gameStats[game.id] = stats as GameStat[];
      } catch (error) {
        console.error(`Failed to fetch stats for game ${game.id}:`, error);
        gameStats[game.id] = [];
      }
    }
    
    // Create JSON structure for all data
    const exportData = {
      players,
      opponents,
      games,
      rosters: gameRosters,
      stats: gameStats,
      exportDate: new Date().toISOString()
    };
    
    // Convert to JSON string
    const jsonData = JSON.stringify(exportData, null, 2);
    
    // Create the filename with current date
    const now = new Date();
    const datePart = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const filename = `netball_export_${datePart}.json`;
    
    return {
      fileContents: jsonData,
      filename
    };
  } catch (error) {
    console.error('Failed to export data:', error);
    throw new Error('Failed to export data. Please try again later.');
  }
}

// Import data from JSON format
export async function importData(jsonData: string): Promise<ImportResult> {
  try {
    // Parse the JSON data
    const data = JSON.parse(jsonData);
    
    // Validate the data structure
    if (!data.players || !data.opponents || !data.games || !data.rosters || !data.stats) {
      throw new Error('Invalid data format. The import file is missing required data sections.');
    }
    
    // Count successful imports
    let playersImported = 0;
    let opponentsImported = 0;
    let gamesImported = 0;
    let rostersImported = 0;
    let statsImported = 0;
    
    // Import players
    for (const player of data.players) {
      try {
        // Include the original ID to preserve relationships
        const playerData = {
          id: player.id, // Keep original ID
          displayName: player.displayName,
          firstName: player.firstName,
          lastName: player.lastName,
          dateOfBirth: player.dateOfBirth,
          positionPreferences: player.positionPreferences,
          active: player.active,
          avatarColor: player.avatarColor
        };
        
        const response = await fetch('/api/players', {
          method: 'POST',
          body: JSON.stringify(playerData),
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          playersImported++;
        }
      } catch (error) {
        console.error(`Failed to import player ${player.displayName}:`, error);
      }
    }
    
    // Import opponents
    for (const opponent of data.opponents) {
      try {
        const opponentData = {
          id: opponent.id, // Keep original ID
          teamName: opponent.teamName,
          primaryColor: opponent.primaryColor,
          secondaryColor: opponent.secondaryColor,
          notes: opponent.notes
        };
        
        const response = await fetch('/api/opponents', {
          method: 'POST',
          body: JSON.stringify(opponentData),
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          opponentsImported++;
        }
      } catch (error) {
        console.error(`Failed to import opponent ${opponent.teamName}:`, error);
      }
    }
    
    // Import games
    for (const game of data.games) {
      try {
        const gameData = {
          id: game.id, // Keep original ID
          date: game.date,
          time: game.time,
          opponentId: game.opponentId,
          venue: game.venue,
          isHome: game.isHome,
          teamScore: game.teamScore,
          opponentScore: game.opponentScore,
          completed: game.completed,
          notes: game.notes,
          round: game.round,
          isBye: game.isBye
        };
        
        const response = await fetch('/api/games', {
          method: 'POST',
          body: JSON.stringify(gameData),
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to import game: ${response.statusText}`);
        }
        
        const newGame = await response.json() as Game;
        gamesImported++;
        
        // Import rosters for this game
        const gameRosters = data.rosters.filter((r: any) => r.gameId === game.id) || [];
        for (const roster of gameRosters) {
          try {
            const rosterData = {
              id: roster.id, // Keep original ID
              gameId: game.id, // Keep original game ID
              playerId: roster.playerId,
              quarter: roster.quarter,
              position: roster.position
            };
            
            const rosterResponse = await fetch('/api/rosters', {
              method: 'POST',
              body: JSON.stringify(rosterData),
              headers: { 'Content-Type': 'application/json' }
            });
            
            if (rosterResponse.ok) {
              rostersImported++;
            }
          } catch (error) {
            console.error(`Failed to import roster for game ${newGame.id}, quarter ${roster.quarter}, position ${roster.position}:`, error);
          }
        }
        
        // Import stats for this game
        const gameStats = data.gameStats.filter((s: any) => s.gameId === game.id) || [];
        for (const stat of gameStats) {
          try {
            const statData = {
              id: stat.id, // Keep original ID
              gameId: game.id, // Keep original game ID
              playerId: stat.playerId,
              quarter: stat.quarter,
              goalsFor: stat.goalsFor,
              goalsAgainst: stat.goalsAgainst,
              missedGoals: stat.missedGoals,
              rebounds: stat.rebounds,
              intercepts: stat.intercepts,
              badPass: stat.badPass,
              handlingError: stat.handlingError,
              pickUp: stat.pickUp,
              infringement: stat.infringement,
              rating: stat.rating
            };
            
            const statResponse = await fetch('/api/gamestats', {
              method: 'POST',
              body: JSON.stringify(statData),
              headers: { 'Content-Type': 'application/json' }
            });
            
            if (statResponse.ok) {
              statsImported++;
            }
          } catch (error) {
            console.error(`Failed to import stat for game ${newGame.id}, quarter ${stat.quarter}, player ${stat.playerId}:`, error);
          }
        }
      } catch (error) {
        console.error(`Failed to import game ${formatDate(game.date)}:`, error);
      }
    }
    
    return {
      playersImported,
      opponentsImported,
      gamesImported,
      rostersImported,
      statsImported
    };
  } catch (error) {
    console.error('Failed to import data:', error);
    throw new Error('Failed to import data. Please check the file format and try again.');
  }
}