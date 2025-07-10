
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

  // Option 2: Analogous Harmony
  const positionColorsOption2 = [
    { code: "GS", name: "Goal Shooter", color: "#e11d48", bgClass: "bg-rose-600", description: "Rose - precision striking" },
    { code: "GA", name: "Goal Attack", color: "#ec4899", bgClass: "bg-pink-600", description: "Pink - creative attack" },
    { code: "WA", name: "Wing Attack", color: "#a855f7", bgClass: "bg-purple-600", description: "Purple - wing creativity" },
    { code: "C", name: "Centre", color: "#7c3aed", bgClass: "bg-violet-600", description: "Violet - central control" },
    { code: "WD", name: "Wing Defence", color: "#6366f1", bgClass: "bg-indigo-600", description: "Indigo - wing protection" },
    { code: "GD", name: "Goal Defence", color: "#3b82f6", bgClass: "bg-blue-600", description: "Blue - defensive strength" },
    { code: "GK", name: "Goal Keeper", color: "#0ea5e9", bgClass: "bg-sky-600", description: "Sky blue - last line defense" }
  ];

  // Option 3: Triadic Balance
  const positionColorsOption3 = [
    { code: "GS", name: "Goal Shooter", color: "#dc2626", bgClass: "bg-red-600", description: "Primary red - power" },
    { code: "GA", name: "Goal Attack", color: "#f97316", bgClass: "bg-orange-600", description: "Orange-red - energy" },
    { code: "WA", name: "Wing Attack", color: "#eab308", bgClass: "bg-yellow-600", description: "Primary yellow - speed" },
    { code: "C", name: "Centre", color: "#84cc16", bgClass: "bg-lime-600", description: "Yellow-green - growth" },
    { code: "WD", name: "Wing Defence", color: "#10b981", bgClass: "bg-emerald-600", description: "Green - stability" },
    { code: "GD", name: "Goal Defence", color: "#0891b2", bgClass: "bg-cyan-600", description: "Blue-green - calm strength" },
    { code: "GK", name: "Goal Keeper", color: "#2563eb", bgClass: "bg-blue-600", description: "Primary blue - trust" }
  ];

  // Statistics Color Schemes - Multiple Options
  const statCategoriesOption1 = [
    { name: "Goals For", color: "#16a34a", bgClass: "bg-green-600", icon: <Target className="h-4 w-4" />, description: "Classic green for positive outcomes" },
    { name: "Goals Against", color: "#dc2626", bgClass: "bg-red-600", icon: <Shield className="h-4 w-4" />, description: "Traditional red for defensive stats" },
    { name: "Intercepts", color: "#2563eb", bgClass: "bg-blue-600", icon: <Zap className="h-4 w-4" />, description: "Blue for active defensive plays" },
    { name: "Rebounds", color: "#ca8a04", bgClass: "bg-yellow-600", icon: <TrendingUp className="h-4 w-4" />, description: "Yellow for recovery actions" },
    { name: "Turnovers", color: "#ea580c", bgClass: "bg-orange-600", icon: <AlertTriangle className="h-4 w-4" />, description: "Orange for concerning events" },
    { name: "Penalties", color: "#7c3aed", bgClass: "bg-violet-600", icon: <AlertCircle className="h-4 w-4" />, description: "Purple for rule infractions" },
    { name: "Centre Pass", color: "#0891b2", bgClass: "bg-cyan-600", icon: <Play className="h-4 w-4" />, description: "Cyan for neutral possession" },
    { name: "Rating", color: "#059669", bgClass: "bg-emerald-600", icon: <Star className="h-4 w-4" />, description: "Emerald for overall performance" }
  ];

  // Option 2: Monochromatic Blue Scheme
  const statCategoriesOption2 = [
    { name: "Goals For", color: "#1e40af", bgClass: "bg-blue-800", icon: <Target className="h-4 w-4" />, description: "Deep blue for primary positive stat" },
    { name: "Goals Against", color: "#3b82f6", bgClass: "bg-blue-600", icon: <Shield className="h-4 w-4" />, description: "Medium blue for defensive stat" },
    { name: "Intercepts", color: "#60a5fa", bgClass: "bg-blue-400", icon: <Zap className="h-4 w-4" />, description: "Light blue for quick actions" },
    { name: "Rebounds", color: "#93c5fd", bgClass: "bg-blue-300", icon: <TrendingUp className="h-4 w-4" />, description: "Lighter blue for recoveries" },
    { name: "Turnovers", color: "#dbeafe", bgClass: "bg-blue-200", icon: <AlertTriangle className="h-4 w-4" />, description: "Very light blue for negative events" },
    { name: "Penalties", color: "#1e3a8a", bgClass: "bg-blue-900", icon: <AlertCircle className="h-4 w-4" />, description: "Darkest blue for infractions" },
    { name: "Centre Pass", color: "#2563eb", bgClass: "bg-blue-600", icon: <Play className="h-4 w-4" />, description: "Standard blue for neutral events" },
    { name: "Rating", color: "#1d4ed8", bgClass: "bg-blue-700", icon: <Star className="h-4 w-4" />, description: "Strong blue for ratings" }
  ];

  // Option 3: Warm/Cool Contrast
  const statCategoriesOption3 = [
    { name: "Goals For", color: "#dc2626", bgClass: "bg-red-600", icon: <Target className="h-4 w-4" />, description: "Warm red for attacking stats" },
    { name: "Goals Against", color: "#2563eb", bgClass: "bg-blue-600", icon: <Shield className="h-4 w-4" />, description: "Cool blue for defensive stats" },
    { name: "Intercepts", color: "#0891b2", bgClass: "bg-cyan-600", icon: <Zap className="h-4 w-4" />, description: "Cool cyan for defensive actions" },
    { name: "Rebounds", color: "#f97316", bgClass: "bg-orange-600", icon: <TrendingUp className="h-4 w-4" />, description: "Warm orange for recovery" },
    { name: "Turnovers", color: "#7c3aed", bgClass: "bg-violet-600", icon: <AlertTriangle className="h-4 w-4" />, description: "Neutral purple for errors" },
    { name: "Penalties", color: "#e11d48", bgClass: "bg-rose-600", icon: <AlertCircle className="h-4 w-4" />, description: "Warm rose for infractions" },
    { name: "Centre Pass", color: "#10b981", bgClass: "bg-emerald-600", icon: <Play className="h-4 w-4" />, description: "Neutral green for possession" },
    { name: "Rating", color: "#059669", bgClass: "bg-emerald-600", icon: <Star className="h-4 w-4" />, description: "Green for positive ratings" }
  ];

  // Option 4: Earth Tones Scheme
  const statCategoriesOption4 = [
    { name: "Goals For", color: "#65a30d", bgClass: "bg-lime-600", icon: <Target className="h-4 w-4" />, description: "Natural lime for growth/success" },
    { name: "Goals Against", color: "#a16207", bgClass: "bg-yellow-700", icon: <Shield className="h-4 w-4" />, description: "Earth yellow for caution" },
    { name: "Intercepts", color: "#0369a1", bgClass: "bg-sky-700", icon: <Zap className="h-4 w-4" />, description: "Deep sky for decisive actions" },
    { name: "Rebounds", color: "#b45309", bgClass: "bg-amber-700", icon: <TrendingUp className="h-4 w-4" />, description: "Amber for recovery actions" },
    { name: "Turnovers", color: "#92400e", bgClass: "bg-orange-700", icon: <AlertTriangle className="h-4 w-4" />, description: "Earth orange for mistakes" },
    { name: "Penalties", color: "#7c2d12", bgClass: "bg-orange-800", icon: <AlertCircle className="h-4 w-4" />, description: "Deep earth tone for penalties" },
    { name: "Centre Pass", color: "#059669", bgClass: "bg-emerald-600", icon: <Play className="h-4 w-4" />, description: "Natural emerald for balance" },
    { name: "Rating", color: "#166534", bgClass: "bg-green-800", icon: <Star className="h-4 w-4" />, description: "Forest green for excellence" }
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
                <Badge className={`${status.bgClass} hover:${status.bgClass}/90`}>
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
          
          
        </section>

        {/* Netball Position Colors - Multiple Options */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Netball Position Color Schemes</h2>
          <p className="text-muted-foreground mb-6">
            Three different color scheme options based on color theory principles. Each offers different psychological 
            and visual benefits for position identification.
          </p>
          
          <div className="space-y-8">
            <PositionColorScheme
              title="Option 1: Warm/Cool Contrast"
              positions={positionColorsOption1}
              description="Based on warm (attack) to cool (defense) color temperature progression. Creates strong visual distinction between offensive and defensive roles."
            />
            
            <PositionColorScheme
              title="Option 2: Analogous Harmony"
              positions={positionColorsOption2}
              description="Uses adjacent colors on the color wheel for a harmonious, pleasing visual flow. Creates subtle but clear position distinctions."
            />
            
            <PositionColorScheme
              title="Option 3: Triadic Balance"
              positions={positionColorsOption3}
              description="Based on triadic color relationships for vibrant contrast while maintaining balance. Offers high visibility and clear position differentiation."
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

        {/* Statistics Colors - Multiple Options */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Statistics Color Schemes</h2>
          <p className="text-muted-foreground mb-6">
            Four different color scheme options for statistical categories, each based on different color theory principles 
            to provide variety while maintaining clear visual communication.
          </p>
          
          <div className="space-y-8">
            <StatsColorScheme
              title="Option 1: Classic Semantic Colors"
              stats={statCategoriesOption1}
              description="Traditional color associations - green for positive, red for negative, with complementary colors for neutral stats."
            />
            
            <StatsColorScheme
              title="Option 2: Monochromatic Blue Harmony"
              stats={statCategoriesOption2}
              description="Single hue variation using different shades and tints of blue for a cohesive, professional appearance."
            />
            
            <StatsColorScheme
              title="Option 3: Warm/Cool Temperature Contrast"
              stats={statCategoriesOption3}
              description="Temperature-based color coding - warm colors for offensive/active stats, cool colors for defensive/passive stats."
            />
            
            <StatsColorScheme
              title="Option 4: Natural Earth Tones"
              stats={statCategoriesOption4}
              description="Earth-inspired palette using natural colors for a softer, more organic visual approach."
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
