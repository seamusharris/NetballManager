import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import PageTemplate from '@/components/layout/PageTemplate';
import { PlayerBox } from '@/components/ui/player-box';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Users, 
  UserPlus, 
  Settings, 
  Download, 
  Upload,
  Trash2,
  Edit,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Star,
  Award,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
  Calendar,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getPlayerColorHex, getDarkerColorHex, getLighterColorHex, getMediumColorHex } from '@/lib/playerColorUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';

export default function AllPlayersDesignExamples() {
  // Sample player data for 150+ players simulation with deterministic generation
  const generatePlayers = (count: number) => {
    const names = [
      "Sarah Johnson", "Emma Wilson", "Lily Chen", "Mia Thompson", "Zoe Parker",
      "Kate Miller", "Jessica Adams", "Rachel Green", "Monica Geller", "Phoebe Buffay",
      "Amy Rodriguez", "Bella Martinez", "Chloe Davis", "Daisy Wilson", "Ella Brown",
      "Fiona Lee", "Grace Kim", "Holly Wang", "Ivy Chen", "Jade Liu",
      "Kelly Smith", "Lucy Taylor", "Maya Patel", "Nina Singh", "Olive Johnson",
      "Paige Anderson", "Quinn Thompson", "Ruby Martinez", "Sofia Garcia", "Tara Wilson",
      "Uma Reddy", "Vera Kowalski", "Wendy Chang", "Xara Nguyen", "Yuki Tanaka",
      "Zara Ahmed", "Alice Cooper", "Beth Davis", "Claire Evans", "Diana Foster",
      "Elena Gonzalez", "Faith Harris", "Gina Jackson", "Hope Kelly", "Iris Lopez"
    ];

    const positions = [
      ["GS"], ["GA"], ["WA"], ["C"], ["WD"], ["GD"], ["GK"],
      ["GS", "GA"], ["GA", "WA"], ["WA", "C"], ["C", "WD"], ["WD", "GD"], ["GD", "GK"],
      ["GS", "GA", "WA"], ["GA", "WA", "C"], ["WA", "C", "WD"], ["C", "WD", "GD"], ["WD", "GD", "GK"]
    ];

    const colors = [
      "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-red-500",
      "bg-pink-500", "bg-indigo-500", "bg-teal-500", "bg-amber-500", "bg-emerald-500",
      "bg-cyan-500", "bg-rose-500", "bg-violet-500", "bg-lime-500", "bg-yellow-500"
    ];

    const teams = ["Lightning Bolts", "Storm Eagles", "Fire Hawks", "Thunder Cats", "Ice Dragons", null];
    const statuses = ["Active", "Inactive", "Injured", "On Loan", "New"];

    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      displayName: names[i % names.length] + (i > names.length - 1 ? ` ${Math.floor(i / names.length) + 1}` : ''),
      firstName: names[i % names.length].split(' ')[0],
      lastName: names[i % names.length].split(' ')[1] + (i > names.length - 1 ? ` ${Math.floor(i / names.length) + 1}` : ''),
      positionPreferences: positions[i % positions.length],
      avatarColor: colors[i % colors.length],
      active: i % 5 !== 0, // Deterministic: 80% active (every 5th player is inactive)
      team: teams[i % teams.length],
      status: statuses[i % statuses.length],
      joinedDate: new Date(2023 + (i % 2), (i % 12), Math.min((i % 28) + 1, 28)),
      gamesPlayed: (i % 25),
      goals: (i % 50),
      assists: (i % 30),
      email: `${names[i % names.length].toLowerCase().replace(' ', '.')}@email.com`,
      phone: `04${(i + 10000000).toString().padStart(8, '0')}`,
      address: `${(i % 999) + 1} ${['Main', 'Oak', 'Pine', 'Elm', 'Cedar'][i % 5]} St`
    }));
  };

  const allPlayers = generatePlayers(45); // Smaller sample for demo
  const [selectedPlayers, setSelectedPlayers] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTeam, setFilterTeam] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedForTeam, setSelectedForTeam] = useState(new Set());
  const [batchSelectedPlayers, setBatchSelectedPlayers] = useState(new Set());

  const togglePlayerSelection = (playerId) => {
    setSelectedPlayers(prev => {
      const newSet = new Set([...prev]);
      if (newSet.has(playerId)) {
        newSet.delete(playerId);
      } else
        newSet.add(playerId);
      }
      return newSet;
    });
  };

    const toggleBatchSelection = (playerId) => {
    setBatchSelectedPlayers(prev => {
      const newSet = new Set([...prev]);
      if (newSet.has(playerId)) {
        newSet.delete(playerId);
      } else
        newSet.add(playerId);
      }
      return newSet;
    });
  };


  const toggleTeamSelection = (playerId) => {
    setSelectedForTeam(prev => {
      const newSet = new Set([...prev]);
      if (newSet.has(playerId)) {
        newSet.delete(playerId);
      } else
        newSet.add(playerId);
      }
      return newSet;
    });
  };

  const filteredPlayers = allPlayers.filter(player => {
    const matchesSearch = player.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.positionPreferences.some(pos => pos.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && player.active) ||
                         (filterStatus === 'inactive' && !player.active) ||
                         player.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesTeam = filterTeam === 'all' || player.team === filterTeam;

    return matchesSearch && matchesStatus && matchesTeam && player.active;
  });

  return (
    <PageTemplate 
      title="All Players Design Examples" 
      breadcrumbs={[
        { label: "Component Examples", href: "/component-examples" },
        { label: "All Players Design Examples" }
      ]}
    >
      <Helmet>
        <title>All Players Design Examples - Player Management Concepts</title>
        <meta name="description" content="Comprehensive player management page designs showcasing different layouts, filtering, and batch operations for managing 150+ club players." />
      </Helmet>

      <div className="prose max-w-none mb-6">
        <p className="text-lg text-gray-700">
          Different design concepts for managing all club players with filtering, search, batch operations, and various layout options.
          Each design addresses different use cases from simple player listing to comprehensive team management.
        </p>
      </div>

      <Tabs defaultValue="grid-view" className="w-full">
        <TabsList className="grid w-full grid-cols-8 mb-8">
          <TabsTrigger value="grid-view">Grid View</TabsTrigger>
          <TabsTrigger value="list-view">List View</TabsTrigger>
          <TabsTrigger value="team-builder">Team Builder</TabsTrigger>
          <TabsTrigger value="advanced-filter">Advanced Filter</TabsTrigger>
          <TabsTrigger value="batch-operations">Batch Operations</TabsTrigger>
          <TabsTrigger value="player-cards">Player Cards</TabsTrigger>
          <TabsTrigger value="analytics-view">Analytics View</TabsTrigger>
          <TabsTrigger value="mobile-optimized">Mobile Optimized</TabsTrigger>
        </TabsList>

        {/* Grid View Design - Standard Player Management */}
        <TabsContent value="grid-view" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Grid3X3 className="h-5 w-5" />
                Standard Grid View Design
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Filter Bar */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search players by name or position..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Players</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="injured">Injured</SelectItem>
                    <SelectItem value="new">New Players</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterTeam} onValueChange={setFilterTeam}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Teams</SelectItem>
                    <SelectItem value="Lightning Bolts">Lightning Bolts</SelectItem>
                    <SelectItem value="Storm Eagles">Storm Eagles</SelectItem>
                    <SelectItem value="Fire Hawks">Fire Hawks</SelectItem>
                    <SelectItem value="Thunder Cats">Thunder Cats</SelectItem>
                  </SelectContent>
                </Select>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Player
                </Button>
              </div>

              {/* Stats Bar */}
              <div className="flex flex-wrap gap-4 mb-6">
                <Badge variant="outline" className="text-sm">
                  {filteredPlayers.length} players found
                </Badge>
                <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
                  {filteredPlayers.filter(p => p.active).length} active
                </Badge>
                <Badge variant="outline" className="text-gray-600 bg-gray-50 border-gray-200">
                  {filteredPlayers.filter(p => !p.active).length} inactive
                </Badge>
                <Badge variant="outline" className="text-orange-600 bg-orange-50 border-orange-200">
                  {filteredPlayers.filter(p => p.status === 'Injured').length} injured
                </Badge>
              </div>

              {/* Player Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(() => {
                  // Filter active players, sort alphabetically, then slice to create a stable array
                  const activePlayersToShow = filteredPlayers
                    .filter(player => player.active)
                    .sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''))
                    .slice(0, 16);
                  
                  return activePlayersToShow.map((player) => {
                    const playerColorHex = getPlayerColorHex(player.avatarColor);
                    const darkerTextColor = getDarkerColorHex(player.avatarColor);
                    const lighterBgColor = getLighterColorHex(player.avatarColor);
                    const mediumBgColor = getMediumColorHex(player.avatarColor);
                    const isSelected = selectedPlayers.has(player.id);

                    return (
                      <div key={`grid-player-${player.id}`} className="relative">
                        <div 
                          className="absolute top-1/2 right-3 w-6 h-6 rounded flex items-center justify-center cursor-pointer text-white z-10 transform -translate-y-1/2 mr-3 transition-all duration-200"
                          style={{ 
                            backgroundColor: isSelected ? darkerTextColor : 'transparent', 
                            border: isSelected ? 'none' : `2px solid ${darkerTextColor}`
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePlayerSelection(player.id);
                          }}
                        >
                          {isSelected && '✓'}
                        </div>
                        <PlayerBox
                          player={player}
                          size="md"
                          showPositions={true}
                          hasSelect={true}
                          className="shadow-md transition-all duration-200 hover:shadow-lg cursor-pointer"
                          style={{
                            backgroundColor: isSelected ? mediumBgColor : lighterBgColor,
                            borderColor: playerColorHex,
                            color: darkerTextColor
                          }}
                          onClick={() => togglePlayerSelection(player.id)}
                        />
                      </div>
                    );
                  });
                })()}
              </div>

              {filteredPlayers.length > 16 && (
                <div className="text-center pt-4">
                  <Button variant="outline">
                    Load More Players ({filteredPlayers.length - 16} remaining)
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* List View Design - Detailed Player Information */}
        <TabsContent value="list-view" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="h-5 w-5" />
                Detailed List View Design
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* List Header with Sort Options */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="team">Team</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="games">Games Played</SelectItem>
                      <SelectItem value="joined">Date Joined</SelectItem>
                    </SelectContent>
                  </Select>
                  <Badge variant="outline">
                    {filteredPlayers.length} players
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                </div>
              </div>

              {/* Detailed List Items */}
              <div className="space-y-3">
                {filteredPlayers.slice(0, 12).map((player) => (
                  <div 
                    key={player.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={selectedPlayers.has(player.id)}
                        onCheckedChange={() => togglePlayerSelection(player.id)}
                      />
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium" 
                           style={{ backgroundColor: player.avatarColor.replace('bg-', '').includes('500') ? 
                             `var(--${player.avatarColor.replace('bg-', '').replace('-500', '')}-500)` : '#6b7280' }}>
                        {player.firstName[0]}{player.lastName[0]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{player.displayName}</h3>
                          {player.status === 'New' && <Badge variant="secondary" className="bg-blue-100 text-blue-800">New</Badge>}
                          {player.status === 'Injured' && <Badge variant="secondary" className="bg-red-100 text-red-800">Injured</Badge>}
                          {!player.active && <Badge variant="secondary" className="bg-gray-100 text-gray-800">Inactive</Badge>}
                        </div>
                        <div className="text-sm text-gray-600 flex items-center gap-4 mt-1">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {player.positionPreferences.join(', ')}
                          </span>
                          {player.team && (
                            <span className="flex items-center gap-1">
                              <Award className="h-3 w-3" />
                              {player.team}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {player.gamesPlayed} games
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right text-sm">
                        <div className="font-medium">{player.goals} goals</div>
                        <div className="text-gray-500">{player.assists} assists</div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Player
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Player
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Builder Design - Batch Team Assignment */}
        <TabsContent value="team-builder" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Builder Interface
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Available Players */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Available Players</h3>
                    <Badge variant="outline">{filteredPlayers.filter(p => !p.team).length} unassigned</Badge>
                  </div>

                  <div className="mb-4">
                    <Input
                      placeholder="Search available players..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredPlayers.filter(p => !p.team).slice(0, 10).map((player) => (
                      <div key={player.id} className="relative">
                        <div 
                          className="absolute top-2 right-2 w-5 h-5 rounded flex items-center justify-center cursor-pointer z-10 text-white"
                          style={{ backgroundColor: selectedForTeam.has(player.id) ? '#10b981' : 'transparent', border: selectedForTeam.has(player.id) ? 'none' : '2px solid #10b98180' }}
                          onClick={() => toggleTeamSelection(player.id)}
                        >
                          {selectedForTeam.has(player.id) && '✓'}
                        </div>
                        <PlayerBox
                          player={player}
                          size="sm"
                          showPositions={true}
                          className="hover:shadow-md transition-shadow cursor-pointer"
                          style={{
                            borderColor: '#10b981',
                            backgroundColor: selectedForTeam.has(player.id) ? '#10b98125' : '#ffffff'
                          }}
                          onClick={() => toggleTeamSelection(player.id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Team Assignment */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Assign to Team</h3>
                    <Badge variant="outline">{selectedForTeam.size} selected</Badge>
                  </div>

                  <div className="space-y-4">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select target team..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lightning">Lightning Bolts</SelectItem>
                        <SelectItem value="storm">Storm Eagles</SelectItem>
                        <SelectItem value="fire">Fire Hawks</SelectItem>
                        <SelectItem value="thunder">Thunder Cats</SelectItem>
                        <SelectItem value="ice">Ice Dragons</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex gap-2">
                      <Button 
                        className="flex-1" 
                        disabled={selectedForTeam.size === 0}
                      >
                        Add Selected to Team ({selectedForTeam.size})
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setSelectedForTeam(new Set())}
                        disabled={selectedForTeam.size === 0}
                      >
                        Clear
                      </Button>
                    </div>

                    {/* Quick Team Templates */}
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium mb-2">Quick Actions:</p>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Star className="h-4 w-4 mr-2" />
                          Auto-assign by skill level
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Users className="h-4 w-4 mr-2" />
                          Balance teams by position
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <ArrowUpDown className="h-4 w-4 mr-2" />
                          Random team assignment
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Filter Design */}
        <TabsContent value="advanced-filter" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Advanced Filtering System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Filter Panel */}
                <div className="lg:col-span-1 space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Player Status</h4>
                    <div className="space-y-2">
                      {['Active', 'Inactive', 'Injured', 'On Loan', 'New'].map((status) => (
                        <div key={status} className="flex items-center space-x-2">
                          <Checkbox id={status} />
                          <label htmlFor={status} className="text-sm">{status}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Positions</h4>
                    <div className="space-y-2">
                      {['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'].map((position) => (
                        <div key={position} className="flex items-center space-x-2">
                          <Checkbox id={position} />
                          <label htmlFor={position} className="text-sm">{position}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Experience</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="new-players" />
                        <label htmlFor="new-players" className="text-sm">New Players (0-5 games)</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="experienced" />
                        <label htmlFor="experienced" className="text-sm">Experienced (6-15 games)</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="veterans" />
                        <label htmlFor="veterans" className="text-sm">Veterans (16+ games)</label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Team Assignment</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="assigned" />
                        <label htmlFor="assigned" className="text-sm">Assigned to Team</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="unassigned" />
                        <label htmlFor="unassigned" className="text-sm">Unassigned</label>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full">Apply Filters</Button>
                  <Button variant="outline" className="w-full">Clear All</Button>
                </div>

                {/* Results Panel */}
                <div className="lg:col-span-3">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Filtered Results</h3>
                      <p className="text-sm text-gray-600">{filteredPlayers.length} players match your criteria</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant={viewMode === 'grid' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setViewMode('grid')}
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredPlayers
                        .sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''))
                        .slice(0, 12).map((player) => (
                        <PlayerBox
                          key={player.id}
                          player={player}
                          size="md"
                          showPositions={true}
                          className="hover:shadow-lg transition-shadow"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredPlayers
                        .sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''))
                        .slice(0, 12).map((player) => (
                        <div key={player.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-medium">
                              {player.firstName[0]}{player.lastName[0]}
                            </div>
                            <div>
                              <div className="font-medium">{player.displayName}</div>
                              <div className="text-sm text-gray-600">{player.positionPreferences.join(', ')}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={player.active ? 'default' : 'secondary'}>
                              {player.active ? 'Active' : 'Inactive'}
                            </Badge>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Batch Operations Design */}
        <TabsContent value="batch-operations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Batch Operations Interface
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Batch Action Bar */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-blue-900">Batch Operations</h3>
                  <p className="text-sm text-gray-600">
                    {batchSelectedPlayers.size} players selected
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" disabled={batchSelectedPlayers.size === 0}>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                  <Button size="sm" variant="outline" disabled={batchSelectedPlayers.size === 0}>
                    <Users className="h-4 w-4 mr-2" />
                    Assign Team
                  </Button>
                  <Button size="sm" variant="outline" disabled={batchSelectedPlayers.size === 0}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Selected
                  </Button>
                  <Button size="sm" variant="outline" disabled={batchSelectedPlayers.size === 0}>
                    <Settings className="h-4 w-4 mr-2" />
                    Bulk Edit
                  </Button>
                </div>
              </div>

              {/* Quick Selection Tools */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={() => setBatchSelectedPlayers(new Set(filteredPlayers.map(p => p.id)))}>
                  Select All Visible
                </Button>
                <Button variant="outline" size="sm" onClick={() => setBatchSelectedPlayers(new Set(filteredPlayers.filter(p => p.active).map(p => p.id)))}>
                  Select Active Only
                </Button>
                <Button variant="outline" size="sm" onClick={() => setBatchSelectedPlayers(new Set(filteredPlayers.filter(p => !p.team).map(p => p.id)))}>
                  Select Unassigned
                </Button>
                <Button variant="outline" size="sm" onClick={() => setBatchSelectedPlayers(new Set())}>
                  Clear Selection
                </Button>
              </div>

              {/* Player Grid with Batch Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredPlayers
                  .sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''))
                  .slice(0, 16).map((player) => (
                  <div key={`batch-player-${player.id}`} className="relative">
                    <div 
                      className="absolute top-2 right-2 w-6 h-6 rounded flex items-center justify-center cursor-pointer z-10 text-white transition-all"
                      style={{ 
                        backgroundColor: batchSelectedPlayers.has(player.id) ? '#3b82f6' : 'transparent', 
                        border: batchSelectedPlayers.has(player.id) ? 'none' : '2px solid #3b82f680' 
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBatchSelection(player.id);
                      }}
                    >
                      {batchSelectedPlayers.has(player.id) && '✓'}
                    </div>
                    <PlayerBox
                      player={player}
                      size="md"
                      showPositions={true}
                      className="hover:shadow-lg transition-all duration-200 cursor-pointer"
                      style={{
                        backgroundColor: batchSelectedPlayers.has(player.id) ? '#3b82f615' : '#ffffff',
                        borderColor: batchSelectedPlayers.has(player.id) ? '#3b82f6' : '#e5e7eb'
                      }}
                      onClick={() => toggleBatchSelection(player.id)}
                    />
                  </div>
                ))}
              </div>

              {/* Batch Operation Panels */}
              {batchSelectedPlayers.size > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Team Assignment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select team..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lightning">Lightning Bolts</SelectItem>
                          <SelectItem value="storm">Storm Eagles</SelectItem>
                          <SelectItem value="fire">Fire Hawks</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button className="w-full">
                        Assign {batchSelectedPlayers.size} players to team
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Status Update</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Update status..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Set as Active</SelectItem>
                          <SelectItem value="inactive">Set as Inactive</SelectItem>
                          <SelectItem value="injured">Mark as Injured</SelectItem>
                          <SelectItem value="loan">Put on Loan</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button className="w-full">
                        Update {batchSelectedPlayers.size} players
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Player Cards Design - Detailed Information */}
        <TabsContent value="player-cards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Detailed Player Cards View
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlayers
                  .sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''))
                  .slice(0, 9).map((player) => (
                  <Card key={player.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium"
                            style={{ backgroundColor: player.avatarColor.includes('bg-') ? 
                              `hsl(var(--${player.avatarColor.replace('bg-', '').replace('-500', '')}))` : '#6b7280' }}
                          >
                            {player.firstName[0]}{player.lastName[0]}
                          </div>
                          <div>
                            <h3 className="font-semibold">{player.displayName}</h3>
                            <div className="flex gap-1 mt-1">
                              {player.positionPreferences.map(pos => (
                                <Badge key={pos} variant="secondary" className="text-xs">
                                  {pos}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>Edit Profile</DropdownMenuItem>
                            <DropdownMenuItem>View Stats</DropdownMenuItem>
                            <DropdownMenuItem>Send Message</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Status</div>
                          <Badge variant={player.active ? 'default' : 'secondary'} className="text-xs">
                            {player.status}
                          </Badge>
                        </div>
                        <div>
                          <div className="text-gray-600">Team</div>
                          <div className="font-medium">{player.team || 'Unassigned'}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Games</div>
                          <div className="font-medium">{player.gamesPlayed}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Goals</div>
                          <div className="font-medium">{player.goals}</div>
                        </div>
                      </div>

                      <div className="pt-2 border-t">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Mail className="h-3 w-3" />
                          {player.email}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                          <Phone className="h-3 w-3" />
                          {player.phone}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                          <MapPin className="h-3 w-3" />
                          {player.address}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Mail className="h-3 w-3 mr-1" />
                          Contact
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics View Design */}
        <TabsContent value="analytics-view" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MoreHorizontal className="h-5 w-5" />
                Player Analytics Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600">{allPlayers.length}</div>
                    <div className="text-sm text-gray-600">Total Players</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">{allPlayers.filter(p => p.active).length}</div>
                    <div className="text-sm text-gray-600">Active Players</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-orange-600">{allPlayers.filter(p => !p.team).length}</div>
                    <div className="text-sm text-gray-600">Unassigned</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-purple-600">{allPlayers.filter(p => p.status === 'New').length}</div>
                    <div className="text-sm text-gray-600">New Players</div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Performers */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Top Scorers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {allPlayers
                        .sort((a, b) => b.goals - a.goals)
                        .slice(0, 5)
                        .map((player, index) => (
                          <div key={player.id} className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-800 flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm">{player.displayName}</div>
                              <div className="text-xs text-gray-600">{player.positionPreferences.join(', ')}</div>
                            </div>
                            <div className="text-sm font-medium">{player.goals} goals</div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Most Experienced</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {allPlayers
                        .sort((a, b) => b.gamesPlayed - a.gamesPlayed)
                        .slice(0, 5)
                        .map((player, index) => (
                          <div key={player.id} className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm">{player.displayName}</div>
                              <div className="text-xs text-gray-600">{player.positionPreferences.join(', ')}</div>
                            </div>
                            <div className="text-sm font-medium">{player.gamesPlayed} games</div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Position Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Position Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 md:grid-cols-7 gap-4">
                    {['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'].map(position => {
                      const count = allPlayers.filter(p => p.positionPreferences.includes(position)).length;
                      return (
                        <div key={position} className="text-center">
                          <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-2">
                            <span className="text-lg font-bold text-blue-800">{count}</span>
                          </div>
                          <div className="text-sm font-medium">{position}</div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mobile Optimized Design */}
        <TabsContent value="mobile-optimized" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Mobile-First Player Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search players..."
                  className="pl-10 h-12 text-base"
                />
              </div>

              {/* Quick Filters */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                <Badge variant="outline" className="whitespace-nowrap">All Players</Badge>
                <Badge variant="default" className="whitespace-nowrap">Active</Badge>
                <Badge variant="outline" className="whitespace-nowrap">Inactive</Badge>
                <Badge variant="outline" className="whitespace-nowrap">New</Badge>
                <Badge variant="outline" className="whitespace-nowrap">Unassigned</Badge>
              </div>

              {/* Mobile Player List */}
              <div className="space-y-3">
                {filteredPlayers
                  .sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''))
                  .slice(0, 10).map((player) => (
                  <div key={player.id} className="flex items-center gap-3 p-3 border rounded-lg active:bg-gray-50">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0"
                      style={{ backgroundColor: '#6b7280' }}
                    >
                      {player.firstName[0]}{player.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium truncate">{player.displayName}</h3>
                        {!player.active && (
                          <Badge variant="secondary" className="text-xs">Inactive</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 truncate">
                        {player.positionPreferences.join(', ')} • {player.gamesPlayed} games
                      </div>
                      {player.team && (
                        <div className="text-xs text-blue-600">{player.team}</div>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" className="flex-shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Mobile Action Button */}
              <div className="fixed bottom-6 right-6 z-50">
                <Button size="lg" className="rounded-full h-14 w-14 shadow-lg">
                  <UserPlus className="h-6 w-6" />
                </Button>
              </div>

              {/* Load More */}
              <Button variant="outline" className="w-full h-12">
                Load More Players
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
}