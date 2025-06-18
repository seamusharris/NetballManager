
import { cn } from '@/lib/utils';

// Common player box styling classes
export const PLAYER_BOX_STYLES = {
  // Base container styles
  container: "p-4 border rounded-lg shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer",
  
  // Border variants
  selectedBorder: "border-2",
  unselectedBorder: "border border-gray-200",
  
  // Checkbox styles
  checkbox: "w-6 h-6 rounded flex items-center justify-center cursor-pointer text-white transition-all duration-200",
  
  // Interactive states
  interactive: "cursor-pointer hover:shadow-lg hover:scale-[1.02]",
  nonInteractive: "",
} as const;

// Helper function to get player box container classes
export function getPlayerBoxContainerClasses(isSelected: boolean, isInteractive: boolean = true) {
  return cn(
    PLAYER_BOX_STYLES.container,
    isSelected ? PLAYER_BOX_STYLES.selectedBorder : PLAYER_BOX_STYLES.unselectedBorder,
    isInteractive ? PLAYER_BOX_STYLES.interactive : PLAYER_BOX_STYLES.nonInteractive
  );
}

// Helper function to get checkbox classes and styles
export function getPlayerBoxCheckboxStyles(isSelected: boolean, playerColorHex: string) {
  return {
    className: PLAYER_BOX_STYLES.checkbox,
    style: {
      backgroundColor: isSelected ? playerColorHex : 'transparent',
      border: isSelected ? 'none' : `2px solid ${playerColorHex}80`
    }
  };
}

// Common player box color utilities (if not already centralized)
export function getPlayerBoxBackgroundStyle(isSelected: boolean, playerColor: string, lightColor: string, mediumColor: string) {
  return {
    borderColor: playerColor,
    backgroundColor: isSelected ? mediumColor : lightColor
  };
}
