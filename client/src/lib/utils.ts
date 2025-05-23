import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Position, allPositions } from '@shared/schema';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTailwindColorClass(hexColor: string): string | undefined {
  // Simple mapping of hex colors to Tailwind classes
  const colorMap: Record<string, string> = {
    '#ef4444': 'bg-red-500',
    '#f97316': 'bg-orange-500',
    '#f59e0b': 'bg-amber-500',
    '#eab308': 'bg-yellow-500',
    '#84cc16': 'bg-lime-500',
    '#22c55e': 'bg-green-500',
    '#10b981': 'bg-emerald-500',
    '#14b8a6': 'bg-teal-500',
    '#06b6d4': 'bg-cyan-500',
    '#0ea5e9': 'bg-sky-500',
    '#3b82f6': 'bg-blue-500',
    '#6366f1': 'bg-indigo-500',
    '#8b5cf6': 'bg-violet-500',
    '#a855f7': 'bg-purple-500',
    '#d946ef': 'bg-fuchsia-500',
    '#ec4899': 'bg-pink-500',
    '#f43f5e': 'bg-rose-500',
  };

  return colorMap[hexColor?.toLowerCase()];
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  
  try {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  } catch (error) {
    return dateStr;
  }
}

export function formatShortDate(date: string): string {
  const options: Intl.DateTimeFormatOptions = { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  };
  
  return new Date(date).toLocaleDateString('en-US', options);
}

export const positionLabels: Record<Position, string> = {
  'GS': 'Goal Shooter',
  'GA': 'Goal Attack',
  'WA': 'Wing Attack',
  'C': 'Center',
  'WD': 'Wing Defense',
  'GD': 'Goal Defense',
  'GK': 'Goal Keeper'
};

// Import allPositions from schema rather than redefining it here
// export const allPositions: Position[] = ['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'];

// Position groups for filtering
export const positionGroups = {
  'attackers': ['GS', 'GA'] as Position[],
  'mid-courters': ['WA', 'C', 'WD'] as Position[],
  'defenders': ['GD', 'GK'] as Position[]
};

export function getQuarterLabel(quarter: number): string {
  return `Quarter ${quarter}`;
}

export function generateRandomColor(seed: string): string {
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Convert to color
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 60%, 50%)`;
}

export function generatePlayerAvatarColor(): string {
  // Just return a default fallback color
  // All player colors should come from their database records
  return 'bg-gray-500';
}

export function calculateTotalGoals(stats: any[], forTeam: boolean = true): number {
  const field = forTeam ? 'goalsFor' : 'goalsAgainst';
  return stats.reduce((sum, stat) => sum + (stat[field] || 0), 0);
}

/**
 * Check if a position is an on-court position (not "off")
 * @param position The position to check
 * @returns true if the position is an actual playing position (GS, GA, WA, C, WD, GD, GK)
 */
export function isOnCourtPosition(position: string): boolean {
  // Explicitly check against the actual position values instead of using allPositions
  const onCourtPositions = ['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'];
  return onCourtPositions.includes(position);
}

/**
 * Check if a player was on court in an actual position for a specific game quarter
 * @param playerId The player's ID
 * @param gameId The game's ID
 * @param quarter The quarter number
 * @param rosters The roster data for the game
 * @returns true if the player was on court in an actual position for this quarter
 */
export function wasPlayerOnCourt(
  playerId: number, 
  gameId: number, 
  quarter: number, 
  rosters: any[]
): boolean {
  if (!rosters || !Array.isArray(rosters)) return false;
  
  // Find the roster entry for this player, game, and quarter
  const rosterEntry = rosters.find(roster => 
    roster.playerId === playerId && 
    roster.gameId === gameId && 
    roster.quarter === quarter
  );
  
  // Check if the player was assigned to an actual on-court position
  return !!rosterEntry && isOnCourtPosition(rosterEntry.position);
}

/**
 * Check if a player participated in a game in an on-court position for at least one quarter
 * @param playerId The player's ID
 * @param gameId The game's ID 
 * @param rosters The roster data for the game
 * @returns true if the player was on court for at least one quarter
 */
export function didPlayerParticipateInGame(
  playerId: number,
  gameId: number,
  rosters: any[]
): boolean {
  if (!rosters || !Array.isArray(rosters)) return false;
  
  // Find any roster entries where the player was in an on-court position
  return rosters.some(roster => 
    roster.playerId === playerId && 
    roster.gameId === gameId && 
    isOnCourtPosition(roster.position)
  );
}

export function sortByDate<T extends { date: string }>(items: T[], ascending: boolean = false): T[] {
  return [...items].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
}

export function getWinLoseLabel(teamScore: number, opponentScore: number): 'Win' | 'Loss' | 'Draw' {
  if (teamScore > opponentScore) return 'Win';
  if (teamScore < opponentScore) return 'Loss';
  return 'Draw';
}

export function getWinLoseClass(status: 'Win' | 'Loss' | 'Draw'): string {
  switch (status) {
    case 'Win': return 'bg-success/10 text-success';
    case 'Loss': return 'bg-error/10 text-error';
    case 'Draw': return 'bg-warning/10 text-warning';
    default: return 'bg-gray-100 text-gray-600';
  }
}

/**
 * Check if a game is a forfeit game
 * @param game The game object or game status string
 * @returns true if the game is any type of forfeit game
 */
export function isForfeitGame(game: { status?: string | null } | string | undefined): boolean {
  if (!game) return false;
  
  const status = typeof game === 'string' ? game : game.status;
  return status === 'forfeit-win' || status === 'forfeit-loss';
}

/**
 * Check if a game allows statistics to be recorded
 * @param game The game object or game status string
 * @returns true if the game allows statistics (not forfeit, not BYE)
 */
export function gameAllowsStatistics(game: { status?: string, isBye?: boolean } | undefined): boolean {
  if (!game) return false;
  
  // Forfeit games and BYE games don't record statistics
  return !isForfeitGame(game) && !(game.isBye === true);
}

/**
 * Get the fixed score for a forfeit game
 * @param game The game object or game status string
 * @returns The forfeit game scores by quarter and final
 */
export function getForfeitGameScore(game: { status?: string | null } | string | undefined) {
  if (!game) {
    return {
      quarterScores: {
        '1': { for: 0, against: 0 },
        '2': { for: 0, against: 0 },
        '3': { for: 0, against: 0 },
        '4': { for: 0, against: 0 }
      },
      finalScore: { for: 0, against: 0 }
    };
  }
  
  const status = typeof game === 'string' ? game : game.status;
  const isWin = status === 'forfeit-win';
  
  // For forfeit-win: GS and GA score 5 goals each in Q1 (10-0 total)
  // For forfeit-loss: 5 goals in Q1 against GK and 5 in Q1 against GD (0-10 total)
  return {
    quarterScores: {
      '1': { for: isWin ? 10 : 0, against: isWin ? 0 : 10 },
      '2': { for: 0, against: 0 },
      '3': { for: 0, against: 0 },
      '4': { for: 0, against: 0 }
    },
    teamScore: isWin ? 10 : 0,
    opponentScore: isWin ? 0 : 10,
    finalScore: { for: isWin ? 10 : 0, against: isWin ? 0 : 10 }
  };
}
