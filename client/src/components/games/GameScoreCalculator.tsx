import { Game, GameStat, Roster, Position } from '@shared/schema';

/**
 * Calculate game scores from position-based statistics
 */
export function calculateGameScores(game: Game, gameStats: GameStat[], rosters: Roster[]) {
  // Initialize score structure
  const quarterScores = {
    '1': { for: 0, against: 0 },
    '2': { for: 0, against: 0 },
    '3': { for: 0, against: 0 },
    '4': { for: 0, against: 0 }
  };
  
  // Process game stats
  if (Array.isArray(gameStats)) {
    // Process position-based stats
    gameStats.forEach(stat => {
      if (
        stat && 
        stat.gameId === game.id && 
        stat.quarter && 
        stat.quarter >= 1 && 
        stat.quarter <= 4
      ) {
        const quarterKey = stat.quarter.toString() as '1' | '2' | '3' | '4';
        
        // Add goal counts to quarter totals
        quarterScores[quarterKey].for += (stat.goalsFor || 0);
        quarterScores[quarterKey].against += (stat.goalsAgainst || 0);
      }
    });
  }
  
  // Calculate final score
  const finalScore = {
    for: quarterScores['1'].for + quarterScores['2'].for + 
         quarterScores['3'].for + quarterScores['4'].for,
    against: quarterScores['1'].against + quarterScores['2'].against +
             quarterScores['3'].against + quarterScores['4'].against
  };
  
  return {
    quarterScores,
    finalScore
  };
}

/**
 * Get player ID for a position in a specific quarter
 */
export function getPlayerForPosition(position: Position, quarter: number, rosters: Roster[]): number | null {
  if (!Array.isArray(rosters)) {
    return null;
  }
  
  const roster = rosters.find(r => 
    r.position === position && 
    r.quarter === quarter
  );
  
  return roster ? roster.playerId : null;
}

/**
 * Get position for a player in a specific quarter
 */
export function getPositionForPlayer(playerId: number, quarter: number, rosters: Roster[]): Position | null {
  if (!Array.isArray(rosters)) {
    return null;
  }
  
  const roster = rosters.find(r => 
    r.playerId === playerId && 
    r.quarter === quarter
  );
  
  return roster ? roster.position : null;
}

/**
 * Get game stat for a position in a specific quarter
 */
export function getStatForPosition(position: Position, quarter: number, gameStats: GameStat[]): GameStat | null {
  if (!Array.isArray(gameStats)) {
    return null;
  }
  
  const stat = gameStats.find(s => 
    s.position === position && 
    s.quarter === quarter
  );
  
  return stat || null;
}