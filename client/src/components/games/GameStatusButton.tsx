// GameStatusButton.tsx
// Re-export components from GameStatusBadge.tsx to maintain backward compatibility
// This prevents breaking existing imports

import { 
  GameStatusBadge,
  GameStatusButton as StatusButton,
  getStatusClass,
  getStatusDisplay
} from './GameStatusBadge';

// Re-export all components with their original names
export { 
  GameStatusBadge,
  getStatusClass,
  getStatusDisplay
};

// Re-export the GameStatusButton to maintain compatibility
export const GameStatusButton = StatusButton;