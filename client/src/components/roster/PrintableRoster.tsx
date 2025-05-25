import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Printer } from "lucide-react";
import { TEAM_NAME } from '@/lib/settings';
import { formatDate } from '@/lib/utils';
import { Position, POSITIONS } from '@shared/schema';

// Create a component that renders a printable roster for a game
const PrintableRoster = ({ roster, players, game, opponent }) => {
  const handlePrint = () => {
    window.print();
  };

  // Group roster by quarter and position
  const rosterByQuarter = roster.reduce((acc, entry) => {
    if (!acc[entry.quarter]) acc[entry.quarter] = {};
    acc[entry.quarter][entry.position] = entry;
    return acc;
  }, {});

  // Get player name helper
  const getPlayerName = (playerId) => {
    if (!players || !playerId) return 'Unassigned';
    const player = players.find(p => p.id === playerId);
    return player ? (player.displayName || `${player.firstName} ${player.lastName}`) : 'Unassigned';
  };

  // Format the game date
  const formattedDate = formatDate(game.date);
  const opponentName = opponent ? opponent.teamName : 'BYE Round';

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Printable Game Roster</h2>
        <Button onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print Roster
        </Button>
      </div>

      <div className="print-content">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{TEAM_NAME}</h1>
          <h2 className="text-2xl mb-1">Game Roster</h2>
          <div className="text-lg mb-2">
            vs {opponentName} - {formattedDate} at {game.time}
          </div>
          {game.round && (
            <div className="text-md mb-4">Round {game.round}</div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          {[1, 2, 3, 4].map(quarter => {
            const quarterRoster = rosterByQuarter[quarter] || {};
            
            return (
              <Card key={quarter} className="print:border print:shadow-none">
                <CardHeader className="py-4 print:py-2">
                  <CardTitle className="text-xl">Quarter {quarter}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {POSITIONS.map(position => {
                      const rosterEntry = quarterRoster[position as Position];
                      const playerId = rosterEntry?.playerId;
                      const playerName = getPlayerName(playerId);
                      
                      return (
                        <div 
                          key={position} 
                          className="flex items-center justify-between py-2 border-b last:border-0"
                        >
                          <div className="font-medium">{position}</div>
                          <div className="px-3 py-1 bg-gray-100 rounded">
                            {playerName === 'Unassigned' ? '—' : playerName}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Add page-break for printing */}
        <div className="page-break"></div>

        {/* Game notes section */}
        {game.notes && (
          <div className="mt-6 print:mt-0">
            <Card className="print:border-0 print:shadow-none">
              <CardHeader className="py-4 print:py-2">
                <CardTitle className="text-xl">Game Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap">{game.notes}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Print styles */}
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-content, .print-content * {
              visibility: visible;
            }
            .print-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 20px;
            }
            .page-break {
              page-break-after: always;
            }
            @page {
              size: portrait;
              margin: 2cm;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default PrintableRoster;