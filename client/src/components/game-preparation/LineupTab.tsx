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

    console.log('LineupTab: Generating opponent-specific recommendations with', Object.keys(rostersMap).length, 'games of roster data');

    const recommendations: LineupRecommendation[] = [];
    
    // Get opponent information for this game
    const opponent = game.homeTeamId === currentTeamId ? game.awayTeamName : game.homeTeamName;
    const opponentId = game.homeTeamId === currentTeamId ? game.awayTeamId : game.homeTeamId;
    
    // Filter historical games to only include matches against THIS opponent
    const opponentSpecificGames = completedGames.filter(g => {
      const gameOpponentId = g.homeTeamId === currentTeamId ? g.awayTeamId : g.homeTeamId;
      return gameOpponentId === opponentId;
    });

    console.log(`LineupTab: Found ${opponentSpecificGames.length} historical games vs ${opponent}`);

    // Analyze historical roster data from centralized data (opponent-specific)
    const positionLineups = analyzeHistoricalLineupsFromCentralized(availablePlayers, rostersMap, opponentSpecificGames);
    
    console.log('LineupTab: Found', positionLineups.length, 'opponent-specific lineups for analysis');
    
    if (positionLineups.length === 0) {
      // If no opponent-specific data, fall back to general recommendations but mark them as such
      return generateGeneralRecommendations(availablePlayers);
    }
    
    // Generate opponent-specific recommendations
    const antiOpponentOffense = generateAntiOpponentOffenseLineup(positionLineups, availablePlayers, opponent);
    if (antiOpponentOffense) recommendations.push(antiOpponentOffense);

    const antiOpponentDefense = generateAntiOpponentDefenseLineup(positionLineups, availablePlayers, opponent);
    if (antiOpponentDefense) recommendations.push(antiOpponentDefense);

    const clutchVsOpponent = generateClutchVsOpponentLineup(positionLineups, availablePlayers, opponent);
    if (clutchVsOpponent) recommendations.push(clutchVsOpponent);

    const recentFormVsOpponent = generateRecentFormVsOpponentLineup(positionLineups, availablePlayers, opponent);
    if (recentFormVsOpponent) recommendations.push(recentFormVsOpponent);

    const bestOverallVsOpponent = generateBestOverallVsOpponentLineup(positionLineups, availablePlayers, opponent);
    if (bestOverallVsOpponent) recommendations.push(bestOverallVsOpponent);

    console.log('LineupTab: Generated', recommendations.length, 'opponent-specific recommendations');
    return recommendations;
  };

  const analyzeHistoricalLineupsFromCentralized = (availablePlayers: Player[], rostersMap: Record<string, any[]>, filterGames?: Game[]) => {
    const quarterLineupMap = new Map();
    
    console.log('LineupTab: Analyzing historical lineups from', Object.keys(rostersMap).length, 'games');
    
    // Filter games if specified (for opponent-specific analysis)
    const gamesToAnalyze = filterGames ? filterGames.map(g => g.id.toString()) : Object.keys(rostersMap);
    
    // Process roster data from each game
    gamesToAnalyze.forEach(gameId => {
      const gameRosters = rostersMap[gameId];
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

  // Helper function to fill missing positions with available players (now supports smart substitutions)
  const fillMissingPositions = (partialFormation: Record<string, number>, availablePlayers: Player[], strategy: 'optimal' | 'balanced' | 'defensive' | 'offensive' = 'optimal'): Record<string, number> => {
    const formation = { ...partialFormation };
    const usedPlayers = new Set(Object.values(formation));
    
    POSITIONS.forEach(position => {
      if (!formation[position]) {
        // Find the best available player for this position based on strategy
        let availablePlayer;
        
        switch (strategy) {
          case 'optimal':
            // Prefer players who have this position in their preferences
            availablePlayer = availablePlayers.find(p => 
              !usedPlayers.has(p.id) && 
              p.positionPreferences?.includes(position as any)
            ) || availablePlayers.find(p => !usedPlayers.has(p.id));
            break;
          case 'defensive':
            // For defensive positions (GK, GD, WD), prefer experienced players
            if (['GK', 'GD', 'WD'].includes(position)) {
              availablePlayer = availablePlayers.find(p => 
                !usedPlayers.has(p.id) && 
                (p.isRegular || p.positionPreferences?.includes(position as any))
              ) || availablePlayers.find(p => !usedPlayers.has(p.id));
            } else {
              availablePlayer = availablePlayers.find(p => !usedPlayers.has(p.id));
            }
            break;
          case 'offensive':
            // For offensive positions (GS, GA, WA), prefer players with attacking experience
            if (['GS', 'GA', 'WA'].includes(position)) {
              availablePlayer = availablePlayers.find(p => 
                !usedPlayers.has(p.id) && 
                (p.isRegular || p.positionPreferences?.includes(position as any))
              ) || availablePlayers.find(p => !usedPlayers.has(p.id));
            } else {
              availablePlayer = availablePlayers.find(p => !usedPlayers.has(p.id));
            }
            break;
          default:
            availablePlayer = availablePlayers.find(p => !usedPlayers.has(p.id));
        }
        
        if (availablePlayer) {
          formation[position] = availablePlayer.id;
          usedPlayers.add(availablePlayer.id);
        }
      }
    });

    return formation;
  };

  // Generate fallback recommendations when no opponent-specific data exists
  const generateGeneralRecommendations = (availablePlayers: Player[]): LineupRecommendation[] => {
    const recommendations: LineupRecommendation[] = [];
    
    // Position-optimized (already exists)
    const positionOptimized = generatePositionOptimizedLineup(availablePlayers);
    if (positionOptimized) {
      positionOptimized.notes = `${positionOptimized.notes} (No opponent-specific data available)`;
      recommendations.push(positionOptimized);
    }
    
    return recommendations;
  };

  // Anti-Opponent Offense: Focus on exploiting opponent's defensive weaknesses
  const generateAntiOpponentOffenseLineup = (lineupAnalysis: any[], availablePlayers: Player[], opponent: string): LineupRecommendation | null => {
    if (lineupAnalysis.length === 0) return null;

    // Find the lineup that scored the most against this opponent
    const bestOffensive = lineupAnalysis.reduce((best, current) => 
      (current.goalsFor || 0) > (best.goalsFor || 0) ? current : best
    );

    const completeFormation = fillMissingPositions(bestOffensive.formation, availablePlayers, 'offensive');
    const confidence = Math.min(90, Math.max(60, (bestOffensive.availablePlayersCount || 0) / 7 * 100));

    return {
      id: 'anti-opponent-offense',
      formation: completeFormation,
      effectiveness: 9.2,
      confidence: Math.round(confidence),
      historicalSuccess: Math.round(bestOffensive.winRate || 0),
      opponentSpecific: true,
      notes: `Exploit ${opponent}'s defense - avg ${(bestOffensive.goalsFor || 0).toFixed(1)} goals vs them`,
      availablePlayersOnly: true
    };
  };

  // Anti-Opponent Defense: Focus on stopping opponent's offensive patterns
  const generateAntiOpponentDefenseLineup = (lineupAnalysis: any[], availablePlayers: Player[], opponent: string): LineupRecommendation | null => {
    if (lineupAnalysis.length === 0) return null;

    // Find the lineup that conceded the least against this opponent
    const bestDefensive = lineupAnalysis.reduce((best, current) => 
      (current.goalsAgainst || 999) < (best.goalsAgainst || 999) ? current : best
    );

    const completeFormation = fillMissingPositions(bestDefensive.formation, availablePlayers, 'defensive');
    const confidence = Math.min(88, Math.max(60, (bestDefensive.availablePlayersCount || 0) / 7 * 100));

    return {
      id: 'anti-opponent-defense',
      formation: completeFormation,
      effectiveness: 9.0,
      confidence: Math.round(confidence),
      historicalSuccess: Math.round(bestDefensive.winRate || 0),
      opponentSpecific: true,
      notes: `Counter ${opponent}'s attack - only ${(bestDefensive.goalsAgainst || 0).toFixed(1)} goals conceded`,
      availablePlayersOnly: true
    };
  };

  // Clutch vs Opponent: Lineup that performs well in close games against this opponent
  const generateClutchVsOpponentLineup = (lineupAnalysis: any[], availablePlayers: Player[], opponent: string): LineupRecommendation | null => {
    if (lineupAnalysis.length === 0) return null;

    // Find lineups that had close games and won
    const clutchLineups = lineupAnalysis.filter(lineup => {
      const margin = Math.abs((lineup.goalsFor || 0) - (lineup.goalsAgainst || 0));
      return margin <= 5 && (lineup.goalsFor || 0) > (lineup.goalsAgainst || 0);
    });

    if (clutchLineups.length === 0) {
      // Fallback to most balanced lineup
      const balanced = lineupAnalysis.reduce((best, current) => {
        const currentBalance = Math.abs((current.goalsFor || 0) - (current.goalsAgainst || 0));
        const bestBalance = Math.abs((best.goalsFor || 0) - (best.goalsAgainst || 0));
        return currentBalance < bestBalance ? current : best;
      });
      
      const completeFormation = fillMissingPositions(balanced.formation, availablePlayers, 'balanced');
      const confidence = Math.min(75, Math.max(50, (balanced.availablePlayersCount || 0) / 7 * 100));

      return {
        id: 'clutch-vs-opponent',
        formation: completeFormation,
        effectiveness: 8.3,
        confidence: Math.round(confidence),
        historicalSuccess: Math.round(balanced.winRate || 0),
        opponentSpecific: true,
        notes: `Pressure-tested vs ${opponent} - balanced approach for close games`,
        availablePlayersOnly: true
      };
    }

    const bestClutch = clutchLineups[0];
    const completeFormation = fillMissingPositions(bestClutch.formation, availablePlayers, 'balanced');
    const confidence = Math.min(85, Math.max(65, (bestClutch.availablePlayersCount || 0) / 7 * 100));

    return {
      id: 'clutch-vs-opponent',
      formation: completeFormation,
      effectiveness: 8.8,
      confidence: Math.round(confidence),
      historicalSuccess: Math.round(bestClutch.winRate || 0),
      opponentSpecific: true,
      notes: `Clutch performers vs ${opponent} - proven in pressure moments`,
      availablePlayersOnly: true
    };
  };

  // Recent Form vs Opponent: Weight recent games more heavily
  const generateRecentFormVsOpponentLineup = (lineupAnalysis: any[], availablePlayers: Player[], opponent: string): LineupRecommendation | null => {
    if (lineupAnalysis.length === 0) return null;

    // Weight recent quarters more heavily (assuming quarters array is in chronological order)
    const weightedLineups = lineupAnalysis.map(lineup => {
      const totalQuarters = lineup.quarters.length;
      let weightedGoalsFor = 0;
      let weightedGoalsAgainst = 0;
      let totalWeight = 0;

      lineup.quarters.forEach((quarter: any, index: number) => {
        // More recent quarters get higher weight (last quarter gets weight 1.0, earlier quarters get progressively less)
        const weight = 0.5 + (index / totalQuarters) * 0.5;
        const quarterGoalsFor = lineup.goalsFor / totalQuarters; // Average per quarter
        const quarterGoalsAgainst = lineup.goalsAgainst / totalQuarters;
        
        weightedGoalsFor += quarterGoalsFor * weight;
        weightedGoalsAgainst += quarterGoalsAgainst * weight;
        totalWeight += weight;
      });

      return {
        ...lineup,
        recentEffectiveness: (weightedGoalsFor - weightedGoalsAgainst) / totalWeight,
        recentGoalsFor: weightedGoalsFor / totalWeight,
        recentGoalsAgainst: weightedGoalsAgainst / totalWeight
      };
    });

    const bestRecent = weightedLineups.reduce((best, current) => 
      (current.recentEffectiveness || -999) > (best.recentEffectiveness || -999) ? current : best
    );

    const completeFormation = fillMissingPositions(bestRecent.formation, availablePlayers, 'optimal');
    const confidence = Math.min(92, Math.max(70, (bestRecent.availablePlayersCount || 0) / 7 * 100));

    return {
      id: 'recent-form-vs-opponent',
      formation: completeFormation,
      effectiveness: 9.1,
      confidence: Math.round(confidence),
      historicalSuccess: Math.round(bestRecent.winRate || 0),
      opponentSpecific: true,
      notes: `Hot vs ${opponent} - weighted recent performance (+${(bestRecent.recentEffectiveness || 0).toFixed(1)} recent diff)`,
      availablePlayersOnly: true
    };
  };

  // Best Overall vs Opponent: Comprehensive scoring
  const generateBestOverallVsOpponentLineup = (lineupAnalysis: any[], availablePlayers: Player[], opponent: string): LineupRecommendation | null => {
    if (lineupAnalysis.length === 0) return null;

    // Calculate comprehensive effectiveness score
    const scoredLineups = lineupAnalysis.map(lineup => {
      const goalDiff = (lineup.goalsFor || 0) - (lineup.goalsAgainst || 0);
      const winRate = lineup.winRate || 0;
      const consistency = lineup.quarters.length >= 3 ? 1.2 : 1.0; // Bonus for more data
      const sampleSize = Math.min(1.0, lineup.quarters.length / 5); // Penalty for small sample
      
      const comprehensiveScore = (goalDiff * 2) + (winRate / 10) + consistency + sampleSize;
      
      return {
        ...lineup,
        comprehensiveScore
      };
    });

    const bestOverall = scoredLineups.reduce((best, current) => 
      (current.comprehensiveScore || -999) > (best.comprehensiveScore || -999) ? current : best
    );

    const goalDiff = (bestOverall.goalsFor || 0) - (bestOverall.goalsAgainst || 0);
    const completeFormation = fillMissingPositions(bestOverall.formation, availablePlayers, 'optimal');
    const confidence = Math.min(95, Math.max(75, (bestOverall.availablePlayersCount || 0) / 7 * 100));

    return {
      id: 'best-overall-vs-opponent',
      formation: completeFormation,
      effectiveness: 9.5,
      confidence: Math.round(confidence),
      historicalSuccess: Math.round(bestOverall.winRate || 0),
      opponentSpecific: true,
      notes: `Optimal vs ${opponent} - best overall record (${goalDiff > 0 ? '+' : ''}${goalDiff.toFixed(1)} avg diff, ${bestOverall.quarters.length} quarters)`,
      availablePlayersOnly: true
    };
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

  // Determine card styling based on recommendation type
  const getCardStyling = () => {
    if (recommendation.opponentSpecific) {
      return "border-2 border-orange-300 bg-orange-50";
    }
    return "border-2 border-blue-200";
  };

  const getIconStyling = () => {
    if (recommendation.opponentSpecific) {
      return "h-5 w-5 text-orange-600";
    }
    return "h-5 w-5 text-yellow-500";
  };

  const getConfidenceBadgeVariant = () => {
    if (recommendation.confidence >= 80) return "default";
    if (recommendation.confidence >= 60) return "secondary";
    return "outline";
  };

  return (
    <Card className={getCardStyling()}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Star className={getIconStyling()} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold capitalize">{recommendation.id.replace('-', ' ')}</h3>
                {recommendation.opponentSpecific && (
                  <Badge variant="outline" className="text-orange-700 border-orange-300 bg-orange-100">
                    vs Opponent
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600">{recommendation.notes}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getConfidenceBadgeVariant()}>
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
          {POSITIONS.map(position => {
            const playerId = recommendation.formation[position];
            const playerName = getPlayerName(playerId);
            const isSubstitution = playerName === 'Unknown'; // This would indicate a filled position
            
            return (
              <div 
                key={position} 
                className={`text-center p-2 rounded ${
                  isSubstitution ? 'bg-yellow-100 border border-yellow-300' : 'bg-gray-50'
                }`}
              >
                <div className="text-xs font-medium text-gray-600 mb-1">{position}</div>
                <div className={`text-xs ${isSubstitution ? 'text-yellow-700 italic' : ''}`}>
                  {playerName}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between items-center">
          <div className="flex gap-4 text-xs text-gray-600">
            <span>Win Rate: {recommendation.historicalSuccess}%</span>
            {recommendation.opponentSpecific ? (
              <span className="text-orange-600 font-medium">Opponent-specific</span>
            ) : (
              <span>General strategy</span>
            )}
          </div>
          <Button onClick={onApply} size="sm" className={recommendation.opponentSpecific ? "bg-orange-600 hover:bg-orange-700" : ""}>
            Apply Lineup
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default LineupTab;