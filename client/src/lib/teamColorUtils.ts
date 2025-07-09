
// Team Color System - Separate from player colors for better team identification
export const getTeamColorHex = (teamColor?: string): string => {
  if (!teamColor) return '#6b7280'; // gray-500 fallback

  const teamColorMap: Record<string, string> = {
    // Bold, saturated colors for team identification
    'team-red': '#dc2626',      // Strong red
    'team-orange': '#ea580c',   // Vibrant orange  
    'team-yellow': '#d97706',   // Golden yellow
    'team-green': '#059669',    // Deep green
    'team-teal': '#0891b2',     // Strong teal
    'team-blue': '#2563eb',     // Bold blue
    'team-indigo': '#4338ca',   // Deep indigo
    'team-purple': '#7c3aed',   // Rich purple
    'team-pink': '#db2777',     // Bright pink
    'team-rose': '#be185d',     // Deep rose
    'team-slate': '#475569',    // Dark slate
    'team-emerald': '#047857',  // Emerald green
  };

  return teamColorMap[teamColor] || '#6b7280';
};

// Generate light background color for team boxes
export const getTeamLightBg = (teamColor?: string): string => {
  const baseColor = getTeamColorHex(teamColor);
  return `color-mix(in srgb, ${baseColor} 10%, white 90%)`;
};

// Generate medium background color for hover states
export const getTeamMediumBg = (teamColor?: string): string => {
  const baseColor = getTeamColorHex(teamColor);
  return `color-mix(in srgb, ${baseColor} 18%, white 82%)`;
};

// Generate border color for team elements
export const getTeamBorderColor = (teamColor?: string): string => {
  const baseColor = getTeamColorHex(teamColor);
  return `color-mix(in srgb, ${baseColor} 40%, white 60%)`;
};

// Generate avatar gradient colors
export const getTeamAvatarGradient = (teamColor?: string): { from: string; to: string } => {
  const baseColor = getTeamColorHex(teamColor);
  return {
    from: baseColor,
    to: `color-mix(in srgb, ${baseColor} 85%, black 15%)`
  };
};

// Team color options for assignment
export const TEAM_COLORS = [
  { name: 'Red', value: 'team-red', hex: '#dc2626' },
  { name: 'Orange', value: 'team-orange', hex: '#ea580c' },
  { name: 'Yellow', value: 'team-yellow', hex: '#d97706' },
  { name: 'Green', value: 'team-green', hex: '#059669' },
  { name: 'Teal', value: 'team-teal', hex: '#0891b2' },
  { name: 'Blue', value: 'team-blue', hex: '#2563eb' },
  { name: 'Indigo', value: 'team-indigo', hex: '#4338ca' },
  { name: 'Purple', value: 'team-purple', hex: '#7c3aed' },
  { name: 'Pink', value: 'team-pink', hex: '#db2777' },
  { name: 'Rose', value: 'team-rose', hex: '#be185d' },
  { name: 'Emerald', value: 'team-emerald', hex: '#047857' },
  { name: 'Slate', value: 'team-slate', hex: '#475569' },
] as const;

export type TeamColor = typeof TEAM_COLORS[number]['value'];
