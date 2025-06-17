
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Star, Clock, Trophy, Users, Calendar, MapPin, 
  Eye, Edit, MoreHorizontal, ChevronRight, Phone, Mail
} from 'lucide-react';

export default function ListExamples() {
  const [selectedItem, setSelectedItem] = useState<number | null>(null);

  const samplePlayers = [
    { id: 1, name: 'Sarah Johnson', position: 'GA', email: 'sarah.j@email.com', phone: '0400 123 456', games: 12, goals: 89, rating: 8.5, status: 'Active', lastSeen: '2 hours ago' },
    { id: 2, name: 'Emma Wilson', position: 'C', email: 'emma.w@email.com', phone: '0400 234 567', games: 11, goals: 23, rating: 8.2, status: 'Active', lastSeen: '1 day ago' },
    { id: 3, name: 'Kate Brown', position: 'GK', email: 'kate.b@email.com', phone: '0400 345 678', games: 10, goals: 2, rating: 8.8, status: 'Injured', lastSeen: '3 days ago' },
    { id: 4, name: 'Lily Chen', position: 'WA', email: 'lily.c@email.com', phone: '0400 456 789', games: 9, goals: 45, rating: 7.9, status: 'Active', lastSeen: '5 hours ago' },
    { id: 5, name: 'Amy Thompson', position: 'WD', email: 'amy.t@email.com', phone: '0400 567 890', games: 12, goals: 8, rating: 8.1, status: 'Active', lastSeen: '1 hour ago' }
  ];

  const sampleGames = [
    { id: 1, date: '2025-06-14', time: '2:00 PM', opponent: 'Lightning Bolts', venue: 'Court 1', status: 'Upcoming', round: 'R13' },
    { id: 2, date: '2025-06-07', time: '3:30 PM', opponent: 'Thunder Cats', venue: 'Court 2', status: 'Completed', round: 'R12', result: 'L 28-41' },
    { id: 3, date: '2025-05-31', time: '1:00 PM', opponent: 'Storm Eagles', venue: 'Away Ground', status: 'Completed', round: 'R11', result: 'W 38-35' },
    { id: 4, date: '2025-05-24', time: '4:00 PM', opponent: 'Fire Hawks', venue: 'Court 1', status: 'Completed', round: 'R10', result: 'W 42-29' }
  ];

  const sampleActivity = [
    { id: 1, type: 'goal', player: 'Sarah Johnson', action: 'scored 5 goals', time: '2 hours ago', icon: Trophy },
    { id: 2, type: 'game', player: 'Team', action: 'completed game vs Thunder Cats', time: '1 day ago', icon: Calendar },
    { id: 3, type: 'player', player: 'Emma Wilson', action: 'updated position preferences', time: '2 days ago', icon: Users },
    { id: 4, type: 'injury', player: 'Kate Brown', action: 'marked as injured', time: '3 days ago', icon: Clock }
  ];

  return (
    <PageTemplate 
      title="List Examples" 
      breadcrumbs={[
        { label: "Component Examples", href: "/component-examples" },
        { label: "List Examples" }
      ]}
    >
      <div className="space-y-8">
        <Helmet>
          <title>List Examples - Netball App</title>
        </Helmet>

        <div className="prose max-w-none">
          <p className="text-lg text-gray-700">
            Various list styles including simple lists, detailed cards, grid arrangements, and interactive list patterns.
          </p>
        </div>

        {/* Simple Lists */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Simple List Styles</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic List */}
            <Card>
              <CardHeader>
                <CardTitle>Basic List with Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {samplePlayers.slice(0, 4).map(player => (
                    <div key={player.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {player.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-medium">{player.name}</div>
                          <div className="text-sm text-gray-500">{player.position}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={player.status === 'Active' ? 'default' : 'destructive'} className="text-xs">
                          {player.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* List with Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>List with Rich Metadata</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {samplePlayers.slice(0, 4).map(player => (
                    <div key={player.id} className="flex items-center justify-between p-3 border rounded-lg hover:border-blue-300 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {player.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-medium">{player.name}</div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{player.position}</span>
                            <span>•</span>
                            <span>{player.games} games</span>
                            <span>•</span>
                            <span className="flex items-center">
                              <Star className="w-3 h-3 text-yellow-500 mr-1 fill-current" />
                              {player.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{player.goals}</div>
                        <div className="text-xs text-gray-500">Goals</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Detailed Card Lists */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Detailed Card Lists</h2>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Player Contact List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {samplePlayers.map(player => (
                  <div key={player.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-blue-500 text-white font-bold">
                            {player.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold">{player.name}</h3>
                            <Badge variant="outline">{player.position}</Badge>
                            <Badge variant={player.status === 'Active' ? 'default' : 'destructive'} className="text-xs">
                              {player.status}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <Mail className="w-4 h-4" />
                              <span>{player.email}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4" />
                              <span>{player.phone}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4" />
                              <span>Last seen {player.lastSeen}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-1">
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
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Games Played</div>
                          <div className="font-bold">{player.games}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Goals Scored</div>
                          <div className="font-bold">{player.goals}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Player Rating</div>
                          <div className="font-bold flex items-center">
                            <Star className="w-3 h-3 text-yellow-500 mr-1 fill-current" />
                            {player.rating}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Grid Lists */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Grid List Layouts</h2>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Player Grid - Compact Cards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {samplePlayers.map(player => (
                  <div key={player.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {player.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{player.name}</div>
                        <div className="text-sm text-gray-500">{player.position}</div>
                      </div>
                      <Badge variant={player.status === 'Active' ? 'default' : 'destructive'} className="text-xs">
                        {player.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-gray-500">Games</div>
                        <div className="font-bold">{player.games}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Goals</div>
                        <div className="font-bold">{player.goals}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Rating</div>
                        <div className="font-bold flex items-center">
                          <Star className="w-3 h-3 text-yellow-500 mr-1 fill-current" />
                          {player.rating}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Last Seen</div>
                        <div className="font-medium">{player.lastSeen}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Interactive Lists */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Interactive List Patterns</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Selectable List */}
            <Card>
              <CardHeader>
                <CardTitle>Selectable List Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {samplePlayers.slice(0, 4).map(player => (
                    <div 
                      key={player.id} 
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedItem === player.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedItem(selectedItem === player.id ? null : player.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {player.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="font-medium">{player.name}</div>
                            <div className="text-sm text-gray-500">{player.position} • {player.games} games</div>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          selectedItem === player.id 
                            ? 'border-blue-500 bg-blue-500' 
                            : 'border-gray-300'
                        }`}>
                          {selectedItem === player.id && (
                            <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Activity Feed List */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Feed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sampleActivity.map(activity => {
                    const IconComponent = activity.icon;
                    return (
                      <div key={activity.id} className="flex space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <IconComponent className="w-4 h-4 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm">
                            <span className="font-medium">{activity.player}</span>
                            {' '}
                            <span className="text-gray-600">{activity.action}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{activity.time}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Game Schedule List */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Specialized List Examples</h2>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Games Schedule List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sampleGames.map(game => (
                  <div key={game.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                          {game.round}
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold">{game.opponent}</div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{game.date}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{game.time}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{game.venue}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {game.result && (
                        <Badge variant={game.result.startsWith('W') ? 'default' : 'destructive'}>
                          {game.result}
                        </Badge>
                      )}
                      <Badge variant={game.status === 'Upcoming' ? 'secondary' : 'outline'}>
                        {game.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* List Guidelines */}
        <section>
          <h2 className="text-2xl font-bold mb-6">List Design Guidelines</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div>
                  <h4 className="font-semibold mb-3">Visual Hierarchy</h4>
                  <ul className="text-sm space-y-2 text-gray-600">
                    <li>• Use consistent spacing between list items</li>
                    <li>• Highlight primary information with typography</li>
                    <li>• Group related information visually</li>
                    <li>• Use avatars or icons for visual recognition</li>
                    <li>• Maintain consistent alignment patterns</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Interaction Patterns</h4>
                  <ul className="text-sm space-y-2 text-gray-600">
                    <li>• Provide clear hover states for interactive items</li>
                    <li>• Include selection states for multi-select lists</li>
                    <li>• Make action buttons easily accessible</li>
                    <li>• Use consistent interaction patterns throughout</li>
                    <li>• Provide keyboard navigation support</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Content Organization</h4>
                  <ul className="text-sm space-y-2 text-gray-600">
                    <li>• Prioritize most important information</li>
                    <li>• Use secondary text for metadata</li>
                    <li>• Include status indicators and badges</li>
                    <li>• Consider progressive disclosure for details</li>
                    <li>• Maintain scannable content structure</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Responsive Design</h4>
                  <ul className="text-sm space-y-2 text-gray-600">
                    <li>• Adapt grid layouts for different screen sizes</li>
                    <li>• Stack information vertically on mobile</li>
                    <li>• Maintain touch-friendly tap targets</li>
                    <li>• Consider swipe gestures for mobile actions</li>
                    <li>• Optimize content for readability on all devices</li>
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
