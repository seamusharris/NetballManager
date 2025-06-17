
import React from 'react';
import { Helmet } from 'react-helmet';
import PageTemplate from '@/components/layout/PageTemplate';
import { TeamBox } from '@/components/ui/team-box';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Users, Calendar, Trophy, Target, TrendingUp, Eye } from 'lucide-react';

export default function TeamBoxExamples() {
  const sampleTeams = [
    {
      id: 116,
      name: "WNC Dingoes",
      division: "13U/3s",
      clubName: "Warrandyte Netball Club",
      clubCode: "WNC",
      isActive: true,
      seasonName: "Autumn 2025"
    },
    {
      id: 123,
      name: "WNC Emus",
      division: "15U/1s",
      clubName: "Warrandyte Netball Club",
      clubCode: "WNC",
      isActive: true,
      seasonName: "Autumn 2025"
    },
    {
      id: 117,
      name: "Emeralds",
      division: "13U/3s",
      clubName: "Deep Creek",
      clubCode: "DC",
      isActive: true,
      seasonName: "Autumn 2025"
    },
    {
      id: 130,
      name: "Kool Kats",
      division: "13U/1s",
      clubName: "Doncaster",
      clubCode: "DO",
      isActive: true,
      seasonName: "Autumn 2025"
    },
    {
      id: 124,
      name: "Gems",
      division: "15U/1s",
      clubName: "Deep Creek",
      clubCode: "DC",
      isActive: false,
      seasonName: "Autumn 2025"
    }
  ];

  const samplePlayers = [
    {
      id: 60,
      displayName: "Abbey N",
      positionPreferences: ["GA", "GS", "C", "WA"],
      avatarColor: "bg-red-500",
      active: true
    },
    {
      id: 59,
      displayName: "Abby D",
      positionPreferences: ["GS", "GA"],
      avatarColor: "bg-orange-500",
      active: true
    },
    {
      id: 76,
      displayName: "Ava",
      positionPreferences: ["WA", "WD", "C", "GA"],
      avatarColor: "bg-teal-600",
      active: true
    },
    {
      id: 61,
      displayName: "Emily",
      positionPreferences: ["GD", "GK", "WD", "WA"],
      avatarColor: "bg-yellow-600",
      active: true
    },
    {
      id: 81,
      displayName: "Erin",
      positionPreferences: ["C", "WD", "WA", "GD"],
      avatarColor: "bg-green-700",
      active: true
    },
    {
      id: 63,
      displayName: "Evie",
      positionPreferences: ["GS", "GA"],
      avatarColor: "bg-purple-500",
      active: true
    },
    {
      id: 64,
      displayName: "Grace",
      positionPreferences: ["GD", "GK"],
      avatarColor: "bg-blue-500",
      active: true
    },
    {
      id: 65,
      displayName: "Hannah",
      positionPreferences: ["C", "WA"],
      avatarColor: "bg-pink-500",
      active: true
    }
  ];

  const sampleStats = [
    { label: "Games Played", value: 12 },
    { label: "Wins", value: 8 },
    { label: "Losses", value: 4 },
    { label: "Win Rate", value: "67%" },
    { label: "Avg Goals For", value: "24.3" },
    { label: "Avg Goals Against", value: "18.1" }
  ];

  return (
    <PageTemplate 
      title="TeamBox Examples" 
      breadcrumbs={[
        { label: "Component Examples", href: "/component-examples" },
        { label: "TeamBox Examples" }
      ]}
    >
      <div className="prose max-w-none mb-6">
        <p className="text-lg text-gray-700">
          Different layouts and configurations of the TeamBox component
        </p>
      </div>
      
      <div className="space-y-8">
        {/* Minimal Variant */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Minimal Team Display</h2>
          <div className="space-y-3">
            {sampleTeams.slice(0, 3).map(team => (
              <TeamBox 
                key={team.id}
                team={team} 
                variant="minimal"
                actions={
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4" />
                  </Button>
                }
              />
            ))}
          </div>
        </section>

        {/* Basic Team Box */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Standard Team Display</h2>
          <div className="space-y-4">
            <TeamBox team={sampleTeams[0]} />
            <TeamBox team={sampleTeams[1]} />
            <TeamBox team={sampleTeams[4]} />
          </div>
        </section>

        {/* Different Sizes */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Different Sizes</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Small Size</h3>
              <TeamBox team={sampleTeams[0]} size="sm" />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Medium Size (Default)</h3>
              <TeamBox team={sampleTeams[0]} size="md" />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Large Size</h3>
              <TeamBox team={sampleTeams[0]} size="lg" />
            </div>
          </div>
        </section>

        {/* With Action Buttons */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">With Action Buttons</h2>
          <div className="space-y-4">
            <TeamBox 
              team={sampleTeams[1]} 
              actions={
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              }
            />
            <TeamBox 
              team={sampleTeams[2]} 
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
        </section>

        {/* With Statistics */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">With Team Statistics</h2>
          <div className="space-y-4">
            <TeamBox 
              team={sampleTeams[0]} 
              showStats={true}
              stats={sampleStats}
            />
            <TeamBox 
              team={sampleTeams[1]} 
              showStats={true}
              stats={[
                { label: "Games", value: 10 },
                { label: "Wins", value: 7 },
                { label: "Win Rate", value: "70%" },
                { label: "Goals For", value: 245 },
                { label: "Goals Against", value: 189 },
                { label: "Ladder", value: "2nd" }
              ]}
            />
          </div>
        </section>

        {/* With Players */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">With Player Listing</h2>
          <div className="space-y-4">
            <TeamBox 
              team={sampleTeams[0]} 
              showPlayers={true}
              players={samplePlayers.slice(0, 6)}
            />
            <TeamBox 
              team={sampleTeams[1]} 
              showPlayers={true}
              players={samplePlayers}
              size="lg"
            />
          </div>
        </section>

        {/* Detailed Display */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Full Team Details</h2>
          <div className="space-y-4">
            <TeamBox 
              team={sampleTeams[0]} 
              variant="detailed"
              showStats={true}
              showPlayers={true}
              players={samplePlayers.slice(0, 8)}
              stats={sampleStats}
              size="lg"
              actions={
                <div className="flex gap-2">
                  <Button size="sm" variant="default">
                    <Trophy className="h-4 w-4 mr-2" />
                    View Games
                  </Button>
                  <Button size="sm" variant="outline">
                    <Target className="h-4 w-4 mr-2" />
                    Analytics
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              }
            />
          </div>
        </section>

        {/* Different Club Colors */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Different Club Styles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sampleTeams.map((team) => (
              <TeamBox 
                key={team.id}
                team={team}
                variant="minimal"
                actions={
                  <Badge variant={team.isActive ? "default" : "secondary"}>
                    {team.isActive ? "Active" : "Inactive"}
                  </Badge>
                }
              />
            ))}
          </div>
        </section>

        {/* Mixed Configurations */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Combined Features</h2>
          <div className="space-y-6">
            <TeamBox 
              team={sampleTeams[2]} 
              size="lg"
              showStats={true}
              showPlayers={true}
              players={samplePlayers.slice(0, 4)}
              stats={[
                { label: "Current Streak", value: "5 Wins" },
                { label: "Top Scorer", value: "Abbey N" },
                { label: "Best Quarter", value: "Q3" },
                { label: "Team Rating", value: "8.5" }
              ]}
              actions={
                <div className="flex gap-2">
                  <Button size="sm" variant="default">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Performance
                  </Button>
                  <Button size="sm" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Roster
                  </Button>
                </div>
              }
            />
          </div>
        </section>

        {/* Hover Effect Comparisons */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Hover Effect Comparisons</h2>
          <div className="space-y-6">
            
            <div>
              <h3 className="text-lg font-medium mb-3">1. Background Darkening Only</h3>
              <div 
                className="flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-300 cursor-pointer"
                style={{ 
                  backgroundColor: `${sampleTeams[0].clubCode === 'WNC' ? '#ff2c36' : '#3b82f6'}15`,
                  borderColor: sampleTeams[0].clubCode === 'WNC' ? '#ff2c36' : '#3b82f6'
                }}
                onMouseEnter={(e) => {
                  const teamColor = sampleTeams[0].clubCode === 'WNC' ? '#ff2c36' : '#3b82f6';
                  e.currentTarget.style.backgroundColor = `${teamColor}25`;
                }}
                onMouseLeave={(e) => {
                  const teamColor = sampleTeams[0].clubCode === 'WNC' ? '#ff2c36' : '#3b82f6';
                  e.currentTarget.style.backgroundColor = `${teamColor}15`;
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sampleTeams[0].clubCode === 'WNC' ? '#ff2c36' : '#3b82f6' }}></div>
                  <div>
                    <div className="font-semibold">{sampleTeams[0].name}</div>
                    <div className="text-sm text-gray-600">{sampleTeams[0].division} • {sampleTeams[0].clubName}</div>
                  </div>
                </div>
                <Badge variant="default">Background Only</Badge>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">2. Shadow Change Only (Medium)</h3>
              <div 
                className="flex items-center justify-between p-3 rounded-lg border-2 transition-shadow duration-300 hover:shadow-md shadow-sm cursor-pointer"
                style={{ 
                  backgroundColor: `${sampleTeams[1].clubCode === 'WNC' ? '#ff2c36' : '#3b82f6'}15`,
                  borderColor: sampleTeams[1].clubCode === 'WNC' ? '#ff2c36' : '#3b82f6'
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sampleTeams[1].clubCode === 'WNC' ? '#ff2c36' : '#3b82f6' }}></div>
                  <div>
                    <div className="font-semibold">{sampleTeams[1].name}</div>
                    <div className="text-sm text-gray-600">{sampleTeams[1].division} • {sampleTeams[1].clubName}</div>
                  </div>
                </div>
                <Badge variant="outline">Shadow Only (md)</Badge>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">3. Shadow Change Only (Large)</h3>
              <div 
                className="flex items-center justify-between p-3 rounded-lg border-2 transition-shadow duration-300 hover:shadow-lg shadow-sm cursor-pointer"
                style={{ 
                  backgroundColor: `${sampleTeams[2].clubCode === 'WNC' ? '#ff2c36' : '#3b82f6'}15`,
                  borderColor: sampleTeams[2].clubCode === 'WNC' ? '#ff2c36' : '#3b82f6'
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sampleTeams[2].clubCode === 'WNC' ? '#ff2c36' : '#3b82f6' }}></div>
                  <div>
                    <div className="font-semibold">{sampleTeams[2].name}</div>
                    <div className="text-sm text-gray-600">{sampleTeams[2].division} • {sampleTeams[2].clubName}</div>
                  </div>
                </div>
                <Badge variant="outline">Shadow Only (lg)</Badge>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">4. Background Darkening + Medium Shadow</h3>
              <div 
                className="flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-300 hover:shadow-md shadow-sm cursor-pointer"
                style={{ 
                  backgroundColor: `${sampleTeams[3].clubCode === 'WNC' ? '#ff2c36' : '#3b82f6'}15`,
                  borderColor: sampleTeams[3].clubCode === 'WNC' ? '#ff2c36' : '#3b82f6'
                }}
                onMouseEnter={(e) => {
                  const teamColor = sampleTeams[3].clubCode === 'WNC' ? '#ff2c36' : '#3b82f6';
                  e.currentTarget.style.backgroundColor = `${teamColor}25`;
                }}
                onMouseLeave={(e) => {
                  const teamColor = sampleTeams[3].clubCode === 'WNC' ? '#ff2c36' : '#3b82f6';
                  e.currentTarget.style.backgroundColor = `${teamColor}15`;
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sampleTeams[3].clubCode === 'WNC' ? '#ff2c36' : '#3b82f6' }}></div>
                  <div>
                    <div className="font-semibold">{sampleTeams[3].name}</div>
                    <div className="text-sm text-gray-600">{sampleTeams[3].division} • {sampleTeams[3].clubName}</div>
                  </div>
                </div>
                <Badge variant="secondary">Background + Shadow (md)</Badge>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">5. Background Darkening + Large Shadow</h3>
              <div 
                className="flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-300 hover:shadow-lg shadow-sm cursor-pointer"
                style={{ 
                  backgroundColor: `${sampleTeams[4].clubCode === 'WNC' ? '#ff2c36' : '#3b82f6'}15`,
                  borderColor: sampleTeams[4].clubCode === 'WNC' ? '#ff2c36' : '#3b82f6'
                }}
                onMouseEnter={(e) => {
                  const teamColor = sampleTeams[4].clubCode === 'WNC' ? '#ff2c36' : '#3b82f6';
                  e.currentTarget.style.backgroundColor = `${teamColor}25`;
                }}
                onMouseLeave={(e) => {
                  const teamColor = sampleTeams[4].clubCode === 'WNC' ? '#ff2c36' : '#3b82f6';
                  e.currentTarget.style.backgroundColor = `${teamColor}15`;
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sampleTeams[4].clubCode === 'WNC' ? '#ff2c36' : '#3b82f6' }}></div>
                  <div>
                    <div className="font-semibold">{sampleTeams[4].name}</div>
                    <div className="text-sm text-gray-600">{sampleTeams[4].division} • {sampleTeams[4].clubName}</div>
                  </div>
                </div>
                <Badge variant="secondary">Background + Shadow (lg)</Badge>
              </div>
            </div>

          </div>
        </section>
      </div>
    </PageTemplate>
  );
}
