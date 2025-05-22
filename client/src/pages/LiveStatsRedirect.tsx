import { useEffect } from 'react';
import { useParams, useLocation } from 'wouter';

/**
 * This component serves as a redirect wrapper that ensures
 * users get sent to the proper live stats page
 */
export default function LiveStatsRedirect() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();

  useEffect(() => {
    // Immediately redirect to the legacy live stats page
    navigate(`/game/${id}/livestats-legacy`);
  }, [id, navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <p className="text-lg">Redirecting to stats entry page...</p>
    </div>
  );
}