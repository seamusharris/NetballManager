
import React from 'react';
import { Helmet } from 'react-helmet';
import PageTemplate from '@/components/layout/PageTemplate';
import { PlayerBox } from '@/components/ui/player-box';

const samplePlayers = [
  {
    id: 1,
    firstName: "Sarah",
    lastName: "Johnson",
    displayName: "Sarah J",
    positionPreferences: ["WA", "C"],
    avatarColor: "bg-blue-500",
    active: true
  },
  {
    id: 2,
    firstName: "Emma",
    lastName: "Thompson", 
    displayName: "Emma T",
    positionPreferences: ["GS", "GA"],
    avatarColor: "bg-green-500",
    active: true
  },
  {
    id: 3,
    firstName: "Lily",
    lastName: "Chen",
    displayName: "Lily C",
    positionPreferences: ["GK", "GD"],
    avatarColor: "bg-purple-500",
    active: true
  },
  {
    id: 4,
    firstName: "Sophie",
    lastName: "Miller",
    displayName: "Sophie M", 
    positionPreferences: ["WD", "C"],
    avatarColor: "bg-pink-500",
    active: true
  }
];

export default function PlayerBoxExamples() {
  return (
    <PageTemplate 
      title="PlayerBox Examples" 
      breadcrumbs={[
        { label: "Component Examples", href: "/component-examples" },
        { label: "PlayerBox Examples" }
      ]}
    >
      <Helmet>
        <title>PlayerBox Examples | Team Manager</title>
      </Helmet>

      <div className="space-y-12">
        <div className="prose max-w-none">
          <p className="text-lg text-gray-700">
            Reference collection based on Sarah Johnson's design variations.
          </p>
        </div>

        {/* Reference Collection - Based on Sarah Johnson's Design */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Reference Collection - Based on Sarah Johnson's Design</h2>
          
          <div className="space-y-8">
            {/* Mixed Selection Examples */}
            <div>
              <h3 className="text-lg font-medium mb-4">Mixed Selection Examples</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="absolute top-2 right-2 w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <PlayerBox 
                    player={{...samplePlayers[0], displayName: "Sarah J", positionPreferences: ["WA", "C"], avatarColor: "bg-blue-500"}}
                    size="sm"
                    showPositions={true}
                    className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                    style={{ borderColor: '#3b82f6', color: '#1d4ed8' }}
                  />
                </div>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked
                    className="absolute top-2 right-2 w-4 h-4 text-green-600 bg-green-600 border-green-600 rounded focus:ring-green-500 focus:ring-2"
                  />
                  <PlayerBox 
                    player={{...samplePlayers[1], displayName: "Emma T", positionPreferences: ["GS", "GA"], avatarColor: "bg-green-500"}}
                    size="sm"
                    showPositions={true}
                    className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                    style={{ borderColor: '#16a34a', color: '#15803d' }}
                  />
                </div>
                <div className="relative">
                  <input 
                    type="radio" 
                    name="captain"
                    className="absolute top-2 right-2 w-4 h-4 text-purple-600 bg-white border-gray-300 focus:ring-purple-500 focus:ring-2"
                  />
                  <PlayerBox 
                    player={{...samplePlayers[2], displayName: "Lily C", positionPreferences: ["GK", "GD"], avatarColor: "bg-purple-500", active: true}}
                    size="sm"
                    showPositions={true}
                    className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                    style={{ borderColor: '#a855f7', color: '#7c3aed' }}
                  />
                </div>
                <div className="relative">
                  <input 
                    type="radio" 
                    name="captain"
                    checked
                    className="absolute top-2 right-2 w-4 h-4 text-pink-600 bg-pink-600 border-pink-600 focus:ring-pink-500 focus:ring-2"
                  />
                  <PlayerBox 
                    player={{...samplePlayers[3], displayName: "Sophie M", positionPreferences: ["WD", "C"], avatarColor: "bg-pink-500"}}
                    size="sm"
                    showPositions={true}
                    className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                    style={{ borderColor: '#ec4899', color: '#be185d' }}
                  />
                </div>
              </div>
            </div>

            {/* Compact Format Examples */}
            <div>
              <h3 className="text-lg font-medium mb-4">Compact Format Examples</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {samplePlayers.map(player => (
                  <PlayerBox 
                    key={player.id}
                    player={player}
                    size="sm"
                    showPositions={true}
                    compact={true}
                    className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                  />
                ))}
              </div>
            </div>

            {/* Standard Format Examples */}
            <div>
              <h3 className="text-lg font-medium mb-4">Standard Format Examples</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {samplePlayers.map(player => (
                  <PlayerBox 
                    key={player.id}
                    player={player}
                    showPositions={true}
                    className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageTemplate>
  );
}
