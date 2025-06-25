
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Archive } from 'lucide-react';

interface PositionOpponentAnalysisProps {
  seasonId?: number;
  currentClubId: number;
}

export default function PositionOpponentAnalysis({ seasonId, currentClubId }: PositionOpponentAnalysisProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Archive className="h-5 w-5 text-gray-400" />
          Position vs Opponent Analysis - Archived
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-gray-500">
          <p>This analysis component has been archived during the migration to the team-based system.</p>
          <p className="text-sm mt-2">It will be replaced with team-vs-team analysis in the future.</p>
        </div>
      </CardContent>
    </Card>
  );
}
