import React, { Suspense, lazy } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/layout/Layout";
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
import NotFound from "@/pages/not-found";

// Import GameDetails directly for now
import GameDetails from "./pages/GameDetails";

// Lazy load the debug component
const StatsDebug = lazy(() => import("./pages/StatsDebug"));

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/players" component={Players} />
        <Route path="/player/:id" component={PlayerDetails} />
        <Route path="/roster" component={Roster} />
        <Route path="/games" component={Games} />
        <Route path="/games/edit/:id" component={Games} />
        <Route path="/games/:id" component={GameDetails} />
        <Route path="/game/:id" component={GameDetails} />
        <Route path="/opponents" component={Opponents} />
        <Route path="/statistics" component={Statistics} />
        <Route path="/data-management" component={DataManagement} />
        <Route path="/games/:id/livestats" component={LiveStatsByPosition} />
        <Route path="/games/:id/livestats-legacy" component={LiveStats} />
        <Route path="/games/:id/stats-debug" component={() => (
          <Suspense fallback={<div>Loading debug tool...</div>}>
            <StatsDebug />
          </Suspense>
        )} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
