
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface ScoreEvent {
  id: string;
  quarter: number;
  timestamp: Date;
  type: 'goal-for' | 'goal-against' | 'miss' | 'intercept' | 'rebound' | 'infringement';
  player?: string;
  position?: string;
  description?: string;
}

interface LiveScoreTrackerProps {
  teamName?: string;
  opponentName?: string;
  currentQuarter?: number;
  className?: string;
}

export default function LiveScoreTracker({
  teamName = "Our Team",
  opponentName = "Opponent",
  currentQuarter = 1,
  className = ""
}: LiveScoreTrackerProps) {
  const [events, setEvents] = useState<ScoreEvent[]>([]);
  const [quarter, setQuarter] = useState(currentQuarter);

  // Sample events for demonstration
  useEffect(() => {
    const sampleEvents: ScoreEvent[] = [
      {
        id: '1',
        quarter: 1,
        timestamp: new Date(Date.now() - 600000), // 10 mins ago
        type: 'goal-for',
        player: 'Sarah M',
        position: 'GS',
        description: 'Great shot from under the post'
      },
      {
        id: '2',
        quarter: 1,
        timestamp: new Date(Date.now() - 580000),
        type: 'goal-against',
        description: 'Opponent scores'
      },
      {
        id: '3',
        quarter: 1,
        timestamp: new Date(Date.now() - 560000),
        type: 'miss',
        player: 'Emma K',
        position: 'GA',
        description: 'Shot just wide'
      },
      {
        id: '4',
        quarter: 1,
        timestamp: new Date(Date.now() - 540000),
        type: 'intercept',
        player: 'Lisa R',
        position: 'GD',
        description: 'Brilliant intercept in the circle'
      },
      {
        id: '5',
        quarter: 1,
        timestamp: new Date(Date.now() - 520000),
        type: 'goal-for',
        player: 'Sarah M',
        position: 'GS'
      },
      {
        id: '6',
        quarter: 2,
        timestamp: new Date(Date.now() - 300000), // 5 mins ago
        type: 'rebound',
        player: 'Emma K',
        position: 'GA',
        description: 'Secured rebound, great positioning'
      },
      {
        id: '7',
        quarter: 2,
        timestamp: new Date(Date.now() - 280000),
        type: 'goal-for',
        player: 'Emma K',
        position: 'GA'
      },
      {
        id: '8',
        quarter: 2,
        timestamp: new Date(Date.now() - 260000),
        type: 'infringement',
        player: 'Amy S',
        position: 'WD',
        description: 'Contact penalty'
      }
    ];
    setEvents(sampleEvents);
  }, []);

  const addEvent = (type: ScoreEvent['type']) => {
    const newEvent: ScoreEvent = {
      id: Date.now().toString(),
      quarter,
      timestamp: new Date(),
      type,
      description: `${type.replace('-', ' ')} event`
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const getEventBadgeProps = (type: ScoreEvent['type']) => {
    switch (type) {
      case 'goal-for':
        return {
          className: 'bg-green-500 text-white font-bold',
          text: 'GF'
        };
      case 'goal-against':
        return {
          className: 'bg-red-500 text-white font-bold',
          text: 'GA'
        };
      case 'miss':
        return {
          className: 'bg-orange-500 text-white font-bold',
          text: 'M'
        };
      case 'intercept':
        return {
          className: 'bg-blue-500 text-white font-bold',
          text: 'I'
        };
      case 'rebound':
        return {
          className: 'bg-purple-500 text-white font-bold',
          text: 'R'
        };
      case 'infringement':
        return {
          className: 'bg-yellow-600 text-white font-bold',
          text: 'INF'
        };
      default:
        return {
          className: 'bg-gray-500 text-white font-bold',
          text: '?'
        };
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-AU', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getQuarterEvents = (quarterNum: number) => {
    return events.filter(event => event.quarter === quarterNum);
  };

  const calculateQuarterScore = (quarterNum: number) => {
    const quarterEvents = getQuarterEvents(quarterNum);
    const goalsFor = quarterEvents.filter(e => e.type === 'goal-for').length;
    const goalsAgainst = quarterEvents.filter(e => e.type === 'goal-against').length;
    return { for: goalsFor, against: goalsAgainst };
  };

  const calculateTotalScore = () => {
    let totalFor = 0;
    let totalAgainst = 0;
    for (let q = 1; q <= 4; q++) {
      const score = calculateQuarterScore(q);
      totalFor += score.for;
      totalAgainst += score.against;
    }
    return { for: totalFor, against: totalAgainst };
  };

  const totalScore = calculateTotalScore();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Current Score Display */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-center">Live Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center text-center">
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-600">{teamName}</div>
              <div className="text-3xl font-bold text-primary">{totalScore.for}</div>
            </div>
            <div className="text-2xl font-bold text-gray-400 mx-4">-</div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-600">{opponentName}</div>
              <div className="text-3xl font-bold text-red-500">{totalScore.against}</div>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <Badge variant="outline" className="text-sm">
              Quarter {quarter}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Quarter Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Quarter Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            {[1, 2, 3, 4].map(q => {
              const score = calculateQuarterScore(q);
              return (
                <div key={q} className={`p-3 rounded-lg border ${q === quarter ? 'bg-primary/10 border-primary' : 'bg-gray-50'}`}>
                  <div className="text-sm font-medium text-gray-600">Q{q}</div>
                  <div className="text-lg font-bold">
                    {score.for} - {score.against}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Event Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Game Flow</CardTitle>
        </CardHeader>
        <CardContent>
          {[1, 2, 3, 4].map(q => {
            const quarterEvents = getQuarterEvents(q);
            if (quarterEvents.length === 0) return null;

            return (
              <div key={q} className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="font-medium">
                    Quarter {q}
                  </Badge>
                  <div className="text-sm text-gray-500">
                    {quarterEvents.length} events
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {quarterEvents.map(event => {
                    const badgeProps = getEventBadgeProps(event.type);
                    return (
                      <div key={event.id} className="flex items-center gap-2">
                        <Badge className={badgeProps.className}>
                          {badgeProps.text}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatTime(event.timestamp)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Detailed Events */}
                <div className="space-y-2">
                  {quarterEvents.map(event => (
                    <div key={event.id} className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg text-sm">
                      <Badge className={`${getEventBadgeProps(event.type).className} shrink-0`}>
                        {getEventBadgeProps(event.type).text}
                      </Badge>
                      <div className="flex-1">
                        <div className="font-medium">
                          {event.player && (
                            <span>{event.player} ({event.position})</span>
                          )}
                        </div>
                        {event.description && (
                          <div className="text-gray-600">{event.description}</div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 shrink-0">
                        {formatTime(event.timestamp)}
                      </div>
                    </div>
                  ))}
                </div>
                
                {q < 4 && <Separator className="mt-4" />}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Quick Add Events (for testing) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Add Event</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium">Quarter:</span>
              {[1, 2, 3, 4].map(q => (
                <Button
                  key={q}
                  variant={quarter === q ? "default" : "outline"}
                  size="sm"
                  onClick={() => setQuarter(q)}
                >
                  Q{q}
                </Button>
              ))}
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addEvent('goal-for')}
                className="text-green-600 border-green-300 hover:bg-green-50"
              >
                Goal For
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addEvent('goal-against')}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Goal Against
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addEvent('miss')}
                className="text-orange-600 border-orange-300 hover:bg-orange-50"
              >
                Miss
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addEvent('intercept')}
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                Intercept
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addEvent('rebound')}
                className="text-purple-600 border-purple-300 hover:bg-purple-50"
              >
                Rebound
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addEvent('infringement')}
                className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
              >
                Infringement
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Event Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            {[
              { type: 'goal-for', label: 'Goal For' },
              { type: 'goal-against', label: 'Goal Against' },
              { type: 'miss', label: 'Missed Shot' },
              { type: 'intercept', label: 'Intercept' },
              { type: 'rebound', label: 'Rebound' },
              { type: 'infringement', label: 'Infringement' }
            ].map(({ type, label }) => {
              const badgeProps = getEventBadgeProps(type as ScoreEvent['type']);
              return (
                <div key={type} className="flex items-center gap-2">
                  <Badge className={badgeProps.className}>
                    {badgeProps.text}
                  </Badge>
                  <span>{label}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
