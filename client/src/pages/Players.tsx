import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from "wouter";
import { Helmet } from 'react-helmet';
import PlayersList from '@/components/players/PlayersList';
import { useClub } from '@/contexts/ClubContext';

export default function Players() {
  const { currentClub, switchToClub } = useClub();
  const params = useParams();
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);

  // Handle club ID from URL parameter
  useEffect(() => {
    const clubIdFromUrl = params.clubId;
    if (clubIdFromUrl && !isNaN(Number(clubIdFromUrl))) {
      const targetClubId = Number(clubIdFromUrl);
      if (currentClub?.id !== targetClubId) {
        switchToClub(targetClubId);
      }
    }
  }, [params.clubId, currentClub?.id, switchToClub]);

  const { data: players = [], isLoading, error } = useQuery({
    queryKey: ['players', currentClub?.id],
    queryFn: async () => {
      if (!currentClub?.id) return [];
      const response = await fetch(`/api/clubs/${currentClub.id}/players`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    enabled: !!currentClub?.id,
  });

  return (
    <>
      <Helmet>
        <title>Players | Team Manager</title>
      </Helmet>

      <PlayersList
        players={players}
        isLoading={isLoading}
        error={error}
        selectedPlayerId={selectedPlayerId}
        onSelectPlayer={setSelectedPlayerId}
      />
    </>
  );
}