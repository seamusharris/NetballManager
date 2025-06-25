import React, { useEffect, useState, useCallback } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useLocation, useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

interface TeamSwitcherProps {
  mode?: 'optional' | 'required' | 'hidden';
  className?: string;
  onTeamChange?: (teamId: number | null) => void;
}

export function TeamSwitcher({ mode = 'optional', className, onTeamChange }: TeamSwitcherProps) {
  // ALL HOOKS MUST BE AT THE TOP - NEVER CALL HOOKS CONDITIONALLY
  
  const [location, setLocation] = useLocation();
  const [internalValue, setInternalValue] = useState<string>('');
  const [matchClub] = useRoute('/club/:clubId/*');
  const [matchTeam] = useRoute('/team/:teamId/*');
  
  // Extract IDs from URL
  const clubId = matchClub?.clubId ? Number(matchClub.clubId) : null;
  const teamId = matchTeam?.teamId ? Number(matchTeam.teamId) : null;

  // Fetch teams for this club
  const { data: teams = [] } = useQuery({
    queryKey: ['clubs', clubId, 'teams'],
    queryFn: () => apiClient.get(`/api/clubs/${clubId}/teams`),
    enabled: !!clubId,
  });

  // Compute derived values (these are NOT hooks)
  const validTeams = teams.filter(team => team.isActive !== false);
  const shouldRender = mode !== 'hidden' && validTeams.length > 1;

  // ALL useEffect hooks must be called on every render
  useEffect(() => {
    if (!shouldRender) return;
    const newValue = teamId?.toString() || (mode === 'required' ? '' : 'all');
    console.log('TeamSwitcher: Context changed, updating internal value:', { currentTeamId, newValue });
    setInternalValue(newValue);
  }, [currentTeamId, mode, shouldRender]);

  useEffect(() => {
    if (!shouldRender) return;
    if (mode === 'required' && !currentTeamId && validTeams.length > 0) {
      const firstTeam = validTeams[0];
      console.log('TeamSwitcher: Auto-selecting first team:', firstTeam.id, firstTeam.name);
      
      onTeamChange?.(firstTeam.id);
    }
  }, [mode, currentTeamId, validTeams, 

  // useCallback MUST be called on every render
  const handleTeamSelect = useCallback((teamId: string) => {
    console.log('TeamSwitcher: Team selected:', teamId);
    
    // Handle "all" selection
    if (teamId === 'all') {
      setInternalValue(teamId);
      
      onTeamChange?.(null);
      
      // Navigate to club-wide view if currently on a team page
      if (location.startsWith('/team/') && location.includes('/games')) {
        const clubId = club?.id;
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
    
    
    // Call external handler if provided
    onTeamChange?.(numericTeamId);

    // Get the team data to determine the navigation target
    const selectedTeam = teams?.find(t => t.id === numericTeamId);
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
  }, [

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