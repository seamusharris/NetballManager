
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LiveScoreTracker from '@/components/ui/live-score-tracker';

export default function LiveScoreTrackingExamples() {
  const [activeDesign, setActiveDesign] = useState('modern');

  // Sample event data for different designs
  const sampleEvents = [
    { id: '1', quarter: 1, timestamp: new Date(Date.now() - 600000), type: 'goal-for', player: 'Sarah M', position: 'GS' },
    { id: '2', quarter: 1, timestamp: new Date(Date.now() - 580000), type: 'goal-against' },
    { id: '3', quarter: 1, timestamp: new Date(Date.now() - 560000), type: 'miss', player: 'Emma K', position: 'GA' },
    { id: '4', quarter: 1, timestamp: new Date(Date.now() - 540000), type: 'intercept', player: 'Lisa R', position: 'GD' },
    { id: '5', quarter: 2, timestamp: new Date(Date.now() - 300000), type: 'goal-for', player: 'Sarah M', position: 'GS' },
    { id: '6', quarter: 2, timestamp: new Date(Date.now() - 280000), type: 'rebound', player: 'Emma K', position: 'GA' },
    { id: '7', quarter: 2, timestamp: new Date(Date.now() - 260000), type: 'infringement', player: 'Amy S', position: 'WD' },
  ];

  const getDualBorderEventBadge = (type: string, text: string) => {
    const colorMap = {
      'goal-for': { outer: 'border-green-400', inner: 'bg-green-500', text: 'text-white' },
      'goal-against': { outer: 'border-red-400', inner: 'bg-red-500', text: 'text-white' },
      'miss': { outer: 'border-orange-400', inner: 'bg-orange-500', text: 'text-white' },
      'intercept': { outer: 'border-blue-400', inner: 'bg-blue-500', text: 'text-white' },
      'rebound': { outer: 'border-purple-400', inner: 'bg-purple-500', text: 'text-white' },
      'infringement': { outer: 'border-yellow-500', inner: 'bg-yellow-600', text: 'text-white' },
    };

    const colors = colorMap[type] || { outer: 'border-gray-400', inner: 'bg-gray-500', text: 'text-white' };

    return (
      <div className={`relative w-12 h-12 rounded-full border-2 ${colors.outer} p-0.5`}>
        <div className={`w-full h-full rounded-full ${colors.inner} ${colors.text} flex items-center justify-center text-xs font-bold`}>
          {text}
        </div>
      </div>
    );
  };

  const ModernDesign = () => (
    <div className="space-y-6">
      {/* Hero Score Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="text-sm text-blue-600 font-medium">LIVE GAME</div>
            <h1 className="text-3xl font-bold text-gray-900">WNC Emus vs Thunder Hawks</h1>
            <div className="flex justify-center items-center space-x-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-green-600">42</div>
                <div className="text-sm text-gray-600 mt-1">WNC Emus</div>
              </div>
              <div className="text-4xl text-gray-400">-</div>
              <div className="text-center">
                <div className="text-5xl font-bold text-red-600">38</div>
                <div className="text-sm text-gray-600 mt-1">Thunder Hawks</div>
              </div>
            </div>
            <Badge className="bg-blue-600 text-white px-4 py-1">Quarter 2 • 8:34 remaining</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Timeline with Dual Border Circles */}
      <Card>
        <CardHeader>
          <CardTitle>Game Flow Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[1, 2].map(quarter => {
              const quarterEvents = sampleEvents.filter(e => e.quarter === quarter);
              return (
                <div key={quarter} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-medium px-3 py-1">Quarter {quarter}</Badge>
                    <div className="h-px bg-gray-300 flex-1"></div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    {quarterEvents.map(event => (
                      <div key={event.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                        {getDualBorderEventBadge(event.type, {
                          'goal-for': 'GF',
                          'goal-against': 'GA',
                          'miss': 'M',
                          'intercept': 'I',
                          'rebound': 'R',
                          'infringement': 'INF'
                        }[event.type] || '?')}
                        <div className="text-sm">
                          <div className="font-medium">
                            {event.player ? `${event.player} (${event.position})` : 'Opponent action'}
                          </div>
                          <div className="text-gray-500">
                            {event.timestamp.toLocaleTimeString('en-AU', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const CompactDesign = () => (
    <div className="space-y-4">
      {/* Compact Score Header */}
      <Card className="bg-gray-900 text-white">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="text-center">
              <div className="text-2xl font-bold">42</div>
              <div className="text-xs text-gray-300">WNC Emus</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-green-400 mb-1">Q2 • LIVE</div>
              <div className="text-lg text-gray-400">vs</div>
              <div className="text-xs text-gray-400 mt-1">8:34 left</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">38</div>
              <div className="text-xs text-gray-300">Thunder Hawks</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compact Event Flow */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {sampleEvents.slice(-8).map(event => (
              <div key={event.id} className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-2">
                <div className={`w-6 h-6 rounded-full border ${
                  event.type === 'goal-for' ? 'border-green-400 bg-green-500' :
                  event.type === 'goal-against' ? 'border-red-400 bg-red-500' :
                  event.type === 'miss' ? 'border-orange-400 bg-orange-500' :
                  event.type === 'intercept' ? 'border-blue-400 bg-blue-500' :
                  event.type === 'rebound' ? 'border-purple-400 bg-purple-500' :
                  'border-yellow-500 bg-yellow-600'
                } text-white text-xs font-bold flex items-center justify-center`}>
                  {event.type === 'goal-for' ? 'G' :
                   event.type === 'goal-against' ? 'A' :
                   event.type === 'miss' ? 'M' :
                   event.type === 'intercept' ? 'I' :
                   event.type === 'rebound' ? 'R' : 'F'}
                </div>
                <span className="text-xs font-medium">
                  {event.player ? event.position : 'OPP'}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const DetailedDesign = () => (
    <div className="space-y-6">
      {/* Detailed Score Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">42</div>
              <div className="text-sm text-gray-600">WNC Emus</div>
              <div className="text-xs text-gray-500 mt-1">Goals: 42 • Misses: 8</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-t-4 border-t-blue-500">
          <CardContent className="p-4 text-center">
            <div className="text-sm text-blue-600 font-medium">QUARTER 2</div>
            <div className="text-2xl font-bold text-gray-900">8:34</div>
            <div className="text-xs text-gray-500">Remaining</div>
          </CardContent>
        </Card>
        
        <Card className="border-r-4 border-r-red-500">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">38</div>
              <div className="text-sm text-gray-600">Thunder Hawks</div>
              <div className="text-xs text-gray-500 mt-1">Goals: 38 • Misses: 12</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Quarter Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Quarter Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {[
              { q: 1, us: 12, them: 10, complete: true },
              { q: 2, us: 14, them: 12, complete: false },
              { q: 3, us: 0, them: 0, complete: false },
              { q: 4, us: 0, them: 0, complete: false }
            ].map(quarter => (
              <div key={quarter.q} className={`p-4 rounded-lg border-2 ${
                quarter.complete ? 'border-gray-300 bg-gray-50' : 
                quarter.q === 2 ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
              }`}>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-600 mb-2">Q{quarter.q}</div>
                  {quarter.complete || quarter.q === 2 ? (
                    <>
                      <div className="text-2xl font-bold">{quarter.us} - {quarter.them}</div>
                      {quarter.q === 2 && <div className="text-xs text-blue-600 mt-1">In Progress</div>}
                    </>
                  ) : (
                    <div className="text-xl text-gray-400">— - —</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Event History with Enhanced Circles */}
      <Card>
        <CardHeader>
          <CardTitle>Event History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sampleEvents.map(event => (
              <div key={event.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                {getDualBorderEventBadge(event.type, {
                  'goal-for': 'GF',
                  'goal-against': 'GA',
                  'miss': 'M',
                  'intercept': 'I',
                  'rebound': 'R',
                  'infringement': 'INF'
                }[event.type] || '?')}
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">
                        {event.type === 'goal-for' ? 'Goal Scored' :
                         event.type === 'goal-against' ? 'Goal Against' :
                         event.type === 'miss' ? 'Shot Missed' :
                         event.type === 'intercept' ? 'Interception' :
                         event.type === 'rebound' ? 'Rebound Secured' :
                         'Infringement'}
                      </div>
                      {event.player && (
                        <div className="text-sm text-gray-600">
                          {event.player} ({event.position})
                        </div>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div>Q{event.quarter}</div>
                      <div>{event.timestamp.toLocaleTimeString('en-AU', { hour12: false, hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Live Score Tracking Designs</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Multiple design approaches for real-time game flow tracking with enhanced visual indicators 
          and dual-border circles inspired by the results component.
        </p>
      </div>

      <Separator />

      {/* Design Selector */}
      <Tabs value={activeDesign} onValueChange={setActiveDesign} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="modern">Modern Design</TabsTrigger>
          <TabsTrigger value="compact">Compact Design</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Design</TabsTrigger>
        </TabsList>

        <TabsContent value="modern" className="mt-6">
          <ModernDesign />
        </TabsContent>

        <TabsContent value="compact" className="mt-6">
          <CompactDesign />
        </TabsContent>

        <TabsContent value="detailed" className="mt-6">
          <DetailedDesign />
        </TabsContent>
      </Tabs>

      {/* Original Component for Comparison */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Original Interactive Component</CardTitle>
          <p className="text-sm text-gray-600">
            The original live score tracker with full functionality for comparison.
          </p>
        </CardHeader>
        <CardContent>
          <LiveScoreTracker
            teamName="WNC Emus"
            opponentName="Thunder Hawks"
            currentQuarter={2}
          />
        </CardContent>
      </Card>

      {/* Design Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Design Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-600">Modern Design</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Hero-style score display</li>
                <li>• Gradient backgrounds</li>
                <li>• Large dual-border event circles</li>
                <li>• Clean timeline layout</li>
                <li>• Visual emphasis on live status</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-orange-600">Compact Design</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Dark header for contrast</li>
                <li>• Space-efficient layout</li>
                <li>• Condensed event badges</li>
                <li>• Quick-scan information</li>
                <li>• Mobile-friendly design</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-purple-600">Detailed Design</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Comprehensive statistics</li>
                <li>• Quarter-by-quarter analysis</li>
                <li>• Enhanced event descriptions</li>
                <li>• Detailed dual-border circles</li>
                <li>• Coach-focused information</li>
              </ul>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <h4 className="font-semibold">Dual Border Circle System</h4>
            <p className="text-sm text-gray-600">
              The dual border circles are inspired by the results component and provide enhanced visual 
              distinction for different event types. The outer border creates depth while the inner circle 
              contains the action identifier, making events instantly recognizable at a glance.
            </p>
            
            <div className="flex gap-4 items-center">
              <span className="text-sm font-medium">Event Types:</span>
              {getDualBorderEventBadge('goal-for', 'GF')}
              {getDualBorderEventBadge('goal-against', 'GA')}
              {getDualBorderEventBadge('miss', 'M')}
              {getDualBorderEventBadge('intercept', 'I')}
              {getDualBorderEventBadge('rebound', 'R')}
              {getDualBorderEventBadge('infringement', 'INF')}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
