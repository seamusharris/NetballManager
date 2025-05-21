import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  GameStat, 
  Position, 
  allPositions
} from '@shared/schema';
import { Loader2 } from 'lucide-react';

// Define the types of statistics we track
type StatType = 'goalsFor' | 'goalsAgainst' | 'missedGoals' | 'rebounds' | 
                'intercepts' | 'badPass' | 'handlingError' | 'pickUp' | 'infringement';

// Default empty stats for a position
const emptyPositionStats = {
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

// Stat colors for visual indication
const statColors: Record<StatType, string> = {
  goalsFor: 'bg-green-100 hover:bg-green-200 text-green-700',
  missedGoals: 'bg-orange-100 hover:bg-orange-200 text-orange-700',
  goalsAgainst: 'bg-red-100 hover:bg-red-200 text-red-700',
  rebounds: 'bg-blue-100 hover:bg-blue-200 text-blue-700',
  intercepts: 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700',
  pickUp: 'bg-purple-100 hover:bg-purple-200 text-purple-700',
  badPass: 'bg-amber-100 hover:bg-amber-200 text-amber-700',
  handlingError: 'bg-pink-100 hover:bg-pink-200 text-pink-700',
  infringement: 'bg-rose-100 hover:bg-rose-200 text-rose-700'
};

// Human-readable labels for stats
const statLabels: Record<StatType, string> = {
  goalsFor: 'Goal',
  missedGoals: 'Miss',
  goalsAgainst: 'Goal Against',
  rebounds: 'Rebound',
  intercepts: 'Intercept',
  pickUp: 'Pick Up',
  badPass: 'Bad Pass',
  handlingError: 'Handling Error',
  infringement: 'Infringement'
};

// Which stats should be shown for each position
const positionStats: Record<Position, Record<StatType, boolean>> = {
  "GS": {
    goalsFor: true,
    goalsAgainst: false,
    missedGoals: true,
    rebounds: true,
    intercepts: false,
    badPass: true,
    handlingError: true,
    pickUp: false,
    infringement: true
  },
  "GA": {
    goalsFor: true,
    goalsAgainst: false,
    missedGoals: true,
    rebounds: true,
    intercepts: true,
    badPass: true,
    handlingError: true,
    pickUp: false,
    infringement: true
  },
  "WA": {
    goalsFor: false,
    goalsAgainst: false,
    missedGoals: false,
    rebounds: false,
    intercepts: true,
    badPass: true,
    handlingError: true,
    pickUp: true,
    infringement: true
  },
  "C": {
    goalsFor: false,
    goalsAgainst: false,
    missedGoals: false,
    rebounds: false,
    intercepts: true,
    badPass: true,
    handlingError: true,
    pickUp: true,
    infringement: true
  },
  "WD": {
    goalsFor: false,
    goalsAgainst: false,
    missedGoals: false,
    rebounds: false,
    intercepts: true,
    badPass: true,
    handlingError: true,
    pickUp: true,
    infringement: true
  },
  "GD": {
    goalsFor: false,
    goalsAgainst: false,
    missedGoals: false,
    rebounds: true,
    intercepts: true,
    badPass: true,
    handlingError: true,
    pickUp: true,
    infringement: true
  },
  "GK": {
    goalsFor: false,
    goalsAgainst: true,
    missedGoals: false,
    rebounds: true,
    intercepts: true,
    badPass: true,
    handlingError: true,
    pickUp: true,
    infringement: true
  }
};

interface PositionBasedStatsProps {
  gameId: number;
  existingStats: GameStat[];
  onStatsUpdated?: () => void;
}

const PositionBasedStats: React.FC<PositionBasedStatsProps> = ({
  gameId,
  existingStats,
  onStatsUpdated
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeQuarter, setActiveQuarter] = useState<string>("1");
  const [isSaving, setIsSaving] = useState(false);
  
  // Current stats organized by position and quarter
  const [positionStatsData, setPositionStatsData] = useState<
    Record<string, Record<string, Record<StatType, number>>>
  >({});
  
  // Initialize position stats with existing data
  useEffect(() => {
    if (!existingStats || existingStats.length === 0) {
      console.log("No existing stats to load");
      initializeEmptyStats();
      return;
    }
    
    console.log(`Initializing with ${existingStats.length} existing stats`);
    
    // Start with an empty structure
    const initialStats: Record<string, Record<string, Record<StatType, number>>> = {};
    
    // Initialize all positions and quarters with empty stats
    allPositions.forEach(position => {
      initialStats[position] = {
        "1": { ...emptyPositionStats },
        "2": { ...emptyPositionStats },
        "3": { ...emptyPositionStats },
        "4": { ...emptyPositionStats }
      };
    });
    
    // Group stats by position and quarter to handle duplicates
    const latestStats: Record<string, GameStat> = {};
    
    // Process existing stats, keeping only the latest one for each position/quarter
    existingStats.forEach(stat => {
      if (!stat.position || !stat.quarter) {
        console.warn("Found stat without position or quarter:", stat);
        return;
      }
      
      const key = `${stat.position}-${stat.quarter}`;
      
      // Only keep the stat with the highest ID (most recent)
      if (!latestStats[key] || stat.id > latestStats[key].id) {
        latestStats[key] = stat;
      }
    });
    
    // Apply the latest stats to our initial structure
    Object.values(latestStats).forEach(stat => {
      if (stat.position && stat.quarter) {
        const position = stat.position;
        const quarter = stat.quarter.toString();
        
        // Make sure the position and quarter exist in our structure
        if (!initialStats[position]) {
          initialStats[position] = {
            "1": { ...emptyPositionStats },
            "2": { ...emptyPositionStats },
            "3": { ...emptyPositionStats },
            "4": { ...emptyPositionStats }
          };
        }
        
        if (!initialStats[position][quarter]) {
          initialStats[position][quarter] = { ...emptyPositionStats };
        }
        
        // Copy all stat values
        Object.keys(emptyPositionStats).forEach(key => {
          const statKey = key as StatType;
          if (stat[statKey] !== undefined) {
            initialStats[position][quarter][statKey] = Number(stat[statKey]) || 0;
          }
        });
        
        console.log(`Loaded stats for ${position} in Q${quarter}: Goals: ${initialStats[position][quarter].goalsFor}, Against: ${initialStats[position][quarter].goalsAgainst}`);
      }
    });
    
    setPositionStatsData(initialStats);
  }, [existingStats]);
  
  const initializeEmptyStats = () => {
    const emptyStats: Record<string, Record<string, Record<StatType, number>>> = {};
    
    allPositions.forEach(position => {
      emptyStats[position] = {
        "1": { ...emptyPositionStats },
        "2": { ...emptyPositionStats },
        "3": { ...emptyPositionStats },
        "4": { ...emptyPositionStats }
      };
    });
    
    setPositionStatsData(emptyStats);
  };
  
  // Mutation for saving game statistics
  const { mutate: saveGameStat } = useMutation({
    mutationFn: (gameStat: Partial<GameStat>) => 
      apiRequest(`/api/gamestats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameStat)
      })
  });
  
  // Update a stat value for a position in the current quarter
  const updateStat = (position: Position, statType: StatType, value: number) => {
    // Ensure we're working with a number
    const numericValue = Number(value);
    
    setPositionStatsData(prev => {
      const newStats = { ...prev };
      const quarter = activeQuarter;
      
      if (!newStats[position]) {
        newStats[position] = {
          "1": { ...emptyPositionStats },
          "2": { ...emptyPositionStats },
          "3": { ...emptyPositionStats },
          "4": { ...emptyPositionStats }
        };
      }
      
      if (!newStats[position][quarter]) {
        newStats[position][quarter] = { ...emptyPositionStats };
      }
      
      // Update the specific stat value
      newStats[position][quarter][statType] = numericValue;
      
      return newStats;
    });
  };
  
  // Increment or decrement a stat value
  const adjustStat = (position: Position, statType: StatType, increment: number) => {
    setPositionStatsData(prev => {
      const newStats = { ...prev };
      const quarter = activeQuarter;
      
      if (!newStats[position]) {
        newStats[position] = {
          "1": { ...emptyPositionStats },
          "2": { ...emptyPositionStats },
          "3": { ...emptyPositionStats },
          "4": { ...emptyPositionStats }
        };
      }
      
      if (!newStats[position][quarter]) {
        newStats[position][quarter] = { ...emptyPositionStats };
      }
      
      const currentValue = newStats[position][quarter][statType] || 0;
      const newValue = Math.max(0, currentValue + increment); // Prevent negative values
      
      newStats[position][quarter][statType] = newValue;
      
      return newStats;
    });
  };
  
  // Save all position stats for the current game
  const saveAllStats = async () => {
    if (isSaving) return;
    
    try {
      setIsSaving(true);
      
      // Create an array of all stats that need to be saved
      const statsToSave: Partial<GameStat>[] = [];
      
      // Process all positions and quarters
      for (const position of allPositions) {
        for (let quarter = 1; quarter <= 4; quarter++) {
          const quarterStr = quarter.toString();
          
          // Skip if position doesn't exist in our data
          if (!positionStatsData[position] || !positionStatsData[position][quarterStr]) {
            continue;
          }
          
          // Create a stat object for this position and quarter
          const statObject: Partial<GameStat> = {
            gameId,
            position,
            quarter,
            goalsFor: positionStatsData[position][quarterStr].goalsFor || 0,
            goalsAgainst: positionStatsData[position][quarterStr].goalsAgainst || 0,
            missedGoals: positionStatsData[position][quarterStr].missedGoals || 0,
            rebounds: positionStatsData[position][quarterStr].rebounds || 0,
            intercepts: positionStatsData[position][quarterStr].intercepts || 0,
            badPass: positionStatsData[position][quarterStr].badPass || 0,
            handlingError: positionStatsData[position][quarterStr].handlingError || 0,
            pickUp: positionStatsData[position][quarterStr].pickUp || 0,
            infringement: positionStatsData[position][quarterStr].infringement || 0
          };
          
          statsToSave.push(statObject);
        }
      }
      
      // Skip if nothing to save
      if (statsToSave.length === 0) {
        toast({
          title: "No stats to save",
          description: "There are no stats to save for this game.",
          variant: "destructive"
        });
        return;
      }
      
      console.log(`Saving ${statsToSave.length} position-based stats`);
      
      // Save all stats in sequence
      for (const stat of statsToSave) {
        await saveGameStat(stat);
      }
      
      // First, manually fetch the latest stats to update our local view without refreshing
      try {
        const freshStats = await fetch(`/api/games/${gameId}/stats?t=${Date.now()}`).then(res => res.json());
        console.log(`Manually fetched ${freshStats.length} fresh stats after saving in PositionBasedStats`);
        
        // Silently update cache with fresh data in the background
        queryClient.setQueryData(['/api/games', gameId, 'stats'], freshStats);
      } catch (err) {
        console.error("Error refreshing stats after save:", err);
      }
      
      toast({
        title: "Statistics saved",
        description: "All position statistics have been saved successfully."
      });
      
      // Invalidate queries but with lower priority (happens in background)
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/gamestats', gameId] });
        queryClient.invalidateQueries({ queryKey: ['/api/games', gameId, 'stats'] });
        queryClient.invalidateQueries({ queryKey: ['/api/games', gameId] });
        queryClient.invalidateQueries({ queryKey: ['/api/games'] });
      }, 500);
      
      // Notify parent component if needed
      if (onStatsUpdated) {
        onStatsUpdated();
      }
    } catch (error) {
      console.error("Error saving stats:", error);
      toast({
        title: "Error",
        description: "Failed to save statistics. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Calculate quarter totals
  const getQuarterTotal = (statType: StatType): number => {
    let total = 0;
    
    allPositions.forEach(position => {
      if (positionStatsData[position]?.[activeQuarter]?.[statType]) {
        total += positionStatsData[position][activeQuarter][statType];
      }
    });
    
    return total;
  };
  
  // Calculate game totals
  const getGameTotal = (statType: StatType): number => {
    let total = 0;
    
    allPositions.forEach(position => {
      ["1", "2", "3", "4"].forEach(quarter => {
        if (positionStatsData[position]?.[quarter]?.[statType]) {
          total += positionStatsData[position][quarter][statType];
        }
      });
    });
    
    return total;
  };
  
  // Render a button for adjusting a stat
  const renderStatAdjuster = (position: Position, statType: StatType) => {
    // Skip stats that don't apply to this position
    if (!positionStats[position][statType]) {
      return null;
    }
    
    const currentValue = positionStatsData[position]?.[activeQuarter]?.[statType] || 0;
    
    return (
      <div className="flex items-center gap-1 mb-1">
        <span className="text-xs font-medium w-24">{statLabels[statType]}</span>
        <Button
          variant="outline"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => adjustStat(position, statType, -1)}
          disabled={currentValue <= 0}
        >
          -
        </Button>
        <span className="w-6 text-center font-semibold">
          {currentValue}
        </span>
        <Button
          variant="outline"
          size="sm"
          className={`h-6 w-6 p-0 ${statColors[statType]}`}
          onClick={() => adjustStat(position, statType, 1)}
        >
          +
        </Button>
      </div>
    );
  };
  
  // Render statistics for a position
  const renderPositionStats = (position: Position) => {
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <h3 className="text-lg font-bold mb-2">{position}</h3>
          <div className="grid grid-cols-1">
            {/* Shooting stats */}
            {positionStats[position].goalsFor && (
              renderStatAdjuster(position, 'goalsFor')
            )}
            {positionStats[position].missedGoals && (
              renderStatAdjuster(position, 'missedGoals')
            )}
            {positionStats[position].goalsAgainst && (
              renderStatAdjuster(position, 'goalsAgainst')
            )}
            {positionStats[position].rebounds && (
              renderStatAdjuster(position, 'rebounds')
            )}
            
            {/* Common stats */}
            {positionStats[position].intercepts && (
              renderStatAdjuster(position, 'intercepts')
            )}
            {positionStats[position].badPass && (
              renderStatAdjuster(position, 'badPass')
            )}
            {positionStats[position].handlingError && (
              renderStatAdjuster(position, 'handlingError')
            )}
            {positionStats[position].pickUp && (
              renderStatAdjuster(position, 'pickUp')
            )}
            {positionStats[position].infringement && (
              renderStatAdjuster(position, 'infringement')
            )}
          </div>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Position-Based Statistics</h2>
        <Button 
          onClick={saveAllStats}
          disabled={isSaving}
          className="bg-green-600 hover:bg-green-700"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Statistics"
          )}
        </Button>
      </div>
      
      <div className="bg-white p-4 rounded-md shadow mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Game Score</h3>
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Quarter {activeQuarter}</p>
              <p className="text-lg font-bold">{getQuarterTotal('goalsFor')} - {getQuarterTotal('goalsAgainst')}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Game Total</p>
              <p className="text-lg font-bold">{getGameTotal('goalsFor')} - {getGameTotal('goalsAgainst')}</p>
            </div>
          </div>
        </div>
      </div>
      
      <Tabs 
        defaultValue="1" 
        value={activeQuarter}
        onValueChange={setActiveQuarter}
        className="w-full"
      >
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="1">Quarter 1</TabsTrigger>
          <TabsTrigger value="2">Quarter 2</TabsTrigger>
          <TabsTrigger value="3">Quarter 3</TabsTrigger>
          <TabsTrigger value="4">Quarter 4</TabsTrigger>
        </TabsList>
        
        {/* All quarters share the same rendering, just with different data */}
        <TabsContent value={activeQuarter} className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Shooting positions */}
            <div>
              {renderPositionStats("GS")}
              {renderPositionStats("GA")}
            </div>
            
            {/* Mid-court positions */}
            <div>
              {renderPositionStats("WA")}
              {renderPositionStats("C")}
              {renderPositionStats("WD")}
            </div>
            
            {/* Defensive positions */}
            <div>
              {renderPositionStats("GD")}
              {renderPositionStats("GK")}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PositionBasedStats;