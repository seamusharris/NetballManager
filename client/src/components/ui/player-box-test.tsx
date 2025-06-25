
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayerBox } from './player-box';

export function PlayerBoxTest() {
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<number>>(new Set([1, 3]));

  const testPlayers = [
    {
      id: 1,
      displayName: "Test Player 1",
      firstName: "Test",
      lastName: "Player1",
      positionPreferences: ["GS", "GA"],
      avatarColor: "bg-blue-500",
      active: true
    },
    {
      id: 2,
      displayName: "Test Player 2",
      firstName: "Test",
      lastName: "Player2",
      positionPreferences: ["WA", "C"],
      avatarColor: "bg-green-500",
      active: true
    },
    {
      id: 3,
      displayName: "Test Player 3",
      firstName: "Test",
      lastName: "Player3",
      positionPreferences: ["GD", "WD"],
      avatarColor: "bg-red-500",
      active: true
    },
    {
      id: 4,
      displayName: "Test Player 4",
      firstName: "Test",
      lastName: "Player4",
      positionPreferences: ["GK"],
      avatarColor: "bg-purple-500",
      active: true
    }
  ];

  const handleSelectionChange = (playerId: number, isSelected: boolean) => {
    const newSelectedIds = new Set(selectedPlayerIds);
    if (isSelected) {
      newSelectedIds.add(playerId);
    } else {
      newSelectedIds.delete(playerId);
    }
    setSelectedPlayerIds(newSelectedIds);
  };

  return (
    <div className="p-6 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Enhanced PlayerBox Testing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Selectable Players (Like FixedPlayerAvailabilityManager)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {testPlayers.map(player => (
                <PlayerBox
                  key={player.id}
                  player={player}
                  isSelectable={true}
                  isSelected={selectedPlayerIds.has(player.id)}
                  onSelectionChange={handleSelectionChange}
                  size="md"
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Non-Selectable Players (Should use "selected" styling)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {testPlayers.slice(0, 2).map(player => (
                <PlayerBox
                  key={`non-select-${player.id}`}
                  player={player}
                  isSelectable={false}
                  size="md"
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Legacy PlayerBox (hasSelect prop)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {testPlayers.slice(0, 2).map(player => (
                <PlayerBox
                  key={`legacy-${player.id}`}
                  player={player}
                  hasSelect={true}
                  size="md"
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
