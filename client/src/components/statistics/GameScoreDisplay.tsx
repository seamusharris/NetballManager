import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameScoreDisplayProps {
  teamScore?: number;
  awayScore?: number;
  teamName?: string;
  opponentName?: string;
  showQuarters?: boolean;
  quarterScores?: Array<{ team: number; opponent: number }>;
  className?: string;
  compact?: boolean;
  hasOfficialScores?: boolean;
  showWarning?: boolean;
}

export function GameScoreDisplay({
  teamScore,
  awayScore,
  teamName = "Team",
  opponentName = "Opponent",
  showQuarters = false,
  quarterScores = [],
  className = "",
  compact = false,
  hasOfficialScores = false,
  showWarning = false
}: GameScoreDisplayProps) {
  // Only show scores if we have official scores
  if (!hasOfficialScores || teamScore === undefined || awayScore === undefined) {
    if (compact) {
      return (
        <div className={cn("flex items-center gap-2", className)}>
          <span className="font-bold text-muted-foreground">—</span>
        </div>
      );
    }

    return (
      <div className={cn("space-y-3", className)}>
        <div className="text-center space-y-2">
          <div className="flex justify-center items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">—</div>
              <div className="text-sm text-muted-foreground">{teamName}</div>
            </div>
            <div className="text-xl text-muted-foreground">-</div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">—</div>
              <div className="text-sm text-muted-foreground">{opponentName}</div>
            </div>
          </div>

          <div className="flex justify-center items-center gap-2">
            <Badge variant="outline" className="text-muted-foreground">
              No Official Scores
            </Badge>
          </div>
        </div>
      </div>
    );
  }

  const getResult = () => {
    if (teamScore > awayScore) return 'win';
    if (teamScore < awayScore) return 'loss';
    return 'draw';
  };

  const result = getResult();

  const getBadgeVariant = () => {
    switch (result) {
      case 'win': return 'default';
      case 'loss': return 'destructive';
      case 'draw': return 'secondary';
      default: return 'outline';
    }
  };

  const getResultText = () => {
    switch (result) {
      case 'win': return 'Win';
      case 'loss': return 'Loss';
      case 'draw': return 'Draw';
      default: return '';
    }
  };

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className="font-bold">{teamScore}-{awayScore}</span>
        <Badge variant={getBadgeVariant()} className="text-xs">
          {getResultText()}
        </Badge>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Main Score Display */}
      <div className="text-center space-y-2">
        <div className="flex justify-center items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{teamScore}</div>
            <div className="text-sm text-muted-foreground">{teamName}</div>
          </div>
          <div className="text-xl text-muted-foreground">-</div>
          <div className="text-center">
            <div className="text-2xl font-bold">{awayScore}</div>
            <div className="text-sm text-muted-foreground">{opponentName}</div>
          </div>
        </div>

        <div className="flex justify-center items-center gap-2">
          <Badge variant={getBadgeVariant()} className="flex items-center gap-1">
            <Trophy className="h-3 w-3" />
            {getResultText()}
          </Badge>
          <Badge variant="outline" className="text-xs">
            Official
          </Badge>
        </div>
      </div>

      {/* Quarter Breakdown */}
      {showQuarters && quarterScores.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-center">Quarter Breakdown</h4>
            <div className="grid grid-cols-4 gap-2 text-center text-sm">
              {quarterScores.map((quarter, index) => (
                <div key={index} className="space-y-1">
                  <div className="text-xs text-muted-foreground">Q{index + 1}</div>
                  <div className="font-medium">{quarter.team}-{quarter.opponent}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}