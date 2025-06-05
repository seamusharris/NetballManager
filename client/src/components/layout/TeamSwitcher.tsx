
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { useClub } from '@/contexts/ClubContext';

interface TeamSwitcherProps {
  mode?: 'optional' | 'required' | 'hidden';
  className?: string;
  onTeamChange?: (teamId: number | null) => void;
}

export function TeamSwitcher({ mode = 'optional', className, onTeamChange }: TeamSwitcherProps) {
  const { currentTeamId, currentTeam, clubTeams, setCurrentTeamId } = useClub();

  // Auto-select first team if in required mode and no team is selected
  useEffect(() => {
    if (mode === 'required' && !currentTeamId && clubTeams.length > 0) {
      const firstTeam = clubTeams.find(team => team.name !== 'BYE');
      if (firstTeam) {
        console.log('TeamSwitcher: Auto-selecting first team in required mode:', firstTeam.name);
        setCurrentTeamId(firstTeam.id);
      }
    }
  }, [mode, currentTeamId, clubTeams, setCurrentTeamId]);

  // Don't render if hidden mode or only one team
  if (mode === 'hidden' || clubTeams.length <= 1) {
    return null;
  }

  const handleTeamChange = (value: string) => {
    const teamId = value === 'all' ? null : parseInt(value, 10);
    setCurrentTeamId(teamId);
    onTeamChange?.(teamId);
  };

  return (
    <div className={`flex items-center space-x-2 ${className || ''}`}>
      <span className="text-sm font-medium text-gray-700">Team:</span>
      <Select
        value={currentTeamId?.toString() || 'all'}
        onValueChange={handleTeamChange}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder={mode === 'required' ? "Select team" : "All teams"}>
            {currentTeam ? (
              <div className="flex items-center space-x-2">
                <span>{currentTeam.name}</span>
                {currentTeam.division && (
                  <Badge variant="secondary" className="text-xs">
                    {currentTeam.division}
                  </Badge>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground">
                {mode === 'required' ? "Select team" : "All teams"}
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {mode === 'optional' && (
            <SelectItem value="all">
              <span className="text-muted-foreground">All teams (no filter)</span>
            </SelectItem>
          )}
          {clubTeams.filter(team => team.name !== 'BYE').map((team) => (
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
