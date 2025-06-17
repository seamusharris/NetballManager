
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRightLeft, Clock, Users, AlertTriangle } from 'lucide-react';

export default function SubstitutionFlowExamples() {
  const [activeTab, setActiveTab] = useState('current');

  const onCourtPlayers = [
    { position: 'GS', player: 'Abbey N', timeOn: 45 },
    { position: 'GA', player: 'Abby D', timeOn: 30 },
    { position: 'WA', player: 'Ava', timeOn: 45 },
    { position: 'C', player: 'Emily', timeOn: 15 },
    { position: 'WD', player: 'Erin', timeOn: 35 },
    { position: 'GD', player: 'Evie', timeOn: 45 },
    { position: 'GK', player: 'Jess', timeOn: 45 },
  ];

  const benchPlayers = [
    { player: 'Sophie', preferredPositions: ['GA', 'WA'], restTime: 20 },
    { player: 'Grace', preferredPositions: ['C', 'WD'], restTime: 30 },
    { player: 'Maya', preferredPositions: ['GD', 'GK'], restTime: 15 },
  ];

  return (
    <PageTemplate
      title="Substitution Flow Examples"
      subtitle="Bench management interfaces and player rotation tools"
      breadcrumbs={[
        { label: 'Component Examples', href: '/component-examples' },
        { label: 'Substitution Flow Examples' }
      ]}
    >
      <Helmet>
        <title>Substitution Flow Examples | Team Manager</title>
      </Helmet>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Live Substitution Interface</h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Quarter 3 - 8:30 remaining</span>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant={activeTab === 'current' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('current')}
                  >
                    On Court
                  </Button>
                  <Button
                    size="sm"
                    variant={activeTab === 'bench' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('bench')}
                  >
                    Bench
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeTab === 'current' && (
                <div className="space-y-4">
                  {onCourtPlayers.map((player, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge className="w-12 text-center">{player.position}</Badge>
                        <span className="font-medium">{player.player}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{player.timeOn}min</span>
                        </div>
                        {player.timeOn > 40 && (
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                        )}
                        <Button size="sm" variant="outline">
                          <ArrowRightLeft className="w-4 h-4 mr-1" />
                          Sub
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'bench' && (
                <div className="space-y-4">
                  {benchPlayers.map((player, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Users className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">{player.player}</span>
                        <div className="flex space-x-1">
                          {player.preferredPositions.map(pos => (
                            <Badge key={pos} variant="outline" className="text-xs">
                              {pos}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{player.restTime}min rest</span>
                        </div>
                        <Button size="sm" className="bg-blue-600">
                          Sub In
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Substitution History</h2>
          <Card>
            <CardHeader>
              <CardTitle>Game Substitutions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline">Q1 - 8:45</Badge>
                    <span className="text-sm">Emily</span>
                    <ArrowRightLeft className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">Grace</span>
                    <Badge>C</Badge>
                  </div>
                  <span className="text-sm text-gray-600">Tactical</span>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline">Q2 - 12:30</Badge>
                    <span className="text-sm">Ava</span>
                    <ArrowRightLeft className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">Sophie</span>
                    <Badge>WA</Badge>
                  </div>
                  <span className="text-sm text-gray-600">Rest</span>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline">Q3 - 5:15</Badge>
                    <span className="text-sm">Grace</span>
                    <ArrowRightLeft className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">Emily</span>
                    <Badge>C</Badge>
                  </div>
                  <span className="text-sm text-gray-600">Performance</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Planned Rotations</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quarter 4 Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                    <span className="text-sm">10:00 - Fresh legs in center</span>
                    <Badge variant="outline">Emily → Grace</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-sm">7:00 - Defensive change</span>
                    <Badge variant="outline">Evie → Maya</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                    <span className="text-sm">3:00 - Closing team</span>
                    <Badge variant="outline">Multiple</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Substitution Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Maximum 2 subs per quarter break</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Player must be off court for 1 full quarter</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Injury substitutions allowed anytime</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Must notify officials before play</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </PageTemplate>
  );
}
