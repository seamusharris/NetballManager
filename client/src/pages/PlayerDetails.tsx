import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Calendar, BarChart3, Settings } from "lucide-react";
import PlayerHeader from "@/components/players/PlayerHeader";
import PlayerSeasonStatsCard from "@/components/players/PlayerSeasonStatsCard";
import PlayerGameHistory from "@/components/players/PlayerGameHistory";
import PlayerTeamsCard from "@/components/players/PlayerTeamsCard";
import PlayerTeamsManager from "@/components/players/PlayerTeamsManager";
import PlayerSeasonsManager from "@/components/players/PlayerSeasonsManager";
import { apiClient } from "@/lib/apiClient";

export default function PlayerDetails() {
  const { id } = useParams<{ id: string }>();
  const playerId = parseInt(id);
  
  // State for modals
  const [isTeamsManagerOpen, setIsTeamsManagerOpen] = useState(false);
  const [isSeasonsManagerOpen, setIsSeasonsManagerOpen] = useState(false);

  // Fetch player data
  const { data: player, isLoading: isLoadingPlayer } = useQuery({
    queryKey: [`/api/players/${playerId}`],
    queryFn: () => apiClient.get(`/api/players/${playerId}`),
    enabled: !isNaN(playerId),
  });

  // Teams are fetched by PlayerTeamsCard component

  // Fetch clubs
  const { data: clubs = [], isLoading: isLoadingClubs } = useQuery({
    queryKey: [`/api/players/${playerId}/clubs`],
    queryFn: () => apiClient.get(`/api/players/${playerId}/clubs`),
    enabled: !isNaN(playerId),
  });

  // Fetch seasons
  const { data: seasons = [], isLoading: isLoadingSeasons } = useQuery({
    queryKey: [`/api/players/${playerId}/seasons`],
    queryFn: () => apiClient.get(`/api/players/${playerId}/seasons`),
    enabled: !isNaN(playerId),
  });

  // Fetch real stats from backend
  const { data: playerStats, isLoading: isLoadingPlayerStats } = useQuery({
    queryKey: [`/api/players/${playerId}/stats`, 'season,team,club'],
    queryFn: () => apiClient.get(`/api/players/${playerId}/stats?groupBy=season,team,club`),
    enabled: !isNaN(playerId),
  });

  if (isLoadingPlayer) {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-xl mb-6"></div>
          <div className="h-96 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="max-w-5xl mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold text-red-600">Player Not Found</h1>
        <p className="text-gray-600 mt-2">The player you're looking for doesn't exist.</p>
      </div>
    );
  }

  const playerName = player.displayName || `${player.firstName} ${player.lastName}`;

  return (
    <>
      <Helmet>
        <title>{playerName} | Player Details</title>
      </Helmet>
      
      <div className="max-w-5xl mx-auto p-4">
        <PlayerHeader player={player} isLoading={isLoadingPlayer} teams={[]} clubs={clubs} />
        
        <Tabs defaultValue="overview" className="w-full mt-6">
          <TabsList className="mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="teams" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Teams
            </TabsTrigger>
            <TabsTrigger value="seasons" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Seasons
            </TabsTrigger>
            <TabsTrigger value="games" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Games
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PlayerSeasonStatsCard playerStats={playerStats} isLoading={isLoadingPlayerStats} />
              <PlayerTeamsCard playerId={playerId} />
            </div>
          </TabsContent>
          
          <TabsContent value="teams" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Team Management</h2>
              <Button onClick={() => setIsTeamsManagerOpen(true)}>
                <Users className="h-4 w-4 mr-2" />
                Manage Teams
              </Button>
            </div>
            <PlayerTeamsCard playerId={playerId} />
          </TabsContent>
          
          <TabsContent value="seasons" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Season Management</h2>
              <Button onClick={() => setIsSeasonsManagerOpen(true)}>
                <Calendar className="h-4 w-4 mr-2" />
                Manage Seasons
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Season cards will go here */}
              <div className="p-6 border rounded-lg">
                <h3 className="font-semibold mb-2">Active Seasons</h3>
                {seasons.length > 0 ? (
                  <ul className="space-y-2">
                    {seasons.map((season: any) => (
                      <li key={season.id} className="flex justify-between items-center">
                        <span>{season.name}</span>
                        <span className="text-sm text-gray-500">{season.year}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No seasons assigned</p>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="games" className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Game History</h2>
            <PlayerGameHistory playerId={playerId} />
          </TabsContent>
        </Tabs>

        {/* Management Modals */}
        {player && (
          <>
            <PlayerTeamsManager
              player={player}
              isOpen={isTeamsManagerOpen}
              onClose={() => setIsTeamsManagerOpen(false)}
            />
            <PlayerSeasonsManager
              player={player}
              seasons={seasons}
              isOpen={isSeasonsManagerOpen}
              onClose={() => setIsSeasonsManagerOpen(false)}
            />
          </>
        )}
      </div>
    </>
  );
}