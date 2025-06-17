
import React from 'react';
import { Helmet } from 'react-helmet';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function TeamFormationExamples() {
  return (
    <PageTemplate
      title="Team Formation Examples"
      subtitle="Different tactical setups and formation patterns"
      breadcrumbs={[
        { label: 'Component Examples', href: '/component-examples' },
        { label: 'Team Formation Examples' }
      ]}
    >
      <Helmet>
        <title>Team Formation Examples | Team Manager</title>
      </Helmet>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Standard Formation</h2>
          <Card>
            <CardHeader>
              <CardTitle>7-Player Court Layout</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-green-100 p-6 rounded-lg">
                <div className="grid grid-cols-3 gap-4 h-64">
                  {/* Goal Circle 1 */}
                  <div className="flex flex-col justify-between">
                    <div className="bg-red-200 rounded-full p-3 text-center">
                      <div className="font-bold">GS</div>
                      <div className="text-sm">Abbey N</div>
                    </div>
                    <div className="bg-orange-200 rounded-full p-3 text-center">
                      <div className="font-bold">GA</div>
                      <div className="text-sm">Abby D</div>
                    </div>
                  </div>
                  
                  {/* Center Court */}
                  <div className="flex flex-col justify-center space-y-4">
                    <div className="bg-yellow-200 rounded-full p-3 text-center">
                      <div className="font-bold">WA</div>
                      <div className="text-sm">Ava</div>
                    </div>
                    <div className="bg-blue-200 rounded-full p-3 text-center">
                      <div className="font-bold">C</div>
                      <div className="text-sm">Emily</div>
                    </div>
                    <div className="bg-green-200 rounded-full p-3 text-center">
                      <div className="font-bold">WD</div>
                      <div className="text-sm">Erin</div>
                    </div>
                  </div>
                  
                  {/* Goal Circle 2 */}
                  <div className="flex flex-col justify-between">
                    <div className="bg-teal-200 rounded-full p-3 text-center">
                      <div className="font-bold">GD</div>
                      <div className="text-sm">Evie</div>
                    </div>
                    <div className="bg-purple-200 rounded-full p-3 text-center">
                      <div className="font-bold">GK</div>
                      <div className="text-sm">Jess</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Formation Strategies</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Attacking Formation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded">
                    <span className="font-medium">High Goal Shooter</span>
                    <Badge className="bg-red-600">Abbey N</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded">
                    <span className="font-medium">Mobile Goal Attack</span>
                    <Badge className="bg-orange-600">Abby D</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded">
                    <span className="font-medium">Fast Wing Attack</span>
                    <Badge className="bg-yellow-600">Ava</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-4">
                    Focused on quick ball movement and creating scoring opportunities through the circle.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Defensive Formation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded">
                    <span className="font-medium">Strong Goal Keeper</span>
                    <Badge className="bg-purple-600">Jess</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-teal-50 rounded">
                    <span className="font-medium">Intercepting GD</span>
                    <Badge className="bg-teal-600">Evie</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                    <span className="font-medium">Pressure Wing Defense</span>
                    <Badge className="bg-green-600">Erin</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-4">
                    Built around strong defensive pressure and creating turnovers.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Player Combinations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Shooting Circle</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-red-600">GS</Badge>
                    <span className="text-sm">Abbey N - Height advantage</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-orange-600">GA</Badge>
                    <span className="text-sm">Abby D - Mobile shooter</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Complementary shooting styles for varied attack options.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Center Court</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-yellow-600">WA</Badge>
                    <span className="text-sm">Ava - Ball delivery</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-blue-600">C</Badge>
                    <span className="text-sm">Emily - Playmaker</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-600">WD</Badge>
                    <span className="text-sm">Erin - Defensive link</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Strong communication and ball movement through center.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Defensive Circle</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-teal-600">GD</Badge>
                    <span className="text-sm">Evie - Intercepts</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-purple-600">GK</Badge>
                    <span className="text-sm">Jess - Shot blocking</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Solid defensive partnership with good court coverage.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </PageTemplate>
  );
}
