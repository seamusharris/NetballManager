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

export default function RecommendationExamples() {
  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  return (
    <PageTemplate title="Recommendation Examples">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Game Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-2">Quarter-by-Quarter Breakdown</h4>
                <div className="space-y-2">
                  {Object.entries(sampleQuarterScores).map(([quarter, scores]) => (
                    <div key={quarter} className="flex justify-between items-center p-2 rounded bg-gray-50">
                      <span>Q{quarter}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-50">
                          {scores.team} - {scores.opponent}
                        </Badge>
                        {getTrendIcon(scores.team, scores.opponent)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Key Performance Indicators</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Score</span>
                    <Badge className="bg-green-100 text-green-800">32 - 27</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Shooting Accuracy</span>
                    <Badge className="bg-blue-100 text-blue-800">76%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Strongest Quarter</span>
                    <Badge className="bg-purple-100 text-purple-800">Q3 (+8)</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Position Analysis by Quarter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {Object.entries(samplePlayerPositions).map(([quarter, positions]) => (
                <div key={quarter} className="space-y-3">
                  <h4 className="font-semibold text-center">Quarter {quarter}</h4>
                  <Separator />
                  <div className="space-y-2">
                    {Object.entries(positions).map(([position, player]) => (
                      <div key={position} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {position}
                          </Badge>
                          <span>{player.name}</span>
                        </div>
                        {player.goals > 0 && (
                          <Badge className="bg-green-50 text-green-700 text-xs">
                            {player.goals}G
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tactical Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-green-700 mb-2">Strengths</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Strong Q3 performance (+8 margin)</li>
                  <li>• Effective shooting combination</li>
                  <li>• Good position rotations</li>
                </ul>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-amber-700 mb-2">Areas for Improvement</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Q2 defensive pressure</li>
                  <li>• Shooting accuracy in Q4</li>
                  <li>• Transition defense</li>
                </ul>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-blue-700 mb-2">Next Game Focus</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Maintain Q3 intensity</li>
                  <li>• Practice Q2 scenarios</li>
                  <li>• Review shooting technique</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
}