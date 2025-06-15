import React, { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useClub } from '@/contexts/ClubContext';
import { useLocation, useRoute } from 'wouter';
import { useState } from 'react';

interface TeamSwitcherProps {
  mode?: 'optional' | 'required' | 'hidden';
  className?: string;
  onTeamChange?: (teamId: number | null) => void;
}

export function TeamSwitcher({ mode = 'optional', className, onTeamChange }: TeamSwitcherProps) {
  const { currentTeamId, currentTeam, clubTeams, setCurrentTeamId } = useClub();
  const [location, setLocation] = useLocation();
  const [internalValue, setInternalValue] = useState<string>('');

  // Sync internal value with context changes
  useEffect(() => {
    const newValue = currentTeamId?.toString() || (mode === 'required' ? '' : 'all');
    console.log('TeamSwitcher: Context changed, updating internal value:', { currentTeamId, newValue });
    setInternalValue(newValue);
  }, [currentTeamId, mode]);

  // Don't render if hidden mode or only one team
  const validTeams = clubTeams.filter(team => team.isActive !== false);

  if (mode === 'hidden' || validTeams.length <= 1) {
    return null;
  }

  // For required mode, auto-select first team if none selected
  useEffect(() => {
    if (mode === 'required' && !currentTeamId && validTeams.length > 0) {
      const firstTeam = validTeams[0];
      console.log('TeamSwitcher: Auto-selecting first team:', firstTeam.id, firstTeam.name);
      setCurrentTeamId(firstTeam.id);
      onTeamChange?.(firstTeam.id);
    }
  }, [mode, currentTeamId, validTeams, setCurrentTeamId, onTeamChange]);

  const handleTeamChange = (value: string) => {
    const teamId = value === 'all' ? null : parseInt(value, 10);

    // Prevent unnecessary changes
    if (teamId === currentTeamId) {
      return;
    }

    setCurrentTeamId(teamId);
    onTeamChange?.(teamId);
  };

  const handleTeamSelect = (value: string) => {
    console.log('TeamSwitcher: Selecting team:', value);
    setInternalValue(value);
    handleTeamChange(value);
  };


  return (
    <div className={`flex items-center space-x-2 ${className || ''}`}>
      <span className="text-sm font-medium text-gray-700">Team:</span>
      <Select
        value={internalValue}
        onValueChange={handleTeamSelect}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder={mode === 'required' ? "Select team" : "All teams"} />
        </SelectTrigger>
        <SelectContent>
          {mode === 'optional' && (
            <SelectItem value="all">
              <span className="text-muted-foreground">All teams (no filter)</span>
            </SelectItem>
          )}
          {validTeams.map((team) => (
            <SelectItem key={team.id} value={team.id.toString()}>
              <div className="flex items-center space-x-2">
                <span>{team.name}</span>
                {team.name.includes('17') && (
                  <Badge variant="secondary" className="text-xs">
                    U17
                  </Badge>
                )}
                {team.name.includes('15') && (
                  <Badge variant="secondary" className="text-xs">
                    U15
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