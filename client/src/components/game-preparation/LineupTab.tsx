import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Users, Target, Layout, Save, RotateCcw, Zap, 
  CheckCircle, Filter, Search, AlertCircle, 
  Clock, User, MapPin, Trophy, Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/apiClient';
import CourtDisplay from '@/components/ui/court-display';
import DragDropRosterManager from '@/components/roster/DragDropRosterManager';
import PlayerAvailabilityManager from '@/components/roster/PlayerAvailabilityManager';
import { useBatchRosterData } from '@/components/statistics/hooks/useBatchRosterData';
import { useBatchGameStatistics } from '@/components/statistics/hooks/useBatchGameStatistics';
import type { Game, Player, Roster, Position } from '@shared/schema';

interface LineupTabProps {
  game: Game;
  players: Player[];
  rosters: Roster[];
  onRosterUpdate: (rosters: Roster[]) => void;
}

// Using boolean-based availability format to match PlayerAvailabilityManager
type PlayerAvailabilityData = Record<number, boolean>;

interface LineupRecommendation {
  id: string;
  formation: Record<string, number>; // Position -> PlayerId
  effectiveness: number;
  confidence: number;
  historicalSuccess: number;
  opponentSpecific: boolean;
  notes: string;
  availablePlayersOnly: boolean;
}

const POSITIONS = ['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'];

export function LineupTab({ game, players, rosters, onRosterUpdate }: LineupTabProps) {
  const [activeStep, setActiveStep] = useState<'availability' | 'recommendations' | 'builder' | 'assignments'>('availability');
  const [playerAvailability, setPlayerAvailability] = useState<PlayerAvailabilityData>({});
  const [recommendations, setRecommendations] = useState<LineupRecommendation[]>([]);
  const [selectedRoster, setSelectedRoster] = useState<Record<number, Record<string, number | null>>>({
    1: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null },
    2: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null },
    3: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null },
    4: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null }
  });
  const [confidenceFilter, setConfidenceFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const { toast } = useToast();

  // Get completed games for historical analysis
  const [completedGames, setCompletedGames] = useState<Game[]>([]);
  const [completedGameIds, setCompletedGameIds] = useState<number[]>([]);

  // Fetch batch roster data for position effectiveness analysis
  const { rostersMap, isLoading: isLoadingRosters } = useBatchRosterData(completedGameIds);
  const { statsMap: centralizedStats, isLoading: isLoadingStats } = useBatchGameStatistics(completedGameIds);

  // Fetch completed games for the team
  useEffect(() => {
    const fetchCompletedGames = async () => {
      try {
        const response = await apiClient.get('/api/games');
        if (response && Array.isArray(response)) {
          const completed = response.filter((g: Game) => 
            g.statusId === 3 && // completed status
            (g.homeTeamId === game.homeTeamId || g.awayTeamId === game.awayTeamId)
          );
          const recentCompleted = completed.slice(0, 10); // Use last 10 completed games
          setCompletedGames(recentCompleted);
          setCompletedGameIds(recentCompleted.map(g => g.id));
          console.log('LineupTab: Found', recentCompleted.length, 'completed games for analysis');
        }
      } catch (error) {
        console.error('Failed to fetch completed games:', error);
      }
    };

    fetchCompletedGames();
  }, [game.homeTeamId, game.awayTeamId]);

  // Initialize player availability
  useEffect(() => {
    const initializeAvailability = async () => {
      try {
        const response = await apiClient.get(`/api/games/${game.id}/availability`);
        if (response?.availablePlayerIds) {
          const initialData: PlayerAvailabilityData = {};
          players.forEach(player => {
            initialData[player.id] = response.availablePlayerIds.includes(player.id);
          });
          setPlayerAvailability(initialData);
        } else {
          // Default all active players to available
          const defaultData: PlayerAvailabilityData = {};
          players.forEach(player => {
            defaultData[player.id] = player.active !== false;
          });
          setPlayerAvailability(defaultData);
        }
      } catch (error) {
        console.error('Failed to load player availability:', error);
        // Default all players to available on error
        const defaultData: PlayerAvailabilityData = {};
        players.forEach(player => {
          defaultData[player.id] = true;
        });
        setPlayerAvailability(defaultData);
      }
    };

    if (players.length > 0) {
      initializeAvailability();
    }
  }, [game.id, players]);

  // Generate recommendations when availability changes
  useEffect(() => {
    const availablePlayers = players.filter(p => playerAvailability[p.id] === true);
    if (availablePlayers.length >= 7) {
      generateLineupRecommendations(availablePlayers);
    } else {
      setRecommendations([]);
    }
  }, [playerAvailability, players, rosters]);

  const generateLineupRecommendations = (availablePlayers: Player[]) => {
    try {
      const newRecommendations: LineupRecommendation[] = [];

      // Position-optimized lineup
      const positionOptimized = generatePositionOptimizedLineup(availablePlayers);
      if (positionOptimized) newRecommendations.push(positionOptimized);

      // Experience-based lineup
      const experienceBased = generateExperienceBasedLineup(availablePlayers);
      if (experienceBased) newRecommendations.push(experienceBased);

      // Balanced lineup
      const balanced = generateBalancedLineup(availablePlayers);
      if (balanced) newRecommendations.push(balanced);

      // Position effectiveness recommendations (if historical data is available)
      const positionEffectivenessRecommendations = generatePositionEffectivenessRecommendations(availablePlayers);
      newRecommendations.push(...positionEffectivenessRecommendations);

      setRecommendations(newRecommendations.sort((a, b) => b.effectiveness - a.effectiveness));
    } catch (error) {
      console.error('Error generating lineup recommendations:', error);
      setRecommendations([]);
    }
  };

  const generatePositionOptimizedLineup = (availablePlayers: Player[]): LineupRecommendation | null => {
    const formation: Record<string, number> = {};
    const usedPlayers = new Set<number>();

    // Assign players to their preferred positions
    POSITIONS.forEach(position => {
      const candidates = availablePlayers
        .filter(p => !usedPlayers.has(p.id) && p.positionPreferences?.includes(position))
        .sort((a, b) => (a.positionPreferences?.indexOf(position) || 99) - (b.positionPreferences?.indexOf(position) || 99));

      if (candidates.length > 0) {
        formation[position] = candidates[0].id;
        usedPlayers.add(candidates[0].id);
      }
    });

    // Fill remaining positions
    POSITIONS.forEach(position => {
      if (!formation[position]) {
        const remaining = availablePlayers.find(p => !usedPlayers.has(p.id));
        if (remaining) {
          formation[position] = remaining.id;
          usedPlayers.add(remaining.id);
        }
      }
    });

    if (Object.keys(formation).length < 7) return null;

    return {
      id: 'position-optimized',
      formation,
      effectiveness: 8.5,
      confidence: 85,
      historicalSuccess: 78,
      opponentSpecific: false,
      notes: 'Players assigned to their preferred positions for maximum comfort and effectiveness',
      availablePlayersOnly: true
    };
  };

  const generateExperienceBasedLineup = (availablePlayers: Player[]): LineupRecommendation | null => {
    const formation: Record<string, number> = {};
    const usedPlayers = new Set<number>();

    // Prioritize regular players
    const regularPlayers = availablePlayers.filter(p => p.isRegular);
    const otherPlayers = availablePlayers.filter(p => !p.isRegular);
    const sortedPlayers = [...regularPlayers, ...otherPlayers];

    POSITIONS.forEach((position, index) => {
      if (sortedPlayers[index] && !usedPlayers.has(sortedPlayers[index].id)) {
        formation[position] = sortedPlayers[index].id;
        usedPlayers.add(sortedPlayers[index].id);
      }
    });

    if (Object.keys(formation).length < 7) return null;

    return {
      id: 'experience-based',
      formation,
      effectiveness: 7.8,
      confidence: 75,
      historicalSuccess: 82,
      opponentSpecific: false,
      notes: 'Based on player experience and regular team membership',
      availablePlayersOnly: true
    };
  };

  const generateBalancedLineup = (availablePlayers: Player[]): LineupRecommendation | null => {
    const formation: Record<string, number> = {};
    const usedPlayers = new Set<number>();

    // Simple balanced distribution
    const sortedPlayers = [...availablePlayers].sort((a, b) => a.displayName?.localeCompare(b.displayName || '') || 0);

    POSITIONS.forEach((position, index) => {
      if (sortedPlayers[index] && !usedPlayers.has(sortedPlayers[index].id)) {
        formation[position] = sortedPlayers[index].id;
        usedPlayers.add(sortedPlayers[index].id);
      }
    });

    if (Object.keys(formation).length < 7) return null;

    return {
      id: 'balanced',
      formation,
      effectiveness: 7.2,
      confidence: 70,
      historicalSuccess: 75,
      opponentSpecific: false,
      notes: 'Balanced team composition with even distribution',
      availablePlayersOnly: true
    };
  };

  const generatePositionEffectivenessRecommendations = (availablePlayers: Player[]): LineupRecommendation[] => {
    // Check if we have roster data loaded
    if (isLoadingRosters || !rostersMap || Object.keys(rostersMap).length === 0) {
      console.log('LineupTab: No roster data available for position effectiveness analysis');
      return [];
    }

    console.log('LineupTab: Generating position effectiveness recommendations with', Object.keys(rostersMap).length, 'games of roster data');

    const recommendations: LineupRecommendation[] = [];
    
    // Analyze historical roster data from centralized data
    const positionLineups = analyzeHistoricalLineupsFromCentralized(availablePlayers, rostersMap);
    
    console.log('LineupTab: Found', positionLineups.length, 'complete historical lineups for analysis');
    
    if (positionLineups.length === 0) {
      return [];
    }
    
    // Generate recommendations based on different criteria
    const highestScoring = generateHighestScoringLineup(positionLineups, availablePlayers);
    if (highestScoring) recommendations.push(highestScoring);

    const bestDefence = generateBestDefenceLineup(positionLineups, availablePlayers);
    if (bestDefence) recommendations.push(bestDefence);

    const mostWins = generateMostWinsLineup(positionLineups, availablePlayers);
    if (mostWins) recommendations.push(mostWins);

    const bestOverall = generateBestOverallLineup(positionLineups, availablePlayers);
    if (bestOverall) recommendations.push(bestOverall);

    console.log('LineupTab: Generated', recommendations.length, 'position effectiveness recommendations');
    return recommendations;
  };

  const analyzeHistoricalLineupsFromCentralized = (availablePlayers: Player[], rostersMap: Record<string, any[]>) => {
    const quarterLineupMap = new Map();
    
    console.log('LineupTab: Analyzing historical lineups from', Object.keys(rostersMap).length, 'games');
    
    // Process roster data from each game
    Object.entries(rostersMap).forEach(([gameId, gameRosters]) => {
      if (!gameRosters || gameRosters.length === 0) {
        console.log(`LineupTab: No roster data for game ${gameId}`);
        return;
      }
      
      console.log(`LineupTab: Processing game ${gameId} with ${gameRosters.length} roster entries`);
      
      // Group by quarter
      const quarterData = new Map();
      gameRosters.forEach(roster => {
        if (!quarterData.has(roster.quarter)) {
          quarterData.set(roster.quarter, []);
        }
        quarterData.get(roster.quarter).push(roster);
      });

      // Get game stats for this game to calculate quarter performance
      const gameStats = centralizedStats[gameId] || [];

      quarterData.forEach((quarterRoster, quarter) => {
        // Build position formation for this quarter
        const formation: Record<string, number> = {};
        const quarterPlayers = new Set();

        quarterRoster.forEach((entry: any) => {
          // Find player by ID from the current team's players
          const player = players.find(p => p.id === entry.playerId);
          if (player && entry.position && POSITIONS.includes(entry.position)) {
            formation[entry.position] = player.id;
            quarterPlayers.add(player.id);
          }
        });

        // Only consider complete lineups with all 7 positions
        if (Object.keys(formation).length === 7 && quarterPlayers.size === 7) {
          // Check if at least 5 players in this formation are currently available
          const availablePlayersInFormation = Object.values(formation).filter(playerId => 
            availablePlayers.some(p => p.id === playerId)
          ).length;

          if (availablePlayersInFormation >= 5) {
            // Calculate quarter-specific performance from stats
            const quarterStats = gameStats.filter(stat => stat.quarter === quarter);
            const quarterGoalsFor = quarterStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
            const quarterGoalsAgainst = quarterStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);

            // Create lineup key based on position assignments
            const lineupKey = POSITIONS.map(pos => `${pos}:${formation[pos]}`).join('|');

            if (!quarterLineupMap.has(lineupKey)) {
              quarterLineupMap.set(lineupKey, {
                formation,
                quarters: [],
                totalGoalsFor: 0,
                totalGoalsAgainst: 0,
                wins: 0,
                availablePlayersCount: availablePlayersInFormation
              });
            }

            const lineupData = quarterLineupMap.get(lineupKey);
            lineupData.quarters.push({ gameId: parseInt(gameId), quarter });
            lineupData.totalGoalsFor += quarterGoalsFor;
            lineupData.totalGoalsAgainst += quarterGoalsAgainst;
            
            // Count as win if this quarter had positive goal differential
            if (quarterGoalsFor > quarterGoalsAgainst) {
              lineupData.wins += 1;
            }
          }
        }
      });
    });

    // Convert to analysis format
    const lineupAnalysis = [];
    quarterLineupMap.forEach((data, lineupKey) => {
      if (data.quarters.length >= 2) { // Need at least 2 quarters of data for meaningful analysis
        const avgGoalsFor = data.totalGoalsFor / data.quarters.length;
        const avgGoalsAgainst = data.totalGoalsAgainst / data.quarters.length;
        const winRate = (data.wins / data.quarters.length) * 100;

        // Create a formation with only available players
        const availableFormation: Record<string, number> = {};
        Object.entries(data.formation).forEach(([position, playerId]) => {
          if (availablePlayers.some(p => p.id === playerId)) {
            availableFormation[position] = playerId;
          }
        });

        lineupAnalysis.push({
          formation: availableFormation,
          quarters: data.quarters,
          goalsFor: avgGoalsFor,
          goalsAgainst: avgGoalsAgainst,
          winRate,
          quartersPlayed: data.quarters.length,
          availablePlayersCount: data.availablePlayersCount
        });
      }
    });

    console.log('LineupTab: Historical analysis found', lineupAnalysis.length, 'unique lineups with sufficient quarter data');
    return lineupAnalysis;
  };

  const generateHighestScoringLineup = (lineupAnalysis: any[], availablePlayers: Player[]): LineupRecommendation | null => {
    if (lineupAnalysis.length === 0) return null;

    // Find lineup with highest average goals scored per quarter
    const bestScoring = lineupAnalysis.reduce((best, current) => 
      (current.goalsFor || 0) > (best.goalsFor || 0) ? current : best
    );

    // Fill missing positions with available players
    const completeFormation = fillMissingPositions(bestScoring.formation, availablePlayers);

    const avgGoals = bestScoring.goalsFor || 0;
    const quartersPlayed = bestScoring.quartersPlayed || 1;
    const confidence = Math.min(85, Math.max(50, (bestScoring.availablePlayersCount || 0) / 7 * 100));
    const winRate = Math.max(0, bestScoring.winRate || 0);

    return {
      id: 'highest-scoring',
      formation: completeFormation,
      effectiveness: 8.8,
      confidence: Math.round(confidence),
      historicalSuccess: Math.round(winRate),
      opponentSpecific: false,
      notes: `Highest scoring lineup (avg ${avgGoals.toFixed(1)} goals/quarter over ${quartersPlayed} quarters)`,
      availablePlayersOnly: true
    };
  };

  const generateBestDefenceLineup = (lineupAnalysis: any[], availablePlayers: Player[]): LineupRecommendation | null => {
    if (lineupAnalysis.length === 0) return null;

    // Find lineup with lowest goals conceded per quarter
    const bestDefence = lineupAnalysis.reduce((best, current) => 
      (current.goalsAgainst || 999) < (best.goalsAgainst || 999) ? current : best
    );

    const completeFormation = fillMissingPositions(bestDefence.formation, availablePlayers);

    const avgGoalsAgainst = bestDefence.goalsAgainst || 0;
    const quartersPlayed = bestDefence.quartersPlayed || 1;
    const confidence = Math.min(82, Math.max(50, (bestDefence.availablePlayersCount || 0) / 7 * 100));
    const winRate = Math.max(0, bestDefence.winRate || 0);

    return {
      id: 'best-defence',
      formation: completeFormation,
      effectiveness: 8.5,
      confidence: Math.round(confidence),
      historicalSuccess: Math.round(winRate),
      opponentSpecific: false,
      notes: `Best defensive lineup (avg ${avgGoalsAgainst.toFixed(1)} goals conceded/quarter over ${quartersPlayed} quarters)`,
      availablePlayersOnly: true
    };
  };

  const generateMostWinsLineup = (lineupAnalysis: any[], availablePlayers: Player[]): LineupRecommendation | null => {
    if (lineupAnalysis.length === 0) return null;

    // Find lineup with highest win rate (quarters won vs lost)
    const mostWins = lineupAnalysis.reduce((best, current) => 
      (current.winRate || 0) > (best.winRate || 0) ? current : best
    );

    const completeFormation = fillMissingPositions(mostWins.formation, availablePlayers);

    const winRate = Math.max(0, mostWins.winRate || 0);
    const quartersPlayed = mostWins.quartersPlayed || 1;
    const confidence = Math.min(88, Math.max(50, (mostWins.availablePlayersCount || 0) / 7 * 100));

    return {
      id: 'most-successful',
      formation: completeFormation,
      effectiveness: 8.7,
      confidence: Math.round(confidence),
      historicalSuccess: Math.round(winRate),
      opponentSpecific: false,
      notes: `Most successful lineup (${winRate.toFixed(0)}% quarter win rate over ${quartersPlayed} quarters)`,
      availablePlayersOnly: true
    };
  };

  const generateBestOverallLineup = (lineupAnalysis: any[], availablePlayers: Player[]): LineupRecommendation | null => {
    if (lineupAnalysis.length === 0) return null;

    // Find lineup with best goal differential per quarter
    const bestOverall = lineupAnalysis.reduce((best, current) => {
      const currentDiff = (current.goalsFor || 0) - (current.goalsAgainst || 0);
      const bestDiff = (best.goalsFor || 0) - (best.goalsAgainst || 0);
      return currentDiff > bestDiff ? current : best;
    });

    const goalDiff = (bestOverall.goalsFor || 0) - (bestOverall.goalsAgainst || 0);
    const quartersPlayed = bestOverall.quartersPlayed || 1;
    const completeFormation = fillMissingPositions(bestOverall.formation, availablePlayers);
    const confidence = Math.min(90, Math.max(50, (bestOverall.availablePlayersCount || 0) / 7 * 100));
    const winRate = Math.max(0, bestOverall.winRate || 0);

    return {
      id: 'best-goal-differential',
      formation: completeFormation,
      effectiveness: 9.0,
      confidence: Math.round(confidence),
      historicalSuccess: Math.round(winRate),
      opponentSpecific: false,
      notes: `Best goal differential (${goalDiff > 0 ? '+' : ''}${goalDiff.toFixed(1)}/quarter over ${quartersPlayed} quarters)`,
      availablePlayersOnly: true
    };
  };

  // Helper function to fill missing positions with available players
  const fillMissingPositions = (partialFormation: Record<string, number>, availablePlayers: Player[]): Record<string, number> => {
    const formation = { ...partialFormation };
    const usedPlayers = new Set(Object.values(formation));
    
    POSITIONS.forEach(position => {
      if (!formation[position]) {
        // Find an available player not already used
        const availablePlayer = availablePlayers.find(p => !usedPlayers.has(p.id));
        if (availablePlayer) {
          formation[position] = availablePlayer.id;
          usedPlayers.add(availablePlayer.id);
        }
      }
    });

    return formation;
  };

  const handleAvailabilityChange = (newAvailabilityData: PlayerAvailabilityData) => {
    setPlayerAvailability(newAvailabilityData);
  };

  const handleApplyRecommendation = (recommendation: LineupRecommendation) => {
    const newRoster: Record<number, Record<string, number | null>> = {
      1: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null },
      2: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null },
      3: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null },
      4: { GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null }
    };

    // Apply the recommendation to all quarters
    POSITIONS.forEach(position => {
      const playerId = recommendation.formation[position];
      if (playerId) {
        for (let quarter = 1; quarter <= 4; quarter++) {
          newRoster[quarter][position] = playerId;
        }
      }
    });
    
    console.log('LineupTab: Applying recommendation to roster:', newRoster);
    setSelectedRoster(newRoster);
    setActiveStep('builder');
    
    // Add a small delay to ensure the DragDropRosterManager has time to process the roster change
    setTimeout(() => {
      console.log('LineupTab: Roster should now be applied in DragDropRosterManager');
    }, 100);
  };

  // Filter recommendations
  const filteredRecommendations = recommendations.filter(rec => {
    return confidenceFilter === 'all' || 
      (confidenceFilter === 'high' && rec.confidence >= 80) ||
      (confidenceFilter === 'medium' && rec.confidence >= 60 && rec.confidence < 80) ||
      (confidenceFilter === 'low' && rec.confidence < 60);
  });

  const availableCount = Object.values(playerAvailability).filter(status => status === true).length;
  const canProceed = availableCount >= 7;

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 ${activeStep === 'availability' ? 'text-blue-600 font-medium' : canProceed ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeStep === 'availability' ? 'bg-blue-100' : canProceed ? 'bg-green-100' : 'bg-gray-100'}`}>
              {canProceed && activeStep !== 'availability' ? <CheckCircle className="h-5 w-5" /> : '1'}
            </div>
            <span>Player Availability</span>
          </div>
          <div className={`w-8 h-0.5 ${canProceed ? 'bg-green-200' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center space-x-2 ${!canProceed ? 'text-gray-400' : activeStep === 'recommendations' ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${!canProceed ? 'bg-gray-100' : activeStep === 'recommendations' ? 'bg-blue-100' : 'bg-gray-100'}`}>
              2
            </div>
            <span>Recommendations</span>
          </div>
          <div className={`w-8 h-0.5 ${canProceed ? 'bg-green-200' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center space-x-2 ${!canProceed ? 'text-gray-400' : activeStep === 'builder' ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${!canProceed ? 'bg-gray-100' : activeStep === 'builder' ? 'bg-blue-100' : 'bg-gray-100'}`}>
              3
            </div>
            <span>Lineup Builder</span>
          </div>
        </div>
        <Badge variant={canProceed ? "default" : "secondary"}>
          {availableCount} players available
        </Badge>
      </div>



      <Tabs value={activeStep} onValueChange={(value) => setActiveStep(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="availability" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Player Availability
          </TabsTrigger>
          <TabsTrigger value="recommendations" disabled={!canProceed} className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="builder" disabled={!canProceed} className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Lineup Builder
          </TabsTrigger>
        </TabsList>

        {/* Player Availability Tab */}
        <TabsContent value="availability" className="space-y-6">
          <div className="mb-4">
            {!canProceed && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Need at least 7 available players to generate lineup recommendations. Currently have {availableCount} available.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <PlayerAvailabilityManager
            players={players}
            gameId={game.id}
            games={[game]}
            onAvailabilityStateChange={(availabilityState) => {
              setPlayerAvailability(availabilityState);
            }}
            onAvailabilityChange={(availablePlayerIds) => {
              // Convert array back to boolean format for internal use
              const newData: PlayerAvailabilityData = {};
              players.forEach(player => {
                newData[player.id] = availablePlayerIds.includes(player.id);
              });
              setPlayerAvailability(newData);
            }}
            hideGameSelection={true}
          />
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Lineup Recommendations
                </CardTitle>
                <Select value={confidenceFilter} onValueChange={(value: any) => setConfidenceFilter(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by confidence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Recommendations</SelectItem>
                    <SelectItem value="high">High Confidence</SelectItem>
                    <SelectItem value="medium">Medium Confidence</SelectItem>
                    <SelectItem value="low">Low Confidence</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {filteredRecommendations.length > 0 ? (
                <div className="space-y-6">
                  {filteredRecommendations.map(recommendation => (
                    <RecommendationCard
                      key={recommendation.id}
                      recommendation={recommendation}
                      players={players}
                      onApply={() => handleApplyRecommendation(recommendation)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600">No recommendations available</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {availableCount < 7 ? 'Need at least 7 available players' : 'Unable to generate recommendations'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lineup Builder Tab */}
        <TabsContent value="builder" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Drag & Drop Lineup Builder
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Drag players from the bench to court positions or between positions to create your lineup
              </p>
            </CardHeader>
            <CardContent>
              <DragDropRosterManager
                availablePlayers={players.filter(p => playerAvailability[p.id] === true)}
                gameInfo={{
                  opponent: game.awayTeamName || game.homeTeamName || "Unknown",
                  date: game.date,
                  time: game.time
                }}
                gameId={game.id}
                onRosterChange={setSelectedRoster}
                onRosterSaved={() => {
                  toast({
                    title: "Success",
                    description: "Roster saved successfully!"
                  });
                }}
                initialRoster={selectedRoster}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}



// Recommendation Card Component
function RecommendationCard({
  recommendation,
  players,
  onApply
}: {
  recommendation: LineupRecommendation;
  players: Player[];
  onApply: () => void;
}) {
  const getPlayerName = (playerId: number) => {
    const player = players.find(p => p.id === playerId);
    return player ? (player.displayName || `${player.firstName} ${player.lastName}`) : 'Unknown';
  };

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Star className="h-5 w-5 text-yellow-500" />
            <div>
              <h3 className="font-semibold capitalize">{recommendation.id.replace('-', ' ')}</h3>
              <p className="text-sm text-gray-600">{recommendation.notes}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {Math.round(recommendation.confidence || 0)}% confidence
            </Badge>
            <Badge variant="secondary">
              {recommendation.effectiveness.toFixed(1)} effectiveness
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {POSITIONS.map(position => (
            <div key={position} className="text-center p-2 bg-gray-50 rounded">
              <div className="text-xs font-medium text-gray-600 mb-1">{position}</div>
              <div className="text-xs">
                {getPlayerName(recommendation.formation[position])}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <div className="flex gap-4 text-xs text-gray-600">
            <span>Historical: {recommendation.historicalSuccess}%</span>
            <span>{recommendation.opponentSpecific ? 'Opponent-specific' : 'General'}</span>
          </div>
          <Button onClick={onApply} size="sm">
            Apply Lineup
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default LineupTab;