import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Position } from '@shared/schema';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function formatDate(dateStr: string): string {
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
