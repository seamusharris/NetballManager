import { Player } from '@shared/schema';
import { PlayerBox } from '@/components/ui/player-box';
import { getPlayerColorHex, getDarkerColorHex, getLighterColorHex, getMediumColorHex } from '@/lib/playerColorUtils';

interface SelectablePlayerBoxProps {
  player: Player;
  isSelected: boolean;
  onSelectionChange: (playerId: number, selected: boolean) => void;
  size?: "sm" | "md" | "lg";
  showPositions?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function SelectablePlayerBox({
  player,
  isSelected,
  onSelectionChange,
  size = "md",
  showPositions = true,
  className = "",
  style = {}
}: SelectablePlayerBoxProps) {
  const playerColorHex = getPlayerColorHex(player.avatarColor);
  const darkerTextColor = getDarkerColorHex(player.avatarColor);
  const lightBackgroundColor = getLighterColorHex(player.avatarColor);
  const mediumBackgroundColor = getMediumColorHex(player.avatarColor);

  const handleClick = () => {
    onSelectionChange(player.id, !isSelected);
  };

  const mergedStyle = {
    backgroundColor: isSelected ? mediumBackgroundColor : lightBackgroundColor,
    borderColor: darkerTextColor,
    color: darkerTextColor,
    ...style
  };

  return (
    <div className="relative">
      <div 
        className="absolute top-1/2 right-3 w-6 h-6 rounded flex items-center justify-center cursor-pointer text-white z-10 transform -translate-y-1/2 mr-3 transition-all duration-200"
        style={{ 
          backgroundColor: isSelected ? playerColorHex : 'transparent', 
          border: isSelected ? 'none' : `2px solid ${playerColorHex}80` 
        }}
        onClick={handleClick}
      >
        {isSelected && '✓'}
      </div>
      <PlayerBox 
        player={player}
        size={size}
        showPositions={showPositions}
        hasSelect={true}
        className={`shadow-md transition-all duration-200 hover:shadow-lg cursor-pointer ${className}`}
        style={mergedStyle}
        onClick={handleClick}
      />
    </div>
  );
}