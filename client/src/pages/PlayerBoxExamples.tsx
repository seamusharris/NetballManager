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
      displayName: "Emma Wilson",
      firstName: "Emma",
      lastName: "Wilson",
      positionPreferences: ["GA", "GS"],
      avatarColor: "bg-blue-500",
      active: true
    },
    {
      id: 2,
      displayName: "Sarah Johnson",
      firstName: "Sarah",
      lastName: "Johnson",
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
      positionPreferences: ["GD", "GK"],
      avatarColor: "bg-red-500",
      active: true
    }
  ];

  const sampleStats = [
    { label: "Goals", value: "12" },
    { label: "Assists", value: "8" },
    { label: "Turnovers", value: "3" }
  ];

  const samplePlayer = samplePlayers[0];

  return (
    <PageTemplate 
      title="PlayerBox Examples" 
      breadcrumbs={[
        { label: "Component Examples", href: "/component-examples" },
        { label: "PlayerBox Examples" }
      ]}
    >
      <Helmet>
        <title>PlayerBox Examples - Component Library</title>
        <meta name="description" content="Explore different variations and configurations of the PlayerBox component for netball team management applications." />
      </Helmet>

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

          {/* Colored Background + Dark Border */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-medium mb-3 text-gray-800">Colored Background + Dark Border</h3>
            <p className="text-sm text-gray-600 mb-3">Good for selection states and emphasis</p>
            <PlayerBox 
              player={samplePlayers[1]}
              size="md"
              showPositions={true}
              className="shadow-md"
            />
          </div>

          {/* Court Position Style */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-medium mb-3 text-gray-800">Court Position Style</h3>
            <p className="text-sm text-gray-600 mb-3">Enhanced styling for court positioning</p>
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
            <p className="text-sm text-gray-600 mb-3">Interactive hover effects with brightness control</p>
            <div className="relative">
              <div 
                className="absolute top-1/2 right-4 w-6 h-6 rounded flex items-center justify-center cursor-pointer text-white z-10 transform -translate-y-1/2"
                style={{ backgroundColor: '#f97316' }}
              >
                ✓
              </div>
              <div 
                className="rounded-lg transition-all duration-300 cursor-pointer hover:brightness-90 [&:hover_.player-avatar]:brightness-[1.11]"
              >
                <PlayerBox 
                  player={samplePlayers[3]}
                  size="md"
                  showPositions={true}
                />
              </div>
            </div>
          </div>

          {/* Compact Style */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-medium mb-3 text-gray-800">Compact Style</h3>
            <p className="text-sm text-gray-600 mb-3">Smaller size for lists and condensed views</p>
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
            <p className="text-sm text-gray-600 mb-3">Enhanced styling with rings and larger size</p>
            <PlayerBox 
              player={samplePlayers[0]}
              size="lg"
              showPositions={true}
              className="[&>div>div:first-child]:border-4 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current [&>div>div:first-child]:shadow-xl [&>div>div:first-child]:shadow-black/25"
            />
          </div>
        </div>
      </section>

      {/* Third Copy of Quick Reference Section */}
      <section className="mb-8 bg-purple-50 p-6 rounded-lg border border-purple-200">
        <h2 className="text-2xl font-semibold mb-4 text-purple-800">Quick Reference - Standard Player Box Styles (Copy 3)</h2>
        <p className="text-purple-700 mb-6">These are the most commonly used player box variations in the app:</p>
        
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
              style={{ 
                borderColor: '#3b82f680',
                color: '#1d4ed8'
              }}
            />
          </div>

          {/* Colored Background + Dark Border */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-medium mb-3 text-gray-800">Colored Background + Dark Border</h3>
            <p className="text-sm text-gray-600 mb-3">Good for selection states and emphasis</p>
            <PlayerBox 
              player={samplePlayers[1]}
              size="md"
              showPositions={true}
              className="shadow-md"
              style={{ 
                borderColor: '#16a34a80',
                color: '#15803d'
              }}
            />
          </div>

          {/* Court Position Style */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-medium mb-3 text-gray-800">Court Position Style</h3>
            <p className="text-sm text-gray-600 mb-3">Enhanced styling for court positioning</p>
            <PlayerBox 
              player={samplePlayers[2]}
              size="md"
              showPositions={true}
              className="[&>div>div:first-child]:border-4 [&>div>div:first-child]:border-white [&>div>div:first-child]:shadow-lg [&>div>div:first-child]:shadow-black/25"
              style={{ 
                borderColor: '#a855f780',
                color: '#7e22ce'
              }}
            />
          </div>

          {/* Background Darkening Hover */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-medium mb-3 text-gray-800">Background Darkening Hover</h3>
            <p className="text-sm text-gray-600 mb-3">Interactive hover effects with brightness control</p>
            <div className="relative">
              <div 
                className="absolute top-1/2 right-4 w-6 h-6 rounded flex items-center justify-center cursor-pointer text-white z-10 transform -translate-y-1/2"
                style={{ backgroundColor: '#f97316' }}
              >
                ✓
              </div>
              <div 
                className="rounded-lg transition-all duration-300 cursor-pointer hover:brightness-90 [&:hover_.player-avatar]:brightness-[1.11]"
              >
                <PlayerBox 
                  player={samplePlayers[3]}
                  size="md"
                  showPositions={true}
                  style={{ 
                    borderColor: '#f9731680',
                    color: '#ea580c'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Compact Style */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-medium mb-3 text-gray-800">Compact Style</h3>
            <p className="text-sm text-gray-600 mb-3">Smaller size for lists and condensed views</p>
            <PlayerBox 
              player={samplePlayers[4]}
              size="sm"
              showPositions={true}
              className="[&_.player-avatar]:border-2 [&_.player-avatar]:border-white [&_.player-avatar]:shadow-md [&_.player-avatar]:shadow-black/15"
              style={{ 
                borderColor: '#ef444480',
                color: '#dc2626'
              }}
            />
          </div>

          {/* Premium Style */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-medium mb-3 text-gray-800">Premium Style</h3>
            <p className="text-sm text-gray-600 mb-3">Enhanced styling with rings and larger size</p>
            <PlayerBox 
              player={samplePlayers[0]}
              size="lg"
              showPositions={true}
              className="[&>div>div:first-child]:border-4 [&>div>div:first-child]:border-white [&>div>div:first-child]:ring-2 [&>div>div:first-child]:ring-current [&>div>div:first-child]:shadow-xl [&>div>div:first-child]:shadow-black/25"
              style={{ 
                borderColor: '#3b82f680',
                color: '#1d4ed8'
              }}
            />
          </div>

          {/* Selected State with Checkmark */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-medium mb-3 text-gray-800">Selected State</h3>
            <p className="text-sm text-gray-600 mb-3">Player selected with checkmark indicator</p>
            <div className="relative">
              <div 
                className="absolute top-1/2 right-4 w-6 h-6 rounded flex items-center justify-center cursor-pointer text-white z-10 transform -translate-y-1/2"
                style={{ backgroundColor: '#16a34a' }}
              >
                ✓
              </div>
              <PlayerBox 
                player={samplePlayers[1]}
                size="md"
                showPositions={true}
                style={{ 
                  borderColor: '#16a34a80',
                  color: '#15803d'
                }}
              />
            </div>
          </div>

          {/* Unselected State */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-medium mb-3 text-gray-800">Unselected State</h3>
            <p className="text-sm text-gray-600 mb-3">Player available for selection</p>
            <div className="relative">
              <div 
                className="absolute top-1/2 right-4 w-6 h-6 rounded border-2 bg-white cursor-pointer z-10 transform -translate-y-1/2"
                style={{ borderColor: '#a855f780' }}
              >
              </div>
              <PlayerBox 
                player={samplePlayers[2]}
                size="md"
                showPositions={true}
                style={{ 
                  borderColor: '#a855f780',
                  color: '#7e22ce'
                }}
              />
            </div>
          </div>

          {/* Multiple Selection States */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-medium mb-3 text-gray-800">Multiple Selection Example</h3>
            <p className="text-sm text-gray-600 mb-3">Mix of selected and unselected players</p>
            <div className="space-y-3">
              {/* Selected Player */}
              <div className="relative">
                <div 
                  className="absolute top-1/2 right-4 w-6 h-6 rounded flex items-center justify-center cursor-pointer text-white z-10 transform -translate-y-1/2"
                  style={{ backgroundColor: '#ef4444' }}
                >
                  ✓
                </div>
                <PlayerBox 
                  player={samplePlayers[4]}
                  size="sm"
                  showPositions={true}
                  style={{ 
                    borderColor: '#ef444480',
                    color: '#dc2626'
                  }}
                />
              </div>
              
              {/* Unselected Player */}
              <div className="relative">
                <div 
                  className="absolute top-1/2 right-4 w-5 h-5 rounded border-2 bg-white cursor-pointer z-10 transform -translate-y-1/2"
                  style={{ borderColor: '#f9731680' }}
                >
                </div>
                <PlayerBox 
                  player={samplePlayers[3]}
                  size="sm"
                  showPositions={true}
                  style={{ 
                    borderColor: '#f9731680',
                    color: '#ea580c'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
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

        {/* PlayerBox with Stats */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">PlayerBox with Stats</h2>
          <div className="space-y-4">
            <PlayerBox player={samplePlayers[0]} stats={sampleStats} />
            <PlayerBox player={samplePlayers[1]} stats={[{ label: "Saves", value: "15" }, { label: "Intercepts", value: "7" }]} />
          </div>
        </section>

        {/* Size Variations */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Size Variations</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Small</h3>
              <PlayerBox player={samplePlayers[0]} size="sm" />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Medium (Default)</h3>
              <PlayerBox player={samplePlayers[0]} size="md" />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Large</h3>
              <PlayerBox player={samplePlayers[0]} size="lg" />
            </div>
          </div>
        </section>

        {/* PlayerBox with Actions */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">PlayerBox with Actions</h2>
          <div className="space-y-4">
            <PlayerBox 
              player={samplePlayers[0]}
              actions={
                <>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline">
                    <Award className="h-4 w-4 mr-1" />
                    Awards
                  </Button>
                </>
              }
            />
            
            <PlayerBox 
              player={samplePlayers[1]}
              actions={
                <>
                  <Button size="sm" variant="secondary">
                    <UserPlus className="h-4 w-4 mr-1" />
                    Add to Team
                  </Button>
                  <Button size="sm" variant="destructive">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </>
              }
            />
          </div>
        </section>
      </div>
    </PageTemplate>
  );
}