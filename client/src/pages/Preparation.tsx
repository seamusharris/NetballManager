import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorDisplay } from '@/components/ui/error-display';
import { PlayerAvatar } from '@/components/ui/player-avatar';
import { PlayerAvailabilitySelector } from '@/components/ui/player-availability-selector';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { CourtDisplay } from '@/components/ui/court-display';
import { ResultBadge } from '@/components/ui/result-badge';
import { useClub } from '@/contexts/ClubContext';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import { useBatchGameStatistics } from '@/components/statistics/hooks/useBatchGameStatistics';
import { useBatchRosterData } from '@/components/statistics/hooks/useBatchRosterData';
import { 
  Trophy, Target, TrendingUp, Users, CheckCircle, Clock, 
  AlertTriangle, Lightbulb, ChevronRight, ArrowRight, 
  RotateCcw, Zap, Play, Save, Calendar, MapPin, Copy, FileText,
  BarChart3, TrendingDown, Award, Shield, Star, Eye, Brain,
  Activity, Flame, History, Search, Filter, RefreshCw, 
  Crosshair, Focus, Layers, Hash, Flag, Telescope, Check
} from 'lucide-react';
import { 
  Game, GameStat, Player, PlayerAvailability, 
  Position, NETBALL_POSITIONS 
} from '@/shared/api-types';
import { cn, getWinLoseLabel, formatShortDate } from "@/lib/utils";

interface PlayerRecommendation {
  position: Position;
  players: Array<{
    player: Player;
    confidence: number;
    reason: string;
    avgRating?: number;
    gamesInPosition?: number;
    vsOpponentRecord?: { played: number; won: number; };
  }>;
}

interface OpponentAnalysis {
  teamName: string;
  clubName: string;
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  avgScoreFor: number;
  avgScoreAgainst: number;
  scoreDifferential: number;
  recentForm: string[];
  lastPlayed?: string;
  quarterAnalysis: {
    byQuarter: Record<number, {
      avgTeamScore: number;
      avgOpponentScore: number;
      gamesPlayed: number;
    }>;
    strongestQuarter: number;
    weakestQuarter: number;
  };
  positionPerformance: Record<string, {
    goalsFor: number;
    goalsAgainst: number;
    efficiency: number;
  }>;
  gameNotes: Array<{
    gameId: number;
    date: string;
    result: string;
    notes: string;
  }>;
}

interface TeamInsights {
  momentum: {
    trend: 'up' | 'down' | 'stable';
    strength: number;
    recentForm: string[];
  };
  positionStrengths: Record<string, {
    efficiency: number;
    consistency: number;
    playerDepth: number;
  }>;
  tacticalRecommendations: string[];
  keyMatchups: Array<{
    position: string;
    advantage: 'us' | 'them' | 'neutral';
    reasoning: string;
  }>;
}

const POSITIONS_ORDER: Position[] = ['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'];

export default function Preparation() {
  const { currentClubId, currentTeamId } = useClub();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [availabilityData, setAvailabilityData] = useState<Record<number, 'available' | 'unavailable' | 'maybe'>>({});
  const [selectedLineup, setSelectedLineup] = useState<Record<Position, Player | null>>({
    GS: null, GA: null, WA: null, C: null, WD: null, GD: null, GK: null
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [teamPlayers, setTeamPlayers] = useState<Player[]>([]);
  const [isLoadingTeamPlayers, setIsLoadingTeamPlayers] = useState(false);
  const [opponentAnalysis, setOpponentAnalysis] = useState<OpponentAnalysis | null>(null);
  const [teamInsights, setTeamInsights] = useState<TeamInsights | null>(null);

  // Data fetching
  const { data: games, isLoading: gamesLoading, error: gamesError } = useQuery({
    queryKey: ['games', currentClubId, currentTeamId],
    queryFn: () => apiClient.get('/api/games'),
    enabled: !!currentClubId && !!currentTeamId,
    staleTime: 2 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const { data: players, isLoading: playersLoading, error: playersError } = useQuery({
    queryKey: ['players', currentClubId],
    queryFn: () => apiClient.get('/api/players'),
    enabled: !!currentClubId,
    staleTime: 5 * 60 * 1000,
  });

  // Get all completed games for historical analysis
  const completedGames = useMemo(() => {
    if (!games) return [];
    return games.filter(game => game.statusIsCompleted && game.statusAllowsStatistics);
  }, [games]);

  const gameIds = completedGames.map(game => game.id);

  // Fetch batch statistics for historical analysis
  const { statsMap: centralizedStats = {}, isLoading: statsLoading } = useBatchGameStatistics(gameIds);
  const { rostersMap: centralizedRosters = {}, isLoading: rostersLoading } = useBatchRosterData(gameIds);

  // Get upcoming games for this team
  const upcomingGames = useMemo(() => {
    if (!games || !currentTeamId) return [];

    return games
      .filter(game => 
        !game.statusIsCompleted && 
        (game.homeTeamId === currentTeamId || game.awayTeamId === currentTeamId)
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [games, currentTeamId]);

  // Auto-select next game if not already selected
  useEffect(() => {
    if (upcomingGames.length > 0 && !selectedGameId) {
      setSelectedGameId(upcomingGames[0].id);
    }
  }, [upcomingGames, selectedGameId]);

  // Load team players and set default availability
  useEffect(() => {
    const loadTeamPlayers = async () => {
      if (!currentTeamId) {
        setTeamPlayers([]);
        return;
      }

      setIsLoadingTeamPlayers(true);
      try {
        const response = await apiClient.get(`/api/teams/${currentTeamId}/players`);
        setTeamPlayers(response);

        // Set all players as available by default
        const defaultAvailability = response.reduce((acc, player) => {
          acc[player.id] = 'available';
          return acc;
        }, {} as Record<number, 'available' | 'unavailable' | 'maybe'>);
        setAvailabilityData(defaultAvailability);
      } catch (error) {
        console.error('Error loading team players:', error);
        const fallbackPlayers = players || [];
        setTeamPlayers(fallbackPlayers);

        const defaultAvailability = fallbackPlayers.reduce((acc, player) => {
          acc[player.id] = 'available';
          return acc;
        }, {} as Record<number, 'available' | 'unavailable' | 'maybe'>);
        setAvailabilityData(defaultAvailability);
      } finally {
        setIsLoadingTeamPlayers(false);
      }
    };

    loadTeamPlayers();
  }, [currentTeamId, players]);

  // Analyze opponent when game is selected
  useEffect(() => {
    if (!selectedGameId || !games || !centralizedStats || Object.keys(centralizedStats).length === 0) {
      setOpponentAnalysis(null);
      return;
    }

    const selectedGame = games.find(g => g.id === selectedGameId);
    if (!selectedGame) return;

    const opponentTeamId = selectedGame.homeTeamId === currentTeamId 
      ? selectedGame.awayTeamId 
      : selectedGame.homeTeamId;

    const opponentTeamName = selectedGame.homeTeamId === currentTeamId 
      ? selectedGame.awayTeamName 
      : selectedGame.homeTeamName;

    const opponentClubName = selectedGame.homeTeamId === currentTeamId 
      ? selectedGame.awayClubName 
      : selectedGame.homeClubName;

    if (!opponentTeamId || opponentTeamName === 'Bye') {
      setOpponentAnalysis(null);
      return;
    }

    // Find all games against this opponent
    const opponentGames = completedGames.filter(game => {
      const isHomeGame = game.homeClubId === currentClubId;
      const isAwayGame = game.awayClubId === currentClubId;

      if (isHomeGame && !isAwayGame) {
        return game.awayTeamId === opponentTeamId;
      } else if (isAwayGame && !isHomeGame) {
        return game.homeTeamId === opponentTeamId;
      }
      return false;
    });

    if (opponentGames.length === 0) {
      setOpponentAnalysis(null);
      return;
    }

    // Calculate opponent analysis
    let wins = 0, losses = 0, draws = 0;
    let totalScoreFor = 0, totalScoreAgainst = 0;
    const recentForm: string[] = [];
    const gameNotes: any[] = [];

    const quarterData: Record<number, { teamScores: number[]; opponentScores: number[] }> = {
      1: { teamScores: [], opponentScores: [] },
      2: { teamScores: [], opponentScores: [] },
      3: { teamScores: [], opponentScores: [] },
      4: { teamScores: [], opponentScores: [] }
    };

    const positionPerformance: Record<string, any> = {};
    const positions = ['GK', 'GD', 'WD', 'C', 'WA', 'GA', 'GS'];
    positions.forEach(position => {
      positionPerformance[position] = { goalsFor: 0, goalsAgainst: 0, efficiency: 0 };
    });

    opponentGames.forEach(game => {
      const gameStats = centralizedStats[game.id] || [];
      const ourScore = gameStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
      const theirScore = gameStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);
      const result = getWinLoseLabel(ourScore, theirScore);

      totalScoreFor += ourScore;
      totalScoreAgainst += theirScore;

      if (result === 'Win') {
        wins++;
        recentForm.push('W');
      } else if (result === 'Loss') {
        losses++;
        recentForm.push('L');
      } else {
        draws++;
        recentForm.push('D');
      }

      // Quarter analysis
      [1, 2, 3, 4].forEach(quarter => {
        const quarterStats = gameStats.filter(stat => stat.quarter === quarter);
        const teamScore = quarterStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
        const opponentScore = quarterStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);

        quarterData[quarter].teamScores.push(teamScore);
        quarterData[quarter].opponentScores.push(opponentScore);
      });

      // Position performance
      gameStats.forEach(stat => {
        if (stat.position && positions.includes(stat.position)) {
          positionPerformance[stat.position].goalsFor += stat.goalsFor || 0;
          positionPerformance[stat.position].goalsAgainst += stat.goalsAgainst || 0;
        }
      });

      if (game.notes && game.notes.trim()) {
        gameNotes.push({
          gameId: game.id,
          date: game.date,
          result,
          notes: game.notes
        });
      }
    });

    // Calculate quarter analysis
    const byQuarter: Record<number, any> = {};
    let strongestQuarter = 1;
    let weakestQuarter = 1;
    let bestDifferential = -Infinity;
    let worstDifferential = Infinity;

    [1, 2, 3, 4].forEach(quarter => {
      const data = quarterData[quarter];
      const avgTeamScore = data.teamScores.length > 0 
        ? data.teamScores.reduce((a, b) => a + b, 0) / data.teamScores.length 
        : 0;
      const avgOpponentScore = data.opponentScores.length > 0 
        ? data.opponentScores.reduce((a, b) => a + b, 0) / data.opponentScores.length 
        : 0;

      const differential = avgTeamScore - avgOpponentScore;

      if (differential > bestDifferential) {
        bestDifferential = differential;
        strongestQuarter = quarter;
      }

      if (differential < worstDifferential) {
        worstDifferential = differential;
        weakestQuarter = quarter;
      }

      byQuarter[quarter] = {
        avgTeamScore: Math.round(avgTeamScore * 10) / 10,
        avgOpponentScore: Math.round(avgOpponentScore * 10) / 10,
        gamesPlayed: data.teamScores.length
      };
    });

    // Calculate position efficiency
    positions.forEach(position => {
      const perf = positionPerformance[position];
      perf.efficiency = perf.goalsFor - perf.goalsAgainst;
    });

    const analysis: OpponentAnalysis = {
      teamName: opponentTeamName,
      clubName: opponentClubName,
      totalGames: opponentGames.length,
      wins,
      losses,
      draws,
      winRate: opponentGames.length > 0 ? (wins / opponentGames.length) * 100 : 0,
      avgScoreFor: opponentGames.length > 0 ? totalScoreFor / opponentGames.length : 0,
      avgScoreAgainst: opponentGames.length > 0 ? totalScoreAgainst / opponentGames.length : 0,
      scoreDifferential: opponentGames.length > 0 ? (totalScoreFor - totalScoreAgainst) / opponentGames.length : 0,
      recentForm: recentForm.slice(-5),
      lastPlayed: opponentGames.length > 0 ? opponentGames.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date : undefined,
      quarterAnalysis: { byQuarter, strongestQuarter, weakestQuarter },
      positionPerformance,
      gameNotes: gameNotes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    };

    setOpponentAnalysis(analysis);
  }, [selectedGameId, games, centralizedStats, completedGames, currentTeamId, currentClubId]);

  // Generate team insights
  useEffect(() => {
    if (!completedGames.length || !centralizedStats || Object.keys(centralizedStats).length === 0) {
      setTeamInsights(null);
      return;
    }

    // Calculate momentum
    const recentGames = [...completedGames]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-5);

    const recentResults = recentGames.map(game => {
      const gameStats = centralizedStats[game.id] || [];
      const teamScore = gameStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
      const opponentScore = gameStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);
      return getWinLoseLabel(teamScore, opponentScore);
    });

    const winWeight = 3, drawWeight = 1, lossWeight = -2;
    let momentum = 0;
    recentResults.forEach((result, index) => {
      const weight = (index + 1) / recentResults.length;
      if (result === 'Win') momentum += winWeight * weight;
      else if (result === 'Draw') momentum += drawWeight * weight;
      else momentum += lossWeight * weight;
    });

    const trend = momentum > 1 ? 'up' : momentum < -1 ? 'down' : 'stable';

    // Position strengths analysis
    const positionStrengths: Record<string, any> = {};
    const positions = ['GK', 'GD', 'WD', 'C', 'WA', 'GA', 'GS'];

    positions.forEach(position => {
      const positionStats = Object.values(centralizedStats)
        .flat()
        .filter(stat => stat.position === position);

      const efficiency = positionStats.length > 0 
        ? positionStats.reduce((sum, stat) => sum + ((stat.goalsFor || 0) - (stat.goalsAgainst || 0)), 0) / positionStats.length
        : 0;

      const playerCount = new Set(positionStats.map(stat => stat.playerId)).size;

      positionStrengths[position] = {
        efficiency,
        consistency: Math.min(100, (positionStats.length / completedGames.length) * 100),
        playerDepth: playerCount
      };
    });

    // Generate tactical recommendations
    const tacticalRecommendations: string[] = [];

    if (opponentAnalysis) {
      if (opponentAnalysis.winRate >= 70) {
        tacticalRecommendations.push(`Strong record against ${opponentAnalysis.teamName} - maintain winning formula`);
      } else if (opponentAnalysis.winRate <= 30) {
        tacticalRecommendations.push(`Challenging opponent - focus on defensive structures and patient attack`);
      }

      const strongQuarter = opponentAnalysis.quarterAnalysis.byQuarter[opponentAnalysis.quarterAnalysis.strongestQuarter];
      const weakQuarter = opponentAnalysis.quarterAnalysis.byQuarter[opponentAnalysis.quarterAnalysis.weakestQuarter];

      if (strongQuarter && weakQuarter) {
        tacticalRecommendations.push(`Our strongest period: Q${opponentAnalysis.quarterAnalysis.strongestQuarter} (+${(strongQuarter.avgTeamScore - strongQuarter.avgOpponentScore).toFixed(1)})`);
        tacticalRecommendations.push(`Focus area: Q${opponentAnalysis.quarterAnalysis.weakestQuarter} (${(weakQuarter.avgTeamScore - weakQuarter.avgOpponentScore).toFixed(1)})`);
      }
    }

    if (trend === 'up') {
      tacticalRecommendations.push('Team momentum is positive - build on recent success');
    } else if (trend === 'down') {
      tacticalRecommendations.push('Focus on basics and rebuild confidence');
    }

    // Key matchups
    const keyMatchups = positions.map(position => {
      const ourStrength = positionStrengths[position]?.efficiency || 0;
      const opponentPerf = opponentAnalysis?.positionPerformance[position]?.efficiency || 0;

      let advantage: 'us' | 'them' | 'neutral' = 'neutral';
      let reasoning = 'Balanced matchup';

      if (ourStrength > 2 && opponentPerf < -1) {
        advantage = 'us';
        reasoning = 'Strong position for us historically';
      } else if (ourStrength < -2 && opponentPerf > 1) {
        advantage = 'them';
        reasoning = 'Challenging position - needs focus';
      }

      return { position, advantage, reasoning };
    });

    setTeamInsights({
      momentum: { trend, strength: Math.abs(momentum), recentForm: recentResults },
      positionStrengths,
      tacticalRecommendations,
      keyMatchups
    });
  }, [completedGames, centralizedStats, opponentAnalysis]);

  // Generate player recommendations based on selected game
  const playerRecommendations = useMemo((): PlayerRecommendation[] => {
    if (!teamPlayers || !centralizedStats || !selectedGameId) return [];

    const availablePlayers = teamPlayers.filter(p => 
      availabilityData[p.id] === 'available'
    );

    // Get opponent team details
    const selectedGame = games?.find(g => g.id === selectedGameId);
    const opponentTeamId = selectedGame 
      ? (selectedGame.homeTeamId === currentTeamId 
          ? selectedGame.awayTeamId 
          : selectedGame.homeTeamId)
      : null;

    // Find games against this specific opponent
    const opponentGames = completedGames.filter(game => {
      const isHomeGame = game.homeClubId === currentClubId;
      const isAwayGame = game.awayClubId === currentClubId;

      if (isHomeGame && !isAwayGame) {
        return game.awayTeamId === opponentTeamId;
      } else if (isAwayGame && !isHomeGame) {
        return game.homeTeamId === opponentTeamId;
      }
      return false;
    });

    return POSITIONS_ORDER.map(position => {
      const positionPlayers = availablePlayers.filter(p => 
        p.positionPreferences?.includes(position)
      );

      const playersWithStats = positionPlayers.map(player => {
        // Get ALL stats for this player in this position
        const allPositionStats = Object.values(centralizedStats).flat().filter(stat => 
          stat.playerId === player.id && stat.position === position
        );

        // Get stats specifically against this opponent
        const opponentStats = opponentGames.length > 0 
          ? opponentGames.flatMap(game => 
              (centralizedStats[game.id] || []).filter(stat => 
                stat.playerId === player.id && stat.position === position
              )
            )
          : [];

        const totalGamesInPosition = allPositionStats.length;
        const opponentGamesInPosition = opponentStats.length;

        const avgRating = totalGamesInPosition > 0 
          ? allPositionStats.reduce((sum, stat) => sum + (stat.rating || 0), 0) / totalGamesInPosition 
          : 0;

        const opponentAvgRating = opponentGamesInPosition > 0
          ? opponentStats.reduce((sum, stat) => sum + (stat.rating || 0), 0) / opponentGamesInPosition
          : 0;

        // Calculate performance metrics
        const totalGoalsFor = allPositionStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
        const totalGoalsAgainst = allPositionStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);
        const opponentGoalsFor = opponentStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
        const opponentGoalsAgainst = opponentStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);

        // Calculate confidence score
        let confidence = 0.3; // Base confidence

        // Experience bonus
        if (totalGamesInPosition >= 8) confidence += 0.3;
        else if (totalGamesInPosition >= 4) confidence += 0.2;
        else if (totalGamesInPosition >= 2) confidence += 0.1;

        // Position preference bonus
        if (player.positionPreferences?.[0] === position) confidence += 0.2;
        else if (player.positionPreferences?.[1] === position) confidence += 0.1;

        // Performance bonus
        if (avgRating >= 7.5) confidence += 0.25;
        else if (avgRating >= 6.5) confidence += 0.15;
        else if (avgRating >= 5.5) confidence += 0.1;

        // Opponent-specific bonus
        if (opponentGamesInPosition > 0) {
          confidence += 0.1; // Experience against this opponent
          if (opponentAvgRating >= 7) confidence += 0.15;
          else if (opponentAvgRating >= 6) confidence += 0.1;
        }

        // Goal efficiency for attacking positions
        if (['GS', 'GA'].includes(position) && totalGamesInPosition > 0) {
          const goalEfficiency = totalGoalsFor / Math.max(1, totalGamesInPosition);
          if (goalEfficiency >= 8) confidence += 0.1;
          else if (goalEfficiency >= 5) confidence += 0.05;
        }

        // Defensive efficiency for defensive positions
        if (['GK', 'GD'].includes(position) && totalGamesInPosition > 0) {
          const defenseRatio = totalGoalsAgainst / Math.max(1, totalGamesInPosition);
          if (defenseRatio <= 3) confidence += 0.1;
          else if (defenseRatio <= 5) confidence += 0.05;
        }

        confidence = Math.min(confidence, 1);

        // Generate detailed reason
        let reason = '';
        if (opponentGamesInPosition > 0) {
          reason = `${opponentAvgRating.toFixed(1)} avg vs this opponent (${opponentGamesInPosition} games)`;
          if (opponentGoalsFor > 0 || opponentGoalsAgainst > 0) {
            reason += `, ${opponentGoalsFor}F/${opponentGoalsAgainst}A`;
          }
        } else if (totalGamesInPosition > 0) {
          reason = `${avgRating.toFixed(1)} avg rating (${totalGamesInPosition} games)`;
          if (totalGoalsFor > 0 || totalGoalsAgainst > 0) {
            reason += `, ${totalGoalsFor}F/${totalGoalsAgainst}A total`;
          }
        } else if (player.positionPreferences?.[0] === position) {
          reason = 'Primary position';
        } else {
          reason = 'Secondary position';
        }

        // Calculate opponent record if available
        let vsOpponentRecord = undefined;
        if (opponentGamesInPosition > 0 && opponentGames.length > 0) {
          let wins = 0;
          opponentGames.forEach(game => {
            const gameStats = centralizedStats[game.id] || [];
            const teamScore = gameStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
            const opponentScore = gameStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);
            if (teamScore > opponentScore) wins++;
          });

          vsOpponentRecord = {
            played: opponentGames.length,
            won: wins
          };
        }

        return {
          player,
          confidence,
          reason,
          avgRating: avgRating > 0 ? avgRating : undefined,
          gamesInPosition: totalGamesInPosition > 0 ? totalGamesInPosition : undefined,
          vsOpponentRecord
        };
      });

      playersWithStats.sort((a, b) => b.confidence - a.confidence);

      return {
        position,
        players: playersWithStats
      };
    });
  }, [teamPlayers, centralizedStats, selectedGameId, availabilityData, games, currentTeamId, completedGames, currentClubId]);

  // Save preparation state to localStorage
  useEffect(() => {
    if (selectedGameId) {
      const state = {
        gameId: selectedGameId,
        availability: availabilityData,
        lineup: selectedLineup,
        timestamp: Date.now()
      };
      localStorage.setItem(`preparation-${currentTeamId}`, JSON.stringify(state));
    }
  }, [selectedGameId, availabilityData, selectedLineup, currentTeamId]);

  // Restore preparation state from localStorage
  useEffect(() => {
    if (currentTeamId) {
      const saved = localStorage.getItem(`preparation-${currentTeamId}`);
      if (saved) {
        try {
          const state = JSON.parse(saved);
          if (Date.now() - state.timestamp < 24 * 60 * 60 * 1000) {
            if (state.gameId && upcomingGames.some(g => g.id === state.gameId)) {
              setSelectedGameId(state.gameId);
            }
            if (state.availability) {
              setAvailabilityData(state.availability);
            }
            if (state.lineup) {
              setSelectedLineup(state.lineup);
            }
          }
        } catch (error) {
          console.error('Error restoring preparation state:', error);
        }
      }
    }
  }, [currentTeamId, upcomingGames]);

  const handleApplyToRoster = () => {
    if (!selectedGameId) return;

    const state = {
      gameId: selectedGameId,
      availability: availabilityData,
      lineup: selectedLineup,
      fromPreparation: true,
      timestamp: Date.now()
    };
    sessionStorage.setItem('roster-prep-state', JSON.stringify(state));

    navigate(`/roster/${selectedGameId}`);
  };

  // Loading states
  if (gamesLoading || playersLoading || isLoadingTeamPlayers) {
    return (
      <PageTemplate title="Game Preparation" icon={Target}>
        <LoadingState message="Loading preparation data..." />
      </PageTemplate>
    );
  }

  // Error states
  if (gamesError || playersError) {
    return (
      <PageTemplate title="Game Preparation" icon={Target}>
        <ErrorDisplay 
          error={gamesError || playersError} 
          retry={() => queryClient.invalidateQueries()}
        />
      </PageTemplate>
    );
  }

  const selectedGame = selectedGameId ? games?.find(g => g.id === selectedGameId) : null;
  const opponentName = selectedGame 
    ? (selectedGame.homeTeamId === currentTeamId 
        ? selectedGame.awayTeamName 
        : selectedGame.homeTeamName)
    : null;

    const handleApplyLineup = (lineup: Record<string, Player | null>) => {
    setSelectedLineup(lineup);
    toast({
      title: "Lineup Applied",
      description: "Starting lineup has been set for this game.",
    });
  };

  const handleSaveRoster = async () => {
    if (!selectedLineup || !selectedGameId) {
      toast({
        variant: "destructive",
        title: "Cannot Save Roster",
        description: "Please select a lineup first.",
      });
      return;
    }

    try {
      // Convert lineup to roster format (quarter 1)
      const rosterEntries = Object.entries(selectedLineup)
        .filter(([_, player]) => player !== null)
        .map(([position, player]) => ({
          position,
          playerId: player!.id,
          quarter: 1
        }));

      // Save roster to backend
      await apiClient.post(`/api/games/${selectedGameId}/rosters`, {
        rosters: rosterEntries
      });

      toast({
        title: "Roster Saved",
        description: "Starting lineup has been saved for Quarter 1.",
      });
    } catch (error) {
      console.error("Failed to save roster:", error);
      toast({
        variant: "destructive",
        title: "Error Saving Roster",
        description: "Failed to save the roster. Please try again.",
      });
    }
  };

  return (
    <PageTemplate 
      title="Game Preparation" 
      icon={Target}
      description="Comprehensive game preparation with tactical analysis and strategic insights"
    >
      <div className="space-y-6">
        {/* Game Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Select Upcoming Game
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingGames.length === 0 ? (
              <Alert>
                <Calendar className="h-4 w-4" />
                <AlertDescription>
                  No upcoming games found for this team.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <Select 
                  value={selectedGameId?.toString() || ""} 
                  onValueChange={(value) => {
                    setSelectedGameId(parseInt(value));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an upcoming game..." />
                  </SelectTrigger>
                  <SelectContent>
                    {upcomingGames.map(game => {
                      const opponent = game.homeTeamId === currentTeamId 
                        ? game.awayTeamName 
                        : game.homeTeamName;
                      const venue = game.venue || (game.homeTeamId === currentTeamId ? 'Home' : 'Away');

                      return (
                        <SelectItem key={game.id} value={game.id.toString()}>
                          <div className="flex items-center space-x-2">
                            <span>vs {opponent}</span>
                            <Badge variant="outline">{venue}</Badge>
                            <span className="text-gray-500">
                              {new Date(game.date).toLocaleDateString()} {game.time}
                            </span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                {selectedGame && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Game Details</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Opponent</span>
                        <p className="font-semibold">{opponentName}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Date & Time</span>
                        <p className="font-semibold">
                          {new Date(selectedGame.date).toLocaleDateString()} {selectedGame.time}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Venue</span>
                        <p className="font-semibold">
                          {selectedGame.venue || (selectedGame.homeTeamId === currentTeamId ? 'Home' : 'Away')}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Round</span>
                        <p className="font-semibold">Round {selectedGame.round}</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        {selectedGame && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Game Overview & Analysis</TabsTrigger>
              <TabsTrigger value="lineup">Starting Lineup</TabsTrigger>
              <TabsTrigger value="roster">Apply to Roster</TabsTrigger>
            </TabsList>

            {/* Game Analysis Overview */}
            <TabsContent value="overview" className="space-y-6">
              {statsLoading || rostersLoading ? (
                <LoadingState message="Analyzing game data and opponent history..." />
              ) : (
                <>
                  {/* Team Performance Summary */}
                  {teamInsights && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Team Momentum */}
                      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            {teamInsights.momentum.trend === 'up' ? (
                              <TrendingUp className="h-5 w-5 text-green-600" />
                            ) : teamInsights.momentum.trend === 'down' ? (
                              <TrendingDown className="h-5 w-5 text-red-600" />
                            ) : (
                              <Activity className="h-5 w-5 text-yellow-600" />
                            )}
                            Team Momentum
                            <Badge variant={
                              teamInsights.momentum.trend === 'up' ? 'default' : 
                              teamInsights.momentum.trend === 'down' ? 'destructive' : 'secondary'
                            }>
                              {teamInsights.momentum.trend.toUpperCase()}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="flex gap-1">
                              {teamInsights.momentum.recentForm.map((result, index) => (
                                <ResultBadge key={index} result={result as any} size="sm" />
                              ))}
                            </div>
                            <div className="text-right">
                              <div className="text-3xl font-bold text-purple-700">
                                {teamInsights.momentum.strength.toFixed(1)}
                              </div>
                              <div className="text-sm text-gray-600">Momentum Score</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Position Strengths */}
                      <Card className="bg-gradient-to-r from-green-50 to-teal-50">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-green-600" />
                            Position Strengths
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {Object.entries(teamInsights.positionStrengths)
                              .sort(([,a], [,b]) => b.efficiency - a.efficiency)
                              .slice(0, 4)
                              .map(([position, stats]) => (
                                <div key={position} className="flex items-center justify-between">
                                  <span className="font-medium">{position}</span>
                                  <div className="flex items-center gap-2">
                                    <div className="text-sm text-gray-600">
                                      +{stats.efficiency.toFixed(1)}
                                    </div>
                                    <Progress 
                                      value={Math.min(100, (stats.efficiency + 10) * 5)} 
                                      className="w-16 h-2" 
                                    />
                                  </div>
                                </div>
                              ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Player Availability Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Player Availability - vs {opponentName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <PlayerAvailabilitySelector
                        players={teamPlayers}
                        availabilityData={availabilityData}
                        onAvailabilityChange={setAvailabilityData}
                        showQuickActions={true}
                        gameId={selectedGameId || undefined}
                      />

                      <div className="mt-4 pt-4 border-t">
                        <Button 
                          onClick={() => setActiveTab('lineup')}
                          className="w-full"
                          disabled={Object.values(availabilityData).filter(status => status === 'available').length < 7}
                        >
                          <Target className="h-4 w-4 mr-2" />
                          View Recommended Lineups
                          <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded">
                            {Object.values(availabilityData).filter(status => status === 'available').length} available
                          </span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Opponent Analysis */}
                  {opponentAnalysis ? (
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Crosshair className="h-5 w-5 text-red-600" />
                            Head-to-Head vs {opponentAnalysis.teamName}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Overall Record */}
                            <div className="space-y-4">
                              <h4 className="font-semibold">Overall Record</h4>
                              <div className="flex justify-between items-center">
                                <span>Record:</span>
                                <span className="font-bold">
                                  {opponentAnalysis.wins}W - {opponentAnalysis.losses}L
                                  {opponentAnalysis.draws > 0 && ` - ${opponentAnalysis.draws}D`}
                                </span>
                              </div>

                              <div>
                                <div className="flex justify-between mb-2">
                                  <span>Win Rate</span>
                                  <span>{opponentAnalysis.winRate.toFixed(1)}%</span>
                                </div>
                                <Progress value={opponentAnalysis.winRate} className="h-2" />
                              </div>

                              <div className="flex items-center gap-2">
                                <span>Recent Form:</span>
                                <div className="flex gap-1">
                                  {opponentAnalysis.recentForm.map((result, index) => (
                                    <ResultBadge 
                                      key={index}
                                      result={result === 'W' ? 'Win' : result === 'L' ? 'Loss' : 'Draw'}
                                      size="sm"
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Quarter Analysis */}
                            <div className="space-y-4">
                              <h4 className="font-semibold">Quarter Performance</h4>
                              <div className="space-y-2">
                                {[1, 2, 3, 4].map(quarter => {
                                  const qData = opponentAnalysis.quarterAnalysis.byQuarter[quarter];
                                  const diff = qData.avgTeamScore - qData.avgOpponentScore;
                                  const isStrongest = quarter === opponentAnalysis.quarterAnalysis.strongestQuarter;
                                  const isWeakest = quarter === opponentAnalysis.quarterAnalysis.weakestQuarter;

                                  return (
                                    <div key={quarter} className={`flex items-center justify-between p-2 rounded ${
                                      isStrongest ? 'bg-green-100' : isWeakest ? 'bg-red-100' : 'bg-gray-50'
                                    }`}>
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">Q{quarter}</span>
                                        {isStrongest && <Badge variant="secondary" className="text-xs bg-green-200 text-green-800">Strongest</Badge>}
                                        {isWeakest && <Badge variant="secondary" className="text-xs bg-red-200 text-red-800">Weakest</Badge>}
                                      </div>
                                      <div className="text-right">
                                        <div className="text-sm">{qData.avgTeamScore} - {qData.avgOpponentScore}</div>
                                        <div className={`text-xs ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                          {diff >= 0 ? '+' : ''}{diff.toFixed(1)}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Performance Stats */}
                            <div className="space-y-4">
                              <h4 className="font-semibold">Performance Stats</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span>Our Average Score:</span>
                                  <span className="font-bold">{opponentAnalysis.avgScoreFor.toFixed(1)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Their Average Score:</span>
                                  <span className="font-bold">{opponentAnalysis.avgScoreAgainst.toFixed(1)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Average Margin:</span>
                                  <span className={`font-bold ${opponentAnalysis.scoreDifferential >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {opponentAnalysis.scoreDifferential >= 0 ? '+' : ''}{opponentAnalysis.scoreDifferential.toFixed(1)}
                                  </span>
                                </div>
                                {opponentAnalysis.lastPlayed && (
                                  <div className="flex justify-between">
                                    <span>Last Played:</span>
                                    <span className="font-bold">{formatShortDate(opponentAnalysis.lastPlayed)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Tactical Recommendations */}
                      {teamInsights && (
                        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Brain className="h-5 w-5 text-orange-600" />
                              Tactical Recommendations
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-semibold mb-3 text-orange-700">Key Strategic Points</h4>
                                <ul className="space-y-2">
                                  {teamInsights.tacticalRecommendations.map((rec, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm">
                                      <Lightbulb className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                      <span>{rec}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-3 text-orange-700">Key Matchups</h4>
                                <div className="space-y-2">
                                  {teamInsights.keyMatchups
                                    .filter(matchup => matchup.advantage !== 'neutral')
                                    .slice(0, 4)
                                    .map((matchup, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 rounded bg-white border">
                                      <span className="font-medium">{matchup.position}</span>
                                      <div className="flex items-center gap-2">
                                        <Badge variant={matchup.advantage === 'us' ? 'default' : 'destructive'}>
                                          {matchup.advantage === 'us' ? 'Advantage' : 'Challenge'}
                                        </Badge>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Previous Game Notes */}
                      {opponentAnalysis.gameNotes.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <History className="h-5 w-5 text-blue-600" />
                              Previous Game Notes vs {opponentAnalysis.teamName}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {opponentAnalysis.gameNotes.slice(0, 3).map((note, index) => (
                                <div key={index} className="border-l-4 border-blue-400 pl-4 py-2 bg-blue-50 rounded-r">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-blue-800">{formatShortDate(note.date)}</span>
                                    <ResultBadge result={note.result as any} size="sm" />
                                  </div>
                                  <p className="text-sm text-blue-700">{note.notes}</p>
                                </div>
                              ))}

                              {opponentAnalysis.gameNotes.length > 3 && (
                                <div className="text-center">
                                  <Button variant="outline" size="sm">
                                    View All Notes ({opponentAnalysis.gameNotes.length})
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="text-center py-8">
                        <Telescope className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Previous Matchups</h3>
                        <p className="text-gray-600">
                          This will be your first game against {opponentName}. Focus on your team's strengths and maintain your game plan.
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex justify-end">
                    <Button onClick={() => setActiveTab('lineup')}>
                      Set Starting Lineup
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Starting Lineup */}
            <TabsContent value="lineup" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Position Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Lightbulb className="h-5 w-5" />
                      <span>Position Recommendations vs {opponentName}</span>
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Based on historical performance and opponent-specific analysis
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {playerRecommendations.map(rec => {
                        const selectedPlayer = selectedLineup[rec.position];
                        // Filter out players already assigned to other positions
                        const alreadyAssignedPlayers = new Set(
                          Object.entries(selectedLineup)
                            .filter(([pos, player]) => pos !== rec.position && player !== null)
                            .map(([_, player]) => player!.id)
                        );

                        return (
                          <div key={rec.position} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold">{rec.position}</h4>
                              {selectedPlayer && (
                                <Badge variant="default">
                                  {selectedPlayer.displayName}
                                </Badge>
                              )}
                            </div>

                            {rec.players.length === 0 ? (
                              <p className="text-gray-500 text-sm">No available players for this position</p>
                            ) : (
                              <div className="space-y-3">
                                {rec.players
                                  .filter(playerRec => 
                                    !alreadyAssignedPlayers.has(playerRec.player.id) || 
                                    selectedPlayer?.id === playerRec.player.id
                                  )
                                  .slice(0, 4)
                                  .map((playerRec, index) => (
                                  <div 
                                    key={playerRec.player.id} 
                                    className={`p-3 rounded cursor-pointer transition-all ${
                                      selectedPlayer?.id === playerRec.player.id 
                                        ? 'bg-blue-100 border-2 border-blue-300 shadow-sm' 
                                        : alreadyAssignedPlayers.has(playerRec.player.id)
                                        ? 'bg-gray-100 border border-gray-200 opacity-50 cursor-not-allowed'
                                        : 'hover:bg-gray-50 border border-gray-200'
                                    }`}
                                    onClick={() => {
                                      if (!alreadyAssignedPlayers.has(playerRec.player.id)) {
                                        setSelectedLineup(prev => ({
                                          ...prev,
                                          [rec.position]: playerRec.player
                                        }));
                                      }
                                    }}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex items-center space-x-3 flex-1">
                                        <div className="flex flex-col items-center gap-1">
                                          <Badge 
                                            variant={index === 0 ? "default" : index === 1 ? "secondary" : "outline"} 
                                            className="text-xs"
                                          >
                                            #{index + 1}
                                          </Badge>
                                          <div className="text-xs text-center text-gray-500">
                                            {Math.round(playerRec.confidence * 100)}%
                                          </div>
                                        </div>
                                        <PlayerAvatar player={playerRec.player} size="sm" />
                                        <div className="flex-1">
                                          <p className="font-medium text-sm">{playerRec.player.displayName}</p>
                                          <p className="text-xs text-gray-600 mb-1">{playerRec.reason}</p>

                                          {/* Additional stats */}
                                          <div className="flex gap-3 text-xs text-gray-500">
                                            {playerRec.gamesInPosition && (
                                              <span>{playerRec.gamesInPosition} games</span>
                                            )}
                                            {playerRec.vsOpponentRecord && (
                                              <span className="text-blue-600">
                                                vs {opponentName}: {playerRec.vsOpponentRecord.won}/{playerRec.vsOpponentRecord.played}W
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex flex-col items-end gap-1">
                                        {playerRec.avgRating && (
                                          <div className="flex items-center gap-1">
                                            <Star className="h-3 w-3 text-yellow-500" />
                                            <span className="text-xs font-medium">
                                              {playerRec.avgRating.toFixed(1)}
                                            </span>
                                          </div>
                                        )}

                                        {index === 0 && !alreadyAssignedPlayers.has(playerRec.player.id) && (
                                          <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                                            Recommended
                                          </Badge>
                                        )}

                                        {alreadyAssignedPlayers.has(playerRec.player.id) && selectedPlayer?.id !== playerRec.player.id && (
                                          <Badge variant="outline" className="text-xs bg-gray-100 text-gray-500">
                                            Already Assigned
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}

                                {rec.players.filter(playerRec => !alreadyAssignedPlayers.has(playerRec.player.id)).length > 4 && (
                                  <div className="text-center pt-2">
                                    <Button variant="ghost" size="sm" className="text-xs">
                                      View {rec.players.filter(playerRec => !alreadyAssignedPlayers.has(playerRec.player.id)).length - 4} more options
                                    </Button>
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

                {/* Recommended Lineups */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Star className="h-5 w-5" />
                      <span>Recommended Starting Lineups vs {opponentName}</span>
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Based on historical performance, player statistics, and opponent-specific analysis
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Generate recommended lineups */}
                      {(() => {
                        // Get available players
                        const availablePlayers = teamPlayers.filter(p => 
                          availabilityData[p.id] === 'available'
                        );

                        if (availablePlayers.length < 7) {
                          return (
                            <div className="text-center py-8 text-gray-500">
                              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p>Need at least 7 available players to generate lineup recommendations</p>
                              <p className="text-sm">Currently have {availablePlayers.length} available players</p>
                            </div>
                          );
                        }

                        // Generate lineup recommendations based on position preferences and stats
                        const generateLineupRecommendations = () => {
                          const recommendations = [];

                          // Strategy 1: Optimal Position Preferences
                          const optimalLineup = {};
                          const usedPlayers = new Set();

                          POSITIONS_ORDER.forEach(position => {
                            const positionCandidates = availablePlayers
                              .filter(p => !usedPlayers.has(p.id))
                              .filter(p => p.positionPreferences?.includes(position))
                              .sort((a, b) => {
                                const aIndex = a.positionPreferences?.indexOf(position) ?? 99;
                                const bIndex = b.positionPreferences?.indexOf(position) ?? 99;
                                return aIndex - bIndex;
                              });

                            if (positionCandidates.length > 0) {
                              optimalLineup[position] = positionCandidates[0];
                              usedPlayers.add(positionCandidates[0].id);
                            }
                          });

                          // Fill remaining positions with available players
                          POSITIONS_ORDER.forEach(position => {
                            if (!optimalLineup[position]) {
                              const remaining = availablePlayers.find(p => !usedPlayers.has(p.id));
                              if (remaining) {
                                optimalLineup[position] = remaining;
                                usedPlayers.add(remaining.id);
                              }
                            }
                          });

                          if (Object.keys(optimalLineup).length === 7) {
                            recommendations.push({
                              name: "Optimal Position Match",
                              confidence: 92,
                              reason: "Players in their preferred positions",
                              lineup: optimalLineup,
                              color: "bg-green-100 border-green-300"
                            });
                          }

                          // Strategy 2: Experience-Based (players with most games)
                          const experiencedLineup = {};
                          const experiencedUsed = new Set();

                          POSITIONS_ORDER.forEach(position => {
                            const candidates = availablePlayers
                              .filter(p => !experiencedUsed.has(p.id))
                              .filter(p => p.positionPreferences?.includes(position))
                              .sort((a, b) => {
                                // Prioritize by position preference and experience
                                const aStats = Object.values(centralizedStats).flat().filter(s => s.playerId === a.id && s.position === position);
                                const bStats = Object.values(centralizedStats).flat().filter(s => s.playerId === b.id && s.position === position);
                                return bStats.length - aStats.length;
                              });

                            if (candidates.length > 0) {
                              experiencedLineup[position] = candidates[0];
                              experiencedUsed.add(candidates[0].id);
                            }
                          });

                          // Fill remaining
                          POSITIONS_ORDER.forEach(position => {
                            if (!experiencedLineup[position]) {
                              const remaining = availablePlayers.find(p => !experiencedUsed.has(p.id));
                              if (remaining) {
                                experiencedLineup[position] = remaining;
                                experiencedUsed.add(remaining.id);
                              }
                            }
                          });

                          if (Object.keys(experiencedLineup).length === 7) {
                            recommendations.push({
                              name: "Experience-Based",
                              confidence: 87,
                              reason: "Players with most games in positions",
                              lineup: experiencedLineup,
                              color: "bg-blue-100 border-blue-300"
                            });
                          }

                          // Strategy 3: Opponent-Specific (if we have opponent data)
                          if (opponentAnalysis && opponentAnalysis.totalGames > 0) {
                            const opponentLineup = {};
                            const opponentUsed = new Set();

                            POSITIONS_ORDER.forEach(position => {
                              const candidates = availablePlayers
                                .filter(p => !opponentUsed.has(p.id))
                                .filter(p => p.positionPreferences?.includes(position))
                                .sort((a, b) => {
                                  // Find stats against this specific opponent
                                  const aOpponentStats = completedGames
                                    .filter(game => {
                                      const isAgainstOpponent = 
                                        (game.homeTeamId === currentTeamId && game.awayTeamName === opponentAnalysis.teamName) ||
                                        (game.awayTeamId === currentTeamId && game.homeTeamName === opponentAnalysis.teamName);
                                      return isAgainstOpponent;
                                    })
                                    .flatMap(game => (centralizedStats[game.id] || []).filter(s => s.playerId === a.id && s.position === position));

                                  const bOpponentStats = completedGames
                                    .filter(game => {
                                      const isAgainstOpponent = 
                                        (game.homeTeamId === currentTeamId && game.awayTeamName === opponentAnalysis.teamName) ||
                                        (game.awayTeamId === currentTeamId && game.homeTeamName === opponentAnalysis.teamName);
                                      return isAgainstOpponent;
                                    })
                                    .flatMap(game => (centralizedStats[game.id] || []).filter(s => s.playerId === b.id && s.position === position));

                                  const aAvgRating = aOpponentStats.length > 0 ? 
                                    aOpponentStats.reduce((sum, s) => sum + (s.rating || 0), 0) / aOpponentStats.length : 0;
                                  const bAvgRating = bOpponentStats.length > 0 ? 
                                    bOpponentStats.reduce((sum, s) => sum + (s.rating || 0), 0) / bOpponentStats.length : 0;

                                  return bAvgRating - aAvgRating;
                                });

                              if (candidates.length > 0) {
                                opponentLineup[position] = candidates[0];
                                opponentUsed.add(candidates[0].id);
                              }
                            });

                            // Fill remaining
                            POSITIONS_ORDER.forEach(position => {
                              if (!opponentLineup[position]) {
                                const remaining = availablePlayers.find(p => !opponentUsed.has(p.id));
                                if (remaining) {
                                  opponentLineup[position] = remaining;
                                  opponentUsed.add(remaining.id);
                                }
                              }
                            });

                            if (Object.keys(opponentLineup).length === 7) {
                              recommendations.push({
                                name: `Anti-${opponentAnalysis.teamName}`,
                                confidence: 89,
                                reason: `Best performers vs ${opponentAnalysis.teamName}`,
                                lineup: opponentLineup,
                                color: "bg-purple-100 border-purple-300"
                              });
                            }
                          }

                          // Strategy 4: Balanced Team
                          const balancedLineup = {};
                          const balancedUsed = new Set();

                          // Try to balance attack/defense
                          const attackPositions = ['GS', 'GA', 'WA'];
                          const defensePositions = ['GK', 'GD', 'WD'];
                          const centerPosition = ['C'];

                          [...attackPositions, ...defensePositions, ...centerPosition].forEach(position => {
                            const candidates = availablePlayers
                              .filter(p => !balancedUsed.has(p.id))
                              .filter(p => p.positionPreferences?.includes(position))
                              .sort((a, b) => {
                                // Calculate overall rating across all positions
                                const aAllStats = Object.values(centralizedStats).flat().filter(s => s.playerId === a.id);
                                const bAllStats = Object.values(centralizedStats).flat().filter(s => s.playerId === b.id);

                                const aAvgRating = aAllStats.length > 0 ? 
                                  aAllStats.reduce((sum, s) => sum + (s.rating || 0), 0) / aAllStats.length : 0;
                                const bAvgRating = bAllStats.length > 0 ? 
                                  bAllStats.reduce((sum, s) => sum + (s.rating || 0), 0) / bAllStats.length : 0;

                                return bAvgRating - aAvgRating;
                              });

                            if (candidates.length > 0) {
                              balancedLineup[position] = candidates[0];
                              balancedUsed.add(candidates[0].id);
                            }
                          });

                          // Fill remaining
                          POSITIONS_ORDER.forEach(position => {
                            if (!balancedLineup[position]) {
                              const remaining = availablePlayers.find(p => !balancedUsed.has(p.id));
                              if (remaining) {
                                balancedLineup[position] = remaining;
                                balancedUsed.add(remaining.id);
                              }
                            }
                          });

                          if (Object.keys(balancedLineup).length === 7) {
                            recommendations.push({
                              name: "Balanced Performance",
                              confidence: 85,
                              reason: "Best overall player ratings",
                              lineup: balancedLineup,
                              color: "bg-orange-100 border-orange-300"
                            });
                          }

                          return recommendations.slice(0, 4); // Top 4 recommendations
                        };

                        const lineupRecommendations = generateLineupRecommendations();

                        if (lineupRecommendations.length === 0) {
                          return (
                            <div className="text-center py-8 text-gray-500">
                              <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p>Unable to generate lineup recommendations</p>
                              <p className="text-sm">Try adjusting player availability</p>
                            </div>
                          );
                        }

                        return (
                          <>
                            {lineupRecommendations.map((rec, index) => (
                              <Card key={index} className={`border-2 cursor-pointer transition-all hover:shadow-md ${rec.color}`}>
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                      <Badge variant="outline" className="text-sm">
                                        #{index + 1}
                                      </Badge>
                                      <div>
                                        <h4 className="font-semibold text-lg">{rec.name}</h4>
                                        <p className="text-sm text-gray-600">{rec.reason}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-2xl font-bold text-green-600">
                                        {rec.confidence}%
                                      </div>
                                      <div className="text-xs text-gray-500">Confidence</div>
                                    </div>
                                  </div>

                                  {/* Lineup Display */}
                                  <div className="grid grid-cols-7 gap-2 mt-4">
                                    {POSITIONS_ORDER.map(position => {
                                      const player = rec.lineup[position];
                                      return (
                                        <div key={position} className="text-center">
                                          <div className="text-xs font-medium text-gray-600 mb-1">
                                            {position}
                                          </div>
                                          {player ? (
                                            <div className="flex flex-col items-center">
                                              <PlayerAvatar player={player} size="sm" />
                                              <div className="text-xs mt-1 font-medium">
                                                {player.displayName}
                                              </div>
                                              {player.positionPreferences?.[0] === position && (
                                                <Star className="h-3 w-3 text-yellow-500 mt-1" />
                                              )}
                                            </div>
                                          ) : (
                                            <div className="w-6 h-6 bg-gray-200 rounded-full mx-auto">
                                              <span className="text-xs text-gray-400">?</span>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>

                                  {/* Select This Lineup Button */}
                                  <div className="mt-4 pt-3 border-t">
                                    <Button 
                                      onClick={() => {
                                        setSelectedLineup(rec.lineup);
                                        toast({
                                          title: "Lineup Selected",
                                          description: `${rec.name} lineup has been selected`,
                                        });
                                      }}
                                      variant="outline"
                                      className="w-full"
                                    >
                                        <Check className="h-4 w-4 mr-2" />
                                      Select This Lineup
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}

                            {/* Additional Combination Options */}
                            <div className="mt-8 space-y-4">
                              <div className="text-center">
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">More Lineup Options</h3>
                                <p className="text-sm text-gray-500">Additional tactical combinations to consider</p>
                              </div>

                              {(() => {
                                // Generate additional combination strategies
                                const additionalCombinations = [];

                                // Strategy 5: Youth Development
                                if (availablePlayers.length >= 7) {
                                  const youthLineup = {};
                                  const youthUsed = new Set();
                                  
                                  // Prioritize younger/less experienced players
                                  const playersByExperience = availablePlayers.sort((a, b) => {
                                    const aStats = Object.values(centralizedStats).flat().filter(s => s.playerId === a.id);
                                    const bStats = Object.values(centralizedStats).flat().filter(s => s.playerId === b.id);
                                    return aStats.length - bStats.length; // Less experienced first
                                  });

                                  POSITIONS_ORDER.forEach(position => {
                                    const candidates = playersByExperience
                                      .filter(p => !youthUsed.has(p.id))
                                      .filter(p => p.positionPreferences?.includes(position));

                                    if (candidates.length > 0) {
                                      youthLineup[position] = candidates[0];
                                      youthUsed.add(candidates[0].id);
                                    }
                                  });

                                  // Fill remaining positions
                                  POSITIONS_ORDER.forEach(position => {
                                    if (!youthLineup[position]) {
                                      const remaining = playersByExperience.find(p => !youthUsed.has(p.id));
                                      if (remaining) {
                                        youthLineup[position] = remaining;
                                        youthUsed.add(remaining.id);
                                      }
                                    }
                                  });

                                  if (Object.keys(youthLineup).length === 7) {
                                    additionalCombinations.push({
                                      name: "Development Focus",
                                      confidence: 70,
                                      reason: "Give opportunities to developing players",
                                      lineup: youthLineup,
                                      color: "bg-indigo-100 border-indigo-300"
                                    });
                                  }
                                }

                                // Strategy 6: High Scoring Attack
                                if (availablePlayers.length >= 7) {
                                  const attackLineup = {};
                                  const attackUsed = new Set();

                                  // Focus on goal scoring for attack positions
                                  const attackPositions = ['GS', 'GA', 'WA'];
                                  const defensePositions = ['GK', 'GD', 'WD'];
                                  const centerPosition = ['C'];

                                  attackPositions.forEach(position => {
                                    const candidates = availablePlayers
                                      .filter(p => !attackUsed.has(p.id))
                                      .filter(p => p.positionPreferences?.includes(position))
                                      .sort((a, b) => {
                                        const aGoals = Object.values(centralizedStats).flat()
                                          .filter(s => s.playerId === a.id && ['GS', 'GA'].includes(s.position || ''))
                                          .reduce((sum, s) => sum + (s.goalsFor || 0), 0);
                                        const bGoals = Object.values(centralizedStats).flat()
                                          .filter(s => s.playerId === b.id && ['GS', 'GA'].includes(s.position || ''))
                                          .reduce((sum, s) => sum + (s.goalsFor || 0), 0);
                                        return bGoals - aGoals;
                                      });

                                    if (candidates.length > 0) {
                                      attackLineup[position] = candidates[0];
                                      attackUsed.add(candidates[0].id);
                                    }
                                  });

                                  // Fill other positions
                                  [...defensePositions, ...centerPosition].forEach(position => {
                                    const candidates = availablePlayers
                                      .filter(p => !attackUsed.has(p.id))
                                      .filter(p => p.positionPreferences?.includes(position));

                                    if (candidates.length > 0) {
                                      attackLineup[position] = candidates[0];
                                      attackUsed.add(candidates[0].id);
                                    }
                                  });

                                  // Fill remaining
                                  POSITIONS_ORDER.forEach(position => {
                                    if (!attackLineup[position]) {
                                      const remaining = availablePlayers.find(p => !attackUsed.has(p.id));
                                      if (remaining) {
                                        attackLineup[position] = remaining;
                                        attackUsed.add(remaining.id);
                                      }
                                    }
                                  });

                                  if (Object.keys(attackLineup).length === 7) {
                                    additionalCombinations.push({
                                      name: "High-Scoring Attack",
                                      confidence: 78,
                                      reason: "Maximize goal-scoring potential",
                                      lineup: attackLineup,
                                      color: "bg-red-100 border-red-300"
                                    });
                                  }
                                }

                                // Strategy 7: Defensive Wall
                                if (availablePlayers.length >= 7) {
                                  const defenseLineup = {};
                                  const defenseUsed = new Set();

                                  const defensePositions = ['GK', 'GD', 'WD'];
                                  const attackPositions = ['GS', 'GA', 'WA'];
                                  const centerPosition = ['C'];

                                  // Focus on defensive strength
                                  defensePositions.forEach(position => {
                                    const candidates = availablePlayers
                                      .filter(p => !defenseUsed.has(p.id))
                                      .filter(p => p.positionPreferences?.includes(position))
                                      .sort((a, b) => {
                                        const aIntercepts = Object.values(centralizedStats).flat()
                                          .filter(s => s.playerId === a.id && ['GK', 'GD', 'WD'].includes(s.position || ''))
                                          .reduce((sum, s) => sum + (s.intercepts || 0), 0);
                                        const bIntercepts = Object.values(centralizedStats).flat()
                                          .filter(s => s.playerId === b.id && ['GK', 'GD', 'WD'].includes(s.position || ''))
                                          .reduce((sum, s) => sum + (s.intercepts || 0), 0);
                                        return bIntercepts - aIntercepts;
                                      });

                                    if (candidates.length > 0) {
                                      defenseLineup[position] = candidates[0];
                                      defenseUsed.add(candidates[0].id);
                                    }
                                  });

                                  // Fill other positions
                                  [...attackPositions, ...centerPosition].forEach(position => {
                                    const candidates = availablePlayers
                                      .filter(p => !defenseUsed.has(p.id))
                                      .filter(p => p.positionPreferences?.includes(position));

                                    if (candidates.length > 0) {
                                      defenseLineup[position] = candidates[0];
                                      defenseUsed.add(candidates[0].id);
                                    }
                                  });

                                  // Fill remaining
                                  POSITIONS_ORDER.forEach(position => {
                                    if (!defenseLineup[position]) {
                                      const remaining = availablePlayers.find(p => !defenseUsed.has(p.id));
                                      if (remaining) {
                                        defenseLineup[position] = remaining;
                                        defenseUsed.add(remaining.id);
                                      }
                                    }
                                  });

                                  if (Object.keys(defenseLineup).length === 7) {
                                    additionalCombinations.push({
                                      name: "Defensive Wall",
                                      confidence: 82,
                                      reason: "Strengthen defensive capabilities",
                                      lineup: defenseLineup,
                                      color: "bg-cyan-100 border-cyan-300"
                                    });
                                  }
                                }

                                // Strategy 8: Versatility Mix
                                if (availablePlayers.length >= 7) {
                                  const versatileLineup = {};
                                  const versatileUsed = new Set();

                                  // Prioritize players who can play multiple positions
                                  const playersByVersatility = availablePlayers.sort((a, b) => {
                                    const aPositions = a.positionPreferences?.length || 0;
                                    const bPositions = b.positionPreferences?.length || 0;
                                    return bPositions - aPositions;
                                  });

                                  POSITIONS_ORDER.forEach(position => {
                                    const candidates = playersByVersatility
                                      .filter(p => !versatileUsed.has(p.id))
                                      .filter(p => p.positionPreferences?.includes(position));

                                    if (candidates.length > 0) {
                                      versatileLineup[position] = candidates[0];
                                      versatileUsed.add(candidates[0].id);
                                    }
                                  });

                                  // Fill remaining
                                  POSITIONS_ORDER.forEach(position => {
                                    if (!versatileLineup[position]) {
                                      const remaining = playersByVersatility.find(p => !versatileUsed.has(p.id));
                                      if (remaining) {
                                        versatileLineup[position] = remaining;
                                        versatileUsed.add(remaining.id);
                                      }
                                    }
                                  });

                                  if (Object.keys(versatileLineup).length === 7) {
                                    additionalCombinations.push({
                                      name: "Versatile Squad",
                                      confidence: 75,
                                      reason: "Players comfortable in multiple positions",
                                      lineup: versatileLineup,
                                      color: "bg-teal-100 border-teal-300"
                                    });
                                  }
                                }

                                return additionalCombinations.map((combo, index) => (
                                  <Card key={`additional-${index}`} className={`border-2 cursor-pointer transition-all hover:shadow-md ${combo.color}`}>
                                    <CardContent className="p-4">
                                      <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                          <Badge variant="outline" className="text-sm">
                                            Alt #{index + 1}
                                          </Badge>
                                          <div>
                                            <h4 className="font-semibold text-lg">{combo.name}</h4>
                                            <p className="text-sm text-gray-600">{combo.reason}</p>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <div className="text-2xl font-bold text-green-600">
                                            {combo.confidence}%
                                          </div>
                                          <div className="text-xs text-gray-500">Confidence</div>
                                        </div>
                                      </div>

                                      {/* Lineup Display */}
                                      <div className="grid grid-cols-7 gap-2 mt-4">
                                        {POSITIONS_ORDER.map(position => {
                                          const player = combo.lineup[position];
                                          return (
                                            <div key={position} className="text-center">
                                              <div className="text-xs font-medium text-gray-600 mb-1">
                                                {position}
                                              </div>
                                              {player ? (
                                                <div className="flex flex-col items-center">
                                                  <PlayerAvatar player={player} size="sm" />
                                                  <div className="text-xs mt-1 font-medium">
                                                    {player.displayName}
                                                  </div>
                                                  {player.positionPreferences?.[0] === position && (
                                                    <Star className="h-3 w-3 text-yellow-500 mt-1" />
                                                  )}
                                                </div>
                                              ) : (
                                                <div className="w-6 h-6 bg-gray-200 rounded-full mx-auto">
                                                  <span className="text-xs text-gray-400">?</span>
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>

                                      {/* Select This Lineup Button */}
                                      <div className="mt-4 pt-3 border-t">
                                        <Button 
                                          onClick={() => {
                                            setSelectedLineup(combo.lineup);
                                            toast({
                                              title: "Lineup Selected",
                                              description: `${combo.name} lineup has been selected`,
                                            });
                                          }}
                                          variant="outline"
                                          className="w-full"
                                        >
                                          <Check className="h-4 w-4 mr-2" />
                                          Select This Lineup
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ));
                              })()}
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    {/* Current Selection Summary */}
                    {Object.values(selectedLineup).some(p => p !== null) && (
                      <Card className="mt-6 bg-gray-50">
                        <CardHeader>
                          <CardTitle className="text-lg">Selected Lineup</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-7 gap-2">
                            {POSITIONS_ORDER.map(position => {
                              const player = selectedLineup[position];
                              return (
                                <div key={position} className="text-center">
                                  <div className="text-xs font-medium text-gray-600 mb-1">
                                    {position}
                                  </div>
                                  {player ? (
                                    <div className="flex flex-col items-center">
                                      <PlayerAvatar player={player} size="sm" />
                                      <div className="text-xs mt-1 font-medium">
                                        {player.displayName}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="w-6 h-6 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
                                      <span className="text-xs text-gray-400">-</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <div className="mt-4 text-center">
                            <div className="text-sm text-gray-600 mb-2">
                              {Object.values(selectedLineup).filter(p => p !== null).length}/7 positions filled
                            </div>
                            {Object.values(selectedLineup).every(p => p !== null) && (
                              <Badge variant="default">Lineup Complete!</Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab('overview')}>
                  Back to Overview
                </Button>
                <Button 
                  onClick={() => setActiveTab('roster')}
                  disabled={!Object.values(selectedLineup).every(p => p !== null)}
                >
                  Apply to Roster
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </TabsContent>

            {/* Apply to Roster */}
            <TabsContent value="roster" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Apply to Roster</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert>
                      <Play className="h-4 w-4" />
                      <AlertDescription>
                        Your preparation is complete! Apply your selections to the roster manager.
                      </AlertDescription>
                    </Alert>

                    {selectedGame && (
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-semibold mb-2">Preparation Summary</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Game</span>
                            <p className="font-semibold">vs {opponentName}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(selectedGame.date).toLocaleDateString()} {selectedGame.time}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Available Players</span>
                            <p className="font-semibold">
                              {Object.values(availabilityData).filter(status => status === 'available').length}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Starting Lineup</span>
                            <p className="font-semibold">
                              {Object.values(selectedLineup).filter(p => p !== null).length}/7 Complete
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <Button 
                        onClick={handleApplyToRoster}
                        className="flex-1"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Open Roster Manager
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab('lineup')}>
                  Back to Lineup
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </PageTemplate>
  );
}