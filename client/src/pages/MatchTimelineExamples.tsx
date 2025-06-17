
import React from 'react';
import { Helmet } from 'react-helmet';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Target, Users, AlertTriangle } from 'lucide-react';

export default function MatchTimelineExamples() {
  return (
    <PageTemplate
      title="Match Timeline Examples"
      subtitle="Quarter-by-quarter game flow and event tracking"
      breadcrumbs={[
        { label: 'Component Examples', href: '/component-examples' },
        { label: 'Match Timeline Examples' }
      ]}
    >
      <Helmet>
        <title>Match Timeline Examples | Team Manager</title>
      </Helmet>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Game Timeline</h2>
          <Card>
            <CardHeader>
              <CardTitle>WNC Dingoes vs Deep Creek - Round 12</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Quarter 1 */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-20 text-center">
                    <Badge variant="outline" className="w-full">Q1</Badge>
                    <div className="text-xs text-gray-500 mt-1">15 min</div>
                  </div>
                  <div className="flex-1 border-l-2 border-blue-200 pl-4 pb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Strong start</span>
                      <div className="flex space-x-2">
                        <Badge className="bg-red-600">15</Badge>
                        <Badge variant="outline">12</Badge>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4" />
                        <span>Abbey N: 6 goals from GS</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>Emily: 3 intercepts from GD</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quarter 2 */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-20 text-center">
                    <Badge variant="outline" className="w-full">Q2</Badge>
                    <div className="text-xs text-gray-500 mt-1">15 min</div>
                  </div>
                  <div className="flex-1 border-l-2 border-orange-200 pl-4 pb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Challenging quarter</span>
                      <div className="flex space-x-2">
                        <Badge className="bg-red-600">27</Badge>
                        <Badge variant="outline">28</Badge>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <span>Substitution: Ava in for Evie (WD)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4" />
                        <span>Opponent dominated center court</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quarter 3 */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-20 text-center">
                    <Badge variant="outline" className="w-full">Q3</Badge>
                    <div className="text-xs text-gray-500 mt-1">15 min</div>
                  </div>
                  <div className="flex-1 border-l-2 border-green-200 pl-4 pb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Comeback quarter</span>
                      <div className="flex space-x-2">
                        <Badge className="bg-red-600">43</Badge>
                        <Badge variant="outline">39</Badge>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4" />
                        <span>Perfect shooting quarter: 16/16</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>Erin: 4 center pass intercepts</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quarter 4 */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-20 text-center">
                    <Badge variant="outline" className="w-full">Q4</Badge>
                    <div className="text-xs text-gray-500 mt-1">15 min</div>
                  </div>
                  <div className="flex-1 border-l-2 border-blue-200 pl-4 pb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Sealed the win</span>
                      <div className="flex space-x-2">
                        <Badge className="bg-red-600">58</Badge>
                        <Badge variant="outline">51</Badge>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4" />
                        <span>Consistent pressure maintained</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>No turnovers in final 5 minutes</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Score Progression</h2>
          <Card>
            <CardHeader>
              <CardTitle>Quarter-by-Quarter Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">15-12</div>
                  <div className="text-sm text-gray-600">Quarter 1</div>
                  <div className="text-xs text-green-600 mt-1">+3 lead</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">27-28</div>
                  <div className="text-sm text-gray-600">Quarter 2</div>
                  <div className="text-xs text-red-600 mt-1">-1 behind</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">43-39</div>
                  <div className="text-sm text-gray-600">Quarter 3</div>
                  <div className="text-xs text-green-600 mt-1">+4 lead</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">58-51</div>
                  <div className="text-sm text-gray-600">Final</div>
                  <div className="text-xs text-green-600 mt-1">+7 win</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </PageTemplate>
  );
}
