
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

        {/* Normal Improved Spacing Examples */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4 text-gray-800">Normal Improved Spacing</h3>
          <p className="text-sm text-gray-600 mb-4">Player boxes with proper background colors and improved left margin</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            <PlayerBox 
              player={{...samplePlayers[1], displayName: "Sarah Johnson", avatarColor: "bg-green-600"}}
              size="md"
              showPositions={true}
              className="shadow-md transition-shadow duration-200 hover:shadow-lg"
              style={{ 
                backgroundColor: getLighterColorHex('bg-green-600'),
                borderColor: getBorderColorHex('bg-green-600'),
                color: getBorderColorHex('bg-green-600'),
                marginLeft: '8px'
              }}
            />
            <PlayerBox 
              player={{...samplePlayers[0], displayName: "Emma Wilson", avatarColor: "bg-blue-500"}}
              size="md"
              showPositions={true}
              className="shadow-md transition-shadow duration-200 hover:shadow-lg"
              style={{ 
                backgroundColor: getLighterColorHex('bg-blue-500'),
                borderColor: getBorderColorHex('bg-blue-500'),
                color: getBorderColorHex('bg-blue-500'),
                marginLeft: '8px'
              }}
            />
            <PlayerBox 
              player={{...samplePlayers[2], displayName: "Lily Chen", avatarColor: "bg-purple-500"}}
              size="md"
              showPositions={true}
              className="shadow-md transition-shadow duration-200 hover:shadow-lg"
              style={{ 
                backgroundColor: getLighterColorHex('bg-purple-500'),
                borderColor: getBorderColorHex('bg-purple-500'),
                color: getBorderColorHex('bg-purple-500'),
                marginLeft: '8px'
              }}
            />
            <PlayerBox 
              player={{...samplePlayers[3], displayName: "Mia Thompson", avatarColor: "bg-orange-500"}}
              size="md"
              showPositions={true}
              className="shadow-md transition-shadow duration-200 hover:shadow-lg"
              style={{ 
                backgroundColor: getLighterColorHex('bg-orange-500'),
                borderColor: getBorderColorHex('bg-orange-500'),
                color: getBorderColorHex('bg-orange-500'),
                marginLeft: '8px'
              }}
            />
            <PlayerBox 
              player={{...samplePlayers[4], displayName: "Zoe Parker", avatarColor: "bg-red-500"}}
              size="md"
              showPositions={true}
              className="shadow-md transition-shadow duration-200 hover:shadow-lg"
              style={{ 
                backgroundColor: getLighterColorHex('bg-red-500'),
                borderColor: getBorderColorHex('bg-red-500'),
                color: getBorderColorHex('bg-red-500'),
                marginLeft: '8px'
              }}
            />
          </div>
        </div>

        {/* Position Color Coordination Examples */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4 text-gray-800">Position Color Coordination</h3>
          <p className="text-sm text-gray-600 mb-4">Examples with enhanced left margin and position badges</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            <PlayerBox 
              player={{...samplePlayers[1], displayName: "Sarah Johnson", avatarColor: "bg-green-600"}}
              size="md"
              showPositions={true}
              className="shadow-md transition-shadow duration-200 hover:shadow-lg"
              style={{ 
                backgroundColor: getLighterColorHex('bg-green-600'),
                borderColor: getBorderColorHex('bg-green-600'),
                color: getBorderColorHex('bg-green-600'),
                marginLeft: '12px'
              }}
            />
            <PlayerBox 
              player={{...samplePlayers[0], displayName: "Emma Wilson", avatarColor: "bg-blue-500"}}
              size="md"
              showPositions={true}
              className="shadow-md transition-shadow duration-200 hover:shadow-lg"
              style={{ 
                backgroundColor: getLighterColorHex('bg-blue-500'),
                borderColor: getBorderColorHex('bg-blue-500'),
                color: getBorderColorHex('bg-blue-500'),
                marginLeft: '12px'
              }}
            />
            <PlayerBox 
              player={{...samplePlayers[2], displayName: "Lily Chen", avatarColor: "bg-purple-500"}}
              size="md"
              showPositions={true}
              className="shadow-md transition-shadow duration-200 hover:shadow-lg"
              style={{ 
                backgroundColor: getLighterColorHex('bg-purple-500'),
                borderColor: getBorderColorHex('bg-purple-500'),
                color: getBorderColorHex('bg-purple-500'),
                marginLeft: '12px'
              }}
            />
            <PlayerBox 
              player={{...samplePlayers[3], displayName: "Mia Thompson", avatarColor: "bg-orange-500"}}
              size="md"
              showPositions={true}
              className="shadow-md transition-shadow duration-200 hover:shadow-lg"
              style={{ 
                backgroundColor: getLighterColorHex('bg-orange-500'),
                borderColor: getBorderColorHex('bg-orange-500'),
                color: getBorderColorHex('bg-orange-500'),
                marginLeft: '12px'
              }}
            />
            <PlayerBox 
              player={{...samplePlayers[4], displayName: "Zoe Parker", avatarColor: "bg-red-500"}}
              size="md"
              showPositions={true}
              className="shadow-md transition-shadow duration-200 hover:shadow-lg"
              style={{ 
                backgroundColor: getLighterColorHex('bg-red-500'),
                borderColor: getBorderColorHex('bg-red-500'),
                color: getBorderColorHex('bg-red-500'),
                marginLeft: '12px'
              }}
            />
          </div>
        </div>

        {/* Position Badge Examples */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Position Badge Examples</h3>
          <p className="text-sm text-gray-600 mb-4">Player boxes with assigned positions shown as badges</p>

          <div className="space-y-6">
            {/* Position Badge Overlay */}
            <div>
              <h4 className="text-base font-medium mb-3">Position Badge Overlay</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <PlayerBox 
                  player={{...samplePlayers[1], displayName: "Sarah Johnson", avatarColor: "bg-green-600"}}
                  size="md"
                  showPositions={true}
                  className="shadow-md transition-shadow duration-200 hover:shadow-lg relative"
                  style={{ 
                    backgroundColor: getLighterColorHex('bg-green-600'),
                    borderColor: getBorderColorHex('bg-green-600'),
                    color: getBorderColorHex('bg-green-600'),
                    marginLeft: '12px'
                  }}
                />
                <PlayerBox 
                  player={{...samplePlayers[0], displayName: "Emma Wilson", avatarColor: "bg-blue-500"}}
                  size="md"
                  showPositions={true}
                  className="shadow-md transition-shadow duration-200 hover:shadow-lg relative"
                  style={{ 
                    backgroundColor: getLighterColorHex('bg-blue-500'),
                    borderColor: getBorderColorHex('bg-blue-500'),
                    color: getBorderColorHex('bg-blue-500'),
                    marginLeft: '12px'
                  }}
                />
                <PlayerBox 
                  player={{...samplePlayers[2], displayName: "Lily Chen", avatarColor: "bg-purple-500"}}
                  size="md"
                  showPositions={true}
                  className="shadow-md transition-shadow duration-200 hover:shadow-lg relative"
                  style={{ 
                    backgroundColor: getLighterColorHex('bg-purple-500'),
                    borderColor: getBorderColorHex('bg-purple-500'),
                    color: getBorderColorHex('bg-purple-500'),
                    marginLeft: '12px'
                  }}
                />
                <PlayerBox 
                  player={{...samplePlayers[3], displayName: "Mia Thompson", avatarColor: "bg-orange-500"}}
                  size="md"
                  showPositions={true}
                  className="shadow-md transition-shadow duration-200 hover:shadow-lg relative"
                  style={{ 
                    backgroundColor: getLighterColorHex('bg-orange-500'),
                    borderColor: getBorderColorHex('bg-orange-500'),
                    color: getBorderColorHex('bg-orange-500'),
                    marginLeft: '12px'
                  }}
                />
                <PlayerBox 
                  player={{...samplePlayers[4], displayName: "Zoe Parker", avatarColor: "bg-red-500"}}
                  size="md"
                  showPositions={true}
                  className="shadow-md transition-shadow duration-200 hover:shadow-lg relative"
                  style={{ 
                    backgroundColor: getLighterColorHex('bg-red-500'),
                    borderColor: getBorderColorHex('bg-red-500'),
                    color: getBorderColorHex('bg-red-500'),
                    marginLeft: '12px'
                  }}
                />
              </div>
            </div>

            {/* Position Avatar Initials */}
            <div>
              <h4 className="text-base font-medium mb-3">Position Avatar Initials</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <PlayerBox 
                  player={{...samplePlayers[1], displayName: "Sarah Johnson", avatarColor: "bg-green-600"}}
                  size="md"
                  showPositions={true}
                  className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                  style={{ 
                    backgroundColor: getLighterColorHex('bg-green-600'),
                    borderColor: getBorderColorHex('bg-green-600'),
                    color: getBorderColorHex('bg-green-600'),
                    marginLeft: '12px'
                  }}
                />
                <PlayerBox 
                  player={{...samplePlayers[0], displayName: "Emma Wilson", avatarColor: "bg-blue-500"}}
                  size="md"
                  showPositions={true}
                  className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                  style={{ 
                    backgroundColor: getLighterColorHex('bg-blue-500'),
                    borderColor: getBorderColorHex('bg-blue-500'),
                    color: getBorderColorHex('bg-blue-500'),
                    marginLeft: '12px'
                  }}
                />
                <PlayerBox 
                  player={{...samplePlayers[2], displayName: "Lily Chen", avatarColor: "bg-purple-500"}}
                  size="md"
                  showPositions={true}
                  className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                  style={{ 
                    backgroundColor: getLighterColorHex('bg-purple-500'),
                    borderColor: getBorderColorHex('bg-purple-500'),
                    color: getBorderColorHex('bg-purple-500'),
                    marginLeft: '12px'
                  }}
                />
                <PlayerBox 
                  player={{...samplePlayers[3], displayName: "Mia Thompson", avatarColor: "bg-orange-500"}}
                  size="md"
                  showPositions={true}
                  className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                  style={{ 
                    backgroundColor: getLighterColorHex('bg-orange-500'),
                    borderColor: getBorderColorHex('bg-orange-500'),
                    color: getBorderColorHex('bg-orange-500'),
                    marginLeft: '12px'
                  }}
                />
                <PlayerBox 
                  player={{...samplePlayers[4], displayName: "Zoe Parker", avatarColor: "bg-red-500"}}
                  size="md"
                  showPositions={true}
                  className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                  style={{ 
                    backgroundColor: getLighterColorHex('bg-red-500'),
                    borderColor: getBorderColorHex('bg-red-500'),
                    color: getBorderColorHex('bg-red-500'),
                    marginLeft: '12px'
                  }}
                />
              </div>
            </div>

            {/* Small Court Assignment */}
            <div>
              <h4 className="text-base font-medium mb-3">Small Court Assignment</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <PlayerBox 
                  player={{...samplePlayers[1], displayName: "Sarah J", avatarColor: "bg-green-600"}}
                  size="sm"
                  showPositions={true}
                  className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                  style={{ 
                    backgroundColor: getLighterColorHex('bg-green-600'),
                    borderColor: getBorderColorHex('bg-green-600'),
                    color: getBorderColorHex('bg-green-600'),
                    marginLeft: '12px'
                  }}
                />
                <PlayerBox 
                  player={{...samplePlayers[0], displayName: "Emma W", avatarColor: "bg-blue-500"}}
                  size="sm"
                  showPositions={true}
                  className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                  style={{ 
                    backgroundColor: getLighterColorHex('bg-blue-500'),
                    borderColor: getBorderColorHex('bg-blue-500'),
                    color: getBorderColorHex('bg-blue-500'),
                    marginLeft: '12px'
                  }}
                />
                <PlayerBox 
                  player={{...samplePlayers[2], displayName: "Lily C", avatarColor: "bg-purple-500"}}
                  size="sm"
                  showPositions={true}
                  className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                  style={{ 
                    backgroundColor: getLighterColorHex('bg-purple-500'),
                    borderColor: getBorderColorHex('bg-purple-500'),
                    color: getBorderColorHex('bg-purple-500'),
                    marginLeft: '12px'
                  }}
                />
                <PlayerBox 
                  player={{...samplePlayers[3], displayName: "Mia T", avatarColor: "bg-orange-500"}}
                  size="sm"
                  showPositions={true}
                  className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                  style={{ 
                    backgroundColor: getLighterColorHex('bg-orange-500'),
                    borderColor: getBorderColorHex('bg-orange-500'),
                    color: getBorderColorHex('bg-orange-500'),
                    marginLeft: '12px'
                  }}
                />
                <PlayerBox 
                  player={{...samplePlayers[4], displayName: "Zoe P", avatarColor: "bg-red-500"}}
                  size="sm"
                  showPositions={true}
                  className="shadow-md transition-shadow duration-200 hover:shadow-lg"
                  style={{ 
                    backgroundColor: getLighterColorHex('bg-red-500'),
                    borderColor: getBorderColorHex('bg-red-500'),
                    color: getBorderColorHex('bg-red-500'),
                    marginLeft: '12px'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageTemplate>
  );
}
