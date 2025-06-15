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
            <PlayerBox player={samplePlayers[0]} showPositions={false} />
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
            <PlayerBox player={samplePlayers[0]} size="sm" showPositions={false} />
            <PlayerBox player={samplePlayers[1]} size="sm" showPositions={false} />
            <PlayerBox player={samplePlayers[2]} size="sm" showPositions={false} />
            <PlayerBox player={samplePlayers[3]} size="sm" showPositions={false} />
            <PlayerBox player={samplePlayers[4]} size="sm" showPositions={false} />
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
                      className="[&_.player-avatar]:border-4 [&_.player-avatar]:border-white [&_.player-avatar]:shadow-lg [&_.player-avatar]:shadow-black/25"
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
                      className="[&_.player-avatar]:border-[5px] [&_.player-avatar]:border-white [&_.player-avatar]:shadow-xl [&_.player-avatar]:shadow-black/30"
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
                      className="[&_.player-name]:text-white [&_.player-positions]:text-gray-300 [&_.player-avatar]:border-4 [&_.player-avatar]:border-white [&_.player-avatar]:shadow-2xl [&_.player-avatar]:shadow-black/50"
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
                      className="[&_.player-avatar]:border-2 [&_.player-avatar]:border-white [&_.player-avatar]:shadow-md [&_.player-avatar]:shadow-black/15"
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
                      className="[&_.player-avatar]:border-3 [&_.player-avatar]:border-gray-200 [&_.player-avatar]:shadow-lg [&_.player-avatar]:shadow-gray-200/60"
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
                      className="[&_.player-avatar]:border-4 [&_.player-avatar]:border-white [&_.player-avatar]:ring-2 [&_.player-avatar]:ring-gray-300 [&_.player-avatar]:shadow-lg [&_.player-avatar]:shadow-black/20"
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
                      className="[&_.player-avatar]:shadow-sm [&_.player-avatar]:shadow-gray-400/30"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="w-24 text-sm font-medium">Medium:</span>
                    <PlayerBox 
                      player={samplePlayers[1]}
                      size="sm"
                      showPositions={false}
                      className="[&_.player-avatar]:shadow-md [&_.player-avatar]:shadow-gray-500/40"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="w-24 text-sm font-medium">Strong:</span>
                    <PlayerBox 
                      player={samplePlayers[2]}
                      size="sm"
                      showPositions={false}
                      className="[&_.player-avatar]:shadow-lg [&_.player-avatar]:shadow-gray-600/50"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="w-24 text-sm font-medium">Dramatic:</span>
                    <PlayerBox 
                      player={samplePlayers[3]}
                      size="sm"
                      showPositions={false}
                      className="[&_.player-avatar]:shadow-xl [&_.player-avatar]:shadow-gray-700/60"
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
                      className="[&_.player-avatar]:border-3 [&_.player-avatar]:border-current [&_.player-avatar]:shadow-lg [&_.player-avatar]:shadow-current/30"
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
                      className="[&_.player-avatar]:border [&_.player-avatar]:border-gray-100 [&_.player-avatar]:shadow-sm [&_.player-avatar]:shadow-gray-200/50"
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
                      className="[&_.player-avatar]:border-2 [&_.player-avatar]:border-white [&_.player-avatar]:shadow-lg [&_.player-avatar]:shadow-black/25 [&_.player-avatar]:ring-1 [&_.player-avatar]:ring-gray-200"
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
                      className="[&_.player-avatar]:shadow-2xl [&_.player-avatar]:shadow-black/30 [&_.player-avatar]:border-2 [&_.player-avatar]:border-white [&_.player-avatar]:translate-y-[-2px]"
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
                      className={`[&_.player-avatar]:border-2 [&_.player-avatar]:border-white [&_.player-avatar]:shadow-lg ${
                        index === 0 ? '[&_.player-avatar]:shadow-blue-200/60' :
                        index === 1 ? '[&_.player-avatar]:shadow-green-200/60' :
                        index === 2 ? '[&_.player-avatar]:shadow-purple-200/60' :
                        '[&_.player-avatar]:shadow-orange-200/60'
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
                      className="[&_.player-avatar]:border-3 [&_.player-avatar]:border-white [&_.player-avatar]:shadow-lg [&_.player-avatar]:shadow-black/20 [&_.player-avatar]:drop-shadow-md"
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
                      className="[&_.player-avatar]:border-4 [&_.player-avatar]:border-amber-100 [&_.player-avatar]:shadow-lg [&_.player-avatar]:shadow-amber-900/25"
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
                      className="[&_.player-avatar]:border-2 [&_.player-avatar]:border-gray-100 [&_.player-avatar]:shadow-none"
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
                      className={`[&_.player-avatar]:border-3 [&_.player-avatar]:shadow-lg ${
                        index === 0 ? '[&_.player-avatar]:border-red-200 [&_.player-avatar]:shadow-red-200/40' :
                        index === 1 ? '[&_.player-avatar]:border-blue-200 [&_.player-avatar]:shadow-blue-200/40' :
                        index === 2 ? '[&_.player-avatar]:border-green-200 [&_.player-avatar]:shadow-green-200/40' :
                        '[&_.player-avatar]:border-purple-200 [&_.player-avatar]:shadow-purple-200/40'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>

             {/* Colored Player Box with Consistent Backgrounds */}
             <div>
              <h3 className="text-lg font-medium mb-3">Basic Colored Player Boxes</h3>
              <div className="bg-white p-6 rounded-lg border space-y-4">
                <p className="text-sm text-gray-600 mb-4">PlayerBox components with consistent colored backgrounds</p>
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
                    <div key={`basic-colored-${player.id}`} className="relative">
                      <PlayerBox 
                        player={player}
                        size="md"
                        showPositions={true}
                        className="rounded-lg border-2 shadow-md p-4"
                        style={{ 
                          backgroundColor: `${playerColorHex}15`,
                          borderColor: `${playerColorHex}30`,
                          color: playerColorHex
                        }}
                      />
                    </div>
                  );
                })}
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
                      <div key={`large-colored-${player.id}`} className="relative">
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
                    <div key={`compact-colored-${player.id}`} className="relative">
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
                    <div key={`minimal-${player.id}`} className="relative">
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

          </div>
        </section>
      </div>
    </PageTemplate>
  );
}