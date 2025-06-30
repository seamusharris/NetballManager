import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Save, Edit, Trophy, Clock } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import { invalidateGameCache } from '@/lib/cacheInvalidation';
import { invalidateScoresOnly } from '@/lib/cacheKeys';
import { useClub } from '@/contexts/ClubContext';

interface OfficialScoreEntryProps {
  gameId: number;
  homeTeamName: string;
  awayTeamName: string;
  isReadOnly?: boolean;
}

export function OfficialScoreEntry({ 
  gameId, 
  homeTeamName, 
  awayTeamName, 
  isReadOnly = false 
}: OfficialScoreEntryProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentClub } = useClub();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingQuarter, setEditingQuarter] = useState<number | null>(null);
  const [quarterScores, setQuarterScores] = useState<Record<number, { home: number, away: number, notes: string }>>({
    1: { home: 0, away: 0, notes: '' },
    2: { home: 0, away: 0, notes: '' },
    3: { home: 0, away: 0, notes: '' },
    4: { home: 0, away: 0, notes: '' }
  });

  // Fetch game data to get proper team mapping
  const { data: gameData } = useQuery({
    queryKey: ['/api/games', gameId],
    queryFn: () => apiClient.get(`/api/games/${gameId}`),
    enabled: !isNaN(gameId)
  });

  // Fetch existing official scores
  const { data: officialScores, isLoading } = useQuery({
    queryKey: ['/api/games', gameId, 'scores'],
    queryFn: () => apiClient.get(`/api/games/${gameId}/scores`),
    enabled: !isNaN(gameId)
  });

  // Load official scores into state
  useEffect(() => {
    if (officialScores && officialScores.length > 0 && gameData) {
      const newScores = { ...quarterScores };

      // Group scores by quarter
      const scoresByQuarter: Record<number, { [teamId: number]: { score: number; notes?: string } }> = {};

      officialScores.forEach((score: any) => {
        if (!scoresByQuarter[score.quarter]) {
          scoresByQuarter[score.quarter] = {};
        }
        scoresByQuarter[score.quarter][score.teamId] = {
          score: score.score,
          notes: score.notes
        };
      });

      // Convert to home/away format using actual game data
      Object.entries(scoresByQuarter).forEach(([quarter, teams]) => {
        const quarterNum = parseInt(quarter);
        const homeTeamId = gameData.homeTeamId;
        const awayTeamId = gameData.awayTeamId;

        newScores[quarterNum] = {
          home: teams[homeTeamId]?.score || 0,
          away: teams[awayTeamId]?.score || 0,
          notes: teams[homeTeamId]?.notes || teams[awayTeamId]?.notes || ''
        };
      });

      setQuarterScores(newScores);
    }
  }, [officialScores, gameData]);

  // Save score mutation
  const saveScoreMutation = useMutation({
    mutationFn: (data: { quarter: number, homeScore: number, awayScore: number, notes?: string }) => {
      // Convert home/away scores to team-specific data using actual game data
      if (!gameData) throw new Error('Game data not loaded');

      const homeTeamId = gameData.homeTeamId;
      const awayTeamId = gameData.awayTeamId;

      const saveData = {
        quarter: data.quarter,
        homeTeamId,
        awayTeamId,
        homeScore: data.homeScore,
        awayScore: data.awayScore,
        notes: data.notes
      };

      return apiClient.post(`/api/games/${gameId}/scores`, saveData);
    },
    onSuccess: () => {
        toast({
          title: "Score saved successfully",
          description: "Official scores have been updated."
        });

        // Targeted cache invalidation for official scores
        queryClient.invalidateQueries({ queryKey: [`/api/games/${gameId}/scores`] });
        queryClient.invalidateQueries({ queryKey: [`/api/games/${gameId}`] });
        queryClient.invalidateQueries({ queryKey: ['scores', gameId] });
        queryClient.invalidateQueries({ queryKey: ['game', gameId] });

        // Invalidate specific game in games list
        queryClient.invalidateQueries({ queryKey: ['/api/games'] });
        
        // Invalidate team-specific games lists
        if (currentClub?.id) {
          queryClient.invalidateQueries({ queryKey: ['games', currentClub.id] });
          
          // Force refetch on window focus for immediate updates
          queryClient.refetchQueries({ 
            queryKey: ['/api/games'],
            type: 'active'
          });
        }
      },
    onError: (error) => {
      console.error('Error saving score:', error);
      toast({
        title: "Error",
        description: "Failed to save score",
        variant: "destructive",
      });
    }
  });

  const handleScoreChange = (quarter: number, team: 'home' | 'away', value: string) => {
    const numValue = parseInt(value) || 0;
    setQuarterScores(prev => ({
      ...prev,
      [quarter]: {
        ...prev[quarter],
        [team]: numValue
      }
    }));
  };

  const handleNotesChange = (quarter: number, notes: string) => {
    setQuarterScores(prev => ({
      ...prev,
      [quarter]: {
        ...prev[quarter],
        notes
      }
    }));
  };

  const handleSaveQuarter = (quarter: number) => {
    const scores = quarterScores[quarter];
    saveScoreMutation.mutate({
      quarter,
      homeScore: scores.home,
      awayScore: scores.away,
      notes: scores.notes
    });
  };

  // Calculate totals
  const totalHome = Object.values(quarterScores).reduce((sum, q) => sum + q.home, 0);
  const totalAway = Object.values(quarterScores).reduce((sum, q) => sum + q.away, 0);
  const result = totalHome > totalAway ? 'Home Win' : totalHome < totalAway ? 'Away Win' : 'Draw';
  const hasAnyOfficialScores = officialScores && officialScores.length > 0;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading official scores...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Official Game Scores
                {hasAnyOfficialScores && (
                  <Badge variant="outline" className="ml-2">
                    Recorded
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Official quarter-by-quarter scores for this game
              </CardDescription>
            </div>
            {!isReadOnly && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditDialogOpen(true)}
                className="border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-900"
                data-edit-scores-button
                style={{ display: 'none' }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Scores
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {hasAnyOfficialScores ? (
            <div className="space-y-4">
              {/* Final Score Display */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{homeTeamName}</span>
                  <span className="text-2xl font-bold">{totalHome}</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium">{awayTeamName}</span>
                  <span className="text-2xl font-bold">{totalAway}</span>
                </div>
                <div className="text-center">
                  <Badge variant={result === 'Draw' ? 'secondary' : 'default'}>
                    {result}
                  </Badge>
                </div>
              </div>

              {/* Quarter Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-700">Quarter Scores</h4>
                  <div className="grid grid-cols-4 gap-2 text-center text-sm">
                    {[1, 2, 3, 4].map(quarter => (
                      <div key={quarter} className="bg-white border rounded p-2">
                        <div className="text-xs text-gray-500 mb-1">Q{quarter}</div>
                        <div className="font-medium">
                          {quarterScores[quarter].home}-{quarterScores[quarter].away}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-700">Running Total</h4>
                  <div className="grid grid-cols-4 gap-2 text-center text-sm">
                    {[1, 2, 3, 4].map(quarter => {
                      const runningHome = Object.entries(quarterScores)
                        .filter(([q]) => parseInt(q) <= quarter)
                        .reduce((sum, [, scores]) => sum + scores.home, 0);
                      const runningAway = Object.entries(quarterScores)
                        .filter(([q]) => parseInt(q) <= quarter)
                        .reduce((sum, [, scores]) => sum + scores.away, 0);

                      return (
                        <div key={quarter} className="bg-white border rounded p-2">
                          <div className="text-xs text-gray-500 mb-1">Q{quarter}</div>
                          <div className="font-medium">
                            {runningHome}-{runningAway}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="mb-2">No official scores recorded</p>
              <p className="text-sm">Click "Edit Scores" to add quarter-by-quarter scores</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Official Scores</DialogTitle>
            <DialogDescription>
              Enter the official quarter-by-quarter scores for this game
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Final Score Display */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{homeTeamName}</span>
                <span className="text-2xl font-bold">{totalHome}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium">{awayTeamName}</span>
                <span className="text-2xl font-bold">{totalAway}</span>
              </div>
              <div className="text-center">
                <Badge variant={result === 'Draw' ? 'secondary' : 'default'}>
                  {result}
                </Badge>
              </div>
            </div>

            {/* Quarter by Quarter Entry */}
            <div className="space-y-4">
              {[1, 2, 3, 4].map(quarter => {
                const isEditing = editingQuarter === quarter;
                const scores = quarterScores[quarter];
                const hasOfficialScore = officialScores?.some((s: any) => s.quarter === quarter);

                return (
                  <div key={quarter} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">Quarter {quarter}</span>
                        {hasOfficialScore && (
                          <Badge variant="outline" className="text-xs">
                            Official
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingQuarter(isEditing ? null : quarter)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        {isEditing ? 'Cancel' : 'Edit'}
                      </Button>
                    </div>

                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`home-${quarter}`}>{homeTeamName}</Label>
                            <Input
                              id={`home-${quarter}`}
                              type="number"
                              min="0"
                              value={scores.home}
                              onChange={(e) => handleScoreChange(quarter, 'home', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`away-${quarter}`}>{awayTeamName}</Label>
                            <Input
                              id={`away-${quarter}`}
                              type="number"
                              min="0"
                              value={scores.away}
                              onChange={(e) => handleScoreChange(quarter, 'away', e.target.value)}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`notes-${quarter}`}>Notes (optional)</Label>
                          <Textarea
                            id={`notes-${quarter}`}
                            placeholder="Any notes about this quarter..."
                            value={scores.notes}
                            onChange={(e) => handleNotesChange(quarter, e.target.value)}
                            rows={2}
                          />
                        </div>

                        <Button
                          onClick={() => handleSaveQuarter(quarter)}
                          disabled={saveScoreMutation.isPending}
                          className="w-full"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save Quarter {quarter}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>{homeTeamName}</span>
                          <span className="font-bold">{scores.home}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{awayTeamName}</span>
                          <span className="font-bold">{scores.away}</span>
                        </div>
                        {scores.notes && (
                          <div className="text-sm text-gray-600 mt-2">
                            <strong>Notes:</strong> {scores.notes}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}