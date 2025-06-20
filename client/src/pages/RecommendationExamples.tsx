
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageTemplate from '@/components/layout/PageTemplate';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trophy, TrendingUp, TrendingDown, Target, Users, BarChart3, Eye, Grid3X3, Activity, Zap, Clock, AlertTriangle } from 'lucide-react';
import PlayerBox from '@/components/ui/player-box';

// Sample data
const sampleQuarterScores = {
  1: { team: 8, opponent: 6 },
  2: { team: 5, opponent: 9 },
  3: { team: 12, opponent: 4 },
  4: { team: 7, opponent: 8 }
};

const samplePlayers = [
  { id: 1, displayName: "Sarah M", firstName: "Sarah", lastName: "Mitchell", active: true, avatarColor: "bg-green-600", positionPreferences: ["GS", "GA"] },
  { id: 2, displayName: "Emma K", firstName: "Emma", lastName: "Klein", active: true, avatarColor: "bg-blue-500", positionPreferences: ["C", "WA"] },
  { id: 3, displayName: "Chloe R", firstName: "Chloe", lastName: "Roberts", active: true, avatarColor: "bg-purple-500", positionPreferences: ["GK", "GD"] },
  { id: 4, displayName: "Jessica L", firstName: "Jessica", lastName: "Lee", active: true, avatarColor: "bg-orange-500", positionPreferences: ["WA", "C"] },
  { id: 5, displayName: "Amy T", firstName: "Amy", lastName: "Thompson", active: true, avatarColor: "bg-red-500", positionPreferences: ["WD", "GD"] },
  { id: 6, displayName: "Sophie W", firstName: "Sophie", lastName: "Williams", active: true, avatarColor: "bg-teal-500", positionPreferences: ["GK", "GD"] },
  { id: 7, displayName: "Hannah P", firstName: "Hannah", lastName: "Parker", active: true, avatarColor: "bg-pink-500", positionPreferences: ["GA", "GS"] }
];

const samplePlayerPositions = {
  1: {
    GS: { player: samplePlayers[0], goals: 6, missed: 2, effectiveness: 75, rating: 8.5 },
    GA: { player: samplePlayers[1], goals: 2, missed: 1, effectiveness: 67, rating: 7.2 },
    WA: { player: samplePlayers[2], goals: 0, missed: 0, effectiveness: 80, rating: 8.0 },
    C: { player: samplePlayers[3], goals: 0, missed: 0, effectiveness: 85, rating: 8.8 },
    WD: { player: samplePlayers[4], goals: 0, missed: 0, effectiveness: 78, rating: 7.8 },
    GD: { player: samplePlayers[5], goals: 0, missed: 0, effectiveness: 82, rating: 8.2 },
    GK: { player: samplePlayers[6], goals: 0, missed: 0, effectiveness: 90, rating: 9.0 }
  },
  2: {
    GS: { player: samplePlayers[1], goals: 3, missed: 3, effectiveness: 50, rating: 5.5 },
    GA: { player: samplePlayers[2], goals: 2, missed: 0, effectiveness: 100, rating: 9.2 },
    WA: { player: samplePlayers[3], goals: 0, missed: 0, effectiveness: 70, rating: 7.0 },
    C: { player: samplePlayers[4], goals: 0, missed: 0, effectiveness: 65, rating: 6.5 },
    WD: { player: samplePlayers[5], goals: 0, missed: 0, effectiveness: 60, rating: 6.0 },
    GD: { player: samplePlayers[6], goals: 0, missed: 0, effectiveness: 75, rating: 7.5 },
    GK: { player: samplePlayers[0], goals: 0, missed: 0, effectiveness: 70, rating: 7.0 }
  },
  3: {
    GS: { player: samplePlayers[0], goals: 8, missed: 1, effectiveness: 89, rating: 9.5 },
    GA: { player: samplePlayers[1], goals: 4, missed: 0, effectiveness: 100, rating: 9.8 },
    WA: { player: samplePlayers[2], goals: 0, missed: 0, effectiveness: 95, rating: 9.2 },
    C: { player: samplePlayers[3], goals: 0, missed: 0, effectiveness: 92, rating: 9.0 },
    WD: { player: samplePlayers[4], goals: 0, missed: 0, effectiveness: 88, rating: 8.8 },
    GD: { player: samplePlayers[5], goals: 0, missed: 0, effectiveness: 90, rating: 9.0 },
    GK: { player: samplePlayers[6], goals: 0, missed: 0, effectiveness: 95, rating: 9.3 }
  },
  4: {
    GS: { player: samplePlayers[1], goals: 4, missed: 2, effectiveness: 67, rating: 7.5 },
    GA: { player: samplePlayers[2], goals: 3, missed: 1, effectiveness: 75, rating: 7.8 },
    WA: { player: samplePlayers[3], goals: 0, missed: 0, effectiveness: 75, rating: 7.5 },
    C: { player: samplePlayers[4], goals: 0, missed: 0, effectiveness: 70, rating: 7.0 },
    WD: { player: samplePlayers[5], goals: 0, missed: 0, effectiveness: 72, rating: 7.2 },
    GD: { player: samplePlayers[6], goals: 0, missed: 0, effectiveness: 78, rating: 7.8 },
    GK: { player: samplePlayers[0], goals: 0, missed: 0, effectiveness: 80, rating: 8.0 }
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

  const getRatingColor = (rating: number) => {
    if (rating >= 8.5) return 'bg-emerald-500 text-white';
    if (rating >= 7.5) return 'bg-blue-500 text-white';
    if (rating >= 6.5) return 'bg-orange-500 text-white';
    return 'bg-red-500 text-white';
  };

  const getPositionBadgeStyle = (position: string) => {
    const baseStyle = "text-xs font-semibold px-2 py-1 rounded-md shadow-sm border";
    const positions = {
      'GS': 'bg-red-50 text-red-700 border-red-200',
      'GA': 'bg-orange-50 text-orange-700 border-orange-200',
      'WA': 'bg-amber-50 text-amber-700 border-amber-200',
      'C': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'WD': 'bg-cyan-50 text-cyan-700 border-cyan-200',
      'GD': 'bg-blue-50 text-blue-700 border-blue-200',
      'GK': 'bg-purple-50 text-purple-700 border-purple-200'
    };
    return `${baseStyle} ${positions[position as keyof typeof positions] || 'bg-gray-50 text-gray-700 border-gray-200'}`;
  };

  return (
    <PageTemplate 
      title="Position Performance Analysis" 
      subtitle="Compare quarter results with player positions - 11 different visualizations"
      breadcrumbs={[
        { label: 'Component Examples', href: '/component-examples' },
        { label: 'Recommendations' }
      ]}
    >
      <div className="space-y-8">

        {/* Display 1: Quarter-by-Quarter with Enhanced Position Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Display 1: Enhanced Quarter Performance with Position Analysis
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

                    <div className="space-y-3">
                      {Object.entries(quarterData).map(([position, data]) => (
                        <div key={position} className="relative p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className={getPositionBadgeStyle(position)}>
                              {position}
                            </div>
                            <div className="flex gap-1">
                              {data.goals > 0 && (
                                <Badge className="bg-green-500 text-white text-xs">
                                  {data.goals}G
                                </Badge>
                              )}
                              <Badge className={`text-xs ${getRatingColor(data.rating)}`}>
                                {data.rating}
                              </Badge>
                            </div>
                          </div>
                          <PlayerBox 
                            player={data.player}
                            size="sm"
                            showPositions={false}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Display 2: Performance Heat Map */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-red-600" />
              Display 2: Performance Heat Map by Position
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-8 gap-2 text-sm font-medium">
                <div className="text-center">Position</div>
                <div className="text-center">Q1</div>
                <div className="text-center">Q2</div>
                <div className="text-center">Q3</div>
                <div className="text-center">Q4</div>
                <div className="text-center">Avg</div>
                <div className="text-center">Trend</div>
                <div className="text-center">Best Q</div>
              </div>

              {['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'].map(position => {
                const quarterData = [1, 2, 3, 4].map(q => samplePlayerPositions[q as keyof typeof samplePlayerPositions][position as keyof typeof samplePlayerPositions[1]]);
                const avgRating = quarterData.reduce((sum, d) => sum + d.rating, 0) / 4;
                const bestQuarter = quarterData.reduce((best, curr, idx) => curr.rating > quarterData[best].rating ? idx : best, 0) + 1;
                const trend = quarterData[3].rating > quarterData[0].rating ? 'up' : quarterData[3].rating < quarterData[0].rating ? 'down' : 'stable';

                return (
                  <div key={position} className="grid grid-cols-8 gap-2 items-center py-2 border-b">
                    <div className={getPositionBadgeStyle(position)}>{position}</div>
                    
                    {quarterData.map((data, idx) => (
                      <div key={idx} className="text-center">
                        <div className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getRatingColor(data.rating)}`}>
                          {data.rating}
                        </div>
                      </div>
                    ))}

                    <div className="text-center">
                      <Badge className={getRatingColor(avgRating)} variant="outline">
                        {avgRating.toFixed(1)}
                      </Badge>
                    </div>

                    <div className="text-center">
                      {trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600 mx-auto" />}
                      {trend === 'down' && <TrendingDown className="h-4 w-4 text-red-600 mx-auto" />}
                      {trend === 'stable' && <div className="h-1 w-4 bg-gray-400 mx-auto rounded"></div>}
                    </div>

                    <div className="text-center">
                      <Badge variant="outline" className="text-xs">
                        Q{bestQuarter}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Display 3: Tactical Formation Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Display 3: Tactical Formation Effectiveness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {Object.entries(sampleQuarterScores).map(([quarter, scores]) => {
                const quarterData = samplePlayerPositions[quarter as keyof typeof samplePlayerPositions];
                const { result, color } = getScoreResult(scores.team, scores.opponent);
                const formationStrength = Object.values(quarterData).reduce((sum, d) => sum + d.effectiveness, 0) / 7;

                return (
                  <div key={quarter} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold">Quarter {quarter} Formation</h3>
                      <div className="flex gap-2">
                        <Badge className={color}>
                          {scores.team} - {scores.opponent}
                        </Badge>
                        <Badge className={getEffectivenessColor(formationStrength)}>
                          {formationStrength.toFixed(0)}% effective
                        </Badge>
                      </div>
                    </div>

                    {/* Court formation view */}
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="grid grid-cols-3 gap-4">
                        {/* Attack third */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-center text-green-700">Attack</h4>
                          {['GS', 'GA'].map(pos => {
                            const data = quarterData[pos as keyof typeof quarterData];
                            return (
                              <div key={pos} className="relative">
                                <PlayerBox player={data.player} size="sm" showPositions={false} />
                                <div className="absolute -top-2 -right-2 flex gap-1">
                                  <div className={getPositionBadgeStyle(pos)}>{pos}</div>
                                </div>
                                <div className="text-xs text-center mt-1">
                                  <Badge className={getEffectivenessColor(data.effectiveness)} size="sm">
                                    {data.effectiveness}%
                                  </Badge>
                                  {data.goals > 0 && (
                                    <Badge className="bg-green-500 text-white ml-1" size="sm">
                                      {data.goals}G
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Center third */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-center text-green-700">Center</h4>
                          {['WA', 'C', 'WD'].map(pos => {
                            const data = quarterData[pos as keyof typeof quarterData];
                            return (
                              <div key={pos} className="relative">
                                <PlayerBox player={data.player} size="sm" showPositions={false} />
                                <div className="absolute -top-2 -right-2">
                                  <div className={getPositionBadgeStyle(pos)}>{pos}</div>
                                </div>
                                <div className="text-xs text-center mt-1">
                                  <Badge className={getEffectivenessColor(data.effectiveness)} size="sm">
                                    {data.effectiveness}%
                                  </Badge>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Defense third */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-center text-green-700">Defense</h4>
                          {['GD', 'GK'].map(pos => {
                            const data = quarterData[pos as keyof typeof quarterData];
                            return (
                              <div key={pos} className="relative">
                                <PlayerBox player={data.player} size="sm" showPositions={false} />
                                <div className="absolute -top-2 -right-2">
                                  <div className={getPositionBadgeStyle(pos)}>{pos}</div>
                                </div>
                                <div className="text-xs text-center mt-1">
                                  <Badge className={getEffectivenessColor(data.effectiveness)} size="sm">
                                    {data.effectiveness}%
                                  </Badge>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Display 4: Performance Momentum Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              Display 4: Performance Momentum Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'].map(position => {
                const quarterData = [1, 2, 3, 4].map(q => samplePlayerPositions[q as keyof typeof samplePlayerPositions][position as keyof typeof samplePlayerPositions[1]]);
                const momentum = quarterData.map((data, idx) => {
                  if (idx === 0) return 0;
                  return data.rating - quarterData[idx - 1].rating;
                });

                return (
                  <div key={position} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={getPositionBadgeStyle(position)}>{position}</div>
                      <div className="text-sm text-gray-600">Quarter Performance Momentum</div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      {quarterData.map((data, idx) => {
                        const quarterScore = sampleQuarterScores[(idx + 1) as keyof typeof sampleQuarterScores];
                        const { result, color } = getScoreResult(quarterScore.team, quarterScore.opponent);
                        const momentumValue = momentum[idx];

                        return (
                          <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                            <div className="text-center mb-2">
                              <h4 className="font-medium">Q{idx + 1}</h4>
                              <Badge className={color} size="sm">
                                {quarterScore.team}-{quarterScore.opponent}
                              </Badge>
                            </div>

                            <PlayerBox player={data.player} size="sm" showPositions={false} />

                            <div className="mt-2 space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>Rating:</span>
                                <Badge className={getRatingColor(data.rating)} size="sm">
                                  {data.rating}
                                </Badge>
                              </div>
                              {idx > 0 && (
                                <div className="flex justify-between text-xs">
                                  <span>Change:</span>
                                  <div className={`inline-flex items-center gap-1 ${momentumValue > 0 ? 'text-green-600' : momentumValue < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                    {momentumValue > 0 && <TrendingUp className="h-3 w-3" />}
                                    {momentumValue < 0 && <TrendingDown className="h-3 w-3" />}
                                    {momentumValue === 0 && <div className="h-1 w-3 bg-gray-400 rounded"></div>}
                                    <span>{momentumValue > 0 ? '+' : ''}{momentumValue.toFixed(1)}</span>
                                  </div>
                                </div>
                              )}
                              <div className="flex justify-between text-xs">
                                <span>Effective:</span>
                                <Badge className={getEffectivenessColor(data.effectiveness)} size="sm">
                                  {data.effectiveness}%
                                </Badge>
                              </div>
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

        {/* Display 5: Critical Moments Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Display 5: Critical Moments & Player Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {Object.entries(sampleQuarterScores).map(([quarter, scores]) => {
                const quarterData = samplePlayerPositions[quarter as keyof typeof samplePlayerPositions];
                const { result, color } = getScoreResult(scores.team, scores.opponent);
                const margin = Math.abs(scores.team - scores.opponent);
                const isCloseGame = margin <= 3;
                const isWinningQuarter = scores.team > scores.opponent;

                // Identify key performers
                const topPerformer = Object.entries(quarterData).reduce((best, [pos, data]) => 
                  data.rating > best.rating ? { position: pos, ...data } : best, 
                  { position: '', rating: 0, player: samplePlayers[0], effectiveness: 0, goals: 0 }
                );

                const attackEffectiveness = quarterData.GS.effectiveness + quarterData.GA.effectiveness;
                const defenseEffectiveness = quarterData.GK.effectiveness + quarterData.GD.effectiveness;

                return (
                  <div key={quarter} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold">Quarter {quarter}</h3>
                        <div className="flex gap-2 mt-1">
                          <Badge className={color}>
                            {scores.team} - {scores.opponent}
                          </Badge>
                          {isCloseGame && (
                            <Badge variant="outline" className="text-orange-600 border-orange-300">
                              Close Game
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Margin: {margin}</div>
                        <div className={`text-sm font-medium ${isWinningQuarter ? 'text-green-600' : 'text-red-600'}`}>
                          {isWinningQuarter ? 'Won Quarter' : 'Lost Quarter'}
                        </div>
                      </div>
                    </div>

                    {/* Key performer */}
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-yellow-800">Quarter MVP</span>
                        <div className={getPositionBadgeStyle(topPerformer.position)}>
                          {topPerformer.position}
                        </div>
                      </div>
                      <PlayerBox player={topPerformer.player} size="sm" showPositions={false} />
                      <div className="mt-2 flex justify-between text-xs">
                        <span>Rating: {topPerformer.rating}</span>
                        <span>Effectiveness: {topPerformer.effectiveness}%</span>
                        {topPerformer.goals > 0 && <span>Goals: {topPerformer.goals}</span>}
                      </div>
                    </div>

                    {/* Attack vs Defense breakdown */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-red-50 rounded-lg">
                        <h4 className="text-sm font-semibold text-red-700 mb-2">Attack Unit</h4>
                        <div className="space-y-2">
                          {['GS', 'GA'].map(pos => {
                            const data = quarterData[pos as keyof typeof quarterData];
                            return (
                              <div key={pos} className="flex items-center gap-2">
                                <div className={getPositionBadgeStyle(pos)}>{pos}</div>
                                <PlayerBox player={data.player} size="xs" showPositions={false} />
                                <div className="flex-1 text-right">
                                  <Badge className={getRatingColor(data.rating)} size="sm">
                                    {data.rating}
                                  </Badge>
                                  {data.goals > 0 && (
                                    <Badge className="bg-green-500 text-white ml-1" size="sm">
                                      {data.goals}G
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                          <div className="text-xs text-red-700 font-medium">
                            Combined: {(attackEffectiveness / 2).toFixed(0)}% effective
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-blue-50 rounded-lg">
                        <h4 className="text-sm font-semibold text-blue-700 mb-2">Defense Unit</h4>
                        <div className="space-y-2">
                          {['GD', 'GK'].map(pos => {
                            const data = quarterData[pos as keyof typeof quarterData];
                            return (
                              <div key={pos} className="flex items-center gap-2">
                                <div className={getPositionBadgeStyle(pos)}>{pos}</div>
                                <PlayerBox player={data.player} size="xs" showPositions={false} />
                                <div className="flex-1 text-right">
                                  <Badge className={getRatingColor(data.rating)} size="sm">
                                    {data.rating}
                                  </Badge>
                                </div>
                              </div>
                            );
                          })}
                          <div className="text-xs text-blue-700 font-medium">
                            Combined: {(defenseEffectiveness / 2).toFixed(0)}% effective
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

        {/* Display 6: Performance Comparison Matrix */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Grid3X3 className="h-5 w-5 text-purple-600" />
              Display 6: Cross-Quarter Performance Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
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

                const avgRating = playerQuarters.reduce((sum, qData) => sum + (qData?.data.rating || 0), 0) / playerQuarters.length;
                const bestQuarter = playerQuarters.reduce((best, curr, idx) => 
                  (curr?.data.rating || 0) > (playerQuarters[best]?.data.rating || 0) ? idx : best, 0
                );

                return (
                  <div key={player.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <PlayerBox player={player} size="md" showPositions={false} />
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Average Rating</div>
                        <Badge className={getRatingColor(avgRating)}>
                          {avgRating.toFixed(1)}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      {playerQuarters.map((qData, idx) => {
                        if (!qData) return null;
                        const { result, color } = getScoreResult(qData.quarterScore.team, qData.quarterScore.opponent);
                        const isBestQuarter = idx === bestQuarter;

                        return (
                          <div key={qData.quarter} className={`p-2 rounded border ${isBestQuarter ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-white'}`}>
                            <div className="text-center mb-2">
                              <h4 className="text-sm font-medium">Q{qData.quarter}</h4>
                              {isBestQuarter && (
                                <Badge className="bg-yellow-500 text-white" size="sm">
                                  <Trophy className="h-3 w-3 mr-1" />
                                  Best
                                </Badge>
                              )}
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>Position:</span>
                                <div className={getPositionBadgeStyle(qData.position)}>
                                  {qData.position}
                                </div>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span>Rating:</span>
                                <Badge className={getRatingColor(qData.data.rating)} size="sm">
                                  {qData.data.rating}
                                </Badge>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span>Result:</span>
                                <Badge className={color} size="sm">
                                  {result}
                                </Badge>
                              </div>
                              {qData.data.goals > 0 && (
                                <div className="flex justify-between text-xs">
                                  <span>Goals:</span>
                                  <Badge className="bg-green-500 text-white" size="sm">
                                    {qData.data.goals}
                                  </Badge>
                                </div>
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

        {/* Display 7: Performance Risk Assessment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Display 7: Performance Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {Object.entries(sampleQuarterScores).map(([quarter, scores]) => {
                const quarterData = samplePlayerPositions[quarter as keyof typeof samplePlayerPositions];
                const { result, color } = getScoreResult(scores.team, scores.opponent);
                
                // Risk analysis
                const lowPerformers = Object.entries(quarterData).filter(([, data]) => data.rating < 7.0);
                const riskLevel = lowPerformers.length >= 3 ? 'high' : lowPerformers.length >= 2 ? 'medium' : 'low';
                const riskColors = {
                  high: 'bg-red-100 text-red-800 border-red-300',
                  medium: 'bg-orange-100 text-orange-800 border-orange-300',
                  low: 'bg-green-100 text-green-800 border-green-300'
                };

                return (
                  <div key={quarter} className={`p-4 rounded-lg border-2 ${riskColors[riskLevel]}`}>
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h3 className="font-bold">Quarter {quarter} Risk Analysis</h3>
                        <Badge className={color}>
                          {scores.team} - {scores.opponent} ({result})
                        </Badge>
                      </div>
                      <Badge className={`${riskColors[riskLevel]} font-semibold`}>
                        {riskLevel.toUpperCase()} RISK
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Position Analysis:</h4>
                      {Object.entries(quarterData).map(([position, data]) => {
                        const isRisk = data.rating < 7.0;
                        const isCritical = data.rating < 6.0;
                        
                        return (
                          <div key={position} className={`flex items-center justify-between p-2 rounded ${isRisk ? (isCritical ? 'bg-red-50' : 'bg-orange-50') : 'bg-white'}`}>
                            <div className="flex items-center gap-2">
                              <div className={getPositionBadgeStyle(position)}>
                                {position}
                              </div>
                              <PlayerBox player={data.player} size="xs" showPositions={false} />
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge className={getRatingColor(data.rating)} size="sm">
                                {data.rating}
                              </Badge>
                              {isRisk && (
                                <AlertTriangle className={`h-4 w-4 ${isCritical ? 'text-red-500' : 'text-orange-500'}`} />
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {lowPerformers.length > 0 && (
                        <div className="mt-3 p-2 bg-white rounded text-sm">
                          <span className="font-medium">Recommendations:</span>
                          <ul className="mt-1 text-xs space-y-1">
                            {riskLevel === 'high' && (
                              <li>• Consider multiple substitutions for next quarter</li>
                            )}
                            {riskLevel === 'medium' && (
                              <li>• Monitor closely and prepare substitutions</li>
                            )}
                            <li>• Focus coaching on {lowPerformers.map(([pos]) => pos).join(', ')} positions</li>
                            <li>• Review tactical approach for weak areas</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

      </div>
    </PageTemplate>
  );
}
