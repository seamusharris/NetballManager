
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Filter, X, User, Trophy, Calendar } from 'lucide-react';

export default function SearchExamples() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const players = [
    { id: 1, name: 'Abbey N', position: 'GS', goals: 28 },
    { id: 2, name: 'Ava', position: 'WA', intercepts: 15 },
    { id: 3, name: 'Emily', position: 'GK', saves: 18 },
    { id: 4, name: 'Evie', position: 'C', assists: 34 }
  ];

  const games = [
    { id: 1, opponent: 'Deep Creek', date: '2025-06-07', result: 'Win' },
    { id: 2, opponent: 'Doncaster', date: '2025-05-31', result: 'Loss' },
    { id: 3, opponent: 'Donvale', date: '2025-05-24', result: 'Win' }
  ];

  const filteredPlayers = players.filter(player => 
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageTemplate
      title="Search Examples"
      subtitle="Various search patterns, filters, and result displays"
      breadcrumbs={[
        { label: 'Component Examples', href: '/component-examples' },
        { label: 'Search Examples' }
      ]}
    >
      <Helmet>
        <title>Search Examples | Team Manager</title>
      </Helmet>

      <div className="space-y-8">
        {/* Basic Search */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Basic Search</h2>
          <Card>
            <CardHeader>
              <CardTitle>Simple Search Input</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search players..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                {searchTerm && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      {filteredPlayers.length} result(s) for "{searchTerm}"
                    </p>
                    <div className="space-y-2">
                      {filteredPlayers.map(player => (
                        <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <User className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="font-medium">{player.name}</p>
                              <p className="text-sm text-gray-600">{player.position}</p>
                            </div>
                          </div>
                          <Badge variant="outline">{player.position}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Search with Filters */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Search with Filters</h2>
          <Card>
            <CardHeader>
              <CardTitle>Advanced Search Interface</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search games, players, or opponents..."
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="cursor-pointer">
                    Position: All
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                  <Badge variant="secondary" className="cursor-pointer">
                    Season: 2025
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                  <Badge variant="secondary" className="cursor-pointer">
                    Status: Active
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Command Palette Style Search */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Command Palette Search</h2>
          <Card>
            <CardHeader>
              <CardTitle>Quick Access Search</CardTitle>
            </CardHeader>
            <CardContent>
              <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-gray-500">
                    <Search className="w-4 h-4 mr-2" />
                    Search for players, games, statistics...
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Type to search..." />
                    <CommandList>
                      <CommandEmpty>No results found.</CommandEmpty>
                      <CommandGroup heading="Players">
                        {players.map(player => (
                          <CommandItem key={player.id} onSelect={() => setIsOpen(false)}>
                            <User className="w-4 h-4 mr-2" />
                            <span>{player.name} - {player.position}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                      <CommandGroup heading="Recent Games">
                        {games.map(game => (
                          <CommandItem key={game.id} onSelect={() => setIsOpen(false)}>
                            <Trophy className="w-4 h-4 mr-2" />
                            <span>vs {game.opponent} - {game.result}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>
        </section>

        {/* Search Results Grid */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Search Results Display</h2>
          <Card>
            <CardHeader>
              <CardTitle>Categorized Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Players (4)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {players.map(player => (
                      <div key={player.id} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{player.name}</p>
                            <p className="text-sm text-gray-600">{player.position}</p>
                          </div>
                          <Badge variant="outline">{player.position}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Trophy className="w-4 h-4 mr-2" />
                    Recent Games (3)
                  </h3>
                  <div className="space-y-2">
                    {games.map(game => (
                      <div key={game.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="font-medium">vs {game.opponent}</p>
                            <p className="text-sm text-gray-600">{game.date}</p>
                          </div>
                        </div>
                        <Badge variant={game.result === 'Win' ? 'default' : 'destructive'}>
                          {game.result}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Live Search */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Live Search with Suggestions</h2>
          <Card>
            <CardHeader>
              <CardTitle>Real-time Search Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Start typing to see suggestions..."
                    className="pl-10"
                  />
                </div>
                
                <div className="border rounded-lg p-4 bg-gray-50">
                  <p className="text-sm text-gray-600 mb-3">Popular searches:</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-200">
                      Goal scorers
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-200">
                      Last game stats
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-200">
                      Team performance
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-200">
                      Upcoming games
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </PageTemplate>
  );
}
