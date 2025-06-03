
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { Archive, ArrowRight } from 'lucide-react';

export default function Opponents() {
  const [, navigate] = useLocation();

  return (
    <div className="container py-6">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div className="space-y-4">
          <Archive className="h-16 w-16 mx-auto text-gray-400" />
          <h1 className="text-3xl font-heading font-bold text-neutral-dark">
            Opponents - Archived
          </h1>
          <p className="text-lg text-gray-600">
            The opponent management system has been archived.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Migration to Team System</CardTitle>
          </CardHeader>
          <CardContent className="text-left space-y-3">
            <p>The system has migrated from an "opponent" model to a unified "team" model where all teams are managed within clubs.</p>
            <p>This provides better tracking for inter-club games and statistics.</p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Use the new team system:</h2>
          <div className="grid gap-4">
            <Button 
              onClick={() => navigate('/teams')}
              className="flex items-center justify-between p-4 h-auto"
            >
              <div className="text-left">
                <div className="font-medium">Team Management</div>
                <div className="text-sm opacity-90">Create and manage teams across clubs</div>
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
                <div className="text-sm opacity-90">Schedule games between teams</div>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
