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
      onClick={() => navigate(`/games/${gameId}/livestats`)}
      disabled={isDisabled}
      className="flex items-center gap-1"
    >
      <ActivitySquare className="h-4 w-4" />
      <span>Live Stats</span>
    </Button>
  );
}