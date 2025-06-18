/**
 * TypeScript interfaces for API responses - enforce flat camelCase structure
 */

export interface ApiGame {
  id: number;
  date: string;
  time: string;
  venue?: string;
  round?: string;
  notes?: string;
  
  // Status fields (flat)
  statusId?: number;
  statusName?: string;
  statusDisplayName?: string;
  statusIsCompleted?: boolean;
  statusAllowsStatistics?: boolean;
  
  // Season fields (flat)
  seasonId?: number;
  seasonName?: string;
  seasonYear?: number;
  seasonStartDate?: string;
  seasonEndDate?: string;
  
  // Team fields (flat)
  homeTeamId?: number;
  homeTeamName?: string;
  homeTeamDivision?: string;
  awayTeamId?: number;
  awayTeamName?: string;
  awayTeamDivision?: string;
}

export interface ApiTeam {
  id: number;
  name: string;
  division?: string;
  isActive: boolean;
  
  // Season fields (flat)
  seasonId?: number;
  seasonName?: string;
  seasonYear?: number;
  seasonStartDate?: string;
  seasonEndDate?: string;
  
  // Club fields (flat)
  clubId: number;
  clubName?: string;
  clubCode?: string;
}

export interface ApiPlayer {
  id: number;
  displayName: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  positionPreferences: string[];
  active: boolean;
  avatarColor?: string;
}

// Validation helper
export function validateApiResponse<T>(data: any, schema: any): T {
  // Add runtime validation logic here if needed
  return data as T;
}