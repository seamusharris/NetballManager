import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { 
  getPlayerColorHex, 
  getLighterColorHex, 
  getMediumColorHex,
  getBorderColorHex,
  getDarkerColorHex
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
  size?: 'sm' | 'md' | 'lg' | 'xl';
  style?: React.CSSProperties;
  onClick?: (playerId: number) => void;
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
    md: "p-3", 
    lg: "p-4",
    xl: "p-6"
  };

  const avatarSizes = {
    sm: 8, // 32px
    md: 12, // 48px  
    lg: 16, // 64px
    xl: 20  // 80px
  };

  const textSizes = {
    sm: {
      name: "text-sm",
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
    },
    xl: {
      name: "text-xl",
      position: "text-lg",
      stats: "text-xl"
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
  const darkerColor = getDarkerColorHex(player.avatarColor);

  // Handle selection state - use prop value directly for controlled component behavior
  const selectedState = isSelected || false;

  const handleClick = useCallback(() => {
    if (!isSelectable) {
      onClick?.(player.id);
      return;
    }

    const newSelectedState = !selectedState;
    onSelectionChange?.(player.id, newSelectedState);
    onClick?.(player.id);
  }, [isSelectable, selectedState, onSelectionChange, onClick, player.id]);

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
      // Selected state: use medium background and border color matching text
      return {
        backgroundColor: mediumBackgroundColor,
        borderColor: borderColorHex,
        color: borderColorHex,
        opacity
      };
    } else {
      // Deselected state: use light background and border color matching text
      return {
        backgroundColor: lightBackgroundColor,
        borderColor: borderColorHex,
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
      backgroundColor: isSelected ? borderColorHex : 'transparent',
      borderColor: borderColorHex,
      border: isSelected ? 'none' : `2px solid ${borderColorHex}`,
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
            'w-8 h-8 text-sm': size === 'sm',
            'w-12 h-12 text-base': size === 'md',
            'w-16 h-16 text-lg': size === 'lg',
            'w-20 h-20 text-xl': size === 'xl'
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