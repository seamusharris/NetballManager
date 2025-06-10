
import React from 'react';
import { Helmet } from 'react-helmet';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function TournamentBracketExamples() {
  return (
    <PageTemplate
      title="Tournament Bracket Examples"
      subtitle="Playoff visualization and tournament management interfaces"
      breadcrumbs={[
        { label: 'Component Examples', href: '/component-examples' },
        { label: 'Tournament Bracket Examples' }
      ]}
    >
      <Helmet>
        <title>Tournament Bracket Examples | Team Manager</title>
      </Helmet>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Single Elimination Bracket</h2>
          <Card>
            <CardHeader>
              <CardTitle>Finals Series</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 items-center">
                {/* Quarter Finals */}
                <div className="space-y-4">
                  <div className="border rounded-lg p-3">
                    <div className="text-sm font-medium">QF1</div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>WNC Dingoes</span>
                        <Badge variant="secondary">45</Badge>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Deep Creek</span>
                        <span>38</span>
                      </div>
                    </div>
                  </div>
                  <div className="border rounded-lg p-3">
                    <div className="text-sm font-medium">QF2</div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>WNC Emus</span>
                        <Badge variant="secondary">52</Badge>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Doncaster</span>
                        <span>41</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Semi Finals */}
                <div className="space-y-8">
                  <div className="border rounded-lg p-3">
                    <div className="text-sm font-medium">SF1</div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>WNC Dingoes</span>
                        <Badge variant="secondary">43</Badge>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>WNC Emus</span>
                        <span>47</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Final */}
                <div className="flex justify-center">
                  <div className="border rounded-lg p-3 bg-yellow-50">
                    <div className="text-sm font-medium text-yellow-800">Final</div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>WNC Emus</span>
                        <Badge className="bg-yellow-600">55</Badge>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>TBD</span>
                        <span>-</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Champion */}
                <div className="flex justify-center">
                  <div className="border-2 border-yellow-400 rounded-lg p-3 bg-yellow-100">
                    <div className="text-sm font-medium text-yellow-800">Champion</div>
                    <div className="text-lg font-bold text-yellow-900">TBD</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Round Robin Tournament</h2>
          <Card>
            <CardHeader>
              <CardTitle>Group Stage Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Team</th>
                      <th className="text-center p-2">P</th>
                      <th className="text-center p-2">W</th>
                      <th className="text-center p-2">L</th>
                      <th className="text-center p-2">GF</th>
                      <th className="text-center p-2">GA</th>
                      <th className="text-center p-2">GD</th>
                      <th className="text-center p-2">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b bg-green-50">
                      <td className="p-2 font-medium">WNC Emus</td>
                      <td className="text-center p-2">6</td>
                      <td className="text-center p-2">5</td>
                      <td className="text-center p-2">1</td>
                      <td className="text-center p-2">315</td>
                      <td className="text-center p-2">268</td>
                      <td className="text-center p-2">+47</td>
                      <td className="text-center p-2 font-bold">15</td>
                    </tr>
                    <tr className="border-b bg-blue-50">
                      <td className="p-2 font-medium">WNC Dingoes</td>
                      <td className="text-center p-2">6</td>
                      <td className="text-center p-2">4</td>
                      <td className="text-center p-2">2</td>
                      <td className="text-center p-2">298</td>
                      <td className="text-center p-2">245</td>
                      <td className="text-center p-2">+53</td>
                      <td className="text-center p-2 font-bold">12</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Deep Creek</td>
                      <td className="text-center p-2">6</td>
                      <td className="text-center p-2">3</td>
                      <td className="text-center p-2">3</td>
                      <td className="text-center p-2">287</td>
                      <td className="text-center p-2">289</td>
                      <td className="text-center p-2">-2</td>
                      <td className="text-center p-2">9</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Doncaster</td>
                      <td className="text-center p-2">6</td>
                      <td className="text-center p-2">0</td>
                      <td className="text-center p-2">6</td>
                      <td className="text-center p-2">201</td>
                      <td className="text-center p-2">299</td>
                      <td className="text-center p-2">-98</td>
                      <td className="text-center p-2">0</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </PageTemplate>
  );
}
