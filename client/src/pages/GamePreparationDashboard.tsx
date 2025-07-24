import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, TrendingUp, Users, Calendar, Target } from "lucide-react";
import { useTeamContext } from "@/hooks/use-team-context";
import { apiClient } from "@/lib/apiClient";
import { DynamicBreadcrumbs } from "@/components/layout/DynamicBreadcrumbs";
import { formatShortDate } from "@/lib/utils";

interface Game {
  id: number;
  date: string;
  time: string;
  homeTeamId: number;
  awayTeamId: number;
  homeTeamName: string;
  awayTeamName: string;
  statusIsCompleted: boolean;
  statusDisplayName: string;
  round: number;
  seasonName: string;
}

export default function GamePreparationDashboard() {
  const params = useParams<{ teamId?: string; gameId?: string }>();
  const { teamId } = useTeamContext();
  const gameId = params.gameId ? parseInt(params.gameId) : undefined;

  // Load game data
  const { data: game, isLoading: loadingGame } = useQuery<Game>({
    queryKey: ["teams", teamId, "games", gameId],
    queryFn: () => apiClient.get(`/api/teams/${teamId}/games/${gameId}`),
    enabled: !!teamId && !!gameId,
  });

  // Calculate opponent information using standard pattern
  const isHomeGame = game ? game.homeTeamId === teamId : false;
  const opponent = game ? (isHomeGame ? game.awayTeamName : game.homeTeamName) : null;

  // Loading state
  if (loadingGame || !game) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-2 text-sm text-muted-foreground">Loading game data...</p>
        </div>
      </div>
    );
  }

  // Error state - no opponent found
  if (!opponent) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
          <p className="mt-2 text-sm text-muted-foreground">Unable to determine opponent for this game.</p>
        </div>
      </div>
    );
  }

  const preparationAreas = [
    {
      title: "Opponent Analysis",
      description: "Historical performance and statistics against this opponent",
      icon: TrendingUp,
      href: `/team/${teamId}/preparation/${gameId}/analysis`,
      color: "bg-blue-500",
    },
    {
      title: "Roster Management",
      description: "Select players and assign positions for the game",
      icon: Users,
      href: `/team/${teamId}/preparation/${gameId}/roster`,
      color: "bg-green-500",
    },
    {
      title: "Player Availability",
      description: "Track player availability and manage substitutions",
      icon: Calendar,
      href: `/team/${teamId}/preparation/${gameId}/availability`,
      color: "bg-purple-500",
    },
    {
      title: "Strategy & Tactics",
      description: "Create tactical notes and game objectives",
      icon: Target,
      href: `/team/${teamId}/preparation/${gameId}/strategy`,
      color: "bg-orange-500",
    },
  ];

  return (
    <>
      <Helmet>
        <title>{`Game Preparation - ${opponent} | Team Management`}</title>
        <meta name="description" content={`Game preparation dashboard for ${opponent} match`} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="container py-8 mx-auto space-y-8">
          {/* Breadcrumbs */}
          <DynamicBreadcrumbs />

          {/* Header */}
          <Card className="border-0 shadow-lg text-white" style={{ backgroundColor: "#1e3a8a" }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">
                    Game Preparation
                  </h1>
                  <p className="text-blue-100">
                    {game.homeTeamName} vs {game.awayTeamName} - {formatShortDate(game.date)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-blue-100">Round {game.round}</div>
                  <div className="text-sm text-blue-200">{isHomeGame ? "Home Game" : "Away Game"}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Game Overview */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Game Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{game.homeTeamName}</div>
                  <div className="text-sm text-gray-500">Home Team</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-400">vs</div>
                  <div className="text-sm text-gray-500">Match</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{game.awayTeamName}</div>
                  <div className="text-sm text-gray-500">Away Team</div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Date & Time</div>
                    <div className="font-medium">{formatShortDate(game.date)} at {game.time}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Status</div>
                    <div className="font-medium">{game.statusDisplayName}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preparation Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {preparationAreas.map((area) => (
              <Card key={area.title} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${area.color} text-white`}>
                      <area.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{area.title}</h3>
                      <p className="text-gray-600 mb-4">{area.description}</p>
                      <Button asChild className="w-full">
                        <a href={area.href}>
                          Open {area.title}
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center">
                  <TrendingUp className="h-6 w-6 mb-2" />
                  <span>View Team Stats</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center">
                  <Users className="h-6 w-6 mb-2" />
                  <span>Manage Roster</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center">
                  <Target className="h-6 w-6 mb-2" />
                  <span>Set Objectives</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
} 