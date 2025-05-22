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
import LiveStats from "@/pages/LiveStats";
import LiveStatsByPosition from "@/pages/LiveStatsByPosition";
import DataManagement from "@/pages/DataManagement";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

// Import GameDetails directly for now
import GameDetails from "./pages/GameDetails";

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
        <Route path="/player/:id" component={withErrorBoundary(PlayerDetails, 'PlayerDetails')} />
        <Route path="/roster" component={withErrorBoundary(Roster, 'Roster')} />
        <Route path="/games" component={withErrorBoundary(Games, 'Games')} />
        <Route path="/games/edit/:id" component={withErrorBoundary(Games, 'GameEdit')} />
        <Route path="/game/:id" component={withErrorBoundary(GameDetails, 'GameDetails')} />
        <Route path="/opponents" component={withErrorBoundary(Opponents, 'Opponents')} />
        <Route path="/statistics" component={withErrorBoundary(Statistics, 'Statistics')} />
        <Route path="/data-management" component={withErrorBoundary(DataManagement, 'DataManagement')} />
        <Route path="/settings" component={withErrorBoundary(Settings, 'Settings')} />
        <Route path="/game/:id/livestats" component={withErrorBoundary(LiveStats, 'LiveStats')} />
        <Route path="/game/:id/stats" component={withErrorBoundary(GameDetails, 'GameDetails')} />
        <Route path="/game/:id/livestats-legacy" component={withErrorBoundary(LiveStatsByPosition, 'LiveStatsPositions')} />
        <Route path="/game/:id/stats-debug">
          {(params) => (
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner message="Loading debugging tools..." />}>
                <StatsDebug id={params.id} />
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary>
          <Toaster />
          <Router />
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
