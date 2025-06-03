import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { ArrowRight, Users, Shield } from 'lucide-react';

export default function Opponents() {
  const [, navigate] = useLocation();

  return (
    <div className="container py-6">
      <Helmet>
        <title>Opponents - Netball Club</title>
      </Helmet>

      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div className="space-y-4">
          <Shield className="h-16 w-16 mx-auto text-blue-600" />
          <h1 className="text-3xl font-heading font-bold text-neutral-dark">
            Opponent System Updated
          </h1>
          <p className="text-lg text-gray-600">
            The opponent management system has been replaced with a comprehensive team-based system.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              What's Changed?
            </CardTitle>
          </CardHeader>
          <CardContent className="text-left space-y-3">
            <div className="space-y-2">
              <p><strong>Before:</strong> Games were scheduled against "opponents" - external teams managed separately.</p>
              <p><strong>Now:</strong> All teams are part of the multi-club system, allowing for:</p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                <li>Better tracking of inter-club games</li>
                <li>Comprehensive team management across clubs</li>
                <li>Unified statistics and analysis</li>
                <li>Improved scheduling and coordination</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Where to go now?</h2>
          <div className="grid gap-4">
            <Button 
              onClick={() => navigate('/teams')}
              className="flex items-center justify-between p-4 h-auto"
            >
              <div className="text-left">
                <div className="font-medium">Manage Teams</div>
                <div className="text-sm opacity-90">View and manage all teams across clubs</div>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button 
              onClick={() => navigate('/games')}
              variant="outline"
              className="flex items-center justify-between p-4 h-auto"
            >
              <div className="text-left">
                <div className="font-medium">Schedule Games</div>
                <div className="text-sm opacity-90">Create games between teams</div>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button 
              onClick={() => navigate('/opponent-analysis')}
              variant="outline"
              className="flex items-center justify-between p-4 h-auto"
            >
              <div className="text-left">
                <div className="font-medium">Team Analysis</div>
                <div className="text-sm opacity-90">Analyze performance against other teams</div>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}