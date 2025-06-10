import React, { Suspense, lazy, useEffect } from "react";
import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ClubProvider } from '@/contexts/ClubContext';
import { initializeCacheManager } from '@/lib/cacheManager';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import Dashboard from "@/pages/Dashboard";
import Players from "@/pages/Players";
import Roster from "@/pages/Roster";
import Games from "@/pages/Games";
import Statistics from "@/pages/Statistics";
import ClubDashboard from '@/pages/ClubDashboard';
import PlayerDetails from "@/pages/PlayerDetails";
import Teams from "@/pages/Teams";
import ClubManagement from "./pages/ClubManagement";
import LiveStats from "@/pages/LiveStats";
import LiveStatsByPosition from "@/pages/LiveStatsByPosition";
import DataManagement from "@/pages/DataManagement";
import Settings from "@/pages/Settings";
import Seasons from "@/pages/Seasons";
import NotFound from "@/pages/not-found";
import { useClub } from '@/contexts/ClubContext';
import { apiClient } from '@/lib/apiClient';

// Import GameDetails directly for now
import GameDetails from "./pages/GameDetails";

// Lazy load components
const StatsDebug = lazy(() => import("./pages/StatsDebug"));
const PerformanceDemo = lazy(() => import("./pages/PerformanceDemo"));
import OpponentPreparation from '@/pages/OpponentPreparation';

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

import PlayerBorrowing from '@/pages/PlayerBorrowing';
import TeamAnalysis from '@/pages/TeamAnalysis';
import GameResultExamples from '@/pages/GameResultExamples';

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={withErrorBoundary(ClubDashboard, 'ClubDashboard')} />
        <Route path="/team-dashboard" component={withErrorBoundary(Dashboard, 'Dashboard')} />
        <Route path="/dashboard" component={withErrorBoundary(Dashboard, 'Dashboard')} />
        <Route path="/dashboard/:teamId" component={withErrorBoundary(Dashboard, 'Dashboard')} />
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
        <Route path="/club-dashboard" component={withErrorBoundary(ClubDashboard, 'ClubDashboard')} />

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
        <Route path="/team-analysis" component={withErrorBoundary(TeamAnalysis, 'TeamAnalysis')} />
        <Route path="/opponent-preparation" component={OpponentPreparation} />
        <Route path="/performance-demo" component={PerformanceDemo} />
        <Route path="/game-result-examples" component={GameResultExamples} />
        <Route component={withErrorBoundary(NotFound, 'NotFound')} />
      </Switch>
    </Layout>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Initialize cache manager
initializeCacheManager(queryClient);

function AppContent() {
  try {
    const { isInitialized } = useClub();
    
    if (!isInitialized) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner message="Initializing application..." />
        </div>
      );
    }
    
    return <Router />;
  } catch (error) {
    console.error('AppContent error:', error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner message="Loading club context..." />
      </div>
    );
  }
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ClubProvider>
        <TooltipProvider>
          <AppContent />
          <Toaster />
        </TooltipProvider>
      </ClubProvider>
    </QueryClientProvider>
  );
}

export default App;