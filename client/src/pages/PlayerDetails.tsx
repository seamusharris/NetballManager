import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlayerHeader from "@/components/players/PlayerHeader";
import PlayerSeasonStatsCard from "@/components/players/PlayerSeasonStatsCard";
import PlayerGameHistory from "@/components/players/PlayerGameHistory";
import { apiClient } from "@/lib/apiClient";

export default function PlayerDetails() {
  const { id } = useParams<{ id: string }>();
  const playerId = parseInt(id);

  // Fetch player data
  const { data: player, isLoading: isLoadingPlayer } = useQuery({
    queryKey: [`/api/players/${playerId}`],
    queryFn: () => apiClient.get(`/api/players/${playerId}`),
    enabled: !isNaN(playerId),
  });

  // Fetch teams
  const { data: teams = [], isLoading: isLoadingTeams } = useQuery({
    queryKey: [`/api/players/${playerId}/teams`],
    queryFn: () => apiClient.get(`/api/players/${playerId}/teams`),
    enabled: !isNaN(playerId),
  });

  // Fetch clubs
  const { data: clubs = [], isLoading: isLoadingClubs } = useQuery({
    queryKey: [`/api/players/${playerId}/clubs`],
    queryFn: () => apiClient.get(`/api/players/${playerId}/clubs`),
    enabled: !isNaN(playerId),
  });

  // Fetch real stats from backend
  const { data: playerStats, isLoading: isLoadingPlayerStats } = useQuery({
    queryKey: [`/api/players/${playerId}/stats`, 'season,team,club'],
    queryFn: () => apiClient.get(`/api/players/${playerId}/stats?groupBy=season,team,club`),
    enabled: !isNaN(playerId),
  });

  return (
    <div className="max-w-5xl mx-auto p-4">
      <PlayerHeader player={player} isLoading={isLoadingPlayer} teams={teams} clubs={clubs} />
      <Tabs defaultValue="overview" className="w-full mt-4">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="games">Games</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PlayerSeasonStatsCard playerStats={playerStats} isLoading={isLoadingPlayerStats} />
          </div>
          <div className="mt-6">
            <PlayerGameHistory playerId={playerId} />
          </div>
        </TabsContent>
        <TabsContent value="stats">
          <PlayerSeasonStatsCard playerStats={playerStats} isLoading={isLoadingPlayerStats} />
        </TabsContent>
        <TabsContent value="games">
          <PlayerGameHistory playerId={playerId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}