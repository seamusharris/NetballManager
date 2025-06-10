import React, { Suspense, lazy, useEffect, startTransition } from "react";
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
import GameResultExamples from '@/pages/GameResultExamples';
import RoundBadgeExamples from '@/pages/RoundBadgeExamples';
import PlayerBoxExamples from './pages/PlayerBoxExamples';
import TeamBoxExamples from './pages/TeamBoxExamples';
import ActionButtonExamples from './pages/ActionButtonExamples';
import ComponentExamples from '@/pages/ComponentExamples';
import DashboardExamples from '@/pages/DashboardExamples';
import WidgetExamples from './pages/WidgetExamples';
import FormExamples from './pages/FormExamples';
import ChartExamples from './pages/ChartExamples';
const CourtLayoutExamples = lazy(() => import('./pages/CourtLayoutExamples'));
import LayoutExamples from './pages/LayoutExamples';
import ColorExamples from './pages/ColorExamples';

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
        <Route path="/games/:teamId" component={withErrorBoundary(Games, 'Games')} />
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
        <Route path="/game-result-examples" component={withErrorBoundary(GameResultExamples, 'GameResultExamples')} />
        <Route path="/round-badge-examples" component={withErrorBoundary(RoundBadgeExamples, 'RoundBadgeExamples')} />
        <Route path="/player-box-examples" component={withErrorBoundary(PlayerBoxExamples, 'PlayerBoxExamples')} />
        <Route path="/team-box-examples" component={withErrorBoundary(TeamBoxExamples, 'TeamBoxExamples')} />
        <Route path="/action-button-examples" component={ActionButtonExamples} />
        <Route path="/component-examples" component={ComponentExamples} />
        <Route path="/dashboard-examples" component={DashboardExamples} />
        <Route path="/widget-examples" component={WidgetExamples} />
        <Route path="/form-examples" component={FormExamples} />
        <Route path="/chart-examples" component={ChartExamples} />
        <Route path="/court-layout-examples">
          {() => (
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner message="Loading Court Layout Examples..." />}>
                <CourtLayoutExamples />
              </Suspense>
            </ErrorBoundary>
          )}
        </Route>
        <Route path="/layout-examples" component={LayoutExamples} />
        <Route path="/color-examples" component={ColorExamples} />
        <Route path="/navigation-examples" component={() => import('./pages/NavigationExamples').then(m => m.default)} />
        <Route path="/table-examples" component={() => import('./pages/TableExamples').then(m => m.default)} />
        <Route path="/list-examples" component={() => import('./pages/ListExamples').then(m => m.default)} />
        <Route path="/timeline-examples" component={() => import('./pages/TimelineExamples').then(m => m.default)} />
        <Route path="/statistics-card-examples" component={() => import('./pages/StatisticsCardExamples').then(m => m.default)} />
        <Route path="/modal-examples" component={() => import('./pages/ModalExamples').then(m => m.default)} />
        <Route path="/tooltip-examples" component={() => import('./pages/TooltipExamples').then(m => m.default)} />
        <Route path="/dropdown-examples" component={() => import('./pages/DropdownExamples').then(m => m.default)} />
        <Route path="/search-examples" component={() => import('./pages/SearchExamples').then(m => m.default)} />
        <Route path="/loading-examples" component={() => import('./pages/LoadingExamples').then(m => m.default)} />
        <Route path="/error-examples" component={() => import('./pages/ErrorExamples').then(m => m.default)} />
        <Route path="/toast-examples" component={() => import('./pages/ToastExamples').then(m => m.default)} />
        <Route path="/split-view-examples" component={() => import('./pages/SplitViewExamples').then(m => m.default)} />
        <Route path="/grid-examples" component={() => import('./pages/GridExamples').then(m => m.default)} />
        <Route path="/card-collection-examples" component={() => import('./pages/CardCollectionExamples').then(m => m.default)} />
        <Route path="/tournament-bracket-examples" component={() => import('./pages/TournamentBracketExamples').then(m => m.default)} />
        <Route path="/match-timeline-examples" component={() => import('./pages/MatchTimelineExamples').then(m => m.default)} />
        <Route path="/position-rotation-examples" component={() => import('./pages/PositionRotationExamples').then(m => m.default)} />
        <Route path="/team-formation-examples" component={() => import('./pages/TeamFormationExamples').then(m => m.default)} />
        <Route path="/score-progression-examples" component={() => import('./pages/ScoreProgressionExamples').then(m => m.default)} />
        <Route path="/substitution-flow-examples" component={() => import('./pages/SubstitutionFlowExamples').then(m => m.default)} />
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