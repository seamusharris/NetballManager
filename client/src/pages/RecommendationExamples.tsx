
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageTemplate from '@/components/layout/PageTemplate';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';

// Sample data
const sampleQuarterScores = {
  1: { team: 8, opponent: 6 },
  2: { team: 5, opponent: 9 },
  3: { team: 12, opponent: 4 },
  4: { team: 7, opponent: 8 }
};

const samplePlayerPositions = {
  1: {
    GS: { name: "Sarah M", goals: 6, missed: 2 },
    GA: { name: "Emma K", goals: 2, missed: 1 },
    WA: { name: "Chloe R", goals: 0, missed: 0 },
    C: { name: "Jessica L", goals: 0, missed: 0 },
    WD: { name: "Amy T", goals: 0, missed: 0 },
    GD: { name: "Sophie W", goals: 0, missed: 0 },
    GK: { name: "Hannah P", goals: 0, missed: 0 }
  },
  2: {
    GS: { name: "Emma K", goals: 3, missed: 3 },
    GA: { name: "Chloe R", goals: 2, missed: 0 },
    WA: { name: "Jessica L", goals: 0, missed: 0 },
    C: { name: "Amy T", goals: 0, missed: 0 },
    WD: { name: "Sophie W", goals: 0, missed: 0 },
    GD: { name: "Hannah P", goals: 0, missed: 0 },
    GK: { name: "Sarah M", goals: 0, missed: 0 }
  },
  3: {
    GS: { name: "Sarah M", goals: 8, missed: 1 },
    GA: { name: "Emma K", goals: 4, missed: 0 },
    WA: { name: "Chloe R", goals: 0, missed: 0 },
    C: { name: "Jessica L", goals: 0, missed: 0 },
    WD: { name: "Amy T", goals: 0, missed: 0 },
    GD: { name: "Sophie W", goals: 0, missed: 0 },
    GK: { name: "Hannah P", goals: 0, missed: 0 }
  },
  4: {
    GS: { name: "Emma K", goals: 4, missed: 2 },
    GA: { name: "Chloe R", goals: 3, missed: 1 },
    WA: { name: "Jessica L", goals: 0, missed: 0 },
    C: { name: "Amy T", goals: 0, missed: 0 },
    WD: { name: "Sophie W", goals: 0, missed: 0 },
    GD: { name: "Hannah P", goals: 0, missed: 0 },
    GK: { name: "Sarah M", goals: 0, missed: 0 }
  }
};

const getPlayerColor = (name: string) => {
  const colors = {
    "Sarah M": "#3B82F6",
    "Emma K": "#10B981", 
    "Chloe R": "#F59E0B",
    "Jessica L": "#EF4444",
    "Amy T": "#8B5CF6",
    "Sophie W": "#06B6D4",
    "Hannah P": "#F97316"
  };
  return colors[name] || "#6B7280";
};

const getQuarterResult = (quarter: number) => {
  const scores = sampleQuarterScores[quarter];
  const diff = scores.team - scores.opponent;
  if (diff > 0) return { result: 'win', icon: TrendingUp, color: 'text-green-600 bg-green-50 border-green-200' };
  if (diff < 0) return { result: 'loss', icon: TrendingDown, color: 'text-red-600 bg-red-50 border-red-200' };
  return { result: 'draw', icon: Minus, color: 'text-amber-600 bg-amber-50 border-amber-200' };
};

// Variation 1: Timeline Style
const TimelineRecommendations = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <div className="w-4 h-4 bg-blue-500 rounded"></div>
        Variation 1: Timeline Quarter Analysis
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-6">
        {[1, 2, 3, 4].map(quarter => {
          const scores = sampleQuarterScores[quarter];
          const quarterInfo = getQuarterResult(quarter);
          const Icon = quarterInfo.icon;
          
          return (
            <div key={quarter} className="flex items-start gap-4">
              {/* Quarter Header */}
              <div className={`flex-shrink-0 w-20 p-3 rounded-lg border ${quarterInfo.color}`}>
                <div className="text-center">
                  <div className="text-sm font-medium">Q{quarter}</div>
                  <div className="text-lg font-bold">{scores.team}-{scores.opponent}</div>
                  <Icon className="h-4 w-4 mx-auto mt-1" />
                </div>
              </div>

              {/* Position Players */}
              <div className="flex-1">
                <div className="grid grid-cols-7 gap-2">
                  {['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'].map(position => {
                    const player = samplePlayerPositions[quarter][position];
                    const isShooter = ['GS', 'GA'].includes(position);
                    
                    return (
                      <div 
                        key={position}
                        className="p-2 border rounded-lg bg-white shadow-sm"
                        style={{ borderColor: getPlayerColor(player.name) + '40' }}
                      >
                        <div className="text-xs font-medium text-center mb-1">{position}</div>
                        <div 
                          className="text-xs text-center font-medium p-1 rounded text-white"
                          style={{ backgroundColor: getPlayerColor(player.name) }}
                        >
                          {player.name}
                        </div>
                        {isShooter && (
                          <div className="text-xs text-center mt-1">
                            <span className="text-green-600">{player.goals}g</span>
                            {player.missed > 0 && <span className="text-red-500 ml-1">{player.missed}m</span>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </CardContent>
  </Card>
);

// Variation 2: Grid Layout
const GridRecommendations = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <div className="w-4 h-4 bg-green-500 rounded"></div>
        Variation 2: Grid Quarter Comparison
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(quarter => {
          const scores = sampleQuarterScores[quarter];
          const quarterInfo = getQuarterResult(quarter);
          
          return (
            <div key={quarter} className={`p-4 rounded-lg border-2 ${quarterInfo.color}`}>
              <div className="text-center mb-3">
                <h3 className="font-bold">Quarter {quarter}</h3>
                <div className="text-2xl font-bold">{scores.team} - {scores.opponent}</div>
                <Badge variant={quarterInfo.result === 'win' ? 'default' : quarterInfo.result === 'loss' ? 'destructive' : 'secondary'}>
                  {quarterInfo.result === 'win' ? 'Won' : quarterInfo.result === 'loss' ? 'Lost' : 'Draw'}
                </Badge>
              </div>
              
              <div className="space-y-2">
                {['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'].map(position => {
                  const player = samplePlayerPositions[quarter][position];
                  const isShooter = ['GS', 'GA'].includes(position);
                  
                  return (
                    <div key={position} className="flex items-center justify-between text-sm">
                      <span className="font-medium">{position}:</span>
                      <div className="flex items-center gap-2">
                        <span 
                          className="px-2 py-1 rounded text-white text-xs"
                          style={{ backgroundColor: getPlayerColor(player.name) }}
                        >
                          {player.name}
                        </span>
                        {isShooter && (
                          <span className="text-xs text-muted-foreground">
                            {player.goals}g/{player.missed}m
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </CardContent>
  </Card>
);

// Variation 3: Player-Focused
const PlayerFocusedRecommendations = () => {
  const allPlayers = new Set<string>();
  Object.values(samplePlayerPositions).forEach(quarter => {
    Object.values(quarter).forEach(player => allPlayers.add(player.name));
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-500 rounded"></div>
          Variation 3: Player Performance Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from(allPlayers).map(playerName => (
            <div key={playerName} className="border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: getPlayerColor(playerName) }}
                ></div>
                <h3 className="font-bold">{playerName}</h3>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(quarter => {
                  const position = Object.keys(samplePlayerPositions[quarter]).find(
                    pos => samplePlayerPositions[quarter][pos].name === playerName
                  );
                  const player = position ? samplePlayerPositions[quarter][position] : null;
                  const scores = sampleQuarterScores[quarter];
                  const quarterInfo = getQuarterResult(quarter);
                  
                  return (
                    <div key={quarter} className={`p-3 rounded border ${quarterInfo.color}`}>
                      <div className="text-center">
                        <div className="text-sm font-medium">Q{quarter}</div>
                        <div className="text-lg font-bold">{scores.team}-{scores.opponent}</div>
                        {player ? (
                          <div className="mt-2">
                            <Badge variant="outline">{position}</Badge>
                            {['GS', 'GA'].includes(position) && (
                              <div className="text-xs mt-1">
                                {player.goals}g/{player.missed}m
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground mt-2">Not playing</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Variation 4: Court Layout Style
const CourtLayoutRecommendations = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <div className="w-4 h-4 bg-orange-500 rounded"></div>
        Variation 4: Court Position Layout
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-8">
        {[1, 2, 3, 4].map(quarter => {
          const scores = sampleQuarterScores[quarter];
          const quarterInfo = getQuarterResult(quarter);
          const Icon = quarterInfo.icon;
          
          return (
            <div key={quarter}>
              {/* Quarter Header */}
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className={`px-4 py-2 rounded-lg border ${quarterInfo.color}`}>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">Quarter {quarter}</span>
                    <span className="text-2xl font-bold">{scores.team} - {scores.opponent}</span>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>

              {/* Court Layout */}
              <div className="relative bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-3 gap-8 h-32">
                  {/* Attack Third */}
                  <div className="border-r-2 border-dashed border-gray-300 relative">
                    <div className="text-xs text-center font-medium text-gray-500 mb-2">Attack</div>
                    <div className="space-y-3">
                      {['GS', 'GA'].map(position => {
                        const player = samplePlayerPositions[quarter][position];
                        return (
                          <div 
                            key={position}
                            className="p-2 border rounded text-center text-white text-xs"
                            style={{ backgroundColor: getPlayerColor(player.name) }}
                          >
                            <div className="font-bold">{position}</div>
                            <div>{player.name}</div>
                            <div>{player.goals}g/{player.missed}m</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Center Third */}
                  <div className="border-r-2 border-dashed border-gray-300 relative">
                    <div className="text-xs text-center font-medium text-gray-500 mb-2">Center</div>
                    <div className="space-y-3">
                      {['WA', 'C', 'WD'].map(position => {
                        const player = samplePlayerPositions[quarter][position];
                        return (
                          <div 
                            key={position}
                            className="p-2 border rounded text-center text-white text-xs"
                            style={{ backgroundColor: getPlayerColor(player.name) }}
                          >
                            <div className="font-bold">{position}</div>
                            <div>{player.name}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Defense Third */}
                  <div className="relative">
                    <div className="text-xs text-center font-medium text-gray-500 mb-2">Defense</div>
                    <div className="space-y-3">
                      {['GD', 'GK'].map(position => {
                        const player = samplePlayerPositions[quarter][position];
                        return (
                          <div 
                            key={position}
                            className="p-2 border rounded text-center text-white text-xs"
                            style={{ backgroundColor: getPlayerColor(player.name) }}
                          >
                            <div className="font-bold">{position}</div>
                            <div>{player.name}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </CardContent>
  </Card>
);

// Variation 5: Compact Summary
const CompactSummaryRecommendations = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <div className="w-4 h-4 bg-red-500 rounded"></div>
        Variation 5: Compact Performance Summary
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Position</th>
              {[1, 2, 3, 4].map(quarter => (
                <th key={quarter} className="text-center p-2">
                  <div>Q{quarter}</div>
                  <div className="text-sm font-normal">
                    {sampleQuarterScores[quarter].team}-{sampleQuarterScores[quarter].opponent}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'].map(position => (
              <tr key={position} className="border-b">
                <td className="p-2 font-medium">{position}</td>
                {[1, 2, 3, 4].map(quarter => {
                  const player = samplePlayerPositions[quarter][position];
                  const scores = sampleQuarterScores[quarter];
                  const quarterInfo = getQuarterResult(quarter);
                  const isShooter = ['GS', 'GA'].includes(position);
                  
                  return (
                    <td key={quarter} className={`p-2 text-center border ${quarterInfo.color}`}>
                      <div 
                        className="inline-block px-2 py-1 rounded text-white text-xs mb-1"
                        style={{ backgroundColor: getPlayerColor(player.name) }}
                      >
                        {player.name}
                      </div>
                      {isShooter && (
                        <div className="text-xs">
                          <span className="text-green-600">{player.goals}g</span>
                          <span className="text-red-500 ml-1">{player.missed}m</span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 flex justify-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-50 border border-green-200 rounded"></div>
          <span className="text-xs">Won Quarter</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-50 border border-red-200 rounded"></div>
          <span className="text-xs">Lost Quarter</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-50 border border-amber-200 rounded"></div>
          <span className="text-xs">Draw Quarter</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function RecommendationExamples() {
  return (
    <PageTemplate 
      title="Lineup Recommendations" 
      breadcrumbs={[
        { label: "Component Examples", href: "/component-examples" },
        { label: "Lineup Recommendations" }
      ]}
    >
      <div className="space-y-8">
        <div className="prose max-w-none">
          <p className="text-lg text-gray-700">
            Five different ways to display player positions alongside quarter scores for tactical analysis. 
            Each variation offers a different perspective on how lineups performed during specific quarters.
          </p>
        </div>

        <TimelineRecommendations />
        <GridRecommendations />
        <PlayerFocusedRecommendations />
        <CourtLayoutRecommendations />
        <CompactSummaryRecommendations />

        <Card>
          <CardHeader>
            <CardTitle>Implementation Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold">Data Requirements:</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Quarter-by-quarter official scores (team vs opponent)</li>
                  <li>Player positions for each quarter</li>
                  <li>Goals for/against by position (for shooters primarily)</li>
                  <li>Player identification and colors</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold">Key Features:</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Visual correlation between quarter results and player lineups</li>
                  <li>Color-coded players for easy tracking across quarters</li>
                  <li>Clear win/loss/draw indicators for each quarter</li>
                  <li>Shooter statistics prominently displayed</li>
                  <li>Multiple layout options for different use cases</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
}
