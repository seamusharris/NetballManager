
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  ArrowUpDown, ArrowUp, ArrowDown, Search, Filter, 
  MoreHorizontal, Eye, Edit, Star, Trophy
} from 'lucide-react';

export default function TableExamples() {
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');

  const samplePlayers = [
    { id: 1, name: 'Sarah Johnson', position: 'GA', games: 12, goals: 89, accuracy: 78, rating: 8.5, status: 'Active' },
    { id: 2, name: 'Emma Wilson', position: 'C', games: 11, goals: 23, accuracy: 85, rating: 8.2, status: 'Active' },
    { id: 3, name: 'Kate Brown', position: 'GK', games: 10, goals: 2, accuracy: 92, rating: 8.8, status: 'Injured' },
    { id: 4, name: 'Lily Chen', position: 'WA', games: 9, goals: 45, accuracy: 71, rating: 7.9, status: 'Active' },
    { id: 5, name: 'Amy Thompson', position: 'WD', games: 12, goals: 8, accuracy: 88, rating: 8.1, status: 'Active' }
  ];

  const sampleGames = [
    { id: 1, date: '2025-06-14', opponent: 'Lightning Bolts', venue: 'Court 1', result: 'W 45-32', quarter1: '12-8', quarter2: '11-9', quarter3: '10-7', quarter4: '12-8' },
    { id: 2, date: '2025-06-07', opponent: 'Thunder Cats', venue: 'Court 2', result: 'L 28-41', quarter1: '8-12', quarter2: '7-11', quarter3: '6-9', quarter4: '7-9' },
    { id: 3, date: '2025-05-31', opponent: 'Storm Eagles', venue: 'Away', result: 'W 38-35', quarter1: '10-9', quarter2: '9-8', quarter3: '8-10', quarter4: '11-8' },
    { id: 4, date: '2025-05-24', opponent: 'Fire Hawks', venue: 'Court 1', result: 'W 42-29', quarter1: '11-7', quarter2: '12-6', quarter3: '9-8', quarter4: '10-8' }
  ];

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />;
    return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  return (
    <PageTemplate 
      title="Table Examples" 
      breadcrumbs={[
        { label: "Component Examples", href: "/component-examples" },
        { label: "Table Examples" }
      ]}
    >
      <div className="space-y-8">
        <Helmet>
          <title>Table Examples - Netball App</title>
        </Helmet>

        <div className="prose max-w-none">
          <p className="text-lg text-gray-700">
            Different table layouts, sorting patterns, filtering options, and data presentation styles for various use cases.
          </p>
        </div>

        {/* Basic Table */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Basic Table Layouts</h2>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Simple Data Table</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Games</TableHead>
                    <TableHead>Goals</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {samplePlayers.map(player => (
                    <TableRow key={player.id}>
                      <TableCell className="font-medium">{player.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{player.position}</Badge>
                      </TableCell>
                      <TableCell>{player.games}</TableCell>
                      <TableCell>{player.goals}</TableCell>
                      <TableCell>
                        <Badge variant={player.status === 'Active' ? 'default' : 'destructive'}>
                          {player.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>

        {/* Sortable Table */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Sortable Tables</h2>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Player Statistics - Sortable Columns</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('name')} className="h-auto p-0 hover:bg-transparent">
                        Player Name {getSortIcon('name')}
                      </Button>
                    </TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('games')} className="h-auto p-0 hover:bg-transparent">
                        Games {getSortIcon('games')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('goals')} className="h-auto p-0 hover:bg-transparent">
                        Goals {getSortIcon('goals')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('accuracy')} className="h-auto p-0 hover:bg-transparent">
                        Accuracy {getSortIcon('accuracy')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('rating')} className="h-auto p-0 hover:bg-transparent">
                        Rating {getSortIcon('rating')}
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {samplePlayers.map(player => (
                    <TableRow key={player.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {player.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="font-medium">{player.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{player.position}</Badge>
                      </TableCell>
                      <TableCell>{player.games}</TableCell>
                      <TableCell className="font-bold">{player.goals}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{player.accuracy}%</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${player.accuracy}%` }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-bold">{player.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>

        {/* Filterable Table */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Tables with Filtering</h2>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Games History - With Search & Filters</CardTitle>
              <div className="flex space-x-4 mt-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <Input 
                    placeholder="Search opponents..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Opponent</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead>Q1</TableHead>
                    <TableHead>Q2</TableHead>
                    <TableHead>Q3</TableHead>
                    <TableHead>Q4</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleGames.map(game => (
                    <TableRow key={game.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{game.date}</TableCell>
                      <TableCell>{game.opponent}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{game.venue}</Badge>
                      </TableCell>
                      <TableCell className="text-center">{game.quarter1}</TableCell>
                      <TableCell className="text-center">{game.quarter2}</TableCell>
                      <TableCell className="text-center">{game.quarter3}</TableCell>
                      <TableCell className="text-center">{game.quarter4}</TableCell>
                      <TableCell>
                        <Badge variant={game.result.startsWith('W') ? 'default' : 'destructive'}>
                          {game.result}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>

        {/* Compact Table */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Compact Table Styles</h2>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Dense Information Display</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="h-8">
                      <TableHead className="py-2">Rank</TableHead>
                      <TableHead className="py-2">Player</TableHead>
                      <TableHead className="py-2">Pos</TableHead>
                      <TableHead className="py-2">GP</TableHead>
                      <TableHead className="py-2">G</TableHead>
                      <TableHead className="py-2">A</TableHead>
                      <TableHead className="py-2">Acc%</TableHead>
                      <TableHead className="py-2">Rtg</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {samplePlayers.map((player, index) => (
                      <TableRow key={player.id} className="h-10 hover:bg-muted/30">
                        <TableCell className="py-2">
                          <div className="flex items-center space-x-1">
                            <span className="font-bold">{index + 1}</span>
                            {index < 3 && <Trophy className="w-3 h-3 text-yellow-500" />}
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {player.name.split(' ')[0][0]}
                            </div>
                            <span className="font-medium">{player.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            {player.position}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2">{player.games}</TableCell>
                        <TableCell className="py-2 font-bold">{player.goals}</TableCell>
                        <TableCell className="py-2">{Math.floor(player.goals * 0.3)}</TableCell>
                        <TableCell className="py-2">{player.accuracy}%</TableCell>
                        <TableCell className="py-2">
                          <div className="flex items-center space-x-1">
                            <span className="font-bold">{player.rating}</span>
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Responsive Table */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Responsive Table Patterns</h2>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Mobile-Friendly Table (Card Layout on Small Screens)</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Player</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Games</TableHead>
                      <TableHead>Goals</TableHead>
                      <TableHead>Accuracy</TableHead>
                      <TableHead>Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {samplePlayers.slice(0, 3).map(player => (
                      <TableRow key={player.id}>
                        <TableCell className="font-medium">{player.name}</TableCell>
                        <TableCell><Badge variant="outline">{player.position}</Badge></TableCell>
                        <TableCell>{player.games}</TableCell>
                        <TableCell>{player.goals}</TableCell>
                        <TableCell>{player.accuracy}%</TableCell>
                        <TableCell>{player.rating}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {samplePlayers.slice(0, 3).map(player => (
                  <div key={player.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                          {player.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-medium">{player.name}</div>
                          <Badge variant="outline" className="text-xs">{player.position}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{player.rating}</div>
                        <div className="text-xs text-gray-500">Rating</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Games</div>
                        <div className="font-medium">{player.games}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Goals</div>
                        <div className="font-medium">{player.goals}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Accuracy</div>
                        <div className="font-medium">{player.accuracy}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Table Guidelines */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Table Design Guidelines</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div>
                  <h4 className="font-semibold mb-3">Data Presentation</h4>
                  <ul className="text-sm space-y-2 text-gray-600">
                    <li>• Use consistent alignment (numbers right-aligned)</li>
                    <li>• Highlight important data with typography</li>
                    <li>• Group related columns visually</li>
                    <li>• Use badges for categorical data</li>
                    <li>• Include progress bars for percentages</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Sorting & Filtering</h4>
                  <ul className="text-sm space-y-2 text-gray-600">
                    <li>• Make sortable columns clearly identifiable</li>
                    <li>• Show current sort state with icons</li>
                    <li>• Provide search for large datasets</li>
                    <li>• Include filtering options for categories</li>
                    <li>• Maintain filter state during navigation</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Responsive Design</h4>
                  <ul className="text-sm space-y-2 text-gray-600">
                    <li>• Use horizontal scroll for wide tables</li>
                    <li>• Convert to cards on mobile devices</li>
                    <li>• Prioritize essential columns for small screens</li>
                    <li>• Consider collapsible row details</li>
                    <li>• Maintain usability across all screen sizes</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">User Experience</h4>
                  <ul className="text-sm space-y-2 text-gray-600">
                    <li>• Provide hover states for interactive rows</li>
                    <li>• Use loading states for async operations</li>
                    <li>• Include pagination for large datasets</li>
                    <li>• Make row actions easily accessible</li>
                    <li>• Show empty states when no data available</li>
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
