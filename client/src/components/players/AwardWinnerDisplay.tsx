import React from 'react';
import { type Player } from '@shared/schema';
import { tailwindToHex } from '@/lib/utils';

interface AwardWinnerDisplayProps {
  awardWinnerId: number | null;
  players: Player[];
  roster: any[];
  gameStats: any[];
}

export default function AwardWinnerDisplay({ 
  awardWinnerId, 
  players, 
  roster, 
  gameStats 
}: AwardWinnerDisplayProps) {
  if (!awardWinnerId) {
    return (
      <div className="flex items-center justify-center h-full py-6 text-gray-500 italic">
        No award winner has been selected for this game.
      </div>
    );
  }
  
  // Find the award winner player
  const awardWinner = players?.find(p => p.id === awardWinnerId);
  
  if (!awardWinner) {
    return (
      <div className="text-center py-4 text-gray-500 italic">
        Award winner not found (ID: {awardWinnerId})
      </div>
    );
  }
  
  // Get player initials
  const initials = `${awardWinner.firstName.charAt(0)}${awardWinner.lastName ? awardWinner.lastName.charAt(0) : ''}`;
  
  // Get player name for display
  const playerName = awardWinner.displayName || `${awardWinner.firstName} ${awardWinner.lastName}`;
  
  // Use the avatar color directly for styling
  const avatarColor = awardWinner.avatarColor ? tailwindToHex(awardWinner.avatarColor) : "#3b82f6";
  
  // Find positions played by this player in this game
  const playerPositions = roster?.filter(r => r.playerId === awardWinner.id) || [];
  
  // Initialize stat counters
  let goals = 0;
  let intercepts = 0; 
  let rebounds = 0;
  
  // Sum up stats from all positions this player played
  playerPositions.forEach(rosterEntry => {
    const stat = gameStats?.find(s => 
      s.position === rosterEntry.position && 
      s.quarter === rosterEntry.quarter
    );
    
    if (stat) {
      goals += stat.goalsFor || 0;
      intercepts += stat.intercepts || 0;
      rebounds += stat.rebounds || 0;
    }
  });
  
  return (
    <div className="flex items-center space-x-4">
      {/* Player Avatar */}
      <div 
        className="h-16 w-16 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md"
        style={{ backgroundColor: avatarColor }}
      >
        {initials}
      </div>
      
      {/* Player Stats Box - With dark border, light interior styling */}
      <div 
        className="flex-1 flex items-center p-3 rounded-lg border-2"
        style={{ 
          borderColor: avatarColor, 
          backgroundColor: "#f8fafc" // light slate-50 background
        }}
      >
        <div className="flex-1">
          <div className="text-lg font-bold text-slate-900">
            {playerName}
          </div>
          <div className="text-sm text-slate-600">Player of the Match</div>
        </div>
        
        <div className="flex space-x-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-800">{goals}</div>
            <div className="text-xs text-slate-600">Goals</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-800">{intercepts}</div>
            <div className="text-xs text-slate-600">Intercepts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-800">{rebounds}</div>
            <div className="text-xs text-slate-600">Rebounds</div>
          </div>
        </div>
      </div>
    </div>
  );
}