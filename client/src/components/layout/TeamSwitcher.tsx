import React, { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useClub } from '@/contexts/ClubContext';
import { useLocation, useRoute } from 'wouter';

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

    console.log('TeamSwitcher: Team changed:', { value, teamId, currentTeamId, location });

    // Navigate to team-specific URL if we're on a team-dependent page
    if (teamId) {
      if (location.startsWith('/team-dashboard') || location.startsWith('/team/') || location === '/dashboard') {
        // Force navigation even if it's the same team to trigger re-render
        console.log('TeamSwitcher: Navigating to team dashboard:', `/team/${teamId}`);
        setLocation(`/team/${teamId}`);
        // Set team context after navigation to ensure proper synchronization
        setTimeout(() => {
          setCurrentTeamId(teamId);
          onTeamChange?.(teamId);
        }, 0);
      } else if (location === '/games' || location.startsWith('/games')) {
        // Stay on games page but with team context - don't redirect to team dashboard
        // The Games component will handle the team filtering via currentTeamId context
        setCurrentTeamId(teamId);
        onTeamChange?.(teamId);
        return;
      } else if (location.startsWith('/preparation')) {
        setLocation(`/team/${teamId}/preparation`);
        setTimeout(() => {
          setCurrentTeamId(teamId);
          onTeamChange?.(teamId);
        }, 0);
      } else if (location.startsWith('/opponent-preparation')) {
        setLocation(`/team/${teamId}/analysis`);
        setTimeout(() => {
          setCurrentTeamId(teamId);
          onTeamChange?.(teamId);
        }, 0);
      }
      // If currently on club dashboard and selecting a team, navigate to team dashboard
      else if (location === '/') {
        setLocation(`/team/${teamId}`);
        setTimeout(() => {
          setCurrentTeamId(teamId);
          onTeamChange?.(teamId);
        }, 0);
      } else {
        // For other pages, just update context
        setCurrentTeamId(teamId);
        onTeamChange?.(teamId);
      }
    } else {
      // If no team selected and we're on a team-dependent page, go to teams page
      if (location.startsWith('/team-dashboard') || location.startsWith('/team/') || location.startsWith('/games') || 
          location.startsWith('/preparation') || location.startsWith('/opponent-preparation')) {
        setLocation('/teams');
      }
      setCurrentTeamId(teamId);
      onTeamChange?.(teamId);
    }
  };

  const handleTeamSelect = (value: string) => {
    console.log('TeamSwitcher: Selecting team:', value);
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