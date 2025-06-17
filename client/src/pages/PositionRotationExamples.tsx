
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, RotateCcw } from 'lucide-react';

export default function PositionRotationExamples() {
  const [currentQuarter, setCurrentQuarter] = useState(1);

  const positions = ['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'];
  const players = ['Abbey N', 'Abby D', 'Ava', 'Emily', 'Erin', 'Evie', 'Jess'];

  const quarterRotations = {
    1: { GS: 'Abbey N', GA: 'Abby D', WA: 'Ava', C: 'Emily', WD: 'Erin', GD: 'Evie', GK: 'Jess' },
    2: { GS: 'Abby D', GA: 'Abbey N', WA: 'Emily', C: 'Ava', WD: 'Evie', GD: 'Erin', GK: 'Jess' },
    3: { GS: 'Abbey N', GA: 'Ava', WA: 'Abby D', C: 'Erin', WD: 'Emily', GD: 'Evie', GK: 'Jess' },
    4: { GS: 'Ava', GA: 'Abbey N', WA: 'Abby D', C: 'Emily', WD: 'Erin', GD: 'Evie', GK: 'Jess' }
  };

  return (
    <PageTemplate
      title="Position Rotation Examples"
      subtitle="Visual position switching guides and rotation patterns"
      breadcrumbs={[
        { label: 'Component Examples', href: '/component-examples' },
        { label: 'Position Rotation Examples' }
      ]}
    >
      <Helmet>
        <title>Position Rotation Examples | Team Manager</title>
      </Helmet>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Quarter-by-Quarter Rotations</h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Game Rotation Plan</span>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4].map(quarter => (
                    <Button
                      key={quarter}
                      size="sm"
                      variant={currentQuarter === quarter ? "default" : "outline"}
                      onClick={() => setCurrentQuarter(quarter)}
                    >
                      Q{quarter}
                    </Button>
                  ))}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-4 mb-6">
                {positions.map(position => (
                  <div key={position} className="text-center">
                    <div className="bg-blue-100 rounded-lg p-4 mb-2">
                      <div className="font-bold text-blue-800">{position}</div>
                    </div>
                    <div className="text-sm font-medium">
                      {quarterRotations[currentQuarter][position]}
                    </div>
                  </div>
                ))}
              </div>

              {currentQuarter < 4 && (
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuarter(currentQuarter + 1)}
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Next Quarter
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Position Change Tracker</h2>
          <Card>
            <CardHeader>
              <CardTitle>Player Movement Between Quarters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Badge>Abbey N</Badge>
                    <span className="text-sm">GS</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">GA</Badge>
                    <span className="text-sm text-gray-600">Q2</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">GS</Badge>
                    <span className="text-sm text-gray-600">Q3</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Badge>Ava</Badge>
                    <span className="text-sm">WA</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">C</Badge>
                    <span className="text-sm text-gray-600">Q2</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">WA</Badge>
                    <span className="text-sm text-gray-600">Q3</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Badge>Emily</Badge>
                    <span className="text-sm">C</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">WA</Badge>
                    <span className="text-sm text-gray-600">Q2</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">WD</Badge>
                    <span className="text-sm text-gray-600">Q3</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Substitution Patterns</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Attacking Rotation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                    <span className="font-medium">GS ↔ GA</span>
                    <Badge variant="outline">Every 2Q</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                    <span className="font-medium">GA ↔ WA</span>
                    <Badge variant="outline">Mid-game</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                    <span className="font-medium">WA ↔ C</span>
                    <Badge variant="outline">As needed</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Defensive Rotation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                    <span className="font-medium">GK ↔ GD</span>
                    <Badge variant="outline">Rare</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="font-medium">GD ↔ WD</span>
                    <Badge variant="outline">Q3 Only</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                    <span className="font-medium">WD ↔ C</span>
                    <Badge variant="outline">Common</Badge>
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
