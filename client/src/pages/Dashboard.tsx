import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { useClub } from '@/contexts/ClubContext';
import { PageHeader } from '@/components/ui/page-header';
import { SectionHeader } from '@/components/ui/section-header';
import { ContentBox } from '@/components/ui/content-box';
import { ActionButton } from '@/components/ui/action-button';
import { Plus, Settings, BarChart3 } from 'lucide-react';
import RecentGames from '@/components/dashboard/RecentGames';
import UpcomingGames from '@/components/dashboard/UpcomingGames';
import PlayerPerformance from '@/components/dashboard/PlayerPerformance';
import TeamPerformance from '@/components/dashboard/TeamPerformance';
import QuickActionsWidget from '@/components/dashboard/QuickActionsWidget';
import RecentFormWidget from '@/components/dashboard/RecentFormWidget';
import PlayerAnalyticsWidget from '@/components/dashboard/PlayerAnalyticsWidget';
import TopPlayersWidget from '@/components/dashboard/TopPlayersWidget';
import QuarterPerformanceWidget from '@/components/dashboard/QuarterPerformanceWidget';
import { UpcomingGameRecommendations } from '@/components/dashboard/UpcomingGameRecommendations';
import AdvancedTeamAnalytics from '@/components/dashboard/AdvancedTeamAnalytics';
import DashboardSummary from '@/components/dashboard/DashboardSummary';

export default function Dashboard() {
  const { currentClubId, currentTeamId } = useClub();

  const { data: team } = useQuery({
    queryKey: ['team', currentTeamId],
    queryFn: () => apiClient.get(`/api/teams/${currentTeamId}`),
    enabled: !!currentTeamId,
  });

  const { data: club } = useQuery({
    queryKey: ['club', currentClubId],
    queryFn: () => apiClient.get(`/api/clubs/${currentClubId}`),
    enabled: !!currentClubId,
  });

  if (!currentClubId || !currentTeamId) {
    return (
      <div className="page-layout">
        <PageHeader 
          title="Team Dashboard"
          subtitle="Please select a club and team to view the dashboard."
        />
      </div>
    );
  }

  const headerActions = (
    <>
      <ActionButton action="create" icon={Plus}>
        New Game
      </ActionButton>
      <ActionButton action="view" icon={BarChart3}>
        Analytics
      </ActionButton>
      <ActionButton action="manage" icon={Settings}>
        Settings
      </ActionButton>
    </>
  );

  const metadata = [
    `Club: ${club?.name || 'Loading...'}`,
    `Division: ${team?.division || 'Loading...'}`,
    `Season: Active`
  ];

  return (
    <div className="page-layout">
      <PageHeader 
        title={team?.name || 'Team Dashboard'}
        subtitle="Team performance overview and quick actions"
        metadata={metadata}
        actions={headerActions}
      />

      {/* Summary Stats */}
      <section className="page-section">
        <DashboardSummary />
      </section>

      {/* Quick Actions and Recent Form */}
      <section className="page-section">
        <div className="content-grid-3">
          <div className="lg:col-span-2 space-y-6">
            <ContentBox title="Recent Form" variant="default">
              <RecentFormWidget />
            </ContentBox>
            <ContentBox title="Recent Games" variant="default">
              <RecentGames />
            </ContentBox>
          </div>

          <div>
            <ContentBox title="Quick Actions" variant="highlighted">
              <QuickActionsWidget />
            </ContentBox>
          </div>
        </div>
      </section>

      {/* Player Performance Section */}
      <section className="page-section">
        <SectionHeader 
          title="Player Performance"
          subtitle="Individual player statistics and analytics"
        />
        <div className="content-grid-2">
          <ContentBox title="Player Analytics" variant="default">
            <PlayerAnalyticsWidget />
          </ContentBox>
          <ContentBox title="Top Performers" variant="default">
            <TopPlayersWidget />
          </ContentBox>
        </div>
      </section>

      {/* Team Analytics */}
      <section className="page-section">
        <SectionHeader 
          title="Team Analytics"
          subtitle="Comprehensive team performance insights"
        />
        <div className="content-grid-2">
          <ContentBox title="Quarter Performance" variant="default">
            <QuarterPerformanceWidget />
          </ContentBox>
          <ContentBox title="Advanced Analytics" variant="default">
            <AdvancedTeamAnalytics />
          </ContentBox>
        </div>
      </section>

      {/* Games Overview */}
      <section className="page-section">
        <SectionHeader 
          title="Games Overview"
          subtitle="Upcoming fixtures and strategic recommendations"
        />
        <div className="content-grid-2">
          <ContentBox title="Upcoming Games" variant="default">
            <UpcomingGames />
          </ContentBox>
          <ContentBox title="Game Recommendations" variant="default">
            <UpcomingGameRecommendations />
          </ContentBox>
        </div>
      </section>
    </div>
  );
}