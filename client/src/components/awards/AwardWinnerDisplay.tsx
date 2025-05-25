import React from 'react';
import { type Player } from '@shared/schema';

interface AwardWinnerDisplayProps {
  awardWinnerId: number | null;
  players: Player[];
}

export default function AwardWinnerDisplay({ awardWinnerId, players }: AwardWinnerDisplayProps) {
  if (!awardWinnerId) {
    return (
      <div className="flex items-center justify-center h-full py-6 text-gray-500 italic">
        No award winner has been selected for this game.
      </div>
    );
  }
  
  // Find the award winner player
  const awardWinner = players.find(p => p.id === awardWinnerId);
  
  if (!awardWinner) {
    return (
      <div className="text-center text-gray-500 italic">
        Player not found (ID: {awardWinnerId})
      </div>
    );
  }
  
  // Ensure we have a display name
  const playerName = awardWinner.displayName || `${awardWinner.firstName} ${awardWinner.lastName}`;
  const initial = playerName.charAt(0);
  const backgroundColor = awardWinner.avatarColor || "#6366f1";
  
  return (
    <div className="flex items-center space-x-4">
      {/* Avatar Circle */}
      <div 
        className="h-16 w-16 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md"
        style={{ backgroundColor }}
      >
        {initial}
      </div>
      
      {/* Stats Box */}
      <div 
        className="flex-1 flex items-center p-3 rounded-lg text-white"
        style={{ backgroundColor }}
      >
        <div className="flex-1">
          <div className="text-lg font-bold">
            {playerName}
          </div>
          <div className="text-sm">Player of the Match</div>
        </div>
        
        <div className="flex space-x-6">
          <div className="text-center">
            <div className="text-2xl font-bold">10</div>
            <div className="text-xs">Goals</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">5</div>
            <div className="text-xs">Intercepts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">3</div>
            <div className="text-xs">Rebounds</div>
          </div>
        </div>
      </div>
    </div>
  );
}