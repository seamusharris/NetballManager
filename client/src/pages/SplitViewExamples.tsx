
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Eye, BarChart3 } from 'lucide-react';

export default function SplitViewExamples() {
  const [selectedPlayer, setSelectedPlayer] = useState(0);

  const players = [
    { id: 1, name: 'Abbey N', position: 'GS', games: 12 },
    { id: 2, name: 'Emily', position: 'GD', games: 11 },
    { id: 3, name: 'Ava', position: 'WA', games: 10 },
  ];

  return (
    <PageTemplate
      title="Split View Examples"
      subtitle="Master-detail layouts and sidebar patterns"
      breadcrumbs={[
        { label: 'Component Examples', href: '/component-examples' },
        { label: 'Split View Examples' }
      ]}
    >
      <Helmet>
        <title>Split View Examples | Team Manager</title>
      </Helmet>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Player Master-Detail</h2>
          <Card>
            <CardContent className="p-0">
              <div className="flex h-96">
                {/* Master List */}
                <div className="w-1/3 border-r bg-gray-50 p-4">
                  <h3 className="font-semibold mb-4">Team Players</h3>
                  <div className="space-y-2">
                    {players.map((player, index) => (
                      <button
                        key={player.id}
                        onClick={() => setSelectedPlayer(index)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedPlayer === index
                            ? 'bg-blue-100 border-blue-300'
                            : 'bg-white hover:bg-gray-100'
                        }`}
                      >
                        <div className="font-medium">{player.name}</div>
                        <div className="text-sm text-gray-600">{player.position} • {player.games} games</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Detail View */}
                <div className="flex-1 p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {players[selectedPlayer].name.substring(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{players[selectedPlayer].name}</h3>
                      <p className="text-gray-600">{players[selectedPlayer].position} Position</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{players[selectedPlayer].games}</div>
                      <div className="text-sm text-gray-600">Games Played</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">4.2</div>
                      <div className="text-sm text-gray-600">Avg Rating</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">87%</div>
                      <div className="text-sm text-gray-600">Availability</div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button size="sm" variant="outline">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Statistics
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Sidebar Navigation Layout</h2>
          <Card>
            <CardContent className="p-0">
              <div className="flex h-64">
                <div className="w-48 bg-gray-900 text-white p-4">
                  <h3 className="font-semibold mb-4">Navigation</h3>
                  <nav className="space-y-2">
                    <a href="#" className="block py-2 px-3 rounded bg-blue-600">Dashboard</a>
                    <a href="#" className="block py-2 px-3 rounded hover:bg-gray-700">Players</a>
                    <a href="#" className="block py-2 px-3 rounded hover:bg-gray-700">Games</a>
                    <a href="#" className="block py-2 px-3 rounded hover:bg-gray-700">Statistics</a>
                  </nav>
                </div>
                <div className="flex-1 p-6 bg-gray-50">
                  <h3 className="text-xl font-bold mb-4">Main Content Area</h3>
                  <p className="text-gray-600">This is where the main application content would be displayed.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </PageTemplate>
  );
}
