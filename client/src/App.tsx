import React, { Suspense, lazy } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import Dashboard from "@/pages/Dashboard";
import Players from "@/pages/Players";
import Roster from "@/pages/Roster";
import Games from "@/pages/Games";
import Opponents from "@/pages/Opponents";
import Statistics from "@/pages/Statistics";
import PlayerDetails from "@/pages/PlayerDetails";
import Teams from "@/pages/Teams";
import ClubManagement from "./pages/ClubManagement";
import LiveStats from "@/pages/LiveStats";
import LiveStatsByPosition from "@/pages/LiveStatsByPosition";
import DataManagement from "@/pages/DataManagement";
import Settings from "@/pages/Settings";
import Seasons from "@/pages/Seasons";
import NotFound from "@/pages/not-found";

// Import GameDetails directly for now
import GameDetails from "./pages/GameDetails";
import OpponentAnalysis from './pages/OpponentAnalysis';
import OpponentDetailed from '@/pages/OpponentDetailed';

// Lazy load components
const StatsDebug = lazy(() => import("./pages/StatsDebug"));
const PerformanceDemo = lazy(() => import("./pages/PerformanceDemo"));

/**
 * Loading spinner component for suspense fallbacks
 */
function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center h-32 space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="text-sm text-muted-foreground">{message}</span>
    </div>
  );
}

/**
 * Wrap component with error boundary
 */
function withErrorBoundary(Component: React.ComponentType<any>, name: string) {
  return (props: any) => (
    <ErrorBoundary>
      <Component {...props} />
    </ErrorBoundary>
  );
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={withErrorBoundary(Dashboard, 'Dashboard')} />
        <Route path="/dashboard" component={withErrorBoundary(Dashboard, 'Dashboard')} />
        <Route path="/players" component={withErrorBoundary(Players, 'Players')} />
        <Route path="/players/:clubId" component={withErrorBoundary(Players, 'Players')} />
        <Route path="/player/:id" component={withErrorBoundary(PlayerDetails, 'PlayerDetails')} />
        <Route path="/teams" component={withErrorBoundary(Teams, 'Teams')} />
        <Route path="/teams/:clubId" component={withErrorBoundary(Teams, 'Teams')} />
        <Route path="/teams/:teamId/players" component={withErrorBoundary(Players, 'TeamPlayers')} />
        <Route path="/roster" component={withErrorBoundary(Roster, 'Roster')} />
        <Route path="/roster/:gameId" component={withErrorBoundary(Roster, 'Roster')} />
        <Route path="/games" component={withErrorBoundary(Games, 'Games')} />
        <Route path="/games/edit/:id" component={withErrorBoundary(Games, 'GameEdit')} />
        <Route path="/game/:id" component={withErrorBoundary(GameDetails, 'GameDetails')} />
        <Route path="/opponent-analysis" component={OpponentAnalysis} />
        <Route path="/opponent-analysis/detailed/:opponentId" component={OpponentDetailed} />
        <Route path="/opponents" component={Opponents} />
        <Route path="/statistics" component={withErrorBoundary(Statistics, 'Statistics')} />
        <Route path="/clubs" component={withErrorBoundary(ClubManagement, 'ClubManagement')} />
        <Route path="/data-management" component={withErrorBoundary(DataManagement, 'DataManagement')} />
        <Route path="/settings" component={withErrorBoundary(Settings, 'Settings')} />
        <Route path="/seasons" component={withErrorBoundary(Seasons, 'Seasons')} />
        <Route path="/game/:id/details" component={withErrorBoundary(LiveStats, 'LiveStats')} />
        <Route path="/game/:id/stats" component={withErrorBoundary(Statistics, 'GameStatistics')} />
        <Route path="/game/:id/livestats" component={withErrorBoundary(LiveStats, 'LiveStats')} />
        <Route path="/game/:id/stats-debug">
          {(params) => (
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner message="Loading debugging tools..." />}>
                <StatsDebug id={parseInt(params.id, 10)} />
              </Suspense>
            </ErrorBoundary>
          )}
        </Route>
        <Route path="/performance">
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner message="Loading performance demo..." />}>
              <PerformanceDemo />
            </Suspense>
          </ErrorBoundary>
        </Route>
        <Route component={withErrorBoundary(NotFound, 'NotFound')} />
      </Switch>
    </Layout>
  );
}

import { ClubProvider } from '@/contexts/ClubContext'; // Adding this line based on the instructions in <thinking>.

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ClubProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ClubProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;