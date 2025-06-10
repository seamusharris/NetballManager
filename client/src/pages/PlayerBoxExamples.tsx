
import React from 'react';
import { Helmet } from 'react-helmet';
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
    <div className="container mx-auto py-6">
      <Helmet>
        <title>PlayerBox Examples - Emerald Netball</title>
      </Helmet>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">PlayerBox Examples</h1>
        <p className="text-muted-foreground mt-2">
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
      </div>
    </div>
  );
}

export default function PlayerBoxExamples() {
  // Example player data
  const examplePlayers = [
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
      avatarColor: "bg-green-500",
      active: true
    },
    {
      id: 3,
      displayName: "Kate Brown",
      firstName: "Kate",
      lastName: "Brown", 
      positionPreferences: ["GK", "GD"],
      avatarColor: "bg-purple-500",
      active: true
    },
    {
      id: 4,
      displayName: "Lily Chen",
      firstName: "Lily",
      lastName: "Chen",
      positionPreferences: ["GA", "WA"],
      avatarColor: "bg-pink-500",
      active: false
    }
  ];

  return (
    <PageTemplate title="Player Box Examples" breadcrumbs={[{ label: "Player Box Examples" }]}>
      <div className="space-y-8">
        <div className="prose max-w-none">
          <p>Different styles and configurations for the PlayerBox component.</p>
        </div>

        {/* Default Style */}
        <Card>
          <CardHeader>
            <CardTitle>Default Player Boxes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {examplePlayers.map(player => (
                <PlayerBox key={player.id} player={player} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Compact Style */}
        <Card>
          <CardHeader>
            <CardTitle>Compact Style</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {examplePlayers.map(player => (
                <div key={player.id} className="scale-75">
                  <PlayerBox player={player} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* With Custom Styling */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Styling Examples</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Highlighted Active Player</h4>
                  <PlayerBox player={examplePlayers[0]} className="border-blue-400 shadow-lg" />
                </div>
                
                <div className="border-2 border-gray-200 rounded-lg p-4 opacity-60">
                  <h4 className="font-semibold mb-2">Inactive Player Style</h4>
                  <PlayerBox player={examplePlayers[3]} className="opacity-50" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Different Sizes */}
        <Card>
          <CardHeader>
            <CardTitle>Size Variations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Large (1.25x)</h4>
                <div className="flex flex-wrap gap-4">
                  {examplePlayers.slice(0, 2).map(player => (
                    <div key={player.id} className="scale-125">
                      <PlayerBox player={player} />
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Small (0.8x)</h4>
                <div className="flex flex-wrap gap-2">
                  {examplePlayers.map(player => (
                    <div key={player.id} className="scale-80">
                      <PlayerBox player={player} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Interactive Player Boxes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {examplePlayers.map(player => (
                <div 
                  key={player.id} 
                  className="cursor-pointer transition-transform hover:scale-105"
                  onClick={() => alert(`Clicked on ${player.displayName}`)}
                >
                  <PlayerBox player={player} className="hover:shadow-lg" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Position-focused Display */}
        <Card>
          <CardHeader>
            <CardTitle>Position-Focused Layout</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Attackers</h4>
                <div className="flex flex-wrap gap-4">
                  {examplePlayers.filter(p => 
                    p.positionPreferences.some(pos => ['GA', 'GS', 'WA'].includes(pos))
                  ).map(player => (
                    <PlayerBox key={player.id} player={player} className="border-orange-300" />
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Defenders</h4>
                <div className="flex flex-wrap gap-4">
                  {examplePlayers.filter(p => 
                    p.positionPreferences.some(pos => ['GK', 'GD', 'WD'].includes(pos))
                  ).map(player => (
                    <PlayerBox key={player.id} player={player} className="border-red-300" />
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Center Court</h4>
                <div className="flex flex-wrap gap-4">
                  {examplePlayers.filter(p => 
                    p.positionPreferences.includes('C')
                  ).map(player => (
                    <PlayerBox key={player.id} player={player} className="border-green-300" />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
}
