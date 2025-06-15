
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

            {/* Colored Background Player Boxes */}
            <div>
              <h3 className="text-lg font-medium mb-3">Colored Background Player Boxes</h3>
              <div className="bg-white p-6 rounded-lg border space-y-4">
                <p className="text-sm text-gray-600 mb-4">PlayerBox components inside colored background containers with white avatar borders and shadows</p>
                {samplePlayers.slice(0, 5).map((player) => (
                  <div key={`colored-bg-${player.id}`} className="relative">
                    <div 
                      className="p-4 rounded-lg shadow-md"
                      style={{ backgroundColor: `${player.avatarColor?.replace('bg-', '#') || '#6b7280'}20` }}
                    >
                      <PlayerBox 
                        player={player}
                        size="md"
                        showPositions={true}
                        className="[&>div>div:first-child]:border-4 [&>div>div:first-child]:border-white [&>div>div:first-child]:shadow-lg"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Colored Background with Different Shadow Intensities */}
            <div>
              <h3 className="text-lg font-medium mb-3">Colored Background - Shadow Variations</h3>
              <div className="bg-white p-6 rounded-lg border space-y-6">
                <p className="text-sm text-gray-600 mb-4">Different shadow intensities on colored background boxes containing PlayerBox components</p>
                
                {/* Light Shadow */}
                <div>
                  <h4 className="text-md font-medium mb-3">Light Shadow</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {samplePlayers.slice(0, 3).map((player) => (
                      <div key={`light-shadow-${player.id}`} className="relative">
                        <div 
                          className="p-3 rounded-lg shadow-sm"
                          style={{ backgroundColor: `${player.avatarColor?.replace('bg-', '#') || '#6b7280'}15` }}
                        >
                          <PlayerBox 
                            player={player}
                            size="sm"
                            showPositions={true}
                            className="[&>div>div:first-child]:border-3 [&>div>div:first-child]:border-white [&>div>div:first-child]:shadow-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Medium Shadow */}
                <div>
                  <h4 className="text-md font-medium mb-3">Medium Shadow</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {samplePlayers.slice(1, 4).map((player) => (
                      <div key={`medium-shadow-${player.id}`} className="relative">
                        <div 
                          className="p-3 rounded-lg shadow-md"
                          style={{ backgroundColor: `${player.avatarColor?.replace('bg-', '#') || '#6b7280'}15` }}
                        >
                          <PlayerBox 
                            player={player}
                            size="sm"
                            showPositions={true}
                            className="[&>div>div:first-child]:border-3 [&>div>div:first-child]:border-white [&>div>div:first-child]:shadow-md"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strong Shadow */}
                <div>
                  <h4 className="text-md font-medium mb-3">Strong Shadow</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {samplePlayers.slice(2, 5).map((player) => (
                      <div key={`strong-shadow-${player.id}`} className="relative">
                        <div 
                          className="p-3 rounded-lg shadow-lg"
                          style={{ backgroundColor: `${player.avatarColor?.replace('bg-', '#') || '#6b7280'}15` }}
                        >
                          <PlayerBox 
                            player={player}
                            size="sm"
                            showPositions={true}
                            className="[&>div>div:first-child]:border-3 [&>div>div:first-child]:border-white [&>div>div:first-child]:shadow-lg"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Large Colored Background Player Boxes */}
            <div>
              <h3 className="text-lg font-medium mb-3">Large Colored Background Player Boxes</h3>
              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <p className="text-sm text-gray-600 mb-4">Larger PlayerBox components in colored containers with enhanced shadows</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {samplePlayers.slice(0, 4).map((player) => (
                    <div key={`large-colored-${player.id}`} className="relative">
                      <div 
                        className="p-6 rounded-xl shadow-xl"
                        style={{ backgroundColor: `${player.avatarColor?.replace('bg-', '#') || '#6b7280'}20` }}
                      >
                        <PlayerBox 
                          player={player}
                          size="lg"
                          showPositions={true}
                          className="[&>div>div:first-child]:border-4 [&>div>div:first-child]:border-white [&>div>div:first-child]:shadow-xl"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Compact Colored Background Cards */}
            <div>
              <h3 className="text-lg font-medium mb-3">Compact Colored Background Cards</h3>
              <div className="bg-white p-6 rounded-lg border space-y-4">
                <p className="text-sm text-gray-600 mb-4">Compact PlayerBox components in colored background containers</p>
                {samplePlayers.map((player) => (
                  <div key={`compact-colored-${player.id}`} className="relative">
                    <div 
                      className="p-3 rounded-lg shadow-md"
                      style={{ backgroundColor: `${player.avatarColor?.replace('bg-', '#') || '#6b7280'}15` }}
                    >
                      <PlayerBox 
                        player={player}
                        size="sm"
                        showPositions={true}
                        className="[&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:shadow-md"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dark Colored Backgrounds */}
            <div>
              <h3 className="text-lg font-medium mb-3">Dark Colored Backgrounds</h3>
              <div className="bg-gray-100 p-6 rounded-lg space-y-4">
                <p className="text-sm text-gray-600 mb-4">Darker colored backgrounds with enhanced white borders on PlayerBox components</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {samplePlayers.slice(0, 3).map((player) => (
                    <div key={`dark-colored-${player.id}`} className="relative">
                      <div 
                        className="p-5 rounded-lg shadow-lg"
                        style={{ backgroundColor: `${player.avatarColor?.replace('bg-', '#') || '#6b7280'}40` }}
                      >
                        <PlayerBox 
                          player={player}
                          size="md"
                          showPositions={true}
                          className="[&>div>div:first-child]:border-4 [&>div>div:first-child]:border-white [&>div>div:first-child]:shadow-xl"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Gradient Colored Backgrounds */}
            <div>
              <h3 className="text-lg font-medium mb-3">Gradient Colored Backgrounds</h3>
              <div className="bg-white p-6 rounded-lg border space-y-4">
                <p className="text-sm text-gray-600 mb-4">Subtle gradient backgrounds with PlayerBox components and varying border styles</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {samplePlayers.slice(1, 5).map((player, index) => (
                    <div key={`gradient-colored-${player.id}`} className="relative">
                      <div 
                        className="p-5 rounded-xl shadow-lg"
                        style={{ 
                          background: `linear-gradient(135deg, ${player.avatarColor?.replace('bg-', '#') || '#6b7280'}20, ${player.avatarColor?.replace('bg-', '#') || '#6b7280'}05)` 
                        }}
                      >
                        <PlayerBox 
                          player={player}
                          size="md"
                          showPositions={true}
                          className={index % 2 === 0 ? 
                            '[&>div>div:first-child]:border-4 [&>div>div:first-child]:border-white [&>div>div:first-child]:shadow-lg' : 
                            '[&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:shadow-xl [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-white/50'
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Minimal Colored Background */}
            <div>
              <h3 className="text-lg font-medium mb-3">Minimal Colored Background</h3>
              <div className="bg-white p-6 rounded-lg border space-y-4">
                <p className="text-sm text-gray-600 mb-4">Clean, minimal design with subtle colored backgrounds containing PlayerBox components</p>
                {samplePlayers.slice(0, 4).map((player) => (
                  <div key={`minimal-colored-${player.id}`} className="relative">
                    <div 
                      className="p-4 rounded-lg border border-gray-200 shadow-sm"
                      style={{ backgroundColor: `${player.avatarColor?.replace('bg-', '#') || '#6b7280'}08` }}
                    >
                      <PlayerBox 
                        player={player}
                        size="sm"
                        showPositions={true}
                        className="[&>div>div:first-child]:border-2 [&>div>div:first-child]:border-white [&>div>div:first-child]:shadow-sm"
                      />
                    </div>
                  </div>
                ))}
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
