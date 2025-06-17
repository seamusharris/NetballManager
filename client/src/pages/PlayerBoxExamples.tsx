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

      {/* Expanded Reference Section */}
      <section className="mb-8 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Reference Collection - Based on Sarah Johnson's Design</h2>
        <p className="text-gray-700 mb-6">Comprehensive variations with different widths, layouts, stats, and color schemes</p>

        {/* Full Width Stats Examples */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4 text-gray-800">Full Width with Statistics</h3>
          <div className="space-y-4">
            {/* Green - Sarah's Colors */}
            <div className="w-full">
              <div className="relative">
                <div 
                  className="absolute top-1/2 right-3 w-6 h-6 rounded flex items-center justify-center cursor-pointer text-white z-10 transform -translate-y-1/2 mr-3"
                  style={{ backgroundColor: '#16a34a' }}
                >
                  ✓
                </div>
                <PlayerBox 
                  player={samplePlayers[1]}
                  size="md"
                  showPositions={true}
                  stats={[
                    { label: "Goals", value: "24" },
                    { label: "Assists", value: "12" },
                    { label: "Turnovers", value: "4" },
                    { label: "Rating", value: "8.5" }
                  ]}
                  className="w-full shadow-md transition-shadow duration-200 hover:shadow-lg"
                  style={{ 
                    borderColor: '#16a34a',
                    color: '#15803d'
                  }}
                />
              </div>
            </div>

            {/* Blue Variation */}
            <div className="w-full">
              <div className="relative">
                <div 
                  className="absolute top-1/2 right-3 w-6 h-6 rounded border-2 bg-white cursor-pointer z-10 transform -translate-y-1/2 mr-3"
                  style={{ borderColor: '#3b82f6' }}
                >
                </div>
                <PlayerBox 
                  player={{...samplePlayers[0], displayName: "Emma Wilson", avatarColor: "bg-blue-500"}}
                  size="md"
                  showPositions={true}
                  stats={[
                    { label: "Saves", value: "18" },
                    { label: "Intercepts", value: "9" },
                    { label: "Rebounds", value: "6" },
                    { label: "Rating", value: "7.8" }
                  ]}
                  className="w-full shadow-md transition-shadow duration-200 hover:shadow-lg"
                  style={{ 
                    borderColor: '#3b82f6',
                    color: '#1d4ed8'
                  }}
                />
              </div>
            </div>

            {/* Purple Variation */}
            <div className="w-full">
              <div className="relative">
                <div 
                  className="absolute top-1/2 right-3 w-6 h-6 rounded flex items-center justify-center cursor-pointer text-white z-10 transform -translate-y-1/2 mr-3"
                  style={{ backgroundColor: '#a855f7' }}
                >
                  ✓
                </div>
                <PlayerBox 
                  player={{...samplePlayers[2], displayName: "Lily Chen", avatarColor: "bg-purple-500"}}
                  size="md"
                  showPositions={true}
                  stats={[
                    { label: "Blocks", value: "15" },
                    { label: "Steals", value: "7" },
                    { label: "Deflections", value: "11" },
                    { label: "Rating", value: "8.2" }
                  ]}
                  className="w-full shadow-md transition-shadow duration-200 hover:shadow-lg"
                  style={{ 
                    borderColor: '#a855f7',
                    color: '#7e22ce'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Court Position Ready Examples */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4 text-gray-800">Court Position Ready (No Select Boxes)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Orange Court Position */}
            <PlayerBox 
              player={{...samplePlayers[3], displayName: "Mia Thompson", avatarColor: "bg-orange-500"}}
              size="md"
              showPositions={true}
              className="shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02]"
              style={{ 
                borderColor: '#f97316',
                color: '#ea580c'
              }}
            />

            {/* Red Court Position */}
            <PlayerBox 
              player={{...samplePlayers[4], displayName: "Zoe Parker", avatarColor: "bg-red-500"}}
              size="md"
              showPositions={true}
              className="shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02]"
              style={{ 
                borderColor: '#ef4444',
                color: '#dc2626'
              }}
            />

            {/* Teal Court Position */}
            <PlayerBox 
              player={{...samplePlayers[0], displayName: "Emma Wilson", avatarColor: "bg-teal-500"}}
              size="md"
              showPositions={true}
              className="shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02]"
              style={{ 
                borderColor: '#14b8a6',
                color: '#0d9488'
              }}
            />
          </div>
        </div>

        {/* Small Court Position Allocation Examples */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4 text-gray-800">Small Court Position Allocation</h3>
          <p className="text-sm text-gray-600 mb-4">Compact examples for allocating players to court positions - with and without position preferences</p>

          <div className="space-y-6">
            {/* With Position Preferences */}
            <div>
              <h4 className="text-sm font-medium mb-3 text-gray-700">With Position Preferences</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <PlayerBox 
                  player={{...samplePlayers[1], displayName: "Sarah J", positionPreferences: ["C", "WA"], avatarColor: "bg-green-600"}}
                  size="sm"
                  showPositions={true}
                  className="shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer"
                  style={{ borderColor: '#16a34a', color: '#15803d' }}
                />
                <PlayerBox 
                  player={{...samplePlayers[2], displayName: "Lily C", positionPreferences: ["GK", "GD"], avatarColor: "bg-purple-500"}}
                  size="sm"
                  showPositions={true}
                  className="shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer"
                  style={{ borderColor: '#a855f7', color: '#7e22ce' }}
                />
                <PlayerBox 
                  player={{...samplePlayers[3], displayName: "Mia T", positionPreferences: ["WA", "C"], avatarColor: "bg-orange-500"}}
                  size="sm"
                  showPositions={true}
                  className="shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer"
                  style={{ borderColor: '#f97316', color: '#ea580c' }}
                />
                <PlayerBox 
                  player={{...samplePlayers[4], displayName: "Zoe P", positionPreferences: ["GD", "WD"], avatarColor: "bg-red-500"}}
                  size="sm"
                  showPositions={true}
                  className="shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer"
                  style={{ borderColor: '#ef4444', color: '#dc2626' }}
                />
                <PlayerBox 
                  player={{id: 6, displayName: "Kate M", positionPreferences: ["GA", "WA"], avatarColor: "bg-pink-500"}}
                  size="sm"
                  showPositions={true}
                  className="shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer"
                  style={{ borderColor: '#ec4899', color: '#be185d' }}
                />
                <PlayerBox 
                  player={{id: 7, displayName: "Jess R", positionPreferences: ["GK"], avatarColor: "bg-indigo-500"}}
                  size="sm"
                  showPositions={true}
                  className="shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer"
                  style={{ borderColor: '#6366f1', color: '#4338ca' }}
                />
              </div>
            </div>

            {/* Names Only */}
            <div>
              <h4 className="text-sm font-medium mb-3 text-gray-700">Names Only (No Position Preferences)</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
                <PlayerBox 
                  player={{id: 8, displayName: "Amy L", avatarColor: "bg-cyan-500"}}
                  size="sm"
                  showPositions={false}
                  className="hover:shadow-lg transition-shadow duration-200"
                  style={{ borderColor: '#06b6d4', color: '#0891b2' }}
                />
                <PlayerBox 
                  player={{id: 9, displayName: "Bella K", avatarColor: "bg-teal-500"}}
                  size="sm"
                  showPositions={false}
                  className="hover:shadow-lg transition-shadow duration-200"
                  style={{ borderColor: '#14b8a6', color: '#0d9488' }}
                />
                <PlayerBox 
                  player={{id: 10, displayName: "Chloe D", avatarColor: "bg-amber-500"}}
                  size="sm"
                  showPositions={false}
                  className="hover:shadow-lg transition-shadow duration-200"
                  style={{ borderColor: '#f59e0b', color: '#d97706' }}
                />
                <PlayerBox 
                  player={{id: 11, displayName: "Daisy H", avatarColor: "bg-emerald-500"}}
                  size="sm"
                  showPositions={false}
                  className="hover:shadow-lg transition-shadow duration-200"
                  style={{ borderColor: '#10b981', color: '#059669' }}
                />
                <PlayerBox 
                  player={{id: 12, displayName: "Ella S", avatarColor: "bg-violet-500"}}
                  size="sm"
                  showPositions={false}
                  className="hover:shadow-lg transition-shadow duration-200"
                  style={{ borderColor: '#8b5cf6', color: '#7c3aed' }}
                />
                <PlayerBox 
                  player={{id: 13, displayName: "Fiona B", avatarColor: "bg-rose-500"}}
                  size="sm"
                  showPositions={false}
                  className="hover:shadow-lg transition-shadow duration-200"
                  style={{ borderColor: '#f43f5e', color: '#e11d48' }}
                />
                <PlayerBox 
                  player={{id: 14, displayName: "Grace W", avatarColor: "bg-slate-500"}}
                  size="sm"
                  showPositions={false}
                  className="hover:shadow-lg transition-shadow duration-200"
                  style={{ borderColor: '#64748b', color: '#475569' }}
                />
              </div>
            </div>

            {/* Ultra Compact for Dense Lists */}
            <div>
              <h4 className="text-sm font-medium mb-3 text-gray-700">Ultra Compact (Dense Allocation)</h4>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                <PlayerBox 
                  player={{id: 15, displayName: "Holly", positionPreferences: ["GS"], avatarColor: "bg-blue-500"}}
                  size="sm"
                  showPositions={true}
                  className="hover:shadow-md transition-shadow duration-200"
                  style={{ borderColor: '#3b82f6', color: '#1d4ed8' }}
                />
                <PlayerBox 
                  player={{id: 16, displayName: "Ivy", positionPreferences: ["GA"], avatarColor: "bg-green-500"}}
                  size="sm"
                  showPositions={true}
                  className="hover:shadow-md transition-shadow duration-200"
                  style={{ borderColor: '#22c55e', color: '#15803d' }}
                />
                <PlayerBox 
                  player={{id: 17, displayName: "Jade", positionPreferences: ["WA"], avatarColor: "bg-yellow-500"}}
                  size="sm"
                  showPositions={true}
                  className="hover:shadow-md transition-shadow duration-200"
                  style={{ borderColor: '#eab308', color: '#a16207' }}
                />
                <PlayerBox 
                  player={{id: 18, displayName: "Kelly", positionPreferences: ["C"], avatarColor: "bg-orange-500"}}
                  size="sm"
                  showPositions={true}
                  className="hover:shadow-md transition-shadow duration-200"
                  style={{ borderColor: '#f97316', color: '#ea580c' }}
                />
                <PlayerBox 
                  player={{id: 19, displayName: "Lucy", positionPreferences: ["WD"], avatarColor: "bg-red-500"}}
                  size="sm"
                  showPositions={true}
                  className="hover:shadow-md transition-shadow duration-200"
                  style={{ borderColor: '#ef4444', color: '#dc2626' }}
                />
                <PlayerBox 
                  player={{id: 20, displayName: "Maya", positionPreferences: ["GD"], avatarColor: "bg-purple-500"}}
                  size="sm"
                  showPositions={true}
                  className="hover:shadow-md transition-shadow duration-200"
                  style={{ borderColor: '#a855f7', color: '#7e22ce' }}
                />
                <PlayerBox 
                  player={{id: 21, displayName: "Nina", positionPreferences: ["GK"], avatarColor: "bg-pink-500"}}
                  size="sm"
                  showPositions={true}
                  className="hover:shadow-md transition-shadow duration-200"
                  style={{ borderColor: '#ec4899', color: '#be185d' }}
                />
                <PlayerBox 
                  player={{id: 22, displayName: "Olive", avatarColor: "bg-indigo-500"}}
                  size="sm"
                  showPositions={false}
                  className="hover:shadow-md transition-shadow duration-200"
                  style={{ borderColor: '#6366f1', color: '#4338ca' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Compact Format Examples */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4 text-gray-800">Compact Format Variations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Compact with Select - Pink */}
            <div className="relative">
              <div 
                className="absolute top-1/2 right-4 w-5 h-5 rounded border-2 bg-white cursor-pointer z-10 transform -translate-y-1/2 mr-3"
                style={{ borderColor: '#ec4899' }}
              >
              </div>
              <PlayerBox 
                player={{...samplePlayers[1], displayName: "Sarah Johnson", avatarColor: "bg-pink-500"}}
                size="sm"
                showPositions={true}
                className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                style={{ 
                  borderColor: '#ec4899',
                  color: '#be185d'
                }}
              />
            </div>

            {/* Compact with Select - Indigo */}
            <div className="relative">
              <div 
                className="absolute top-1/2 right-4 w-5 h-5 rounded flex items-center justify-center cursor-pointer text-white z-10 transform -translate-y-1/2 mr-3"
                style={{ backgroundColor: '#6366f1' }}
              >
                ✓
              </div>
              <PlayerBox 
                player={{...samplePlayers[2], displayName: "Lily Chen", avatarColor: "bg-indigo-500"}}
                size="sm"
                showPositions={true}
                className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                style={{ 
                  borderColor: '#6366f1',
                  color: '#4338ca'
                }}
              />
            </div>
          </div>
        </div>

        {/* Large Format Examples */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4 text-gray-800">Large Format with Enhanced Styling</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Large with Select - Cyan */}
            <div className="relative">
              <div 
                className="absolute top-1/2 right-3 w-7 h-7 rounded flex items-center justify-center cursor-pointer text-white z-10 transform -translate-y-1/2 mr-3"
                style={{ backgroundColor: '#06b6d4' }}
              >
                ✓
              </div>
              <PlayerBox 
                player={{...samplePlayers[3], displayName: "Mia Thompson", avatarColor: "bg-cyan-500"}}
                size="lg"
                showPositions={true}
                className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                style={{ 
                  borderColor: '#06b6d4',
                  color: '#0891b2'
                }}
              />
            </div>

            {/* Large with Select - Amber */}
            <div className="relative">
              <div 
                className="absolute top-1/2 right-3 w-7 h-7 rounded border-2 bg-white cursor-pointer z-10 transform -translate-y-1/2 mr-3"
                style={{ borderColor: '#f59e0b' }}
              >
              </div>
              <PlayerBox 
                player={{...samplePlayers[4], displayName: "Zoe Parker", avatarColor: "bg-amber-500"}}
                size="lg"
                showPositions={true}
                className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                style={{ 
                  borderColor: '#f59e0b',
                  color: '#d97706'
                }}
              />
            </div>
          </div>
        </div>

        {/* Mixed Selection States */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4 text-gray-800">Mixed Selection States</h3>
          <div className="space-y-3">
            {/* Selected - Emerald */}
            <div className="relative">
              <div 
                className="absolute top-1/2 right-3 w-6 h-6 rounded flex items-center justify-center cursor-pointer text-white z-10 transform -translate-y-1/2 mr-3"
                style={{ backgroundColor: '#10b981' }}
              >
                ✓
              </div>
              <PlayerBox 
                player={{...samplePlayers[0], displayName: "Emma Wilson", avatarColor: "bg-emerald-500"}}
                size="md"
                showPositions={true}
                className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                style={{ 
                  borderColor: '#10b981',
                  color: '#059669'
                }}
              />
            </div>

            {/* Unselected - Rose */}
            <div className="relative">
              <div 
                className="absolute top-1/2 right-3 w-6 h-6 rounded border-2 bg-white cursor-pointer z-10 transform -translate-y-1/2 mr-3"
                style={{ borderColor: '#f43f5e' }}
              >
              </div>
              <PlayerBox 
                player={{...samplePlayers[1], displayName: "Sarah Johnson", avatarColor: "bg-rose-500"}}
                size="md"
                showPositions={true}
                className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                style={{ 
                  borderColor: '#f43f5e',
                  color: '#e11d48'
                }}
              />
            </div>
          </div>
        </div>

         {/* Shadow Comparison Examples */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4 text-gray-800">Shadow Comparison: Mismatched vs Properly Proportioned</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2 text-gray-700">❌ Mismatched Shadow (Too Big for Box)</h4>
              <div className="w-64 p-3 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-2xl">
                <p className="text-sm text-blue-800">Small box with oversized shadow creates visual imbalance</p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2 text-gray-700">✅ Properly Proportioned Shadow</h4>
              <PlayerBox
                player={{...samplePlayers[0], displayName: "Emma Wilson", avatarColor: "bg-blue-500"}}
                size="md"
                showPositions={true}
                className="w-64 shadow-md transition-shadow duration-200 hover:shadow-lg"
                style={{ 
                  borderColor: '#3b82f6',
                  color: '#1d4ed8'
                }}
              />
            </div>
          </div>
        </div>

        {/* Subtle Hover Animation Examples */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4 text-gray-800">Subtle Hover Animation Examples</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2 text-gray-700">Court Position Ready Style - Subtle Scale & Enhanced Shadow</h4>
              <p className="text-sm text-gray-600 mb-2">Perfect for clickable items that navigate to player details</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <PlayerBox
                  player={{...samplePlayers[1], displayName: "Sarah Johnson", avatarColor: "bg-green-600"}}
                  size="md"
                  showPositions={true}
                  className="shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02]"
                  style={{ 
                    borderColor: '#16a34a',
                    color: '#15803d'
                  }}
                />
                <PlayerBox
                  player={{...samplePlayers[3], displayName: "Mia Thompson", avatarColor: "bg-orange-500"}}
                  size="md"
                  showPositions={true}
                  className="shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02]"
                  style={{ 
                    borderColor: '#f97316',
                    color: '#ea580c'
                  }}
                />
                <PlayerBox
                  player={{...samplePlayers[4], displayName: "Zoe Parker", avatarColor: "bg-red-500"}}
                  size="md"
                  showPositions={true}
                  className="shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02]"
                  style={{ 
                    borderColor: '#ef4444',
                    color: '#dc2626'
                  }}
                />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2 text-gray-700">Gentle Elevation - Shadow Change Only</h4>
              <p className="text-sm text-gray-600 mb-2">For display-only items or less interactive elements</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PlayerBox
                  player={{...samplePlayers[2], displayName: "Lily Chen", avatarColor: "bg-purple-500"}}
                  size="md"
                  showPositions={true}
                  className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                  style={{ 
                    borderColor: '#a855f7',
                    color: '#7e22ce'
                  }}
                />
                <PlayerBox
                  player={{...samplePlayers[0], displayName: "Emma Wilson", avatarColor: "bg-blue-500"}}
                  size="md"
                  showPositions={true}
                  className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                  style={{ 
                    borderColor: '#3b82f6',
                    color: '#1d4ed8'
                  }}
                />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2 text-gray-700">Brightness Adjustment - Avatar Enhancement</h4>
              <p className="text-sm text-gray-600 mb-2">Background darkens while avatar brightens for visual interest</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="transition-all duration-300 cursor-pointer hover:brightness-90 [&:hover_.player-avatar]:brightness-[1.11]">
                  <PlayerBox
                    player={{...samplePlayers[1], displayName: "Sarah Johnson", avatarColor: "bg-green-600"}}
                    size="md"
                    showPositions={true}
                    style={{ 
                      borderColor: '#16a34a',
                      color: '#15803d'
                    }}
                  />
                </div>
                <div className="transition-all duration-300 cursor-pointer hover:brightness-90 [&:hover_.player-avatar]:brightness-[1.11]">
                  <PlayerBox
                    player={{...samplePlayers[3], displayName: "Mia Thompson", avatarColor: "bg-orange-500"}}
                    size="md"
                    showPositions={true}
                    style={{ 
                      borderColor: '#f97316',
                      color: '#ea580c'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Selection State Examples */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4 text-gray-800">Enhanced Selection States with Background Changes</h3>
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-2 text-gray-700">✅ Selected State with Stronger Background</h4>
              <p className="text-sm text-gray-600 mb-3">More visually distinct with enhanced background color opacity</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <div 
                    className="absolute top-1/2 right-3 w-6 h-6 rounded flex items-center justify-center cursor-pointer text-white z-10 transform -translate-y-1/2 mr-3"
                    style={{ backgroundColor: '#16a34a' }}
                  >
                    ✓
                  </div>
                  <PlayerBox
                    player={{...samplePlayers[1], displayName: "Sarah Johnson", avatarColor: "bg-green-600"}}
                    size="md"
                    showPositions={true}
                    className="shadow-md transition-all duration-200 hover:shadow-lg"
                    style={{ 
                      backgroundColor: '#16a34a25', // Stronger green background
                      borderColor: '#16a34a',
                      color: '#15803d'
                    }}
                  />
                </div>
                <div className="relative">
                  <div 
                    className="absolute top-1/2 right-3 w-6 h-6 rounded flex items-center justify-center cursor-pointer text-white z-10 transform -translate-y-1/2 mr-3"
                    style={{ backgroundColor: '#3b82f6' }}
                  >
                    ✓
                  </div>
                  <PlayerBox
                    player={{...samplePlayers[0], displayName: "Emma Wilson", avatarColor: "bg-blue-500"}}
                    size="md"
                    showPositions={true}
                    className="shadow-md transition-all duration-200 hover:shadow-lg"
                    style={{ 
                      backgroundColor: '#3b82f625', // Stronger blue background
                      borderColor: '#3b82f6',
                      color: '#1d4ed8'
                    }}
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2 text-gray-700">⚪ Available State (Standard Background)</h4>
              <p className="text-sm text-gray-600 mb-3">Normal light background for unselected players</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <div 
                    className="absolute top-1/2 right-3 w-6 h-6 rounded border-2 bg-white cursor-pointer z-10 transform -translate-y-1/2 mr-3"
                    style={{ borderColor: '#a855f7' }}
                  >
                  </div>
                  <PlayerBox
                    player={{...samplePlayers[2], displayName: "Lily Chen", avatarColor: "bg-purple-500"}}
                    size="md"
                    showPositions={true}
                    className="shadow-md transition-all duration-200 hover:shadow-lg"
                    style={{ 
                      borderColor: '#a855f7',
                      color: '#7e22ce'
                    }}
                  />
                </div>
                <div className="relative">
                  <div 
                    className="absolute top-1/2 right-3 w-6 h-6 rounded border-2 bg-white cursor-pointer z-10 transform -translate-y-1/2 mr-3"
                    style={{ borderColor: '#f97316' }}
                  >
                  </div>
                  <PlayerBox
                    player={{...samplePlayers[3], displayName: "Mia Thompson", avatarColor: "bg-orange-500"}}
                    size="md"
                    showPositions={true}
                    className="shadow-md transition-all duration-200 hover:shadow-lg"
                    style={{ 
                      borderColor: '#f97316',
                      color: '#ea580c'
                    }}
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2 text-gray-700">Mixed Selection Example with Enhanced Backgrounds</h4>
              <p className="text-sm text-gray-600 mb-3">Shows contrast between selected (stronger background) and unselected players</p>
              <div className="space-y-3">
                {/* Selected Players with Enhanced Backgrounds */}
                <div className="relative">
                  <div 
                    className="absolute top-1/2 right-3 w-6 h-6 rounded flex items-center justify-center cursor-pointer text-white z-10 transform -translate-y-1/2 mr-3"
                    style={{ backgroundColor: '#ef4444' }}
                  >
                    ✓
                  </div>
                  <PlayerBox
                    player={{...samplePlayers[4], displayName: "Zoe Parker", avatarColor: "bg-red-500"}}
                    size="md"
                    showPositions={true}
                    className="shadow-md transition-all duration-200 hover:shadow-lg"
                    style={{ 
                      backgroundColor: '#ef444425', // Enhanced red background
                      borderColor: '#ef4444',
                      color: '#dc2626'
                    }}
                  />
                </div>
                
                {/* Unselected Player */}
                <div className="relative">
                  <div 
                    className="absolute top-1/2 right-3 w-6 h-6 rounded border-2 bg-white cursor-pointer z-10 transform -translate-y-1/2 mr-3"
                    style={{ borderColor: '#14b8a6' }}
                  >
                  </div>
                  <PlayerBox
                    player={{id: 6, displayName: "Kate Miller", positionPreferences: ["GA", "WA"], avatarColor: "bg-teal-500"}}
                    size="md"
                    showPositions={true}
                    className="shadow-md transition-all duration-200 hover:shadow-lg"
                    style={{ 
                      borderColor: '#14b8a6',
                      color: '#0d9488'
                    }}
                  />
                </div>

                {/* Another Selected Player */}
                <div className="relative">
                  <div 
                    className="absolute top-1/2 right-3 w-6 h-6 rounded flex items-center justify-center cursor-pointer text-white z-10 transform -translate-y-1/2 mr-3"
                    style={{ backgroundColor: '#ec4899' }}
                  >
                    ✓
                  </div>
                  <PlayerBox
                    player={{id: 7, displayName: "Jessica Adams", positionPreferences: ["GK", "GD"], avatarColor: "bg-pink-500"}}
                    size="md"
                    showPositions={true}
                    className="shadow-md transition-all duration-200 hover:shadow-lg"
                    style={{ 
                      backgroundColor: '#ec489925', // Enhanced pink background
                      borderColor: '#ec4899',
                      color: '#be185d'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Inline Badge Examples for Consistent Height */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4 text-gray-800">Inline Badge Examples - Consistent Box Heights</h3>
          <p className="text-gray-700 mb-4">Badges positioned inline with text content ensure all boxes maintain the same height, whether they have badges or not.</p>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-2 text-gray-700">Medium Size - Mixed Active/Inactive States</h4>
              <div className="space-y-3">
                {/* Active Player - No Badge */}
                <PlayerBox
                  player={{...samplePlayers[1], displayName: "Sarah Johnson", avatarColor: "bg-green-600", active: true}}
                  size="md"
                  showPositions={true}
                  className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                  style={{ 
                    borderColor: '#16a34a',
                    color: '#15803d'
                  }}
                />

                {/* Inactive Player - Inline Badge */}
                <PlayerBox
                  player={{...samplePlayers[2], displayName: "Lily Chen", avatarColor: "bg-purple-500", active: false}}
                  size="md"
                  showPositions={true}
                  className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                  style={{ 
                    borderColor: '#a855f7',
                    color: '#7e22ce'
                  }}
                />

                {/* Active Player with Stats - No Badge */}
                <PlayerBox
                  player={{...samplePlayers[0], displayName: "Emma Wilson", avatarColor: "bg-blue-500", active: true}}
                  size="md"
                  showPositions={true}
                  stats={[
                    { label: "Goals", value: "15" },
                    { label: "Assists", value: "8" }
                  ]}
                  className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                  style={{ 
                    borderColor: '#3b82f6',
                    color: '#1d4ed8'
                  }}
                />

                {/* Inactive Player with Stats - Inline Badge */}
                <PlayerBox
                  player={{...samplePlayers[3], displayName: "Mia Thompson", avatarColor: "bg-orange-500", active: false}}
                  size="md"
                  showPositions={true}
                  stats={[
                    { label: "Goals", value: "12" },
                    { label: "Assists", value: "6" }
                  ]}
                  className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                  style={{ 
                    borderColor: '#f97316',
                    color: '#ea580c'
                  }}
                />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2 text-gray-700">Small Size - Compact Layout with Consistent Heights</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Active Players */}
                <PlayerBox
                  player={{id: 15, displayName: "Rachel Green", positionPreferences: ["GA", "GS"], avatarColor: "bg-emerald-500", active: true}}
                  size="sm"
                  showPositions={true}
                  className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                  style={{ 
                    borderColor: '#10b981',
                    color: '#059669'
                  }}
                />

                <PlayerBox
                  player={{id: 16, displayName: "Monica Geller", positionPreferences: ["C", "WA"], avatarColor: "bg-rose-500", active: false}}
                  size="sm"
                  showPositions={true}
                  className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                  style={{ 
                    borderColor: '#f43f5e',
                    color: '#e11d48'
                  }}
                />

                <PlayerBox
                  player={{id: 17, displayName: "Phoebe Buffay", positionPreferences: ["GK"], avatarColor: "bg-amber-500", active: true}}
                  size="sm"
                  showPositions={true}
                  className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                  style={{ 
                    borderColor: '#f59e0b',
                    color: '#d97706'
                  }}
                />

                <PlayerBox
                  player={{id: 18, displayName: "Joey Tribbiani", positionPreferences: ["GD", "WD"], avatarColor: "bg-cyan-500", active: false}}
                  size="sm"
                  showPositions={true}
                  className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                  style={{ 
                    borderColor: '#06b6d4',
                    color: '#0891b2'
                  }}
                />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2 text-gray-700">Large Size - Enhanced Layout with Status Badges</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Active Player - Large */}
                <PlayerBox
                  player={{...samplePlayers[4], displayName: "Zoe Parker", avatarColor: "bg-red-500", active: true}}
                  size="lg"
                  showPositions={true}
                  className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                  style={{ 
                    borderColor: '#ef4444',
                    color: '#dc2626'
                  }}
                />

                {/* Inactive Player - Large with Badge */}
                <PlayerBox
                  player={{id: 19, displayName: "Charlotte York", positionPreferences: ["GA", "WA", "C"], avatarColor: "bg-violet-500", active: false}}
                  size="lg"
                  showPositions={true}
                  className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                  style={{ 
                    borderColor: '#8b5cf6',
                    color: '#7c3aed'
                  }}
                />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2 text-gray-700">Mixed Size Comparison - All Heights Aligned</h4>
              <p className="text-sm text-gray-600 mb-3">Notice how badges appear inline and all boxes maintain consistent heights within each size group</p>
              <div className="space-y-4">
                
                {/* Small Size Group */}
                <div>
                  <h5 className="text-xs font-medium mb-2 text-gray-600">Small Size Group</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <PlayerBox
                      player={{id: 20, displayName: "Carrie B", positionPreferences: ["GS"], avatarColor: "bg-pink-500", active: true}}
                      size="sm"
                      showPositions={true}
                      className="hover:shadow-md transition-shadow duration-200"
                      style={{ borderColor: '#ec4899', color: '#be185d' }}
                    />
                    <PlayerBox
                      player={{id: 21, displayName: "Miranda H", positionPreferences: ["GK"], avatarColor: "bg-indigo-500", active: false}}
                      size="sm"
                      showPositions={true}
                      className="hover:shadow-md transition-shadow duration-200"
                      style={{ borderColor: '#6366f1', color: '#4338ca' }}
                    />
                    <PlayerBox
                      player={{id: 22, displayName: "Samantha J", positionPreferences: ["C"], avatarColor: "bg-teal-500", active: true}}
                      size="sm"
                      showPositions={true}
                      className="hover:shadow-md transition-shadow duration-200"
                      style={{ borderColor: '#14b8a6', color: '#0d9488' }}
                    />
                    <PlayerBox
                      player={{id: 23, displayName: "Jessica P", positionPreferences: ["WA"], avatarColor: "bg-slate-500", active: false}}
                      size="sm"
                      showPositions={true}
                      className="hover:shadow-md transition-shadow duration-200"
                      style={{ borderColor: '#64748b', color: '#475569' }}
                    />
                  </div>
                </div>

                {/* Medium Size Group */}
                <div>
                  <h5 className="text-xs font-medium mb-2 text-gray-600">Medium Size Group</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <PlayerBox
                      player={{id: 24, displayName: "Blair Waldorf", positionPreferences: ["GA", "GS"], avatarColor: "bg-purple-500", active: true}}
                      size="md"
                      showPositions={true}
                      className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                      style={{ borderColor: '#a855f7', color: '#7e22ce' }}
                    />
                    <PlayerBox
                      player={{id: 25, displayName: "Serena van der Woodsen", positionPreferences: ["C", "WA"], avatarColor: "bg-yellow-500", active: false}}
                      size="md"
                      showPositions={true}
                      className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                      style={{ borderColor: '#eab308', color: '#a16207' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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