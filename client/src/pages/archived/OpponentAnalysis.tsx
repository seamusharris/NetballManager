import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { Archive, ArrowRight } from 'lucide-react';

export default function OpponentAnalysis() {
  const [, navigate] = useLocation();

  return (
    <div className="container py-6">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div className="space-y-4">
          <Archive className="h-16 w-16 mx-auto text-gray-400" />
          <h1 className="text-3xl font-heading font-bold text-neutral-dark">
            Opponent Analysis - Archived
          </h1>
          <p className="text-lg text-gray-600">
            This feature has been archived during the transition to the team-based system.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>What happened?</CardTitle>
          </CardHeader>
          <CardContent className="text-left space-y-3">
            <p>The opponent analysis pages have been temporarily archived while we complete the migration to the new team-based system.</p>
            <p>These pages will be redesigned to work with home/away team analysis instead of opponent-based analysis.</p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Available alternatives:</h2>
          <div className="grid gap-4">
            <Button 
              onClick={() => navigate('/teams')}
              className="flex items-center justify-between p-4 h-auto"
            >
              <div className="text-left">
                <div className="font-medium">Team Management</div>
                <div className="text-sm opacity-90">Manage teams across clubs</div>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button 
              onClick={() => navigate('/games')}
              variant="outline"
              className="flex items-center justify-between p-4 h-auto"
            >
              <div className="text-left">
                <div className="font-medium">Games</div>
                <div className="text-sm opacity-90">View game schedules and results</div>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}