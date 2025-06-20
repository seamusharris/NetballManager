
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageTemplate from '@/components/layout/PageTemplate';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trophy, TrendingUp, TrendingDown, Target, Users, BarChart3, Eye, Grid3X3 } from 'lucide-react';
import PlayerBox from '@/components/ui/player-box';

// Sample data
const sampleQuarterScores = {
  1: { team: 8, opponent: 6 },
  2: { team: 5, opponent: 9 },
  3: { team: 12, opponent: 4 },
  4: { team: 7, opponent: 8 }
};

const samplePlayers = [
  { id: 1, displayName: "Sarah M", firstName: "Sarah", lastName: "Mitchell", isActive: true },
  { id: 2, displayName: "Emma K", firstName: "Emma", lastName: "Klein", isActive: true },
  { id: 3, displayName: "Chloe R", firstName: "Chloe", lastName: "Roberts", isActive: true },
  { id: 4, displayName: "Jessica L", firstName: "Jessica", lastName: "Lee", isActive: true },
  { id: 5, displayName: "Amy T", firstName: "Amy", lastName: "Thompson", isActive: true },
  { id: 6, displayName: "Sophie W", firstName: "Sophie", lastName: "Williams", isActive: true },
  { id: 7, displayName: "Hannah P", firstName: "Hannah", lastName: "Parker", isActive: true }
];

const samplePlayerPositions = {
  1: {
    GS: { player: samplePlayers[0], goals: 6, missed: 2, effectiveness: 75 },
    GA: { player: samplePlayers[1], goals: 2, missed: 1, effectiveness: 67 },
    WA: { player: samplePlayers[2], goals: 0, missed: 0, effectiveness: 80 },
    C: { player: samplePlayers[3], goals: 0, missed: 0, effectiveness: 85 },
    WD: { player: samplePlayers[4], goals: 0, missed: 0, effectiveness: 78 },
    GD: { player: samplePlayers[5], goals: 0, missed: 0, effectiveness: 82 },
    GK: { player: samplePlayers[6], goals: 0, missed: 0, effectiveness: 90 }
  },
  2: {
    GS: { player: samplePlayers[1], goals: 3, missed: 3, effectiveness: 50 },
    GA: { player: samplePlayers[2], goals: 2, missed: 0, effectiveness: 100 },
    WA: { player: samplePlayers[3], goals: 0, missed: 0, effectiveness: 70 },
    C: { player: samplePlayers[4], goals: 0, missed: 0, effectiveness: 65 },
    WD: { player: samplePlayers[5], goals: 0, missed: 0, effectiveness: 60 },
    GD: { player: samplePlayers[6], goals: 0, missed: 0, effectiveness: 75 },
    GK: { player: samplePlayers[0], goals: 0, missed: 0, effectiveness: 70 }
  },
  3: {
    GS: { player: samplePlayers[0], goals: 8, missed: 1, effectiveness: 89 },
    GA: { player: samplePlayers[1], goals: 4, missed: 0, effectiveness: 100 },
    WA: { player: samplePlayers[2], goals: 0, missed: 0, effectiveness: 95 },
    C: { player: samplePlayers[3], goals: 0, missed: 0, effectiveness: 92 },
    WD: { player: samplePlayers[4], goals: 0, missed: 0, effectiveness: 88 },
    GD: { player: samplePlayers[5], goals: 0, missed: 0, effectiveness: 90 },
    GK: { player: samplePlayers[6], goals: 0, missed: 0, effectiveness: 95 }
  },
  4: {
    GS: { player: samplePlayers[1], goals: 4, missed: 2, effectiveness: 67 },
    GA: { player: samplePlayers[2], goals: 3, missed: 1, effectiveness: 75 },
    WA: { player: samplePlayers[3], goals: 0, missed: 0, effectiveness: 75 },
    C: { player: samplePlayers[4], goals: 0, missed: 0, effectiveness: 70 },
    WD: { player: samplePlayers[5], goals: 0, missed: 0, effectiveness: 72 },
    GD: { player: samplePlayers[6], goals: 0, missed: 0, effectiveness: 78 },
    GK: { player: samplePlayers[0], goals: 0, missed: 0, effectiveness: 80 }
  }
};

export default function RecommendationExamples() {
  const getScoreResult = (teamScore: number, opponentScore: number) => {
    if (teamScore > opponentScore) return { result: 'win', color: 'bg-green-100 text-green-800' };
    if (teamScore < opponentScore) return { result: 'loss', color: 'bg-red-100 text-red-800' };
    return { result: 'draw', color: 'bg-gray-100 text-gray-800' };
  };

  const getEffectivenessColor = (effectiveness: number) => {
    if (effectiveness >= 80) return 'bg-green-100 text-green-800';
    if (effectiveness >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <PageTemplate 
      title="Position Performance Analysis" 
      subtitle="Compare quarter results with player positions - 5 different visualizations"
      breadcrumbs={[
        { label: 'Component Examples', href: '/component-examples' },
        { label: 'Recommendations' }
      ]}
    >
      <div className="space-y-8">
        
        {/* Display 1: Quarter-by-Quarter with Position Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Display 1: Quarter Performance with Position Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-4">
              {Object.entries(sampleQuarterScores).map(([quarter, scores]) => {
                const quarterData = samplePlayerPositions[quarter as keyof typeof samplePlayerPositions];
                const { result, color } = getScoreResult(scores.team, scores.opponent);
                
                return (
                  <div key={quarter} className="space-y-4">
                    <div className="text-center">
                      <h3 className="font-bold text-lg">Quarter {quarter}</h3>
                      <Badge className={`${color} text-lg px-3 py-1`}>
                        {scores.team} - {scores.opponent}
                      </Badge>
                      <p className="text-sm text-gray-600 capitalize">{result}</p>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      {Object.entries(quarterData).map(([position, data]) => (
                        <div key={position} className="relative">
                          <PlayerBox 
                            player={data.player}
                            size="compact"
                            showAvatar={false}
                          />
                          <div className="absolute top-0 right-0 flex gap-1">
                            <Badge variant="outline" className="text-xs">
                              {position}
                            </Badge>
                            {data.goals > 0 && (
                              <Badge className="bg-green-50 text-green-700 text-xs">
                                {data.goals}G
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Display 2: Player Focus with Quarter Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Display 2: Player-Centered Quarter Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {samplePlayers.map(player => {
                const playerQuarters = Object.entries(samplePlayerPositions).map(([quarter, positions]) => {
                  const playerPosition = Object.entries(positions).find(([, data]) => data.player.id === player.id);
                  return playerPosition ? {
                    quarter,
                    position: playerPosition[0],
                    data: playerPosition[1],
                    quarterScore: sampleQuarterScores[quarter as keyof typeof sampleQuarterScores]
                  } : null;
                }).filter(Boolean);

                return (
                  <div key={player.id} className="space-y-3">
                    <PlayerBox player={player} size="default" />
                    
                    <div className="space-y-2">
                      {playerQuarters.map(qData => {
                        if (!qData) return null;
                        const { result, color } = getScoreResult(qData.quarterScore.team, qData.quarterScore.opponent);
                        
                        return (
                          <div key={qData.quarter} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Q{qData.quarter}</span>
                              <Badge variant="outline" className="text-xs">{qData.position}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={`${color} text-xs`}>
                                {qData.quarterScore.team}-{qData.quarterScore.opponent}
                              </Badge>
                              {qData.data.goals > 0 && (
                                <Badge className="bg-green-50 text-green-700 text-xs">
                                  {qData.data.goals}G
                                </Badge>
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

        {/* Display 3: Court Layout with Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Display 3: Court Position Layout
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              {Object.entries(sampleQuarterScores).map(([quarter, scores]) => {
                const quarterData = samplePlayerPositions[quarter as keyof typeof samplePlayerPositions];
                const { result, color } = getScoreResult(scores.team, scores.opponent);
                
                return (
                  <div key={quarter} className="space-y-4">
                    <div className="text-center">
                      <h3 className="font-bold">Quarter {quarter}</h3>
                      <Badge className={`${color}`}>
                        {scores.team} - {scores.opponent} ({result})
                      </Badge>
                    </div>
                    
                    {/* Court layout */}
                    <div className="grid grid-cols-3 gap-2 bg-green-50 p-4 rounded-lg">
                      {/* Attack third */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-center">Attack</h4>
                        <div className="space-y-1">
                          <div className="relative">
                            <PlayerBox player={quarterData.GS.player} size="compact" showAvatar={false} />
                            <div className="absolute -top-1 -right-1">
                              <Badge variant="outline" className="text-xs">GS</Badge>
                            </div>
                            {quarterData.GS.goals > 0 && (
                              <div className="text-xs text-center text-green-600 font-bold">
                                {quarterData.GS.goals}G
                              </div>
                            )}
                          </div>
                          <div className="relative">
                            <PlayerBox player={quarterData.GA.player} size="compact" showAvatar={false} />
                            <div className="absolute -top-1 -right-1">
                              <Badge variant="outline" className="text-xs">GA</Badge>
                            </div>
                            {quarterData.GA.goals > 0 && (
                              <div className="text-xs text-center text-green-600 font-bold">
                                {quarterData.GA.goals}G
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Center third */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-center">Center</h4>
                        <div className="space-y-1">
                          <div className="relative">
                            <PlayerBox player={quarterData.WA.player} size="compact" showAvatar={false} />
                            <div className="absolute -top-1 -right-1">
                              <Badge variant="outline" className="text-xs">WA</Badge>
                            </div>
                          </div>
                          <div className="relative">
                            <PlayerBox player={quarterData.C.player} size="compact" showAvatar={false} />
                            <div className="absolute -top-1 -right-1">
                              <Badge variant="outline" className="text-xs">C</Badge>
                            </div>
                          </div>
                          <div className="relative">
                            <PlayerBox player={quarterData.WD.player} size="compact" showAvatar={false} />
                            <div className="absolute -top-1 -right-1">
                              <Badge variant="outline" className="text-xs">WD</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Defense third */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-center">Defense</h4>
                        <div className="space-y-1">
                          <div className="relative">
                            <PlayerBox player={quarterData.GD.player} size="compact" showAvatar={false} />
                            <div className="absolute -top-1 -right-1">
                              <Badge variant="outline" className="text-xs">GD</Badge>
                            </div>
                          </div>
                          <div className="relative">
                            <PlayerBox player={quarterData.GK.player} size="compact" showAvatar={false} />
                            <div className="absolute -top-1 -right-1">
                              <Badge variant="outline" className="text-xs">GK</Badge>
                            </div>
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

        {/* Display 4: Performance Matrix */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Grid3X3 className="h-5 w-5 text-orange-600" />
              Display 4: Performance Effectiveness Matrix
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-2 text-sm font-medium">
                <div className="text-center">Player</div>
                <div className="text-center">Q1</div>
                <div className="text-center">Q2</div>
                <div className="text-center">Q3</div>
                <div className="text-center">Q4</div>
              </div>
              
              {samplePlayers.map(player => {
                const playerQuarters = Object.entries(samplePlayerPositions).map(([quarter, positions]) => {
                  const playerPosition = Object.entries(positions).find(([, data]) => data.player.id === player.id);
                  return playerPosition ? {
                    quarter,
                    position: playerPosition[0],
                    effectiveness: playerPosition[1].effectiveness,
                    quarterScore: sampleQuarterScores[quarter as keyof typeof sampleQuarterScores]
                  } : null;
                }).filter(Boolean);

                return (
                  <div key={player.id} className="grid grid-cols-5 gap-2 items-center py-2 border-b">
                    <div>
                      <PlayerBox player={player} size="compact" showAvatar={false} />
                    </div>
                    
                    {playerQuarters.map(qData => {
                      if (!qData) return <div key="empty" className="text-center text-gray-400">-</div>;
                      
                      const { result, color } = getScoreResult(qData.quarterScore.team, qData.quarterScore.opponent);
                      
                      return (
                        <div key={qData.quarter} className="text-center space-y-1">
                          <Badge variant="outline" className="text-xs">
                            {qData.position}
                          </Badge>
                          <div className={`text-xs px-2 py-1 rounded ${getEffectivenessColor(qData.effectiveness)}`}>
                            {qData.effectiveness}%
                          </div>
                          <Badge className={`${color} text-xs`}>
                            {result}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Display 5: Summary Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-red-600" />
              Display 5: Coach's Summary Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Quarter Performance</h3>
                {Object.entries(sampleQuarterScores).map(([quarter, scores]) => {
                  const { result, color } = getScoreResult(scores.team, scores.opponent);
                  const margin = Math.abs(scores.team - scores.opponent);
                  
                  return (
                    <div key={quarter} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">Quarter {quarter}</span>
                        <Badge className={`${color} ml-2`}>
                          {scores.team} - {scores.opponent}
                        </Badge>
                      </div>
                      <div className="text-right text-sm">
                        <div className="capitalize font-medium">{result}</div>
                        <div className="text-gray-600">±{margin} margin</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Key Player Insights</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <PlayerBox player={samplePlayers[0]} size="compact" showAvatar={false} />
                      <Badge className="bg-green-100 text-green-800">MVP</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Strong performance in Q1 and Q3 with high shooting accuracy.
                      Most effective in Goal Shooter position.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-yellow-50 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <PlayerBox player={samplePlayers[1]} size="compact" showAvatar={false} />
                      <Badge className="bg-yellow-100 text-yellow-800">Variable</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Inconsistent performance - excellent in Q3-Q4 but struggled in Q2.
                      Consider consistent positioning.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 rounded">
                    <h4 className="font-medium mb-2">Strategic Recommendations</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Maintain Q3 lineup combination (highest effectiveness)</li>
                      <li>• Review Q2 defensive positioning</li>
                      <li>• Consider rotating shooters based on opponent pressure</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </PageTemplate>
  );
}
