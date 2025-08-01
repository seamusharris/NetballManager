import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface ClubTeamSelectorProps {
  clubs: any[];
  selectedClubId: string;
  selectedTeamId: string;
  seasonId: string;
  onClubChange: (clubId: string) => void;
  onTeamChange: (teamId: string) => void;
  clubError?: string;
  teamError?: string;
  required?: boolean;
}

export default function ClubTeamSelector({
  clubs,
  selectedClubId,
  selectedTeamId,
  seasonId,
  onClubChange,
  onTeamChange,
  clubError,
  teamError,
  required = false
}: ClubTeamSelectorProps) {
  // Fetch teams for selected club and season
  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['clubTeams', selectedClubId, seasonId],
    queryFn: async () => {
      if (!selectedClubId || !seasonId) return [];
      
      const response = await fetch(`/api/clubs/${selectedClubId}/teams?seasonId=${seasonId}`);
      if (!response.ok) throw new Error('Failed to fetch teams');
      const data = await response.json();
      return data.data || [];
    },
    enabled: !!selectedClubId && !!seasonId
  });

  // Reset team selection when teams list changes
  useEffect(() => {
    if (teams && selectedTeamId) {
      // Check if currently selected team is still in the list
      const teamStillExists = teams.some((team: any) => team.id.toString() === selectedTeamId);
      if (!teamStillExists) {
        onTeamChange('');
      }
    }
  }, [teams, selectedTeamId, onTeamChange]);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Club {required && '*'}
        </label>
        <select
          value={selectedClubId}
          onChange={(e) => onClubChange(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            clubError ? 'border-red-500' : 'border-gray-300'
          }`}
          required={required}
        >
          <option value="">Select a club</option>
          {clubs.map((club) => (
            <option key={club.id} value={club.id}>
              {club.name}
            </option>
          ))}
        </select>
        {clubError && <p className="mt-1 text-sm text-red-600">{clubError}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Team {required && '*'}
        </label>
        <select
          value={selectedTeamId}
          onChange={(e) => onTeamChange(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            teamError ? 'border-red-500' : 'border-gray-300'
          }`}
          required={required}
          disabled={!selectedClubId || teamsLoading}
        >
          <option value="">
            {!selectedClubId 
              ? 'Select a club first' 
              : teamsLoading 
              ? 'Loading teams...' 
              : 'Select a team'}
          </option>
          {teams?.map((team: any) => (
            <option key={team.id} value={team.id}>
              {team.name}
              {team.divisionName && ` (${team.divisionName})`}
            </option>
          ))}
        </select>
        {teamError && <p className="mt-1 text-sm text-red-600">{teamError}</p>}
      </div>
    </div>
  );
}