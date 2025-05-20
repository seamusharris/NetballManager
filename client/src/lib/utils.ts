import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Position } from '@shared/schema';

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

export const allPositions: Position[] = ['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'];

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
    'bg-blue-500',      // Light blue
    'bg-purple-500',    // Light purple
    'bg-pink-500',      // Light pink
    'bg-green-500',     // Light green
    'bg-teal-500',      // Light teal
    'bg-orange-400',    // Light orange
    'bg-red-400',       // Light red
    'bg-yellow-500',    // Light yellow
    'bg-indigo-500',    // Light indigo
    'bg-cyan-500',      // Light cyan
    'bg-amber-500',     // Light amber
    'bg-lime-500',      // Light lime
    'bg-emerald-500',   // Light emerald
    'bg-violet-500',    // Light violet
    'bg-fuchsia-500',   // Light fuchsia
    'bg-rose-500',      // Light rose
    'bg-sky-500',       // Light sky blue
  ];
  
  // Map of specific players to their designated colors to ensure consistency
  const playerColorMap: Record<number, string> = {
    // Specific players with fixed colors
    56: 'bg-blue-600',     // Lucia
    57: 'bg-emerald-600',  // Isla
    58: 'bg-teal-600',     // JoJo
    59: 'bg-orange-500',   // Abby D
    60: 'bg-red-500',      // Abbey N
    61: 'bg-yellow-600',   // Emily
    62: 'bg-indigo-600',   // Ollie
    63: 'bg-sky-600',      // Evie
    64: 'bg-purple-600',   // Mila
    65: 'bg-pink-500',     // Olive (changed from pink-600 to avoid duplication)
    66: 'bg-lime-600',     // Xanthe (changed from green-600 to avoid duplication)
  };
  
  // Return the designated color for this player if it exists
  if (playerId && playerColorMap[playerId]) {
    return playerColorMap[playerId];
  }
  
  if (!playerId) return 'bg-gray-500'; // Default fallback if no player id
  
  // For new players, use a hash function based on ID to better distribute colors
  // This gives us a more unique distribution than simple modulo
  const hashIndex = Math.abs((playerId * 13) % avatarColors.length);
  return avatarColors[hashIndex];
}

export function calculateTotalGoals(stats: any[], forTeam: boolean = true): number {
  const field = forTeam ? 'goalsFor' : 'goalsAgainst';
  return stats.reduce((sum, stat) => sum + (stat[field] || 0), 0);
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
