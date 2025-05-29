
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Users, AlertTriangle, Check } from 'lucide-react';
import { apiRequest } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import RosterManager from './RosterManager';

interface TeamAwareRosterManagerProps {
  gameId: number;
  seasonId?: number;
  players: any[];
  games: any[];
  opponents: any[];
  rosters: any[];
  onRosterChange?: () => void;
}

export default function TeamAwareRosterManager({ 
  gameId, 
  seasonId, 
  players, 
  games, 
  opponents, 
  rosters,
  onRosterChange
}: TeamAwareRosterManagerProps) {
  const { toast } = useToast();
  const [teamInfo, setTeamInfo] = useState<any>(null);
  const [rosterStatus, setRosterStatus] = useState<'complete' | 'partial' | 'empty'>('empty');
  const [isCreatingFallback, setIsCreatingFallback] = useState(false);

  // Check roster completeness
  useEffect(() => {
    if (rosters.length === 0) {
      setRosterStatus('empty');
    } else if (rosters.length < 28) { // 7 positions x 4 quarters
      setRosterStatus('partial');
    } else {
      setRosterStatus('complete');
    }
  }, [rosters]);

  // Get team info for this game
  useEffect(() => {
    if (seasonId) {
      fetchTeamInfo();
    }
  }, [seasonId, gameId]);

  const fetchTeamInfo = async () => {
    try {
      const response = await apiRequest('GET', `/api/seasons/${seasonId}/default-team`);
      const team = await response.json();
      setTeamInfo(team);
    } catch (error) {
      console.warn('Could not fetch team info:', error);
    }
  };

  const createFallbackRoster = async () => {
    setIsCreatingFallback(true);
    try {
      await apiRequest('POST', `/api/games/${gameId}/create-fallback-roster`);
      
      toast({
        title: 'Fallback Roster Created',
        description: 'Basic roster assignments have been created to enable stats tracking.',
      });
      
      if (onRosterChange) {
        onRosterChange();
      }
    } catch (error) {
      console.error('Failed to create fallback roster:', error);
      toast({
        title: 'Error',
        description: 'Failed to create fallback roster.',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingFallback(false);
    }
  };

  const getRosterStatusInfo = () => {
    switch (rosterStatus) {
      case 'complete':
        return {
          icon: <Check className="h-4 w-4 text-green-600" />,
          text: 'Complete roster assigned',
          color: 'bg-green-100 border-green-200',
        };
      case 'partial':
        return {
          icon: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
          text: `Partial roster (${rosters.length}/28 positions)`,
          color: 'bg-yellow-100 border-yellow-200',
        };
      case 'empty':
        return {
          icon: <Users className="h-4 w-4 text-gray-600" />,
          text: 'No roster assigned',
          color: 'bg-gray-100 border-gray-200',
        };
    }
  };

  const statusInfo = getRosterStatusInfo();

  return (
    <div className="space-y-4">
      {/* Team Context Card */}
      {teamInfo && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Team Context</CardTitle>
              <Badge variant="outline">{teamInfo.club_name}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Team:</span> {teamInfo.name}
              </div>
              <div>
                <span className="font-medium">Division:</span> {teamInfo.division || 'N/A'}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Roster Status Alert */}
      <Alert className={statusInfo.color}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {statusInfo.icon}
            <AlertDescription>{statusInfo.text}</AlertDescription>
          </div>
          
          {rosterStatus === 'empty' && (
            <Button
              variant="outline"
              size="sm"
              onClick={createFallbackRoster}
              disabled={isCreatingFallback}
            >
              {isCreatingFallback ? 'Creating...' : 'Create Basic Roster'}
            </Button>
          )}
        </div>
      </Alert>

      {/* Information about fallback rosters */}
      {rosterStatus === 'empty' && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>No roster assigned:</strong> You can still track position-based stats by creating a basic roster, 
            or stats can be recorded by position without specific player assignments.
          </AlertDescription>
        </Alert>
      )}

      {/* Regular Roster Manager */}
      <RosterManager
        players={players}
        games={games}
        opponents={opponents}
        rosters={rosters}
        selectedGameId={gameId}
        setSelectedGameId={() => {}} // Not needed since gameId is fixed
        isLoading={false}
        onRosterSaved={onRosterChange}
      />
    </div>
  );
}
