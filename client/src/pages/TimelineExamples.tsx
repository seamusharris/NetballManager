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
      title: "Player Injury",
      description: "Sarah sustained minor ankle injury",
      time: "12 mins ago",
      type: "warning",
      icon: XCircle
    },
    {
      id: 3,
      title: "Substitution Made",
      description: "Emily replaced Sarah at GS",
      time: "10 mins ago",
      type: "info",
      icon: Users
    },
    {
      id: 4,
      title: "Quarter 2 Started",
      description: "Second quarter underway",
      time: "8 mins ago",
      type: "info",
      icon: Clock
    }
  ];

  const renderTimelineEvent = (event) => {
    const IconComponent = event.icon;
    return (
      <div key={event.id} className="flex items-start space-x-3 p-4 border-l-2 border-l-blue-500">
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          event.type === 'success' ? 'bg-green-100 text-green-600' :
          event.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
          'bg-blue-100 text-blue-600'
        }`}>
          <IconComponent className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-sm">{event.title}</h4>
          <p className="text-sm text-gray-600">{event.description}</p>
          <p className="text-xs text-gray-400 mt-1">{event.time}</p>
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
        <title>Timeline Examples - Netball App</title>
      </Helmet>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Live Game Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {timelineEvents.map(renderTimelineEvent)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Season Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium">Championship Win</h4>
                    <p className="text-sm text-gray-600">Won Division A Championship</p>
                  </div>
                </div>
                <Badge variant="secondary">2 weeks ago</Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium">Finals Week</h4>
                    <p className="text-sm text-gray-600">Advanced to finals</p>
                  </div>
                </div>
                <Badge variant="secondary">3 weeks ago</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
}