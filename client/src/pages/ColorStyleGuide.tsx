
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

  const netballPositions = [
    { code: "GS", name: "Goal Shooter", color: "#dc2626", bgClass: "bg-red-600" },
    { code: "GA", name: "Goal Attack", color: "#ea580c", bgClass: "bg-orange-600" },
    { code: "WA", name: "Wing Attack", color: "#ca8a04", bgClass: "bg-yellow-600" },
    { code: "C", name: "Centre", color: "#16a34a", bgClass: "bg-green-600" },
    { code: "WD", name: "Wing Defence", color: "#0891b2", bgClass: "bg-cyan-600" },
    { code: "GD", name: "Goal Defence", color: "#2563eb", bgClass: "bg-blue-600" },
    { code: "GK", name: "Goal Keeper", color: "#7c3aed", bgClass: "bg-violet-600" }
  ];

  const statCategories = [
    { name: "Goals For", color: "#16a34a", bgClass: "bg-green-600", icon: <Target className="h-4 w-4" /> },
    { name: "Goals Against", color: "#dc2626", bgClass: "bg-red-600", icon: <Shield className="h-4 w-4" /> },
    { name: "Intercepts", color: "#2563eb", bgClass: "bg-blue-600", icon: <Zap className="h-4 w-4" /> },
    { name: "Rebounds", color: "#ca8a04", bgClass: "bg-yellow-600", icon: <TrendingUp className="h-4 w-4" /> },
    { name: "Turnovers", color: "#ea580c", bgClass: "bg-orange-600", icon: <AlertTriangle className="h-4 w-4" /> },
    { name: "Penalties", color: "#7c3aed", bgClass: "bg-violet-600", icon: <AlertCircle className="h-4 w-4" /> },
    { name: "Centre Pass", color: "#0891b2", bgClass: "bg-cyan-600", icon: <Play className="h-4 w-4" /> },
    { name: "Rating", color: "#059669", bgClass: "bg-emerald-600", icon: <Star className="h-4 w-4" /> }
  ];

  const gameStatuses = [
    { name: "Upcoming", color: "#3b82f6", bgClass: "bg-blue-500", description: "Game scheduled but not started" },
    { name: "In Progress", color: "#f59e0b", bgClass: "bg-amber-500", description: "Game currently being played" },
    { name: "Completed", color: "#10b981", bgClass: "bg-emerald-500", description: "Game finished successfully" },
    { name: "Cancelled", color: "#6b7280", bgClass: "bg-gray-500", description: "Game cancelled or postponed" },
    { name: "Forfeit", color: "#ef4444", bgClass: "bg-red-500", description: "Game ended by forfeit" }
  ];

  const actionColors = [
    { name: "Create/Add", color: "#16a34a", bgClass: "bg-green-600", description: "Adding new items, creating records" },
    { name: "Edit/Update", color: "#3b82f6", bgClass: "bg-blue-600", description: "Modifying existing records" },
    { name: "Delete/Remove", color: "#dc2626", bgClass: "bg-red-600", description: "Removing items, destructive actions" },
    { name: "View/Details", color: "#6b7280", bgClass: "bg-gray-600", description: "Viewing information, navigation" },
    { name: "Manage/Settings", color: "#ea580c", bgClass: "bg-orange-600", description: "Administrative functions" },
    { name: "Export/Share", color: "#7c3aed", bgClass: "bg-violet-600", description: "Data export, sharing features" }
  ];

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
            Comprehensive color standardization guide for the netball application. This ensures consistent 
            visual communication across all features and components.
          </p>
        </div>

        {/* Primary Brand Colors */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Primary Brand Colors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ColorSwatch
              name="Netball Court Blue"
              hex="#4f8ff7"
              description="Primary brand color for main UI elements"
              usage="Buttons, links, primary actions, brand elements"
            />
            <ColorSwatch
              name="Success Green"
              hex="#10B981"
              description="Positive outcomes, wins, successful operations"
              usage="Win indicators, success messages, positive metrics"
            />
            <ColorSwatch
              name="Warning Orange"
              hex="#F59E0B"
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

        {/* Netball Position Colors */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Netball Position Colors</h2>
          <Card>
            <CardHeader>
              <CardTitle>Position-Specific Color Coding</CardTitle>
              <p className="text-sm text-muted-foreground">
                Consistent colors for each netball position across charts, stats, and displays
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {netballPositions.map(position => (
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
              
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold mb-2">Position Color Logic</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• <strong>Attackers (GS, GA):</strong> Red/Orange spectrum - aggressive, goal-focused</li>
                  <li>• <strong>Mid-court (WA, C, WD):</strong> Yellow/Green/Cyan - dynamic, versatile</li>
                  <li>• <strong>Defenders (GD, GK):</strong> Blue/Purple spectrum - defensive, protective</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Statistics Colors */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Statistics Colors</h2>
          <Card>
            <CardHeader>
              <CardTitle>Stat Category Color Coding</CardTitle>
              <p className="text-sm text-muted-foreground">
                Consistent colors for different statistical categories
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {statCategories.map(stat => (
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
                    <div className="flex gap-2">
                      <Button size="sm" className={`${stat.bgClass} hover:${stat.bgClass}/90`}>
                        {stat.icon}
                        <span className="ml-2">{stat.name}</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-semibold mb-2">Positive Stats</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-600 rounded"></div>
                      <span className="text-sm">Goals For, Intercepts, Rebounds</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-emerald-600 rounded"></div>
                      <span className="text-sm">Player Ratings, Performance</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-semibold mb-2">Negative Stats</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-600 rounded"></div>
                      <span className="text-sm">Goals Against, Errors</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-orange-600 rounded"></div>
                      <span className="text-sm">Turnovers, Warnings</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Game Status Colors */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Game Status Colors</h2>
          <Card>
            <CardHeader>
              <CardTitle>Game State Visual Indicators</CardTitle>
              <p className="text-sm text-muted-foreground">
                Consistent status colors across game displays and dashboards
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {gameStatuses.map(status => (
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

        {/* Display Variations */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Display Variations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <Card>
              <CardHeader>
                <CardTitle>Badge Variations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Solid Badges</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-green-600">Win</Badge>
                    <Badge className="bg-red-600">Loss</Badge>
                    <Badge className="bg-amber-600">Draw</Badge>
                    <Badge className="bg-blue-600">Active</Badge>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Outline Badges</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="border-green-600 text-green-700">Win</Badge>
                    <Badge variant="outline" className="border-red-600 text-red-700">Loss</Badge>
                    <Badge variant="outline" className="border-amber-600 text-amber-700">Draw</Badge>
                    <Badge variant="outline" className="border-blue-600 text-blue-700">Active</Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Soft Badges</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Win</Badge>
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Loss</Badge>
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Draw</Badge>
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Button Variations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Primary Actions</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button className="bg-green-600 hover:bg-green-700">Create</Button>
                    <Button className="bg-blue-600 hover:bg-blue-700">Edit</Button>
                    <Button className="bg-red-600 hover:bg-red-700">Delete</Button>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Secondary Actions</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" className="border-green-600 text-green-700 hover:bg-green-50">Create</Button>
                    <Button variant="outline" className="border-blue-600 text-blue-700 hover:bg-blue-50">Edit</Button>
                    <Button variant="outline" className="border-red-600 text-red-700 hover:bg-red-50">Delete</Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Ghost Actions</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="ghost" className="text-green-700 hover:bg-green-100">Create</Button>
                    <Button variant="ghost" className="text-blue-700 hover:bg-blue-100">Edit</Button>
                    <Button variant="ghost" className="text-red-700 hover:bg-red-100">Delete</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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
