
import React from 'react';
import { cn } from '@/lib/utils';

interface QuarterScore {
  quarter: number;
  teamScore: number;
  awayScore: number;
}

interface QuarterScoresDisplayProps {
  quarterScores: QuarterScore[];
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showCumulative?: boolean;
  teamName?: string;
  awayTeamName?: string;
}

export function QuarterScoresDisplay({
  quarterScores,
  className,
  size = 'md',
  showCumulative = false,
  teamName = 'Team',
  awayTeamName = 'Away Team'
}: QuarterScoresDisplayProps) {
  // Ensure we have 4 quarters
  const fullQuarterScores = [1, 2, 3, 4].map(quarter => {
    const existing = quarterScores.find(q => q.quarter === quarter);
    return existing || { quarter, teamScore: 0, opponentScore: 0 };
  });

  // Calculate cumulative scores if needed
  const cumulativeScores = showCumulative ? fullQuarterScores.map((_, index) => {
    const teamTotal = fullQuarterScores.slice(0, index + 1).reduce((sum, q) => sum + q.teamScore, 0);
    const opponentTotal = fullQuarterScores.slice(0, index + 1).reduce((sum, q) => sum + q.opponentScore, 0);
    return { teamTotal, opponentTotal };
  }) : [];

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'gap-1',
          quarter: 'w-8 h-8 text-xs',
          label: 'text-xs',
          spacing: 'space-y-1'
        };
      case 'lg':
        return {
          container: 'gap-3',
          quarter: 'w-12 h-12 text-base',
          label: 'text-base',
          spacing: 'space-y-3'
        };
      default: // md
        return {
          container: 'gap-2',
          quarter: 'w-10 h-10 text-sm',
          label: 'text-sm',
          spacing: 'space-y-2'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <div className={cn('flex flex-col', sizeClasses.spacing, className)}>
      {/* Quarter-by-quarter scores */}
      <div className="space-y-1">
        <div className={cn('grid grid-cols-4', sizeClasses.container)}>
          {fullQuarterScores.map((quarter) => {
            const quarterWin = quarter.teamScore > quarter.opponentScore;
            const quarterLoss = quarter.teamScore < quarter.opponentScore;
            const quarterDraw = quarter.teamScore === quarter.opponentScore;

            return (
              <div key={quarter.quarter} className="text-center">
                <div className={cn('text-xs text-gray-500 mb-1', sizeClasses.label)}>
                  Q{quarter.quarter}
                </div>
                <div className={cn(
                  'rounded border flex flex-col items-center justify-center font-medium',
                  sizeClasses.quarter,
                  quarterWin ? 'bg-green-50 border-green-200 text-green-800' :
                  quarterLoss ? 'bg-red-50 border-red-200 text-red-800' :
                  quarterDraw ? 'bg-amber-50 border-amber-200 text-amber-800' :
                  'bg-gray-50 border-gray-200 text-gray-600'
                )}>
                  <div className="leading-none">
                    {quarter.teamScore}-{quarter.opponentScore}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cumulative scores if requested */}
      {showCumulative && (
        <div className="space-y-1">
          <div className={cn('text-xs text-gray-500', sizeClasses.label)}>
            Running Total
          </div>
          <div className={cn('grid grid-cols-4', sizeClasses.container)}>
            {cumulativeScores.map((cumulative, index) => {
              const cumulativeWin = cumulative.teamTotal > cumulative.opponentTotal;
              const cumulativeLoss = cumulative.teamTotal < cumulative.opponentTotal;
              const cumulativeDraw = cumulative.teamTotal === cumulative.opponentTotal;

              return (
                <div key={index} className="text-center">
                  <div className={cn(
                    'rounded border flex flex-col items-center justify-center font-medium',
                    sizeClasses.quarter,
                    cumulativeWin ? 'bg-green-100 border-green-300 text-green-900' :
                    cumulativeLoss ? 'bg-red-100 border-red-300 text-red-900' :
                    cumulativeDraw ? 'bg-amber-100 border-amber-300 text-amber-900' :
                    'bg-gray-100 border-gray-300 text-gray-700'
                  )}>
                    <div className="leading-none">
                      {cumulative.teamTotal}-{cumulative.opponentTotal}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Convenience components for different sizes
export function SmallQuarterScoresDisplay(props: Omit<QuarterScoresDisplayProps, 'size'>) {
  return <QuarterScoresDisplay {...props} size="sm" />;
}

export function LargeQuarterScoresDisplay(props: Omit<QuarterScoresDisplayProps, 'size'>) {
  return <QuarterScoresDisplay {...props} size="lg" />;
}

// Component with cumulative scores enabled by default
export function CumulativeQuarterScoresDisplay(props: Omit<QuarterScoresDisplayProps, 'showCumulative'>) {
  return <QuarterScoresDisplay {...props} showCumulative={true} />;
}
