import React, { Suspense, lazy, useEffect, startTransition } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import ClubProvider from '@/contexts/ClubContext';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import Dashboard from "@/pages/Dashboard";
import Players from "@/pages/Players";
import Roster from "@/pages/Roster";
import Games from "@/pages/Games";
import Statistics from "@/pages/Statistics";
import ClubDashboard from '@/pages/ClubDashboard';
import HomePage from '@/pages/HomePage';
import PlayerDetails from '@/pages/PlayerDetails';
import Teams from "@/pages/Teams";
import ClubManagement from "./pages/ClubManagement";
import LiveStats from "@/pages/LiveStats";
import LiveStatsByPosition from "@/pages/LiveStatsByPosition";
import Settings from '@/pages/Settings';
import ComponentExamples from '@/pages/ComponentExamples';
import Seasons from "@/pages/Seasons";
import NotFound from "@/pages/not-found";
import PerformanceDashboard from "@/pages/PerformanceDashboard";
import { useClub } from '@/contexts/ClubContext';
import { apiClient } from '@/lib/apiClient';
import { queryClient } from '@/lib/queryClient';

// Import GameDetails directly for now
import GameDetails from "./pages/GameDetails";

// Lazy load components with startTransition wrapper
const StatsDebug = lazy(() => import("./pages/StatsDebug"));
const StatsRecorder = lazy(() => import("./pages/StatsRecorder"));
import OpponentPreparation from '@/pages/OpponentPreparation';
import GameResultExamples from '@/pages/GameResultExamples';
import RoundBadgeExamples from '@/pages/RoundBadgeExamples';
import PlayerBoxExamples from '@/pages/PlayerBoxExamples';
import PositionBadgeGridExamples from '@/pages/PositionBadgeGridExamples';
import PlayerBoxTestPage from '@/pages/PlayerBoxTestPage';
import TeamBoxExamples from './pages/TeamBoxExamples';
import ActionButtonExamples from './pages/ActionButtonExamples';
import AllPlayersDesignExamples from './pages/AllPlayersDesignExamples';
import DashboardExamples from '@/pages/DashboardExamples';
import WidgetExamples from './pages/WidgetExamples';
import FormExamples from './pages/FormExamples';
import ChartExamples from './pages/ChartExamples';
const CourtLayoutExamples = lazy(() => import('./pages/CourtLayoutExamples'));
import LayoutExamples from './pages/LayoutExamples';
import ColorExamples from './pages/ColorExamples';
import ColorStyleGuide from './pages/ColorStyleGuide';
import TimelineExamples from './pages/TimelineExamples';
import StatisticsCardExamples from './pages/StatisticsCardExamples';
import TooltipExamples from './pages/TooltipExamples';
import DropdownExamples from './pages/DropdownExamples';
import NavigationExamples from './pages/NavigationExamples';
import TableExamples from './pages/TableExamples';
import ListExamples from './pages/ListExamples';
import ModalExamples from './pages/ModalExamples';
import SearchExamples from './pages/SearchExamples';
import LoadingExamples from './pages/LoadingExamples';
import ErrorExamples from './pages/ErrorExamples';
import ToastExamples from './pages/ToastExamples';
import ResultBadgeComponent from './pages/ResultBadgeExamples';
import Reference from './pages/Reference';
import SplitViewExamples from './pages/SplitViewExamples';
import GridExamples from './pages/GridExamples';
import CardCollectionExamples from './pages/CardCollectionExamples';
import TournamentBracketExamples from './pages/TournamentBracketExamples';
const MatchTimelineExamples = lazy(() => import('./pages/MatchTimelineExamples'));
const PositionRotationExamples = lazy(() => import('./pages/PositionRotationExamples'));
const TeamFormationExamples = lazy(() => import('./pages/TeamFormationExamples'));
const ScoreProgressionExamples = lazy(() => import('./pages/ScoreProgressionExamples'));
const SubstitutionFlowExamples = lazy(() => import('./pages/SubstitutionFlowExamples'));
const RosterManagementExamples = lazy(() => import('./pages/RosterManagementExamples'));
const LiveStatsInterfaceExamples = lazy(() => import('./pages/LiveStatsInterfaceExamples'));
import RecommendationExamples from './pages/RecommendationExamples';
import PlayerBorrowing from '@/pages/PlayerBorrowing';
import TeamAnalysis from './pages/TeamAnalysis';
import Preparation from '@/pages/Preparation';
import GamePreparation from '@/pages/GamePreparation';
import TeamPreparation from './pages/TeamPreparation';
import Preparation2 from './pages/Preparation2';
import TeamLadder from './pages/TeamLadder';
import TeamPerformanceExamples from './pages/TeamPerformanceExamples';
// Import actual components for PlayerAvailability and RosterGame
import PlayerAvailability from '@/pages/PlayerAvailability';
import RosterGame from '@/pages/RosterGame';
import TeamPlayersManager from '@/components/teams/TeamPlayersManager';
const RosterWithGameId = () => <div>Roster with Game ID Component</div>;
import DragDropExamples from '@/pages/DragDropExamples';
import LiveScoreTrackingExamples from './pages/LiveScoreTrackingExamples';
import ApiStandardizationTest from '@/pages/ApiStandardizationTest';
import GameListTestPage from '@/pages/GameListTestPage';


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
        <Route path="/" component={withErrorBoundary(HomePage, 'HomePage')} />
        
        {/* New club-scoped routes */}
        <Route path="/club/:clubId" component={withErrorBoundary(ClubDashboard, 'ClubDashboard')} />
        <Route path="/club/:clubId/teams" component={withErrorBoundary(Teams, 'Teams')} />
        <Route path="/club/:clubId/team/:teamId" component={withErrorBoundary(Dashboard, 'Dashboard')} />
        <Route path="/club/:clubId/team/:teamId/games" component={withErrorBoundary(Games, 'Games')} />
        <Route path="/club/:clubId/team/:teamId/players" component={withErrorBoundary(TeamPlayersManager, 'TeamPlayersManager')} />
        <Route path="/club/:clubId/team/:teamId/roster" component={withErrorBoundary(Roster, 'Roster')} />
        <Route path="/club/:clubId/team/:teamId/game/:gameId" component={withErrorBoundary(GameDetails, 'GameDetails')} />

        <Route path="/club/:clubId/team/:teamId/roster/:gameId" component={withErrorBoundary(RosterGame, 'RosterGame')} />
        <Route path="/club/:clubId/team/:teamId/preparation" component={withErrorBoundary(GamePreparation, 'GamePreparation')} />
        <Route path="/club/:clubId/team/:teamId/preparation/:gameId" component={withErrorBoundary(GamePreparation, 'GamePreparation')} />
        <Route path="/club/:clubId/team/:teamId/analysis" component={withErrorBoundary(TeamPreparation, 'TeamPreparation')} />
        <Route path="/club/:clubId/team/:teamId/analysis/:opponentId" component={withErrorBoundary(TeamPreparation, 'TeamPreparation')} />
        <Route path="/club/:clubId/team/:teamId/game/:gameId/stats/:action">
          {(params = {} as Record<string, string>) => (
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner message="Loading stats recorder..." />}>
                <StatsRecorder 
                  gameId={parseInt(params.gameId || '0', 10)} 
                  teamId={parseInt(params.teamId || '0', 10)} 
                />
              </Suspense>
            </ErrorBoundary>
          )}
        </Route>
        
        {/* Legacy routes for backward compatibility */}
        <Route path="/team/:teamId/dashboard" component={withErrorBoundary(Dashboard, 'Dashboard')} />
        <Route path="/team/:teamId" component={withErrorBoundary(Dashboard, 'Dashboard')} />
        <Route path="/players" component={withErrorBoundary(Players, 'Players')} />
        <Route path="/club/:clubId/players" component={withErrorBoundary(Players, 'Players')} />
        <Route path="/players/:clubId" component={withErrorBoundary(Players, 'Players')} />
        <Route path="/player/:id" component={withErrorBoundary(PlayerDetails, 'PlayerDetails')} />
        <Route path="/teams" component={withErrorBoundary(Teams, 'Teams')} />
        <Route path="/club/:clubId/teams" component={withErrorBoundary(Teams, 'Teams')} />
        <Route path="/teams/:clubId" component={withErrorBoundary(Teams, 'Teams')} />
        <Route path="/games" component={withErrorBoundary(Games, 'Games')} />
        <Route path="/club/:clubId/games" component={withErrorBoundary(Games, 'Games')} />
        <Route path="/team/:teamId/players" component={withErrorBoundary(TeamPlayersManager, 'TeamPlayersManager')} />
        <Route path="/team/:teamId/availability" component={withErrorBoundary(PlayerAvailability, 'PlayerAvailability')} />
        <Route path="/team/:teamId/availability/:gameId" component={withErrorBoundary(PlayerAvailability, 'PlayerAvailability')} />
        <Route path="/team/:teamId/roster/game/:gameId" component={withErrorBoundary(RosterGame, 'RosterGame')} />
        <Route path="/team/:teamId/roster/:gameId" component={withErrorBoundary(RosterGame, 'RosterGame')} />
        <Route path="/team/:teamId/roster" component={withErrorBoundary(Roster, 'Roster')} />
        <Route path="/team/:teamId/games" component={withErrorBoundary(Games, 'Games')} />
        <Route path="/team/:teamId/games/:gameId/edit" component={withErrorBoundary(Games, 'GameEdit')} />
        <Route path="/team/:teamId/game/:gameId" component={withErrorBoundary(GameDetails, 'GameDetails')} />
        <Route path="/team/:teamId/preparation/:gameId" component={withErrorBoundary(GamePreparation, 'GamePreparation')} />
        <Route path="/team/:teamId/preparation" component={withErrorBoundary(GamePreparation, 'GamePreparation')} />
        <Route path="/team/:teamId/analysis" component={withErrorBoundary(TeamPreparation, 'TeamPreparation')} />
        <Route path="/team/:teamId/analysis/:opponentId" component={withErrorBoundary(TeamPreparation, 'TeamPreparation')} />
        <Route path="/club-dashboard" component={withErrorBoundary(ClubDashboard, 'ClubDashboard')} />

        <Route path="/statistics" component={withErrorBoundary(Statistics, 'Statistics')} />
        <Route path="/clubs" component={withErrorBoundary(ClubManagement, 'ClubManagement')} />
        <Route path="/settings" component={Settings} />
        <Route path="/performance-dashboard" component={withErrorBoundary(PerformanceDashboard, 'PerformanceDashboard')} />
        <Route path="/component-examples" component={ComponentExamples} />
        <Route path="/api-tests" component={withErrorBoundary(ApiStandardizationTest, 'ApiStandardizationTest')} />
        <Route path="/seasons" component={withErrorBoundary(Seasons, 'Seasons')} />
        <Route path="/game/:id" component={withErrorBoundary(GameDetails, 'GameDetails')} />
        <Route path="/game/:id/details" component={withErrorBoundary(LiveStats, 'LiveStats')} />
        <Route path="/game/:id/stats" component={withErrorBoundary(Statistics, 'GameStatistics')} />
        <Route path="/game/:gameId/team/:teamId/stats/record">
          {(params = {} as Record<string, string>) => (
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner message="Loading stats recorder..." />}>
                <StatsRecorder 
                  gameId={parseInt(params.gameId || '0', 10)} 
                  teamId={parseInt(params.teamId || '0', 10)} 
                />
              </Suspense>
            </ErrorBoundary>
          )}
        </Route>
        <Route path="/game/:id/livestats" component={withErrorBoundary(LiveStats, 'LiveStats')} />
        <Route path="/game/:id/livestats-legacy" component={withErrorBoundary(LiveStats, 'LiveStats')} />
        <Route path="/game/:id/stats-debug">
          {(params = {} as Record<string, string>) => (
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner message="Loading debugging tools..." />}>
                <StatsDebug id={parseInt(params.id || '0', 10)} />
              </Suspense>
            </ErrorBoundary>
          )}
        </Route>

        <Route path="/opponent-preparation" component={OpponentPreparation} />
        <Route path="/preparation" component={Preparation} />
        <Route path="/preparation-2" component={Preparation2} />
        <Route path="/game-preparation/:gameId" component={withErrorBoundary(GamePreparation, 'GamePreparation')} />
        <Route path="/game-preparation" component={withErrorBoundary(GamePreparation, 'GamePreparation')} />
        <Route path="/team-analysis" component={TeamAnalysis} />
        <Route path="/game-result-examples" component={withErrorBoundary(GameResultExamples, 'GameResultExamples')} />
        <Route path="/round-badge-examples" component={withErrorBoundary(RoundBadgeExamples, 'RoundBadgeExamples')} />
        <Route path="/player-box-examples" component={withErrorBoundary(PlayerBoxExamples, 'PlayerBoxExamples')} />
        <Route path="/position-badge-grid-examples" component={withErrorBoundary(PositionBadgeGridExamples, 'PositionBadgeGridExamples')} />
        <Route path="/drag-drop-examples" component={withErrorBoundary(DragDropExamples, 'DragDropExamples')} />
        <Route path="/team-box-examples" component={TeamBoxExamples} />
        <Route path="/action-button-examples" component={ActionButtonExamples} />
        <Route path="/all-players-design-examples" component={AllPlayersDesignExamples} />
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
        <Route path="/color-style-guide" component={ColorStyleGuide} />
        <Route path="/navigation-examples" component={NavigationExamples} />
        <Route path="/table-examples" component={TableExamples} />
        <Route path="/list-examples" component={ListExamples} />
        <Route path="/timeline-examples" component={TimelineExamples} />
        <Route path="/statistics-card-examples" component={StatisticsCardExamples} />
        <Route path="/modal-examples" component={ModalExamples} />
        <Route path="/tooltip-examples" component={TooltipExamples} />
        <Route path="/dropdown-examples" component={DropdownExamples} />
        <Route path="/search-examples" component={SearchExamples} />
        <Route path="/loading-examples" component={LoadingExamples} />
        <Route path="/error-examples" component={ErrorExamples} />
        <Route path="/toast-examples" component={ToastExamples} />
        <Route path="/reference" component={Reference} />
        <Route path="/reference/result-badge-component">
          {() => (
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner message="Loading Result Badge Reference..." />}>
                {(() => {
                  const ResultBadgeExamples = lazy(() => import('./pages/ResultBadgeExamples'));
                  return <ResultBadgeExamples />;
                })()}
              </Suspense>
            </ErrorBoundary>
          )}
        </Route>
        <Route path="/reference/playerbox-component">
          {() => (
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner message="Loading PlayerBox Reference..." />}>
                {(() => {
                  const PlayerBoxReference = lazy(() => import('./pages/PlayerBoxReference'));
                  return <PlayerBoxReference />;
                })()}
              </Suspense>
            </ErrorBoundary>
          )}
        </Route>
        <Route path="/reference/game-result-card-component">
          {() => (
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner message="Loading GameResultCard Reference..." />}>
                {(() => {
                  const GameResultCardReference = lazy(() => import('./pages/GameResultCardReference'));
                  return <GameResultCardReference />;
                })()}
              </Suspense>
            </ErrorBoundary>
          )}
        </Route>
        <Route path="/reference/position-component">
          {() => (
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner message="Loading Position Component Reference..." />}>
                {(() => {
                  const PositionComponentReference = lazy(() => import('./pages/PositionComponentReference'));
                  return <PositionComponentReference />;
                })()}
              </Suspense>
            </ErrorBoundary>
          )}
        </Route>
        <Route path="/split-view-examples" component={SplitViewExamples} />
        <Route path="/grid-examples" component={GridExamples} />
        <Route path="/card-collection-examples" component={CardCollectionExamples} />
        <Route path="/recommendation-examples" component={RecommendationExamples} />
        <Route path="/team-ladder" component={withErrorBoundary(TeamLadder, 'TeamLadder')} />
        <Route path="/tournament-bracket-examples" component={TournamentBracketExamples} />
        <Route path="/substitution-flow-examples" component={SubstitutionFlowExamples} />
        <Route path="/roster-management-examples">
          {() => (
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner message="Loading Roster Management Examples..." />}>
                <RosterManagementExamples />
              </Suspense>
            </ErrorBoundary>
          )}
        </Route>
        <Route path="/live-stats-interface-examples">
          {() => (
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner message="Loading Live Stats Interface Examples..." />}>
                <LiveStatsInterfaceExamples />
              </Suspense>
            </ErrorBoundary>
          )}
        </Route>
        <Route path="/match-timeline-examples">
          {() => (
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner message="Loading Match Timeline Examples..." />}>
                <MatchTimelineExamples />
              </Suspense>
            </ErrorBoundary>
          )}
        </Route>
        <Route path="/position-rotation-examples">
          {() => (
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner message="Loading Position Rotation Examples..." />}>
                <PositionRotationExamples />
              </Suspense>
            </ErrorBoundary>
          )}
        </Route>
        <Route path="/team-formation-examples">
          {() => (
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner message="Loading Team Formation Examples..." />}>
                <TeamFormationExamples />
              </Suspense>
            </ErrorBoundary>
          )}
        </Route>
        <Route path="/team-performance-examples" component={TeamPerformanceExamples} />
        <Route path="/score-progression-examples">
          {() => (
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner message="Loading Score Progression Examples..." />}>
                <ScoreProgressionExamples />
              </Suspense>
            </ErrorBoundary>
          )}
        </Route>
        <Route path="/player-box-test" component={PlayerBoxTestPage} />
        <Route path="/game-list-test" component={withErrorBoundary(GameListTestPage, 'GameListTest')} />
        <Route path="/examples/game-results" component={withErrorBoundary(GameResultExamples, 'GameResultExamples')} />
        <Route path="/examples/score-progression" component={withErrorBoundary(ScoreProgressionExamples, 'ScoreProgressionExamples')} />
            <Route path="/live-score-tracking-examples" component={LiveScoreTrackingExamples} />
        <Route component={withErrorBoundary(NotFound, 'NotFound')} />
      </Switch>
    </Layout>
  );
}




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