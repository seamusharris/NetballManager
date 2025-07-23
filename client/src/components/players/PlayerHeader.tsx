import React from "react";
import PlayerAvatar from "@/components/ui/player-avatar";
import { ShieldCheck, Users, Landmark } from "lucide-react";

interface PlayerHeaderProps {
  player: any;
  isLoading: boolean;
  teams?: any[];
  clubs?: any[];
}

export default function PlayerHeader({ player, isLoading, teams = [], clubs = [] }: PlayerHeaderProps) {
  if (isLoading) return <div>Loading player...</div>;
  if (!player) return <div>Player not found.</div>;

  // Prefer camelCase, fallback to snake_case if needed
  const displayName = player.displayName || player.display_name || `${player.firstName || player.first_name || ''} ${player.lastName || player.last_name || ''}`.trim();
  const firstName = player.firstName || player.first_name || '';
  const lastName = player.lastName || player.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim();
  const showFullName = fullName && fullName !== displayName;
  const dateOfBirth = player.dateOfBirth || player.date_of_birth || '';

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 mb-8 p-4 bg-white rounded-xl shadow-lg border border-gray-100">
      {/* Avatar */}
      <div className="flex-shrink-0">
        <PlayerAvatar player={player} size="xl" />
      </div>
      {/* Info */}
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-3xl font-extrabold text-primary mb-0">{displayName || 'Unnamed Player'}</h1>
          {player.active ? (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1"><ShieldCheck className="w-4 h-4" />Active</span>
          ) : (
            <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs font-semibold">Inactive</span>
          )}
        </div>
        {showFullName && (
          <div className="text-gray-600 text-lg mb-1">{fullName}</div>
        )}
        {dateOfBirth && (
          <div className="text-gray-500 text-sm mb-2">Date of Birth: {dateOfBirth}</div>
        )}
        {/* Clubs */}
        {clubs.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-1 items-center">
            <Landmark className="w-4 h-4 text-blue-500 mr-1" />
            {clubs.map((club: any) => (
              <span key={club.id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold" style={club.primaryColor ? { backgroundColor: club.primaryColor, color: '#fff' } : {}}>{club.name}</span>
            ))}
          </div>
        )}
        {/* Teams */}
        {teams.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-1 items-center">
            <Users className="w-4 h-4 text-purple-500 mr-1" />
            {teams.map((team: any) => (
              <span key={team.id} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-semibold">
                {team.name}
                {team.seasonName && <span className="ml-1 text-gray-500">({team.seasonName})</span>}
                {team.clubName && <span className="ml-1 text-gray-400">[{team.clubName}]</span>}
              </span>
            ))}
          </div>
        )}
        {/* Position Preferences */}
        {player.positionPreferences && player.positionPreferences.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {player.positionPreferences.map((pos: string) => (
              <span key={pos} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold">{pos}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 