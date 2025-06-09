
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Save, Edit, Trophy, Clock } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';

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
  
  const [editingQuarter, setEditingQuarter] = useState<number | null>(null);
  const [quarterScores, setQuarterScores] = useState<Record<number, { home: number, away: number, notes: string }>>({
    1: { home: 0, away: 0, notes: '' },
    2: { home: 0, away: 0, notes: '' },
    3: { home: 0, away: 0, notes: '' },
    4: { home: 0, away: 0, notes: '' }
  });

  // Fetch existing official scores
  const { data: officialScores, isLoading } = useQuery({
    queryKey: ['/api/games', gameId, 'scores'],
    queryFn: () => apiClient.get(`/api/games/${gameId}/scores`),
    enabled: !isNaN(gameId)
  });

  // Load official scores into state
  useEffect(() => {
    if (officialScores) {
      const newScores = { ...quarterScores };
      officialScores.forEach((score: any) => {
        newScores[score.quarter] = {
          home: score.homeScore,
          away: score.awayScore,
          notes: score.notes || ''
        };
      });
      setQuarterScores(newScores);
    }
  }, [officialScores]);

  // Save score mutation
  const saveScoreMutation = useMutation({
    mutationFn: (data: { quarter: number, homeScore: number, awayScore: number, notes?: string }) =>
      apiClient.post(`/api/games/${gameId}/scores`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/games', gameId, 'scores'] });
      queryClient.invalidateQueries({ queryKey: ['/api/games', gameId] });
      setEditingQuarter(null);
      toast({
        title: "Score saved",
        description: "Official quarter score has been recorded",
      });
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Official Game Scores
        </CardTitle>
        <CardDescription>
          Enter the official quarter-by-quarter scores for this game
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
                  {!isReadOnly && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingQuarter(isEditing ? null : quarter)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      {isEditing ? 'Cancel' : 'Edit'}
                    </Button>
                  )}
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
      </CardContent>
    </Card>
  );
}
