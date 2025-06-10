
import React from 'react';
import { Helmet } from 'react-helmet';
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
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Action Button Examples - Netball App</title>
      </Helmet>

      <div className="space-y-12">
        <div className="prose max-w-none">
          <h1>Action Button Examples</h1>
          <p>Consistent action button patterns for team and player boxes.</p>
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
                <li>Actions are positioned below the colored content boxes</li>
                <li>This maintains color consistency while keeping actions accessible</li>
                <li>Primary actions on the left, secondary/destructive on the right</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
