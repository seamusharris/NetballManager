/**
 * TypeScript interfaces for API responses - enforce flat camelCase structure
 */

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

export interface ApiDivision {
  id: number;
  ageGroupId: number;
  sectionId: number;
  seasonId: number;
  seasonName: string;
  displayName: string;
  description?: string;
  isActive: boolean;
  teamCount: number;
  ageGroupName: string;
  sectionName: string;
}