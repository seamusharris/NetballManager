import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlayerBox } from '@/components/ui/player-box';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Check, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';

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
];

const sampleStats = [
  { label: "Goals", value: "12" },
  { label: "Assists", value: "8" },
  { label: "Turnovers", value: "3" }
];

export default function PlayerBoxReference() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedPlayers, setSelectedPlayers] = useState<Set<number>>(new Set([1, 3]));

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSelectionChange = (playerId: number, isSelected: boolean) => {
    const newSelected = new Set(selectedPlayers);
    if (isSelected) {
      newSelected.add(playerId);
    } else {
      newSelected.delete(playerId);
    }
    setSelectedPlayers(newSelected);
  };

  const handlePrint = () => {
    window.print();
  };

  const CodeBlock = ({ code, id }: { code: string; id: string }) => (
    <div className="relative">
      <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
        <code>{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2"
        onClick={() => handleCopy(code, id)}
      >
        {copiedCode === id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );

  return (
    <PageTemplate 
      title="PlayerBox Component Reference" 
      breadcrumbs={[
        { label: "Development", href: "/component-examples" },
        { label: "Reference", href: "/reference" },
        { label: "PlayerBox Component" }
      ]}
      actions={
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handlePrint}
          className="no-print flex items-center gap-2"
        >
          <Printer className="h-4 w-4" />
          Print Reference
        </Button>
      }
    >
      <Helmet>
        <title>PlayerBox Component Reference - Design System</title>
        <meta name="description" content="Complete reference documentation for the PlayerBox component including props, variants, and usage examples." />
        <style type="text/css">{`
          @media print {
            .no-print { display: none !important; }
            body { font-size: 12px; line-height: 1.3; }
            .prose { max-width: none !important; }
          }
        `}</style>
      </Helmet>

      <div className="space-y-8">
        {/* Overview */}
        <div className="prose max-w-none">
          <p className="text-lg text-gray-700">
            The PlayerBox component is a versatile, reusable UI element for displaying player information 
            with support for selection states, statistics, actions, and various visual configurations.
          </p>
        </div>

        {/* Quick Reference */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Import</CardTitle>
          </CardHeader>
          <CardContent>
            <CodeBlock 
              code={`import { PlayerBox } from '@/components/ui/player-box';`}
              id="import"
            />
          </CardContent>
        </Card>

        <Tabs defaultValue="variants" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="variants">Variants</TabsTrigger>
            <TabsTrigger value="selection">Selection</TabsTrigger>
            <TabsTrigger value="props">Props</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
          </TabsList>

          {/* Variants Tab */}
          <TabsContent value="variants" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Size Variants</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Small (sm)</h4>
                    <PlayerBox player={samplePlayers[0]} size="sm" />
                    <CodeBlock 
                      code={`<PlayerBox player={player} size="sm" />`}
                      id="size-sm"
                    />
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Medium (md) - Default</h4>
                    <PlayerBox player={samplePlayers[0]} size="md" />
                    <CodeBlock 
                      code={`<PlayerBox player={player} size="md" />`}
                      id="size-md"
                    />
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Large (lg)</h4>
                    <PlayerBox player={samplePlayers[0]} size="lg" />
                    <CodeBlock 
                      code={`<PlayerBox player={player} size="lg" />`}
                      id="size-lg"
                    />
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Extra Large (xl)</h4>
                    <PlayerBox player={samplePlayers[0]} size="xl" />
                    <CodeBlock 
                      code={`<PlayerBox player={player} size="xl" />`}
                      id="size-xl"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configuration Variants</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">With Statistics</h4>
                  <PlayerBox player={samplePlayers[0]} stats={sampleStats} />
                  <CodeBlock 
                    code={`const stats = [
  { label: "Goals", value: "12" },
  { label: "Assists", value: "8" }
];

<PlayerBox player={player} stats={stats} />`}
                    id="with-stats"
                  />
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Without Positions</h4>
                  <PlayerBox player={samplePlayers[0]} showPositions={false} />
                  <CodeBlock 
                    code={`<PlayerBox player={player} showPositions={false} />`}
                    id="no-positions"
                  />
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Inactive Player</h4>
                  <PlayerBox player={samplePlayers[2]} />
                  <CodeBlock 
                    code={`// Player with active: false will show "Inactive" badge
<PlayerBox player={inactivePlayer} />`}
                    id="inactive"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Grid Layout Examples</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-3">Single Column (Full Width)</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <PlayerBox player={samplePlayers[0]} size="md" />
                    <PlayerBox player={samplePlayers[1]} size="md" />
                  </div>
                  <CodeBlock 
                    code={`<div className="grid grid-cols-1 gap-3">
  <PlayerBox player={player1} size="md" />
  <PlayerBox player={player2} size="md" />
</div>`}
                    id="grid-1-col"
                  />
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Two Columns</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <PlayerBox player={samplePlayers[0]} size="md" />
                    <PlayerBox player={samplePlayers[1]} size="md" />
                    <PlayerBox player={samplePlayers[2]} size="md" />
                    <PlayerBox player={samplePlayers[3]} size="md" />
                  </div>
                  <CodeBlock 
                    code={`<div className="grid grid-cols-2 gap-3">
  <PlayerBox player={player1} size="md" />
  <PlayerBox player={player2} size="md" />
  <PlayerBox player={player3} size="md" />
  <PlayerBox player={player4} size="md" />
</div>`}
                    id="grid-2-col"
                  />
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Three Columns</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <PlayerBox player={samplePlayers[0]} size="sm" />
                    <PlayerBox player={samplePlayers[1]} size="sm" />
                    <PlayerBox player={samplePlayers[2]} size="sm" />
                  </div>
                  <CodeBlock 
                    code={`<div className="grid grid-cols-3 gap-3">
  <PlayerBox player={player1} size="sm" />
  <PlayerBox player={player2} size="sm" />
  <PlayerBox player={player3} size="sm" />
</div>`}
                    id="grid-3-col"
                  />
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Responsive Grid (1-2-3 columns)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <PlayerBox player={samplePlayers[0]} size="sm" />
                    <PlayerBox player={samplePlayers[1]} size="sm" />
                    <PlayerBox player={samplePlayers[2]} size="sm" />
                    <PlayerBox player={samplePlayers[3]} size="sm" />
                  </div>
                  <CodeBlock 
                    code={`<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
  <PlayerBox player={player1} size="sm" />
  <PlayerBox player={player2} size="sm" />
  <PlayerBox player={player3} size="sm" />
  <PlayerBox player={player4} size="sm" />
</div>`}
                    id="grid-responsive"
                  />
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Four Columns (Compact View)</h4>
                  <div className="grid grid-cols-4 gap-2">
                    <PlayerBox player={samplePlayers[0]} size="sm" showPositions={false} />
                    <PlayerBox player={samplePlayers[1]} size="sm" showPositions={false} />
                    <PlayerBox player={samplePlayers[2]} size="sm" showPositions={false} />
                    <PlayerBox player={samplePlayers[3]} size="sm" showPositions={false} />
                  </div>
                  <CodeBlock 
                    code={`<div className="grid grid-cols-4 gap-2">
  <PlayerBox player={player1} size="sm" showPositions={false} />
  <PlayerBox player={player2} size="sm showPositions={false} />
  <PlayerBox player={player3} size="sm" showPositions={false} />
  <PlayerBox player={player4} size="sm" showPositions={false} />
</div>`}
                    id="grid-4-col"
                  />
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h5 className="text-sm font-semibold text-blue-900 mb-2">Grid Layout Tips</h5>
                  <ul className="text-xs text-blue-800 space-y-1 list-disc pl-4">
                    <li>Use <code className="bg-blue-100 px-1 rounded">size="sm"</code> for 3+ column layouts</li>
                    <li>Consider hiding positions with <code className="bg-blue-100 px-1 rounded">showPositions={false}</code> in narrow columns</li>
                    <li>Use responsive grids for better mobile experience</li>
                    <li>Adjust gap spacing based on your design needs</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Selection Tab */}
          <TabsContent value="selection" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Selection States</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">Interactive Selection Example</h4>
                  <p className="text-sm text-gray-600 mb-3">Click the players below to see selection states in action:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {samplePlayers.slice(0, 2).map(player => (
                      <PlayerBox
                        key={player.id}
                        player={player}
                        isSelectable={true}
                        isSelected={selectedPlayers.has(player.id)}
                        onSelectionChange={handleSelectionChange}
                        size="md"
                      />
                    ))}
                  </div>
                  <CodeBlock 
                    code={`const [selectedPlayers, setSelectedPlayers] = useState<Set<number>>(new Set());

const handleSelectionChange = (playerId: number, isSelected: boolean) => {
  const newSelected = new Set(selectedPlayers);
  if (isSelected) {
    newSelected.add(playerId);
  } else {
    newSelected.delete(playerId);
  }
  setSelectedPlayers(newSelected);
};

<PlayerBox
  player={player}
  isSelectable={true}
  isSelected={selectedPlayers.has(player.id)}
  onSelectionChange={handleSelectionChange}
/>`}
                    id="interactive-selection"
                  />
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Loading States</h4>
                  <div className="space-y-3">
                    <PlayerBox
                      player={samplePlayers[0]}
                      isSelectable={true}
                      isSelected={false}
                      onSelectionChange={() => {}}
                      isLoading={true}
                    />
                    <PlayerBox
                      player={samplePlayers[1]}
                      isSelectable={true}
                      isSelected={true}
                      onSelectionChange={() => {}}
                      isDisabled={true}
                    />
                  </div>
                  <CodeBlock 
                    code={`// Loading state
<PlayerBox 
  player={player} 
  isSelectable={true}
  isLoading={true} 
/>

// Disabled state
<PlayerBox 
  player={player} 
  isSelectable={true}
  isDisabled={true} 
/>`}
                    id="loading-states"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Props Tab */}
          <TabsContent value="props" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Props Reference</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-medium">Prop</th>
                        <th className="text-left p-2 font-medium">Type</th>
                        <th className="text-left p-2 font-medium">Default</th>
                        <th className="text-left p-2 font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      <tr className="border-b">
                        <td className="p-2 font-mono">player</td>
                        <td className="p-2">Player</td>
                        <td className="p-2">-</td>
                        <td className="p-2">Player object with id, displayName, positions, etc.</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-mono">size</td>
                        <td className="p-2">'sm' | 'md' | 'lg' | 'xl'</td>
                        <td className="p-2">'md'</td>
                        <td className="p-2">Size variant for the component</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-mono">showPositions</td>
                        <td className="p-2">boolean</td>
                        <td className="p-2">true</td>
                        <td className="p-2">Whether to display position preferences</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-mono">stats</td>
                        <td className="p-2">Array&lt;&#123;label: string, value: string&#125;&gt;</td>
                        <td className="p-2">undefined</td>
                        <td className="p-2">Optional statistics to display</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-mono">isSelectable</td>
                        <td className="p-2">boolean</td>
                        <td className="p-2">false</td>
                        <td className="p-2">Whether the player can be selected</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-mono">isSelected</td>
                        <td className="p-2">boolean</td>
                        <td className="p-2">false</td>
                        <td className="p-2">Current selection state</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-mono">onSelectionChange</td>
                        <td className="p-2">(id: number, selected: boolean) =&gt; void</td>
                        <td className="p-2">undefined</td>
                        <td className="p-2">Callback when selection changes</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-mono">isLoading</td>
                        <td className="p-2">boolean</td>
                        <td className="p-2">false</td>
                        <td className="p-2">Shows loading state</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-mono">isDisabled</td>
                        <td className="p-2">boolean</td>
                        <td className="p-2">false</td>
                        <td className="p-2">Shows disabled state</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-mono">onClick</td>
                        <td className="p-2">(playerId: number) =&gt; void</td>
                        <td className="p-2">undefined</td>
                        <td className="p-2">Callback for player click events</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-mono">actions</td>
                        <td className="p-2">React.ReactNode</td>
                        <td className="p-2">undefined</td>
                        <td className="p-2">Action buttons displayed below the player</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-mono">customBadge</td>
                        <td className="p-2">React.ReactNode</td>
                        <td className="p-2">undefined</td>
                        <td className="p-2">Custom badge to display instead of inactive badge</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-mono">className</td>
                        <td className="p-2">string</td>
                        <td className="p-2">""</td>
                        <td className="p-2">Additional CSS classes</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-mono">style</td>
                        <td className="p-2">React.CSSProperties</td>
                        <td className="p-2">{}</td>
                        <td className="p-2">Additional inline styles</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Examples Tab */}
          <TabsContent value="examples" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Common Usage Examples</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">Basic Player Display</h4>
                  <PlayerBox player={samplePlayers[0]} />
                  <CodeBlock 
                    code={`<PlayerBox player={player} />`}
                    id="basic-example"
                  />
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Player with Custom Badge</h4>
                  <PlayerBox 
                    player={samplePlayers[0]} 
                    customBadge={<Badge variant="outline" className="text-xs">Captain</Badge>}
                  />
                  <CodeBlock 
                    code={`<PlayerBox 
  player={player} 
  customBadge={<Badge variant="outline">Captain</Badge>}
/>`}
                    id="custom-badge-example"
                  />
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Player with Actions</h4>
                  <PlayerBox 
                    player={samplePlayers[0]} 
                    actions={
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm" variant="outline">Stats</Button>
                      </div>
                    }
                  />
                  <CodeBlock 
                    code={`<PlayerBox 
  player={player} 
  actions={
    <div className="flex gap-2">
      <Button size="sm" variant="outline">Edit</Button>
      <Button size="sm" variant="outline">Stats</Button>
    </div>
  }
/>`}
                    id="actions-example"
                  />
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Availability Management Example</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {samplePlayers.slice(0, 2).map(player => (
                      <PlayerBox
                        key={`availability-${player.id}`}
                        player={player}
                        isSelectable={true}
                        isSelected={selectedPlayers.has(player.id)}
                        onSelectionChange={handleSelectionChange}
                        size="sm"
                        showPositions={false}
                      />
                    ))}
                  </div>
                  <CodeBlock 
                    code={`// Typical availability selection setup
{players.map(player => (
  <PlayerBox
    key={player.id}
    player={player}
    isSelectable={true}
    isSelected={selectedPlayers.has(player.id)}
    onSelectionChange={handleSelectionChange}
    size="sm"
    showPositions={false}
  />
))}`}
                    id="availability-example"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Implementation Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Player Object Structure</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    The player prop should follow this interface:
                  </p>
                  <CodeBlock 
                    code={`interface Player {
  id: number;
  displayName: string;
  firstName?: string;
  lastName?: string;
  positionPreferences?: string[];
  avatarColor?: string;
  active?: boolean;
}`}
                    id="player-interface"
                  />
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Color System</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    PlayerBox uses the player's avatarColor for consistent theming. Colors should be Tailwind CSS classes:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { color: "bg-blue-500", name: "Blue" },
                      { color: "bg-green-600", name: "Green" },
                      { color: "bg-purple-500", name: "Purple" },
                      { color: "bg-orange-500", name: "Orange" },
                    ].map(({ color, name }) => (
                      <div key={color} className="flex items-center gap-2 text-xs">
                        <div className={cn("w-4 h-4 rounded-full", color)}></div>
                        <span>{name}: "{color}"</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Best Practices</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc pl-4">
                    <li>Always provide a unique `key` when rendering lists of PlayerBox components</li>
                    <li>Use `size="sm"` for compact layouts and availability selection</li>
                    <li>Include statistics only when relevant to the current context</li>
                    <li>Implement proper error handling for missing player data</li>
                    <li>Use consistent selection state management across your application</li>
                    <li>Consider loading and disabled states for better UX during async operations</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Accessibility</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc pl-4">
                    <li>PlayerBox includes proper ARIA labels for screen readers</li>
                    <li>Selection checkboxes are keyboard accessible</li>
                    <li>Color information is supplemented with text indicators</li>
                    <li>Loading states provide appropriate feedback</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTemplate>
  );
}