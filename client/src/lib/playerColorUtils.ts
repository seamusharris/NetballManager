// Helper functions to convert Tailwind class to hex and generate dynamic colors using CSS functions
export const getPlayerColorHex = (avatarColor?: string): string => {
  if (!avatarColor) return '#6b7280'; // gray-500 fallback

  const colorMap: Record<string, string> = {
    'bg-red-500': '#ef4444', 'bg-red-600': '#dc2626', 'bg-red-700': '#b91c1c',
    'bg-orange-500': '#f97316', 'bg-orange-600': '#ea580c', 'bg-orange-700': '#c2410c',
    'bg-amber-500': '#f59e0b', 'bg-amber-600': '#d97706', 'bg-amber-700': '#b45309',
    'bg-yellow-500': '#eab308', 'bg-yellow-600': '#ca8a04', 'bg-yellow-700': '#a16207',
    'bg-lime-500': '#84cc16', 'bg-lime-600': '#65a30d', 'bg-lime-700': '#4d7c0f',
    'bg-green-500': '#22c55e', 'bg-green-600': '#16a34a', 'bg-green-700': '#15803d',
    'bg-emerald-500': '#10b981', 'bg-emerald-600': '#059669', 'bg-emerald-700': '#047857',
    'bg-teal-500': '#14b8a6', 'bg-teal-600': '#0d9488', 'bg-teal-700': '#0f766e',
    'bg-cyan-500': '#06b6d4', 'bg-cyan-600': '#0891b2', 'bg-cyan-700': '#0e7490',
    'bg-sky-500': '#0ea5e9', 'bg-sky-600': '#0284c7', 'bg-sky-700': '#0369a1',
    'bg-blue-500': '#3b82f6', 'bg-blue-600': '#2563eb', 'bg-blue-700': '#1d4ed8',
    'bg-indigo-500': '#6366f1', 'bg-indigo-600': '#4f46e5', 'bg-indigo-700': '#4338ca',
    'bg-violet-500': '#8b5cf6', 'bg-violet-600': '#7c3aed', 'bg-violet-700': '#6d28d9',
    'bg-purple-500': '#a855f7', 'bg-purple-600': '#9333ea', 'bg-purple-700': '#7e22ce',
    'bg-fuchsia-500': '#d946ef', 'bg-fuchsia-600': '#c026d3', 'bg-fuchsia-700': '#a21caf',
    'bg-pink-500': '#ec4899', 'bg-pink-600': '#db2777', 'bg-pink-700': '#be185d',
    'bg-rose-500': '#f43f5e', 'bg-rose-600': '#e11d48', 'bg-rose-700': '#be123c',
    'bg-gray-500': '#6b7280', 'bg-gray-600': '#4b5563', 'bg-gray-700': '#374151'
  };

  return colorMap[avatarColor] || '#6b7280';
};

// Generate very light background color (matches Interactive Example 1 unselected)
export const getLighterColorHex = (avatarColor?: string): string => {
  const baseColor = getPlayerColorHex(avatarColor);
  return `color-mix(in srgb, ${baseColor} 8%, white 92%)`;
};

// Generate medium background color (matches Interactive Example 1 selected)
export const getMediumColorHex = (avatarColor?: string): string => {
  const baseColor = getPlayerColorHex(avatarColor);
  return `color-mix(in srgb, ${baseColor} 15%, white 85%)`;
};

// Generate darker color for text/borders (matches interactive example)
export const getDarkerColorHex = (avatarColor?: string): string => {
  const baseColor = getPlayerColorHex(avatarColor);
  return `color-mix(in srgb, ${baseColor} 85%, black 15%)`;
};

// Generate much darker color for enhanced contrast
export const getMuchDarkerColorHex = (avatarColor?: string): string => {
  const baseColor = getPlayerColorHex(avatarColor);
  return `color-mix(in srgb, ${baseColor} 50%, black 50%)`;
};