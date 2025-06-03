
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { Archive, ArrowLeft } from 'lucide-react';

export default function OpponentDetailed() {
  const [, navigate] = useLocation();

  return (
    <div className="container py-6">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div className="space-y-4">
          <Archive className="h-16 w-16 mx-auto text-gray-400" />
          <h1 className="text-3xl font-heading font-bold text-neutral-dark">
            Opponent Details - Archived
          </h1>
          <p className="text-lg text-gray-600">
            This detailed opponent analysis page has been archived.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Archived During Migration</CardTitle>
          </CardHeader>
          <CardContent className="text-left space-y-3">
            <p>This page provided detailed analysis of performance against specific opponents.</p>
            <p>It will be redesigned to show team-vs-team analysis in the new system.</p>
          </CardContent>
        </Card>

        <Button 
          onClick={() => navigate('/opponent-analysis')}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Analysis
        </Button>
      </div>
    </div>
  );
}
