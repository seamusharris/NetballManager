import React from 'react';
import { Helmet } from 'react-helmet';
import PageTemplate from '@/components/layout/PageTemplate';
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

      {/* Quick Reference Section */}
      <section className="mb-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h2 className="text-2xl font-semibold mb-4 text-blue-800">Quick Reference - Standard Player Box Styles</h2>
        <p className="text-blue-700 mb-6">These are the most commonly used player box variations in the app:</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* White Border + Shadow (Recommended Standard) */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-medium mb-3 text-gray-800">White Border + Shadow</h3>
            <p className="text-sm text-gray-600 mb-3">Recommended standard style for most use cases</p>
            <PlayerBox 
              player={samplePlayers[0]}
              size="md"
              showPositions={true}
              className="[&_.player-avatar]:border-4 [&_.player-avatar]:border-white [&_.player-avatar]:shadow-lg [&_.player-avatar]:shadow-black/15"
            />
          </div>

          {/* Colored Background with Dark Border */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-medium mb-3 text-gray-800">Colored Background + Dark Border</h3>
            <p className="text-sm text-gray-600 mb-3">For availability and selection interfaces</p>
            {(() => {
              const player = samplePlayers[1];
              const playerColorHex = (() => {
                const colorMap: Record<string, string> = {
                  'bg-red-500': '#ef4444', 'bg-red-600': '#dc2626',
                  'bg-orange-500': '#f97316', 'bg-orange-600': '#ea580c',
                  'bg-yellow-600': '#ca8a04', 'bg-amber-600': '#d97706',
                  'bg-green-600': '#16a34a', 'bg-green-700': '#15803d',
                  'bg-teal-600': '#0d9488', 'bg-cyan-600': '#0891b2',
                  'bg-blue-500': '#3b82f6', 'bg-blue-600': '#2563eb',
                  'bg-purple-500': '#a855f7', 'bg-purple-600': '#9333ea'
                };
                return colorMap[player.avatarColor || 'bg-gray-500'] || '#6b7280';
              })();

              return (
                <PlayerBox 
                  player={player}
                  size="md"
                  showPositions={true}
                  className="border-2 shadow-md"
                  style={{ 
                    backgroundColor: `${playerColorHex}15`,
                    borderColor: `${playerColorHex}80`,
                    color: playerColorHex
                  }}
                />
              );
            })()}
          </div>

          {/* Court Position Style */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-medium mb-3 text-gray-800">Court Position Style</h3>
            <p className="text-sm text-gray-600 mb-3">For game lineups and court displays</p>
            <PlayerBox 
              player={samplePlayers[2]}
              size="md"
              showPositions={true}
              className="[&>div>div:first-child]:border-4 [&>div>div:first-child]:border-white [&>div>div:first-child]:shadow-lg [&>div>div:first-child]:shadow-black/25"
            />
          </div>

          {/* Background Darkening Hover */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-medium mb-3 text-gray-800">Background Darkening Hover</h3>
            <p className="text-sm text-gray-600 mb-3">Interactive style similar to games list</p>
            {(() => {
              const player = samplePlayers[3];
              const playerColorHex = (() => {
                const colorMap: Record<string, string> = {
                  'bg-red-500': '#ef4444', 'bg-red-600': '#dc2626',
                  'bg-orange-500': '#f97316', 'bg-orange-600': '#ea580c',
                  'bg-yellow-600': '#ca8a04', 'bg-amber-600': '#d97706',
                  'bg-green-600': '#16a34a', 'bg-green-700': '#15803d',
                  'bg-teal-600': '#0d9488', 'bg-cyan-600': '#0891b2',
                  'bg-blue-500': '#3b82f6', 'bg-blue-600': '#2563eb',
                  'bg-purple-500': '#a855f7', 'bg-purple-600': '#9333ea'
                };
                return colorMap[player.avatarColor || 'bg-gray-500'] || '#6b7280';
              })();

              return (
                <div 
                  className="rounded-lg border-2 transition-all duration-300 cursor-pointer hover:brightness-85 [&:hover_.player-avatar]:brightness-[1.18]"
                  style={{ 
                    backgroundColor: `${playerColorHex}18`,
                    borderColor: `${playerColorHex}85`,
                    color: playerColorHex
                  }}
                >
                  <PlayerBox 
                    player={player}
                    size="md"
                    showPositions={true}
                    className="[&>div]:bg-transparent [&>div]:border-0 [&>div]:shadow-none [&>div]:cursor-pointer [&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current"
                  />
                </div>
              );
            })()}
          </div>

          {/* Compact Style */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-medium mb-3 text-gray-800">Compact Style</h3>
            <p className="text-sm text-gray-600 mb-3">For dense layouts and lists</p>
            <PlayerBox 
              player={samplePlayers[4]}
              size="sm"
              showPositions={true}
              className="[&_.player-avatar]:border-2 [&_.player-avatar]:border-white [&_.player-avatar]:shadow-md [&_.player-avatar]:shadow-black/15"
            />
          </div>

          {/* Premium Style */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-medium mb-3 text-gray-800">Premium Style</h3>
            <p className="text-sm text-gray-600 mb-3">For featured content and highlights</p>
            <PlayerBox 
              player={samplePlayers[0]}
              size="lg"
              showPositions={true}
              className="[&>div>div:first-child]:border-4 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current [&>div>div:first-child]:shadow-xl [&>div>div:first-child]:shadow-black/25"
            />
          </div>
        </div>
      </section>

      {/* Second Copy of Quick Reference Section */}
      <section className="mb-8 bg-green-50 p-6 rounded-lg border border-green-200">
        <h2 className="text-2xl font-semibold mb-4 text-green-800">Quick Reference - Standard Player Box Styles (Copy 2)</h2>
        <p className="text-green-700 mb-6">These are the most commonly used player box variations in the app:</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* White Border + Shadow (Recommended Standard) */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-medium mb-3 text-gray-800">White Border + Shadow</h3>
            <p className="text-sm text-gray-600 mb-3">Recommended standard style for most use cases</p>
            <PlayerBox 
              player={samplePlayers[0]}
              size="md"
              showPositions={true}
              className="[&_.player-avatar]:border-4 [&_.player-avatar]:border-white [&_.player-avatar]:shadow-lg [&_.player-avatar]:shadow-black/15"
            />
          </div>

          {/* Colored Background with Dark Border */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-medium mb-3 text-gray-800">Colored Background + Dark Border</h3>
            <p className="text-sm text-gray-600 mb-3">For availability and selection interfaces</p>
            {(() => {
              const player = samplePlayers[1];
              const playerColorHex = (() => {
                const colorMap: Record<string, string> = {
                  'bg-red-500': '#ef4444', 'bg-red-600': '#dc2626',
                  'bg-orange-500': '#f97316', 'bg-orange-600': '#ea580c',
                  'bg-yellow-600': '#ca8a04', 'bg-amber-600': '#d97706',
                  'bg-green-600': '#16a34a', 'bg-green-700': '#15803d',
                  'bg-teal-600': '#0d9488', 'bg-cyan-600': '#0891b2',
                  'bg-blue-500': '#3b82f6', 'bg-blue-600': '#2563eb',
                  'bg-purple-500': '#a855f7', 'bg-purple-600': '#9333ea'
                };
                return colorMap[player.avatarColor || 'bg-gray-500'] || '#6b7280';
              })();

              return (
                <PlayerBox 
                  player={player}
                  size="md"
                  showPositions={true}
                  className="border-2 shadow-md"
                  style={{ 
                    backgroundColor: `${playerColorHex}15`,
                    borderColor: `${playerColorHex}80`,
                    color: playerColorHex
                  }}
                />
              );
            })()}
          </div>

          {/* Court Position Style */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-medium mb-3 text-gray-800">Court Position Style</h3>
            <p className="text-sm text-gray-600 mb-3">For game lineups and court displays</p>
            <PlayerBox 
              player={samplePlayers[2]}
              size="md"
              showPositions={true}
              className="[&>div>div:first-child]:border-4 [&>div>div:first-child]:border-white [&>div>div:first-child]:shadow-lg [&>div>div:first-child]:shadow-black/25"
            />
          </div>

          {/* Background Darkening Hover */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-medium mb-3 text-gray-800">Background Darkening Hover</h3>
            <p className="text-sm text-gray-600 mb-3">Interactive style similar to games list</p>
            {(() => {
              const player = samplePlayers[3];
              const playerColorHex = (() => {
                const colorMap: Record<string, string> = {
                  'bg-red-500': '#ef4444', 'bg-red-600': '#dc2626',
                  'bg-orange-500': '#f97316', 'bg-orange-600': '#ea580c',
                  'bg-yellow-600': '#ca8a04', 'bg-amber-600': '#d97706',
                  'bg-green-600': '#16a34a', 'bg-green-700': '#15803d',
                  'bg-teal-600': '#0d9488', 'bg-cyan-600': '#0891b2',
                  'bg-blue-500': '#3b82f6', 'bg-blue-600': '#2563eb',
                  'bg-purple-500': '#a855f7', 'bg-purple-600': '#9333ea'
                };
                return colorMap[player.avatarColor || 'bg-gray-500'] || '#6b7280';
              })();

              return (
                <div 
                  className="rounded-lg border-2 transition-all duration-300 cursor-pointer hover:brightness-90 [&:hover_.player-avatar]:brightness-[1.11]"
                  style={{ 
                    backgroundColor: `${playerColorHex}15`,
                    borderColor: `${playerColorHex}80`,
                    color: playerColorHex
                  }}
                >
                  <PlayerBox 
                    player={player}
                    size="md"
                    showPositions={true}
                    className="[&>div]:bg-transparent [&>div]:border-0 [&>div]:shadow-none [&>div]:cursor-pointer [&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current"
                  />
                </div>
              );
            })()}
          </div>

          {/* Compact Style */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-medium mb-3 text-gray-800">Compact Style</h3>
            <p className="text-sm text-gray-600 mb-3">For dense layouts and lists</p>
            <PlayerBox 
              player={samplePlayers[4]}
              size="sm"
              showPositions={true}
              className="[&_.player-avatar]:border-2 [&_.player-avatar]:border-white [&_.player-avatar]:shadow-md [&_.player-avatar]:shadow-black/15"
            />
          </div>

          {/* Premium Style */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-medium mb-3 text-gray-800">Premium Style</h3>
            <p className="text-sm text-gray-600 mb-3">For featured content and highlights</p>
            <PlayerBox 
              player={samplePlayers[0]}
              size="lg"
              showPositions={true}
              className="[&>div>div:first-child]:border-4 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current [&>div>div:first-child]:shadow-xl [&>div>div:first-child]:shadow-black/25"
            />
          </div>
        </div>
      </section>
      
      <div className="space-y-8">
        {/* Basic PlayerBox */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Basic PlayerBox (Now with Colored Backgrounds)</h2>
          <div className="space-y-4">
            <PlayerBox player={samplePlayers[0]} />
            <PlayerBox player={samplePlayers[1]} />
            <PlayerBox player={samplePlayers[2]} />
            <PlayerBox player={samplePlayers[3]} />
            <PlayerBox player={samplePlayers[4]} />
          </div>
        </section>

        {/* Background Darkening Hover Effects - Prominent Examples */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Background Darkening Hover Effects</h2>
          <div className="bg-white p-6 rounded-lg border space-y-4">
            <p className="text-lg text-gray-700 mb-4">
              Hover over these player boxes to see the background darkening effect (similar to games list)
            </p>
            
            {/* Light Background Darkening */}
            <div>
              <h3 className="text-lg font-medium mb-3 text-gray-700">Light Background Darkening</h3>
              <div className="space-y-3">
                {samplePlayers.slice(0, 3).map((player) => {
                  const playerColorHex = (() => {
                    const colorMap: Record<string, string> = {
                      'bg-red-500': '#ef4444', 'bg-red-600': '#dc2626',
                      'bg-orange-500': '#f97316', 'bg-orange-600': '#ea580c',
                      'bg-yellow-600': '#ca8a04', 'bg-amber-600': '#d97706',
                      'bg-green-600': '#16a34a', 'bg-green-700': '#15803d',
                      'bg-teal-600': '#0d9488', 'bg-cyan-600': '#0891b2',
                      'bg-blue-500': '#3b82f6', 'bg-blue-600': '#2563eb',
                      'bg-purple-500': '#a855f7', 'bg-purple-600': '#9333ea'
                    };
                    return colorMap[player.avatarColor || 'bg-gray-500'] || '#6b7280';
                  })();

                  return (
                    <div key={`prominent-bg-darken-light-${player.id}`} className="relative">
                      <div 
                        className="rounded-lg border-2 transition-all duration-300 cursor-pointer hover:brightness-90 [&:hover_.player-avatar]:brightness-[1.11]"
                        style={{ 
                          backgroundColor: `${playerColorHex}15`,
                          borderColor: `${playerColorHex}80`,
                          color: playerColorHex
                        }}
                      >
                        <PlayerBox 
                          player={player}
                          size="md"
                          showPositions={true}
                          className="[&>div]:bg-transparent [&>div]:border-0 [&>div]:shadow-none [&>div]:cursor-pointer [&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Medium Background Darkening */}
            <div>
              <h3 className="text-lg font-medium mb-3 text-gray-700">Medium Background Darkening</h3>
              <div className="space-y-3">
                {samplePlayers.slice(1, 4).map((player) => {
                  const playerColorHex = (() => {
                    const colorMap: Record<string, string> = {
                      'bg-red-500': '#ef4444', 'bg-red-600': '#dc2626',
                      'bg-orange-500': '#f97316', 'bg-orange-600': '#ea580c',
                      'bg-yellow-600': '#ca8a04', 'bg-amber-600': '#d97706',
                      'bg-green-600': '#16a34a', 'bg-green-700': '#15803d',
                      'bg-teal-600': '#0d9488', 'bg-cyan-600': '#0891b2',
                      'bg-blue-500': '#3b82f6', 'bg-blue-600': '#2563eb',
                      'bg-purple-500': '#a855f7', 'bg-purple-600': '#9333ea'
                    };
                    return colorMap[player.avatarColor || 'bg-gray-500'] || '#6b7280';
                  })();

                  return (
                    <div key={`prominent-bg-darken-medium-${player.id}`} className="relative">
                      <div 
                        className="rounded-lg border-2 transition-all duration-300 cursor-pointer hover:brightness-75 [&:hover_.player-avatar]:brightness-[1.33]"
                        style={{ 
                          backgroundColor: `${playerColorHex}20`,
                          borderColor: `${playerColorHex}90`,
                          color: playerColorHex
                        }}
                      >
                        <PlayerBox 
                          player={player}
                          size="md"
                          showPositions={true}
                          className="[&>div]:bg-transparent [&>div]:border-0 [&>div]:shadow-none [&>div]:cursor-pointer [&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Combined Background Darkening + Shadow */}
            <div>
              <h3 className="text-lg font-medium mb-3 text-gray-700">Combined Background Darkening + Shadow</h3>
              <div className="space-y-3">
                {samplePlayers.slice(0, 3).map((player) => {
                  const playerColorHex = (() => {
                    const colorMap: Record<string, string> = {
                      'bg-red-500': '#ef4444', 'bg-red-600': '#dc2626',
                      'bg-orange-500': '#f97316', 'bg-orange-600': '#ea580c',
                      'bg-yellow-600': '#ca8a04', 'bg-amber-600': '#d97706',
                      'bg-green-600': '#16a34a', 'bg-green-700': '#15803d',
                      'bg-teal-600': '#0d9488', 'bg-cyan-600': '#0891b2',
                      'bg-blue-500': '#3b82f6', 'bg-blue-600': '#2563eb',
                      'bg-purple-500': '#a855f7', 'bg-purple-600': '#9333ea'
                    };
                    return colorMap[player.avatarColor || 'bg-gray-500'] || '#6b7280';
                  })();

                  return (
                    <div key={`prominent-bg-darken-shadow-${player.id}`} className="relative">
                      <div 
                        className="rounded-lg border-2 shadow-sm transition-all duration-300 cursor-pointer hover:brightness-85 hover:shadow-lg [&:hover_.player-avatar]:brightness-[1.18]"
                        style={{ 
                          backgroundColor: `${playerColorHex}18`,
                          borderColor: `${playerColorHex}85`,
                          color: playerColorHex
                        }}
                      >
                        <PlayerBox 
                          player={player}
                          size="md"
                          showPositions={true}
                          className="[&>div]:bg-transparent [&>div]:border-0 [&>div]:shadow-none [&>div]:cursor-pointer [&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
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
                    <PlayerBox 
                      player={player}
                      size="md"
                      showPositions={true}
                      className="[&_.player-avatar]:shadow-lg [&_.player-avatar]:shadow-black/15"
                    />
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
                    <PlayerBox 
                      player={player}
                      size="md"
                      showPositions={true}
                      className="[&_.player-avatar]:border-4 [&_.player-avatar]:border-white [&_.player-avatar]:shadow-lg [&_.player-avatar]:shadow-black/15"
                    />
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
                    <PlayerBox 
                      player={player}
                      size="lg"
                      showPositions={true}
                      className="[&_.player-avatar]:shadow-2xl [&_.player-avatar]:shadow-black/20"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Subtle Ring Effect */}
            <div>
              <h3 className="text-lg font-medium mb-3">Ring Effect</h3>
              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <p className="text-sm text-gray-600 mb-4">Subtle ring border for emphasis</p>
                {samplePlayers.slice(2, 5).map((player) => (
                  <div key={`ring-${player.id}`} className="relative">
                    <PlayerBox 
                      player={player}
                      size="md"
                      showPositions={true}
                      className="[&_.player-avatar]:ring-2 [&_.player-avatar]:ring-gray-200 [&_.player-avatar]:ring-offset-2 [&_.player-avatar]:shadow-md"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Soft Glow */}
            <div>
              <h3 className="text-lg font-medium mb-3">Soft Glow Effect</h3>
              <div className="bg-gray-900 p-6 rounded-lg space-y-4">
                <p className="text-sm text-gray-300 mb-4">Subtle glow effects for dark themes</p>
                {samplePlayers.slice(1, 4).map((player) => (
                  <div key={`glow-${player.id}`} className="relative">
                    <PlayerBox 
                      player={player}
                      size="md"
                      showPositions={true}
                      className="[&_.player-name]:text-white [&_.player-positions]:text-gray-300 [&_.player-avatar]:shadow-lg [&_.player-avatar]:shadow-blue-500/20"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Elevated Card Style */}
            <div>
              <h3 className="text-lg font-medium mb-3">Elevated Card Style</h3>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-lg space-y-4">
                <p className="text-sm text-gray-600 mb-4">Card-based layout with enhanced shadows</p>
                {samplePlayers.slice(0, 2).map((player) => (
                  <div key={`elevated-${player.id}`} className="relative">
                    <div className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
                      <PlayerBox 
                        player={player}
                        size="md"
                        showPositions={true}
                        className="[&_.player-avatar]:border-2 [&_.player-avatar]:border-white [&_.player-avatar]:shadow-lg"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Thick Border Emphasis */}
            <div>
              <h3 className="text-lg font-medium mb-3">Thick Border Emphasis</h3>
              <div className="bg-white p-6 rounded-lg border space-y-4">
                <p className="text-sm text-gray-600 mb-4">Bold borders for high contrast</p>
                {samplePlayers.slice(3, 5).map((player) => (
                  <div key={`thick-${player.id}`} className="relative">
                    <PlayerBox 
                      player={player}
                      size="md"
                      showPositions={true}
                      className="[&_.player-avatar]:border-4 [&_.player-avatar]:border-gray-800 [&_.player-avatar]:shadow-lg"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Court Position Style Avatars */}
            <div>
              <h3 className="text-lg font-medium mb-3">Court Position Style (Game Details)</h3>
              <div className="bg-green-100 p-6 rounded-lg space-y-4">
                <p className="text-sm text-gray-600 mb-4">White borders with drop shadows like those used in court position layouts</p>
                {samplePlayers.slice(0, 4).map((player) => (
                  <div key={`court-${player.id}`} className="relative">
                    <PlayerBox 
                      player={player}
                      size="md"
                      showPositions={true}
                      className="[&>div>div:first-child]:border-4 [&>div>div:first-child]:border-white [&>div>div:first-child]:shadow-lg [&>div>div:first-child]:shadow-black/25"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Court Position Large */}
            <div>
              <h3 className="text-lg font-medium mb-3">Court Position Style - Large</h3>
              <div className="bg-blue-50 p-6 rounded-lg space-y-4">
                <p className="text-sm text-gray-600 mb-4">Larger avatars with prominent white borders and strong shadows</p>
                {samplePlayers.slice(1, 3).map((player) => (
                  <div key={`court-large-${player.id}`} className="relative">
                    <PlayerBox 
                      player={player}
                      size="lg"
                      showPositions={true}
                      className="[&>div>div:first-child]:border-[5px] [&>div>div:first-child]:border-white [&>div>div:first-child]:shadow-xl [&>div>div:first-child]:shadow-black/30"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Court on Dark Background */}
            <div>
              <h3 className="text-lg font-medium mb-3">Court Style - Dark Court</h3>
              <div className="bg-gray-800 p-6 rounded-lg space-y-4">
                <p className="text-sm text-gray-300 mb-4">Court position styling on dark backgrounds with white borders</p>
                {samplePlayers.slice(2, 5).map((player) => (
                  <div key={`court-dark-${player.id}`} className="relative">
                    <PlayerBox 
                      player={player}
                      size="md"
                      showPositions={true}
                      className="[&_.player-name]:text-white [&_.player-positions]:text-gray-300 [&>div>div:first-child]:border-4 [&>div>div:first-child]:border-white [&>div>div:first-child]:shadow-2xl [&>div>div:first-child]:shadow-black/50"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Subtle Court Style */}
            <div>
              <h3 className="text-lg font-medium mb-3">Subtle Court Style</h3>
              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <p className="text-sm text-gray-600 mb-4">Softer version with thinner borders and lighter shadows</p>
                {samplePlayers.map((player) => (
                  <div key={`court-subtle-${player.id}`} className="relative">
                    <PlayerBox 
                      player={player}
                      size="sm"
                      showPositions={false}
                      className="[&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:shadow-md [&>div>div:first-child]:shadow-black/15"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Professional Clean */}
            <div>
              <h3 className="text-lg font-medium mb-3">Professional Clean</h3>
              <div className="bg-white p-6 rounded-lg border space-y-4">
                <p className="text-sm text-gray-600 mb-4">Crisp, clean styling perfect for business presentations</p>
                {samplePlayers.slice(0, 3).map((player) => (
                  <div key={`professional-${player.id}`} className="relative">
                    <PlayerBox 
                      player={player}
                      size="md"
                      showPositions={true}
                      className="[&>div>div:first-child]:border-3 [&>div>div:first-child]:border-gray-200 [&>div>div:first-child]:shadow-lg [&>div>div:first-child]:shadow-gray-200/60"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Double Border Effect */}
            <div>
              <h3 className="text-lg font-medium mb-3">Double Border Effect</h3>
              <div className="bg-white p-6 rounded-lg border space-y-4">
                <p className="text-sm text-gray-600 mb-4">Elegant double border creating depth and sophistication</p>
                {samplePlayers.slice(1, 4).map((player) => (
                  <div key={`double-border-${player.id}`} className="relative">
                    <PlayerBox 
                      player={player}
                      size="md"
                      showPositions={true}
                      className="[&>div>div:first-child]:border-4 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-gray-300 [&>div>div:first-child]:shadow-lg [&>div>div:first-child]:shadow-black/20"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Soft Shadow Collection */}
            <div>
              <h3 className="text-lg font-medium mb-3">Soft Shadow Collection</h3>
              <div className="bg-white p-6 rounded-lg border space-y-4">
                <p className="text-sm text-gray-600 mb-4">Various soft shadow intensities for different prominence levels</p>
                <div className="grid gap-4">
                  <div className="flex items-center gap-4">
                    <span className="w-24 text-sm font-medium">Light:</span>
                    <PlayerBox 
                      player={samplePlayers[0]}
                      size="sm"
                      showPositions={false}
                      className="[&>div>div:first-child]:shadow-sm [&>div>div:first-child]:shadow-gray-400/30"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="w-24 text-sm font-medium">Medium:</span>
                    <PlayerBox 
                      player={samplePlayers[1]}
                      size="sm"
                      showPositions={false}
                      className="[&>div>div:first-child]:shadow-md [&>div>div:first-child]:shadow-gray-500/40"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="w-24 text-sm font-medium">Strong:</span>
                    <PlayerBox 
                      player={samplePlayers[2]}
                      size="sm"
                      showPositions={false}
                      className="[&>div>div:first-child]:shadow-lg [&>div>div:first-child]:shadow-gray-600/50"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="w-24 text-sm font-medium">Dramatic:</span>
                    <PlayerBox 
                      player={samplePlayers[3]}
                      size="sm"
                      showPositions={false}
                      className="[&>div>div:first-child]:shadow-xl [&>div>div:first-child]:shadow-gray-700/60"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Colored Border Highlights */}
            <div>
              <h3 className="text-lg font-medium mb-3">Colored Border Highlights</h3>
              <div className="bg-white p-6 rounded-lg border space-y-4">
                <p className="text-sm text-gray-600 mb-4">Matching avatar colors with border accents</p>
                {samplePlayers.slice(0, 4).map((player) => (
                  <div key={`colored-border-${player.id}`} className="relative">
                    <PlayerBox 
                      player={player}
                      size="md"
                      showPositions={true}
                      className="[&>div>div:first-child]:border-3 [&>div>div:first-child]:border-current [&>div>div:first-child]:shadow-lg [&>div>div:first-child]:shadow-current/30"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Minimalist Elegance */}
            <div>
              <h3 className="text-lg font-medium mb-3">Minimalist Elegance</h3>
              <div className="bg-white p-6 rounded-lg border space-y-4">
                <p className="text-sm text-gray-600 mb-4">Ultra-clean styling with subtle depth hints</p>
                {samplePlayers.slice(2, 5).map((player) => (
                  <div key={`minimalist-${player.id}`} className="relative">
                    <PlayerBox 
                      player={player}
                      size="md"
                      showPositions={true}
                      className="[&>div>div:first-child]:border [&>div>div:first-child]:border-gray-100 [&>div>div:first-child]:shadow-sm [&>div>div:first-child]:shadow-gray-200/50"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Raised Appearance */}
            <div>
              <h3 className="text-lg font-medium mb-3">Raised Appearance</h3>
              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <p className="text-sm text-gray-600 mb-4">3D-like raised effect with graduated shadows</p>
                {samplePlayers.slice(0, 3).map((player) => (
                  <div key={`raised-${player.id}`} className="relative">
                    <PlayerBox 
                      player={player}
                      size="md"
                      showPositions={true}
                      className="[&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:shadow-lg [&>div>div:first-child]:shadow-black/25 [&>div>div:first-child]:ring-1 [&>div>div:first-child]:ring-gray-200"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Floating Effect */}
            <div>
              <h3 className="text-lg font-medium mb-3">Floating Effect</h3>
              <div className="bg-white p-6 rounded-lg border space-y-4">
                <p className="text-sm text-gray-600 mb-4">Avatars that appear to float above the surface</p>
                {samplePlayers.slice(1, 4).map((player) => (
                  <div key={`floating-${player.id}`} className="relative">
                    <PlayerBox 
                      player={player}
                      size="md"
                      showPositions={true}
                      className="[&>div>div:first-child]:shadow-2xl [&>div>div:first-child]:shadow-black/30 [&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:translate-y-[-2px]"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Gradient Shadow */}
            <div>
              <h3 className="text-lg font-medium mb-3">Gradient Shadow</h3>
              <div className="bg-white p-6 rounded-lg border space-y-4">
                <p className="text-sm text-gray-600 mb-4">Subtle gradient shadows for modern appeal</p>
                {samplePlayers.slice(0, 4).map((player, index) => (
                  <div key={`gradient-${player.id}`} className="relative">
                    <PlayerBox 
                      player={player}
                      size="md"
                      showPositions={true}
                      className={`[&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:shadow-lg ${
                        index === 0 ? '[&>div>div:first-child]:shadow-blue-200/60' :
                        index === 1 ? '[&>div>div:first-child]:shadow-green-200/60' :
                        index === 2 ? '[&>div>div:first-child]:shadow-purple-200/60' :
                        '[&>div>div:first-child]:shadow-orange-200/60'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Layered Depth */}
            <div>
              <h3 className="text-lg font-medium mb-3">Layered Depth</h3>
              <div className="bg-white p-6 rounded-lg border space-y-4">
                <p className="text-sm text-gray-600 mb-4">Multiple shadow layers creating rich depth</p>
                {samplePlayers.slice(2, 5).map((player) => (
                  <div key={`layered-${player.id}`} className="relative">
                    <PlayerBox 
                      player={player}
                      size="md"
                      showPositions={true}
                      className="[&>div>div:first-child]:border-3 [&>div>div:first-child]:border-white [&>div>div:first-child]:shadow-lg [&>div>div:first-child]:shadow-black/20 [&>div>div:first-child]:drop-shadow-md"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Vintage Style */}
            <div>
              <h3 className="text-lg font-medium mb-3">Vintage Style</h3>
              <div className="bg-amber-50 p-6 rounded-lg space-y-4">
                <p className="text-sm text-gray-600 mb-4">Classic styling with warm tones and softer edges</p>
                {samplePlayers.slice(0, 3).map((player) => (
                  <div key={`vintage-${player.id}`} className="relative">
                    <PlayerBox 
                      player={player}
                      size="md"
                      showPositions={true}
                      className="[&>div>div:first-child]:border-4 [&>div>div:first-child]:border-amber-100 [&>div>div:first-child]:shadow-lg [&>div>div:first-child]:shadow-amber-900/25"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Modern Flat */}
            <div>
              <h3 className="text-lg font-medium mb-3">Modern Flat</h3>
              <div className="bg-white p-6 rounded-lg border space-y-4">
                <p className="text-sm text-gray-600 mb-4">Contemporary flat design with subtle accents</p>
                {samplePlayers.slice(1, 4).map((player) => (
                  <div key={`flat-${player.id}`} className="relative">
                    <PlayerBox 
                      player={player}
                      size="md"
                      showPositions={true}
                      className="[&>div>div:first-child]:border-2 [&>div>div:first-child]:border-gray-100 [&>div>div:first-child]:shadow-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Prismatic Borders */}
            <div>
              <h3 className="text-lg font-medium mb-3">Prismatic Borders</h3>
              <div className="bg-white p-6 rounded-lg border space-y-4">
                <p className="text-sm text-gray-600 mb-4">Rainbow-inspired border effects</p>
                {samplePlayers.slice(0, 4).map((player, index) => (
                  <div key={`prismatic-${player.id}`} className="relative">
                    <PlayerBox 
                      player={player}
                      size="md"
                      showPositions={true}
                      className={`[&>div>div:first-child]:border-3 [&>div>div:first-child]:shadow-lg ${
                        index === 0 ? '[&>div>div:first-child]:border-red-200 [&>div>div:first-child]:shadow-red-200/40' :
                        index === 1 ? '[&>div>div:first-child]:border-blue-200 [&>div>div:first-child]:shadow-blue-200/40' :
                        index === 2 ? '[&>div>div:first-child]:border-green-200 [&>div>div:first-child]:shadow-green-200/40' :
                        '[&>div>div:first-child]:border-purple-200 [&>div>div:first-child]:shadow-purple-200/40'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Avatar Inside Colored Player Box with Dark Border */}
            <div>
              <h3 className="text-lg font-medium mb-3">Avatar Inside Colored Player Box with Dark Border</h3>
              <div className="bg-white p-6 rounded-lg border space-y-4">
                <p className="text-sm text-gray-600 mb-4">Complete PlayerBox components with consistent colored backgrounds and dark borders</p>
                {samplePlayers.slice(0, 5).map((player) => {
                  const playerColorHex = (() => {
                    const colorMap: Record<string, string> = {
                      'bg-red-500': '#ef4444', 'bg-red-600': '#dc2626',
                      'bg-orange-500': '#f97316', 'bg-orange-600': '#ea580c',
                      'bg-yellow-600': '#ca8a04', 'bg-amber-600': '#d97706',
                      'bg-green-600': '#16a34a', 'bg-green-700': '#15803d',
                      'bg-teal-600': '#0d9488', 'bg-cyan-600': '#0891b2',
                      'bg-blue-500': '#3b82f6', 'bg-blue-600': '#2563eb',
                      'bg-purple-500': '#a855f7', 'bg-purple-600': '#9333ea'
                    };
                    return colorMap[player.avatarColor || 'bg-gray-500'] || '#6b7280';
                  })();

                  return (
                    <div key={`dark-border-container-${player.id}`} className="relative">
                      <PlayerBox 
                        player={player}
                        size="md"
                        showPositions={true}
                        className="border-2 shadow-md"
                        style={{ 
                          backgroundColor: `${playerColorHex}15`,
                          borderColor: `${playerColorHex}80`,
                          color: playerColorHex
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Thick Dark Border with Light Background */}
            <div>
              <h3 className="text-lg font-medium mb-3">Thick Dark Border with Light Background</h3>
              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <p className="text-sm text-gray-600 mb-4">PlayerBox components with thick dark borders and very light colored backgrounds</p>
                {samplePlayers.slice(1, 4).map((player) => {
                  const playerColorHex = (() => {
                    const colorMap: Record<string, string> = {
                      'bg-red-500': '#ef4444', 'bg-red-600': '#dc2626',
                      'bg-orange-500': '#f97316', 'bg-orange-600': '#ea580c',
                      'bg-yellow-600': '#ca8a04', 'bg-amber-600': '#d97706',
                      'bg-green-600': '#16a34a', 'bg-green-700': '#15803d',
                      'bg-teal-600': '#0d9488', 'bg-cyan-600': '#0891b2',
                      'bg-blue-500': '#3b82f6', 'bg-blue-600': '#2563eb',
                      'bg-purple-500': '#a855f7', 'bg-purple-600': '#9333ea'
                    };
                    return colorMap[player.avatarColor || 'bg-gray-500'] || '#6b7280';
                  })();

                  return (
                    <div key={`thick-border-${player.id}`} className="relative">
                      <PlayerBox 
                        player={player}
                        size="md"
                        showPositions={true}
                        className="rounded-xl border-4 shadow-lg"
                        style={{ 
                          backgroundColor: `${playerColorHex}08`,
                          borderColor: `${playerColorHex}C0`,
                          color: playerColorHex
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dark Border Medium Background */}
            <div>
              <h3 className="text-lg font-medium mb-3">Dark Border with Medium Background</h3>
              <div className="bg-white p-6 rounded-lg border space-y-4">
                <p className="text-sm text-gray-600 mb-4">PlayerBox components with dark borders and medium-toned colored backgrounds</p>
                {samplePlayers.slice(0, 4).map((player) => {
                  const playerColorHex = (() => {
                    const colorMap: Record<string, string> = {
                      'bg-red-500': '#ef4444', 'bg-red-600': '#dc2626',
                      'bg-orange-500': '#f97316', 'bg-orange-600': '#ea580c',
                      'bg-yellow-600': '#ca8a04', 'bg-amber-600': '#d97706',
                      'bg-green-600': '#16a34a', 'bg-green-700': '#15803d',
                      'bg-teal-600': '#0d9488', 'bg-cyan-600': '#0891b2',
                      'bg-blue-500': '#3b82f6', 'bg-blue-600': '#2563eb',
                      'bg-purple-500': '#a855f7', 'bg-purple-600': '#9333ea'
                    };
                    return colorMap[player.avatarColor || 'bg-gray-500'] || '#6b7280';
                  })();

                  return (
                    <div key={`medium-bg-${player.id}`} className="relative">
                      <PlayerBox 
                        player={player}
                        size="md"
                        showPositions={true}
                        className="rounded-lg border-3 shadow-md"
                        style={{ 
                          backgroundColor: `${playerColorHex}18`,
                          borderColor: `${playerColorHex}A0`,
                          color: playerColorHex
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* High Contrast Dark Border */}
            <div>
              <h3 className="text-lg font-medium mb-3">High Contrast Dark Border</h3>
              <div className="bg-gray-100 p-6 rounded-lg space-y-4">
                <p className="text-sm text-gray-600 mb-4">PlayerBox components with very dark borders for maximum contrast</p>
                {samplePlayers.slice(2, 5).map((player) => {
                  const playerColorHex = (() => {
                    const colorMap: Record<string, string> = {
                      'bg-red-500': '#dc2626', 'bg-red-600': '#b91c1c',
                      'bg-orange-500': '#ea580c', 'bg-orange-600': '#c2410c',
                      'bg-yellow-600': '#a16207', 'bg-amber-600': '#b45309',
                      'bg-green-600': '#15803d', 'bg-green-700': '#14532d',
                      'bg-teal-600': '#0f766e', 'bg-cyan-600': '#0e7490',
                      'bg-blue-500': '#1d4ed8', 'bg-blue-600': '#1e40af',
                      'bg-purple-500': '#7e22ce', 'bg-purple-600': '#6b21a8'
                    };
                    return colorMap[player.avatarColor || 'bg-gray-500'] || '#374151';
                  })();

                  return (
                    <div key={`high-contrast-${player.id}`} className="relative">
                      <PlayerBox 
                        player={player}
                        size="md"
                        showPositions={true}
                        className="rounded-lg border-3 shadow-lg"
                        style={{ 
                          backgroundColor: `${playerColorHex}12`,
                          borderColor: playerColorHex,
                          color: '#ffffff'
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Compact Dark Border Style */}
            <div>
              <h3 className="text-lg font-medium mb-3">Compact Dark Border Style</h3>
              <div className="bg-white p-6 rounded-lg border space-y-3">
                <p className="text-sm text-gray-600 mb-4">Smaller PlayerBox components with dark borders and colored backgrounds</p>
                {samplePlayers.map((player) => {
                  const playerColorHex = (() => {
                    const colorMap: Record<string, string> = {
                      'bg-red-500': '#ef4444', 'bg-red-600': '#dc2626',
                      'bg-orange-500': '#f97316', 'bg-orange-600': '#ea580c',
                      'bg-yellow-600': '#ca8a04', 'bg-amber-600': '#d97706',
                      'bg-green-600': '#16a34a', 'bg-green-700': '#15803d',
                      'bg-teal-600': '#0d9488', 'bg-cyan-600': '#0891b2',
                      'bg-blue-500': '#3b82f6', 'bg-blue-600': '#2563eb',
                      'bg-purple-500': '#a855f7', 'bg-purple-600': '#9333ea'
                    };
                    return colorMap[player.avatarColor || 'bg-gray-500'] || '#6b7280';
                  })();

                  return (
                    <div key={`compact-dark-${player.id}`} className="relative">
                      <PlayerBox 
                        player={player}
                        size="sm"
                        showPositions={true}
                        className="rounded-md border-2 shadow-sm"
                        style={{ 
                          backgroundColor: `${playerColorHex}0A`,
                          borderColor: `${playerColorHex}90`,
                          color: playerColorHex
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Colored Player Box with Enhanced Shadows */}
            <div>
              <h3 className="text-lg font-medium mb-3">Colored Player Box - Enhanced Shadows</h3>
              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <p className="text-sm text-gray-600 mb-4">PlayerBox components with colored backgrounds and enhanced shadow effects</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {samplePlayers.slice(0, 3).map((player) => {
                    const playerColorHex = (() => {
                      const colorMap: Record<string, string> = {
                        'bg-red-500': '#ef4444', 'bg-red-600': '#dc2626',
                        'bg-orange-500': '#f97316', 'bg-orange-600': '#ea580c',
                        'bg-yellow-600': '#ca8a04', 'bg-amber-600': '#d97706',
                        'bg-green-600': '#16a34a', 'bg-green-700': '#15803d',
                        'bg-teal-600': '#0d9488', 'bg-cyan-600': '#0891b2',
                        'bg-blue-500': '#3b82f6', 'bg-blue-600': '#2563eb',
                        'bg-purple-500': '#a855f7', 'bg-purple-600': '#9333ea'
                      };
                      return colorMap[player.avatarColor || 'bg-gray-500'] || '#6b7280';
                    })();

                    return (
                      <div key={`enhanced-shadow-${player.id}`} className="relative">
                        <PlayerBox 
                          player={player}
                          size="md"
                          showPositions={true}
                          className="rounded-xl shadow-xl border-2 p-4"
                          style={{ 
                            backgroundColor: `${playerColorHex}20`,
                            borderColor: `${playerColorHex}30`
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Large Colored Player Boxes */}
            <div>
              <h3 className="text-lg font-medium mb-3">Large Colored Player Boxes</h3>
              <div className="bg-white p-6 rounded-lg border space-y-4">
                <p className="text-sm text-gray-600 mb-4">Large PlayerBox components with consistent colored backgrounds</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {samplePlayers.slice(1, 5).map((player) => {
                    const playerColorHex = (() => {
                      const colorMap: Record<string, string> = {
                        'bg-red-500': '#ef4444', 'bg-red-600': '#dc2626',
                        'bg-orange-500': '#f97316', 'bg-orange-600': '#ea580c',
                        'bg-yellow-600': '#ca8a04', 'bg-amber-600': '#d97706',
                        'bg-green-600': '#16a34a', 'bg-green-700': '#15803d',
                        'bg-teal-600': '#0d9488', 'bg-cyan-600': '#0891b2',
                        'bg-blue-500': '#3b82f6', 'bg-blue-600': '#2563eb',
                        'bg-purple-500': '#a855f7', 'bg-purple-600': '#9333ea'
                      };
                      return colorMap[player.avatarColor || 'bg-gray-500'] || '#6b7280';
                    })();

                    return (
                      <div key={`large-colored-box-${player.id}`} className="relative">
                        <PlayerBox 
                          player={player}
                          size="lg"
                          showPositions={true}
                          className="rounded-2xl shadow-2xl border-2 p-6"
                          style={{ 
                            backgroundColor: `${playerColorHex}18`,
                            borderColor: `${playerColorHex}25`
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Compact Colored Player Boxes */}
            <div>
              <h3 className="text-lg font-medium mb-3">Compact Colored Player Boxes</h3>
              <div className="bg-gray-100 p-6 rounded-lg space-y-3">
                <p className="text-sm text-gray-600 mb-4">Compact PlayerBox components with consistent colored backgrounds</p>
                {samplePlayers.map((player) => {
                  const playerColorHex = (() => {
                    const colorMap: Record<string, string> = {
                      'bg-red-500': '#ef4444', 'bg-red-600': '#dc2626',
                      'bg-orange-500': '#f97316', 'bg-orange-600': '#ea580c',
                      'bg-yellow-600': '#ca8a04', 'bg-amber-600': '#d97706',
                      'bg-green-600': '#16a34a', 'bg-green-700': '#15803d',
                      'bg-teal-600': '#0d9488', 'bg-cyan-600': '#0891b2',
                      'bg-blue-500': '#3b82f6', 'bg-blue-600': '#2563eb',
                      'bg-purple-500': '#a855f7', 'bg-purple-600': '#9333ea'
                    };
                    return colorMap[player.avatarColor || 'bg-gray-500'] || '#6b7280';
                  })();

                  return (
                    <div key={`compact-colored-box-${player.id}`} className="relative">
                      <PlayerBox 
                        player={player}
                        size="sm"
                        showPositions={true}
                        className="rounded-lg shadow-md border p-3"
                        style={{ 
                          backgroundColor: `${playerColorHex}12`,
                          borderColor: `${playerColorHex}20`
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Premium Colored Player Boxes */}
            <div>
              <h3 className="text-lg font-medium mb-3">Premium Colored Player Boxes</h3>
              <div className="bg-slate-50 p-6 rounded-lg space-y-4">
                <p className="text-sm text-gray-600 mb-4">Premium styling with thick colored borders and consistent backgrounds</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {samplePlayers.slice(0, 4).map((player) => {
                    const playerColorHex = (() => {
                      const colorMap: Record<string, string> = {
                        'bg-red-500': '#ef4444', 'bg-red-600': '#dc2626',
                        'bg-orange-500': '#f97316', 'bg-orange-600': '#ea580c',
                        'bg-yellow-600': '#ca8a04', 'bg-amber-600': '#d97706',
                        'bg-green-600': '#16a34a', 'bg-green-700': '#15803d',
                        'bg-teal-600': '#0d9488', 'bg-cyan-600': '#0891b2',
                        'bg-blue-500': '#3b82f6', 'bg-blue-600': '#2563eb',
                        'bg-purple-500': '#a855f7', 'bg-purple-600': '#9333ea'
                      };
                      return colorMap[player.avatarColor || 'bg-gray-500'] || '#6b7280';
                    })();

                    return (
                      <div key={`premium-colored-${player.id}`} className="relative">
                        <PlayerBox 
                          player={player}
                          size="md"
                          showPositions={true}
                          className="rounded-xl shadow-2xl border-4 p-5"
                          style={{ 
                            backgroundColor: `${playerColorHex}15`,
                            borderColor: `${playerColorHex}40`
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Gradient Colored Player Boxes */}
            <div>
              <h3 className="text-lg font-medium mb-3">Gradient Colored Player Boxes</h3>
              <div className="bg-white p-6 rounded-lg border space-y-4">
                <p className="text-sm text-gray-600 mb-4">PlayerBox components with gradient colored backgrounds</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {samplePlayers.slice(2, 5).map((player) => {
                    const playerColorHex = (() => {
                      const colorMap: Record<string, string> = {
                        'bg-red-500': '#ef4444', 'bg-red-600': '#dc2626',
                        'bg-orange-500': '#f97316', 'bg-orange-600': '#ea580c',
                        'bg-yellow-600': '#ca8a04', 'bg-amber-600': '#d97706',
                        'bg-green-600': '#16a34a', 'bg-green-700': '#15803d',
                        'bg-teal-600': '#0d9488', 'bg-cyan-600': '#0891b2',
                        'bg-blue-500': '#3b82f6', 'bg-blue-600': '#2563eb',
                        'bg-purple-500': '#a855f7', 'bg-purple-600': '#9333ea'
                      };
                      return colorMap[player.avatarColor || 'bg-gray-500'] || '#6b7280';
                    })();

                    return (
                      <div key={`gradient-box-${player.id}`} className="relative">
                        <PlayerBox 
                          player={player}
                          size="md"
                          showPositions={true}
                          className="rounded-xl shadow-lg border-2 border-white p-4"
                          style={{ 
                            background: `linear-gradient(135deg, ${playerColorHex}25, ${playerColorHex}08)` 
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Dark Theme Colored Player Boxes */}
            <div>
              <h3 className="text-lg font-medium mb-3">Dark Theme Colored Player Boxes</h3>
              <div className="bg-gray-800 p-6 rounded-lg space-y-4">
                <p className="text-sm text-gray-300 mb-4">PlayerBox components with colored backgrounds for dark themes</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {samplePlayers.slice(1, 5).map((player) => {
                    const playerColorHex = (() => {
                      const colorMap: Record<string, string> = {
                        'bg-red-500': '#ef4444', 'bg-red-600': '#dc2626',
                        'bg-orange-500': '#f97316', 'bg-orange-600': '#ea580c',
                        'bg-yellow-600': '#ca8a04', 'bg-amber-600': '#d97706',
                        'bg-green-600': '#16a34a', 'bg-green-700': '#15803d',
                        'bg-teal-600': '#0d9488', 'bg-cyan-600': '#0891b2',
                        'bg-blue-500': '#3b82f6', 'bg-blue-600': '#2563eb',
                        'bg-purple-500': '#a855f7', 'bg-purple-600': '#9333ea'
                      };
                      return colorMap[player.avatarColor || 'bg-gray-500'] || '#6b7280';
                    })();

                    return (
                      <div key={`dark-theme-${player.id}`} className="relative">
                        <PlayerBox 
                          player={player}
                          size="md"
                          showPositions={true}
                          className="[&_.player-name]:text-white [&_.player-positions]:text-gray-200 rounded-xl shadow-2xl border-2 p-5"
                          style={{ 
                            backgroundColor: `${playerColorHex}30`,
                            borderColor: `${playerColorHex}50`
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Minimal Colored Player Boxes */}
            <div>
              <h3 className="text-lg font-medium mb-3">Minimal Colored Player Boxes</h3>
              <div className="bg-white p-6 rounded-lg border space-y-4">
                <p className="text-sm text-gray-600 mb-4">Clean minimal design with subtle colored backgrounds</p>
                {samplePlayers.slice(0, 4).map((player) => {
                  const playerColorHex = (() => {
                    const colorMap: Record<string, string> = {
                      'bg-red-500': '#ef4444', 'bg-red-600': '#dc2626',
                      'bg-orange-500': '#f97316', 'bg-orange-600': '#ea580c',
                      'bg-yellow-600': '#ca8a04', 'bg-amber-600': '#d97706',
                      'bg-green-600': '#16a34a', 'bg-green-700': '#15803d',
                      'bg-teal-600': '#0d9488', 'bg-cyan-600': '#0891b2',
                      'bg-blue-500': '#3b82f6', 'bg-blue-600': '#2563eb',
                      'bg-purple-500': '#a855f7', 'bg-purple-600': '#9333ea'
                    };
                    return colorMap[player.avatarColor || 'bg-gray-500'] || '#6b7280';
                  })();

                  return (
                    <div key={`minimal-box-${player.id}`} className="relative">
                      <PlayerBox 
                        player={player}
                        size="sm"
                        showPositions={true}
                        className="rounded-lg border shadow-sm p-4"
                        style={{ 
                          backgroundColor: `${playerColorHex}08`,
                          borderColor: `${playerColorHex}15`
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Premium Luxury */}
            <div>
              <h3 className="text-lg font-medium mb-3">Premium Luxury</h3>
              <div className="bg-slate-50 p-6 rounded-lg space-y-4">
                <p className="text-sm text-gray-600 mb-4">High-end styling with metallic accents</p>
                {samplePlayers.slice(2, 5).map((player) => (
                  <div key={`luxury-${player.id}`} className="relative">
                    <PlayerBox 
                      player={player}
                      size="lg"
                      showPositions={true}
                      className="[&>div>div:first-child]:border-4 [&>div>div:first-child]:border-slate-200 [&>div>div:first-child]:shadow-xl [&>div>div:first-child]:shadow-slate-500/30 [&>div>div:first-child]:ring-1 [&>div>div:first-child]:ring-slate-300"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* ========== QUICK ACCESS SECTION ========== */}
            <div className="border-t-4 border-blue-500 pt-8 mt-12">
              <h2 className="text-3xl font-bold mb-6 text-blue-600">Quick Access: Hover Comparisons</h2>
              <p className="text-lg text-gray-700 mb-8">
                Quick comparison section for testing different hover effects - these are the most commonly requested styles.
              </p>

              {/* Background Darkening Hover Effects */}
              <div className="mb-10">
                <h3 className="text-2xl font-medium mb-4 text-gray-800">Background Darkening Hover Effects</h3>
                <div className="bg-white p-6 rounded-lg border space-y-6">
                  <p className="text-sm text-gray-600 mb-4">Hover effects that darken the background color (similar to games list) instead of changing shadows</p>
                  
                  {/* Light Background Darkening */}
                  <div>
                    <h4 className="text-lg font-medium mb-3 text-gray-700">Light Background Darkening</h4>
                    <div className="space-y-3">
                      {samplePlayers.slice(0, 3).map((player) => {
                        const playerColorHex = (() => {
                          const colorMap: Record<string, string> = {
                            'bg-red-500': '#ef4444', 'bg-red-600': '#dc2626',
                            'bg-orange-500': '#f97316', 'bg-orange-600': '#ea580c',
                            'bg-yellow-600': '#ca8a04', 'bg-amber-600': '#d97706',
                            'bg-green-600': '#16a34a', 'bg-green-700': '#15803d',
                            'bg-teal-600': '#0d9488', 'bg-cyan-600': '#0891b2',
                            'bg-blue-500': '#3b82f6', 'bg-blue-600': '#2563eb',
                            'bg-purple-500': '#a855f7', 'bg-purple-600': '#9333ea'
                          };
                          return colorMap[player.avatarColor || 'bg-gray-500'] || '#6b7280';
                        })();

                        return (
                          <div key={`quick-bg-darken-light-${player.id}`} className="relative">
                            <div 
                              className="rounded-lg border-2 transition-all duration-300 cursor-pointer hover:brightness-90 [&:hover_.player-avatar]:brightness-[1.11]"
                              style={{ 
                                backgroundColor: `${playerColorHex}15`,
                                borderColor: `${playerColorHex}80`,
                                color: playerColorHex
                              }}
                            >
                              <PlayerBox 
                                player={player}
                                size="md"
                                showPositions={true}
                                className="[&>div]:bg-transparent [&>div]:border-0 [&>div]:shadow-none [&>div]:cursor-pointer [&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Medium Background Darkening */}
                  <div>
                    <h4 className="text-lg font-medium mb-3 text-gray-700">Medium Background Darkening</h4>
                    <div className="space-y-3">
                      {samplePlayers.slice(1, 4).map((player) => {
                        const playerColorHex = (() => {
                          const colorMap: Record<string, string> = {
                            'bg-red-500': '#ef4444', 'bg-red-600': '#dc2626',
                            'bg-orange-500': '#f97316', 'bg-orange-600': '#ea580c',
                            'bg-yellow-600': '#ca8a04', 'bg-amber-600': '#d97706',
                            'bg-green-600': '#16a34a', 'bg-green-700': '#15803d',
                            'bg-teal-600': '#0d9488', 'bg-cyan-600': '#0891b2',
                            'bg-blue-500': '#3b82f6', 'bg-blue-600': '#2563eb',
                            'bg-purple-500': '#a855f7', 'bg-purple-600': '#9333ea'
                          };
                          return colorMap[player.avatarColor || 'bg-gray-500'] || '#6b7280';
                        })();

                        return (
                          <div key={`quick-bg-darken-medium-${player.id}`} className="relative">
                            <div 
                              className="rounded-lg border-2 transition-all duration-300 cursor-pointer hover:brightness-75 [&:hover_.player-avatar]:brightness-[1.33]"
                              style={{ 
                                backgroundColor: `${playerColorHex}20`,
                                borderColor: `${playerColorHex}90`,
                                color: playerColorHex
                              }}
                            >
                              <PlayerBox 
                                player={player}
                                size="md"
                                showPositions={true}
                                className="[&>div]:bg-transparent [&>div]:border-0 [&>div]:shadow-none [&>div]:cursor-pointer [&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Combined Background Darkening + Shadow */}
                  <div>
                    <h4 className="text-lg font-medium mb-3 text-gray-700">Combined Background Darkening + Shadow</h4>
                    <div className="space-y-3">
                      {samplePlayers.slice(0, 3).map((player) => {
                        const playerColorHex = (() => {
                          const colorMap: Record<string, string> = {
                            'bg-red-500': '#ef4444', 'bg-red-600': '#dc2626',
                            'bg-orange-500': '#f97316', 'bg-orange-600': '#ea580c',
                            'bg-yellow-600': '#ca8a04', 'bg-amber-600': '#d97706',
                            'bg-green-600': '#16a34a', 'bg-green-700': '#15803d',
                            'bg-teal-600': '#0d9488', 'bg-cyan-600': '#0891b2',
                            'bg-blue-500': '#3b82f6', 'bg-blue-600': '#2563eb',
                            'bg-purple-500': '#a855f7', 'bg-purple-600': '#9333ea'
                          };
                          return colorMap[player.avatarColor || 'bg-gray-500'] || '#6b7280';
                        })();

                        return (
                          <div key={`quick-bg-darken-shadow-${player.id}`} className="relative">
                            <div 
                              className="rounded-lg border-2 shadow-sm transition-all duration-300 cursor-pointer hover:brightness-85 hover:shadow-lg [&:hover_.player-avatar]:brightness-[1.18]"
                              style={{ 
                                backgroundColor: `${playerColorHex}18`,
                                borderColor: `${playerColorHex}85`,
                                color: playerColorHex
                              }}
                            >
                              <PlayerBox 
                                player={player}
                                size="md"
                                showPositions={true}
                                className="[&>div]:bg-transparent [&>div]:border-0 [&>div]:shadow-none [&>div]:cursor-pointer [&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Subtle Shadow Variations */}
              <div className="mb-10">
                <h3 className="text-2xl font-medium mb-4 text-gray-800">Subtle Shadow Hover Variations</h3>
                <div className="bg-white p-6 rounded-lg border space-y-6">
                  <p className="text-sm text-gray-600 mb-4">More refined shadow hover effects for comparison with the standard app hover</p>
                  
                  {/* Current Standard */}
                  <div>
                    <h4 className="text-lg font-medium mb-3 text-gray-700">Current Standard (shadow-md → shadow-xl)</h4>
                    <div className="space-y-3">
                      {samplePlayers.slice(0, 3).map((player) => (
                        <div key={`quick-standard-${player.id}`} className="relative">
                          <PlayerBox 
                            player={player}
                            size="md"
                            showPositions={true}
                            className="[&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Smaller Shadow (md → lg) */}
                  <div>
                    <h4 className="text-lg font-medium mb-3 text-gray-700">Smaller Shadow (shadow-md → shadow-lg)</h4>
                    <div className="space-y-3">
                      {samplePlayers.slice(1, 4).map((player) => (
                        <div key={`quick-smaller-${player.id}`} className="relative">
                          <PlayerBox 
                            player={player}
                            size="md"
                            showPositions={true}
                            className="shadow-md transition-shadow duration-300 hover:shadow-lg cursor-pointer [&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Minimal Shadow Change */}
                  <div>
                    <h4 className="text-lg font-medium mb-3 text-gray-700">Minimal Shadow (shadow-sm → shadow-md)</h4>
                    <div className="space-y-3">
                      {samplePlayers.slice(0, 3).map((player) => (
                        <div key={`quick-minimal-${player.id}`} className="relative">
                          <PlayerBox 
                            player={player}
                            size="md"
                            showPositions={true}
                            className="shadow-sm transition-shadow duration-300 hover:shadow-md cursor-pointer [&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Soft Float Effect */}
                  <div>
                    <h4 className="text-lg font-medium mb-3 text-gray-700">Soft Float Effect (shadow + lift)</h4>
                    <div className="space-y-3">
                      {samplePlayers.slice(2, 5).map((player) => (
                        <div key={`quick-float-${player.id}`} className="relative">
                          <PlayerBox 
                            player={player}
                            size="md"
                            showPositions={true}
                            className="shadow transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer [&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Scale + Shadow */}
                  <div>
                    <h4 className="text-lg font-medium mb-3 text-gray-700">Scale + Shadow (scale + shadow-md → shadow-lg)</h4>
                    <div className="space-y-3">
                      {samplePlayers.slice(0, 3).map((player) => (
                        <div key={`quick-scale-${player.id}`} className="relative">
                          <PlayerBox 
                            player={player}
                            size="md"
                            showPositions={true}
                            className="shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer [&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Double Border Effect - White + Color */}
            <div>
              <h3 className="text-lg font-medium mb-3">Double Border - White + Color</h3>
              <div className="bg-white p-6 rounded-lg border space-y-4">
                <p className="text-sm text-gray-600 mb-4">White outer border with thin inner colored border matching avatar</p>
                {samplePlayers.slice(0, 5).map((player) => (
                  <div key={`double-white-color-${player.id}`} className="relative">
                    <PlayerBox 
                      player={player}
                      size="md"
                      showPositions={true}
                      className="[&>div>div:first-child]:border-4 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current [&>div>div:first-child]:shadow-lg [&>div>div:first-child]:shadow-black/20"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Triple Layer Border */}
            <div>
              <h3 className="text-lg font-medium mb-3">Triple Layer Border</h3>
              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <p className="text-sm text-gray-600 mb-4">White border, colored ring, plus shadow for maximum depth</p>
                {samplePlayers.slice(1, 4).map((player) => (
                  <div key={`triple-${player.id}`} className="relative">
                    <PlayerBox 
                      player={player}
                      size="lg"
                      showPositions={true}
                      className="[&>div>div:first-child]:border-[5px] [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-3 [&>div>div:first-child]:ring-current [&>div>div:first-child]:shadow-xl [&>div>div:first-child]:shadow-current/25"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Subtle Double Border */}
            <div>
              <h3 className="text-lg font-medium mb-3">Subtle Double Border</h3>
              <div className="bg-white p-6 rounded-lg border space-y-4">
                <p className="text-sm text-gray-600 mb-4">Thinner borders for a more refined look</p>
                {samplePlayers.slice(0, 4).map((player) => (
                  <div key={`subtle-double-${player.id}`} className="relative">
                    <PlayerBox 
                      player={player}
                      size="md"
                      showPositions={true}
                      className="[&>div>div:first-child]:border-3 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-1 [&>div>div:first-child]:ring-current [&>div>div:first-child]:shadow-md [&>div>div:first-child]:shadow-black/15"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Bold Double Border */}
            <div>
              <h3 className="text-lg font-medium mb-3">Bold Double Border</h3>
              <div className="bg-white p-6 rounded-lg border space-y-4">
                <p className="text-sm text-gray-600 mb-4">Thick white border with prominent colored inner ring</p>
                {samplePlayers.slice(2, 5).map((player) => (
                  <div key={`bold-double-${player.id}`} className="relative">
                    <PlayerBox 
                      player={player}
                      size="lg"
                      showPositions={true}
                      className="[&>div>div:first-child]:border-[6px] [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-4 [&>div>div:first-child]:ring-current [&>div>div:first-child]:shadow-2xl [&>div>div:first-child]:shadow-black/30"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Inverted Double Border */}
            <div>
              <h3 className="text-lg font-medium mb-3">Inverted Double Border</h3>
              <div className="bg-gray-800 p-6 rounded-lg space-y-4">
                <p className="text-sm text-gray-300 mb-4">Colored outer border with white inner ring on dark background</p>
                {samplePlayers.slice(1, 4).map((player) => (
                  <div key={`inverted-double-${player.id}`} className="relative">
                    <PlayerBox 
                      player={player}
                      size="md"
                      showPositions={true}
                      className="[&_.player-name]:text-white [&_.player-positions]:text-gray-300 [&>div>div:first-child]:border-4 [&>div>div:first-child]:border-current [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-white [&>div>div:first-child]:shadow-xl [&>div>div:first-child]:shadow-black/50"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Gradient Double Border */}
            <div>
              <h3 className="text-lg font-medium mb-3">Gradient Double Border</h3>
              <div className="bg-white p-6 rounded-lg border space-y-4">
                <p className="text-sm text-gray-600 mb-4">White border with gradient-colored inner ring effects</p>
                {samplePlayers.slice(0, 4).map((player, index) => (
                  <div key={`gradient-double-${player.id}`} className="relative">
                    <PlayerBox 
                      player={player}
                      size="md"
                      showPositions={true}
                      className={`[&>div>div:first-child]:border-4 [&>div>div:first-child]:border-white [&>div>div:first-child]:shadow-lg ${
                        index === 0 ? '[&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-blue-400 [&>div>div:first-child]:shadow-blue-200/40' :
                        index === 1 ? '[&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-green-400 [&>div>div:first-child]:shadow-green-200/40' :
                        index === 2 ? '[&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-purple-400 [&>div>div:first-child]:shadow-purple-200/40' :
                        '[&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-orange-400 [&>div>div:first-child]:shadow-orange-200/40'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Refined Double Border - Thin White */}
            <div>
              <h3 className="text-lg font-medium mb-3">Refined Double Border - Thin White</h3>
              <div className="bg-white p-6 rounded-lg border space-y-4">
                <p className="text-sm text-gray-600 mb-4">Thinner white outer border with colored inner ring for elegant refinement</p>
                {samplePlayers.slice(0, 5).map((player) => (
                  <div key={`refined-thin-${player.id}`} className="relative">
                    <PlayerBox 
                      player={player}
                      size="md"
                      showPositions={true}
                      className="[&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current [&>div>div:first-child]:shadow-lg [&>div>div:first-child]:shadow-black/15"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Ultra-Thin Double Border */}
            <div>
              <h3 className="text-lg font-medium mb-3">Ultra-Thin Double Border</h3>
              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <p className="text-sm text-gray-600 mb-4">Very thin borders for delicate, refined appearance</p>
                {samplePlayers.slice(1, 4).map((player) => (
                  <div key={`ultra-thin-${player.id}`} className="relative">
                    <PlayerBox 
                      player={player}
                      size="md"
                      showPositions={true}
                      className="[&>div>div:first-child]:border [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-1 [&>div>div:first-child]:ring-current [&>div>div:first-child]:shadow-md [&>div>div:first-child]:shadow-black/10"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Medium Thin Double Border */}
            <div>
              <h3 className="text-lg font-medium mb-3">Medium Thin Double Border</h3>
              <div className="bg-white p-6 rounded-lg border space-y-4">
                <p className="text-sm text-gray-600 mb-4">Balanced thin white border with subtle colored accent</p>
                {samplePlayers.slice(0, 4).map((player) => (
                  <div key={`medium-thin-${player.id}`} className="relative">
                    <PlayerBox 
                      player={player}
                      size="md"
                      showPositions={true}
                      className="[&>div>div:first-child]:border-[3px] [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-1 [&>div>div:first-child]:ring-current [&>div>div:first-child]:shadow-md [&>div>div:first-child]:shadow-black/12"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Asymmetric Double Border */}
            <div>
              <h3 className="text-lg font-medium mb-3">Asymmetric Double Border</h3>
              <div className="bg-white p-6 rounded-lg border space-y-4">
                <p className="text-sm text-gray-600 mb-4">Thin white border with thicker colored ring for emphasis</p>
                {samplePlayers.slice(2, 5).map((player) => (
                  <div key={`asymmetric-${player.id}`} className="relative">
                    <PlayerBox 
                      player={player}
                      size="md"
                      showPositions={true}
                      className="[&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-[3px] [&>div>div:first-child]:ring-current [&>div>div:first-child]:shadow-lg [&>div>div:first-child]:shadow-current/20"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Soft Thin Double Border */}
            <div>
              <h3 className="text-lg font-medium mb-3">Soft Thin Double Border</h3>
              <div className="bg-slate-50 p-6 rounded-lg space-y-4">
                <p className="text-sm text-gray-600 mb-4">Gentle thin borders with soft shadows for professional look</p>
                {samplePlayers.slice(1, 5).map((player) => (
                  <div key={`soft-thin-${player.id}`} className="relative">
                    <PlayerBox 
                      player={player}
                      size="md"
                      showPositions={true}
                      className="[&>div>div:first-child]:border-2 [&>div>div:first-child]:border-slate-200 [&>div>div:first-child]:ring-1 [&>div>div:first-child]:ring-current [&>div>div:first-child]:shadow-md [&>div>div:first-child]:shadow-slate-300/40"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Crisp Thin Double Border */}
            <div>
              <h3 className="text-lg font-medium mb-3">Crisp Thin Double Border</h3>
              <div className="bg-white p-6 rounded-lg border space-y-4">
                <p className="text-sm text-gray-600 mb-4">Sharp, clean thin borders with high contrast</p>
                {samplePlayers.slice(0, 3).map((player) => (
                  <div key={`crisp-thin-${player.id}`} className="relative">
                    <PlayerBox 
                      player={player}
                      size="lg"
                      showPositions={true}
                      className="[&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current [&>div>div:first-child]:shadow-lg [&>div>div:first-child]:shadow-black/25"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Crisp Thin Double Border - Medium */}
            <div>
              <h3 className="text-lg font-medium mb-3">Crisp Thin Double Border - Medium</h3>
              <div className="bg-white p-6 rounded-lg border space-y-4">
                <p className="text-sm text-gray-600 mb-4">Sharp, clean thin borders with medium-sized avatars</p>
                {samplePlayers.slice(1, 5).map((player) => (
                  <div key={`crisp-thin-medium-${player.id}`} className="relative">
                    <PlayerBox 
                      player={player}
                      size="md"
                      showPositions={true}
                      className="[&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current [&>div>div:first-child]:shadow-lg [&>div>div:first-child]:shadow-black/25"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Crisp Thin Double Border - Medium with Hover Effects */}
            <div>
              <h3 className="text-lg font-medium mb-3">Crisp Thin Double Border - Medium with Hover Effects</h3>
              <div className="bg-white p-6 rounded-lg border space-y-6">
                <p className="text-sm text-gray-600 mb-4">Interactive hover effects on the crisp thin double border style (now using consistent app-wide hover pattern)</p>
                
                {/* Standard Hover Effect */}
                <div>
                  <h4 className="text-md font-medium mb-2 text-gray-700">Standard App Hover Effect</h4>
                  <div className="space-y-3">
                    {samplePlayers.slice(0, 3).map((player) => (
                      <div key={`hover-shadow-crisp-${player.id}`} className="relative">
                        <PlayerBox 
                          player={player}
                          size="md"
                          showPositions={true}
                          className="[&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current [&>div>div:first-child]:shadow-lg [&>div>div:first-child]:shadow-black/25"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                
              </div>
            </div>

            {/* Background Darkening Hover Effects */}
            <div>
              <h3 className="text-lg font-medium mb-3">Background Darkening Hover Effects</h3>
              <div className="bg-white p-6 rounded-lg border space-y-6">
                <p className="text-sm text-gray-600 mb-4">Hover effects that darken the background color (similar to games list) instead of changing shadows</p>
                
                {/* Light Background Darkening */}
                <div>
                  <h4 className="text-md font-medium mb-2 text-gray-700">Light Background Darkening</h4>
                  <div className="space-y-3">
                    {samplePlayers.slice(0, 3).map((player) => {
                      const playerColorHex = (() => {
                        const colorMap: Record<string, string> = {
                          'bg-red-500': '#ef4444', 'bg-red-600': '#dc2626',
                          'bg-orange-500': '#f97316', 'bg-orange-600': '#ea580c',
                          'bg-yellow-600': '#ca8a04', 'bg-amber-600': '#d97706',
                          'bg-green-600': '#16a34a', 'bg-green-700': '#15803d',
                          'bg-teal-600': '#0d9488', 'bg-cyan-600': '#0891b2',
                          'bg-blue-500': '#3b82f6', 'bg-blue-600': '#2563eb',
                          'bg-purple-500': '#a855f7', 'bg-purple-600': '#9333ea'
                        };
                        return colorMap[player.avatarColor || 'bg-gray-500'] || '#6b7280';
                      })();

                      return (
                        <div key={`bg-darken-light-${player.id}`} className="relative">
                          <div 
                            className="rounded-lg border-2 transition-all duration-300 cursor-pointer hover:brightness-90 [&:hover_.player-avatar]:brightness-[1.11]"
                            style={{ 
                              backgroundColor: `${playerColorHex}15`,
                              borderColor: `${playerColorHex}80`,
                              color: playerColorHex
                            }}
                          >
                            <PlayerBox 
                              player={player}
                              size="md"
                              showPositions={true}
                              className="[&>div]:bg-transparent [&>div]:border-0 [&>div]:shadow-none [&>div]:cursor-pointer [&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Medium Background Darkening */}
                <div>
                  <h4 className="text-md font-medium mb-2 text-gray-700">Medium Background Darkening</h4>
                  <div className="space-y-3">
                    {samplePlayers.slice(1, 4).map((player) => {
                      const playerColorHex = (() => {
                        const colorMap: Record<string, string> = {
                          'bg-red-500': '#ef4444', 'bg-red-600': '#dc2626',
                          'bg-orange-500': '#f97316', 'bg-orange-600': '#ea580c',
                          'bg-yellow-600': '#ca8a04', 'bg-amber-600': '#d97706',
                          'bg-green-600': '#16a34a', 'bg-green-700': '#15803d',
                          'bg-teal-600': '#0d9488', 'bg-cyan-600': '#0891b2',
                          'bg-blue-500': '#3b82f6', 'bg-blue-600': '#2563eb',
                          'bg-purple-500': '#a855f7', 'bg-purple-600': '#9333ea'
                        };
                        return colorMap[player.avatarColor || 'bg-gray-500'] || '#6b7280';
                      })();

                      return (
                        <div key={`bg-darken-medium-${player.id}`} className="relative">
                          <div 
                            className="rounded-lg border-2 transition-all duration-300 cursor-pointer hover:brightness-75 [&:hover_.player-avatar]:brightness-[1.33]"
                            style={{ 
                              backgroundColor: `${playerColorHex}20`,
                              borderColor: `${playerColorHex}90`,
                              color: playerColorHex
                            }}
                          >
                            <PlayerBox 
                              player={player}
                              size="md"
                              showPositions={true}
                              className="[&>div]:bg-transparent [&>div]:border-0 [&>div]:shadow-none [&>div]:cursor-pointer [&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Strong Background Darkening */}
                <div>
                  <h4 className="text-md font-medium mb-2 text-gray-700">Strong Background Darkening</h4>
                  <div className="space-y-3">
                    {samplePlayers.slice(2, 5).map((player) => {
                      const playerColorHex = (() => {
                        const colorMap: Record<string, string> = {
                          'bg-red-500': '#ef4444', 'bg-red-600': '#dc2626',
                          'bg-orange-500': '#f97316', 'bg-orange-600': '#ea580c',
                          'bg-yellow-600': '#ca8a04', 'bg-amber-600': '#d97706',
                          'bg-green-600': '#16a34a', 'bg-green-700': '#15803d',
                          'bg-teal-600': '#0d9488', 'bg-cyan-600': '#0891b2',
                          'bg-blue-500': '#3b82f6', 'bg-blue-600': '#2563eb',
                          'bg-purple-500': '#a855f7', 'bg-purple-600': '#9333ea'
                        };
                        return colorMap[player.avatarColor || 'bg-gray-500'] || '#6b7280';
                      })();

                      return (
                        <div key={`bg-darken-strong-${player.id}`} className="relative">
                          <div 
                            className="rounded-lg border-2 transition-all duration-300 cursor-pointer hover:brightness-50 [&:hover_.player-avatar]:brightness-[2.0]"
                            style={{ 
                              backgroundColor: `${playerColorHex}25`,
                              borderColor: `${playerColorHex}A0`,
                              color: playerColorHex
                            }}
                          >
                            <PlayerBox 
                              player={player}
                              size="md"
                              showPositions={true}
                              className="[&>div]:bg-transparent [&>div]:border-0 [&>div]:shadow-none [&>div]:cursor-pointer [&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Combined Background Darkening + Shadow */}
                <div>
                  <h4 className="text-md font-medium mb-2 text-gray-700">Combined Background Darkening + Shadow</h4>
                  <div className="space-y-3">
                    {samplePlayers.slice(0, 3).map((player) => {
                      const playerColorHex = (() => {
                        const colorMap: Record<string, string> = {
                          'bg-red-500': '#ef4444', 'bg-red-600': '#dc2626',
                          'bg-orange-500': '#f97316', 'bg-orange-600': '#ea580c',
                          'bg-yellow-600': '#ca8a04', 'bg-amber-600': '#d97706',
                          'bg-green-600': '#16a34a', 'bg-green-700': '#15803d',
                          'bg-teal-600': '#0d9488', 'bg-cyan-600': '#0891b2',
                          'bg-blue-500': '#3b82f6', 'bg-blue-600': '#2563eb',
                          'bg-purple-500': '#a855f7', 'bg-purple-600': '#9333ea'
                        };
                        return colorMap[player.avatarColor || 'bg-gray-500'] || '#6b7280';
                      })();

                      return (
                        <div key={`bg-darken-shadow-${player.id}`} className="relative">
                          <div 
                            className="rounded-lg border-2 shadow-sm transition-all duration-300 cursor-pointer hover:shadow-lg"
                            style={{ 
                              backgroundColor: `${playerColorHex}18`,
                              borderColor: `${playerColorHex}85`,
                              color: playerColorHex
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = `${playerColorHex}25`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = `${playerColorHex}18`;
                            }}
                          >
                            <PlayerBox 
                              player={player}
                              size="md"
                              showPositions={true}
                              className="[&>div]:bg-transparent [&>div]:border-0 [&>div]:shadow-none [&>div]:cursor-pointer [&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Subtle Shadow Variations */}
            <div>
              <h3 className="text-lg font-medium mb-3">Subtle Shadow Hover Variations</h3>
              <div className="bg-white p-6 rounded-lg border space-y-6">
                <p className="text-sm text-gray-600 mb-4">More refined shadow hover effects for comparison with the standard app hover</p>
                
                {/* Minimal Shadow Change */}
                <div>
                  <h4 className="text-md font-medium mb-2 text-gray-700">Minimal Shadow Change</h4>
                  <div className="space-y-3">
                    {samplePlayers.slice(0, 3).map((player) => (
                      <div key={`subtle-minimal-${player.id}`} className="relative">
                        <PlayerBox 
                          player={player}
                          size="md"
                          showPositions={true}
                          className="shadow-sm transition-shadow duration-300 hover:shadow-md cursor-pointer [&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gentle Shadow Lift */}
                <div>
                  <h4 className="text-md font-medium mb-2 text-gray-700">Gentle Shadow Lift</h4>
                  <div className="space-y-3">
                    {samplePlayers.slice(1, 4).map((player) => (
                      <div key={`subtle-gentle-${player.id}`} className="relative">
                        <PlayerBox 
                          player={player}
                          size="md"
                          showPositions={true}
                          className="shadow-md transition-shadow duration-200 hover:shadow-lg cursor-pointer [&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Soft Float Effect */}
                <div>
                  <h4 className="text-md font-medium mb-2 text-gray-700">Soft Float Effect</h4>
                  <div className="space-y-3">
                    {samplePlayers.slice(2, 5).map((player) => (
                      <div key={`subtle-float-${player.id}`} className="relative">
                        <PlayerBox 
                          player={player}
                          size="md"
                          showPositions={true}
                          className="shadow transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer [&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Warm Shadow Glow */}
                <div>
                  <h4 className="text-md font-medium mb-2 text-gray-700">Warm Shadow Glow</h4>
                  <div className="space-y-3">
                    {samplePlayers.slice(0, 4).map((player, index) => (
                      <div key={`subtle-glow-${player.id}`} className="relative">
                        <PlayerBox 
                          player={player}
                          size="md"
                          showPositions={true}
                          className={`${
                            index === 0 ? 'shadow-sm hover:shadow-blue-200/60' :
                            index === 1 ? 'shadow-sm hover:shadow-orange-200/60' :
                            index === 2 ? 'shadow-sm hover:shadow-teal-200/60' :
                            'shadow-sm hover:shadow-yellow-200/60'
                          } shadow-sm transition-shadow duration-300 hover:shadow-lg cursor-pointer [&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ultra Subtle */}
                <div>
                  <h4 className="text-md font-medium mb-2 text-gray-700">Ultra Subtle</h4>
                  <div className="space-y-3">
                    {samplePlayers.slice(1, 4).map((player) => (
                      <div key={`ultra-subtle-${player.id}`} className="relative">
                        <PlayerBox 
                          player={player}
                          size="md"
                          showPositions={true}
                          className="shadow-sm transition-shadow duration-500 hover:shadow cursor-pointer [&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scale + Shadow */}
                <div>
                  <h4 className="text-md font-medium mb-2 text-gray-700">Scale + Shadow</h4>
                  <div className="space-y-3">
                    {samplePlayers.slice(0, 3).map((player) => (
                      <div key={`scale-shadow-${player.id}`} className="relative">
                        <PlayerBox 
                          player={player}
                          size="md"
                          showPositions={true}
                          className="shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] cursor-pointer [&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Outer PlayerBox Shadow Effects Collection */}
            <div>
              <h3 className="text-lg font-medium mb-3">Outer PlayerBox Shadow Effects</h3>
              <div className="bg-white p-6 rounded-lg border space-y-6">
                <p className="text-sm text-gray-600 mb-4">Various shadow effects applied to the entire PlayerBox container</p>
                
                {/* Subtle Outer Shadow */}
                <div>
                  <h4 className="text-md font-medium mb-2 text-gray-700">Subtle Outer Shadow</h4>
                  <div className="space-y-3">
                    {samplePlayers.slice(0, 3).map((player) => (
                      <div key={`subtle-outer-${player.id}`} className="relative">
                        <PlayerBox 
                          player={player}
                          size="md"
                          showPositions={true}
                          className="shadow-sm [&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-1 [&>div>div:first-child]:ring-current"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Medium Outer Shadow */}
                <div>
                  <h4 className="text-md font-medium mb-2 text-gray-700">Medium Outer Shadow</h4>
                  <div className="space-y-3">
                    {samplePlayers.slice(1, 4).map((player) => (
                      <div key={`medium-outer-${player.id}`} className="relative">
                        <PlayerBox 
                          player={player}
                          size="md"
                          showPositions={true}
                          className="shadow-md [&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strong Outer Shadow */}
                <div>
                  <h4 className="text-md font-medium mb-2 text-gray-700">Strong Outer Shadow</h4>
                  <div className="space-y-3">
                    {samplePlayers.slice(2, 5).map((player) => (
                      <div key={`strong-outer-${player.id}`} className="relative">
                        <PlayerBox 
                          player={player}
                          size="md"
                          showPositions={true}
                          className="shadow-lg [&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Extra Strong Outer Shadow */}
                <div>
                  <h4 className="text-md font-medium mb-2 text-gray-700">Extra Strong Outer Shadow</h4>
                  <div className="space-y-3">
                    {samplePlayers.slice(0, 3).map((player) => (
                      <div key={`extra-strong-outer-${player.id}`} className="relative">
                        <PlayerBox 
                          player={player}
                          size="md"
                          showPositions={true}
                          className="shadow-xl [&>div>div:first-child]:border-3 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dramatic Outer Shadow */}
                <div>
                  <h4 className="text-md font-medium mb-2 text-gray-700">Dramatic Outer Shadow</h4>
                  <div className="space-y-3">
                    {samplePlayers.slice(1, 4).map((player) => (
                      <div key={`dramatic-outer-${player.id}`} className="relative">
                        <PlayerBox 
                          player={player}
                          size="md"
                          showPositions={true}
                          className="shadow-2xl [&>div>div:first-child]:border-3 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Colored Outer Shadows */}
            <div>
              <h3 className="text-lg font-medium mb-3">Colored Outer Shadow Effects</h3>
              <div className="bg-white p-6 rounded-lg border space-y-6">
                <p className="text-sm text-gray-600 mb-4">PlayerBox shadows that match or complement avatar colors</p>
                
                {/* Matching Color Shadows */}
                <div>
                  <h4 className="text-md font-medium mb-2 text-gray-700">Matching Color Shadows</h4>
                  <div className="space-y-3">
                    {samplePlayers.slice(0, 4).map((player, index) => (
                      <div key={`colored-shadow-${player.id}`} className="relative">
                        <PlayerBox 
                          player={player}
                          size="md"
                          showPositions={true}
                          className={`${
                            index === 0 ? 'shadow-lg shadow-blue-200/60' :
                            index === 1 ? 'shadow-lg shadow-orange-200/60' :
                            index === 2 ? 'shadow-lg shadow-teal-200/60' :
                            'shadow-lg shadow-yellow-200/60'
                          } [&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Darker Color Shadows */}
                <div>
                  <h4 className="text-md font-medium mb-2 text-gray-700">Darker Color Shadows</h4>
                  <div className="space-y-3">
                    {samplePlayers.slice(1, 5).map((player, index) => (
                      <div key={`dark-colored-shadow-${player.id}`} className="relative">
                        <PlayerBox 
                          player={player}
                          size="md"
                          showPositions={true}
                          className={`${
                            index === 0 ? 'shadow-xl shadow-orange-400/40' :
                            index === 1 ? 'shadow-xl shadow-teal-400/40' :
                            index === 2 ? 'shadow-xl shadow-yellow-400/40' :
                            'shadow-xl shadow-green-400/40'
                          } [&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Glow Effects */}
            <div>
              <h3 className="text-lg font-medium mb-3">Glow Effects on PlayerBox</h3>
              <div className="bg-gray-900 p-6 rounded-lg space-y-6">
                <p className="text-sm text-gray-300 mb-4">Subtle glow effects for dramatic presentation</p>
                
                {/* Soft Glow */}
                <div>
                  <h4 className="text-md font-medium mb-2 text-gray-200">Soft Glow</h4>
                  <div className="space-y-3">
                    {samplePlayers.slice(0, 3).map((player, index) => (
                      <div key={`soft-glow-${player.id}`} className="relative">
                        <PlayerBox 
                          player={player}
                          size="md"
                          showPositions={true}
                          className={`${
                            index === 0 ? 'shadow-lg shadow-blue-500/25' :
                            index === 1 ? 'shadow-lg shadow-orange-500/25' :
                            'shadow-lg shadow-teal-500/25'
                          } [&_.player-name]:text-white [&_.player-positions]:text-gray-300 [&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-1 [&>div>div:first-child]:ring-current`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Intense Glow */}
                <div>
                  <h4 className="text-md font-medium mb-2 text-gray-200">Intense Glow</h4>
                  <div className="space-y-3">
                    {samplePlayers.slice(2, 5).map((player, index) => (
                      <div key={`intense-glow-${player.id}`} className="relative">
                        <PlayerBox 
                          player={player}
                          size="md"
                          showPositions={true}
                          className={`${
                            index === 0 ? 'shadow-2xl shadow-teal-400/40' :
                            index === 1 ? 'shadow-2xl shadow-yellow-400/40' :
                            'shadow-2xl shadow-green-400/40'
                          } [&_.player-name]:text-white [&_.player-positions]:text-gray-300 [&>div>div:first-child]:border-3 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Border Radius Effects */}
            <div>
              <h3 className="text-lg font-medium mb-3">Border Radius Variations</h3>
              <div className="bg-white p-6 rounded-lg border space-y-6">
                <p className="text-sm text-gray-600 mb-4">Different border radius effects on PlayerBox containers</p>
                
                {/* Sharp Corners */}
                <div>
                  <h4 className="text-md font-medium mb-2 text-gray-700">Sharp Corners</h4>
                  <div className="space-y-3">
                    {samplePlayers.slice(0, 2).map((player) => (
                      <div key={`sharp-${player.id}`} className="relative">
                        <PlayerBox 
                          player={player}
                          size="md"
                          showPositions={true}
                          className="rounded-none shadow-md [&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Small Radius */}
                <div>
                  <h4 className="text-md font-medium mb-2 text-gray-700">Small Radius</h4>
                  <div className="space-y-3">
                    {samplePlayers.slice(1, 3).map((player) => (
                      <div key={`small-radius-${player.id}`} className="relative">
                        <PlayerBox 
                          player={player}
                          size="md"
                          showPositions={true}
                          className="rounded-sm shadow-md [&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Large Radius */}
                <div>
                  <h4 className="text-md font-medium mb-2 text-gray-700">Large Radius</h4>
                  <div className="space-y-3">
                    {samplePlayers.slice(2, 4).map((player) => (
                      <div key={`large-radius-${player.id}`} className="relative">
                        <PlayerBox 
                          player={player}
                          size="md"
                          showPositions={true}
                          className="rounded-xl shadow-md [&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Extra Large Radius */}
                <div>
                  <h4 className="text-md font-medium mb-2 text-gray-700">Extra Large Radius</h4>
                  <div className="space-y-3">
                    {samplePlayers.slice(3, 5).map((player) => (
                      <div key={`xl-radius-${player.id}`} className="relative">
                        <PlayerBox 
                          player={player}
                          size="md"
                          showPositions={true}
                          className="rounded-2xl shadow-md [&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Elevated Card Effects */}
            <div>
              <h3 className="text-lg font-medium mb-3">Elevated Card Effects</h3>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg space-y-6">
                <p className="text-sm text-gray-600 mb-4">PlayerBox components styled as elevated cards with various heights</p>
                
                {/* Level 1 Elevation */}
                <div>
                  <h4 className="text-md font-medium mb-2 text-gray-700">Level 1 Elevation</h4>
                  <div className="space-y-3">
                    {samplePlayers.slice(0, 2).map((player) => (
                      <div key={`elevation-1-${player.id}`} className="relative">
                        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                          <PlayerBox 
                            player={player}
                            size="md"
                            showPositions={true}
                            className="[&>div]:bg-transparent [&>div]:border-0 [&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-1 [&>div>div:first-child]:ring-current"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Level 2 Elevation */}
                <div>
                  <h4 className="text-md font-medium mb-2 text-gray-700">Level 2 Elevation</h4>
                  <div className="space-y-3">
                    {samplePlayers.slice(1, 3).map((player) => (
                      <div key={`elevation-2-${player.id}`} className="relative">
                        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                          <PlayerBox 
                            player={player}
                            size="md"
                            showPositions={true}
                            className="[&>div]:bg-transparent [&>div]:border-0 [&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Level 3 Elevation */}
                <div>
                  <h4 className="text-md font-medium mb-2 text-gray-700">Level 3 Elevation</h4>
                  <div className="space-y-3">
                    {samplePlayers.slice(2, 4).map((player) => (
                      <div key={`elevation-3-${player.id}`} className="relative">
                        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200">
                          <PlayerBox 
                            player={player}
                            size="md"
                            showPositions={true}
                            className="[&>div]:bg-transparent [&>div]:border-0 [&>div>div:first-child]:border-3 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Level 4 Elevation */}
                <div>
                  <h4 className="text-md font-medium mb-2 text-gray-700">Level 4 Elevation</h4>
                  <div className="space-y-3">
                    {samplePlayers.slice(3, 5).map((player) => (
                      <div key={`elevation-4-${player.id}`} className="relative">
                        <div className="bg-white rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-200">
                          <PlayerBox 
                            player={player}
                            size="md"
                            showPositions={true}
                            className="[&>div]:bg-transparent [&>div]:border-0 [&>div>div:first-child]:border-3 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            

            {/* Custom Shadow Patterns */}
            <div>
              <h3 className="text-lg font-medium mb-3">Custom Shadow Patterns</h3>
              <div className="bg-white p-6 rounded-lg border space-y-6">
                <p className="text-sm text-gray-600 mb-4">Unique shadow effects using custom CSS</p>
                
                {/* Multi-directional Shadows */}
                <div>
                  <h4 className="text-md font-medium mb-2 text-gray-700">Multi-directional Shadows</h4>
                  <div className="space-y-3">
                    {samplePlayers.slice(0, 2).map((player) => (
                      <div key={`multi-shadow-${player.id}`} className="relative">
                        <PlayerBox 
                          player={player}
                          size="md"
                          showPositions={true}
                          className="[&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current"
                          style={{
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 2px 0 4px -1px rgba(0, 0, 0, 0.1), -2px 0 4px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inset Shadows */}
                <div>
                  <h4 className="text-md font-medium mb-2 text-gray-700">Inset Shadows</h4>
                  <div className="space-y-3">
                    {samplePlayers.slice(1, 3).map((player) => (
                      <div key={`inset-shadow-${player.id}`} className="relative">
                        <PlayerBox 
                          player={player}
                          size="md"
                          showPositions={true}
                          className="[&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current"
                          style={{
                            boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06), 0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gradient Shadows */}
                <div>
                  <h4 className="text-md font-medium mb-2 text-gray-700">Gradient Shadows</h4>
                  <div className="space-y-3">
                    {samplePlayers.slice(2, 4).map((player, index) => (
                      <div key={`gradient-shadow-${player.id}`} className="relative">
                        <PlayerBox 
                          player={player}
                          size="md"
                          showPositions={true}
                          className="[&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current"
                          style={{
                            boxShadow: index === 0 ? 
                              '0 10px 25px -5px rgba(59, 130, 246, 0.3), 0 4px 6px -2px rgba(59, 130, 246, 0.1)' :
                              '0 10px 25px -5px rgba(245, 158, 11, 0.3), 0 4px 6px -2px rgba(245, 158, 11, 0.1)'
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Double Border */}
            <div>
              <h3 className="text-lg font-medium mb-3">Professional Double Border</h3>
              <div className="bg-slate-100 p-6 rounded-lg space-y-4">
                <p className="text-sm text-gray-600 mb-4">Clean corporate styling with white and accent borders</p>
                {samplePlayers.slice(1, 5).map((player) => (
                  <div key={`professional-double-${player.id}`} className="relative">
                    <PlayerBox 
                      player={player}
                      size="md"
                      showPositions={true}
                      className="[&>div>div:first-child]:border-3 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-1 [&>div>div:first-child]:ring-slate-400 [&>div>div:first-child]:shadow-lg [&>div>div:first-child]:shadow-slate-300/50"
                    />
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