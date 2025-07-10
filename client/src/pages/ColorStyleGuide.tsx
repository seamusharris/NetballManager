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

  // Statistics Color Scheme
  const statCategories = [
    { name: "Goals For", color: "#16a34a", bgClass: "bg-green-600", icon: <Target className="h-4 w-4" />, description: "Classic green for positive outcomes" },
    { name: "Goals Against", color: "#dc2626", bgClass: "bg-red-600", icon: <Shield className="h-4 w-4" />, description: "Traditional red for defensive stats" },
    { name: "Intercepts", color: "#2563eb", bgClass: "bg-blue-600", icon: <Zap className="h-4 w-4" />, description: "Blue for active defensive plays" },
    { name: "Rebounds", color: "#ca8a04", bgClass: "bg-yellow-600", icon: <TrendingUp className="h-4 w-4" />, description: "Yellow for recovery actions" },
    { name: "Turnovers", color: "#ea580c", bgClass: "bg-orange-600", icon: <AlertTriangle className="h-4 w-4" />, description: "Orange for concerning events" },
    { name: "Penalties", color: "#7c3aed", bgClass: "bg-violet-600", icon: <AlertCircle className="h-4 w-4" />, description: "Purple for rule infractions" },
    { name: "Centre Pass", color: "#0891b2", bgClass: "bg-cyan-600", icon: <Play className="h-4 w-4" />, description: "Cyan for neutral possession" },
    { name: "Rating", color: "#059669", bgClass: "bg-emerald-600", icon: <Star className="h-4 w-4" />, description: "Emerald for overall performance" }
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
                  className={`w-12 h-12 rounded-lg shadow-sm border flex items-center justify-center text-white font-bold`}
                  style={{ backgroundColor: position.color }}
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

          {/* Color Inconsistency Audit */}
          <div className="mt-8 p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-4">🔍 Color Inconsistency Audit</h3>
            <p className="text-sm text-muted-foreground mb-6">
              These are the color inconsistencies found across the codebase compared to the Primary Brand Colors above:
            </p>

            {/* STAT_COLORS Inconsistencies */}
            <div className="mb-8">
              <h4 className="font-semibold mb-3">STAT_COLORS (constants.ts) - Major Inconsistencies</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <ColorSwatch
                  name="Goals (Current)"
                  hex="#15803d"
                  description="Using green-700 instead of brand Success Green"
                  usage="Should use #22c55e (Success Green)"
                />
                <ColorSwatch
                  name="Missed Goals (Current)"
                  hex="#c2410c"
                  description="Using orange-700 instead of brand Warning Yellow"
                  usage="Should use #eab308 (Warning Yellow)"
                />
                <ColorSwatch
                  name="Goals Against (Current)"
                  hex="#b91c1c"
                  description="Using red-700 instead of brand Error Red"
                  usage="Should use #EF4444 (Error Red)"
                />
                <ColorSwatch
                  name="Rebounds (Current)"
                  hex="#1e40af"
                  description="Using blue-800 instead of brand Primary Blue"
                  usage="Should use #3b82f6 (Primary Blue)"
                />
                <ColorSwatch
                  name="Intercepts (Current)"
                  hex="#3730a3"
                  description="Using indigo-800 - not in brand palette"
                  usage="Should use #3b82f6 (Primary Blue) or #8B5CF6 (Purple Accent)"
                />
                <ColorSwatch
                  name="Pick Up (Current)"
                  hex="#581c87"
                  description="Using purple-900 - not in brand palette"
                  usage="Should use #8B5CF6 (Purple Accent)"
                />
                <ColorSwatch
                  name="Bad Pass (Current)"
                  hex="#92400e"
                  description="Using amber-800 instead of brand Warning Yellow"
                  usage="Should use #eab308 (Warning Yellow)"
                />
                <ColorSwatch
                  name="Handling Error (Current)"
                  hex="#be185d"
                  description="Using pink-700 - not in brand palette"
                  usage="Should use #EF4444 (Error Red)"
                />
                <ColorSwatch
                  name="Infringement (Current)"
                  hex="#881337"
                  description="Using rose-900 - not in brand palette"
                  usage="Should use #EF4444 (Error Red)"
                />
              </div>
              <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
                <strong>Impact:</strong> All 9 stat colors are inconsistent with brand palette. Creates visual confusion and undermines brand consistency.
              </div>
            </div>



            {/* Chart Colors Inconsistencies */}
            <div className="mb-8">
              <h4 className="font-semibold mb-3">Chart Variables (CSS) - Unknown Values</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="p-4 border rounded-lg">
                  <div className="font-medium">Chart Color Variables</div>
                  <div className="text-sm text-muted-foreground mt-2">
                    <code className="bg-muted px-2 py-1 rounded">--chart-1</code> through <code className="bg-muted px-2 py-1 rounded">--chart-5</code>
                  </div>
                  <div className="text-xs mt-2">Values unknown - need to be aligned with brand colors</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="font-medium">Recommended Chart Colors</div>
                  <div className="text-sm text-muted-foreground mt-2">
                    Chart-1: #3b82f6 (Primary Blue)<br/>
                    Chart-2: #22c55e (Success Green)<br/>
                    Chart-3: #eab308 (Warning Yellow)<br/>
                    Chart-4: #EF4444 (Error Red)<br/>
                    Chart-5: #8B5CF6 (Purple Accent)
                  </div>
                </div>
              </div>
            </div>

            {/* Position Color Options Inconsistencies */}
            <div className="mb-8">
              <h4 className="font-semibold mb-3">Position Color Schemes - Brand Misalignment</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-4 border rounded-lg">
                  <div className="font-medium">Option 1: Warm/Cool</div>
                  <div className="text-sm text-muted-foreground mt-2">
                    Uses brand colors but many positions use non-brand colors like #ca8a04, #0891b2
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="font-medium">Option 2: Analogous</div>
                  <div className="text-sm text-muted-foreground mt-2">
                    Completely separate from brand palette - uses rose/pink/violet spectrum
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="font-medium">Option 3: Triadic</div>
                  <div className="text-sm text-muted-foreground mt-2">
                    Mixes brand colors with non-brand colors like #84cc16, #0891b2
                  </div>
                </div>
              </div>
            </div>

            {/* Action Colors Assessment */}
            <div className="mb-8">
              <h4 className="font-semibold mb-3">Action Colors - Mixed Consistency</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="p-4 border rounded-lg">
                  <div className="font-medium">✅ Consistent with Brand</div>
                  <div className="text-sm text-muted-foreground mt-2">
                    • Create/Add: #16a34a (close to Success Green)<br/>
                    • Edit/Update: #3b82f6 (matches Primary Blue)<br/>
                    • Delete/Remove: #dc2626 (close to Error Red)
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="font-medium">⚠️ Off-Brand Colors</div>
                  <div className="text-sm text-muted-foreground mt-2">
                    • View/Details: #6b7280 (matches Neutral Gray)<br/>
                    • Manage/Settings: #ea580c (not in brand)<br/>
                    • Export/Share: #7c3aed (close to Purple Accent)
                  </div>
                </div>
              </div>
            </div>

            {/* Summary and Recommendations */}
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">🚨 Critical Issues Summary</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>STAT_COLORS:</strong> 9/9 colors inconsistent (100% mismatch)</li>
                <li>• <strong>Position Schemes:</strong> Only Option 1 partially uses brand colors</li>
                <li>• <strong>Chart Variables:</strong> Unknown values, likely inconsistent</li>
                <li>• <strong>Component Usage:</strong> Mixed usage of brand vs non-brand colors</li>
              </ul>
              <div className="mt-3 p-3 bg-background rounded">
                <strong>Recommendation:</strong> Update STAT_COLORS as highest priority, then establish chart color standards and review position schemes.
              </div>
            </div>
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
                  <p className="text-sm text-muted-foreground">Blue, indigo, cyan suggest stability, protection, and calm strength - appropriate for Wing Defence, Goal Defence, and Goal Keeper.</p>
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

                <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
                  <strong>Best for:</strong> Multi-team comparisons, quarter-by-quarter analysis, position-based charts with many categories.
                </div>
              </CardContent>
            </Card>

            {/* Example Charts Using Color Schemes */}
            <Card>
              <CardHeader>
                <CardTitle>Example Charts Using Color Schemes</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Practical examples showing how chart colors work in real netball scenarios
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">

                  {/* Quarter Performance Bar Chart */}
                  <div>
                    <h4 className="font-semibold mb-4">Quarter Performance - Bar Chart (Option 1)</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        {[
                          { quarter: 'Q1', teamScore: 12, opponentScore: 8, rebounds: 6, intercepts: 3 },
                          { quarter: 'Q2', teamScore: 11, opponentScore: 10, rebounds: 4, intercepts: 5 },
                          { quarter: 'Q3', teamScore: 10, opponentScore: 10, rebounds: 7, intercepts: 2 },
                          { quarter: 'Q4', teamScore: 12, opponentScore: 10, rebounds: 5, intercepts: 4 }
                        ].map((data, index) => (
                          <div key={data.quarter} className="space-y-2">
                            <div className="flex justify-between text-sm font-medium">
                              <span>{data.quarter}</span>
                              <span>Goals: {data.teamScore} - {data.opponentScore}</span>
                            </div>
                            <div className="flex gap-1 h-6">
                              <div 
                                className="rounded-l flex items-center justify-center text-white text-xs font-bold"
                                style={{ 
                                  backgroundColor: '#1e40af',
                                  width: `${(data.teamScore / 15) * 200}px` 
                                }}
                              >
                                {data.teamScore}
                              </div>
                              <div 
                                className="flex items-center justify-center text-white text-xs font-bold"
                                style={{ 
                                  backgroundColor: '#0891b2',
                                  width: `${(data.rebounds / 8) * 60}px` 
                                }}
                              >
                                R{data.rebounds}
                              </div>
                              <div 
                                className="flex items-center justify-center text-white text-xs font-bold"
                                style={{ 
                                  backgroundColor: '#0d9488',
                                  width: `${(data.intercepts / 6) * 50}px` 
                                }}
                              >
                                I{data.intercepts}
                              </div>
                              <div 
                                className="rounded-r flex items-center justify-center text-white text-xs font-bold"
                                style={{ 
                                  backgroundColor: '#ef4444',
                                  width: `${(data.opponentScore / 15) * 120}px` 
                                }}
                              >
                                {data.opponentScore}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="flex gap-4 text-xs mt-3">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#1e40af' }}></div>
                            <span>Team Goals</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#0891b2' }}></div>
                            <span>Rebounds</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#0d9488' }}></div>
                            <span>Intercepts</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ef4444' }}></div>
                            <span>Opponent Goals</span>
                          </div>
                        </div>
                      </div>

                      {/* Maximum Contrast Version */}
                      <div className="space-y-3">
                        <h5 className="text-sm font-semibold">Maximum Contrast Version</h5>
                        {[
                          { quarter: 'Q1', teamScore: 12, opponentScore: 8, rebounds: 6, intercepts: 3 },
                          { quarter: 'Q2', teamScore: 11, opponentScore: 10, rebounds: 4, intercepts: 5 },
                          { quarter: 'Q3', teamScore: 10, opponentScore: 10, rebounds: 7, intercepts: 2 },
                          { quarter: 'Q4', teamScore: 12, opponentScore: 10, rebounds: 5, intercepts: 4 }
                        ].map((data, index) => (
                          <div key={data.quarter} className="space-y-2">
                            <div className="flex justify-between text-sm font-medium">
                              <span>{data.quarter}</span>
                              <span>Goals: {data.teamScore} - {data.opponentScore}</span>
                            </div>
                            <div className="flex gap-1 h-6">
                              <div 
                                className="rounded-l flex items-center justify-center text-white text-xs font-bold"
                                style={{ 
                                  backgroundColor: '#4338ca',
                                  width: `${(data.teamScore / 15) * 200}px` 
                                }}
                              >
                                {data.teamScore}
                              </div>
                              <div 
                                className="flex items-center justify-center text-white text-xs font-bold"
                                style={{ 
                                  backgroundColor: '#10b981',
                                  width: `${(data.rebounds / 8) * 60}px` 
                                }}
                              >
                                R{data.rebounds}
                              </div>
                              <div 
                                className="flex items-center justify-center text-white text-xs font-bold"
                                style={{ 
                                  backgroundColor: '#d97706',
                                  width: `${(data.intercepts / 6) * 50}px` 
                                }}
                              >
                                I{data.intercepts}
                              </div>
                              <div 
                                className="rounded-r flex items-center justify-center text-white text-xs font-bold"
                                style={{ 
                                  backgroundColor: '#e11d48',
                                  width: `${(data.opponentScore / 15) * 120}px` 
                                }}
                              >
                                {data.opponentScore}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Player Performance Radar - Multi-Player */}
                  <div>
                    <h4 className="font-semibold mb-4">Player Performance Comparison - Radar Chart</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { name: 'Sarah J', color: '#1e40af', shooting: 85, passing: 90, defense: 70, movement: 88 },
                        { name: 'Emma W', color: '#0891b2', shooting: 75, passing: 95, defense: 80, movement: 85 },
                        { name: 'Kate B', color: '#0d9488', shooting: 40, passing: 70, defense: 95, movement: 75 },
                        { name: 'Lily C', color: '#059669', shooting: 65, passing: 88, defense: 75, movement: 92 }
                      ].map((player, index) => (
                        <div key={index} className="text-center">
                          <h5 className="font-medium mb-2">{player.name}</h5>
                          <div className="relative w-24 h-24 mx-auto">
                            <svg className="w-full h-full" viewBox="0 0 100 100">
                              {/* Background grid */}
                              <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="1" />
                              <circle cx="50" cy="50" r="30" fill="none" stroke="#e5e7eb" strokeWidth="1" />
                              <circle cx="50" cy="50" r="20" fill="none" stroke="#e5e7eb" strokeWidth="1" />
                              <circle cx="50" cy="50" r="10" fill="none" stroke="#e5e7eb" strokeWidth="1" />

                              {/* Axes */}
                              <line x1="50" y1="10" x2="50" y2="90" stroke="#e5e7eb" strokeWidth="1" />
                              <line x1="10" y1="50" x2="90" y2="50" stroke="#e5e7eb" strokeWidth="1" />

                              {/* Data polygon */}
                              <polygon
                                points={`50,${50 - (player.shooting * 0.4)} ${50 + (player.passing * 0.4)},50 50,${50 + (player.defense * 0.4)} ${50 - (player.movement * 0.4)},50`}
                                fill={`${player.color}40`}
                                stroke={player.color}
                                strokeWidth="2"
                              />
                            </svg>
                          </div>
                          <div className="grid grid-cols-2 gap-1 text-xs mt-2">
                            <div>Shoot: {player.shooting}</div>
                            <div>Pass: {player.passing}</div>
                            <div>Def: {player.defense}</div>
                            <div>Move: {player.movement}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Win/Loss Trend Line Chart */}
                  <div>
                    <h4 className="font-semibold mb-4">Season Win Rate Trend - Line Chart</h4>
                    <div className="h-48 relative bg-gray-50 rounded-lg p-4">
                      <svg className="w-full h-full" viewBox="0 0 400 160">
                        {/* Grid lines */}
                        {[0, 25, 50, 75, 100].map(y => (
                          <line key={y} x1="40" y1={120 - (y * 0.8)} x2="360" y2={120 - (y * 0.8)} 
                                stroke="#e5e7eb" strokeWidth="1" />
                        ))}

                        {/* Win rate line */}
                        <polyline
                          fill="none"
                          stroke="#059669"
                          strokeWidth="3"
                          points="60,100 100,85 140,75 180,70 220,65 260,60 300,62 340,58"
                        />

                        {/* Loss rate line */}
                        <polyline
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="3"
                          points="60,40 100,35 140,30 180,25 220,22 260,20 300,22 340,18"
                        />

                        {/* Data points */}
                        {[60, 100, 140, 180, 220, 260, 300, 340].map((x, i) => (
                          <g key={i}>
                            <circle cx={x} cy={100 - (i * 6)} r="4" fill="#059669" />
                            <circle cx={x} cy={40 - (i * 3)} r="4" fill="#ef4444" />
                          </g>
                        ))}

                        {/* Labels */}
                        <text x="200" y="145" fontSize="12" fill="#6b7280" textAnchor="middle">Games Played</text>
                        <text x="15" y="80" fontSize="12" fill="#6b7280" textAnchor="middle" transform="rotate(-90 15 80)">Win Rate %</text>
                      </svg>
                      <div className="flex justify-center gap-6 mt-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#059669' }}></div>
                          <span>Win Rate</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
                          <span>Loss Rate</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Position Performance Heatmap */}
                  <div>
                    <h4 className="font-semibold mb-4">Position Performance Matrix - Heatmap</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h5 className="text-sm font-semibold mb-3">Spectrum Flow Colors</h5>
                        <div className="space-y-2">
                          {['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'].map((position, posIndex) => (
                            <div key={position} className="flex items-center gap-2">
                              <span className="w-8 text-sm font-medium">{position}</span>
                              <div className="flex gap-1">
                                {['Goals', 'Assists', 'Defense', 'Accuracy', 'Movement'].map((metric, metricIndex) => {
                                  const intensity = Math.random() * 100;
                                  const colors = ['#1e40af', '#0891b2', '#0d9488', '#059669', '#166534'];
                                  return (
                                    <div 
                                      key={metric} 
                                      className="w-8 h-6 rounded text-xs text-white flex items-center justify-center font-bold"
                                      style={{ 
                                        backgroundColor: colors[metricIndex],
                                        opacity: intensity / 100
                                      }}
                                    >
                                      {Math.round(intensity)}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="text-sm font-semibold mb-3">Maximum Contrast Colors</h5>
                        <div className="space-y-2">
                          {['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'].map((position, posIndex) => (
                            <div key={position} className="flex items-center gap-2">
                              <span className="w-8 text-sm font-medium">{position}</span>
                              <div className="flex gap-1">
                                {['Goals', 'Assists', 'Defense', 'Accuracy', 'Movement'].map((metric, metricIndex) => {
                                  const intensity = Math.random() * 100;
                                  const colors = ['#4338ca', '#f97316', '#10b981', '#e11d48', '#d97706'];
                                  return (
                                    <div 
                                      key={metric} 
                                      className="w-8 h-6 rounded text-xs text-white flex items-center justify-center font-bold"
                                      style={{ 
                                        backgroundColor: colors[metricIndex],
                                        opacity: intensity / 100
                                      }}
                                    >
                                      {Math.round(intensity)}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 text-xs text-muted-foreground">
                      Color opacity represents performance intensity (0-100%). Position rows show different players, columns show different metrics.
                    </div>
                  </div>

                  {/* Pie Chart - Game Results */}
                  <div>
                    <h4 className="font-semibold mb-4">Season Results - Pie Chart</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="text-center">
                        <h5 className="text-sm font-semibold mb-3">Using Chart Colors</h5>
                        <div className="relative w-32 h-32 mx-auto">
                          <svg className="w-full h-full" viewBox="0 0 100 100">
                            {/* Wins - 60% */}
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#059669" strokeWidth="20" 
                                    strokeDasharray="150.8 251.2" transform="rotate(-90 50 50)" />
                            {/* Losses - 30% */}
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" strokeWidth="20" 
                                    strokeDasharray="75.4 326.6" strokeDashoffset="-150.8" transform="rotate(-90 50 50)" />
                            {/* Draws - 10% */}
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#eab308" strokeWidth="20" 
                                    strokeDasharray="25.1 376.9" strokeDashoffset="-226.2" transform="rotate(-90 50 50)" />
                          </svg>
                        </div>
                        <div className="space-y-2 mt-4 text-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#059669' }}></div>
                              <span>Wins</span>
                            </div>
                            <span className="font-bold">60%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ef4444' }}></div>
                              <span>Losses</span>
                            </div>
                            <span className="font-bold">30%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#eab308' }}></div>
                              <span>Draws</span>
                            </div>
                            <span className="font-bold">10%</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <h5 className="text-sm font-semibold mb-3">Brand Color Version</h5>
                        <div className="relative w-32 h-32 mx-auto">
                          <svg className="w-full h-full" viewBox="0 0 100 100">
                            {/* Wins - 60% */}
                            <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--success))" strokeWidth="20" 
                                    strokeDasharray="150.8 251.2" transform="rotate(-90 50 50)" />
                            {/* Losses - 30% */}
                            <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--destructive))" strokeWidth="20" 
                                    strokeDasharray="75.4 326.6" strokeDashoffset="-150.8" transform="rotate(-90 50 50)" />
                            {/* Draws - 10% */}
                            <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--warning))" strokeWidth="20" 
                                    strokeDasharray="25.1 376.9" strokeDashoffset="-226.2" transform="rotate(-90 50 50)" />
                          </svg>
                        </div>
                        <div className="space-y-2 mt-4 text-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-success rounded-full"></div>
                              <span>Wins</span>
                            </div>
                            <span className="font-bold">60%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-destructive rounded-full"></div>
                              <span>Losses</span>
                            </div>
                            <span className="font-bold">30%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-warning rounded-full"></div>
                              <span>Draws</span>
                            </div>
                            <span className="font-bold">10%</span>
                          </div>
                        </div>
                      </div>
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
                      <Users className="h-4 w-4" />
                      Team Comparisons
                    </h4>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>• <strong>Multi-team stats:</strong> Assign consistent chart colors per team</li>
                      <li>• <strong>Position analysis:</strong> Chart-1 to Chart-3 for attack, Chart-4 to Chart-5 for defense</li>
                      <li>• <strong>Performance matrices:</strong> Use temperature scales (cool to warm)</li>
                      <li>• <strong>Season comparisons:</strong> Chart-1 for current, Chart-2 for previous seasons</li>
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