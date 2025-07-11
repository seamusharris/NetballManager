import React from 'react';
import { Helmet } from 'react-helmet';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlayerBox } from '@/components/ui/player-box';
import { TeamBox } from '@/components/ui/team-box';
import { BaseWidget } from '@/components/ui/base-widget';
import { 
  Palette, Eye, Copy, CheckCircle, AlertCircle, 
  Info, AlertTriangle, Zap, Star, Heart, Target,
  Shield, Users, TrendingUp, Activity, Award,
  MapPin, Clock, Trophy, Play, Pause, Square
} from 'lucide-react';

export default function ColorStyleGuide() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const ColorSwatch = ({ name, hex, description, usage, className }: { 
    name: string; 
    hex: string; 
    description: string; 
    usage: string;
    className?: string;
  }) => (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center gap-3 mb-3">
        <div 
          className={`w-12 h-12 rounded-lg shadow-sm border ${className || ''}`}
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
    displayName: "Sample Player",
    firstName: "Sample",
    lastName: "Player",
    positionPreferences: ["GA", "GS"],
    avatarColor: "bg-blue-500",
    active: true
  };

  // Option 1: Warm/Cool Contrast
  const positionColorsOption1 = [
    { code: "GS", name: "Goal Shooter", color: "#dc2626", bgClass: "bg-red-600", description: "Deep red - aggressive, goal-focused" },
    { code: "GA", name: "Goal Attack", color: "#ea580c", bgClass: "bg-orange-600", description: "Vibrant orange - dynamic attack" },
    { code: "WA", name: "Wing Attack", color: "#f59e0b", bgClass: "bg-amber-600", description: "Golden amber - warm transition" },
    { code: "C", name: "Centre", color: "#10b981", bgClass: "bg-emerald-600", description: "Emerald green - balanced center" },
    { code: "WD", name: "Wing Defence", color: "#0891b2", bgClass: "bg-cyan-600", description: "Cool cyan - defensive transition" },
    { code: "GD", name: "Goal Defence", color: "#2563eb", bgClass: "bg-blue-600", description: "Strong blue - protective" },
    { code: "GK", name: "Goal Keeper", color: "#4338ca", bgClass: "bg-indigo-600", description: "Deep indigo - ultimate defense" }
  ];

  // Statistics Color Scheme - Updated to match current app statistics
  const statCategories = [
    { name: "Goals For", color: "#16a34a", bgClass: "bg-green-600", icon: <Target className="h-4 w-4" />, description: "Classic green for positive scoring outcomes" },
    { name: "Goals Against", color: "#dc2626", bgClass: "bg-red-600", icon: <Shield className="h-4 w-4" />, description: "Traditional red for goals conceded" },
    { name: "Missed Goals", color: "#ea580c", bgClass: "bg-orange-600", icon: <AlertTriangle className="h-4 w-4" />, description: "Orange for missed scoring opportunities" },
    { name: "Rebounds", color: "#ca8a04", bgClass: "bg-yellow-600", icon: <TrendingUp className="h-4 w-4" />, description: "Yellow for ball recovery actions" },
    { name: "Intercepts", color: "#2563eb", bgClass: "bg-blue-600", icon: <Zap className="h-4 w-4" />, description: "Blue for active defensive plays" },
    { name: "Deflections", color: "#0891b2", bgClass: "bg-cyan-600", icon: <Activity className="h-4 w-4" />, description: "Cyan for ball disruption plays" },
    { name: "Turnovers", color: "#ef4444", bgClass: "bg-red-500", icon: <AlertCircle className="h-4 w-4" />, description: "Red for possession losses" },
    { name: "Gains", color: "#059669", bgClass: "bg-emerald-600", icon: <Award className="h-4 w-4" />, description: "Emerald for possession recoveries" },
    { name: "Receives", color: "#8b5cf6", bgClass: "bg-violet-500", icon: <Users className="h-4 w-4" />, description: "Violet for successful ball handling" },
    { name: "Penalties", color: "#7c3aed", bgClass: "bg-violet-600", icon: <AlertTriangle className="h-4 w-4" />, description: "Purple for rule infractions" }
  ];

  // Game Status Color Schemes - Multiple Options
  const gameStatusesOption1 = [
    { name: "Upcoming", color: "#3b82f6", bgClass: "bg-blue-500", description: "Game scheduled but not started" },
    { name: "In Progress", color: "#f59e0b", bgClass: "bg-amber-500", description: "Game currently being played" },
    { name: "Completed", color: "#10b981", bgClass: "bg-emerald-500", description: "Game finished successfully" },
    { name: "Cancelled", color: "#6b7280", bgClass: "bg-gray-500", description: "Game cancelled or postponed" },
    { name: "Forfeit", color: "#ef4444", bgClass: "bg-red-500", description: "Game ended by forfeit" }
  ];

  // Option 2: Traffic Light System
  const gameStatusesOption2 = [
    { name: "Upcoming", color: "#6b7280", bgClass: "bg-gray-500", description: "Neutral gray for waiting state" },
    { name: "In Progress", color: "#f59e0b", bgClass: "bg-amber-500", description: "Amber for caution/active" },
    { name: "Completed", color: "#22c55e", bgClass: "bg-green-500", description: "Green for go/complete" },
    { name: "Cancelled", color: "#ef4444", bgClass: "bg-red-500", description: "Red for stop/cancel" },
    { name: "Forfeit", color: "#dc2626", bgClass: "bg-red-600", description: "Darker red for serious issues" }
  ];

  // Option 3: Cool Spectrum
  const gameStatusesOption3 = [
    { name: "Upcoming", color: "#8b5cf6", bgClass: "bg-violet-500", description: "Violet for future events" },
    { name: "In Progress", color: "#06b6d4", bgClass: "bg-cyan-500", description: "Cyan for active flow" },
    { name: "Completed", color: "#10b981", bgClass: "bg-emerald-500", description: "Emerald for completion" },
    { name: "Cancelled", color: "#64748b", bgClass: "bg-slate-500", description: "Slate for neutral cancellation" },
    { name: "Forfeit", color: "#475569", bgClass: "bg-slate-600", description: "Darker slate for forfeits" }
  ];

  // Option 4: Seasonal Palette
  const gameStatusesOption4 = [
    { name: "Upcoming", color: "#c084fc", bgClass: "bg-purple-400", description: "Soft purple for anticipation" },
    { name: "In Progress", color: "#fb7185", bgClass: "bg-rose-400", description: "Rose for energy and action" },
    { name: "Completed", color: "#4ade80", bgClass: "bg-green-400", description: "Fresh green for achievement" },
    { name: "Cancelled", color: "#94a3b8", bgClass: "bg-slate-400", description: "Muted slate for cancellation" },
    { name: "Forfeit", color: "#f87171", bgClass: "bg-red-400", description: "Soft red for forfeits" }
  ];

  const actionColors = [
    { name: "Create/Add", color: "#16a34a", bgClass: "bg-green-600", description: "Adding new items, creating records" },
    { name: "Edit/Update", color: "#3b82f6", bgClass: "bg-blue-600", description: "Modifying existing records" },
    { name: "Delete/Remove", color: "#dc2626", bgClass: "bg-red-600", description: "Removing items, destructive actions" },
    { name: "View/Details", color: "#6b7280", bgClass: "bg-gray-600", description: "Viewing information, navigation" },
    { name: "Manage/Settings", color: "#ea580c", bgClass: "bg-orange-600", description: "Administrative functions" },
    { name: "Export/Share", color: "#7c3aed", bgClass: "bg-violet-600", description: "Data export, sharing features" }
  ];

  const PositionColorScheme = ({ title, positions, description }: {
    title: string;
    positions: typeof positionColorsOption1;
    description: string;
  }) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {positions.map(position => (
            <div key={position.code} className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className={`w-12 h-12 rounded-lg shadow-sm border flex items-center justify-center font-bold`}
                  style={{ backgroundColor: position.color, color: '#ffffff !important' }}
                >
                  {position.code}
                </div>
                <div>
                  <div className="font-medium">{position.name}</div>
                  <div className="text-sm text-muted-foreground">{position.color}</div>
                </div>
              </div>
              <p className="text-sm mb-3">{position.description}</p>
              <div className="flex gap-2">
                <Badge className={`${position.bgClass} hover:${position.bgClass}/90`}>
                  {position.code}
                </Badge>
                <Badge variant="outline" style={{ borderColor: position.color, color: position.color }}>
                  {position.name}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2 p-4 bg-muted/20 rounded-lg">
          <div className="text-xs font-semibold text-center mb-2 col-span-7">Color Flow Visualization</div>
          {positions.map(position => (
            <div key={position.code} className="text-center">
              <div 
                className="w-8 h-8 rounded-full mx-auto mb-1"
                style={{ backgroundColor: position.color }}
              />
              <div className="text-xs font-medium">{position.code}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const StatsColorScheme = ({ title, stats, description }: {
    title: string;
    stats: typeof statCategoriesOption1;
    description: string;
  }) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {stats.map(stat => (
            <div key={stat.name} className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className={`w-12 h-12 rounded-lg shadow-sm border flex items-center justify-center text-white`}
                  style={{ backgroundColor: stat.color }}
                >
                  {stat.icon}
                </div>
                <div>
                  <div className="font-medium">{stat.name}</div>
                  <div className="text-sm text-muted-foreground">{stat.color}</div>
                </div>
              </div>
              <p className="text-sm mb-3">{stat.description}</p>
              <div className="flex gap-2">
                <Button size="sm" className={`${stat.bgClass} hover:${stat.bgClass}/90`}>
                  {stat.icon}
                  <span className="ml-2">{stat.name}</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-8 gap-2 p-4 bg-muted/20 rounded-lg">
          <div className="text-xs font-semibold text-center mb-2 col-span-8">Color Harmony Visualization</div>
          {stats.map(stat => (
            <div key={stat.name} className="text-center">
              <div 
                className="w-8 h-8 rounded-full mx-auto mb-1"
                style={{ backgroundColor: stat.color }}
              />
              <div className="text-xs font-medium">{stat.name.split(' ')[0]}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const GameStatusColorScheme = ({ title, statuses, description }: {
    title: string;
    statuses: typeof gameStatusesOption1;
    description: string;
  }) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {statuses.map(status => (
            <div key={status.name} className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className={`w-4 h-4 rounded-full`}
                  style={{ backgroundColor: status.color }}
                />
                <div>
                  <div className="font-medium">{status.name}</div>
                  <div className="text-sm text-muted-foreground">{status.color}</div>
                </div>
              </div>
              <p className="text-sm mb-3">{status.description}</p>
              <div className="flex gap-2">
                <Badge className={`${status.bgClass} hover:${status.bgClass}/90 text-white`}>
                  {status.name}
                </Badge>
                <Badge variant="outline" style={{ borderColor: status.color, color: status.color }}>
                  {status.name}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-5 gap-2 p-4 bg-muted/20 rounded-lg">
          <div className="text-xs font-semibold text-center mb-2 col-span-5">Status Flow Visualization</div>
          {statuses.map(status => (
            <div key={status.name} className="text-center">
              <div 
                className="w-8 h-8 rounded-full mx-auto mb-1"
                style={{ backgroundColor: status.color }}
              />
              <div className="text-xs font-medium">{status.name}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <PageTemplate 
      title="Color Style Guide" 
      breadcrumbs={[
        { label: "Component Examples", href: "/component-examples" },
        { label: "Color Style Guide" }
      ]}
    >
      <div className="space-y-8">
        <div className="prose max-w-none">
          <p className="text-lg text-gray-700">
            Comprehensive color standardization guide for the netball application with multiple color scheme options
            based on color theory principles. This ensures consistent visual communication across all features and components.
          </p>
        </div>

        {/* Typography System */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Typography System</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Main Typography Hierarchy */}
            <Card>
              <CardHeader>
                <CardTitle>Typography Hierarchy</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Consistent text styles with semantic meaning and visual hierarchy
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h1 className="text-4xl font-bold text-foreground mb-2">Heading 1 (H1)</h1>
                  <p className="text-sm text-muted-foreground">4xl, bold, primary color - Page titles</p>
                </div>
                
                <div>
                  <h2 className="text-3xl font-semibold text-foreground mb-2">Heading 2 (H2)</h2>
                  <p className="text-sm text-muted-foreground">3xl, semibold - Section headers</p>
                </div>
                
                <div>
                  <h3 className="text-2xl font-semibold text-foreground mb-2">Heading 3 (H3)</h3>
                  <p className="text-sm text-muted-foreground">2xl, semibold - Widget headers</p>
                </div>
                
                <div>
                  <h4 className="text-xl font-medium text-foreground mb-2">Heading 4 (H4)</h4>
                  <p className="text-sm text-muted-foreground">xl, medium - Card titles</p>
                </div>
                
                <div>
                  <h5 className="text-lg font-medium text-foreground mb-2">Heading 5 (H5)</h5>
                  <p className="text-sm text-muted-foreground">lg, medium - Subsection headers</p>
                </div>
                
                <div>
                  <h6 className="text-base font-medium text-foreground mb-2">Heading 6 (H6)</h6>
                  <p className="text-sm text-muted-foreground">base, medium - Label headers</p>
                </div>
              </CardContent>
            </Card>

            {/* Body Text and Special Styles */}
            <Card>
              <CardHeader>
                <CardTitle>Body Text & Special Styles</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Different text weights and styles for various content types
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-lg text-foreground mb-1">Large paragraph text</p>
                  <p className="text-sm text-muted-foreground">lg, normal weight - Introductory text</p>
                </div>
                
                <div>
                  <p className="text-base text-foreground mb-1">Regular paragraph text for main content and descriptions.</p>
                  <p className="text-sm text-muted-foreground">base, normal weight - Body content</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Small supporting text and captions</p>
                  <p className="text-xs text-muted-foreground">sm, normal weight - Metadata, captions</p>
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Extra small text for fine print</p>
                  <p className="text-xs text-muted-foreground">xs, normal weight - Fine print, timestamps</p>
                </div>
                
                <div className="border-t pt-4">
                  <p className="text-base font-bold text-foreground mb-1">Bold emphasis text</p>
                  <p className="text-base font-semibold text-primary mb-1">Semibold primary color text</p>
                  <p className="text-base font-medium text-secondary mb-1">Medium secondary color text</p>
                  <p className="text-base italic text-muted-foreground mb-1">Italic muted text</p>
                  <p className="text-base underline text-foreground mb-1">Underlined text for links</p>
                </div>
              </CardContent>
            </Card>

            {/* Statistical Text Styles */}
            <Card>
              <CardHeader>
                <CardTitle>Statistical & Data Text</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Specialized text styles for displaying numbers and data
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="text-4xl font-bold font-mono text-primary mb-1">89</div>
                  <p className="text-sm text-muted-foreground">4xl, bold, mono - Large statistics</p>
                </div>
                
                <div>
                  <div className="text-3xl font-bold font-mono text-foreground mb-1">24-18</div>
                  <p className="text-sm text-muted-foreground">3xl, bold, mono - Scores</p>
                </div>
                
                <div>
                  <div className="text-2xl font-semibold font-mono text-green-600 mb-1">78%</div>
                  <p className="text-sm text-muted-foreground">2xl, semibold, mono - Performance metrics</p>
                </div>
                
                <div>
                  <div className="text-lg font-medium font-mono text-blue-600 mb-1">15.4</div>
                  <p className="text-sm text-muted-foreground">lg, medium, mono - Small statistics</p>
                </div>
                
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted/20 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">W</div>
                    <div className="text-xs text-muted-foreground">Win</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">L</div>
                    <div className="text-xs text-muted-foreground">Loss</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-600">D</div>
                    <div className="text-xs text-muted-foreground">Draw</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interactive Text States */}
            <Card>
              <CardHeader>
                <CardTitle>Interactive Text States</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Text colors for different interaction states
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-base text-foreground hover:text-primary cursor-pointer mb-1 transition-colors">
                    Hover state text (hover to see)
                  </p>
                  <p className="text-sm text-muted-foreground">Foreground → Primary on hover</p>
                </div>
                
                <div>
                  <p className="text-base text-primary mb-1">Active/Selected text</p>
                  <p className="text-sm text-muted-foreground">Primary color for active states</p>
                </div>
                
                <div>
                  <p className="text-base text-muted-foreground mb-1">Inactive/Disabled text</p>
                  <p className="text-sm text-muted-foreground">Muted foreground for disabled</p>
                </div>
                
                <div>
                  <p className="text-base text-destructive mb-1">Error state text</p>
                  <p className="text-sm text-muted-foreground">Destructive color for errors</p>
                </div>
                
                <div>
                  <p className="text-base text-green-600 mb-1">Success state text</p>
                  <p className="text-sm text-muted-foreground">Green for success messages</p>
                </div>
                
                <div>
                  <p className="text-base text-amber-600 mb-1">Warning state text</p>
                  <p className="text-sm text-muted-foreground">Amber for warning messages</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Primary Brand Colors */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Primary Brand Colors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ColorSwatch
              name="Primary Blue"
              hex="#3b82f6"
              description="Primary brand color for main UI elements"
              usage="Buttons, links, primary actions, brand elements"
            />
            <ColorSwatch
              name="Success Green"
              hex="#22c55e"
              description="Positive outcomes, wins, successful operations"
              usage="Win indicators, success messages, positive metrics"
            />
            <ColorSwatch
              name="Alternative Green"
              hex="#059669"
              description="Alternative green option for comparison"
              usage="Currently used in CSS variables - compare with Success Green"
            />
            <ColorSwatch
              name="Warning Yellow"
              hex="#eab308"
              description="Attention needed, caution, mixed results"
              usage="Warning messages, draws, in-progress states"
            />
            <ColorSwatch
              name="Error Red"
              hex="#EF4444"
              description="Errors, losses, destructive actions"
              usage="Loss indicators, error messages, delete actions"
            />
            <ColorSwatch
              name="Neutral Gray"
              hex="#6B7280"
              description="Secondary information, disabled states"
              usage="Supporting text, inactive elements, borders"
            />
            <ColorSwatch
              name="Purple Accent"
              hex="#8B5CF6"
              description="Special features, premium content"
              usage="Awards, special metrics, highlights"
            />
          </div>
          
          
          
        </section>

        {/* Netball Position Colors */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Netball Position Colors</h2>
          <p className="text-muted-foreground mb-6">
            Standardized position color scheme based on warm (attack) to cool (defense) color temperature progression. 
            Creates strong visual distinction between offensive and defensive roles with intuitive color mapping.
          </p>
          
          <div className="space-y-8">
            <PositionColorScheme
              title="Position Color Scheme"
              positions={positionColorsOption1}
              description="Based on warm (attack) to cool (defense) color temperature progression. Creates strong visual distinction between offensive and defensive roles."
            />
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Color Theory Rationale</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-2 text-orange-600">Warm Colors (Attack)</h4>
                  <p className="text-sm text-muted-foreground">Red, orange, yellow convey energy, aggression, and forward movement - perfect for Goal Shooter, Goal Attack, and Wing Attack positions.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-green-600">Balanced Colors (Mid-court)</h4>
                  <p className="text-sm text-muted-foreground">Green represents balance, growth, and versatility - ideal for the Centre position that connects attack and defense.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-blue-600">Cool Colors (Defense)</h4>
                  <p className="text-sm text-muted-foreground">Blue, indigo, cyan suggest stability, protection, and calm strength - appropriate for Wing Defense, Goal Defense, and Goal Keeper.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Player Avatar Colors */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Player Avatar Colors</h2>
          <Card>
            <CardHeader>
              <CardTitle>Standard Avatar Color Palette</CardTitle>
              <p className="text-sm text-muted-foreground">
                Consistent colors for player identification across the application
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { name: "Blue", hex: "#3B82F6", class: "bg-blue-500" },
                  { name: "Green", hex: "#10B981", class: "bg-green-500" },
                  { name: "Purple", hex: "#8B5CF6", class: "bg-purple-500" },
                  { name: "Pink", hex: "#EC4899", class: "bg-pink-500" },
                  { name: "Orange", hex: "#F97316", class: "bg-orange-500" },
                  { name: "Red", hex: "#EF4444", class: "bg-red-500" },
                  { name: "Teal", hex: "#14B8A6", class: "bg-teal-500" },
                  { name: "Yellow", hex: "#EAB308", class: "bg-yellow-500" },
                  { name: "Indigo", hex: "#6366F1", class: "bg-indigo-500" },
                  { name: "Cyan", hex: "#06B6D4", class: "bg-cyan-500" },
                  { name: "Emerald", hex: "#10B981", class: "bg-emerald-500" },
                  { name: "Rose", hex: "#F43F5E", class: "bg-rose-500" }
                ].map(color => (
                  <div key={color.name} className="flex items-center gap-3">
                    <PlayerBox 
                      player={{
                        ...samplePlayer,
                        id: Math.random(),
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

        {/* Statistics Colors */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Statistics Colors</h2>
          <p className="text-muted-foreground mb-6">
            Standardized statistics color scheme using classic semantic colors. Traditional color associations with 
            green for positive outcomes, red for negative outcomes, and complementary colors for neutral statistics.
          </p>
          
          <div className="space-y-8">
            <StatsColorScheme
              title="Statistics Color Scheme"
              stats={statCategories}
              description="Traditional color associations - green for positive, red for negative, with complementary colors for neutral stats."
            />
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Statistics Color Theory Rationale</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2 text-green-600">Positive Stats (Goals For, Rating)</h4>
                  <p className="text-sm text-muted-foreground">Consistently use green tones across all schemes to reinforce positive associations and success.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-red-600">Negative/Defensive Stats</h4>
                  <p className="text-sm text-muted-foreground">Red and blue families for defensive or concerning statistics, providing clear visual distinction.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-blue-600">Neutral/Action Stats</h4>
                  <p className="text-sm text-muted-foreground">Mid-spectrum colors (blues, purples, cyans) for statistics that are neither inherently positive nor negative.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-amber-600">Warning/Attention Stats</h4>
                  <p className="text-sm text-muted-foreground">Orange and yellow families for statistics that require attention or indicate caution.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Chart Colors */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Chart Color Schemes</h2>
          <p className="text-muted-foreground mb-6">
            Suggested color palettes for data visualization components like performance charts, statistics graphs, 
            and dashboard widgets. Each scheme offers different advantages for various chart types and data contexts.
          </p>
          
          <div className="space-y-8">
            {/* Option 1: Brand-Based Sequential */}
            <Card>
              <CardHeader>
                <CardTitle>Option 1: Brand-Based Sequential</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Uses your primary brand colors with semantic meaning - ideal for charts where data categories have inherent positive/negative associations.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {[
                    { name: "Chart-1 (Primary)", color: "#3b82f6", usage: "Main data series, primary metrics", description: "Brand blue for most important data" },
                    { name: "Chart-2 (Success)", color: "#22c55e", usage: "Positive outcomes, wins, goals", description: "Green for positive performance metrics" },
                    { name: "Chart-3 (Warning)", color: "#eab308", usage: "Neutral metrics, draws, attention", description: "Yellow for metrics needing attention" },
                    { name: "Chart-4 (Error)", color: "#ef4444", usage: "Negative outcomes, losses, errors", description: "Red for negative performance indicators" },
                    { name: "Chart-5 (Accent)", color: "#8b5cf6", usage: "Special categories, highlights", description: "Purple for special or premium data" }
                  ].map(chart => (
                    <div key={chart.name} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div 
                          className="w-12 h-12 rounded-lg shadow-sm border flex items-center justify-center text-white font-bold text-xs"
                          style={{ backgroundColor: chart.color }}
                        >
                          {chart.name.split('(')[0].trim()}
                        </div>
                        <div>
                          <div className="font-medium">{chart.name}</div>
                          <div className="text-sm text-muted-foreground">{chart.color}</div>
                        </div>
                      </div>
                      <p className="text-sm mb-2">{chart.description}</p>
                      <p className="text-xs text-muted-foreground">{chart.usage}</p>
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-5 gap-2 p-4 bg-muted/20 rounded-lg mb-4">
                  <div className="text-xs font-semibold text-center mb-2 col-span-5">Color Progression</div>
                  {["#3b82f6", "#22c55e", "#eab308", "#ef4444", "#8b5cf6"].map((color, index) => (
                    <div key={index} className="text-center">
                      <div 
                        className="w-8 h-8 rounded-full mx-auto mb-1"
                        style={{ backgroundColor: color }}
                      />
                      <div className="text-xs font-medium">C{index + 1}</div>
                    </div>
                  ))}
                </div>

                {/* Example Chart 1: Quarter Performance */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Example 1: Quarter Performance (Brand-Based Colors)</h4>
                  <div className="h-48 bg-gray-50 rounded-lg p-4">
                    <svg className="w-full h-full" viewBox="0 0 500 200">
                      {/* Grid lines */}
                      {[0, 5, 10, 15, 20].map(y => (
                        <line key={y} x1="50" y1={180 - (y * 8)} x2="450" y2={180 - (y * 8)} 
                              stroke="#e5e7eb" strokeWidth="1" />
                      ))}
                      
                      {/* Bars for each quarter */}
                      {[
                        { quarter: 'Q1', teamGoals: 12, oppGoals: 8, teamColor: '#3b82f6', oppColor: '#ef4444' },
                        { quarter: 'Q2', teamGoals: 15, oppGoals: 10, teamColor: '#3b82f6', oppColor: '#ef4444' },
                        { quarter: 'Q3', teamGoals: 11, oppGoals: 12, teamColor: '#3b82f6', oppColor: '#ef4444' },
                        { quarter: 'Q4', teamGoals: 18, oppGoals: 9, teamColor: '#3b82f6', oppColor: '#ef4444' }
                      ].map((q, i) => (
                        <g key={q.quarter}>
                          {/* Team goals bar */}
                          <rect
                            x={80 + (i * 90)}
                            y={180 - (q.teamGoals * 8)}
                            width="35"
                            height={q.teamGoals * 8}
                            fill={q.teamColor}
                            rx="2"
                          />
                          {/* Opponent goals bar */}
                          <rect
                            x={120 + (i * 90)}
                            y={180 - (q.oppGoals * 8)}
                            width="35"
                            height={q.oppGoals * 8}
                            fill={q.oppColor}
                            rx="2"
                          />
                          {/* Quarter label */}
                          <text x={122 + (i * 90)} y="195" fontSize="12" fill="#6b7280" textAnchor="middle">
                            {q.quarter}
                          </text>
                        </g>
                      ))}
                      
                      {/* Legend */}
                      <g>
                        <rect x="50" y="20" width="15" height="15" fill="#3b82f6" rx="2" />
                        <text x="70" y="30" fontSize="12" fill="#374151">Our Team</text>
                        <rect x="150" y="20" width="15" height="15" fill="#ef4444" rx="2" />
                        <text x="170" y="30" fontSize="12" fill="#374151">Opponent</text>
                      </g>
                    </svg>
                  </div>
                </div>

                {/* Example Chart 2: Performance Metrics Dashboard */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Example 2: Performance Metrics Dashboard</h4>
                  <div className="h-48 bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-5 gap-4 h-full">
                      {[
                        { metric: 'Goals Scored', value: 85, color: '#22c55e', status: 'positive' },
                        { metric: 'Accuracy %', value: 78, color: '#3b82f6', status: 'primary' },
                        { metric: 'Attention Areas', value: 3, color: '#eab308', status: 'warning' },
                        { metric: 'Critical Issues', value: 1, color: '#ef4444', status: 'negative' },
                        { metric: 'Special Awards', value: 2, color: '#8b5cf6', status: 'accent' }
                      ].map((item, i) => (
                        <div key={item.metric} className="flex flex-col items-center">
                          <div 
                            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl mb-2"
                            style={{ backgroundColor: item.color }}
                          >
                            {item.value}
                          </div>
                          <div className="text-xs text-center font-medium">{item.metric}</div>
                          <div className="text-xs text-muted-foreground text-center">{item.status}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Example Chart 3: Win/Loss Trend Line */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Example 3: Win/Loss Trend Analysis</h4>
                  <div className="h-48 bg-gray-50 rounded-lg p-4">
                    <svg className="w-full h-full" viewBox="0 0 500 200">
                      {/* Grid lines */}
                      {[0, 25, 50, 75, 100].map(y => (
                        <line key={y} x1="50" y1={180 - (y * 1.3)} x2="450" y2={180 - (y * 1.3)} 
                              stroke="#e5e7eb" strokeWidth="1" />
                      ))}
                      
                      {/* Trend data */}
                      {[
                        { game: 1, winRate: 100, result: 'win' },
                        { game: 2, winRate: 50, result: 'loss' },
                        { game: 3, winRate: 67, result: 'win' },
                        { game: 4, winRate: 75, result: 'win' },
                        { game: 5, winRate: 60, result: 'loss' },
                        { game: 6, winRate: 67, result: 'win' },
                        { game: 7, winRate: 71, result: 'win' }
                      ].map((point, i) => {
                        const x = 80 + (i * 55);
                        const y = 180 - (point.winRate * 1.3);
                        const color = point.result === 'win' ? '#22c55e' : '#ef4444';
                        
                        return (
                          <g key={i}>
                            {/* Win rate line */}
                            {i > 0 && (
                              <line
                                x1={80 + ((i-1) * 55)}
                                y1={180 - ([100, 50, 67, 75, 60, 67, 71][i-1] * 1.3)}
                                x2={x}
                                y2={y}
                                stroke="#3b82f6"
                                strokeWidth="3"
                              />
                            )}
                            
                            {/* Result point */}
                            <circle cx={x} cy={y} r="5" fill={color} stroke="#3b82f6" strokeWidth="2" />
                            
                            {/* Game labels */}
                            <text x={x} y="195" fontSize="10" fill="#6b7280" textAnchor="middle">
                              G{point.game}
                            </text>
                          </g>
                        );
                      })}
                      
                      {/* Legend */}
                      <g>
                        <line x1="60" y1="25" x2="75" y2="25" stroke="#3b82f6" strokeWidth="3" />
                        <text x="80" y="29" fontSize="11" fill="#374151">Win Rate Trend</text>
                        <circle cx="170" cy="25" r="4" fill="#22c55e" />
                        <text x="180" y="29" fontSize="11" fill="#374151">Win</text>
                        <circle cx="210" cy="25" r="4" fill="#ef4444" />
                        <text x="220" y="29" fontSize="11" fill="#374151">Loss</text>
                      </g>
                    </svg>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
                  <strong>Best for:</strong> Performance dashboards, win/loss charts, goal statistics where semantic meaning is important.
                </div>
              </CardContent>
            </Card>

            {/* Option 2: Harmonious Spectrum */}
            <Card>
              <CardHeader>
                <CardTitle>Option 2: Harmonious Blue-Green Spectrum</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Cool, professional palette that works well for all chart types without implying positive/negative associations.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {[
                    { name: "Chart-1 (Deep Blue)", color: "#1e40af", usage: "Primary data series, totals", description: "Deep blue for main data categories" },
                    { name: "Chart-2 (Ocean)", color: "#0891b2", usage: "Secondary metrics, comparisons", description: "Ocean blue for comparative data" },
                    { name: "Chart-3 (Teal)", color: "#0d9488", usage: "Mid-range values, averages", description: "Balanced teal for neutral metrics" },
                    { name: "Chart-4 (Emerald)", color: "#059669", usage: "Growth metrics, trends", description: "Emerald for progression indicators" },
                    { name: "Chart-5 (Forest)", color: "#166534", usage: "Baseline values, minimums", description: "Deep green for foundation data" }
                  ].map(chart => (
                    <div key={chart.name} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div 
                          className="w-12 h-12 rounded-lg shadow-sm border flex items-center justify-center text-white font-bold text-xs"
                          style={{ backgroundColor: chart.color }}
                        >
                          {chart.name.split('(')[0].trim()}
                        </div>
                        <div>
                          <div className="font-medium">{chart.name}</div>
                          <div className="text-sm text-muted-foreground">{chart.color}</div>
                        </div>
                      </div>
                      <p className="text-sm mb-2">{chart.description}</p>
                      <p className="text-xs text-muted-foreground">{chart.usage}</p>
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-5 gap-2 p-4 bg-muted/20 rounded-lg mb-4">
                  <div className="text-xs font-semibold text-center mb-2 col-span-5">Spectrum Flow</div>
                  {["#1e40af", "#0891b2", "#0d9488", "#059669", "#166534"].map((color, index) => (
                    <div key={index} className="text-center">
                      <div 
                        className="w-8 h-8 rounded-full mx-auto mb-1"
                        style={{ backgroundColor: color }}
                      />
                      <div className="text-xs font-medium">C{index + 1}</div>
                    </div>
                  ))}
                </div>

                {/* Example Chart 1: Season Progress Line Chart */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Example 1: Season Win Rate Progress (Harmonious Spectrum)</h4>
                  <div className="h-48 bg-gray-50 rounded-lg p-4">
                    <svg className="w-full h-full" viewBox="0 0 500 200">
                      {/* Grid lines */}
                      {[0, 25, 50, 75, 100].map(y => (
                        <line key={y} x1="50" y1={180 - (y * 1.3)} x2="450" y2={180 - (y * 1.3)} 
                              stroke="#e5e7eb" strokeWidth="1" />
                      ))}
                      
                      {/* Season progress data */}
                      {[
                        { game: 1, winRate: 100, goals: 28, intercepts: 12 },
                        { game: 2, winRate: 50, goals: 32, intercepts: 15 },
                        { game: 3, winRate: 67, goals: 35, intercepts: 8 },
                        { game: 4, winRate: 75, goals: 29, intercepts: 18 },
                        { game: 5, winRate: 80, goals: 38, intercepts: 22 },
                        { game: 6, winRate: 67, goals: 24, intercepts: 16 },
                        { game: 7, winRate: 71, goals: 42, intercepts: 25 }
                      ].map((point, i) => {
                        const x = 80 + (i * 55);
                        const yWin = 180 - (point.winRate * 1.3);
                        const yGoals = 180 - (point.goals * 3);
                        const yIntercepts = 180 - (point.intercepts * 5);
                        
                        return (
                          <g key={i}>
                            {/* Win rate line */}
                            {i > 0 && (
                              <line
                                x1={80 + ((i-1) * 55)}
                                y1={180 - ([100, 50, 67, 75, 80, 67, 71][i-1] * 1.3)}
                                x2={x}
                                y2={yWin}
                                stroke="#1e40af"
                                strokeWidth="3"
                              />
                            )}
                            
                            {/* Goals line */}
                            {i > 0 && (
                              <line
                                x1={80 + ((i-1) * 55)}
                                y1={180 - ([28, 32, 35, 29, 38, 24, 42][i-1] * 3)}
                                x2={x}
                                y2={yGoals}
                                stroke="#0891b2"
                                strokeWidth="2"
                              />
                            )}
                            
                            {/* Intercepts line */}
                            {i > 0 && (
                              <line
                                x1={80 + ((i-1) * 55)}
                                y1={180 - ([12, 15, 8, 18, 22, 16, 25][i-1] * 5)}
                                x2={x}
                                y2={yIntercepts}
                                stroke="#0d9488"
                                strokeWidth="2"
                              />
                            )}
                            
                            {/* Data points */}
                            <circle cx={x} cy={yWin} r="4" fill="#1e40af" />
                            <circle cx={x} cy={yGoals} r="3" fill="#0891b2" />
                            <circle cx={x} cy={yIntercepts} r="3" fill="#0d9488" />
                            
                            {/* Game labels */}
                            <text x={x} y="195" fontSize="10" fill="#6b7280" textAnchor="middle">
                              G{point.game}
                            </text>
                          </g>
                        );
                      })}
                      
                      {/* Legend */}
                      <g>
                        <circle cx="60" cy="25" r="4" fill="#1e40af" />
                        <text x="70" y="29" fontSize="11" fill="#374151">Win Rate %</text>
                        <circle cx="140" cy="25" r="3" fill="#0891b2" />
                        <text x="150" y="29" fontSize="11" fill="#374151">Goals</text>
                        <circle cx="190" cy="25" r="3" fill="#0d9488" />
                        <text x="200" y="29" fontSize="11" fill="#374151">Intercepts</text>
                      </g>
                    </svg>
                  </div>
                </div>

                {/* Example Chart 2: Player Performance Comparison */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Example 2: Player Performance Radar</h4>
                  <div className="h-48 bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-5 gap-2 h-full">
                      {[
                        { player: 'Sarah M', rating: 85, color: '#1e40af', stats: [85, 90, 78, 82, 88] },
                        { player: 'Emma K', rating: 92, color: '#0891b2', stats: [92, 85, 95, 89, 91] },
                        { player: 'Lisa P', rating: 78, color: '#0d9488', stats: [78, 82, 75, 80, 79] },
                        { player: 'Amy R', rating: 88, color: '#059669', stats: [88, 87, 90, 85, 89] },
                        { player: 'Kate B', rating: 81, color: '#166534', stats: [81, 79, 83, 84, 80] }
                      ].map((player, i) => (
                        <div key={player.player} className="flex flex-col items-center">
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm mb-2"
                            style={{ backgroundColor: player.color }}
                          >
                            {player.rating}
                          </div>
                          <div className="text-xs font-medium text-center mb-2">{player.player}</div>
                          <div className="flex flex-col space-y-1">
                            {player.stats.map((stat, j) => (
                              <div key={j} className="flex items-center space-x-1">
                                <div 
                                  className="w-4 h-1 rounded"
                                  style={{ 
                                    backgroundColor: player.color, 
                                    opacity: 0.3 + (stat / 100) * 0.7 
                                  }}
                                />
                                <span className="text-xs">{stat}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Example Chart 3: Team Depth Analysis */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Example 3: Team Depth & Rotation Analysis</h4>
                  <div className="h-48 bg-gray-50 rounded-lg p-4">
                    <svg className="w-full h-full" viewBox="0 0 500 200">
                      {/* Grid lines */}
                      {[0, 20, 40, 60, 80, 100].map(y => (
                        <line key={y} x1="50" y1={180 - (y * 1.3)} x2="450" y2={180 - (y * 1.3)} 
                              stroke="#e5e7eb" strokeWidth="1" />
                      ))}
                      
                      {/* Position depth data */}
                      {[
                        { position: 'GS', starter: 90, backup: 75, depth: 65, x: 80 },
                        { position: 'GA', starter: 88, backup: 80, depth: 70, x: 140 },
                        { position: 'WA', starter: 85, backup: 78, depth: 68, x: 200 },
                        { position: 'C', starter: 92, backup: 85, depth: 75, x: 260 },
                        { position: 'WD', starter: 87, backup: 82, depth: 72, x: 320 },
                        { position: 'GD', starter: 89, backup: 84, depth: 74, x: 380 },
                        { position: 'GK', starter: 91, backup: 86, depth: 76, x: 440 }
                      ].map((pos, i) => (
                        <g key={pos.position}>
                          {/* Starter bar */}
                          <rect
                            x={pos.x - 15}
                            y={180 - (pos.starter * 1.3)}
                            width="12"
                            height={pos.starter * 1.3}
                            fill="#1e40af"
                            rx="2"
                          />
                          {/* Backup bar */}
                          <rect
                            x={pos.x - 2}
                            y={180 - (pos.backup * 1.3)}
                            width="12"
                            height={pos.backup * 1.3}
                            fill="#0891b2"
                            rx="2"
                          />
                          {/* Depth bar */}
                          <rect
                            x={pos.x + 11}
                            y={180 - (pos.depth * 1.3)}
                            width="12"
                            height={pos.depth * 1.3}
                            fill="#0d9488"
                            rx="2"
                          />
                          
                          {/* Position label */}
                          <text x={pos.x} y="195" fontSize="11" fill="#6b7280" textAnchor="middle">
                            {pos.position}
                          </text>
                        </g>
                      ))}
                      
                      {/* Legend */}
                      <g>
                        <rect x="60" y="20" width="12" height="12" fill="#1e40af" rx="2" />
                        <text x="75" y="29" fontSize="11" fill="#374151">Starter</text>
                        <rect x="120" y="20" width="12" height="12" fill="#0891b2" rx="2" />
                        <text x="135" y="29" fontSize="11" fill="#374151">Backup</text>
                        <rect x="180" y="20" width="12" height="12" fill="#0d9488" rx="2" />
                        <text x="195" y="29" fontSize="11" fill="#374151">Depth</text>
                      </g>
                    </svg>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
                  <strong>Best for:</strong> Multi-series line charts, team comparisons, neutral data where no semantic meaning is needed.
                </div>
              </CardContent>
            </Card>

            {/* Option 3: Vibrant Categorical */}
            <Card>
              <CardHeader>
                <CardTitle>Option 3: Vibrant Categorical Palette</CardTitle>
                <p className="text-sm text-muted-foreground">
                  High-contrast colors optimized for distinguishing between multiple data categories in charts with many series.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {[
                    { name: "Chart-1 (Royal)", color: "#4338ca", usage: "Category A, Team 1, Q1 data", description: "Strong purple for primary category" },
                    { name: "Chart-2 (Coral)", color: "#f97316", usage: "Category B, Team 2, Q2 data", description: "Vibrant orange for contrast" },
                    { name: "Chart-3 (Jade)", color: "#10b981", usage: "Category C, Team 3, Q3 data", description: "Fresh green for middle values" },
                    { name: "Chart-4 (Rose)", color: "#e11d48", usage: "Category D, Team 4, Q4 data", description: "Bold pink for attention" },
                    { name: "Chart-5 (Amber)", color: "#d97706", usage: "Category E, additional data", description: "Rich amber for supplementary data" }
                  ].map(chart => (
                    <div key={chart.name} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div 
                          className="w-12 h-12 rounded-lg shadow-sm border flex items-center justify-center text-white font-bold text-xs"
                          style={{ backgroundColor: chart.color }}
                        >
                          {chart.name.split('(')[0].trim()}
                        </div>
                        <div>
                          <div className="font-medium">{chart.name}</div>
                          <div className="text-sm text-muted-foreground">{chart.color}</div>
                        </div>
                      </div>
                      <p className="text-sm mb-2">{chart.description}</p>
                      <p className="text-xs text-muted-foreground">{chart.usage}</p>
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-5 gap-2 p-4 bg-muted/20 rounded-lg mb-4">
                  <div className="text-xs font-semibold text-center mb-2 col-span-5">Maximum Contrast</div>
                  {["#4338ca", "#f97316", "#10b981", "#e11d48", "#d97706"].map((color, index) => (
                    <div key={index} className="text-center">
                      <div 
                        className="w-8 h-8 rounded-full mx-auto mb-1"
                        style={{ backgroundColor: color }}
                      />
                      <div className="text-xs font-medium">C{index + 1}</div>
                    </div>
                  ))}
                </div>

                {/* Example Chart 1: Position Performance Matrix */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Example 1: Position Performance Matrix (Vibrant Categorical)</h4>
                  <div className="h-48 bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2">
                      {['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'].map((position, posIndex) => (
                        <div key={position} className="flex items-center space-x-2">
                          <span className="w-8 text-sm font-medium">{position}</span>
                          <div className="flex space-x-1">
                            {['Goals', 'Assists', 'Defense', 'Accuracy', 'Movement'].map((metric, metricIndex) => {
                              const intensity = Math.random() * 100;
                              const colors = ['#4338ca', '#f97316', '#10b981', '#e11d48', '#d97706'];
                              return (
                                <div 
                                  key={metric} 
                                  className="w-8 h-6 rounded text-xs text-white flex items-center justify-center font-bold"
                                  style={{ backgroundColor: colors[metricIndex] }}
                                >
                                  {Math.round(intensity)}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                      <div className="flex items-center space-x-2 mt-4">
                        <span className="w-8"></span>
                        {['Goals', 'Assists', 'Defense', 'Accuracy', 'Movement'].map((metric, i) => (
                          <span key={metric} className="w-8 text-xs text-center" style={{ color: ['#4338ca', '#f97316', '#10b981', '#e11d48', '#d97706'][i] }}>
                            {metric.slice(0,4)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Example Chart 2: Multi-Team Tournament Bracket */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Example 2: Multi-Team Tournament Bracket</h4>
                  <div className="h-48 bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-3 gap-4 h-full">
                      <div className="space-y-3">
                        <div className="text-xs font-semibold text-center">Quarter Finals</div>
                        {[
                          { team1: 'Eagles', team2: 'Hawks', winner: 'Eagles', color1: '#4338ca', color2: '#f97316' },
                          { team1: 'Lions', team2: 'Tigers', winner: 'Tigers', color1: '#10b981', color2: '#e11d48' }
                        ].map((match, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex space-x-1">
                              <div 
                                className={`flex-1 p-2 rounded text-xs text-white text-center font-medium ${match.winner === match.team1 ? 'ring-2 ring-yellow-400' : ''}`}
                                style={{ backgroundColor: match.color1 }}
                              >
                                {match.team1}
                              </div>
                              <div 
                                className={`flex-1 p-2 rounded text-xs text-white text-center font-medium ${match.winner === match.team2 ? 'ring-2 ring-yellow-400' : ''}`}
                                style={{ backgroundColor: match.color2 }}
                              >
                                {match.team2}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="space-y-3">
                        <div className="text-xs font-semibold text-center">Semi Final</div>
                        <div className="space-y-1">
                          <div className="flex space-x-1">
                            <div 
                              className="flex-1 p-2 rounded text-xs text-white text-center font-medium ring-2 ring-yellow-400"
                              style={{ backgroundColor: '#4338ca' }}
                            >
                              Eagles
                            </div>
                            <div 
                              className="flex-1 p-2 rounded text-xs text-white text-center font-medium"
                              style={{ backgroundColor: '#e11d48' }}
                            >
                              Tigers
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="text-xs font-semibold text-center">Champion</div>
                        <div 
                          className="p-3 rounded text-sm text-white text-center font-bold ring-4 ring-yellow-400"
                          style={{ backgroundColor: '#4338ca' }}
                        >
                          🏆 Eagles
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Example Chart 3: Category Performance Donut */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Example 3: Performance Category Breakdown</h4>
                  <div className="h-48 bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-center h-full">
                      <div className="relative">
                        <svg width="160" height="160" viewBox="0 0 160 160">
                          {/* Donut segments */}
                          {[
                            { category: 'Attack', value: 30, color: '#4338ca', startAngle: 0 },
                            { category: 'Defense', value: 25, color: '#f97316', startAngle: 108 },
                            { category: 'Accuracy', value: 20, color: '#10b981', startAngle: 198 },
                            { category: 'Movement', value: 15, color: '#e11d48', startAngle: 270 },
                            { category: 'Leadership', value: 10, color: '#d97706', startAngle: 324 }
                          ].map((segment, i) => {
                            const centerX = 80;
                            const centerY = 80;
                            const radius = 60;
                            const innerRadius = 35;
                            const angle = (segment.value / 100) * 360;
                            const startAngleRad = (segment.startAngle * Math.PI) / 180;
                            const endAngleRad = ((segment.startAngle + angle) * Math.PI) / 180;
                            
                            const x1 = centerX + radius * Math.cos(startAngleRad);
                            const y1 = centerY + radius * Math.sin(startAngleRad);
                            const x2 = centerX + radius * Math.cos(endAngleRad);
                            const y2 = centerY + radius * Math.sin(endAngleRad);
                            const x3 = centerX + innerRadius * Math.cos(endAngleRad);
                            const y3 = centerY + innerRadius * Math.sin(endAngleRad);
                            const x4 = centerX + innerRadius * Math.cos(startAngleRad);
                            const y4 = centerY + innerRadius * Math.sin(startAngleRad);
                            
                            const largeArcFlag = angle > 180 ? 1 : 0;
                            
                            return (
                              <path
                                key={segment.category}
                                d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`}
                                fill={segment.color}
                                stroke="white"
                                strokeWidth="2"
                              />
                            );
                          })}
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-lg font-bold">Team</div>
                            <div className="text-sm text-muted-foreground">Performance</div>
                          </div>
                        </div>
                      </div>
                      <div className="ml-6 space-y-2">
                        {[
                          { category: 'Attack', value: 30, color: '#4338ca' },
                          { category: 'Defense', value: 25, color: '#f97316' },
                          { category: 'Accuracy', value: 20, color: '#10b981' },
                          { category: 'Movement', value: 15, color: '#e11d48' },
                          { category: 'Leadership', value: 10, color: '#d97706' }
                        ].map((item) => (
                          <div key={item.category} className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm">{item.category}</span>
                            <span className="text-sm font-medium">{item.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
                  <strong>Best for:</strong> Multi-team comparisons, quarter-by-quarter analysis, position-based charts with many categories.
                </div>
              </CardContent>
            </Card>

            {/* Option 4: Complementary Split */}
            <Card>
              <CardHeader>
                <CardTitle>Option 4: Complementary Split Palette</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Based on complementary color theory - uses colors opposite each other on the color wheel for maximum contrast and visual impact.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {[
                    { name: "Chart-1 (Blue)", color: "#2563eb", usage: "Primary data, cool metrics", description: "Deep blue for primary data series" },
                    { name: "Chart-2 (Orange)", color: "#ea580c", usage: "Contrasting data, warm metrics", description: "Vibrant orange as blue's complement" },
                    { name: "Chart-3 (Blue-Green)", color: "#0891b2", usage: "Supporting cool data", description: "Blue-green split from primary blue" },
                    { name: "Chart-4 (Red-Orange)", color: "#dc2626", usage: "Supporting warm data", description: "Red-orange split from primary orange" },
                    { name: "Chart-5 (Purple)", color: "#7c3aed", usage: "Neutral bridge data", description: "Purple as neutral bridge color" }
                  ].map(chart => (
                    <div key={chart.name} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div 
                          className="w-12 h-12 rounded-lg shadow-sm border flex items-center justify-center text-white font-bold text-xs"
                          style={{ backgroundColor: chart.color }}
                        >
                          {chart.name.split('(')[0].trim()}
                        </div>
                        <div>
                          <div className="font-medium">{chart.name}</div>
                          <div className="text-sm text-muted-foreground">{chart.color}</div>
                        </div>
                      </div>
                      <p className="text-sm mb-2">{chart.description}</p>
                      <p className="text-xs text-muted-foreground">{chart.usage}</p>
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-5 gap-2 p-4 bg-muted/20 rounded-lg mb-4">
                  <div className="text-xs font-semibold text-center mb-2 col-span-5">Complementary Harmony</div>
                  {["#2563eb", "#ea580c", "#0891b2", "#dc2626", "#7c3aed"].map((color, index) => (
                    <div key={index} className="text-center">
                      <div 
                        className="w-8 h-8 rounded-full mx-auto mb-1"
                        style={{ backgroundColor: color }}
                      />
                      <div className="text-xs font-medium">C{index + 1}</div>
                    </div>
                  ))}
                </div>
                
                {/* Example Chart 1: Team vs Team Comparison */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Example 1: Head-to-Head Comparison (Complementary Split)</h4>
                  <div className="h-48 bg-gray-50 rounded-lg p-4">
                    <svg className="w-full h-full" viewBox="0 0 500 200">
                      {/* Grid lines */}
                      {[0, 10, 20, 30, 40].map(y => (
                        <line key={y} x1="50" y1={180 - (y * 4)} x2="450" y2={180 - (y * 4)} 
                              stroke="#e5e7eb" strokeWidth="1" />
                      ))}
                      
                      {/* Team comparison data */}
                      {[
                        { metric: 'Goals', ourTeam: 35, opponent: 28, color1: '#2563eb', color2: '#ea580c' },
                        { metric: 'Intercepts', ourTeam: 18, opponent: 22, color1: '#0891b2', color2: '#dc2626' },
                        { metric: 'Turnovers', ourTeam: 12, opponent: 15, color1: '#7c3aed', color2: '#7c3aed' }
                      ].map((data, i) => (
                        <g key={data.metric}>
                          {/* Our team bar */}
                          <rect
                            x={80 + (i * 120)}
                            y={180 - (data.ourTeam * 4)}
                            width="40"
                            height={data.ourTeam * 4}
                            fill={data.color1}
                            rx="3"
                          />
                          {/* Opponent bar */}
                          <rect
                            x={130 + (i * 120)}
                            y={180 - (data.opponent * 4)}
                            width="40"
                            height={data.opponent * 4}
                            fill={data.color2}
                            rx="3"
                          />
                          {/* Metric label */}
                          <text x={125 + (i * 120)} y="195" fontSize="12" fill="#6b7280" textAnchor="middle">
                            {data.metric}
                          </text>
                        </g>
                      ))}
                      
                      {/* Legend */}
                      <g>
                        <rect x="50" y="20" width="15" height="15" fill="#2563eb" rx="2" />
                        <text x="70" y="30" fontSize="12" fill="#374151">Our Team</text>
                        <rect x="150" y="20" width="15" height="15" fill="#ea580c" rx="2" />
                        <text x="170" y="30" fontSize="12" fill="#374151">Opponent</text>
                      </g>
                    </svg>
                  </div>
                </div>

                {/* Example Chart 2: Performance Contrast Analysis */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Example 2: Strengths vs Weaknesses Analysis</h4>
                  <div className="h-48 bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-6 h-full">
                      <div className="space-y-3">
                        <div className="text-center font-semibold text-blue-600 mb-4">Team Strengths</div>
                        {[
                          { area: 'Goal Accuracy', score: 95, color: '#2563eb' },
                          { area: 'Court Coverage', score: 88, color: '#0891b2' },
                          { area: 'Team Defense', score: 92, color: '#7c3aed' }
                        ].map((strength, i) => (
                          <div key={strength.area} className="flex items-center space-x-3">
                            <div className="w-20 text-sm font-medium">{strength.area}</div>
                            <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                              <div 
                                className="h-4 rounded-full flex items-center justify-end pr-2"
                                style={{ 
                                  backgroundColor: strength.color, 
                                  width: `${strength.score}%` 
                                }}
                              >
                                <span className="text-xs text-white font-bold">{strength.score}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="space-y-3">
                        <div className="text-center font-semibold text-orange-600 mb-4">Improvement Areas</div>
                        {[
                          { area: 'Turnover Rate', score: 25, color: '#ea580c' },
                          { area: 'Penalty Count', score: 35, color: '#dc2626' },
                          { area: 'Substitution Timing', score: 40, color: '#ea580c' }
                        ].map((weakness, i) => (
                          <div key={weakness.area} className="flex items-center space-x-3">
                            <div className="w-20 text-sm font-medium">{weakness.area}</div>
                            <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                              <div 
                                className="h-4 rounded-full flex items-center justify-end pr-2"
                                style={{ 
                                  backgroundColor: weakness.color, 
                                  width: `${weakness.score}%` 
                                }}
                              >
                                <span className="text-xs text-white font-bold">{weakness.score}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Example Chart 3: Season Momentum Tracker */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Example 3: Season Momentum Visualization</h4>
                  <div className="h-48 bg-gray-50 rounded-lg p-4">
                    <svg className="w-full h-full" viewBox="0 0 500 200">
                      {/* Center line */}
                      <line x1="50" y1="100" x2="450" y2="100" stroke="#6b7280" strokeWidth="2" strokeDasharray="5,5" />
                      
                      {/* Positive momentum area */}
                      <text x="60" y="85" fontSize="12" fill="#2563eb" fontWeight="bold">Positive Momentum</text>
                      <text x="60" y="125" fontSize="12" fill="#ea580c" fontWeight="bold">Negative Momentum</text>
                      
                      {/* Momentum data points */}
                      {[
                        { week: 1, momentum: 20, result: 'win' },
                        { week: 2, momentum: -15, result: 'loss' },
                        { week: 3, momentum: 35, result: 'win' },
                        { week: 4, momentum: 45, result: 'win' },
                        { week: 5, momentum: -25, result: 'loss' },
                        { week: 6, momentum: 10, result: 'win' },
                        { week: 7, momentum: 55, result: 'win' },
                        { week: 8, momentum: 40, result: 'win' }
                      ].map((point, i) => {
                        const x = 80 + (i * 45);
                        const y = 100 - point.momentum;
                        const color = point.momentum > 0 ? '#2563eb' : '#ea580c';
                        const strokeColor = point.momentum > 0 ? '#0891b2' : '#dc2626';
                        
                        return (
                          <g key={point.week}>
                            {/* Momentum line to center */}
                            <line
                              x1={x}
                              y1="100"
                              x2={x}
                              y2={y}
                              stroke={strokeColor}
                              strokeWidth="3"
                            />
                            
                            {/* Momentum point */}
                            <circle
                              cx={x}
                              cy={y}
                              r="6"
                              fill={color}
                              stroke="white"
                              strokeWidth="2"
                            />
                            
                            {/* Week label */}
                            <text x={x} y="195" fontSize="10" fill="#6b7280" textAnchor="middle">
                              W{point.week}
                            </text>
                            
                            {/* Momentum value */}
                            <text 
                              x={x} 
                              y={y + (point.momentum > 0 ? -12 : 18)} 
                              fontSize="10" 
                              fill={color} 
                              textAnchor="middle"
                              fontWeight="bold"
                            >
                              {Math.abs(point.momentum)}
                            </text>
                          </g>
                        );
                      })}
                      
                      {/* Legend */}
                      <g>
                        <circle cx="300" cy="25" r="4" fill="#2563eb" />
                        <text x="310" y="29" fontSize="11" fill="#374151">High Performance</text>
                        <circle cx="300" cy="45" r="4" fill="#ea580c" />
                        <text x="310" y="49" fontSize="11" fill="#374151">Needs Improvement</text>
                      </g>
                    </svg>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
                  <strong>Best for:</strong> High-impact dashboards, competitive analysis, data that needs maximum visual separation.
                </div>
              </CardContent>
            </Card>

            {/* Option 5: Triadic Color Scheme */}
            <Card>
              <CardHeader>
                <CardTitle>Option 5: Triadic Professional Palette</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Triadic color harmony using three colors equally spaced on the color wheel - balanced yet vibrant.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {[
                    { name: "Chart-1 (Red)", color: "#dc2626", usage: "Alert data, errors, critical metrics", description: "Primary red - attention-grabbing" },
                    { name: "Chart-2 (Blue)", color: "#2563eb", usage: "Primary data, stable metrics", description: "Professional blue - trustworthy" },
                    { name: "Chart-3 (Yellow)", color: "#ca8a04", usage: "Warning data, intermediate values", description: "Rich yellow - balanced energy" },
                    { name: "Chart-4 (Red-Violet)", color: "#be185d", usage: "Special categories, premium data", description: "Red-violet for sophistication" },
                    { name: "Chart-5 (Blue-Green)", color: "#059669", usage: "Success data, positive trends", description: "Blue-green for growth indicators" }
                  ].map(chart => (
                    <div key={chart.name} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div 
                          className="w-12 h-12 rounded-lg shadow-sm border flex items-center justify-center text-white font-bold text-xs"
                          style={{ backgroundColor: chart.color }}
                        >
                          {chart.name.split('(')[0].trim()}
                        </div>
                        <div>
                          <div className="font-medium">{chart.name}</div>
                          <div className="text-sm text-muted-foreground">{chart.color}</div>
                        </div>
                      </div>
                      <p className="text-sm mb-2">{chart.description}</p>
                      <p className="text-xs text-muted-foreground">{chart.usage}</p>
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-5 gap-2 p-4 bg-muted/20 rounded-lg mb-4">
                  <div className="text-xs font-semibold text-center mb-2 col-span-5">Triadic Balance</div>
                  {["#dc2626", "#2563eb", "#ca8a04", "#be185d", "#059669"].map((color, index) => (
                    <div key={index} className="text-center">
                      <div 
                        className="w-8 h-8 rounded-full mx-auto mb-1"
                        style={{ backgroundColor: color }}
                      />
                      <div className="text-xs font-medium">C{index + 1}</div>
                    </div>
                  ))}
                </div>
                
                {/* Example Chart 1: Performance Alerts Dashboard */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Example 1: Performance Alert Dashboard (Triadic)</h4>
                  <div className="h-48 bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-3 gap-4 h-full">
                      {[
                        { title: 'Critical Issues', count: 3, color: '#dc2626', items: ['Goal Accuracy', 'Turnovers', 'Penalties'] },
                        { title: 'Stable Metrics', count: 8, color: '#2563eb', items: ['Intercepts', 'Passes', 'Court Coverage'] },
                        { title: 'Watch Areas', count: 2, color: '#ca8a04', items: ['Fatigue Levels', 'Position Rotation'] }
                      ].map((section, i) => (
                        <div key={section.title} className="flex flex-col">
                          <div className="text-center mb-2">
                            <div 
                              className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-xl"
                              style={{ backgroundColor: section.color }}
                            >
                              {section.count}
                            </div>
                            <div className="text-sm font-medium">{section.title}</div>
                          </div>
                          <div className="space-y-1 flex-1">
                            {section.items.map((item, itemIndex) => (
                              <div 
                                key={item} 
                                className="text-xs p-2 rounded text-white text-center"
                                style={{ backgroundColor: section.color, opacity: 0.8 - (itemIndex * 0.2) }}
                              >
                                {item}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Example Chart 2: Strategic Risk Assessment */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Example 2: Strategic Risk Assessment Matrix</h4>
                  <div className="h-48 bg-gray-50 rounded-lg p-4">
                    <div className="relative h-full">
                      <svg className="w-full h-full" viewBox="0 0 400 180">
                        {/* Grid */}
                        <defs>
                          <pattern id="grid" width="40" height="36" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 36" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                          </pattern>
                        </defs>
                        <rect width="400" height="180" fill="url(#grid)" />
                        
                        {/* Axes labels */}
                        <text x="200" y="175" fontSize="12" fill="#6b7280" textAnchor="middle" fontWeight="bold">Impact Level</text>
                        <text x="15" y="90" fontSize="12" fill="#6b7280" textAnchor="middle" transform="rotate(-90 15 90)" fontWeight="bold">Probability</text>
                        
                        {/* Risk points */}
                        {[
                          { risk: 'Injury Risk', impact: 85, probability: 75, color: '#dc2626', size: 8 },
                          { risk: 'Performance Drop', impact: 70, probability: 40, color: '#ca8a04', size: 6 },
                          { risk: 'Team Chemistry', impact: 60, probability: 30, color: '#2563eb', size: 7 },
                          { risk: 'Equipment Issues', impact: 45, probability: 20, color: '#ca8a04', size: 4 },
                          { risk: 'Weather Delays', impact: 30, probability: 60, color: '#2563eb', size: 5 },
                          { risk: 'Travel Problems', impact: 55, probability: 25, color: '#be185d', size: 5 },
                          { risk: 'Referee Decisions', impact: 40, probability: 70, color: '#059669', size: 6 }
                        ].map((risk, i) => {
                          const x = 40 + (risk.impact / 100) * 320;
                          const y = 160 - (risk.probability / 100) * 140;
                          
                          return (
                            <g key={risk.risk}>
                              <circle
                                cx={x}
                                cy={y}
                                r={risk.size}
                                fill={risk.color}
                                stroke="white"
                                strokeWidth="2"
                                opacity="0.8"
                              />
                              <text
                                x={x}
                                y={y - risk.size - 5}
                                fontSize="9"
                                fill={risk.color}
                                textAnchor="middle"
                                fontWeight="bold"
                              >
                                {risk.risk.split(' ')[0]}
                              </text>
                            </g>
                          );
                        })}
                        
                        {/* Risk zones */}
                        <text x="320" y="40" fontSize="11" fill="#dc2626" fontWeight="bold">High Risk</text>
                        <text x="80" y="40" fontSize="11" fill="#ca8a04" fontWeight="bold">Medium Risk</text>
                        <text x="80" y="160" fontSize="11" fill="#2563eb" fontWeight="bold">Low Risk</text>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Example Chart 3: Resource Allocation Sunburst */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Example 3: Team Resource Allocation</h4>
                  <div className="h-48 bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-center h-full">
                      <div className="relative">
                        <svg width="200" height="200" viewBox="0 0 200 200">
                          {/* Inner circle - Primary resources */}
                          {[
                            { category: 'Training', value: 40, color: '#2563eb', startAngle: 0 },
                            { category: 'Strategy', value: 35, color: '#dc2626', startAngle: 144 },
                            { category: 'Recovery', value: 25, color: '#ca8a04', startAngle: 270 }
                          ].map((segment, i) => {
                            const centerX = 100;
                            const centerY = 100;
                            const radius = 50;
                            const angle = (segment.value / 100) * 360;
                            const startAngleRad = (segment.startAngle * Math.PI) / 180;
                            const endAngleRad = ((segment.startAngle + angle) * Math.PI) / 180;
                            
                            const x1 = centerX + radius * Math.cos(startAngleRad);
                            const y1 = centerY + radius * Math.sin(startAngleRad);
                            const x2 = centerX + radius * Math.cos(endAngleRad);
                            const y2 = centerY + radius * Math.sin(endAngleRad);
                            
                            const largeArcFlag = angle > 180 ? 1 : 0;
                            
                            return (
                              <path
                                key={segment.category}
                                d={`M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                                fill={segment.color}
                                stroke="white"
                                strokeWidth="2"
                                opacity="0.9"
                              />
                            );
                          })}
                          
                          {/* Outer ring - Detailed allocation */}
                          {[
                            { category: 'Skills', value: 15, color: '#2563eb', startAngle: 0, parentRadius: 50 },
                            { category: 'Fitness', value: 15, color: '#2563eb', startAngle: 54, parentRadius: 50 },
                            { category: 'Drills', value: 10, color: '#2563eb', startAngle: 108, parentRadius: 50 },
                            { category: 'Analysis', value: 20, color: '#dc2626', startAngle: 144, parentRadius: 50 },
                            { category: 'Planning', value: 15, color: '#dc2626', startAngle: 216, parentRadius: 50 },
                            { category: 'Rest', value: 15, color: '#ca8a04', startAngle: 270, parentRadius: 50 },
                            { category: 'Nutrition', value: 10, color: '#ca8a04', startAngle: 324, parentRadius: 50 }
                          ].map((segment, i) => {
                            const centerX = 100;
                            const centerY = 100;
                            const innerRadius = 55;
                            const outerRadius = 80;
                            const angle = (segment.value / 100) * 360;
                            const startAngleRad = (segment.startAngle * Math.PI) / 180;
                            const endAngleRad = ((segment.startAngle + angle) * Math.PI) / 180;
                            
                            const x1 = centerX + innerRadius * Math.cos(startAngleRad);
                            const y1 = centerY + innerRadius * Math.sin(startAngleRad);
                            const x2 = centerX + outerRadius * Math.cos(startAngleRad);
                            const y2 = centerY + outerRadius * Math.sin(startAngleRad);
                            const x3 = centerX + outerRadius * Math.cos(endAngleRad);
                            const y3 = centerY + outerRadius * Math.sin(endAngleRad);
                            const x4 = centerX + innerRadius * Math.cos(endAngleRad);
                            const y4 = centerY + innerRadius * Math.sin(endAngleRad);
                            
                            const largeArcFlag = angle > 180 ? 1 : 0;
                            
                            return (
                              <path
                                key={segment.category}
                                d={`M ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1} Z`}
                                fill={segment.color}
                                stroke="white"
                                strokeWidth="1"
                                opacity="0.7"
                              />
                            );
                          })}
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-sm font-bold">Team</div>
                            <div className="text-xs text-muted-foreground">Resources</div>
                          </div>
                        </div>
                      </div>
                      <div className="ml-6 space-y-2">
                        {[
                          { category: 'Training', value: '40%', color: '#2563eb' },
                          { category: 'Strategy', value: '35%', color: '#dc2626' },
                          { category: 'Recovery', value: '25%', color: '#ca8a04' }
                        ].map((item) => (
                          <div key={item.category} className="flex items-center space-x-2">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm font-medium">{item.category}</span>
                            <span className="text-sm">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
                  <strong>Best for:</strong> Executive dashboards, financial reports, data requiring both harmony and distinction.
                </div>
              </CardContent>
            </Card>

            {/* Option 6: Monochromatic Professional */}
            <Card>
              <CardHeader>
                <CardTitle>Option 6: Monochromatic Blue Professional</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Single-hue variation using different shades and tints of blue - sophisticated and cohesive.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {[
                    { name: "Chart-1 (Navy)", color: "#1e3a8a", usage: "Primary data, baselines", description: "Deep navy for foundational data" },
                    { name: "Chart-2 (Blue)", color: "#3b82f6", usage: "Main metrics, standard data", description: "Standard blue for primary metrics" },
                    { name: "Chart-3 (Sky)", color: "#0ea5e9", usage: "Supporting data, trends", description: "Sky blue for trending data" },
                    { name: "Chart-4 (Cyan)", color: "#06b6d4", usage: "Comparative data, benchmarks", description: "Cyan for comparative metrics" },
                    { name: "Chart-5 (Slate)", color: "#475569", usage: "Neutral data, backgrounds", description: "Slate for neutral categories" }
                  ].map(chart => (
                    <div key={chart.name} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div 
                          className="w-12 h-12 rounded-lg shadow-sm border flex items-center justify-center text-white font-bold text-xs"
                          style={{ backgroundColor: chart.color }}
                        >
                          {chart.name.split('(')[0].trim()}
                        </div>
                        <div>
                          <div className="font-medium">{chart.name}</div>
                          <div className="text-sm text-muted-foreground">{chart.color}</div>
                        </div>
                      </div>
                      <p className="text-sm mb-2">{chart.description}</p>
                      <p className="text-xs text-muted-foreground">{chart.usage}</p>
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-5 gap-2 p-4 bg-muted/20 rounded-lg mb-4">
                  <div className="text-xs font-semibold text-center mb-2 col-span-5">Monochromatic Flow</div>
                  {["#1e3a8a", "#3b82f6", "#0ea5e9", "#06b6d4", "#475569"].map((color, index) => (
                    <div key={index} className="text-center">
                      <div 
                        className="w-8 h-8 rounded-full mx-auto mb-1"
                        style={{ backgroundColor: color }}
                      />
                      <div className="text-xs font-medium">C{index + 1}</div>
                    </div>
                  ))}
                </div>
                
                {/* Example Chart 1: Progressive Performance Metrics */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Example 1: Progressive Performance Metrics (Monochromatic)</h4>
                  <div className="h-48 bg-gray-50 rounded-lg p-4">
                    <svg className="w-full h-full" viewBox="0 0 500 200">
                      {/* Grid lines */}
                      {[0, 20, 40, 60, 80, 100].map(y => (
                        <line key={y} x1="50" y1={180 - (y * 1.3)} x2="450" y2={180 - (y * 1.3)} 
                              stroke="#e5e7eb" strokeWidth="1" />
                      ))}
                      
                      {/* Stacked area chart */}
                      {[
                        { label: 'Foundation', values: [20, 22, 25, 28, 30, 32, 35], color: '#1e3a8a' },
                        { label: 'Standard', values: [15, 18, 20, 22, 25, 28, 30], color: '#3b82f6' },
                        { label: 'Advanced', values: [10, 12, 15, 18, 20, 22, 25], color: '#0ea5e9' },
                        { label: 'Elite', values: [5, 8, 10, 12, 15, 18, 20], color: '#06b6d4' }
                      ].map((series, seriesIndex) => {
                        let cumulativeValues = new Array(7).fill(0);
                        
                        // Calculate cumulative values for stacking
                        for (let i = 0; i <= seriesIndex; i++) {
                          const prevSeries = [
                            { values: [20, 22, 25, 28, 30, 32, 35] },
                            { values: [15, 18, 20, 22, 25, 28, 30] },
                            { values: [10, 12, 15, 18, 20, 22, 25] },
                            { values: [5, 8, 10, 12, 15, 18, 20] }
                          ][i];
                          
                          for (let j = 0; j < 7; j++) {
                            cumulativeValues[j] += prevSeries.values[j];
                          }
                        }
                        
                        // Create path for area
                        const points = cumulativeValues.map((value, i) => {
                          const x = 80 + (i * 55);
                          const y = 180 - (value * 1.3);
                          return `${x},${y}`;
                        });
                        
                        const prevCumulativeValues = new Array(7).fill(0);
                        if (seriesIndex > 0) {
                          for (let i = 0; i < seriesIndex; i++) {
                            const prevSeries = [
                              { values: [20, 22, 25, 28, 30, 32, 35] },
                              { values: [15, 18, 20, 22, 25, 28, 30] },
                              { values: [10, 12, 15, 18, 20, 22, 25] },
                              { values: [5, 8, 10, 12, 15, 18, 20] }
                            ][i];
                            
                            for (let j = 0; j < 7; j++) {
                              prevCumulativeValues[j] += prevSeries.values[j];
                            }
                          }
                        }
                        
                        const bottomPoints = prevCumulativeValues.map((value, i) => {
                          const x = 80 + (i * 55);
                          const y = 180 - (value * 1.3);
                          return `${x},${y}`;
                        }).reverse();
                        
                        return (
                          <polygon
                            key={series.label}
                            points={points.join(' ') + ' ' + bottomPoints.join(' ')}
                            fill={series.color}
                            fillOpacity="0.7"
                          />
                        );
                      })}
                      
                      {/* X-axis labels */}
                      {['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7'].map((quarter, i) => (
                        <text key={quarter} x={80 + (i * 55)} y="195" fontSize="10" fill="#6b7280" textAnchor="middle">
                          {quarter}
                        </text>
                      ))}
                      
                      {/* Legend */}
                      <g>
                        {[
                          { label: 'Foundation', color: '#1e3a8a' },
                          { label: 'Standard', color: '#3b82f6' },
                          { label: 'Advanced', color: '#0ea5e9' },
                          { label: 'Elite', color: '#06b6d4' }
                        ].map((item, i) => (
                          <g key={item.label}>
                            <rect x={50 + (i * 80)} y="15" width="12" height="12" fill={item.color} rx="2" />
                            <text x={65 + (i * 80)} y="24" fontSize="10" fill="#374151">{item.label}</text>
                          </g>
                        ))}
                      </g>
                    </svg>
                  </div>
                </div>

                {/* Example Chart 2: Corporate Performance Dashboard */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Example 2: Executive Performance Dashboard</h4>
                  <div className="h-48 bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-4 gap-4 h-full">
                      {[
                        { 
                          title: 'Team Efficiency', 
                          value: 87, 
                          trend: '+5%', 
                          color: '#1e3a8a',
                          metrics: ['Process', 'Output', 'Quality'] 
                        },
                        { 
                          title: 'Strategic Goals', 
                          value: 92, 
                          trend: '+8%', 
                          color: '#3b82f6',
                          metrics: ['Objectives', 'Milestones', 'KPIs'] 
                        },
                        { 
                          title: 'Resource Utilization', 
                          value: 78, 
                          trend: '+2%', 
                          color: '#0ea5e9',
                          metrics: ['Personnel', 'Equipment', 'Budget'] 
                        },
                        { 
                          title: 'Innovation Index', 
                          value: 84, 
                          trend: '+12%', 
                          color: '#06b6d4',
                          metrics: ['Ideas', 'Implementation', 'Impact'] 
                        }
                      ].map((kpi, i) => (
                        <div key={kpi.title} className="flex flex-col h-full">
                          <div className="text-center mb-3">
                            <div 
                              className="w-16 h-16 rounded-lg mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg"
                              style={{ backgroundColor: kpi.color }}
                            >
                              {kpi.value}
                            </div>
                            <div className="text-sm font-medium">{kpi.title}</div>
                            <div className="text-xs text-green-600 font-medium">{kpi.trend}</div>
                          </div>
                          <div className="space-y-1 flex-1">
                            {kpi.metrics.map((metric, j) => (
                              <div key={metric} className="flex items-center justify-between">
                                <span className="text-xs">{metric}</span>
                                <div 
                                  className="w-3 h-3 rounded-full"
                                  style={{ 
                                    backgroundColor: kpi.color, 
                                    opacity: 0.4 + (j * 0.3) 
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Example Chart 3: Professional Timeline Visualization */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Example 3: Season Development Timeline</h4>
                  <div className="h-48 bg-gray-50 rounded-lg p-4">
                    <svg className="w-full h-full" viewBox="0 0 500 200">
                      {/* Timeline base */}
                      <line x1="60" y1="100" x2="440" y2="100" stroke="#475569" strokeWidth="3" />
                      
                      {/* Timeline phases */}
                      {[
                        { phase: 'Foundation', start: 60, end: 140, color: '#1e3a8a', milestones: ['Team Formation', 'Basic Skills'] },
                        { phase: 'Development', start: 140, end: 260, color: '#3b82f6', milestones: ['Strategy Training', 'Position Mastery'] },
                        { phase: 'Competitive', start: 260, end: 360, color: '#0ea5e9', milestones: ['Game Readiness', 'Peak Performance'] },
                        { phase: 'Championship', start: 360, end: 440, color: '#06b6d4', milestones: ['Finals Prep', 'Title Run'] }
                      ].map((phase, i) => {
                        const width = phase.end - phase.start;
                        const centerX = phase.start + (width / 2);
                        
                        return (
                          <g key={phase.phase}>
                            {/* Phase bar */}
                            <rect
                              x={phase.start}
                              y="85"
                              width={width}
                              height="30"
                              fill={phase.color}
                              rx="4"
                              opacity="0.8"
                            />
                            
                            {/* Phase label */}
                            <text
                              x={centerX}
                              y="102"
                              fontSize="11"
                              fill="white"
                              textAnchor="middle"
                              fontWeight="bold"
                            >
                              {phase.phase}
                            </text>
                            
                            {/* Milestone indicators */}
                            {phase.milestones.map((milestone, j) => {
                              const milestoneX = phase.start + ((j + 1) * width / (phase.milestones.length + 1));
                              return (
                                <g key={milestone}>
                                  {/* Milestone point */}
                                  <circle
                                    cx={milestoneX}
                                    cy="100"
                                    r="4"
                                    fill="white"
                                    stroke={phase.color}
                                    strokeWidth="3"
                                  />
                                  
                                  {/* Milestone label */}
                                  <text
                                    x={milestoneX}
                                    y={j % 2 === 0 ? "75" : "135"}
                                    fontSize="9"
                                    fill={phase.color}
                                    textAnchor="middle"
                                    fontWeight="medium"
                                  >
                                    {milestone}
                                  </text>
                                  
                                  {/* Connection line */}
                                  <line
                                    x1={milestoneX}
                                    y1="96"
                                    x2={milestoneX}
                                    y2={j % 2 === 0 ? "80" : "125"}
                                    stroke={phase.color}
                                    strokeWidth="1"
                                    strokeDasharray="2,2"
                                  />
                                </g>
                              );
                            })}
                          </g>
                        );
                      })}
                      
                      {/* Timeline markers */}
                      <text x="60" y="175" fontSize="11" fill="#6b7280" textAnchor="middle">Jan</text>
                      <text x="200" y="175" fontSize="11" fill="#6b7280" textAnchor="middle">Apr</text>
                      <text x="310" y="175" fontSize="11" fill="#6b7280" textAnchor="middle">Jul</text>
                      <text x="440" y="175" fontSize="11" fill="#6b7280" textAnchor="middle">Oct</text>
                      
                      {/* Title */}
                      <text x="250" y="25" fontSize="14" fill="#1e3a8a" textAnchor="middle" fontWeight="bold">Season Development Phases</text>
                    </svg>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
                  <strong>Best for:</strong> Corporate presentations, professional reports, data requiring subtle differentiation.
                </div>
              </CardContent>
            </Card>

            {/* Option 7: Analogous Warm */}
            <Card>
              <CardHeader>
                <CardTitle>Option 7: Analogous Warm Spectrum</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Analogous colors (neighbors on color wheel) in warm tones - harmonious and energetic.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {[
                    { name: "Chart-1 (Crimson)", color: "#dc143c", usage: "Critical data, alerts", description: "Deep crimson for urgent metrics" },
                    { name: "Chart-2 (Orange)", color: "#ff6b35", usage: "Warning data, activity", description: "Vibrant orange for active states" },
                    { name: "Chart-3 (Amber)", color: "#f59e0b", usage: "Caution data, transitions", description: "Rich amber for transitional data" },
                    { name: "Chart-4 (Gold)", color: "#d97706", usage: "Premium data, achievements", description: "Golden tone for valuable metrics" },
                    { name: "Chart-5 (Coral)", color: "#ff7f7f", usage: "Soft alerts, notifications", description: "Soft coral for gentle warnings" }
                  ].map(chart => (
                    <div key={chart.name} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div 
                          className="w-12 h-12 rounded-lg shadow-sm border flex items-center justify-center text-white font-bold text-xs"
                          style={{ backgroundColor: chart.color }}
                        >
                          {chart.name.split('(')[0].trim()}
                        </div>
                        <div>
                          <div className="font-medium">{chart.name}</div>
                          <div className="text-sm text-muted-foreground">{chart.color}</div>
                        </div>
                      </div>
                      <p className="text-sm mb-2">{chart.description}</p>
                      <p className="text-xs text-muted-foreground">{chart.usage}</p>
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-5 gap-2 p-4 bg-muted/20 rounded-lg mb-4">
                  <div className="text-xs font-semibold text-center mb-2 col-span-5">Warm Harmony</div>
                  {["#dc143c", "#ff6b35", "#f59e0b", "#d97706", "#ff7f7f"].map((color, index) => (
                    <div key={index} className="text-center">
                      <div 
                        className="w-8 h-8 rounded-full mx-auto mb-1"
                        style={{ backgroundColor: color }}
                      />
                      <div className="text-xs font-medium">C{index + 1}</div>
                    </div>
                  ))}
                </div>
                
                {/* Example Chart 1: Energy and Activity Tracker */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Example 1: Team Energy & Activity Levels (Analogous Warm)</h4>
                  <div className="h-48 bg-gray-50 rounded-lg p-4">
                    <svg className="w-full h-full" viewBox="0 0 500 200">
                      {/* Background gradient */}
                      <defs>
                        <linearGradient id="warmGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#dc143c" stopOpacity="0.1" />
                          <stop offset="25%" stopColor="#ff6b35" stopOpacity="0.1" />
                          <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.1" />
                          <stop offset="75%" stopColor="#d97706" stopOpacity="0.1" />
                          <stop offset="100%" stopColor="#ff7f7f" stopOpacity="0.1" />
                        </linearGradient>
                      </defs>
                      <rect x="50" y="20" width="400" height="160" fill="url(#warmGradient)" />
                      
                      {/* Activity intensity bars */}
                      {[
                        { time: '10m', intensity: 85, alerts: 2, color: '#dc143c' },
                        { time: '20m', intensity: 90, alerts: 1, color: '#ff6b35' },
                        { time: '30m', intensity: 75, alerts: 0, color: '#f59e0b' },
                        { time: '40m', intensity: 95, alerts: 3, color: '#dc143c' },
                        { time: '50m', intensity: 80, alerts: 1, color: '#d97706' },
                        { time: '60m', intensity: 70, alerts: 0, color: '#ff7f7f' }
                      ].map((data, i) => (
                        <g key={data.time}>
                          {/* Intensity bar */}
                          <rect
                            x={80 + (i * 60)}
                            y={180 - (data.intensity * 1.5)}
                            width="35"
                            height={data.intensity * 1.5}
                            fill={data.color}
                            rx="3"
                          />
                          
                          {/* Alert indicators */}
                          {Array.from({ length: data.alerts }).map((_, alertIndex) => (
                            <circle
                              key={alertIndex}
                              cx={97.5 + (i * 60)}
                              cy={25 + (alertIndex * 15)}
                              r="4"
                              fill={data.color}
                            />
                          ))}
                          
                          {/* Time label */}
                          <text x={97.5 + (i * 60)} y="195" fontSize="10" fill="#6b7280" textAnchor="middle">
                            {data.time}
                          </text>
                          
                          {/* Intensity value */}
                          <text 
                            x={97.5 + (i * 60)} 
                            y={175 - (data.intensity * 1.5)} 
                            fontSize="10" 
                            fill="white" 
                            textAnchor="middle"
                            fontWeight="bold"
                          >
                            {data.intensity}%
                          </text>
                        </g>
                      ))}
                      
                      {/* Legend */}
                      <g>
                        <text x="60" y="15" fontSize="11" fill="#374151" fontWeight="bold">Activity Intensity</text>
                        <circle cx="300" cy="15" r="4" fill="#dc143c" />
                        <text x="310" y="18" fontSize="10" fill="#374151">Alert</text>
                      </g>
                    </svg>
                  </div>
                </div>

                {/* Example Chart 2: Motivation and Engagement Heatmap */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Example 2: Player Motivation & Engagement Heatmap</h4>
                  <div className="h-48 bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2">
                      {[
                        { player: 'Sarah M', metrics: [95, 88, 92, 87, 90] },
                        { player: 'Emma K', metrics: [85, 92, 89, 94, 87] },
                        { player: 'Lisa P', metrics: [78, 85, 82, 89, 91] },
                        { player: 'Amy R', metrics: [92, 78, 88, 85, 89] },
                        { player: 'Kate B', metrics: [87, 90, 85, 91, 88] }
                      ].map((player, playerIndex) => (
                        <div key={player.player} className="flex items-center space-x-2">
                          <span className="w-16 text-sm font-medium">{player.player}</span>
                          <div className="flex space-x-1">
                            {['Energy', 'Focus', 'Team Spirit', 'Confidence', 'Drive'].map((metric, metricIndex) => {
                              const value = player.metrics[metricIndex];
                              const colors = ['#dc143c', '#ff6b35', '#f59e0b', '#d97706', '#ff7f7f'];
                              const intensity = value / 100;
                              
                              return (
                                <div 
                                  key={metric} 
                                  className="w-12 h-8 rounded flex items-center justify-center text-white text-xs font-bold relative group"
                                  style={{ 
                                    backgroundColor: colors[metricIndex],
                                    opacity: 0.3 + (intensity * 0.7)
                                  }}
                                >
                                  {value}
                                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {metric}: {value}%
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                      <div className="flex items-center space-x-2 mt-4 pt-2 border-t">
                        <span className="w-16 text-xs font-bold">Metrics:</span>
                        {['Energy', 'Focus', 'Team Spirit', 'Confidence', 'Drive'].map((metric, i) => (
                          <div key={metric} className="w-12 text-xs text-center" style={{ color: ['#dc143c', '#ff6b35', '#f59e0b', '#d97706', '#ff7f7f'][i] }}>
                            {metric}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Example Chart 3: Dynamic Performance Temperature Gauge */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Example 3: Dynamic Performance Temperature</h4>
                  <div className="h-48 bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-center h-full space-x-8">
                      {/* Temperature gauges */}
                      {[
                        { category: 'Attack Intensity', temp: 85, color: '#dc143c', icon: '🔥' },
                        { category: 'Team Chemistry', temp: 78, color: '#ff6b35', icon: '⚡' },
                        { category: 'Mental Focus', temp: 92, color: '#f59e0b', icon: '🎯' },
                        { category: 'Physical Energy', temp: 88, color: '#d97706', icon: '💪' }
                      ].map((gauge, i) => (
                        <div key={gauge.category} className="flex flex-col items-center">
                          {/* Gauge container */}
                          <div className="relative w-20 h-20 mb-3">
                            {/* Background circle */}
                            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
                              <circle
                                cx="40"
                                cy="40"
                                r="30"
                                stroke="#e5e7eb"
                                strokeWidth="8"
                                fill="none"
                              />
                              {/* Temperature arc */}
                              <circle
                                cx="40"
                                cy="40"
                                r="30"
                                stroke={gauge.color}
                                strokeWidth="8"
                                fill="none"
                                strokeDasharray={`${(gauge.temp / 100) * 188.5} 188.5`}
                                strokeLinecap="round"
                                style={{ 
                                  filter: `drop-shadow(0 0 4px ${gauge.color}40)` 
                                }}
                              />
                            </svg>
                            
                            {/* Temperature value */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-center">
                                <div className="text-lg">{gauge.icon}</div>
                                <div className="text-xs font-bold" style={{ color: gauge.color }}>
                                  {gauge.temp}°
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Category label */}
                          <div className="text-xs font-medium text-center max-w-20">
                            {gauge.category}
                          </div>
                          
                          {/* Temperature status */}
                          <div className="text-xs text-center mt-1">
                            <span 
                              className="px-2 py-1 rounded-full text-white font-medium"
                              style={{ backgroundColor: gauge.color }}
                            >
                              {gauge.temp >= 90 ? 'HOT' : gauge.temp >= 70 ? 'WARM' : 'COOL'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
                  <strong>Best for:</strong> Performance dashboards, activity tracking, energetic or motivational interfaces.
                </div>
              </CardContent>
            </Card>

            {/* Color Theory Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Color Theory Summary</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Overview of color relationships and their psychological impacts
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-blue-600">Monochromatic</h4>
                    <p className="text-sm text-muted-foreground mb-2">Single hue with variations in saturation and lightness.</p>
                    <p className="text-xs text-muted-foreground"><strong>Best for:</strong> Professional, cohesive, subtle differentiation</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 text-green-600">Analogous</h4>
                    <p className="text-sm text-muted-foreground mb-2">Colors next to each other on the color wheel.</p>
                    <p className="text-xs text-muted-foreground"><strong>Best for:</strong> Harmonious, natural, easy on the eyes</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 text-orange-600">Complementary</h4>
                    <p className="text-sm text-muted-foreground mb-2">Colors opposite each other on the color wheel.</p>
                    <p className="text-xs text-muted-foreground"><strong>Best for:</strong> High contrast, attention-grabbing, dynamic</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 text-purple-600">Triadic</h4>
                    <p className="text-sm text-muted-foreground mb-2">Three colors equally spaced on the color wheel.</p>
                    <p className="text-xs text-muted-foreground"><strong>Best for:</strong> Balanced vibrancy, diverse data sets</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 text-pink-600">Split-Complementary</h4>
                    <p className="text-sm text-muted-foreground mb-2">Base color plus two colors adjacent to its complement.</p>
                    <p className="text-xs text-muted-foreground"><strong>Best for:</strong> Softer contrast than complementary</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 text-teal-600">Tetradic</h4>
                    <p className="text-sm text-muted-foreground mb-2">Four colors forming a rectangle on the color wheel.</p>
                    <p className="text-xs text-muted-foreground"><strong>Best for:</strong> Rich, complex data visualization</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-muted/20 rounded-lg">
                  <h4 className="font-semibold mb-2">Psychological Color Associations</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-blue-600">Blue:</span> Trust, stability, calm
                    </div>
                    <div>
                      <span className="font-medium text-red-600">Red:</span> Energy, urgency, passion
                    </div>
                    <div>
                      <span className="font-medium text-green-600">Green:</span> Growth, success, nature
                    </div>
                    <div>
                      <span className="font-medium text-yellow-600">Yellow:</span> Attention, optimism, caution
                    </div>
                    <div>
                      <span className="font-medium text-purple-600">Purple:</span> Luxury, creativity, wisdom
                    </div>
                    <div>
                      <span className="font-medium text-orange-600">Orange:</span> Enthusiasm, warmth, energy
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Gray:</span> Neutral, professional, balance
                    </div>
                    <div>
                      <span className="font-medium text-pink-600">Pink:</span> Compassion, nurturing, playful
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chart Usage Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle>Chart Color Usage Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Performance Charts
                    </h4>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>• <strong>Goals scored/conceded:</strong> Chart-1 (primary) and Chart-4 (red/negative)</li>
                      <li>• <strong>Win/loss trends:</strong> Chart-2 (green) for wins, Chart-4 (red) for losses</li>
                      <li>• <strong>Player performance:</strong> Use Chart-1 through Chart-5 for different players</li>
                      <li>• <strong>Quarter analysis:</strong> Sequential Chart-1 to Chart-4 for quarters</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Statistics Visualization
                    </h4>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>• <strong>Position-based stats:</strong> Use Vibrant Categorical (Option 3)</li>
                      <li>• <strong>Time series data:</strong> Use Harmonious Spectrum (Option 2)</li>
                      <li>• <strong>Comparison charts:</strong> Use Brand-Based Sequential (Option 1)</li>
                      <li>• <strong>Multi-dimensional data:</strong> Combine Chart-1, Chart-3, Chart-5</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Team Analysis Charts
                    </h4>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>• <strong>Our team:</strong> Always use Chart-1 (primary brand color)</li>
                      <li>• <strong>Opponent teams:</strong> Use Chart-2, Chart-3, Chart-4 in sequence</li>
                      <li>• <strong>League averages:</strong> Use Chart-5 (accent/neutral)</li>
                      <li>• <strong>Historical data:</strong> Use muted versions (70% opacity)</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Accessibility Considerations
                    </h4>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>• <strong>Color blindness:</strong> Avoid red-green combinations (Chart-2 + Chart-4)</li>
                      <li>• <strong>Contrast ratios:</strong> All chart colors meet WCAG AA standards</li>
                      <li>• <strong>Pattern alternatives:</strong> Use different line styles, markers, or textures</li>
                      <li>• <strong>Legend clarity:</strong> Always include descriptive labels, not just colors</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Game Status Colors - Multiple Options */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Game Status Color Schemes</h2>
          <p className="text-muted-foreground mb-6">
            Four different approaches to game status colors, from traditional traffic light systems to more sophisticated 
            color harmonies that work well together while maintaining clear meaning.
          </p>
          
          <div className="space-y-8">
            <GameStatusColorScheme
              title="Option 1: Standard UI Convention"
              statuses={gameStatusesOption1}
              description="Traditional interface colors - blue for info, amber for warning, green for success, gray for neutral, red for errors."
            />
            
            <GameStatusColorScheme
              title="Option 2: Traffic Light System"
              statuses={gameStatusesOption2}
              description="Clear stop/go metaphor - gray for waiting, amber for proceed with caution, green for go, red for stop."
            />
            
            <GameStatusColorScheme
              title="Option 3: Cool Spectrum Harmony"
              statuses={gameStatusesOption3}
              description="Harmonious cool colors that work well together while maintaining distinct meanings for each status."
            />
            
            <GameStatusColorScheme
              title="Option 4: Soft Seasonal Palette"
              statuses={gameStatusesOption4}
              description="Gentler, more approachable colors with reduced saturation for a friendlier user experience."
            />
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Game Status Color Psychology</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-2 text-blue-600">Information States</h4>
                  <p className="text-sm text-muted-foreground">Blue and purple convey information, planning, and future events. Perfect for upcoming games and preparatory states.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-amber-600">Active/Warning States</h4>
                  <p className="text-sm text-muted-foreground">Amber and orange suggest activity, attention needed, and dynamic states. Ideal for in-progress games and active monitoring.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-green-600">Completion States</h4>
                  <p className="text-sm text-muted-foreground">Green represents completion, success, and positive outcomes. Universal for finished games and achieved goals.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Action Colors */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Action Colors</h2>
          <Card>
            <CardHeader>
              <CardTitle>Consistent Action Button Colors</CardTitle>
              <p className="text-sm text-muted-foreground">
                Standardized colors for different types of user actions
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {actionColors.map(action => (
                  <div key={action.name} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className={`w-12 h-12 rounded-lg shadow-sm border flex items-center justify-center text-white`}
                        style={{ backgroundColor: action.color }}
                      >
                        {action.name === 'Create/Add' && <CheckCircle className="h-5 w-5" />}
                        {action.name === 'Edit/Update' && <Eye className="h-5 w-5" />}
                        {action.name === 'Delete/Remove' && <AlertCircle className="h-5 w-5" />}
                        {action.name === 'View/Details' && <Info className="h-5 w-5" />}
                        {action.name === 'Manage/Settings' && <Zap className="h-5 w-5" />}
                        {action.name === 'Export/Share' && <Star className="h-5 w-5" />}
                      </div>
                      <div>
                        <div className="font-medium">{action.name}</div>
                        <div className="text-sm text-muted-foreground">{action.color}</div>
                      </div>
                    </div>
                    <p className="text-sm mb-3">{action.description}</p>
                    <Button size="sm" className={`${action.bgClass} hover:${action.bgClass}/90 w-full`}>
                      {action.name}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Implementation Guidelines */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Implementation Guidelines</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Accessibility Standards
                  </h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>• WCAG AA: 4.5:1 contrast ratio for normal text</li>
                    <li>• WCAG AA: 3:1 contrast ratio for large text (18px+)</li>
                    <li>• Use semantic color names in code</li>
                    <li>• Don't rely solely on color for meaning</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Best Practices
                  </h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>• Maintain consistent color meanings across features</li>
                    <li>• Use CSS custom properties for theme colors</li>
                    <li>• Test with color blindness simulators</li>
                    <li>• Provide alternative indicators (icons, text)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Color Psychology
                  </h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>• Green: Success, positive outcomes, go-ahead</li>
                    <li>• Red: Danger, errors, stop actions</li>
                    <li>• Blue: Trust, stability, information</li>
                    <li>• Orange/Yellow: Caution, attention, warnings</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Technical Implementation
                  </h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>• Use Tailwind CSS color classes consistently</li>
                    <li>• Define custom CSS properties for brand colors</li>
                    <li>• Support dark/light mode variations</li>
                    <li>• Document color usage in component libraries</li>
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