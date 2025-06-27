
import React from 'react';
import { Helmet } from 'react-helmet';
import PageTemplate from '@/components/layout/PageTemplate';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

export default function PositionBadgeGridExamples() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <PageTemplate 
      title="Position Badge Grid Examples" 
      breadcrumbs={[
        { label: "Component Examples", href: "/component-examples" },
        { label: "Position Badge Grid Examples" }
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
        <title>Position Badge Grid Examples - Component Library</title>
        <meta name="description" content="4 and 5 column grid examples showing assigned positions with top-left badges in different grid layouts" />
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

            .grid {
              break-inside: avoid;
              page-break-inside: avoid;
            }

            .space-y-8 > * + * {
              margin-top: 1rem !important;
            }

            .space-y-6 > * + * {
              margin-top: 0.75rem !important;
            }

            .space-y-4 > * + * {
              margin-top: 0.5rem !important;
            }

            section {
              break-inside: avoid;
              page-break-inside: avoid;
            }

            .shadow-md, .shadow-lg {
              box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1) !important;
            }

            .bg-white {
              background-color: white !important;
            }

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
          Comprehensive 4 and 5 column grid examples showing assigned positions with top-left badges
        </p>
      </div>

      {/* Position Badge Examples */}
      <section className="mb-8 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Position Badge Examples - 4 & 5 Column Grids</h2>
        <p className="text-sm text-gray-600 mb-6">Examples showing assigned positions with top-left badges in different grid layouts</p>

        <div className="space-y-8">
          {/* 4 Column Grid - With Position Preferences */}
          <div>
            <h3 className="text-lg font-medium mb-4 text-gray-800">4 Column Grid - With Position Preferences & Badges</h3>
            <p className="text-xs text-gray-500 mb-4"><strong>Ref:</strong> <code>4col-badges-standard</code> - ml-3, space-x-4</p>
            <div className="space-y-6">
              {/* With Badges */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <div className="absolute -top-2 -left-2 z-10">
                    <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                      GS
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#3b82f615', borderColor: '#3b82f6', color: '#1d4ed8' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-blue-500 w-14 h-14 text-base ml-3">
                      AS
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold player-name">Anna Smith</div>
                      <div className="text-sm player-positions flex items-center gap-2">
                        <span>GS, GA</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -top-2 -left-2 z-10">
                    <div className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                      GA
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#22c55e15', borderColor: '#22c55e', color: '#15803d' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-green-500 w-14 h-14 text-base ml-3">
                      BJ
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold player-name">Beth Jones</div>
                      <div className="text-sm player-positions flex items-center gap-2">
                        <span>GA, WA</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -top-2 -left-2 z-10">
                    <div className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                      GD
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#a855f715', borderColor: '#a855f7', color: '#7e22ce' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-purple-500 w-14 h-14 text-base ml-3">
                      CB
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold player-name">Chloe Brown</div>
                      <div className="text-sm player-positions flex items-center gap-2">
                        <span>GD, WD</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -top-2 -left-2 z-10">
                    <div className="bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                      C
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#f9731615', borderColor: '#f97316', color: '#ea580c' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-orange-500 w-14 h-14 text-base ml-3">
                      DW
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold player-name">Diana Wilson</div>
                      <div className="text-sm player-positions flex items-center gap-2">
                        <span>C, WA</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Without Badges for Comparison */}
              <div>
                <h4 className="text-xs font-medium mb-2 text-gray-600"><strong>Ref:</strong> <code>4col-no-badges-standard</code> - ml-3, space-x-4</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-4 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#3b82f615', borderColor: '#3b82f6', color: '#1d4ed8' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-blue-500 w-14 h-14 text-base ml-3">
                      AS
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold player-name">Anna Smith</div>
                      <div className="text-sm player-positions flex items-center gap-2">
                        <span>GS, GA</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#22c55e15', borderColor: '#22c55e', color: '#15803d' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-green-500 w-14 h-14 text-base ml-3">
                      BJ
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold player-name">Beth Jones</div>
                      <div className="text-sm player-positions flex items-center gap-2">
                        <span>GA, WA</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#a855f715', borderColor: '#a855f7', color: '#7e22ce' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-purple-500 w-14 h-14 text-base ml-3">
                      CB
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold player-name">Chloe Brown</div>
                      <div className="text-sm player-positions flex items-center gap-2">
                        <span>GD, WD</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#f9731615', borderColor: '#f97316', color: '#ea580c' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-orange-500 w-14 h-14 text-base ml-3">
                      DW
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold player-name">Diana Wilson</div>
                      <div className="text-sm player-positions flex items-center gap-2">
                        <span>C, WA</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reduced Spacing - With Badges */}
              <div>
                <h4 className="text-xs font-medium mb-2 text-gray-600"><strong>Ref:</strong> <code>4col-badges-reduced-spacing</code> - ml-3, space-x-2</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="relative">
                    <div className="absolute -top-2 -left-2 z-10">
                      <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                        GS
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#3b82f615', borderColor: '#3b82f6', color: '#1d4ed8' }}>
                      <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-blue-500 w-14 h-14 text-base ml-3">
                        AS
                      </div>
                      <div className="flex-1">
                        <div className="text-base font-bold player-name">Anna Smith</div>
                        <div className="text-sm player-positions flex items-center gap-2">
                          <span>GS, GA</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -top-2 -left-2 z-10">
                      <div className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                        GA
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#22c55e15', borderColor: '#22c55e', color: '#15803d' }}>
                      <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-green-500 w-14 h-14 text-base ml-3">
                        BJ
                      </div>
                      <div className="flex-1">
                        <div className="text-base font-bold player-name">Beth Jones</div>
                        <div className="text-sm player-positions flex items-center gap-2">
                          <span>GA, WA</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -top-2 -left-2 z-10">
                      <div className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                        GD
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#a855f715', borderColor: '#a855f7', color: '#7e22ce' }}>
                      <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-purple-500 w-14 h-14 text-base ml-3">
                        CB
                      </div>
                      <div className="flex-1">
                        <div className="text-base font-bold player-name">Chloe Brown</div>
                        <div className="text-sm player-positions flex items-center gap-2">
                          <span>GD, WD</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -top-2 -left-2 z-10">
                      <div className="bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                        C
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#f9731615', borderColor: '#f97316', color: '#ea580c' }}>
                      <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-orange-500 w-14 h-14 text-base ml-3">
                        DW
                      </div>
                      <div className="flex-1">
                        <div className="text-base font-bold player-name">Diana Wilson</div>
                        <div className="text-sm player-positions flex items-center gap-2">
                          <span>C, WA</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reduced Spacing - Without Badges */}
              <div>
                <h4 className="text-xs font-medium mb-2 text-gray-600"><strong>Ref:</strong> <code>4col-no-badges-reduced-spacing</code> - ml-3, space-x-2</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#3b82f615', borderColor: '#3b82f6', color: '#1d4ed8' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-blue-500 w-14 h-14 text-base ml-3">
                      AS
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold player-name">Anna Smith</div>
                      <div className="text-sm player-positions flex items-center gap-2">
                        <span>GS, GA</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#22c55e15', borderColor: '#22c55e', color: '#15803d' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-green-500 w-14 h-14 text-base ml-3">
                      BJ
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold player-name">Beth Jones</div>
                      <div className="text-sm player-positions flex items-center gap-2">
                        <span>GA, WA</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#a855f715', borderColor: '#a855f7', color: '#7e22ce' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-purple-500 w-14 h-14 text-base ml-3">
                      CB
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold player-name">Chloe Brown</div>
                      <div className="text-sm player-positions flex items-center gap-2">
                        <span>GD, WD</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#f9731615', borderColor: '#f97316', color: '#ea580c' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-orange-500 w-14 h-14 text-base ml-3">
                      DW
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold player-name">Diana Wilson</div>
                      <div className="text-sm player-positions flex items-center gap-2">
                        <span>C, WA</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Minimal Spacing Variants */}
              <div>
                <h4 className="text-xs font-medium mb-2 text-gray-600"><strong>Ref:</strong> <code>4col-badges-minimal-spacing</code> - ml-1, space-x-2</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="relative">
                    <div className="absolute -top-2 -left-2 z-10">
                      <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                        GS
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#3b82f615', borderColor: '#3b82f6', color: '#1d4ed8' }}>
                      <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-blue-500 w-14 h-14 text-base ml-1">
                        AS
                      </div>
                      <div className="flex-1">
                        <div className="text-base font-bold player-name">Anna Smith</div>
                        <div className="text-sm player-positions flex items-center gap-2">
                          <span>GS, GA</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -top-2 -left-2 z-10">
                      <div className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                        GA
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#22c55e15', borderColor: '#22c55e', color: '#15803d' }}>
                      <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-green-500 w-14 h-14 text-base ml-1">
                        BJ
                      </div>
                      <div className="flex-1">
                        <div className="text-base font-bold player-name">Beth Jones</div>
                        <div className="text-sm player-positions flex items-center gap-2">
                          <span>GA, WA</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -top-2 -left-2 z-10">
                      <div className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                        GD
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#a855f715', borderColor: '#a855f7', color: '#7e22ce' }}>
                      <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-purple-500 w-14 h-14 text-base ml-1">
                        CB
                      </div>
                      <div className="flex-1">
                        <div className="text-base font-bold player-name">Chloe Brown</div>
                        <div className="text-sm player-positions flex items-center gap-2">
                          <span>GD, WD</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -top-2 -left-2 z-10">
                      <div className="bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                        C
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#f9731615', borderColor: '#f97316', color: '#ea580c' }}>
                      <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-orange-500 w-14 h-14 text-base ml-1">
                        DW
                      </div>
                      <div className="flex-1">
                        <div className="text-base font-bold player-name">Diana Wilson</div>
                        <div className="text-sm player-positions flex items-center gap-2">
                          <span>C, WA</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Minimal Spacing - No Badges */}
              <div>
                <h4 className="text-xs font-medium mb-2 text-gray-600"><strong>Ref:</strong> <code>4col-no-badges-minimal-spacing</code> - ml-1, space-x-2</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#3b82f615', borderColor: '#3b82f6', color: '#1d4ed8' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-blue-500 w-14 h-14 text-base ml-1">
                      AS
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold player-name">Anna Smith</div>
                      <div className="text-sm player-positions flex items-center gap-2">
                        <span>GS, GA</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#22c55e15', borderColor: '#22c55e', color: '#15803d' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-green-500 w-14 h-14 text-base ml-1">
                      BJ
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold player-name">Beth Jones</div>
                      <div className="text-sm player-positions flex items-center gap-2">
                        <span>GA, WA</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#a855f715', borderColor: '#a855f7', color: '#7e22ce' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-purple-500 w-14 h-14 text-base ml-1">
                      CB
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold player-name">Chloe Brown</div>
                      <div className="text-sm player-positions flex items-center gap-2">
                        <span>GD, WD</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#f9731615', borderColor: '#f97316', color: '#ea580c' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-orange-500 w-14 h-14 text-base ml-1">
                      DW
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold player-name">Diana Wilson</div>
                      <div className="text-sm player-positions flex items-center gap-2">
                        <span>C, WA</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5 Column Grid - With Position Preferences */}
          <div>
            <h3 className="text-lg font-medium mb-4 text-gray-800">5 Column Grid - With Position Preferences & Badges</h3>
            <p className="text-xs text-gray-500 mb-4"><strong>Ref:</strong> <code>5col-badges-standard</code> - ml-3, space-x-4</p>
            <div className="space-y-6">
              {/* With Badges */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <div className="relative">
                  <div className="absolute -top-2 -left-2 z-10">
                    <div className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                      GS
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#ef444415', borderColor: '#ef4444', color: '#dc2626' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-red-500 w-14 h-14 text-base ml-3">
                      ET
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold player-name">Emma Taylor</div>
                      <div className="text-sm player-positions flex items-center gap-2">
                        <span>GS, GA</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -top-2 -left-2 z-10">
                    <div className="bg-amber-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                      GA
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#f59e0b15', borderColor: '#f59e0b', color: '#d97706' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-amber-500 w-14 h-14 text-base ml-3">
                      FC
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold player-name">Fiona Clark</div>
                      <div className="text-sm player-positions flex items-center gap-2">
                        <span>GA, WA</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -top-2 -left-2 z-10">
                    <div className="bg-cyan-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                      WA
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#06b6d415', borderColor: '#06b6d4', color: '#0891b2' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-cyan-500 w-14 h-14 text-base ml-3">
                      GL
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold player-name">Grace Lee</div>
                      <div className="text-sm player-positions flex items-center gap-2">
                        <span>WA, C</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -top-2 -left-2 z-10">
                    <div className="bg-pink-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                      WD
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#ec489915', borderColor: '#ec4899', color: '#be185d' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-pink-500 w-14 h-14 text-base ml-3">
                      HW
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold player-name">Holly White</div>
                      <div className="text-sm player-positions flex items-center gap-2">
                        <span>WD, GD</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -top-2 -left-2 z-10">
                    <div className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                      GK
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#6366f115', borderColor: '#6366f1', color: '#4338ca' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-indigo-500 w-14 h-14 text-base ml-3">
                      IM
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold player-name">Ivy Martin</div>
                      <div className="text-sm player-positions flex items-center gap-2">
                        <span>GK</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Without Badges for Comparison */}
              <div>
                <h4 className="text-xs font-medium mb-2 text-gray-600"><strong>Ref:</strong> <code>5col-no-badges-standard</code> - ml-3, space-x-4</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  <div className="flex items-center space-x-4 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#ef444415', borderColor: '#ef4444', color: '#dc2626' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-red-500 w-14 h-14 text-base ml-3">
                      ET
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold player-name">Emma Taylor</div>
                      <div className="text-sm player-positions flex items-center gap-2">
                        <span>GS, GA</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#f59e0b15', borderColor: '#f59e0b', color: '#d97706' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-amber-500 w-14 h-14 text-base ml-3">
                      FC
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold player-name">Fiona Clark</div>
                      <div className="text-sm player-positions flex items-center gap-2">
                        <span>GA, WA</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#06b6d415', borderColor: '#06b6d4', color: '#0891b2' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-cyan-500 w-14 h-14 text-base ml-3">
                      GL
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold player-name">Grace Lee</div>
                      <div className="text-sm player-positions flex items-center gap-2">
                        <span>WA, C</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#ec489915', borderColor: '#ec4899', color: '#be185d' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-pink-500 w-14 h-14 text-base ml-3">
                      HW
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold player-name">Holly White</div>
                      <div className="text-sm player-positions flex items-center gap-2">
                        <span>WD, GD</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#6366f115', borderColor: '#6366f1', color: '#4338ca' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-indigo-500 w-14 h-14 text-base ml-3">
                      IM
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold player-name">Ivy Martin</div>
                      <div className="text-sm player-positions flex items-center gap-2">
                        <span>GK</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reduced Spacing - With Badges */}
              <div>
                <h4 className="text-xs font-medium mb-2 text-gray-600"><strong>Ref:</strong> <code>5col-badges-reduced-spacing</code> - ml-3, space-x-2</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  <div className="relative">
                    <div className="absolute -top-2 -left-2 z-10">
                      <div className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                        GS
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#ef444415', borderColor: '#ef4444', color: '#dc2626' }}>
                      <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-red-500 w-14 h-14 text-base ml-3">
                        ET
                      </div>
                      <div className="flex-1">
                        <div className="text-base font-bold player-name">Emma Taylor</div>
                        <div className="text-sm player-positions flex items-center gap-2">
                          <span>GS, GA</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -top-2 -left-2 z-10">
                      <div className="bg-amber-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                        GA
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#f59e0b15', borderColor: '#f59e0b', color: '#d97706' }}>
                      <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-amber-500 w-14 h-14 text-base ml-3">
                        FC
                      </div>
                      <div className="flex-1">
                        <div className="text-base font-bold player-name">Fiona Clark</div>
                        <div className="text-sm player-positions flex items-center gap-2">
                          <span>GA, WA</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -top-2 -left-2 z-10">
                      <div className="bg-cyan-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                        WA
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#06b6d415', borderColor: '#06b6d4', color: '#0891b2' }}>
                      <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-cyan-500 w-14 h-14 text-base ml-3">
                        GL
                      </div>
                      <div className="flex-1">
                        <div className="text-base font-bold player-name">Grace Lee</div>
                        <div className="text-sm player-positions flex items-center gap-2">
                          <span>WA, C</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -top-2 -left-2 z-10">
                      <div className="bg-pink-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                        WD
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#ec489915', borderColor: '#ec4899', color: '#be185d' }}>
                      <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-pink-500 w-14 h-14 text-base ml-3">
                        HW
                      </div>
                      <div className="flex-1">
                        <div className="text-base font-bold player-name">Holly White</div>
                        <div className="text-sm player-positions flex items-center gap-2">
                          <span>WD, GD</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -top-2 -left-2 z-10">
                      <div className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                        GK
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#6366f115', borderColor: '#6366f1', color: '#4338ca' }}>
                      <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-indigo-500 w-14 h-14 text-base ml-3">
                        IM
                      </div>
                      <div className="flex-1">
                        <div className="text-base font-bold player-name">Ivy Martin</div>
                        <div className="text-sm player-positions flex items-center gap-2">
                          <span>GK</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reduced Spacing - Without Badges */}
              <div>
                <h4 className="text-xs font-medium mb-2 text-gray-600"><strong>Ref:</strong> <code>5col-no-badges-reduced-spacing</code> - ml-3, space-x-2</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  <div className="flex items-center space-x-2 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#ef444415', borderColor: '#ef4444', color: '#dc2626' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-red-500 w-14 h-14 text-base ml-3">
                      ET
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold player-name">Emma Taylor</div>
                      <div className="text-sm player-positions flex items-center gap-2">
                        <span>GS, GA</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#f59e0b15', borderColor: '#f59e0b', color: '#d97706' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-amber-500 w-14 h-14 text-base ml-3">
                      FC
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold player-name">Fiona Clark</div>
                      <div className="text-sm player-positions flex items-center gap-2">
                        <span>GA, WA</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#06b6d415', borderColor: '#06b6d4', color: '#0891b2' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-cyan-500 w-14 h-14 text-base ml-3">
                      GL
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold player-name">Grace Lee</div>
                      <div className="text-sm player-positions flex items-center gap-2">
                        <span>WA, C</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#ec489915', borderColor: '#ec4899', color: '#be185d' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-pink-500 w-14 h-14 text-base ml-3">
                      HW
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold player-name">Holly White</div>
                      <div className="text-sm player-positions flex items-center gap-2">
                        <span>WD, GD</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#6366f115', borderColor: '#6366f1', color: '#4338ca' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-indigo-500 w-14 h-14 text-base ml-3">
                      IM
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold player-name">Ivy Martin</div>
                      <div className="text-sm player-positions flex items-center gap-2">
                        <span>GK</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* No Position Preferences Examples */}
          <div>
            <h3 className="text-lg font-medium mb-4 text-gray-800">4 Column Grid - Without Position Preferences</h3>
            <p className="text-xs text-gray-500 mb-4"><strong>Ref:</strong> <code>4col-no-prefs-badges-standard</code> - ml-3, space-x-4</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <div className="absolute -top-2 -left-2 z-10">
                  <div className="bg-teal-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                    GS
                  </div>
                </div>
                <div className="flex items-center space-x-4 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#14b8a615', borderColor: '#14b8a6', color: '#0d9488' }}>
                  <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-teal-500 w-14 h-14 text-base ml-3">
                    JG
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold player-name">Julia Green</div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -top-2 -left-2 z-10">
                  <div className="bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                    GA
                  </div>
                </div>
                <div className="flex items-center space-x-4 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#10b98115', borderColor: '#10b981', color: '#059669' }}>
                  <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-emerald-500 w-14 h-14 text-base ml-3">
                    KA
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold player-name">Kate Adams</div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -top-2 -left-2 z-10">
                  <div className="bg-slate-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                    GD
                  </div>
                </div>
                <div className="flex items-center space-x-4 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#64748b15', borderColor: '#64748b', color: '#475569' }}>
                  <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-slate-500 w-14 h-14 text-base ml-3">
                    LH
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold player-name">Lucy Hill</div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -top-2 -left-2 z-10">
                  <div className="bg-rose-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                    C
                  </div>
                </div>
                <div className="flex items-center space-x-4 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#f43f5e15', borderColor: '#f43f5e', color: '#e11d48' }}>
                  <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-rose-500 w-14 h-14 text-base ml-3">
                    MS
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold player-name">Maya Scott</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-xs font-medium mb-2 text-gray-600"><strong>Ref:</strong> <code>4col-no-prefs-no-badges-standard</code> - ml-3, space-x-4</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center space-x-4 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#14b8a615', borderColor: '#14b8a6', color: '#0d9488' }}>
                  <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-teal-500 w-14 h-14 text-base ml-3">
                    JG
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold player-name">Julia Green</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#10b98115', borderColor: '#10b981', color: '#059669' }}>
                  <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-emerald-500 w-14 h-14 text-base ml-3">
                    KA
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold player-name">Kate Adams</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#64748b15', borderColor: '#64748b', color: '#475569' }}>
                  <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-slate-500 w-14 h-14 text-base ml-3">
                    LH
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold player-name">Lucy Hill</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#f43f5e15', borderColor: '#f43f5e', color: '#e11d48' }}>
                  <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-rose-500 w-14 h-14 text-base ml-3">
                    MS
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold player-name">Maya Scott</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-xs font-medium mb-2 text-gray-600"><strong>Ref:</strong> <code>4col-no-prefs-badges-reduced-spacing</code> - ml-3, space-x-2</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <div className="absolute -top-2 -left-2 z-10">
                    <div className="bg-teal-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                      GS
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#14b8a615', borderColor: '#14b8a6', color: '#0d9488' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-teal-500 w-14 h-14 text-base ml-3">
                      JG
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold player-name">Julia Green</div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -top-2 -left-2 z-10">
                    <div className="bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                      GA
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#10b98115', borderColor: '#10b981', color: '#059669' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-emerald-500 w-14 h-14 text-base ml-3">
                      KA
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold player-name">Kate Adams</div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -top-2 -left-2 z-10">
                    <div className="bg-slate-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                      GD
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#64748b15', borderColor: '#64748b', color: '#475569' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-slate-500 w-14 h-14 text-base ml-3">
                      LH
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold player-name">Lucy Hill</div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -top-2 -left-2 z-10">
                    <div className="bg-rose-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                      C
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#f43f5e15', borderColor: '#f43f5e', color: '#e11d48' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-rose-500 w-14 h-14 text-base ml-3">
                      MS
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold player-name">Maya Scott</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-xs font-medium mb-2 text-gray-600"><strong>Ref:</strong> <code>4col-no-prefs-no-badges-reduced-spacing</code> - ml-3, space-x-2</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#14b8a615', borderColor: '#14b8a6', color: '#0d9488' }}>
                  <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-teal-500 w-14 h-14 text-base ml-3">
                    JG
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold player-name">Julia Green</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#10b98115', borderColor: '#10b981', color: '#059669' }}>
                  <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-emerald-500 w-14 h-14 text-base ml-3">
                    KA
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold player-name">Kate Adams</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#64748b15', borderColor: '#64748b', color: '#475569' }}>
                  <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-slate-500 w-14 h-14 text-base ml-3">
                    LH
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold player-name">Lucy Hill</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#f43f5e15', borderColor: '#f43f5e', color: '#e11d48' }}>
                  <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-rose-500 w-14 h-14 text-base ml-3">
                    MS
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold player-name">Maya Scott</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5 Column Grid - Without Position Preferences */}
          <div>
            <h3 className="text-lg font-medium mb-4 text-gray-800">5 Column Grid - Without Position Preferences</h3>
            <p className="text-xs text-gray-500 mb-4"><strong>Ref:</strong> <code>5col-no-prefs-badges-standard</code> - ml-3, space-x-4</p>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="relative">
                <div className="absolute -top-2 -left-2 z-10">
                  <div className="bg-violet-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                    GS
                  </div>
                </div>
                <div className="flex items-center space-x-4 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#8b5cf615', borderColor: '#8b5cf6', color: '#7c3aed' }}>
                  <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-violet-500 w-14 h-14 text-base ml-3">
                    ND
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold player-name">Nina Davis</div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -top-2 -left-2 z-10">
                  <div className="bg-lime-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                    GA
                  </div>
                </div>
                <div className="flex items-center space-x-4 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#84cc1615', borderColor: '#84cc16', color: '#65a30d' }}>
                  <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-lime-500 w-14 h-14 text-base ml-3">
                    OK
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold player-name">Olivia King</div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -top-2 -left-2 z-10">
                  <div className="bg-sky-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                    WA
                  </div>
                </div>
                <div className="flex items-center space-x-4 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#0ea5e915', borderColor: '#0ea5e9', color: '#0284c7' }}>
                  <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-sky-500 w-14 h-14 text-base ml-3">
                    PY
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold player-name">Penny Young</div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -top-2 -left-2 z-10">
                  <div className="bg-fuchsia-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                    WD
                  </div>
                </div>
                <div className="flex items-center space-x-4 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#d946ef15', borderColor: '#d946ef', color: '#c026d3' }}>
                  <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-fuchsia-500 w-14 h-14 text-base ml-3">
                    QH
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold player-name">Quinn Hall</div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -top-2 -left-2 z-10">
                  <div className="bg-stone-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                    GK
                  </div>
                </div>
                <div className="flex items-center space-x-4 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#78716c15', borderColor: '#78716c', color: '#57534e' }}>
                  <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-stone-500 w-14 h-14 text-base ml-3">
                    RM
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold player-name">Ruby Moore</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-xs font-medium mb-2 text-gray-600"><strong>Ref:</strong> <code>5col-no-prefs-no-badges-standard</code> - ml-3, space-x-4</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <div className="flex items-center space-x-4 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#8b5cf615', borderColor: '#8b5cf6', color: '#7c3aed' }}>
                  <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-violet-500 w-14 h-14 text-base ml-3">
                    ND
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold player-name">Nina Davis</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#84cc1615', borderColor: '#84cc16', color: '#65a30d' }}>
                  <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-lime-500 w-14 h-14 text-base ml-3">
                    OK
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold player-name">Olivia King</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#0ea5e915', borderColor: '#0ea5e9', color: '#0284c7' }}>
                  <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-sky-500 w-14 h-14 text-base ml-3">
                    PY
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold player-name">Penny Young</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#d946ef15', borderColor: '#d946ef', color: '#c026d3' }}>
                  <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-fuchsia-500 w-14 h-14 text-base ml-3">
                    QH
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold player-name">Quinn Hall</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#78716c15', borderColor: '#78716c', color: '#57534e' }}>
                  <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-stone-500 w-14 h-14 text-base ml-3">
                    RM
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold player-name">Ruby Moore</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-xs font-medium mb-2 text-gray-600"><strong>Ref:</strong> <code>5col-no-prefs-badges-reduced-spacing</code> - ml-3, space-x-2</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <div className="relative">
                  <div className="absolute -top-2 -left-2 z-10">
                    <div className="bg-violet-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                      GS
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#8b5cf615', borderColor: '#8b5cf6', color: '#7c3aed' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-violet-500 w-14 h-14 text-base ml-3">
                      ND
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold player-name">Nina Davis</div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -top-2 -left-2 z-10">
                    <div className="bg-lime-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                      GA
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#84cc1615', borderColor: '#84cc16', color: '#65a30d' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-lime-500 w-14 h-14 text-base ml-3">
                      OK
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold player-name">Olivia King</div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -top-2 -left-2 z-10">
                    <div className="bg-sky-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                      WA
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#0ea5e915', borderColor: '#0ea5e9', color: '#0284c7' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-sky-500 w-14 h-14 text-base ml-3">
                      PY
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold player-name">Penny Young</div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -top-2 -left-2 z-10">
                    <div className="bg-fuchsia-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                      WD
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#d946ef15', borderColor: '#d946ef', color: '#c026d3' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-fuchsia-500 w-14 h-14 text-base ml-3">
                      QH
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold player-name">Quinn Hall</div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -top-2 -left-2 z-10">
                    <div className="bg-stone-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                      GK
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#78716c15', borderColor: '#78716c', color: '#57534e' }}>
                    <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-stone-500 w-14 h-14 text-base ml-3">
                      RM
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold player-name">Ruby Moore</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-xs font-medium mb-2 text-gray-600"><strong>Ref:</strong> <code>5col-no-prefs-no-badges-reduced-spacing</code> - ml-3, space-x-2</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <div className="flex items-center space-x-2 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#8b5cf615', borderColor: '#8b5cf6', color: '#7c3aed' }}>
                  <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-violet-500 w-14 h-14 text-base ml-3">
                    ND
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold player-name">Nina Davis</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#84cc1615', borderColor: '#84cc16', color: '#65a30d' }}>
                  <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-lime-500 w-14 h-14 text-base ml-3">
                    OK
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold player-name">Olivia King</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#0ea5e915', borderColor: '#0ea5e9', color: '#0284c7' }}>
                  <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-sky-500 w-14 h-14 text-base ml-3">
                    PY
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold player-name">Penny Young</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#d946ef15', borderColor: '#d946ef', color: '#c026d3' }}>
                  <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-fuchsia-500 w-14 h-14 text-base ml-3">
                    QH
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold player-name">Quinn Hall</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#78716c15', borderColor: '#78716c', color: '#57534e' }}>
                  <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-stone-500 w-14 h-14 text-base ml-3">
                    RM
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold player-name">Ruby Moore</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageTemplate>
  );
}
