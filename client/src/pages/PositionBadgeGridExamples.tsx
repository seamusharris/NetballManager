
import React, { useState } from 'react';
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
        { label: "Position Badge Grids" }
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
        <meta name="description" content="Grid examples for position badge placement and spacing in 4 and 5 column layouts." />
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
          }
        `}</style>
      </Helmet>

      <div className="prose max-w-none mb-6">
        <p className="text-lg text-gray-700">
          Position badge examples in 4 and 5 column grid layouts with different spacing configurations
        </p>
      </div>

      {/* Position Badge Examples */}
      <section className="mb-8 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Position Badge Examples - 4 & 5 Column Grids</h2>
        <p className="text-sm text-gray-600 mb-6">Examples showing assigned positions with top-left badges in different grid layouts</p>

        <div className="space-y-8">
          {/* 4 Column Grid - With Position Preferences */}
          <div>
            <h3 className="text-lg font-medium mb-3 text-gray-700">4 Column Grid - With Position Preferences & Badges</h3>
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

              {/* Minimal Spacing - With Badges */}
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
            </div>
          </div>

          {/* 5 Column Grid - With Position Preferences */}
          <div>
            <h3 className="text-lg font-medium mb-3 text-gray-700">5 Column Grid - With Position Preferences & Badges</h3>
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

              {/* Minimal Spacing - With Badges */}
              <div>
                <h4 className="text-xs font-medium mb-2 text-gray-600"><strong>Ref:</strong> <code>5col-badges-minimal-spacing</code> - ml-1, space-x-2</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  <div className="relative">
                    <div className="absolute -top-2 -left-2 z-10">
                      <div className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border-2 border-white">
                        GS
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 rounded-lg shadow-md transition-all duration-200 border-2 p-3" style={{ backgroundColor: '#ef444415', borderColor: '#ef4444', color: '#dc2626' }}>
                      <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-red-500 w-14 h-14 text-base ml-1">
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
                      <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-amber-500 w-14 h-14 text-base ml-1">
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
                      <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-cyan-500 w-14 h-14 text-base ml-1">
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
                      <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-pink-500 w-14 h-14 text-base ml-1">
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
                      <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 player-avatar border-4 border-white shadow-lg bg-indigo-500 w-14 h-14 text-base ml-1">
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
          </div>
        </div>
      </section>
    </PageTemplate>
  );
}
