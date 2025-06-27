import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import PageTemplate from '@/components/layout/PageTemplate';
import { PlayerBox } from '@/components/ui/player-box';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, UserPlus, Award, Printer } from 'lucide-react';
import { getBorderColorHex, getPlayerColorHex, getLighterColorHex, getMediumColorHex } from '@/lib/playerColorUtils';

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
    const [selectedPlayers, setSelectedPlayers] = useState(new Set());

  const togglePlayerSelection = (playerId) => {
    setSelectedPlayers((prevSelectedPlayers) => {
      const newSelectedPlayers = new Set(prevSelectedPlayers);
      if (newSelectedPlayers.has(playerId)) {
        newSelectedPlayers.delete(playerId);
      } else {
        newSelectedPlayers.add(playerId);
      }
      return newSelectedPlayers;
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <PageTemplate 
      title="PlayerBox Examples" 
      breadcrumbs={[
        { label: "Component Examples", href: "/component-examples" },
        { label: "PlayerBox Examples" }
      ]}
      actions={
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handlePrint}
          className="no-print flex items-center gap-2"
        >
          <Printer className="h-4 w-4" />
          Print Examples
        </Button>
      }
    >
      <Helmet>
        <title>PlayerBox Examples - Component Library</title>
        <meta name="description" content="Explore different variations and configurations of the PlayerBox component for netball team management applications." />
        <style type="text/css">{`
          @media print {
            .no-print {
              display: none !important;
            }

            body {
              font-size: 12px;
              line-height: 1.3;
            }

            .prose {
              max-width: none !important;
            }

            /* Ensure grids stack properly in print */
            .grid {
              break-inside: avoid;
              page-break-inside: avoid;
            }

            /* Reduce spacing for print */
            .space-y-8 > * + * {
              margin-top: 1rem !important;
            }

            .space-y-6 > * + * {
              margin-top: 0.75rem !important;
            }

            .space-y-4 > * + * {
              margin-top: 0.5rem !important;
            }

            /* Ensure sections don't break across pages */
            section {
              break-inside: avoid;
              page-break-inside: avoid;
            }

            /* Optimize card shadows for print */
            .shadow-md, .shadow-lg {
              box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1) !important;
            }

            /* Ensure colors print well */
            .bg-white {
              background-color: white !important;
            }

            /* Make text more readable in print */
            .text-gray-700 {
              color: #374151 !important;
            }

            .text-gray-600 {
              color: #4b5563 !important;
            }
          }
        `}</style>
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
          <p className="text-sm text-gray-600 mb-4"><strong>Reference:</strong> <code>full-width-stats</code></p>
          <div className="space-y-4">
            {/* Green - Sarah's Colors */}
            <div className="w-full">
              <div className="relative">
                <div 
                  className="absolute top-1/2 right-3 w-6 h-6 rounded flex items-center justify-center cursor-pointer text-white z-10 transform -translate-y-1/2 mr-3"
                  style={{ backgroundColor: getBorderColorHex('bg-green-600') }}
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
                  hasSelect={true}
                  className="w-full shadow-md transition-shadow duration-200 hover:shadow-lg"
                  style={{ 
                    borderColor: getBorderColorHex('bg-green-600'),
                    color: getBorderColorHex('bg-green-600')
                  }}
                />
              </div>
            </div>

            {/* Blue Variation */}
            <div className="w-full">
              <div className="relative">
                <div 
                  className="absolute top-1/2 right-3 w-6 h-6 rounded flex items-center justify-center cursor-pointer text-white z-10 transform -translate-y-1/2 mr-3 transition-all duration-200"
                  style={{ backgroundColor: selectedPlayers.has(2) ? getBorderColorHex('bg-blue-500') : 'transparent', border: selectedPlayers.has(2) ? 'none' : `2px solid ${getBorderColorHex('bg-blue-500')}` }}
                  onClick={() => togglePlayerSelection(2)}
                >
                  {selectedPlayers.has(2) && '✓'}
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
                  hasSelect={true}
                  className="w-full shadow-md transition-all duration-200 hover:shadow-lg cursor-pointer"
                  style={{ 
                    backgroundColor: selectedPlayers.has(2) ? getMediumColorHex('bg-blue-500') : getLighterColorHex('bg-blue-500'),
                    borderColor: getBorderColorHex('bg-blue-500'),
                    color: getBorderColorHex('bg-blue-500')
                  }}
                  onClick={() => togglePlayerSelection(2)}
                /></div>
            </div>

            {/* Purple Variation */}
            <div className="w-full">
              <div className="relative">
                <div 
                  className="absolute top-1/2 right-3 w-6 h-6 rounded flex items-center justify-center cursor-pointer text-white z-10 transform -translate-y-1/2 mr-3 transition-all duration-200"
                  style={{ backgroundColor: selectedPlayers.has(3) ? getBorderColorHex('bg-purple-500') : 'transparent', border: selectedPlayers.has(3) ? 'none' : `2px solid ${getBorderColorHex('bg-purple-500')}` }}
                  onClick={() => togglePlayerSelection(3)}
                >
                  {selectedPlayers.has(3) && '✓'}
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
                  hasSelect={true}
                  className="w-full shadow-md transition-all duration-200 hover:shadow-lg cursor-pointer"
                  style={{ 
                    backgroundColor: selectedPlayers.has(3) ? getMediumColorHex('bg-purple-500') : getLighterColorHex('bg-purple-500'),
                    borderColor: getBorderColorHex('bg-purple-500'),
                    color: getBorderColorHex('bg-purple-500')
                  }}
                  onClick={() => togglePlayerSelection(3)}
                /></div>
            </div>
          </div>
        </div>

        {/* Court Position Ready Examples */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4 text-gray-800">Court Position Ready (No Select Boxes)</h3>
          <p className="text-sm text-gray-600 mb-4"><strong>Reference:</strong> <code>court-position-ready</code></p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Orange Court Position */}
            <PlayerBox 
              player={{...samplePlayers[3], displayName: "Mia Thompson", avatarColor: "bg-orange-500"}}
              size="md"
              showPositions={true}
              className="shadow-lg"
              style={{ 
                borderColor: getBorderColorHex('bg-orange-500'),
                color: getBorderColorHex('bg-orange-500')
              }}
              onClick={() => {}}
            />

            {/* Red Court Position */}
            <PlayerBox 
              player={{...samplePlayers[4], displayName: "Zoe Parker", avatarColor: "bg-red-500"}}
              size="md"
              showPositions={true}
              className="shadow-lg"
              style={{ 
                borderColor: getBorderColorHex('bg-red-500'),
                color: getBorderColorHex('bg-red-500')
              }}
              onClick={() => {}}
            />

            {/* Teal Court Position */}
            <PlayerBox 
              player={{...samplePlayers[0], displayName: "Emma Wilson", avatarColor: "bg-teal-500"}}
              size="md"
              showPositions={true}
              className="shadow-lg"
              style={{ 
                borderColor: getBorderColorHex('bg-teal-500'),
                color: getBorderColorHex('bg-teal-500')
              }}
              onClick={() => {}}
            />
          </div>
        </div>

        {/* Small Court Position Allocation Examples */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4 text-gray-800">Small Court Position Allocation</h3>
          <p className="text-sm text-gray-600 mb-4"><strong>Reference:</strong> <code>small-court-allocation</code> - Compact examples for allocating players to court positions - with and without position preferences</p>

          <div className="space-y-6">
            {/* With Position Preferences */}
            <div>
              <h4 className="text-sm font-medium mb-3 text-gray-700">With Position Preferences</h4>
              <p className="text-xs text-gray-500 mb-3"><strong>Ref:</strong> <code>small-with-positions</code></p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <PlayerBox 
                  player={{...samplePlayers[1], displayName: "Sarah J", positionPreferences: ["C", "WA"], avatarColor: "bg-green-600"}}
                  size="sm"
                  showPositions={true}
                  className="shadow-md"
                  style={{ borderColor: '#16a34a', color: '#15803d' }}
                  onClick={() => {}}
                />
                <PlayerBox 
                  player={{...samplePlayers[2], displayName: "Lily C", positionPreferences: ["GK", "GD"], avatarColor: "bg-purple-500", active: true}}
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

            {/* Medium-Small Names Only */}
            <div>
              <h4 className="text-sm font-medium mb-3 text-gray-700">Medium-Small Names Only (Longer Names, No Wrapping)</h4>
              <p className="text-xs text-gray-500 mb-3"><strong>Ref:</strong> <code>medium-small-names</code></p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                <PlayerBox 
                  player={{id: 40, displayName: "Alexandria M", avatarColor: "bg-cyan-500"}}
                  size="sm"
                  showPositions={false}
                  className="hover:shadow-lg transition-shadow duration-200"
                  style={{ borderColor: '#06b6d4', color: '#0891b2' }}
                />
                <PlayerBox 
                  player={{id: 41, displayName: "Bella Katherine", avatarColor: "bg-teal-500"}}
                  size="sm"
                  showPositions={false}
                  className="hover:shadow-lg transition-shadow duration-200"
                  style={{ borderColor: '#14b8a6', color: '#0d9488' }}
                />
                <PlayerBox 
                  player={{id: 42, displayName: "Charlotte-Rose D", avatarColor: "bg-amber-500"}}
                  size="sm"
                  showPositions={false}
                  className="hover:shadow-lg transition-shadow duration-200"
                  style={{ borderColor: '#f59e0b', color: '#d97706' }}
                />
                <PlayerBox 
                  player={{id: 43, displayName: "Daisy-Mae H", avatarColor: "bg-emerald-500"}}
                  size="sm"
                  showPositions={false}
                  className="hover:shadow-lg transition-shadow duration-200"
                  style={{ borderColor: '#10b981', color: '#059669' }}
                />
                <PlayerBox 
                  player={{id: 44, displayName: "Elizabeth S", avatarColor: "bg-violet-500"}}
                  size="sm"
                  showPositions={false}
                  className="hover:shadow-lg transition-shadow duration-200"
                  style={{ borderColor: '#8b5cf6', color: '#7c3aed' }}
                />
                <PlayerBox 
                  player={{id: 45, displayName: "Francesca-Belle", avatarColor: "bg-rose-500"}}
                  size="sm"
                  showPositions={false}
                  className="hover:shadow-lg transition-shadow duration-200"
                  style={{ borderColor: '#f43f5e', color: '#e11d48' }}
                />
                <PlayerBox 
                  player={{id: 46, displayName: "Gabriella W", avatarColor: "bg-slate-500"}}
                  size="sm"
                  showPositions={false}
                  className="hover:shadow-lg transition-shadow duration-200"
                  style={{ borderColor: '#64748b', color: '#475569' }}
                />
              </div>
            </div>

            {/* Names Only */}
            <div>
              <h4 className="text-sm font-medium mb-3 text-gray-700">Small Names Only (Compact)</h4>
              <p className="text-xs text-gray-500 mb-3"><strong>Ref:</strong> <code>small-names-only</code></p>
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
              <p className="text-xs text-gray-500 mb-3"><strong>Ref:</strong> <code>ultra-compact</code></p>
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
          <p className="text-sm text-gray-600 mb-4"><strong>Reference:</strong> <code>compact-format</code></p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Compact with Select - Pink */}
            <div className="relative">
              <div 
                className="absolute top-1/2 right-4 w-5 h-5 rounded border-2 cursor-pointer z-10 transform -translate-y-1/2 mr-3"
                style={{ borderColor: getBorderColorHex('bg-pink-500'), backgroundColor: 'transparent' }}
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
                style={{ backgroundColor: getBorderColorHex('bg-indigo-500') }}
              >
                ✓
              </div>
              <PlayerBox 
                player={{...samplePlayers[2], displayName: "Lily Chen", avatarColor: "bg-indigo-500", active: true}}
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
          <p className="text-sm text-gray-600 mb-4"><strong>Reference:</strong> <code>large-format</code></p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Large with Select - Cyan */}
            <div className="relative">
              <div 
                className="absolute top-1/2 right-3 w-7 h-7 rounded flex items-center justify-center cursor-pointer text-white z-10 transform -translate-y-1/2 mr-3"
                style={{ backgroundColor: getBorderColorHex('bg-cyan-500') }}
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
                className="absolute top-1/2 right-3 w-7 h-7 rounded border-2 cursor-pointer z-10 transform -translate-y-1/2 mr-3"
                style={{ borderColor: getBorderColorHex('bg-amber-500'), backgroundColor: 'transparent' }}
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
          <p className="text-sm text-gray-600 mb-4"><strong>Reference:</strong> <code>mixed-selection</code></p>
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
                className="absolute top-1/2 right-3 w-6 h-6 rounded border-2 cursor-pointer z-10 transform -translate-y-1/2 mr-3"
                style={{ borderColor: '#f43f5e', backgroundColor: 'transparent' }}
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
                    style={{ borderColor: getBorderColorHex('bg-purple-500') }}
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
                    style={{ borderColor: getBorderColorHex('bg-orange-500') }}
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
                    style={{ borderColor: getBorderColorHex('bg-teal-500') }}
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

            {/* Working Select Example */}
            <div>
              <h4 className="text-sm font-medium mb-2 text-gray-700">Working Select Example</h4>
              <p className="text-sm text-gray-600 mb-3">Click the boxes to see selection states in action</p>
              <div className="space-y-3">
                <div className="relative">
                  <div 
                    className="absolute top-1/2 right-3 w-6 h-6 rounded flex items-center justify-center cursor-pointer text-white z-10 transform -translate-y-1/2 mr-3 transition-all duration-200"
                    style={{ backgroundColor: selectedPlayers.has(50) ? '#16a34a' : 'transparent', border: selectedPlayers.has(50) ? 'none' : '2px solid #16a34a' }}
                    onClick={() => togglePlayerSelection(50)}
                  >
                    {selectedPlayers.has(50) && '✓'}
                  </div>
                  <PlayerBox 
                    player={{id: 50, displayName: "Interactive Example 1", positionPreferences: ["GA", "GS"], avatarColor: "bg-green-600"}}
                    size="md"
                    showPositions={true}
                    hasSelect={true}
                    className="shadow-md transition-all duration-200 hover:shadow-lg cursor-pointer"
                    style={{ 
                      backgroundColor: selectedPlayers.has(50) ? '#16a34a25' : '#16a34a15',
                      borderColor: '#16a34a',
                      color: '#15803d'
                    }}
                    onClick={() => togglePlayerSelection(50)}
                  />
                </div>
                <div className="relative">
                  <div 
                    className="absolute top-1/2 right-3 w-6 h-6 rounded flex items-center justify-center cursor-pointer text-white z-10 transform -translate-y-1/2 mr-3 transition-all duration-200"
                    style={{ backgroundColor: selectedPlayers.has(51) ? '#3b82f6' : 'transparent', border: selectedPlayers.has(51) ? 'none' : '2px solid #3b82f6' }}
                    onClick={() => togglePlayerSelection(51)}
                  >
                    {selectedPlayers.has(51) && '✓'}
                  </div>
                  <PlayerBox 
                    player={{id: 51, displayName: "Interactive Example 2", positionPreferences: ["C", "WA"], avatarColor: "bg-blue-500"}}
                    size="md"
                    showPositions={true}
                    hasSelect={true}
                    className="shadow-md transition-all duration-200 hover:shadow-lg cursor-pointer"
                    style={{ 
                      backgroundColor: selectedPlayers.has(51) ? '#3b82f625' : '#3b82f615',
                      borderColor: '#3b82f6',
                      color: '#1d4ed8'
                    }}
                    onClick={() => togglePlayerSelection(51)}
                  />
                </div>
              </div>
            </div>

            

            {/* Badge Color Variations */}
            <div>
              <h4 className="text-sm font-medium mb-2 text-gray-700">Badge Color Variations - Adapting to Avatar Colors</h4>
              <p className="text-sm text-gray-600 mb-3">Badges that adapt to work well with different avatar color schemes</p>
              <div className="space-y-4">

                {/* Standard Badge Approach */}
                <div>
                  <h5 className="text-xs font-medium mb-2 text-gray-600">Standard Badge (Fixed Colors)</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <PlayerBox
                      player={{id: 30, displayName: "Standard Badge 1", avatarColor: "bg-green-600", active: false}}
                      size="md"
                      showPositions={true}
                      className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                      style={{ borderColor: '#16a34a', color: '#15803d' }}
                    />
                    <PlayerBox
                      player={{id: 31, displayName: "Standard Badge 2", avatarColor: "bg-purple-500", active: false}}
                      size="md"
                      showPositions={true}
                      className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                      style={{ borderColor: '#a855f7', color: '#7e22ce' }}
                    />
                  </div>
                </div>

                {/* Color-Adapted Badge Approach */}
                <div>
                  <h5 className="text-xs font-medium mb-2 text-gray-600">Color-Adapted Badges (Matches Avatar Color)</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <PlayerBox
                      player={{id: 32, displayName: "Color-Adapted 1", avatarColor: "bg-green-600", active: false}}
                      size="md"
                      showPositions={true}
                      customBadge={
                        <div className="px-2 py-1 text-xs rounded" style={{ backgroundColor: '#16a34a25', color: '#15803d', border: '1px solid #16a34a50' }}>
                          Inactive
                        </div>
                      }
                      className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                      style={{ borderColor: '#16a34a', color: '#15803d' }}
                    />
                    <PlayerBox
                      player={{id: 33, displayName: "Color-Adapted 2", avatarColor: "bg-purple-500", active: false}}
                      size="md"
                      showPositions={true}
                      customBadge={
                        <div className="px-2 py-1 text-xs rounded" style={{ backgroundColor: '#a855f725', color: '#7e22ce', border: '1px solid #a855f750' }}>
                          Inactive
                        </div>
                      }
                      className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                      style={{ borderColor: '#a855f7', color: '#7e22ce' }}
                    />
                  </div>
                </div>

                {/* Badge Type Examples */}
                <div>
                  <h5 className="text-xs font-medium mb-2 text-gray-600">Different Badge Types with Color Adaptation</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Season Badge */}
                    <PlayerBox
                      player={{id: 34, displayName: "Season Badge Example", avatarColor: "bg-orange-500", active: true}}
                      size="md"
                      showPositions={true}
                      customBadge={
                        <div className="px-2 py-1 text-xs rounded" style={{ backgroundColor: '#f9731625', color: '#ea580c', border: '1px solid #f9731650' }}>
                          New
                        </div>
                      }
                      className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                      style={{ borderColor: '#f97316', color: '#ea580c' }}
                    />

                    {/* Team Badge */}
                    <PlayerBox
                      player={{id: 35, displayName: "Team Badge Example", avatarColor: "bg-red-500", active: true}}
                      size="md"
                      showPositions={true}
                      customBadge={
                        <div className="px-2 py-1 text-xs rounded" style={{ backgroundColor: '#ef444425', color: '#dc2626', border: '1px solid #ef444450' }}>
                          Captain
                        </div>
                      }
                      className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                      style={{ borderColor: '#ef4444', color: '#dc2626' }}
                    />

                    {/* Status Badge */}
                    <PlayerBox
                      player={{id: 36, displayName: "Status Badge Example", avatarColor: "bg-amber-500", active: true}}
                      size="md"
                      showPositions={true}
                      customBadge={
                        <div className="px-2 py-1 text-xs rounded" style={{ backgroundColor: '#f59e0b25', color: '#d97706', border: '1px solid #f59e0b50' }}>
                          Injured
                        </div>
                      }
                      className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                      style={{ borderColor: '#f59e0b', color: '#d97706' }}
                    />

                    {/* Playing Status Badge */}
                    <PlayerBox
                      player={{id: 37, displayName: "Playing Status Example", avatarColor: "bg-teal-500", active: true}}
                      size="md"
                      showPositions={true}
                      customBadge={
                        <div className="px-2 py-1 text-xs rounded" style={{ backgroundColor: '#14b8a625', color: '#0d9488', border: '1px solid #14b8a650' }}>
                          On Loan
                        </div>
                      }
                      className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                      style={{ borderColor: '#14b8a6', color: '#0d9488' }}
                    />
                  </div>
                </div>

                {/* Contrast Badge Examples */}
                <div>
                  <h5 className="text-xs font-medium mb-2 text-gray-600">High-Contrast Badges (For Better Visibility)</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <PlayerBox
                      player={{id: 38, displayName: "High Contrast 1", avatarColor: "bg-indigo-500", active: false}}
                      size="md"
                      showPositions={true}
                      customBadge={
                        <div className="px-2 py-1 text-xs rounded bg-white text-gray-800 border border-gray-300 shadow-sm">
                          Inactive
                        </div>
                      }
                      className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                      style={{ borderColor: '#6366f1', color: '#4338ca' }}
                    />
                    <PlayerBox
                      player={{id: 39, displayName: "High Contrast 2", avatarColor: "bg-slate-500", active: false}}
                      size="md"
                      showPositions={true}
                      customBadge={
                        <div className="px-2 py-1 text-xs rounded bg-gray-800 text-white">
                          Inactive
                        </div>
                      }
                      className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                      style={{ borderColor: '#64748b', color: '#475569' }}
                    />
                  </div>
                </div>
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
                  className="hover:shadow-md transition-shadow duration-200"
                  style={{ 
                    borderColor: '#10b981',
                    color: '#059669'
                  }}
                />

                <PlayerBox
                  player={{id: 16, displayName: "Monica Geller", positionPreferences: ["C", "WA"], avatarColor: "bg-rose-500", active: false}}
                  size="sm"
                  showPositions={true}
                  className="hover:shadow-md transition-shadow duration-200"
                  style={{ 
                    borderColor: '#f43f5e',
                    color: '#e11d48'
                  }}
                />

                <PlayerBox
                  player={{id: 17, displayName: "Phoebe Buffay", positionPreferences: ["GK"], avatarColor: "bg-amber-500", active: true}}
                  size="sm"
                  showPositions={true}
                  className="hover:shadow-md transition-shadow duration-200"
                  style={{ 
                    borderColor: '#f59e0b',
                    color: '#d97706'
                  }}
                />

                <PlayerBox
                  player={{id: 18, displayName: "Joey Tribbiani", positionPreferences: ["GD", "WD"], avatarColor: "bg-cyan-500", active: false}}
                  size="sm"
                  showPositions={true}
                  className="hover:shadow-md transition-shadow duration-200"
                  style={{ 
                    borderColor: '#06b6d4',
                    color: '#0891b2'
                  }}
                />
              </div>
            </div>


          </div>
        </div>

        {/* Assigned Position Display Examples */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4 text-gray-800">Assigned Position Display Examples</h3>
          <p className="text-sm text-gray-600 mb-6">Different ways to show when a player has been assigned to a specific position (not preferences)</p>

          <div className="space-y-8">
            {/* Top-Left Position Badge Approach */}
            <div>
              <h4 className="text-sm font-medium mb-3 text-gray-700">Top-Left Position Badge (Improved Spacing)</h4>
              <p className="text-xs text-gray-500 mb-4"><strong>Ref:</strong> <code>position-badge-overlay</code> - Added extra left margin to prevent badge crowding</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="relative">
                  <div className="absolute -top-2 -left-2 z-10">
                    <div className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                      GS
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ borderColor: '#16a34a', color: '#15803d' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-green-600 w-14 h-14 text-base ml-2">
                      EW
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold player-name">Emma Wilson</div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -top-2 -left-2 z-10">
                    <div className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                      C
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ borderColor: '#3b82f6', color: '#1d4ed8' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-blue-500 w-14 h-14 text-base ml-2">
                      SJ
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold player-name">Sarah Johnson</div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -top-2 -left-2 z-10">
                    <div className="bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                      GK
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ borderColor: '#a855f7', color: '#7e22ce' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-purple-500 w-14 h-14 text-base ml-2">
                      LC
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold player-name">Lily Chen</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Avatar Initials Replacement Approach */}
            <div>
              <h4 className="text-sm font-medium mb-3 text-gray-700">Position as Avatar Initials</h4>
              <p className="text-xs text-gray-500 mb-4"><strong>Ref:</strong> <code>position-avatar-initials</code></p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ borderColor: '#f97316', color: '#ea580c' }}>
                  <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-orange-500 w-14 h-14 text-base">
                    GA
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold player-name">Mia Thompson</div>
                    <div className="text-sm player-positions flex items-center gap-2">
                      <span className="text-orange-600 font-medium">Assigned: Goal Attack</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ borderColor: '#ef4444', color: '#dc2626' }}>
                  <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-red-500 w-14 h-14 text-base">
                    WD
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold player-name">Zoe Parker</div>
                    <div className="text-sm player-positions flex items-center gap-2">
                      <span className="text-red-600 font-medium">Assigned: Wing Defence</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ borderColor: '#14b8a6', color: '#0d9488' }}>
                  <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-teal-500 w-14 h-14 text-base">
                    WA
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold player-name">Kate Miller</div>
                    <div className="text-sm player-positions flex items-center gap-2">
                      <span className="text-teal-600 font-medium">Assigned: Wing Attack</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Inline Position Badge Approach */}
            <div>
              <h4 className="text-sm font-medium mb-3 text-gray-700">Inline Position Badge</h4>
              <p className="text-xs text-gray-500 mb-4"><strong>Ref:</strong> <code>position-inline-badge</code></p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PlayerBox 
                  player={{id: 63, displayName: "Jessica Adams", avatarColor: "bg-pink-500"}}
                  size="md"
                  showPositions={false}
                  customBadge={
                    <div className="inline-flex items-center">
                      <div className="px-2 py-1 text-xs rounded font-bold text-white bg-pink-600 mr-2">
                        GD
                      </div>
                      <span className="text-xs text-pink-600">Goal Defence</span>
                    </div>
                  }
                  className="shadow-md"
                  style={{ borderColor: '#ec4899', color: '#be185d' }}
                />

                <PlayerBox 
                  player={{id: 64, displayName: "Rachel Green", avatarColor: "bg-indigo-500"}}
                  size="md"
                  showPositions={false}
                  customBadge={
                    <div className="inline-flex items-center">
                      <div className="px-2 py-1 text-xs rounded font-bold text-white bg-indigo-600 mr-2">
                        GS
                      </div>
                      <span className="text-xs text-indigo-600">Goal Shooter</span>
                    </div>
                  }
                  className="shadow-md"
                  style={{ borderColor: '#6366f1', color: '#4338ca' }}
                />
              </div>
            </div>

            {/* Small Court Assignment Examples */}
            <div>
              <h4 className="text-sm font-medium mb-3 text-gray-700">Small Court Assignment Layout (Improved Spacing)</h4>
              <p className="text-xs text-gray-500 mb-4"><strong>Ref:</strong> <code>small-court-assignment</code> - Added extra left margin to prevent badge crowding</p>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                <div className="relative">
                  <div className="absolute -top-1 -left-1 z-10">
                    <div className="bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 rounded shadow border border-white">
                      GS
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border-2 p-2" style={{ borderColor: '#3b82f6', color: '#1d4ed8' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-blue-500 w-8 h-8 text-sm ml-1">
                      AB
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold player-name">Anna B</div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -top-1 -left-1 z-10">
                    <div className="bg-green-600 text-white text-xs font-bold px-1.5 py-0.5 rounded shadow border border-white">
                      GA
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border-2 p-2" style={{ borderColor: '#22c55e', color: '#15803d' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-green-500 w-8 h-8 text-sm ml-1">
                      BC
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold player-name">Beth C</div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -top-1 -left-1 z-10">
                    <div className="bg-amber-600 text-white text-xs font-bold px-1.5 py-0.5 rounded shadow border border-white">
                      WA
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border-2 p-2" style={{ borderColor: '#f59e0b', color: '#d97706' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-amber-500 w-8 h-8 text-sm ml-1">
                      CD
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold player-name">Chloe D</div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -top-1 -left-1 z-10">
                    <div className="bg-orange-600 text-white text-xs font-bold px-1.5 py-0.5 rounded shadow border border-white">
                      C
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border-2 p-2" style={{ borderColor: '#f97316', color: '#ea580c' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-orange-500 w-8 h-8 text-sm ml-1">
                      DE
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold player-name">Daisy E</div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -top-1 -left-1 z-10">
                    <div className="bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded shadow border border-white">
                      WD
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border-2 p-2" style={{ borderColor: '#ef4444', color: '#dc2626' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-red-500 w-8 h-8 text-sm ml-1">
                      EF
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold player-name">Ella F</div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -top-1 -left-1 z-10">
                    <div className="bg-purple-600 text-white text-xs font-bold px-1.5 py-0.5 rounded shadow border border-white">
                      GD
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border-2 p-2" style={{ borderColor: '#a855f7', color: '#7e22ce' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-purple-500 w-8 h-8 text-sm ml-1">
                      FG
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold player-name">Fiona G</div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -top-1 -left-1 z-10">
                    <div className="bg-pink-600 text-white text-xs font-bold px-1.5 py-0.5 rounded shadow border border-white">
                      GK
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border-2 p-2" style={{ borderColor: '#ec4899', color: '#be185d' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-pink-500 w-8 h-8 text-sm ml-1">
                      GH
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold player-name">Grace H</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Position Color Coordination */}
            <div>
              <h4 className="text-sm font-medium mb-3 text-gray-700">Position Color Coordination</h4>
              <p className="text-xs text-gray-500 mb-4"><strong>Ref:</strong> <code>position-color-coordination</code> - Using consistent colors for positions</p>
              <div className="space-y-3">
                <div className="text-xs text-gray-600 mb-2">Attack positions (GS, GA, WA) - Warm colors</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="relative">
                    <div className="absolute -top-2 -left-2 z-10">
                      <div className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                        GS
                      </div>
                    </div>
                    <PlayerBox 
                      player={{id: 72, displayName: "Attack Player 1", avatarColor: "bg-red-500"}}
                      size="md"
                      showPositions={false}
                      className="shadow-md"
                      style={{ borderColor: '#ef4444', color: '#dc2626' }}
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute -top-2 -left-2 z-10">
                      <div className="bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                        GA
                      </div>
                    </div>
                    <PlayerBox 
                      player={{id: 73, displayName: "Attack Player 2", avatarColor: "bg-orange-500"}}
                      size="md"
                      showPositions={false}
                      className="shadow-md"
                      style={{ borderColor: '#f97316', color: '#ea580c' }}
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute -top-2 -left-2 z-10">
                      <div className="bg-amber-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                        WA
                      </div>
                    </div>
                    <PlayerBox 
                      player={{id: 74, displayName: "Attack Player 3", avatarColor: "bg-amber-500"}}
                      size="md"
                      showPositions={false}
                      className="shadow-md"
                      style={{ borderColor: '#f59e0b', color: '#d97706' }}
                    />
                  </div>
                </div>

                <div className="text-xs text-gray-600 mb-2 mt-4">Centre position (C) - Neutral color</div>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-3 max-w-md">
                  <div className="relative">
                    <div className="absolute -top-2 -left-2 z-10">
                      <div className="bg-gray-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                        C
                      </div>
                    </div>
                    <PlayerBox 
                      player={{id: 75, displayName: "Centre Player", avatarColor: "bg-gray-500"}}
                      size="md"
                      showPositions={false}
                      className="shadow-md"
                      style={{ borderColor: '#6b7280', color: '#4b5563' }}
                    />
                  </div>
                </div>

                <div className="text-xs text-gray-600 mb-2 mt-4">Defence positions (WD, GD, GK) - Cool colors</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="relative">
                    <div className="absolute -top-2 -left-2 z-10">
                      <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                        WD
                      </div>
                    </div>
                    <PlayerBox 
                      player={{id: 76, displayName: "Defence Player 1", avatarColor: "bg-blue-500"}}
                      size="md"
                      showPositions={false}
                      className="shadow-md"
                      style={{ borderColor: '#3b82f6', color: '#1d4ed8' }}
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute -top-2 -left-2 z-10">
                      <div className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                        GD
                      </div>
                    </div>
                    <PlayerBox 
                      player={{id: 77, displayName: "Defence Player 2", avatarColor: "bg-purple-500"}}
                      size="md"
                      showPositions={false}
                      className="shadow-md"
                      style={{ borderColor: '#a855f7', color: '#7e22ce' }}
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute -top-2 -left-2 z-10">
                      <div className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                        GK
                      </div>
                    </div>
                    <PlayerBox 
                      player={{id: 78, displayName: "Defence Player 3", avatarColor: "bg-indigo-500"}}
                      size="md"
                      showPositions={false}
                      className="shadow-md"
                      style={{ borderColor: '#6366f1', color: '#4338ca' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Normal Player Boxes with Improved Margins */}
            <div>
              <h4 className="text-sm font-medium mb-3 text-gray-700">Normal Player Boxes (Improved Spacing)</h4>
              <p className="text-xs text-gray-500 mb-4"><strong>Ref:</strong> <code>normal-improved-spacing</code> - Standard player boxes with the same improved left margins for consistency</p>
              <div className="space-y-4">
                <div>
                  <h5 className="text-sm font-medium mb-2 text-gray-600">Medium Size - With Position Preferences</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-4 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ borderColor: '#06b6d4', color: '#0891b2' }}>
                      <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-cyan-500 w-14 h-14 text-base ml-2">
                        JM
                      </div>
                      <div className="flex-1">
                        <div className="text-base font-bold player-name">Jessica Miller</div>
                        <div className="text-sm player-positions flex items-center gap-2">
                          <span>GS, GA</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ borderColor: '#14b8a6', color: '#0d9488' }}>
                      <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-teal-500 w-14 h-14 text-base ml-2">
                        KW
                      </div>
                      <div className="flex-1">
                        <div className="text-base font-bold player-name">Katie Williams</div>
                        <div className="text-sm player-positions flex items-center gap-2">
                          <span>WD, GD, GK</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium mb-2 text-gray-600">Small Size - Names Only</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="flex items-center space-x-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border-2 p-2" style={{ borderColor: '#f59e0b', color: '#d97706' }}>
                      <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-amber-500 w-8 h-8 text-sm ml-1">
                        LB
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold player-name">Lucy Brown</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border-2 p-2" style={{ borderColor: '#8b5cf6', color: '#7c3aed' }}>
                      <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-violet-500 w-8 h-8 text-sm ml-1">
                        MD
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold player-name">Megan Davis</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border-2 p-2" style={{ borderColor: '#f43f5e', color: '#e11d48' }}>
                      <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-rose-500 w-8 h-8 text-sm ml-1">
                        NW
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold player-name">Nicole Wilson</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border-2 p-2" style={{ borderColor: '#6366f1', color: '#4338ca' }}>
                      <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-indigo-500 w-8 h-8 text-sm ml-1">
                        OT
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold player-name">Olivia Taylor</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium mb-2 text-gray-600">Comparison Note</h5>
                  <p className="text-xs text-gray-500 mb-2">
                    All player boxes now use consistent left margins (<code>ml-2</code> for medium size, <code>ml-1</code> for small size) 
                    to ensure adequate spacing whether or not position badges are present.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>






    </PageTemplate>
  );
}