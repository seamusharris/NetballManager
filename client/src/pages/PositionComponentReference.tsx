import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageTemplate from '@/components/layout/PageTemplate';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function PositionComponentReference() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Position color scheme from the style guide
  const positions = [
    { code: "GS", name: "Goal Shooter", color: "#dc2626" },
    { code: "GA", name: "Goal Attack", color: "#ea580c" },
    { code: "WA", name: "Wing Attack", color: "#f59e0b" },
    { code: "C", name: "Centre", color: "#10b981" },
    { code: "WD", name: "Wing Defence", color: "#0891b2" },
    { code: "GD", name: "Goal Defence", color: "#2563eb" },
    { code: "GK", name: "Goal Keeper", color: "#4338ca" }
  ];

  const PositionBadge = ({ position, size = 'default' }: { position: typeof positions[0], size?: 'sm' | 'default' | 'lg' }) => {
    const sizeClasses = {
      sm: 'w-8 h-8 text-xs',
      default: 'w-12 h-12 text-sm',
      lg: 'w-16 h-16 text-base'
    };

    return (
      <div 
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold text-white border border-white`}
        style={{ 
          backgroundColor: position.color,
          boxShadow: `0 0 0 1px ${position.color}`
        }}
      >
        <span className="text-white font-bold">{position.code}</span>
      </div>
    );
  };

  const codeExamples = {
    basic: `const PositionBadge = ({ position, size = 'default' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    default: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base'
  };

  return (
    <div className="relative">
      <div 
        className={\`\${sizeClasses[size]} rounded-lg flex items-center justify-center font-bold text-white relative overflow-hidden\`}
        style={{ backgroundColor: position.color }}
      >
        <div 
          className="absolute inset-1 rounded-md border-2 border-white/30"
          style={{ borderColor: \`\${position.color}40\` }}
        />
        <span className="relative z-10 text-white font-bold">{position.code}</span>
      </div>
    </div>
  );
};`,

    withTooltip: `const PositionBadgeWithTooltip = ({ position, size = 'default' }) => {
  return (
    <div className="group relative">
      <PositionBadge position={position} size={size} />
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {position.name}
      </div>
    </div>
  );
};`,

    positionData: `const positions = [
  { code: "GS", name: "Goal Shooter", color: "#dc2626" },
  { code: "GA", name: "Goal Attack", color: "#ea580c" },
  { code: "WA", name: "Wing Attack", color: "#f59e0b" },
  { code: "C", name: "Centre", color: "#10b981" },
  { code: "WD", name: "Wing Defence", color: "#0891b2" },
  { code: "GD", name: "Goal Defence", color: "#2563eb" },
  { code: "GK", name: "Goal Keeper", color: "#4338ca" }
];`
  };

  return (
    <PageTemplate 
      title="Position Component Reference" 
      breadcrumbs={[
        { label: "Development", href: "/component-examples" },
        { label: "Reference", href: "/reference" },
        { label: "Position Component" }
      ]}
    >
      <div className="space-y-8">
        {/* Overview */}
        <div className="prose max-w-none">
          <p className="text-lg text-gray-700">
            Position components for displaying netball positions with dual border styling and standardized colors.
            Based on the warm-to-cool color progression from the style guide.
          </p>
        </div>

        {/* Live Examples */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Live Examples</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Size Variants */}
            <Card>
              <CardHeader>
                <CardTitle>Size Variants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <PositionBadge position={positions[0]} size="sm" />
                    <span className="text-sm">Small (32x32px)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <PositionBadge position={positions[0]} size="default" />
                    <span className="text-sm">Default (48x48px)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <PositionBadge position={positions[0]} size="lg" />
                    <span className="text-sm">Large (64x64px)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* All Positions */}
            <Card>
              <CardHeader>
                <CardTitle>All Position Colors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-3">
                  {positions.map(position => (
                    <div key={position.code} className="text-center">
                      <PositionBadge position={position} />
                      <div className="text-xs mt-1 font-medium">{position.code}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* With Labels */}
            <Card>
              <CardHeader>
                <CardTitle>With Full Names</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {positions.slice(0, 4).map(position => (
                    <div key={position.code} className="flex items-center space-x-3">
                      <PositionBadge position={position} size="sm" />
                      <div>
                        <div className="font-medium">{position.name}</div>
                        <div className="text-xs text-muted-foreground">{position.code}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Implementation Guide */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Implementation Guide</h2>

          <div className="space-y-6">

            {/* Basic Component */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Position Component</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Core component with dual border styling and size variants
                </p>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2 z-10"
                    onClick={() => copyToClipboard(codeExamples.basic, 'basic')}
                  >
                    {copiedCode === 'basic' ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{codeExamples.basic}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* Position Data */}
            <Card>
              <CardHeader>
                <CardTitle>Position Color Data</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Standardized position colors following warm-to-cool progression
                </p>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2 z-10"
                    onClick={() => copyToClipboard(codeExamples.positionData, 'data')}
                  >
                    {copiedCode === 'data' ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{codeExamples.positionData}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Version */}
            <Card>
              <CardHeader>
                <CardTitle>Enhanced with Tooltip</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Position component with hover tooltip showing full position name
                </p>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2 z-10"
                    onClick={() => copyToClipboard(codeExamples.withTooltip, 'tooltip')}
                  >
                    {copiedCode === 'tooltip' ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{codeExamples.withTooltip}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Props Specification */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Props Specification</h2>

          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold">Prop</th>
                      <th className="text-left p-3 font-semibold">Type</th>
                      <th className="text-left p-3 font-semibold">Default</th>
                      <th className="text-left p-3 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-3 font-mono text-sm">position</td>
                      <td className="p-3">PositionData</td>
                      <td className="p-3">required</td>
                      <td className="p-3">Position object with code, name, and color</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-mono text-sm">size</td>
                      <td className="p-3">'sm' | 'default' | 'lg'</td>
                      <td className="p-3">'default'</td>
                      <td className="p-3">Size variant of the position badge</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-mono text-sm">className</td>
                      <td className="p-3">string</td>
                      <td className="p-3">''</td>
                      <td className="p-3">Additional CSS classes</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-mono text-sm">onClick</td>
                      <td className="p-3">{'() => void'}</td>
                      <td className="p-3">undefined</td>
                      <td className="p-3">Optional click handler</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Type Definitions */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Type Definitions</h2>

          <Card>
            <CardContent className="pt-6">
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                <code>{`interface PositionData {
  code: string;      // Two-letter position code (GS, GA, etc.)
  name: string;      // Full position name
  color: string;     // Hex color value
}

interface PositionBadgeProps {
  position: PositionData;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  onClick?: () => void;
}`}</code>
              </pre>
            </CardContent>
          </Card>
        </section>

        {/* Usage Guidelines */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Usage Guidelines</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Design Principles</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• <strong>Color Consistency:</strong> Always use the standardized position colors</li>
                  <li>• <strong>Dual Border:</strong> Inner border provides depth and visual appeal</li>
                  <li>• <strong>Accessibility:</strong> High contrast white text on colored backgrounds</li>
                  <li>• <strong>Size Variants:</strong> Choose appropriate size for context</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Best Practices</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Use 'sm' size in compact lists and tables</li>
                  <li>• Use 'default' size for main roster displays</li>
                  <li>• Use 'lg' size for emphasis or hero sections</li>
                  <li>• Consider tooltips for abbreviated position codes</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Color Psychology</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• <strong>Warm colors (Red/Orange):</strong> Attack positions</li>
                  <li>• <strong>Green:</strong> Centre - balanced transition</li>
                  <li>• <strong>Cool colors (Blue/Indigo):</strong> Defensive positions</li>
                  <li>• Creates intuitive visual hierarchy</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Integration Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Player roster displays</li>
                  <li>• Game lineup management</li>
                  <li>• Position rotation planning</li>
                  <li>• Statistics and performance charts</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </PageTemplate>
  );
}