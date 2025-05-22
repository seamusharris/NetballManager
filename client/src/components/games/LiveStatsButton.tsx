import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { ActivitySquare } from 'lucide-react';

interface LiveStatsButtonProps {
  gameId: number;
  isDisabled?: boolean;
}

export default function LiveStatsButton({ gameId, isDisabled }: LiveStatsButtonProps) {
  const [, navigate] = useLocation();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => navigate(`/game/${gameId}/details`)}
      // For position-based stats, enable the button even if the game is completed
      // This allows users to make corrections to statistics
      disabled={isDisabled && typeof isDisabled === 'boolean'}
      className="flex items-center gap-1"
    >
      <ActivitySquare className="h-4 w-4" />
      <span>Live Stats</span>
    </Button>
  );
}