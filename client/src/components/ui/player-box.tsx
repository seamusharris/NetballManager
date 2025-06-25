import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { 
  getPlayerColorHex, 
  getLighterColorHex, 
  getMediumColorHex,
  getBorderColorHex
} from '@/lib/playerColorUtils';
import { PLAYER_BOX_STYLES } from '@/lib/playerBoxStyles';

interface PlayerBoxProps {
  player: {
    id: number;
    displayName: string;
    firstName?: string;
    lastName?: string;
    positionPreferences?: string[];
    avatarColor?: string;
    active?: boolean;
  };
  actions?: React.ReactNode;
  showPositions?: boolean;
  stats?: {
    label: string;
    value: string | number;
  }[];
  className?: string;
  size?: 'sm' | 'ms' | 'md' | 'lg';
  style?: React.CSSProperties;
  onClick?: () => void;
  customBadge?: React.ReactNode;
  hasSelect?: boolean;
  // Selection props
  isSelected?: boolean;
  isSelectable?: boolean;
  onSelectionChange?: (playerId: number, isSelected: boolean) => void;
  selectionMode?: 'checkbox' | 'toggle' | 'none';
  selectionPosition?: 'right' | 'left';
  // Status indicators for loading states
  isLoading?: boolean;
  isDisabled?: boolean;
  // Quick action support
  showQuickActions?: boolean;
  quickActions?: React.ReactNode;
}

function PlayerBox({ 
  player, 
  actions, 
  showPositions = true, 
  stats,
  className = "",
  size = "md",
  style = {},
  onClick,
  customBadge,
  hasSelect = false,
  // Selection props with defaults
  isSelected = false,
  isSelectable = false,
  onSelectionChange,
  selectionMode = 'checkbox',
  selectionPosition = 'right',
  // Status indicators
  isLoading = false,
  isDisabled = false,
  // Quick actions
  showQuickActions = false,
  quickActions
}: PlayerBoxProps) {
  // Add null safety check
  if (!player) {
    return null;
  }

  // Size-based styling
  const sizeClasses = {
    sm: "p-2",
    ms: "p-2.5", // Medium-small: between small and medium
    md: "p-3", 
    lg: "p-4"
  };

  const avatarSizes = {
    sm: 8, // 32px
    ms: 10, // 40px - between small and medium
    md: 12, // 48px  
    lg: 16  // 64px
  };

  const textSizes = {
    sm: {
      name: "text-sm",
      position: "text-xs",
      stats: "text-sm"
    },
    ms: {
      name: "text-sm", // Same as small but with more space
      position: "text-xs",
      stats: "text-sm"
    },
    md: {
      name: "text-base",
      position: "text-sm", 
      stats: "text-base"
    },
    lg: {
      name: "text-lg",
      position: "text-base",
      stats: "text-lg"
    }
  };

  // Safe fallback to prevent undefined access
  const currentTextSizes = textSizes[size] || textSizes.md;

  const playerInitials = (() => {
    if (player.firstName && player.lastName) {
      return getInitials(player.firstName, player.lastName);
    }
    if (player.displayName) {
      const nameParts = player.displayName.split(' ');
      if (nameParts.length >= 2) {
        return getInitials(nameParts[0], nameParts[nameParts.length - 1]);
      }
      return player.displayName[0]?.toUpperCase() || '';
    }
    return '';
  })();

  const playerColorHex = getPlayerColorHex(player.avatarColor);
  const lightBackgroundColor = getLighterColorHex(player.avatarColor);
  const mediumBackgroundColor = getMediumColorHex(player.avatarColor);
  const borderColorHex = getBorderColorHex(player.avatarColor);

  // Calculate styling based on selection state
  const getSelectionStyling = () => {
    const effectiveSelected = !isSelectable || isSelected;

    // Apply loading/disabled states
    let opacity = 1;
    if (isLoading || isDisabled) {
      opacity = 0.6;
    } else if (!effectiveSelected && isSelectable) {
      opacity = 0.8;
    }

    if (effectiveSelected) {
      // Selected state: use medium background and player color border
      return {
        backgroundColor: mediumBackgroundColor,
        borderColor: playerColorHex,
        color: borderColorHex,
        opacity
      };
    } else {
      // Deselected state: use light background
      return {
        backgroundColor: lightBackgroundColor,
        borderColor: playerColorHex,
        color: borderColorHex,
        opacity
      };
    }
  };

  const selectionStyling = getSelectionStyling();

  // Merge with any external style overrides
  const defaultStyle = {
    ...selectionStyling,
    ...style
  };

  // Always include border
  const borderClass = "border-2";

  // Handle selection click
  const handleSelectionClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the main onClick
    
    if (isLoading || isDisabled) return;
    
    if (onSelectionChange && isSelectable) {
      onSelectionChange(player.id, !isSelected);
    }
  };

  // Handle box click for selection
  const handleBoxClick = () => {
    if (isLoading || isDisabled) return;
    
    if (isSelectable && onSelectionChange) {
      onSelectionChange(player.id, !isSelected);
    } else if (onClick) {
      onClick();
    }
  };

  // Render selection checkbox
  const renderSelectionCheckbox = () => {
    if (!isSelectable) return null;

    const checkboxStyle = {
      backgroundColor: isSelected ? playerColorHex : 'transparent',
      borderColor: isSelected ? 'transparent' : borderColorHex,
      border: isSelected ? 'none' : '2px solid',
      color: 'white',
      cursor: (isLoading || isDisabled) ? 'not-allowed' : 'pointer',
      opacity: (isLoading || isDisabled) ? 0.5 : 1
    };

    return (
      <div 
        className="w-6 h-6 rounded flex items-center justify-center text-white transition-all duration-200 flex-shrink-0"
        style={checkboxStyle}
        onClick={handleSelectionClick}
      >
        {isLoading ? '⟳' : (isSelected && '✓')}
      </div>
    );
  };

  const playerBoxContent = (
    <div 
      className={cn(
        "flex items-center space-x-3 rounded-lg shadow-md transition-all duration-200",
        borderClass,
        sizeClasses[size],
        (onClick || isSelectable) && PLAYER_BOX_STYLES.interactive,
        isSelectable && "cursor-pointer"
      )}
      style={defaultStyle}
      onClick={handleBoxClick}
    >
      <div 
        className={cn(
          "rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg",
          player.avatarColor || 'bg-gray-500',
          {
            'w-10 h-10 text-sm': size === 'sm',
            'w-12 h-12 text-sm': size === 'ms',
            'w-14 h-14 text-base': size === 'md',
            'w-20 h-20 text-2xl': size === 'lg'
          }
        )}
      >
        {playerInitials}
      </div>

      {/* Player Details */}
      <div className="flex-1 flex items-center">
        <div className="flex-1">
          <div className={`${currentTextSizes.name} font-bold player-name`}>
            {player.displayName}
          </div>

          {showPositions && (
            <div className={`${currentTextSizes.position} player-positions flex items-center gap-2`}>
              <span>
                {Array.isArray(player.positionPreferences) && player.positionPreferences.length > 0 
                  ? player.positionPreferences.join(', ') 
                  : 'No position preferences'}
              </span>
              {customBadge ? (
                <span className="inline-flex items-center">{customBadge}</span>
              ) : (
                player.active === false && (
                  <Badge variant="secondary" className="text-xs ml-1">Inactive</Badge>
                )
              )}
            </div>
          )}

          {!showPositions && (customBadge || player.active === false) && (
            <div className={`${currentTextSizes.position} flex items-center gap-2`}>
              {customBadge ? (
                <span className="inline-flex items-center">{customBadge}</span>
              ) : (
                player.active === false && (
                  <Badge variant="secondary" className="text-xs">Inactive</Badge>
                )
              )}
            </div>
          )}
        </div>

        {/* Stats positioned on the right */}
        {stats && stats.length > 0 && (
          <div className={cn(
            "flex space-x-6 ml-6",
            // Adjust right margin based on select box presence and size
            (hasSelect || isSelectable) 
              ? (size === 'sm' ? "mr-12" : size === 'ms' ? "mr-13" : size === 'md' ? "mr-14" : "mr-16") // More space when select is present
              : (sizeClasses[size] === "p-2" ? "mr-2" : sizeClasses[size] === "p-2.5" ? "mr-2.5" : sizeClasses[size] === "p-3" ? "mr-3" : "mr-4") // Match avatar spacing when no select
          )}>
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`${size === 'sm' ? 'text-lg' : size === 'md' ? 'text-2xl' : 'text-3xl'} font-bold`}>
                  {stat.value}
                </div>
                <div className={`${currentTextSizes.stats} opacity-75`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Selection checkbox */}
        {isSelectable && selectionPosition === 'right' && (
          <div className="flex items-center ml-3">
            {renderSelectionCheckbox()}
          </div>
        )}
      </div>

      {/* Selection checkbox on left if positioned there */}
      {isSelectable && selectionPosition === 'left' && (
        <div className="flex items-center mr-3">
          {renderSelectionCheckbox()}
        </div>
      )}
    </div>
  );

  if (actions) {
    return (
      <div className={`space-y-3 ${className}`}>
        {playerBoxContent}
        <div className="flex items-center justify-end space-x-2">
          {actions}
        </div>
      </div>
    );
  }

  return <div className={className}>{playerBoxContent}</div>;
}

export { PlayerBox };

// Add default export for compatibility
export default PlayerBox;