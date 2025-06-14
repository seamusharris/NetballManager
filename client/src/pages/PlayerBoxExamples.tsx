
import React from 'react';
import { Helmet } from 'react-helmet';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { PlayerBox } from '@/components/ui/player-box';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, UserPlus, Award } from 'lucide-react';

export default function PlayerBoxExamples() {
  const samplePlayers = [
    {
      id: 1,
      displayName: "Sarah Johnson",
      firstName: "Sarah",
      lastName: "Johnson",
      positionPreferences: ["GA", "GS"],
      avatarColor: "bg-blue-500",
      active: true
    },
    {
      id: 2,
      displayName: "Emma Wilson",
      firstName: "Emma",
      lastName: "Wilson",
      positionPreferences: ["C", "WA", "WD"],
      avatarColor: "bg-green-600",
      active: true
    },
    {
      id: 3,
      displayName: "Lily Chen",
      firstName: "Lily",
      lastName: "Chen",
      positionPreferences: ["GK", "GD"],
      avatarColor: "bg-purple-500",
      active: false
    },
    {
      id: 4,
      displayName: "Mia Thompson",
      firstName: "Mia",
      lastName: "Thompson",
      positionPreferences: ["WA", "C", "GA"],
      avatarColor: "bg-orange-500",
      active: true
    },
    {
      id: 5,
      displayName: "Zoe Parker",
      firstName: "Zoe",
      lastName: "Parker",
      positionPreferences: ["GS"],
      avatarColor: "bg-red-600",
      active: true
    }
  ];

  return (
    <PageTemplate 
      title="PlayerBox Examples" 
      breadcrumbs={[
        { label: "Component Examples", href: "/component-examples" },
        { label: "PlayerBox Examples" }
      ]}
    >
      <div className="prose max-w-none mb-6">
        <p className="text-lg text-gray-700">
          Different layouts and configurations of the PlayerBox component
        </p>
      </div>
      
      <div className="space-y-8">
        {/* Basic PlayerBox */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Basic PlayerBox</h2>
          <div className="space-y-4">
            <PlayerBox player={samplePlayers[0]} />
            <PlayerBox player={samplePlayers[1]} />
            <PlayerBox player={samplePlayers[2]} />
          </div>
        </section>

        {/* Different Sizes */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Different Sizes</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Small Size</h3>
              <PlayerBox player={samplePlayers[0]} size="sm" />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Medium Size (Default)</h3>
              <PlayerBox player={samplePlayers[0]} size="md" />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Large Size</h3>
              <PlayerBox player={samplePlayers[0]} size="lg" />
            </div>
          </div>
        </section>

        {/* With Actions */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">With Action Buttons</h2>
          <div className="space-y-4">
            <PlayerBox 
              player={samplePlayers[1]} 
              actions={
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              }
            />
            <PlayerBox 
              player={samplePlayers[4]} 
              actions={
                <div className="flex gap-2">
                  <Button size="sm" variant="default">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add to Roster
                  </Button>
                  <Button size="sm" variant="outline">
                    <Award className="h-4 w-4" />
                  </Button>
                </div>
              }
            />
          </div>
        </section>

        {/* With Statistics */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">With Performance Statistics</h2>
          <div className="space-y-4">
            <PlayerBox 
              player={samplePlayers[0]} 
              stats={[
                { label: "Goals", value: 24 },
                { label: "Assists", value: 8 },
                { label: "Rating", value: "8.5" }
              ]}
            />
            <PlayerBox 
              player={samplePlayers[1]} 
              stats={[
                { label: "Intercepts", value: 12 },
                { label: "Turnovers", value: 3 },
                { label: "Rating", value: "7.8" }
              ]}
            />
            <PlayerBox 
              player={samplePlayers[4]} 
              stats={[
                { label: "Goals", value: 18 },
                { label: "Accuracy", value: "85%" },
                { label: "Games", value: 6 }
              ]}
            />
          </div>
        </section>

        {/* Without Position Preferences */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Without Position Display</h2>
          <div className="space-y-4">
            <PlayerBox 
              player={samplePlayers[0]} 
              showPositions={false}
            />
            <PlayerBox 
              player={samplePlayers[1]} 
              showPositions={false}
              stats={[
                { label: "MVP", value: 2 },
                { label: "Games", value: 8 }
              ]}
            />
          </div>
        </section>

        {/* Mixed Configurations */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Combined Features</h2>
          <div className="space-y-4">
            <PlayerBox 
              player={samplePlayers[3]} 
              size="lg"
              stats={[
                { label: "Goals", value: 32 },
                { label: "Assists", value: 15 },
                { label: "Rating", value: "9.2" }
              ]}
              actions={
                <div className="flex gap-2">
                  <Button size="sm" variant="default">
                    View Details
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              }
            />
            <PlayerBox 
              player={samplePlayers[2]} 
              size="sm"
              showPositions={false}
              actions={
                <Badge variant="secondary">
                  Inactive
                </Badge>
              }
            />
          </div>
        </section>

        {/* Different Avatar Colors */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Different Avatar Colors</h2>
          <div className="space-y-4">
            {samplePlayers.map((player, index) => (
              <PlayerBox 
                key={player.id}
                player={player}
                size="sm"
                showPositions={false}
              />
            ))}
          </div>
        </section>

        {/* Avatar Styling Variations */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Avatar Styling Variations</h2>
          <div className="space-y-6">
            
            {/* Classic Drop Shadow */}
            <div>
              <h3 className="text-lg font-medium mb-3">Classic Drop Shadow</h3>
              <div className="bg-white p-6 rounded-lg border space-y-4">
                <p className="text-sm text-gray-600 mb-4">Subtle shadows that work well on light backgrounds</p>
                {samplePlayers.slice(0, 3).map((player) => (
                  <div key={`classic-${player.id}`} className="relative">
                    <div className="flex items-center">
                      <div 
                        className={`h-16 w-16 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg ${player.avatarColor || 'bg-gray-700'}`}
                        style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }}
                      >
                        {player.firstName?.[0]?.toUpperCase()}{player.lastName?.[0]?.toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-lg font-bold text-gray-900">{player.displayName}</div>
                        <div className="text-sm text-gray-600">
                          {player.positionPreferences?.join(', ') || 'No positions'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* White Border + Shadow */}
            <div>
              <h3 className="text-lg font-medium mb-3">White Border + Shadow</h3>
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-lg space-y-4">
                <p className="text-sm text-gray-600 mb-4">Clean white borders with subtle shadows</p>
                {samplePlayers.slice(1, 4).map((player) => (
                  <div key={`border-${player.id}`} className="relative">
                    <div className="flex items-center">
                      <div 
                        className={`h-16 w-16 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${player.avatarColor || 'bg-gray-700'}`}
                        style={{ 
                          border: '3px solid white',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)' 
                        }}
                      >
                        {player.firstName?.[0]?.toUpperCase()}{player.lastName?.[0]?.toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-lg font-bold text-gray-900">{player.displayName}</div>
                        <div className="text-sm text-gray-600">
                          {player.positionPreferences?.join(', ') || 'No positions'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Depth */}
            <div>
              <h3 className="text-lg font-medium mb-3">Enhanced Depth</h3>
              <div className="bg-white p-6 rounded-lg border space-y-4">
                <p className="text-sm text-gray-600 mb-4">Multi-layered shadows for premium feel</p>
                {samplePlayers.slice(0, 3).map((player) => (
                  <div key={`depth-${player.id}`} className="relative">
                    <div className="flex items-center">
                      <div 
                        className={`h-20 w-20 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-xl ${player.avatarColor || 'bg-gray-700'}`}
                        style={{ 
                          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.05)' 
                        }}
                      >
                        {player.firstName?.[0]?.toUpperCase()}{player.lastName?.[0]?.toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-lg font-bold text-gray-900">{player.displayName}</div>
                        <div className="text-sm text-gray-600">
                          {player.positionPreferences?.join(', ') || 'No positions'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ring Effect */}
            <div>
              <h3 className="text-lg font-medium mb-3">Ring Effect</h3>
              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <p className="text-sm text-gray-600 mb-4">Colored rings that complement the avatar</p>
                {samplePlayers.slice(2, 5).map((player) => (
                  <div key={`ring-${player.id}`} className="relative">
                    <div className="flex items-center">
                      <div className="relative">
                        <div 
                          className="absolute inset-0 rounded-full"
                          style={{ 
                            background: `linear-gradient(135deg, ${player.avatarColor?.includes('bg-') ? '#' + player.avatarColor.split('-')[1] : '#6b7280'}40, ${player.avatarColor?.includes('bg-') ? '#' + player.avatarColor.split('-')[1] : '#6b7280'}20)`,
                            padding: '4px'
                          }}
                        >
                        </div>
                        <div 
                          className={`relative h-16 w-16 rounded-full flex items-center justify-center text-white font-bold ${player.avatarColor || 'bg-gray-700'}`}
                          style={{ 
                            margin: '4px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' 
                          }}
                        >
                          {player.firstName?.[0]?.toUpperCase()}{player.lastName?.[0]?.toUpperCase()}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-lg font-bold text-gray-900">{player.displayName}</div>
                        <div className="text-sm text-gray-600">
                          {player.positionPreferences?.join(', ') || 'No positions'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Glow Effect */}
            <div>
              <h3 className="text-lg font-medium mb-3">Glow Effect</h3>
              <div className="bg-gray-900 p-6 rounded-lg space-y-4">
                <p className="text-sm text-gray-300 mb-4">Subtle glow effects for dark themes</p>
                {samplePlayers.slice(1, 4).map((player) => (
                  <div key={`glow-${player.id}`} className="relative">
                    <div className="flex items-center">
                      <div 
                        className={`h-16 w-16 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${player.avatarColor || 'bg-gray-700'}`}
                        style={{ 
                          boxShadow: `0 0 20px ${player.avatarColor?.includes('red') ? '#ef444430' : 
                                                  player.avatarColor?.includes('blue') ? '#3b82f630' :
                                                  player.avatarColor?.includes('green') ? '#22c55e30' :
                                                  player.avatarColor?.includes('orange') ? '#f9731630' :
                                                  player.avatarColor?.includes('purple') ? '#a855f730' :
                                                  '#6b728030'}, 0 4px 12px rgba(0, 0, 0, 0.3)` 
                        }}
                      >
                        {player.firstName?.[0]?.toUpperCase()}{player.lastName?.[0]?.toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-lg font-bold text-white">{player.displayName}</div>
                        <div className="text-sm text-gray-300">
                          {player.positionPreferences?.join(', ') || 'No positions'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Elevated Style */}
            <div>
              <h3 className="text-lg font-medium mb-3">Elevated Style</h3>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-lg space-y-4">
                <p className="text-sm text-gray-600 mb-4">Combination of border, shadow and subtle background</p>
                {samplePlayers.slice(0, 2).map((player) => (
                  <div key={`elevated-${player.id}`} className="relative">
                    <div className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                      <div 
                        className={`h-16 w-16 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${player.avatarColor || 'bg-gray-700'}`}
                        style={{ 
                          border: '2px solid white',
                          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)' 
                        }}
                      >
                        {player.firstName?.[0]?.toUpperCase()}{player.lastName?.[0]?.toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-lg font-bold text-gray-900">{player.displayName}</div>
                        <div className="text-sm text-gray-600">
                          {player.positionPreferences?.join(', ') || 'No positions'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageTemplate>
  );
}
