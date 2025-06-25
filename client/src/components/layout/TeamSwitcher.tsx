import React, { useEffect, useState, useCallback } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { // useClub removed } from 'wouter';
import { useLocation, useRoute } from 'wouter';

interface TeamSwitcherProps {
  mode?: 'optional' | 'required' | 'hidden';
  className?: string;
  onTeamChange?: (teamId: number | null) => void;
}

export function TeamSwitcher({ mode = 'optional', className, onTeamChange }: TeamSwitcherProps) {
  // ALL HOOKS MUST BE AT THE TOP - NEVER CALL HOOKS CONDITIONALLY
  const { currentTeamId, currentTeam, clubTeams, setCurrentTeamId, currentClub } = // useClub removed();
  const [location, setLocation] = useLocation();
  const [internalValue, setInternalValue] = useState<string>('');

  // Compute derived values (these are NOT hooks)
  const validTeams = clubTeams.filter(team => team.isActive !== false);
  const shouldRender = mode !== 'hidden' && validTeams.length > 1;

  // ALL useEffect hooks must be called on every render
  useEffect(() => {
    if (!shouldRender) return;
    const newValue = currentTeamId?.toString() || (mode === 'required' ? '' : 'all');
    console.log('TeamSwitcher: Context changed, updating internal value:', { currentTeamId, newValue });
    setInternalValue(newValue);
  }, [currentTeamId, mode, shouldRender]);

  useEffect(() => {
    if (!shouldRender) return;
    if (mode === 'required' && !currentTeamId && validTeams.length > 0) {
      const firstTeam = validTeams[0];
      console.log('TeamSwitcher: Auto-selecting first team:', firstTeam.id, firstTeam.name);
      setCurrentTeamId(firstTeam.id);
      onTeamChange?.(firstTeam.id);
    }
  }, [mode, currentTeamId, validTeams, setCurrentTeamId, onTeamChange, shouldRender]);

  // useCallback MUST be called on every render
  const handleTeamSelect = useCallback((teamId: string) => {
    console.log('TeamSwitcher: Team selected:', teamId);
    
    // Handle "all" selection
    if (teamId === 'all') {
      setInternalValue(teamId);
      setCurrentTeamId(null);
      onTeamChange?.(null);
      
      // Navigate to club-wide view if currently on a team page
      if (location.startsWith('/team/') && location.includes('/games')) {
        const clubId = currentClub?.id;
        if (clubId) {
          setLocation(`/club/${clubId}/games`);
        }
      }
      return;
    }

    const numericTeamId = parseInt(teamId, 10);

    // Check if this is actually a change
    if (numericTeamId === currentTeamId) {
      console.log('TeamSwitcher: Same team selected, no action needed');
      return;
    }

    // Update internal value immediately
    setInternalValue(teamId);
    
    // Update context immediately
    setCurrentTeamId(numericTeamId);
    
    // Call external handler if provided
    onTeamChange?.(numericTeamId);

    // Get the team data to determine the navigation target
    const selectedTeam = clubTeams?.find(t => t.id === numericTeamId);
    if (selectedTeam) {
      console.log('TeamSwitcher: Selected team:', selectedTeam.name);

      // Navigate immediately without debouncing
      if (location.includes('/games')) {
        setLocation(`/team/${numericTeamId}/games`);
      } else if (location.startsWith('/team-dashboard') || location.startsWith('/team/') || location === '/dashboard') {
        setLocation(`/team/${numericTeamId}`);
      } else if (location.startsWith('/preparation')) {
        setLocation(`/team/${numericTeamId}/preparation`);
      } else if (location.startsWith('/opponent-preparation')) {
        setLocation(`/team/${numericTeamId}/analysis`);
      } else if (location === '/') {
        setLocation(`/team/${numericTeamId}`);
      }
    }
  }, [setCurrentTeamId, clubTeams, location, currentTeamId, setLocation, onTeamChange, currentClub]);

  // ONLY AFTER ALL HOOKS - we can conditionally return null
  if (!shouldRender) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-2 ${className || ''}`}>
      <span className="text-sm font-medium text-gray-700">Team:</span>
      <Select
        value={internalValue}
        onValueChange={handleTeamSelect}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder={mode === 'required' ? "Select team" : onTeamChange ? "Select team" : "All teams"} />
        </SelectTrigger>
        <SelectContent>
          {mode === 'optional' && (
            <SelectItem value="all">
              <span className="text-muted-foreground">All teams</span>
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