
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

                {/* Example Chart: Quarter Performance */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Example: Quarter Performance (Brand-Based Colors)</h4>
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

                {/* Example Chart: Season Progress Line Chart */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Example: Season Win Rate Progress (Harmonious Spectrum)</h4>
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

                {/* Example Chart: Position Performance Matrix */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Example: Position Performance Matrix (Vibrant Categorical)</h4>
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
                
                {/* Example Chart: Team vs Team Comparison */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Example: Head-to-Head Comparison (Complementary Split)</h4>
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
                
                {/* Example Chart: Performance Alerts Dashboard */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Example: Performance Alert Dashboard (Triadic)</h4>
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
                
                {/* Example Chart: Progressive Performance Metrics */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Example: Progressive Performance Metrics (Monochromatic)</h4>
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
                
                {/* Example Chart: Energy and Activity Tracker */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Example: Team Energy & Activity Levels (Analogous Warm)</h4>
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
