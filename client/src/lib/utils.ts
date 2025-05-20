import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Position, allPositions } from '@shared/schema';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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

export function generatePlayerAvatarColor(playerId?: number | null): string {
  // Comprehensive set of visually distinct colors for avatars
  // Using a wide variety of colors to minimize the chance of duplicates
  const avatarColors = [
    // Primary palette - bright and distinct
    'bg-blue-600',      // Blue
    'bg-purple-600',    // Purple
    'bg-pink-600',      // Pink
    'bg-green-600',     // Green
    'bg-teal-600',      // Teal
    'bg-orange-500',    // Orange
    'bg-red-500',       // Red
    'bg-yellow-600',    // Yellow
    'bg-indigo-600',    // Indigo
    'bg-cyan-600',      // Cyan
    'bg-amber-600',     // Amber
    'bg-lime-600',      // Lime
    'bg-emerald-600',   // Emerald
    'bg-violet-600',    // Violet
    'bg-fuchsia-600',   // Fuchsia
    'bg-rose-600',      // Rose
    'bg-sky-600',       // Sky blue
    
    // Secondary palette - darker variants
    'bg-blue-800',      // Dark blue
    'bg-purple-800',    // Dark purple
    'bg-pink-800',      // Dark pink
    'bg-green-800',     // Dark green
    'bg-teal-800',      // Dark teal
    'bg-orange-800',    // Dark orange
    'bg-red-800',       // Dark red
    'bg-yellow-800',    // Dark yellow
    'bg-indigo-800',    // Dark indigo
    'bg-cyan-800',      // Dark cyan
    'bg-amber-800',     // Dark amber
    'bg-lime-800',      // Dark lime
    'bg-emerald-800',   // Dark emerald
    'bg-violet-800',    // Dark violet
    'bg-fuchsia-800',   // Dark fuchsia
    'bg-rose-800',      // Dark rose
    'bg-sky-800',       // Dark sky blue
    
    // Tertiary palette - lighter variants for even more options
    'bg-blue-400',      // Light blue
    'bg-purple-400',    // Light purple
    'bg-pink-400',      // Light pink
    'bg-green-400',     // Light green
    'bg-teal-400',      // Light teal
    'bg-orange-400',    // Light orange
    'bg-red-400',       // Light red
    'bg-yellow-400',    // Light yellow
    'bg-indigo-400',    // Light indigo
    'bg-cyan-400',      // Light cyan
    'bg-amber-400',     // Light amber
    'bg-lime-400',      // Light lime
    'bg-emerald-400',   // Light emerald
    'bg-violet-400',    // Light violet
    'bg-fuchsia-400',   // Light fuchsia
    'bg-rose-400',      // Light rose
    'bg-sky-400',       // Light sky blue
  ];
  
  // Map of specific players to their designated colors to ensure consistency
  const playerColorMap: Record<number, string> = {
    // IMPORTANT: These are the exact colors we want to use for these specific players
    56: 'bg-blue-600',     // Lucia
    57: 'bg-emerald-600',  // Isla
    58: 'bg-teal-600',     // JoJo
    59: 'bg-orange-500',   // Abby D
    60: 'bg-red-500',      // Abbey N
    61: 'bg-yellow-600',   // Emily
    62: 'bg-indigo-600',   // Ollie
    63: 'bg-sky-600',      // Evie
    64: 'bg-purple-600',   // Mila
    65: 'bg-pink-500',     // Olive
    66: 'bg-lime-600',     // Xanthe
  };
  
  // Return the designated color for these special players
  if (playerId && playerColorMap[playerId]) {
    return playerColorMap[playerId];
  }
  
  if (!playerId) return 'bg-gray-500'; // Default fallback if no player id
  
  // Filter out colors that are already assigned to specific players
  // This ensures new players never get the same color as our fixed players
  const reservedColors = Object.values(playerColorMap);
  const availableColors = avatarColors.filter(color => !reservedColors.includes(color));
  
  // Use a better hash function based on prime numbers for more uniqueness
  // Use player ID to generate a consistent but well-distributed index
  const seed = (playerId * 31) + (playerId % 17); // Using prime numbers for better distribution
  const hashIndex = Math.abs(seed % availableColors.length);
  
  return availableColors[hashIndex];
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
