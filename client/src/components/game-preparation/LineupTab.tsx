import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save, RotateCcw, Users, Target, Layout } from 'lucide-react';
import SharedPlayerAvailability from '@/components/ui/shared-player-availability';
import DragDropLineupEditor from '@/components/roster/DragDropLineupEditor';
import CourtDisplay from '@/components/ui/court-display';
import { UpcomingGameRecommendations } from '@/components/dashboard/UpcomingGameRecommendations';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import type { Game, Player, Roster } from '@shared/schema';

interface LineupTabProps {
  game: Game;
  players: Player[];
  rosters: Roster[];
  onRosterUpdate: (rosters: Roster[]) => void;
}

export function LineupTab({ game, players, rosters, onRosterUpdate }: LineupTabProps) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [localRosters, setLocalRosters] = useState<Roster[]>(rosters);
  const [activeSubTab, setActiveSubTab] = useState('availability');

  // Track changes to rosters
  useEffect(() => {
    const hasChanges = JSON.stringify(localRosters) !== JSON.stringify(rosters);
    setHasUnsavedChanges(hasChanges);
  }, [localRosters, rosters]);

  // Sync external roster changes
  useEffect(() => {
    setLocalRosters(rosters);
  }, [rosters]);

  const handleSaveChanges = async () => {
    try {
      // Save roster changes
      await onRosterUpdate(localRosters);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save roster changes:', error);
    }
  };

  const handleDiscardChanges = () => {
    setLocalRosters(rosters);
    setHasUnsavedChanges(false);
  };

  const handleRosterChange = (updatedRosters: Roster[]) => {
    setLocalRosters(updatedRosters);
  };

  const handleAvailabilityChange = (playerId: number, available: boolean) => {
    // Handle availability changes if needed
    console.log(`Player ${playerId} availability: ${available}`);
  };

  return (
    <div className="space-y-4">
      {/* Unsaved Changes Alert */}
      {hasUnsavedChanges && (
        <Alert className="border-amber-200 bg-amber-50">
          <Save className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>You have unsaved lineup changes</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDiscardChanges}
                className="h-8"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Discard
              </Button>
              <Button
                size="sm"
                onClick={handleSaveChanges}
                className="h-8 bg-amber-600 hover:bg-amber-700"
              >
                <Save className="h-3 w-3 mr-1" />
                Save Changes
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Sub-tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="availability" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Player Availability
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="lineup" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Lineup Builder
          </TabsTrigger>
          <TabsTrigger value="court" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Court View
          </TabsTrigger>
        </TabsList>

        {/* Player Availability Tab */}
        <TabsContent value="availability" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Player Availability for {game.homeTeamName} vs {game.awayTeamName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SharedPlayerAvailability
                gameId={game.id}
                players={players}
                onAvailabilityChange={handleAvailabilityChange}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Lineup Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UpcomingGameRecommendations
                game={game}
                players={players}
                currentRosters={localRosters}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lineup Builder Tab */}
        <TabsContent value="lineup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Drag & Drop Lineup Builder
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DragDropLineupEditor
                gameId={game.id}
                players={players}
                initialRosters={localRosters}
                onRosterChange={handleRosterChange}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Court View Tab */}
        <TabsContent value="court" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Court Display
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4].map(quarter => {
                  const quarterRosters = localRosters.filter(r => r.quarter === quarter);
                  return (
                    <div key={quarter} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Quarter {quarter}</Badge>
                      </div>
                      <CourtDisplay
                        rosters={quarterRosters}
                        players={players}
                        quarter={quarter}
                        showPlayerAvatars={true}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default LineupTab;