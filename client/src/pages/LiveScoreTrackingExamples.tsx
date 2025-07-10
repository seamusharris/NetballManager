
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import LiveScoreTracker from '@/components/ui/live-score-tracker';

export default function LiveScoreTrackingExamples() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Live Score Tracking</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Real-time game flow tracking with badge-style event indicators. Perfect for live statistics 
          recording during games, showing the sequence of goals, misses, intercepts, and other key events.
        </p>
      </div>

      <Separator />

      {/* Main Example */}
      <Card>
        <CardHeader>
          <CardTitle>Live Game: WNC Emus vs Thunder Hawks</CardTitle>
          <p className="text-sm text-gray-600">
            This shows how the game flows with timestamped events. Each event is represented by a 
            colored badge with abbreviated text for quick identification.
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

      {/* Features Description */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Key Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h4 className="font-semibold">Real-time Score Updates</h4>
              <p className="text-sm text-gray-600">
                Live score display with running totals and quarter breakdowns.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Event Timeline</h4>
              <p className="text-sm text-gray-600">
                Chronological flow of all game events with timestamps for post-game analysis.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Badge System</h4>
              <p className="text-sm text-gray-600">
                Color-coded badges for quick visual identification of different event types.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Quarter Management</h4>
              <p className="text-sm text-gray-600">
                Easy switching between quarters with automatic score calculation.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Event Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-6 bg-green-500 rounded text-white text-xs font-bold flex items-center justify-center">GF</div>
                <span className="text-sm">Goal For - Team scores</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-6 bg-red-500 rounded text-white text-xs font-bold flex items-center justify-center">GA</div>
                <span className="text-sm">Goal Against - Opponent scores</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-6 bg-orange-500 rounded text-white text-xs font-bold flex items-center justify-center">M</div>
                <span className="text-sm">Miss - Shot attempt missed</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-6 bg-blue-500 rounded text-white text-xs font-bold flex items-center justify-center">I</div>
                <span className="text-sm">Intercept - Ball intercepted</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-6 bg-purple-500 rounded text-white text-xs font-bold flex items-center justify-center">R</div>
                <span className="text-sm">Rebound - Ball rebounded</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-10 h-6 bg-yellow-600 rounded text-white text-xs font-bold flex items-center justify-center">INF</div>
                <span className="text-sm">Infringement - Rule violation</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Future Integration */}
      <Card>
        <CardHeader>
          <CardTitle>Future Integration Ideas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Live Statistics Integration</h4>
              <p className="text-sm text-gray-600">
                Connect this tracker to the live statistics recording system for automatic 
                event logging based on player actions and position stats.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Player Attribution</h4>
              <p className="text-sm text-gray-600">
                Link events to specific players and positions for detailed performance analysis 
                and accountability tracking.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Export Functionality</h4>
              <p className="text-sm text-gray-600">
                Export game flow data for post-game analysis, sharing with players, 
                or importing into external analysis tools.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Historical Comparison</h4>
              <p className="text-sm text-gray-600">
                Compare game flow patterns across multiple games to identify trends 
                and areas for improvement.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Implementation Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p>
              This live score tracker is designed to be integrated into the existing live statistics 
              recording system. The component currently shows sample data but is structured to accept 
              real-time events from game recording interfaces.
            </p>
            
            <p>
              The badge system provides quick visual feedback for different event types, making it 
              easy for scorers to track the flow of the game without losing focus on the action.
            </p>
            
            <p>
              Future enhancements could include audio notifications for events, automatic timing 
              based on game periods, and integration with the existing player and position tracking systems.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
