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