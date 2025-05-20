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
  // Expanded set of visually appealing, distinct colors for avatars
  const avatarColors = [
    'bg-blue-600',     // Blue
    'bg-purple-600',   // Purple
    'bg-pink-600',     // Pink
    'bg-green-600',    // Green
    'bg-accent',       // Accent (teal)
    'bg-secondary',    // Secondary
    'bg-orange-500',   // Orange
    'bg-primary',      // Primary
    'bg-red-500',      // Red
    'bg-yellow-600',   // Yellow
    'bg-indigo-600',   // Indigo
    'bg-cyan-600',     // Cyan
    'bg-amber-600',    // Amber
    'bg-lime-600',     // Lime
    'bg-emerald-600',  // Emerald
    'bg-violet-600',   // Violet
    'bg-fuchsia-600',  // Fuchsia
    'bg-rose-600',     // Rose
    'bg-sky-600',      // Sky blue
    'bg-blue-800',     // Dark blue
    'bg-indigo-800',   // Dark indigo
    'bg-violet-800',   // Dark violet
    'bg-purple-800',   // Dark purple
    'bg-fuchsia-800',  // Dark fuchsia
    'bg-pink-800',     // Dark pink
    'bg-rose-800',     // Dark rose
    'bg-red-800',      // Dark red
    'bg-orange-800',   // Dark orange
    'bg-amber-800',    // Dark amber
    'bg-yellow-800',   // Dark yellow
    'bg-lime-800',     // Dark lime
    'bg-green-800',    // Dark green
    'bg-emerald-800',  // Dark emerald
    'bg-teal-800',     // Dark teal
    'bg-cyan-800',     // Dark cyan
    'bg-sky-800',      // Dark sky blue
  ];
  
  // Special case handling for specific players by ID
  // We need to manually assign colors to certain players to ensure consistency
  const specialPlayerColors: Record<number, string> = {
    50: 'bg-fuchsia-600', // Mila
    // Add the missing players with consistent colors
    // These IDs can be adjusted based on your actual player IDs
    56: 'bg-green-600',   // Abby D
    60: 'bg-indigo-600',  // JoJo
    64: 'bg-amber-600'    // Abbey N
  };
  
  // Check if this is a player with a special assigned color
  if (playerId && specialPlayerColors[playerId]) {
    return specialPlayerColors[playerId];
  }
  
  if (!playerId) return 'bg-gray-500'; // Default fallback if no player id
  
  // Use player ID modulo the number of colors to select one deterministically
  const colorIndex = playerId % avatarColors.length;
  return avatarColors[colorIndex];
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
