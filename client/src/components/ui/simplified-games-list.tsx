import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Search } from 'lucide-react';
import SimpleGameResultCard from '@/components/ui/simple-game-result-card';
import { GamesContainer } from '@/components/ui/games-container';
import { ViewMoreButton } from '@/components/ui/view-more-button';
import type { SimpleGame } from '@/lib/simplifiedGamesFetcher';

interface SimplifiedGamesListProps {
  games: SimpleGame[];
  currentTeamId: number;
  
  // Display configuration
  variant?: 'dashboard' | 'season' | 'recent' | 'upcoming' | 'all';
  title?: string;
  maxGames?: number;
  compact?: boolean;
  layout?: 'narrow' | 'medium' | 'wide';
  
  // Feature toggles
  showQuarterScores?: boolean;
  showFilters?: boolean;
  showViewMore?: boolean;
  
  // Navigation
  viewMoreHref?: string;
  viewMoreText?: string;
  
  // Styling
  className?: string;
}

export default function SimplifiedGamesList({
  games = [],
  currentTeamId,
  variant = 'all',
  title,
  maxGames,
  compact = false,
  layout = 'wide',
  showQuarterScores = true,
  showFilters = false,
  showViewMore = false,
  viewMoreHref,
  viewMoreText = "View more →",
  className = ""
}: SimplifiedGamesListProps) {

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter and limit games based on variant, filters, and maxGames
  const displayGames = useMemo(() => {
    let filteredGames = [...games];
    
    // Apply search filter
    if (searchQuery && showFilters) {
      filteredGames = filteredGames.filter(game => 
        game.homeTeam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.awayTeam?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.round?.toString().includes(searchQuery) ||
        new Date(game.date).toLocaleDateString().includes(searchQuery)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all' && showFilters) {
      if (statusFilter === 'completed') {
        filteredGames = filteredGames.filter(game => game.status === 'completed');
      } else if (statusFilter === 'upcoming') {
        filteredGames = filteredGames.filter(game => game.status === 'scheduled' || game.status === 'upcoming');
      } else {
        filteredGames = filteredGames.filter(game => game.status === statusFilter);
      }
    }
    
    // Apply variant-specific filtering
    switch (variant) {
      case 'upcoming':
        filteredGames = filteredGames.filter(game => game.status === 'scheduled' || game.status === 'upcoming')
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // chronological
        break;
      case 'recent':
        filteredGames = filteredGames.filter(game => game.status === 'completed')
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // reverse chronological
        break;
      case 'season':
        filteredGames = filteredGames.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // reverse chronological
        break;
      default:
        // 'all', 'dashboard' - use reverse chronological by default
        filteredGames = filteredGames.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
    }
    
    // Apply maxGames limit
    return maxGames ? filteredGames.slice(0, maxGames) : filteredGames;
  }, [games, variant, maxGames, searchQuery, statusFilter, showFilters]);

  // Generate title based on variant if not provided
  const displayTitle = useMemo(() => {
    if (title) return title;
    
    switch (variant) {
      case 'upcoming': return 'Upcoming Games';
      case 'recent': return 'Recent Games';
      case 'season': return 'Season Games';
      case 'dashboard': return 'Games';
      default: return 'Games';
    }
  }, [title, variant]);

  if (displayGames.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-800">
            {displayTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-8">
            <AlertCircle className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600">No games found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-800">
          {displayTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Filters - only show if enabled */}
        {showFilters && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-wrap justify-between gap-4">
                <div className="w-[360px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Search games..."
                      className="pl-10 pr-4 py-2 w-full"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-3 items-center">
                  {/* Status Filter */}
                  <div className="w-[140px]">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All Games" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Games</SelectItem>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="forfeit-win">Forfeit Win</SelectItem>
                        <SelectItem value="forfeit-loss">Forfeit Loss</SelectItem>
                        <SelectItem value="bye">BYE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    className="bg-accent hover:bg-accent-light text-white"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <GamesContainer spacing={compact ? "compact" : "normal"}>
          {displayGames.map((game) => (
            <SimpleGameResultCard
              key={game.id}
              homeTeam={game.homeTeam}
              awayTeam={game.awayTeam}
              quarterScores={game.quarterScores}
              currentTeamId={currentTeamId}
              gameInfo={{
                id: game.id,
                date: game.date,
                round: game.round,
                status: game.status
              }}
              layout={layout}
              showQuarterScores={showQuarterScores}
              showLink={true}
              showDate={true}
              showRound={true}
              showScore={true}
              hasStats={game.hasStats}
            />
          ))}
        </GamesContainer>
        
        {showViewMore && viewMoreHref && (
          <div className="mt-4 text-center">
            <ViewMoreButton href={viewMoreHref}>
              {viewMoreText}
            </ViewMoreButton>
          </div>
        )}
      </CardContent>
    </Card>
  );
}