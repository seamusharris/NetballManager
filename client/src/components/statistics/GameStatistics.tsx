import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import QuarterStatistics from './QuarterStatistics';
import { 
  Game, 
  GameStat, 
  Player, 
  Opponent, 
  Roster,
  Position
} from '@shared/schema';
import { formatShortDate } from '@/lib/utils';

interface GameStatisticsProps {
  game: Game;
  opponent: Opponent | undefined;
  players: Player[];
  gameStats: GameStat[];
  rosters: Roster[];
  isLoading: boolean;
}

export default function GameStatistics({ 
  game, 
  opponent, 
  players, 
  gameStats, 
  rosters,
  isLoading
}: GameStatisticsProps) {
  const [activeQuarter, setActiveQuarter] = useState('1');
  const { toast } = useToast();
  
  // Transform rosters to more usable format
  const rosterByQuarterAndPosition: Record<string, Record<Position, number | null>> = {
    '1': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
    '2': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
    '3': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
    '4': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null }
  };
  
  // Fill roster assignments
  rosters.forEach(roster => {
    const quarterKey = roster.quarter.toString();
    if (rosterByQuarterAndPosition[quarterKey] && roster.position) {
      rosterByQuarterAndPosition[quarterKey][roster.position as Position] = roster.playerId;
    }
  });
  
  // Group stats by quarter and player
  const statsByQuarterAndPlayer: Record<string, Record<number, GameStat>> = {
    '1': {},
    '2': {},
    '3': {},
    '4': {},
    'total': {}
  };
  
  // Calculate totals for each player
  const playerTotals: Record<number, GameStat> = {};
  
  // Initialize empty stats for all positions in the roster
  Object.entries(rosterByQuarterAndPosition).forEach(([quarter, positions]) => {
    Object.values(positions).forEach(playerId => {
      if (playerId !== null) {
        if (!statsByQuarterAndPlayer[quarter][playerId]) {
          statsByQuarterAndPlayer[quarter][playerId] = {
            id: 0,
            gameId: game.id,
            playerId,
            quarter: parseInt(quarter),
            goalsFor: 0,
            goalsAgainst: 0,
            missedGoals: 0,
            rebounds: 0,
            intercepts: 0,
            badPass: 0,
            handlingError: 0,
            pickUp: 0,
            infringement: 0
          };
        }
        
        if (!playerTotals[playerId]) {
          playerTotals[playerId] = {
            id: 0,
            gameId: game.id,
            playerId,
            quarter: 0, // 0 for totals
            goalsFor: 0,
            goalsAgainst: 0,
            missedGoals: 0,
            rebounds: 0,
            intercepts: 0,
            badPass: 0,
            handlingError: 0,
            pickUp: 0,
            infringement: 0
          };
        }
      }
    });
  });
  
  // Fill in actual stats where they exist
  gameStats.forEach(stat => {
    const quarterKey = stat.quarter.toString();
    if (quarterKey in statsByQuarterAndPlayer) {
      statsByQuarterAndPlayer[quarterKey][stat.playerId] = stat;
    }
    
    // Accumulate totals
    if (!playerTotals[stat.playerId]) {
      playerTotals[stat.playerId] = {
        id: 0,
        gameId: game.id,
        playerId: stat.playerId,
        quarter: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        missedGoals: 0,
        rebounds: 0,
        intercepts: 0,
        badPass: 0,
        handlingError: 0,
        pickUp: 0,
        infringement: 0
      };
    }
    
    playerTotals[stat.playerId].goalsFor += stat.goalsFor;
    playerTotals[stat.playerId].goalsAgainst += stat.goalsAgainst;
    playerTotals[stat.playerId].missedGoals += stat.missedGoals;
    playerTotals[stat.playerId].rebounds += stat.rebounds;
    playerTotals[stat.playerId].intercepts += stat.intercepts;
    playerTotals[stat.playerId].badPass += stat.badPass;
    playerTotals[stat.playerId].handlingError += stat.handlingError;
    playerTotals[stat.playerId].pickUp += stat.pickUp;
    playerTotals[stat.playerId].infringement += stat.infringement;
  });
  
  statsByQuarterAndPlayer['total'] = playerTotals;
  
  // Calculate quarter scores
  const quarterScores = {
    '1': { teamScore: 0, opponentScore: 0 },
    '2': { teamScore: 0, opponentScore: 0 },
    '3': { teamScore: 0, opponentScore: 0 },
    '4': { teamScore: 0, opponentScore: 0 },
    'total': { teamScore: 0, opponentScore: 0 }
  };
  
  // Sum goals for each quarter
  Object.entries(statsByQuarterAndPlayer).forEach(([quarter, playerStats]) => {
    if (quarter === 'total') return; // Skip totals for now
    
    Object.values(playerStats).forEach(stat => {
      quarterScores[quarter].teamScore += stat.goalsFor;
      quarterScores[quarter].opponentScore += stat.goalsAgainst;
      
      // Also add to totals
      quarterScores['total'].teamScore += stat.goalsFor;
      quarterScores['total'].opponentScore += stat.goalsAgainst;
    });
  });
  
  // Check if roster is completely filled
  const isRosterComplete = Object.values(rosterByQuarterAndPosition).every(positions => 
    Object.values(positions).every(playerId => playerId !== null)
  );
  
  // Save or update a player's statistics
  const saveStatsMutation = useMutation({
    mutationFn: async ({
      playerId,
      quarter,
      stats
    }: {
      playerId: number;
      quarter: number;
      stats: Partial<GameStat>;
    }) => {
      // Find if there's an existing stat entry for this player and quarter
      const existingStat = gameStats.find(s => 
        s.gameId === game.id && 
        s.playerId === playerId && 
        s.quarter === quarter
      );
      
      if (existingStat) {
        // Update existing stats
        const res = await apiRequest('PATCH', `/api/gamestats/${existingStat.id}`, stats);
        return res.json();
      } else {
        // Create new stats
        const res = await apiRequest('POST', '/api/gamestats', {
          gameId: game.id,
          playerId,
          quarter,
          ...stats
        });
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/games', game.id, 'stats'] });
      toast({
        title: "Success",
        description: "Statistics updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update statistics: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  // Handle stat value change
  const handleStatChange = (
    playerId: number, 
    quarter: number, 
    statName: keyof GameStat, 
    value: number
  ) => {
    saveStatsMutation.mutate({
      playerId,
      quarter,
      stats: { [statName]: value }
    });
  };
  
  // Bulk save all stats
  const handleSaveAllStats = () => {
    toast({
      title: "Saving Statistics",
      description: "All statistics have been saved successfully",
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold text-neutral-dark">Game Statistics</h2>
          <p className="text-gray-500">
            vs. {opponent?.teamName} • {formatShortDate(game.date)} • {game.time}
          </p>
        </div>
        <Button
          className="bg-primary hover:bg-primary-light text-white"
          onClick={handleSaveAllStats}
          disabled={saveStatsMutation.isPending}
        >
          <Save className="w-4 h-4 mr-1" /> Save Stats
        </Button>
      </div>
      
      {!isRosterComplete && (
        <Card className="bg-warning/10 border-warning">
          <CardContent className="p-4">
            <p className="text-warning font-medium">
              Warning: The roster for this game is incomplete. Please complete the roster before entering statistics.
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Score by Quarter */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-heading font-semibold text-neutral-dark mb-4">
            Score by Quarter
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Team</h4>
              <div className="grid grid-cols-1 gap-2">
                <div className="bg-primary/10 rounded p-2">
                  <div className="font-heading font-bold text-primary">Our Team</div>
                  <div className="text-2xl font-bold text-neutral-dark">
                    {quarterScores.total.teamScore}
                  </div>
                </div>
                <div className="bg-gray-200 rounded p-2">
                  <div className="font-heading font-bold text-gray-700">{opponent?.teamName}</div>
                  <div className="text-2xl font-bold text-neutral-dark">
                    {quarterScores.total.opponentScore}
                  </div>
                </div>
              </div>
            </div>
            
            {['1', '2', '3', '4'].map(quarter => (
              <div key={quarter} className="bg-gray-50 p-4 rounded-lg text-center">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Q{quarter}</h4>
                <div className="grid grid-cols-1 gap-2">
                  <div className="bg-primary/10 rounded p-2">
                    <div className="text-xl font-bold text-neutral-dark">
                      {quarterScores[quarter].teamScore}
                    </div>
                  </div>
                  <div className="bg-gray-200 rounded p-2">
                    <div className="text-xl font-bold text-neutral-dark">
                      {quarterScores[quarter].opponentScore}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Quarter tabs for stats */}
          <Tabs value={activeQuarter} onValueChange={setActiveQuarter}>
            <TabsList className="mb-4 w-full grid grid-cols-5">
              <TabsTrigger value="1">Quarter 1</TabsTrigger>
              <TabsTrigger value="2">Quarter 2</TabsTrigger>
              <TabsTrigger value="3">Quarter 3</TabsTrigger>
              <TabsTrigger value="4">Quarter 4</TabsTrigger>
              <TabsTrigger value="total">Game Totals</TabsTrigger>
            </TabsList>
            
            {['1', '2', '3', '4', 'total'].map(quarter => (
              <TabsContent key={quarter} value={quarter}>
                <QuarterStatistics 
                  quarter={quarter}
                  players={players}
                  rosters={quarter !== 'total' ? rosterByQuarterAndPosition[quarter] : null}
                  stats={statsByQuarterAndPlayer[quarter]}
                  onStatChange={(playerId, statName, value) => 
                    quarter !== 'total' && handleStatChange(playerId, parseInt(quarter), statName, value)
                  }
                  isEditable={quarter !== 'total'}
                  isPending={saveStatsMutation.isPending}
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
