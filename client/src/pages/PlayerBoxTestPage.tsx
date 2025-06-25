
import React, { useState } from 'react';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import PlayerBox from '@/components/ui/player-box';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const PlayerBoxTestPage = () => {
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([1, 3, 5]);

  const handleSelectionChange = (playerId: number, isSelected: boolean) => {
    setSelectedPlayers(prev => 
      isSelected 
        ? [...prev, playerId]
        : prev.filter(id => id !== playerId)
    );
  };

  const samplePlayers = [
    { id: 1, displayName: 'Sarah M', firstName: 'Sarah', lastName: 'Mitchell', isActive: true, color: '#FF6B6B' },
    { id: 2, displayName: 'Emma J', firstName: 'Emma', lastName: 'Johnson', isActive: true, color: '#4ECDC4' },
    { id: 3, displayName: 'Olivia B', firstName: 'Olivia', lastName: 'Brown', isActive: true, color: '#45B7D1' },
    { id: 4, displayName: 'Ava W', firstName: 'Ava', lastName: 'Wilson', isActive: false, color: '#96CEB4' },
    { id: 5, displayName: 'Isabella D', firstName: 'Isabella', lastName: 'Davis', isActive: true, color: '#FECA57' },
    { id: 6, displayName: 'Sophia M', firstName: 'Sophia', lastName: 'Miller', isActive: true, color: '#FF9FF3' },
    { id: 7, displayName: 'Charlotte A', firstName: 'Charlotte', lastName: 'Anderson', isActive: false, color: '#54A0FF' },
    { id: 8, displayName: 'Mia T', firstName: 'Mia', lastName: 'Taylor', isActive: true, color: '#5F27CD' },
  ];

  return (
    <PageTemplate
      title="PlayerBox Component Testing"
      subtitle="Test all selection states and styling variants of the enhanced PlayerBox component"
      breadcrumbs={[
        { label: 'Development', href: '/component-examples' },
        { label: 'PlayerBox Tests' }
      ]}
    >
      <div className="space-y-8">
        {/* Selection State Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Current Selection State</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Selected Players:</span>
              <div className="flex gap-2">
                {selectedPlayers.map(id => (
                  <Badge key={id} variant="secondary">
                    {samplePlayers.find(p => p.id === id)?.displayName}
                  </Badge>
                ))}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedPlayers([])}
              >
                Clear All
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedPlayers(samplePlayers.map(p => p.id))}
              >
                Select All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Selectable Players */}
        <Card>
          <CardHeader>
            <CardTitle>Selectable Players</CardTitle>
            <p className="text-sm text-muted-foreground">
              These players have checkboxes and can be selected/deselected. 
              Deselected players show reduced opacity with lighter borders.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {samplePlayers.map(player => (
                <PlayerBox
                  key={player.id}
                  player={player}
                  isSelectable={true}
                  isSelected={selectedPlayers.includes(player.id)}
                  onSelectionChange={(isSelected) => handleSelectionChange(player.id, isSelected)}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Non-Selectable Players (Default/Selected Style) */}
        <Card>
          <CardHeader>
            <CardTitle>Non-Selectable Players (Default Style)</CardTitle>
            <p className="text-sm text-muted-foreground">
              These players don't have checkboxes and use the "selected" styling (full opacity, medium background).
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {samplePlayers.slice(0, 4).map(player => (
                <PlayerBox
                  key={`non-selectable-${player.id}`}
                  player={player}
                  isSelectable={false}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Size Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Size Variants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-3">Small Size</h4>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                  {samplePlayers.slice(0, 3).map(player => (
                    <PlayerBox
                      key={`small-${player.id}`}
                      player={player}
                      size="sm"
                      isSelectable={true}
                      isSelected={selectedPlayers.includes(player.id)}
                      onSelectionChange={(isSelected) => handleSelectionChange(player.id, isSelected)}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-3">Medium Size (Default)</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {samplePlayers.slice(0, 3).map(player => (
                    <PlayerBox
                      key={`medium-${player.id}`}
                      player={player}
                      size="md"
                      isSelectable={true}
                      isSelected={selectedPlayers.includes(player.id)}
                      onSelectionChange={(isSelected) => handleSelectionChange(player.id, isSelected)}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-3">Large Size</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {samplePlayers.slice(0, 3).map(player => (
                    <PlayerBox
                      key={`large-${player.id}`}
                      player={player}
                      size="lg"
                      isSelectable={true}
                      isSelected={selectedPlayers.includes(player.id)}
                      onSelectionChange={(isSelected) => handleSelectionChange(player.id, isSelected)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active vs Inactive Players */}
        <Card>
          <CardHeader>
            <CardTitle>Active vs Inactive Players</CardTitle>
            <p className="text-sm text-muted-foreground">
              Testing how active and inactive players appear in different selection states.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-3">Active Players</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {samplePlayers.filter(p => p.isActive).slice(0, 4).map(player => (
                    <PlayerBox
                      key={`active-${player.id}`}
                      player={player}
                      isSelectable={true}
                      isSelected={selectedPlayers.includes(player.id)}
                      onSelectionChange={(isSelected) => handleSelectionChange(player.id, isSelected)}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-3">Inactive Players</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {samplePlayers.filter(p => !p.isActive).map(player => (
                    <PlayerBox
                      key={`inactive-${player.id}`}
                      player={player}
                      isSelectable={true}
                      isSelected={selectedPlayers.includes(player.id)}
                      onSelectionChange={(isSelected) => handleSelectionChange(player.id, isSelected)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Color Variations */}
        <Card>
          <CardHeader>
            <CardTitle>Color Variations</CardTitle>
            <p className="text-sm text-muted-foreground">
              Testing different player colors to ensure consistent styling across all color combinations.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {samplePlayers.map(player => (
                <div key={`color-${player.id}`} className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: player.color }}
                    />
                    {player.color}
                  </div>
                  <PlayerBox
                    player={player}
                    isSelectable={true}
                    isSelected={selectedPlayers.includes(player.id)}
                    onSelectionChange={(isSelected) => handleSelectionChange(player.id, isSelected)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reference Implementation */}
        <Card>
          <CardHeader>
            <CardTitle>Reference Implementation</CardTitle>
            <p className="text-sm text-muted-foreground">
              This matches the styling from <code>/team/116/availability/110</code> - the exact colors and behavior we want to replicate.
            </p>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-3">
                Selected players: Full opacity, medium background, solid checkbox
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {samplePlayers.slice(0, 2).map(player => (
                  <PlayerBox
                    key={`ref-selected-${player.id}`}
                    player={player}
                    isSelectable={true}
                    isSelected={true}
                    onSelectionChange={() => {}}
                  />
                ))}
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">
                Deselected players: 0.7 opacity, 2px border matching text color
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {samplePlayers.slice(2, 4).map(player => (
                  <PlayerBox
                    key={`ref-deselected-${player.id}`}
                    player={player}
                    isSelectable={true}
                    isSelected={false}
                    onSelectionChange={() => {}}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
};

export default PlayerBoxTestPage;
