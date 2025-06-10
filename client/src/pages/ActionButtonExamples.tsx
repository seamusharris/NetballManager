
import React from 'react';
import { Helmet } from 'react-helmet';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { TeamBox } from '@/components/ui/team-box';
import { PlayerBox } from '@/components/ui/player-box';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Trash2, 
  Users, 
  Calendar, 
  Trophy, 
  Target, 
  TrendingUp, 
  Eye, 
  UserPlus, 
  Award,
  Settings,
  Download,
  Share,
  Star,
  MoreHorizontal,
  Play
} from 'lucide-react';

export default function ActionButtonExamples() {
  const sampleTeam = {
    id: 116,
    name: "WNC Dingoes",
    division: "13U/3s",
    clubName: "Warrandyte Netball Club",
    clubCode: "WNC",
    isActive: true,
    seasonName: "Autumn 2025"
  };

  const samplePlayer = {
    id: 1,
    displayName: "Sarah Johnson",
    firstName: "Sarah",
    lastName: "Johnson",
    positionPreferences: ["GA", "GS"],
    avatarColor: "bg-blue-500",
    active: true
  };

  const sampleStats = [
    { label: "Goals", value: 32 },
    { label: "Assists", value: 15 },
    { label: "Rating", value: "9.2" }
  ];

  return (
    <PageTemplate 
      title="Action Button Examples" 
      breadcrumbs={[
        { label: "Component Examples", href: "/component-examples" },
        { label: "Action Button Examples" }
      ]}
    >
      <div className="space-y-12">
        <div className="prose max-w-none">
          <p className="text-lg text-gray-700">
            Consistent action button patterns for team and player boxes.
          </p>
        </div>

        {/* Primary Actions */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Primary Actions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Team Management Actions</h3>
              <TeamBox 
                team={sampleTeam}
                actions={
                  <div className="flex gap-2">
                    <Button size="sm" variant="default">
                      <Users className="h-4 w-4 mr-2" />
                      Manage Team
                    </Button>
                    <Button size="sm" variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule
                    </Button>
                  </div>
                }
              />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Player Management Actions</h3>
              <PlayerBox 
                player={samplePlayer}
                actions={
                  <div className="flex gap-2">
                    <Button size="sm" variant="default">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add to Roster
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Player
                    </Button>
                  </div>
                }
              />
            </div>
          </div>
        </section>

        {/* Icon-Only Actions */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Icon-Only Actions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Compact Team Actions</h3>
              <TeamBox 
                team={sampleTeam}
                size="sm"
                actions={
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                }
              />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Compact Player Actions</h3>
              <PlayerBox 
                player={samplePlayer}
                size="sm"
                actions={
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline">
                      <Award className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                }
              />
            </div>
          </div>
        </section>

        {/* Mixed Action Types */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Mixed Action Patterns</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Primary + Secondary Actions</h3>
              <TeamBox 
                team={sampleTeam}
                showStats={true}
                stats={[
                  { label: "Games", value: 12 },
                  { label: "Wins", value: 8 },
                  { label: "Win Rate", value: "67%" }
                ]}
                actions={
                  <div className="flex gap-2">
                    <Button size="sm" variant="default">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                }
              />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Player with Stats + Actions</h3>
              <PlayerBox 
                player={samplePlayer}
                stats={sampleStats}
                actions={
                  <div className="flex gap-2">
                    <Button size="sm" variant="success">
                      <Play className="h-4 w-4 mr-2" />
                      Add to Game
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trophy className="h-4 w-4" />
                    </Button>
                  </div>
                }
              />
            </div>
          </div>
        </section>

        {/* Status-Based Actions */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Status-Based Actions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Active vs Inactive States</h3>
              <div className="space-y-4">
                <TeamBox 
                  team={{...sampleTeam, isActive: true}}
                  actions={
                    <div className="flex gap-2 items-center">
                      <Badge variant="default" className="text-xs">Active</Badge>
                      <Button size="sm" variant="outline">
                        <Users className="h-4 w-4 mr-2" />
                        Manage
                      </Button>
                      <Button size="sm" variant="warning">
                        <Target className="h-4 w-4 mr-2" />
                        Deactivate
                      </Button>
                    </div>
                  }
                />
                
                <TeamBox 
                  team={{...sampleTeam, isActive: false}}
                  actions={
                    <div className="flex gap-2 items-center">
                      <Badge variant="secondary" className="text-xs">Inactive</Badge>
                      <Button size="sm" variant="success">
                        <Target className="h-4 w-4 mr-2" />
                        Reactivate
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  }
                />
              </div>
            </div>
          </div>
        </section>

        {/* Contextual Actions */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Contextual Actions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Game Day Actions</h3>
              <TeamBox 
                team={sampleTeam}
                actions={
                  <div className="flex gap-2">
                    <Button size="sm" variant="default">
                      <Play className="h-4 w-4 mr-2" />
                      Start Game
                    </Button>
                    <Button size="sm" variant="outline">
                      <Users className="h-4 w-4 mr-2" />
                      View Roster
                    </Button>
                    <Button size="sm" variant="outline">
                      <Calendar className="h-4 w-4" />
                    </Button>
                  </div>
                }
              />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Performance Review Actions</h3>
              <PlayerBox 
                player={samplePlayer}
                stats={sampleStats}
                actions={
                  <div className="flex gap-2">
                    <Button size="sm" variant="default">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Full Stats
                    </Button>
                    <Button size="sm" variant="outline">
                      <Star className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                }
              />
            </div>
          </div>
        </section>

        {/* Inside Box Actions */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Actions Inside Colored Boxes</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Integrated Team Actions</h3>
              <TeamBox 
                team={sampleTeam}
                showStats={true}
                stats={[
                  { label: "Games", value: 12 },
                  { label: "Wins", value: 8 },
                  { label: "Win Rate", value: "67%" }
                ]}
                actions={
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                }
                className="relative"
              />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Integrated Player Actions</h3>
              <PlayerBox 
                player={samplePlayer}
                stats={sampleStats}
                actions={
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                      <Award className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                }
                className="relative"
              />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Corner Action Badges</h3>
              <TeamBox 
                team={sampleTeam}
                actions={
                  <div className="absolute top-3 right-3">
                    <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white text-gray-700 shadow-sm">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Quick Stats
                    </Button>
                  </div>
                }
                className="relative"
              />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Floating Action Menu</h3>
              <PlayerBox 
                player={samplePlayer}
                actions={
                  <div className="absolute bottom-3 right-3">
                    <Button size="sm" className="bg-black/70 hover:bg-black/80 text-white backdrop-blur-sm">
                      <Play className="h-4 w-4 mr-1" />
                      Quick Add
                    </Button>
                  </div>
                }
                className="relative"
              />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Overlay Actions with Semi-Transparent Background</h3>
              <TeamBox 
                team={sampleTeam}
                showStats={true}
                stats={[
                  { label: "Recent Form", value: "W-W-L" },
                  { label: "Rating", value: "8.5" }
                ]}
                actions={
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all duration-200 group">
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                      <Button size="sm" variant="secondary" className="bg-white shadow-md">
                        <Users className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="secondary" className="bg-white shadow-md">
                        <Calendar className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="secondary" className="bg-white shadow-md">
                        <Trophy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                }
                className="relative overflow-hidden"
              />
            </div>
          </div>
        </section>

        {/* Action Guidelines */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Action Button Guidelines</h2>
          <div className="bg-gray-50 p-6 rounded-lg space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Color Usage:</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li><strong>Default (Blue):</strong> Primary actions like "Manage", "View Details"</li>
                <li><strong>Success (Green):</strong> Positive actions like "Activate", "Add", "Approve"</li>
                <li><strong>Warning (Orange):</strong> Caution actions like "Deactivate", "Archive"</li>
                <li><strong>Outline:</strong> Secondary actions and icon-only buttons</li>
                <li><strong>Red text + Outline:</strong> Destructive actions like "Delete", "Remove"</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Positioning:</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li><strong>External:</strong> Actions positioned below colored boxes for clear separation</li>
                <li><strong>Integrated:</strong> Actions inside boxes using semi-transparent backgrounds</li>
                <li><strong>Overlay:</strong> Hover-revealed actions with backdrop blur or shadows</li>
                <li><strong>Corner badges:</strong> Small action buttons in corners for quick access</li>
                <li>Primary actions on the left, secondary/destructive on the right</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Integration Techniques:</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li><strong>Semi-transparent:</strong> bg-white/20 with white text for colored backgrounds</li>
                <li><strong>High contrast:</strong> bg-white with dark text for maximum readability</li>
                <li><strong>Backdrop blur:</strong> backdrop-blur-sm for floating effect</li>
                <li><strong>Hover reveals:</strong> opacity-0 to opacity-100 on parent hover</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </PageTemplate>
  );
}
