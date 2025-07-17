import { useLocation, useParams } from "wouter";
import { useClub } from "@/contexts/ClubContext";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { TEAM_NAME } from "@/lib/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import React from "react";
import SimplifiedGamesList from "@/components/ui/simplified-games-list";
import { useSimplifiedGames } from "@/hooks/use-simplified-games";
import { DynamicBreadcrumbs } from "@/components/layout/DynamicBreadcrumbs";

export default function Dashboard() {
  const params = useParams();
  const { currentClub, currentClubId, isLoading: clubLoading } = useClub();
  
  // Simple: get teamId directly from URL like GamePreparation page
  const teamIdFromUrl = params.teamId ? parseInt(params.teamId) : undefined;

  // Simple data fetching like GamePreparation page
  const { data: games = [], isLoading: isLoadingGames } = useSimplifiedGames(
    currentClubId!,
    teamIdFromUrl
  );

  // Simple data fetching - no complex batch operations for now

  // Simple loading state like GamePreparation page
  if (clubLoading || !currentClub) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-2 text-sm text-muted-foreground">Loading club data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Team Dashboard | {TEAM_NAME} Stats Tracker</title>
        <meta name="description" content={`View ${TEAM_NAME} team's performance metrics, upcoming games, and player statistics`} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="container py-8 mx-auto space-y-8">
          {/* Breadcrumbs */}
          <DynamicBreadcrumbs />

          {/* Clean Header */}
          <Card className="border-0 shadow-lg text-white" style={{ backgroundColor: "#1e3a8a" }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">
                    {currentClub?.name} Dashboard
                  </h1>
                  <p className="text-blue-100">Performance metrics and insights for your team</p>
                </div>
              </div>
            </CardContent>
          </Card>



          {/* Enhanced Content Grid with Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-md">
                Overview
              </TabsTrigger>
              <TabsTrigger value="recent" className="data-[state=active]:bg-white data-[state=active]:shadow-md">
                Recent Form
              </TabsTrigger>
              <TabsTrigger value="opponent" className="data-[state=active]:bg-white data-[state=active]:shadow-md">
                Opponent Form
              </TabsTrigger>
              <TabsTrigger value="season" className="data-[state=active]:bg-white data-[state=active]:shadow-md">
                Season Form
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              <div className="grid gap-8 lg:gap-10">
                {/* Two-column layout for Upcoming and Recent Games */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Upcoming Games - Left Column */}
                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle>Upcoming Games</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <SimplifiedGamesList
                        games={games.filter(game => game.status !== 'completed').slice(0, 5)}
                        currentTeamId={teamIdFromUrl ?? 0}
                        variant="upcoming"
                        maxGames={5}
                        compact={true}
                        showQuarterScores={false}
                        layout="medium"
                      />
                    </CardContent>
                  </Card>

                  {/* Recent Games - Right Column */}
                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle>Recent Games</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <SimplifiedGamesList
                        games={games.filter(game => game.status === 'completed').slice(0, 5)}
                        currentTeamId={teamIdFromUrl ?? 0}
                        variant="recent"
                        maxGames={5}
                        compact={true}
                        showQuarterScores={false}
                        layout="medium"
                        showViewMore={true}
                        viewMoreHref={`/team/${teamIdFromUrl}/games?status=completed`}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Team Performance Metrics - Simplified for now */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Team Performance Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Performance metrics will be added here later.</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="recent" className="space-y-8">
              {/* Recent Form Section - Simplified */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Recent Form</CardTitle>
                </CardHeader>
                <CardContent>
                  <SimplifiedGamesList
                    games={games.filter(game => game.status === 'completed').slice(0, 10)}
                    currentTeamId={teamIdFromUrl ?? 0}
                    variant="recent"
                    maxGames={10}
                    compact={false}
                    showQuarterScores={true}
                    layout="wide"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="opponent" className="space-y-8">
              {/* Opponent Form Section - Simplified */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Opponent Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Opponent analysis will be added here later.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="season" className="space-y-8">
              {/* Season Form Section - Simplified */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Season Form</CardTitle>
                </CardHeader>
                <CardContent>
                  <SimplifiedGamesList
                    games={games}
                    currentTeamId={teamIdFromUrl ?? 0}
                    variant="season"
                    compact={false}
                    showQuarterScores={true}
                    layout="wide"
                    showFilters={true}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
