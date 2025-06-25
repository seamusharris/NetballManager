
import React from 'react';
import { Helmet } from 'react-helmet';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, Calendar, Trophy, Users } from 'lucide-react';

export default function TimelineExamples() {
  const timelineEvents = [
    {
      id: 1,
      title: "Quarter 1 Complete",
      description: "Strong start with 8-5 lead",
      time: "15 mins ago",
      type: "success",
      icon: CheckCircle
    },
    {
      id: 2,
      title: "Substitution Made",
      description: "Sarah replaced Emily at GD",
      time: "22 mins ago",
      type: "info",
      icon: Users
    },
    {
      id: 3,
      title: "Game Started",
      description: "WNC Dingoes vs Emeralds",
      time: "45 mins ago",
      type: "default",
      icon: Trophy
    }
  ];

  const activityFeed = [
    { id: 1, player: "Abbey N", action: "scored 3 goals", time: "2 mins ago", quarter: "Q4" },
    { id: 2, player: "Ava", action: "made 2 intercepts", time: "5 mins ago", quarter: "Q4" },
    { id: 3, player: "Emily", action: "excellent defense", time: "8 mins ago", quarter: "Q3" },
    { id: 4, player: "Evie", action: "center court play", time: "12 mins ago", quarter: "Q3" }
  ];

  const gameHistory = [
    { id: 1, date: "2025-06-07", opponent: "Deep Creek", result: "Win", score: "42-38" },
    { id: 2, date: "2025-05-31", opponent: "Doncaster", result: "Loss", score: "35-41" },
    { id: 3, date: "2025-05-24", opponent: "Donvale", result: "Win", score: "39-33" },
    { id: 4, date: "2025-05-17", opponent: "East Doncaster", result: "Win", score: "44-40" }
  ];

    const Icon = event.icon;
    return (
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          event.type === 'success' ? 'bg-green-100 text-green-600' :
          event.type === 'info' ? 'bg-blue-100 text-blue-600' :
          'bg-gray-100 text-gray-600'
        }`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">{event.title}</p>
            <p className="text-xs text-gray-500">{event.time}</p>
          </div>
          <p className="text-sm text-gray-600">{event.description}</p>
        </div>
      </div>
    );
  };

  return (
    <PageTemplate
      title="Timeline Examples"
      subtitle="Various timeline and activity feed patterns"
      breadcrumbs={[
        { label: 'Component Examples', href: '/component-examples' },
        { label: 'Timeline Examples' }
      ]}
    >
      <Helmet>
        <title>Timeline Examples | Team Manager</title>
      </Helmet>

      <div className="space-y-8">
        {/* Vertical Timeline */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Vertical Timeline</h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Game Events Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                <div className="space-y-6">
                  {timelineEvents.map((event, index) => (
                    <TimelineItem key={event.id} event={event} index={index} />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Activity Feed */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Activity Feed</h2>
          <Card>
            <CardHeader>
              <CardTitle>Live Game Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityFeed.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                        {activity.player.split(' ')[0][0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{activity.player} {activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{activity.quarter}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Game History Timeline */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Game History Timeline</h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Season Results History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gameHistory.map((game) => (
                  <div key={game.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-500">{game.date}</div>
                      <div className="font-medium">vs {game.opponent}</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium">{game.score}</span>
                      <Badge variant={game.result === 'Win' ? 'default' : 'destructive'}>
                        {game.result}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Compact Timeline */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Compact Timeline</h2>
          <Card>
            <CardHeader>
              <CardTitle>Quarter Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Q1: 8-5</span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-200"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Q2: 18-12</span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-200"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Q3: 25-28</span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-200"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-blue-200"></div>
                  <span className="text-sm">Q4: In Progress</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </PageTemplate>
  );
}
