
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useClub } from '@/contexts/ClubContext';

export function TeamSwitcher() {
  const { currentTeamId, currentTeam, clubTeams, setCurrentTeamId } = useClub();

  if (clubTeams.length <= 1) {
    return null; // Don't show switcher if only one team
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium text-gray-700">Team:</span>
      <Select
        value={currentTeamId?.toString() || ''}
        onValueChange={(value) => setCurrentTeamId(parseInt(value, 10))}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select team">
            {currentTeam && (
              <div className="flex items-center space-x-2">
                <span>{currentTeam.name}</span>
                {currentTeam.division && (
                  <Badge variant="secondary" className="text-xs">
                    {currentTeam.division}
                  </Badge>
                )}
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {clubTeams.map((team) => (
            <SelectItem key={team.id} value={team.id.toString()}>
              <div className="flex items-center space-x-2">
                <span>{team.name}</span>
                {team.division && (
                  <Badge variant="secondary" className="text-xs">
                    {team.division}
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
