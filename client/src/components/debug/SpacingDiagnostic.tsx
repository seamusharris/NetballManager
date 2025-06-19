
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GamesContainer } from '@/components/ui/games-container';
import GameResultCard from '@/components/ui/game-result-card';
import { cn } from '@/lib/utils';

// Mock game data for testing
const mockGame1 = {
  id: 1,
  date: "2025-06-15",
  time: "10:00",
  homeTeamId: 123,
  awayTeamId: 1,
  homeTeamName: "Test Team A",
  awayTeamName: "Test Team B",
  statusIsCompleted: true,
  statusDisplayName: "Completed",
  round: "10"
};

const mockGame2 = {
  id: 2,
  date: "2025-06-08",
  time: "11:00",
  homeTeamId: 123,
  awayTeamId: 2,
  homeTeamName: "Test Team A",
  awayTeamName: "Test Team C",
  statusIsCompleted: true,
  statusDisplayName: "Completed",
  round: "9"
};

const mockGame3 = {
  id: 3,
  date: "2025-06-01",
  time: "12:00",
  homeTeamId: 123,
  awayTeamId: 3,
  homeTeamName: "Test Team A",
  awayTeamName: "Test Team D",
  statusIsCompleted: true,
  statusDisplayName: "Completed",
  round: "8"
};

const mockScores = [
  { id: 1, gameId: 1, teamId: 123, quarter: 1, score: 15 },
  { id: 2, gameId: 1, teamId: 1, quarter: 1, score: 12 },
];

interface SpacingDiagnosticProps {
  className?: string;
}

export default function SpacingDiagnostic({ className }: SpacingDiagnosticProps) {
  const [inspectedElement, setInspectedElement] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Check if Tailwind classes are being applied
    const container = document.querySelector('[data-testid="games-container"]');
    if (container) {
      const computedStyles = window.getComputedStyle(container);
      const classList = container.className;
      console.log('=== SPACING DIAGNOSTIC ===');
      console.log('Container classes:', classList);
      console.log('Container computed margin-bottom:', computedStyles.marginBottom);
      console.log('Container computed gap:', computedStyles.gap);
      console.log('Container computed display:', computedStyles.display);
      console.log('Container computed flex-direction:', computedStyles.flexDirection);
      
      // Check children spacing
      const children = container.children;
      for (let i = 0; i < children.length; i++) {
        const child = children[i] as HTMLElement;
        const childStyles = window.getComputedStyle(child);
        console.log(`Child ${i + 1} margin-top:`, childStyles.marginTop);
        console.log(`Child ${i + 1} margin-bottom:`, childStyles.marginBottom);
      }
      console.log('=== END DIAGNOSTIC ===');
    }
  }, []);

  return (
    <div className={cn("space-y-8 p-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle>Spacing Diagnostic Tool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Raw Tailwind Test */}
          <div>
            <h3 className="text-lg font-semibold mb-4">1. Raw Tailwind space-y-4 Test</h3>
            <div className="space-y-4 border-2 border-blue-200 p-4 rounded">
              <div className="bg-red-200 p-2 rounded">Item 1</div>
              <div className="bg-green-200 p-2 rounded">Item 2</div>
              <div className="bg-blue-200 p-2 rounded">Item 3</div>
            </div>
          </div>

          {/* GamesContainer with Simple Divs */}
          <div>
            <h3 className="text-lg font-semibold mb-4">2. GamesContainer with Simple Divs</h3>
            <GamesContainer spacing="normal" className="border-2 border-green-200 p-4 rounded">
              <div className="bg-yellow-200 p-2 rounded">Game Card Placeholder 1</div>
              <div className="bg-orange-200 p-2 rounded">Game Card Placeholder 2</div>
              <div className="bg-purple-200 p-2 rounded">Game Card Placeholder 3</div>
            </GamesContainer>
          </div>

          {/* GamesContainer with GameResultCards */}
          <div>
            <h3 className="text-lg font-semibold mb-4">3. GamesContainer with GameResultCards</h3>
            <GamesContainer 
              spacing="normal" 
              className="border-2 border-purple-200 p-4 rounded"
              data-testid="games-container"
            >
              <GameResultCard
                key={mockGame1.id}
                game={mockGame1}
                players={[]}
                currentTeamId={123}
                centralizedScores={mockScores}
                showQuickActions={false}
                className="w-full"
              />
              <GameResultCard
                key={mockGame2.id}
                game={mockGame2}
                players={[]}
                currentTeamId={123}
                centralizedScores={[]}
                showQuickActions={false}
                className="w-full"
              />
              <GameResultCard
                key={mockGame3.id}
                game={mockGame3}
                players={[]}
                currentTeamId={123}
                centralizedScores={[]}
                showQuickActions={false}
                className="w-full"
              />
            </GamesContainer>
          </div>

          {/* Different Spacing Options */}
          <div>
            <h3 className="text-lg font-semibold mb-4">4. Different Spacing Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium mb-2">Tight (space-y-2)</h4>
                <GamesContainer spacing="tight" className="border border-gray-300 p-2 rounded">
                  <div className="bg-gray-200 p-1 rounded text-sm">Item A</div>
                  <div className="bg-gray-200 p-1 rounded text-sm">Item B</div>
                  <div className="bg-gray-200 p-1 rounded text-sm">Item C</div>
                </GamesContainer>
              </div>
              <div>
                <h4 className="font-medium mb-2">Normal (space-y-4)</h4>
                <GamesContainer spacing="normal" className="border border-gray-300 p-2 rounded">
                  <div className="bg-gray-200 p-1 rounded text-sm">Item A</div>
                  <div className="bg-gray-200 p-1 rounded text-sm">Item B</div>
                  <div className="bg-gray-200 p-1 rounded text-sm">Item C</div>
                </GamesContainer>
              </div>
              <div>
                <h4 className="font-medium mb-2">Loose (space-y-6)</h4>
                <GamesContainer spacing="loose" className="border border-gray-300 p-2 rounded">
                  <div className="bg-gray-200 p-1 rounded text-sm">Item A</div>
                  <div className="bg-gray-200 p-1 rounded text-sm">Item B</div>
                  <div className="bg-gray-200 p-1 rounded text-sm">Item C</div>
                </GamesContainer>
              </div>
            </div>
          </div>

          {/* Manual spacing test */}
          <div>
            <h3 className="text-lg font-semibold mb-4">5. Manual Inline Spacing Test</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="border-2 border-orange-200 p-4 rounded">
              <div className="bg-cyan-200 p-2 rounded">Manual Gap Item 1</div>
              <div className="bg-cyan-200 p-2 rounded">Manual Gap Item 2</div>
              <div className="bg-cyan-200 p-2 rounded">Manual Gap Item 3</div>
            </div>
          </div>

          {/* CSS Debug Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">6. CSS Debug Information</h3>
            <div className="bg-gray-100 p-4 rounded font-mono text-sm">
              <p><strong>Expected behavior:</strong> space-y-4 should add margin-top: 1rem (16px) to all children except the first</p>
              <p><strong>Check:</strong> Open browser dev tools and inspect the GamesContainer element above</p>
              <p><strong>Look for:</strong> className should include "space-y-4"</p>
              <p><strong>CSS output:</strong> Children should have computed margin-top of 16px (except first child)</p>
              <button 
                onClick={() => {
                  const container = document.querySelector('[data-testid="games-container"]');
                  if (container) {
                    console.log('=== MANUAL INSPECTION ===');
                    console.log('Container element:', container);
                    console.log('Container classes:', container.className);
                    console.log('Container children count:', container.children.length);
                    setInspectedElement(container.className);
                  }
                }}
                className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs"
              >
                Log Container Info to Console
              </button>
              {inspectedElement && (
                <div className="mt-2 p-2 bg-white rounded">
                  <strong>Container classes:</strong> {inspectedElement}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
