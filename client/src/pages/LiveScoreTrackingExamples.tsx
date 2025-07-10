
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageTemplate from '@/components/layout/PageTemplate';
import { Clock, Target, Users, TrendingUp, Play, Pause, RotateCcw } from 'lucide-react';

// Sample game flow data
const gameFlowData = [
  // Quarter 1
  { id: 1, quarter: 1, time: '14:32', type: 'goal_for', player: 'Abbey N', position: 'GS', team: 'home' },
  { id: 2, quarter: 1, time: '13:45', type: 'goal_against', player: 'S. Miller', position: 'GA', team: 'away' },
  { id: 3, quarter: 1, time: '12:58', type: 'goal_for', player: 'Sarah K', position: 'GA', team: 'home' },
  { id: 4, quarter: 1, time: '11:22', type: 'miss', player: 'Abbey N', position: 'GS', team: 'home' },
  { id: 5, quarter: 1, time: '10:15', type: 'goal_against', player: 'K. Johnson', position: 'GS', team: 'away' },
  { id: 6, quarter: 1, time: '9:43', type: 'goal_for', player: 'Emma L', position: 'GA', team: 'home' },
  { id: 7, quarter: 1, time: '8:29', type: 'goal_for', player: 'Abbey N', position: 'GS', team: 'home' },
  { id: 8, quarter: 1, time: '7:18', type: 'goal_against', player: 'S. Miller', position: 'GA', team: 'away' },

  // Quarter 2
  { id: 9, quarter: 2, time: '14:55', type: 'goal_for', player: 'Sarah K', position: 'GA', team: 'home' },
  { id: 10, quarter: 2, time: '13:12', type: 'goal_for', player: 'Abbey N', position: 'GS', team: 'home' },
  { id: 11, quarter: 2, time: '12:34', type: 'goal_against', player: 'K. Johnson', position: 'GS', team: 'away' },
  { id: 12, quarter: 2, time: '11:48', type: 'miss', player: 'Emma L', position: 'GA', team: 'home' },
  { id: 13, quarter: 2, time: '10:56', type: 'goal_for', player: 'Abbey N', position: 'GS', team: 'home' },
  { id: 14, quarter: 2, time: '9:23', type: 'goal_against', player: 'S. Miller', position: 'GA', team: 'away' },
  { id: 15, quarter: 2, time: '8:45', type: 'goal_for', player: 'Sarah K', position: 'GA', team: 'home' },

  // Quarter 3
  { id: 16, quarter: 3, time: '14:21', type: 'goal_against', player: 'K. Johnson', position: 'GS', team: 'away' },
  { id: 17, quarter: 3, time: '13:38', type: 'goal_for', player: 'Abbey N', position: 'GS', team: 'home' },
  { id: 18, quarter: 3, time: '12:17', type: 'goal_for', player: 'Emma L', position: 'GA', team: 'home' },
  { id: 19, quarter: 3, time: '11:52', type: 'goal_against', player: 'S. Miller', position: 'GA', team: 'away' },
  { id: 20, quarter: 3, time: '10:33', type: 'miss', player: 'Sarah K', position: 'GA', team: 'home' },
  { id: 21, quarter: 3, time: '9:44', type: 'goal_for', player: 'Abbey N', position: 'GS', team: 'home' },

  // Quarter 4
  { id: 22, quarter: 4, time: '14:08', type: 'goal_for', player: 'Sarah K', position: 'GA', team: 'home' },
  { id: 23, quarter: 4, time: '13:15', type: 'goal_against', player: 'K. Johnson', position: 'GS', team: 'away' },
  { id: 24, quarter: 4, time: '12:42', type: 'goal_for', player: 'Abbey N', position: 'GS', team: 'home' },
  { id: 25, quarter: 4, time: '11:59', type: 'goal_for', player: 'Emma L', position: 'GA', team: 'home' },
  { id: 26, quarter: 4, time: '10:28', type: 'goal_against', player: 'S. Miller', position: 'GA', team: 'away' },
  { id: 27, quarter: 4, time: '9:15', type: 'miss', player: 'Abbey N', position: 'GS', team: 'home' },
  { id: 28, quarter: 4, time: '8:33', type: 'goal_for', player: 'Sarah K', position: 'GA', team: 'home' }
];

const LiveScoreTrackingExamples = () => {
  const [selectedQuarter, setSelectedQuarter] = useState<number | 'all'>('all');
  const [isLive, setIsLive] = useState(false);

  // Calculate scores by quarter
  const quarterScores = gameFlowData.reduce((acc, event) => {
    if (!acc[event.quarter]) {
      acc[event.quarter] = { home: 0, away: 0 };
    }
    if (event.type === 'goal_for') {
      acc[event.quarter].home++;
    } else if (event.type === 'goal_against') {
      acc[event.quarter].away++;
    }
    return acc;
  }, {} as Record<number, { home: number; away: number }>);

  // Calculate running totals
  const runningTotals = { home: 0, away: 0 };
  Object.keys(quarterScores).forEach(q => {
    const quarter = parseInt(q);
    runningTotals.home += quarterScores[quarter].home;
    runningTotals.away += quarterScores[quarter].away;
  });

  const filteredEvents = selectedQuarter === 'all' 
    ? gameFlowData 
    : gameFlowData.filter(event => event.quarter === selectedQuarter);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'goal_for':
        return <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold border-2 border-green-700">GF</div>;
      case 'goal_against':
        return <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold border-2 border-red-700">GA</div>;
      case 'miss':
        return <div className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center text-sm font-bold border-2 border-gray-600">M</div>;
      default:
        return <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold border-2 border-blue-700">?</div>;
    }
  };

  const getEventDescription = (event: any) => {
    switch (event.type) {
      case 'goal_for':
        return `Goal by ${event.player} (${event.position})`;
      case 'goal_against':
        return `Goal against by ${event.player} (${event.position})`;
      case 'miss':
        return `Miss by ${event.player} (${event.position})`;
      default:
        return `Event by ${event.player}`;
    }
  };

  return (
    <PageTemplate
      title="Live Score Tracking Examples"
      subtitle="Real-time game flow tracking with badge-style event indicators"
      breadcrumbs={[
        { label: 'Component Examples', href: '/component-examples' },
        { label: 'Live Score Tracking Examples' }
      ]}
    >
      <Helmet>
        <title>Live Score Tracking Examples | Team Manager</title>
      </Helmet>

      <div className="space-y-8">
        <Tabs defaultValue="modern" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="modern">Modern Design</TabsTrigger>
            <TabsTrigger value="compact">Compact View</TabsTrigger>
            <TabsTrigger value="timeline">Game Flow Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="modern" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  WNC Emus vs Deep Creek - Round 12
                  {isLive && <Badge className="bg-red-500 animate-pulse">LIVE</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-6xl font-bold text-green-600 mb-2">
                    {runningTotals.home} - {runningTotals.away}
                  </div>
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant={isLive ? "destructive" : "default"}
                      onClick={() => setIsLive(!isLive)}
                      className="flex items-center gap-2"
                    >
                      {isLive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      {isLive ? 'Pause Game' : 'Start Game'}
                    </Button>
                    <Badge variant="outline" className="text-lg px-4 py-2">Q4 - 8:33</Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[1, 2, 3, 4].map(quarter => (
                    <div key={quarter} className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="font-semibold text-gray-600 mb-2">Q{quarter}</div>
                      <div className="text-2xl font-bold mb-2">
                        {quarterScores[quarter]?.home || 0}-{quarterScores[quarter]?.away || 0}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mb-4">
                  <Button
                    variant={selectedQuarter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedQuarter('all')}
                  >
                    All Quarters
                  </Button>
                  {[1, 2, 3, 4].map(quarter => (
                    <Button
                      key={quarter}
                      variant={selectedQuarter === quarter ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedQuarter(quarter)}
                    >
                      Q{quarter}
                    </Button>
                  ))}
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredEvents.reverse().map(event => (
                    <div key={event.id} className="flex items-center gap-3 p-3 bg-white border rounded-lg">
                      {getEventIcon(event.type)}
                      <div className="flex-1">
                        <div className="font-medium">{getEventDescription(event)}</div>
                        <div className="text-sm text-gray-500">Q{event.quarter} - {event.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Compact Live Tracker
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-green-600">WNC Emus ({runningTotals.home})</h3>
                    <div className="flex flex-wrap gap-1">
                      {gameFlowData.filter(e => e.type === 'goal_for').map(event => (
                        <div key={event.id} className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold border border-green-700">
                          {event.quarter}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-semibold text-red-600">Deep Creek ({runningTotals.away})</h3>
                    <div className="flex flex-wrap gap-1">
                      {gameFlowData.filter(e => e.type === 'goal_against').map(event => (
                        <div key={event.id} className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold border border-red-700">
                          {event.quarter}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <h3 className="font-semibold text-gray-600">Misses</h3>
                  <div className="flex flex-wrap gap-1">
                    {gameFlowData.filter(e => e.type === 'miss').map(event => (
                      <div key={event.id} className="w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center text-xs font-bold border border-gray-600">
                        {event.quarter}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Complete Game Flow Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  <div className="space-y-4">
                    {gameFlowData.map((event, index) => (
                      <div key={event.id} className="relative flex items-center gap-4">
                        <div className="relative z-10">
                          {getEventIcon(event.type)}
                        </div>
                        <div className="flex-1 bg-white border rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{getEventDescription(event)}</div>
                              <div className="text-sm text-gray-500">Quarter {event.quarter} - {event.time}</div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {event.quarter === 1 && index < 8 ? `${index + 1}-${gameFlowData.filter(e => e.quarter === 1 && e.type === 'goal_against').length}` :
                               event.quarter === 2 && index < 15 ? `${gameFlowData.filter(e => e.quarter <= 1 && (e.type === 'goal_for')).length + gameFlowData.filter(e => e.quarter === 2 && e.id <= event.id && e.type === 'goal_for').length}-${gameFlowData.filter(e => e.quarter <= 1 && e.type === 'goal_against').length + gameFlowData.filter(e => e.quarter === 2 && e.id <= event.id && e.type === 'goal_against').length}` :
                               event.quarter === 3 ? `${gameFlowData.filter(e => e.quarter <= 2 && e.type === 'goal_for').length + gameFlowData.filter(e => e.quarter === 3 && e.id <= event.id && e.type === 'goal_for').length}-${gameFlowData.filter(e => e.quarter <= 2 && e.type === 'goal_against').length + gameFlowData.filter(e => e.quarter === 3 && e.id <= event.id && e.type === 'goal_against').length}` :
                               `${gameFlowData.filter(e => e.quarter <= 3 && e.type === 'goal_for').length + gameFlowData.filter(e => e.quarter === 4 && e.id <= event.id && e.type === 'goal_for').length}-${gameFlowData.filter(e => e.quarter <= 3 && e.type === 'goal_against').length + gameFlowData.filter(e => e.quarter === 4 && e.id <= event.id && e.type === 'goal_against').length}`}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTemplate>
  );
};

export default LiveScoreTrackingExamples;
