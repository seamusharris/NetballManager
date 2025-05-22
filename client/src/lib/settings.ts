/**
 * Application-wide settings and configuration
 * This file contains global settings that can be used across the application
 */

// Function to get stored settings with fallbacks
const getSetting = (key: string, defaultValue: string): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(`app_${key}`) || defaultValue;
  }
  return defaultValue;
};

// Team information - dynamically loaded from localStorage with defaults
export const TEAM_NAME = getSetting('team_name', 'Netball Team');
export const TEAM_SHORT_NAME = getSetting('team_short_name', 'Netball Team');

// Application settings
export const APP_NAME = "Netball Stats Tracker";

// Date formats
export const DATE_FORMAT = "MMMM d, yyyy";
export const SHORT_DATE_FORMAT = "MMM d, yyyy";
export const TIME_FORMAT = "h:mm a";

// Default values
export const DEFAULT_POSITION_ORDER = ["GS", "GA", "WA", "C", "WD", "GD", "GK"];