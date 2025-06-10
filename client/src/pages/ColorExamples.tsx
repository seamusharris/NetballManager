
import React from 'react';
import { Helmet } from 'react-helmet';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlayerBox } from '@/components/ui/player-box';
import { TeamBox } from '@/components/ui/team-box';
import { BaseWidget } from '@/components/ui/base-widget';
import { 
  Palette, Eye, Copy, CheckCircle, AlertCircle, 
  Info, AlertTriangle, Zap, Star, Heart
} from 'lucide-react';

export default function ColorExamples() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const ColorSwatch = ({ name, hex, description, usage }: { 
    name: string; 
    hex: string; 
    description: string; 
    usage: string;
  }) => (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center gap-3 mb-3">
        <div 
          className="w-12 h-12 rounded-lg shadow-sm border"
          style={{ backgroundColor: hex }}
        />
        <div className="flex-1">
          <div className="font-medium">{name}</div>
          <div className="text-sm text-muted-foreground">{hex}</div>
        </div>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => copyToClipboard(hex)}
        >
          <Copy className="h-3 w-3" />
        </Button>
      </div>
      <div className="space-y-1">
        <p className="text-sm">{description}</p>
        <p className="text-xs text-muted-foreground">{usage}</p>
      </div>
    </div>
  );

  const samplePlayer = {
    id: 1,
    displayName: "Sarah Johnson",
    firstName: "Sarah",
    lastName: "Johnson",
    positionPreferences: ["GA", "GS"],
    avatarColor: "bg-blue-500",
    active: true
  };

  const sampleTeam = {
    id: 116,
    name: "Lightning Bolts",
    division: "A Grade",
    seasonName: "Spring 2025",
    clubName: "Thunder Netball Club",
    isActive: true
  };

  return (
    <PageTemplate 
      title="Color Examples" 
      breadcrumbs={[
        { label: "Component Examples", href: "/component-examples" },
        { label: "Color Examples" }
      ]}
    >
      <div className="space-y-8">
        <div className="prose max-w-none">
          <p className="text-lg text-gray-700">
            Comprehensive color palette examples and theming patterns for consistent visual design throughout the application.
          </p>
        </div>

        {/* Primary Color Palette */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Primary Color Palette</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <ColorSwatch
              name="Primary Blue"
              hex="#3B82F6"
              description="Main brand color for primary actions and highlights"
              usage="Buttons, links, selected states, brand elements"
            />
            
            <ColorSwatch
              name="Success Green"
              hex="#10B981"
              description="Positive actions, wins, successful operations"
              usage="Success messages, win indicators, positive metrics"
            />
            
            <ColorSwatch
              name="Warning Orange"
              hex="#F59E0B"
              description="Attention needed, mixed results, caution"
              usage="Warning messages, draws, attention indicators"
            />
            
            <ColorSwatch
              name="Danger Red"
              hex="#EF4444"
              description="Errors, losses, destructive actions"
              usage="Error messages, loss indicators, delete buttons"
            />
            
            <ColorSwatch
              name="Purple Accent"
              hex="#8B5CF6"
              description="Special highlights, achievements, premium features"
              usage="Awards, special metrics, premium badges"
            />
            
            <ColorSwatch
              name="Neutral Gray"
              hex="#6B7280"
              description="Secondary text, subtle elements, disabled states"
              usage="Supporting text, borders, inactive elements"
            />
          </div>
        </section>

        {/* Semantic Colors */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Semantic Color Usage</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Success Theme
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-green-600 hover:bg-green-700">Won</Badge>
                    <Badge variant="outline" className="border-green-600 text-green-700">Active</Badge>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Completed</Badge>
                  </div>
                  <div className="p-3 bg-green-200/50 rounded-lg">
                    <div className="text-sm text-green-700">Used for wins, positive metrics, successful operations</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Error Theme
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-red-600 hover:bg-red-700">Lost</Badge>
                    <Badge variant="outline" className="border-red-600 text-red-700">Inactive</Badge>
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Error</Badge>
                  </div>
                  <div className="p-3 bg-red-200/50 rounded-lg">
                    <div className="text-sm text-red-700">Used for losses, errors, destructive actions</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
              <CardHeader>
                <CardTitle className="text-amber-800 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Warning Theme
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-amber-600 hover:bg-amber-700">Draw</Badge>
                    <Badge variant="outline" className="border-amber-600 text-amber-700">Pending</Badge>
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Warning</Badge>
                  </div>
                  <div className="p-3 bg-amber-200/50 rounded-lg">
                    <div className="text-sm text-amber-700">Used for draws, warnings, attention needed</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-800 flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Information Theme
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-blue-600 hover:bg-blue-700">Selected</Badge>
                    <Badge variant="outline" className="border-blue-600 text-blue-700">Primary</Badge>
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Info</Badge>
                  </div>
                  <div className="p-3 bg-blue-200/50 rounded-lg">
                    <div className="text-sm text-blue-700">Used for information, primary actions, brand elements</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Avatar & Player Colors */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Player Avatar Colors</h2>
          <Card>
            <CardHeader>
              <CardTitle>Available Avatar Colors</CardTitle>
              <p className="text-sm text-muted-foreground">
                Predefined colors for player avatars to ensure good contrast and visual diversity
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { name: "Blue", class: "bg-blue-500", hex: "#3B82F6" },
                  { name: "Green", class: "bg-green-500", hex: "#10B981" },
                  { name: "Purple", class: "bg-purple-500", hex: "#8B5CF6" },
                  { name: "Pink", class: "bg-pink-500", hex: "#EC4899" },
                  { name: "Orange", class: "bg-orange-500", hex: "#F97316" },
                  { name: "Red", class: "bg-red-500", hex: "#EF4444" },
                  { name: "Teal", class: "bg-teal-500", hex: "#14B8A6" },
                  { name: "Yellow", class: "bg-yellow-500", hex: "#EAB308" },
                  { name: "Indigo", class: "bg-indigo-500", hex: "#6366F1" },
                  { name: "Cyan", class: "bg-cyan-500", hex: "#06B6D4" },
                  { name: "Emerald", class: "bg-emerald-500", hex: "#10B981" },
                  { name: "Rose", class: "bg-rose-500", hex: "#F43F5E" }
                ].map(color => (
                  <div key={color.name} className="flex items-center gap-3">
                    <PlayerBox 
                      player={{
                        ...samplePlayer,
                        id: Math.random(),
                        firstName: color.name[0],
                        lastName: color.name.slice(1),
                        displayName: color.name,
                        avatarColor: color.class
                      }}
                      size="sm"
                    />
                    <div className="text-sm">
                      <div className="font-medium">{color.name}</div>
                      <div className="text-muted-foreground">{color.hex}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Button Color Variations */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Button Color Variations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <Card>
              <CardHeader>
                <CardTitle>Action Button Colors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Create
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    <Zap className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Star className="h-4 w-4 mr-2" />
                    Manage
                  </Button>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Consistent action colors for predictable user experience
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Button Variants</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Button>Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="link">Link</Button>
                    <Button disabled>Disabled</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Theme Examples */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Component Theming Examples</h2>
          <div className="space-y-6">
            
            {/* Neutral Theme */}
            <Card>
              <CardHeader>
                <CardTitle>Neutral Theme Components</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <PlayerBox player={samplePlayer} />
                  <TeamBox team={sampleTeam} variant="default" />
                  <BaseWidget title="Neutral Widget" description="Standard theme">
                    <div className="p-4 bg-muted/30 rounded-lg text-center">
                      <div className="text-2xl font-bold">Standard</div>
                      <div className="text-sm text-muted-foreground">Neutral colors</div>
                    </div>
                  </BaseWidget>
                </div>
              </CardContent>
            </Card>

            {/* Success Theme Examples */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800">Success Themed Components</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-green-200/50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-900">Win</div>
                      <div className="text-sm text-green-700">Victory theme</div>
                    </div>
                    <div className="flex gap-2">
                      <Badge className="bg-green-600">Won 25-18</Badge>
                      <Badge variant="outline" className="border-green-600 text-green-700">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-800">Error Themed Components</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-red-200/50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-red-900">Loss</div>
                      <div className="text-sm text-red-700">Defeat theme</div>
                    </div>
                    <div className="flex gap-2">
                      <Badge className="bg-red-600">Lost 18-25</Badge>
                      <Badge variant="outline" className="border-red-600 text-red-700">Inactive</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Color Accessibility */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Color Accessibility Guidelines</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Contrast Requirements
                  </h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>• WCAG AA: 4.5:1 for normal text</li>
                    <li>• WCAG AA: 3:1 for large text (18px+)</li>
                    <li>• WCAG AAA: 7:1 for normal text</li>
                    <li>• Non-text elements: 3:1 minimum</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Color Blind Considerations
                  </h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>• Don't rely solely on color for meaning</li>
                    <li>• Use icons, text, or patterns as backup</li>
                    <li>• Test with color blindness simulators</li>
                    <li>• Avoid problematic red-green combinations</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Best Practices
                  </h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>• Maintain consistent color meanings</li>
                    <li>• Use semantic color names in code</li>
                    <li>• Test in different lighting conditions</li>
                    <li>• Provide high contrast mode option</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Implementation
                  </h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>• Use CSS custom properties for themes</li>
                    <li>• Support system dark/light preferences</li>
                    <li>• Implement focus indicators</li>
                    <li>• Test with accessibility tools</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </PageTemplate>
  );
}
