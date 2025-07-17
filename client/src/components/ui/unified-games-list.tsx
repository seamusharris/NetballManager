import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Search, Edit, Trash2, Eye } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import GameResultCard from '@/components/ui/game-result-card';
import { GamesContainer } from '@/components/ui/games-container';
import { ViewMoreButton } from '@/components/ui/view-more-button';

interface UnifiedGamesListProps {
  games: any[];
  currentTeamId: number;
  currentClubId: number;
  // Stable batch data - no || {} patterns needed
  batchStats?: Record<number, any[]>;
  batchScores?: Record<number, any>;
  batchRosters?: Record<number, any[]>;
  
  // Display configuration
  variant?: 'dashboard' | 'season' | 'opponent' | 'recent' | 'upcoming' | 'all';
  title?: string;
  maxGames?: number;
  compact?: boolean;
  layout?: 'narrow' | 'medium' | 'wide';
  
  // Feature toggles
  showAnalytics?: boolean;
  showQuarterScores?: boolean;
  showFilters?: boolean;
  showViewMore?: boolean;
  showActions?: boolean;
  
  // Action handlers
  onEdit?: (game: any) => void;
  onDelete?: (id: number) => void;
  onViewStats?: (id: number) => void;
  
  // Navigation
  viewMoreHref?: string;
  viewMoreText?: string;
  
  // Styling
  className?: string;
  clubTeams?: any[];
}

// Stable empty references - created once, reused everywhere
const EMPTY_STATS: any[] = [];
const EMPTY_SCORES: any[] = []; // Should be array, not object
const EMPTY_ROSTERS: any[] = [];

export default function UnifiedGamesList({
  games = [],
  currentTeamId,
  currentClubId,
  batchStats = {},
  batchScores = {},
  batchRosters = {},
  variant = 'all',
  title,
  maxGames,
  compact = false,
  layout = 'wide',
  showAnalytics = true,
  showQuarterScores = true,
  showFilters = false,
  showViewMore = false,
  viewMoreHref,
  viewMoreText = "View more →",
  className = "",
  clubTeams = []
}: UnifiedGamesListProps) {

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Stable references to prevent re-renders
  const stableStats = useMemo(() => batchStats, [batchStats]);
  const stableScores = useMemo(() => batchScores, [batchScores]);
  const stableRosters = useMemo(() => batchRosters, [batchRosters]);
  
  // Pre-compute stable lookups to avoid || patterns in render
  const gameStatsLookup = useMemo(() => {
    const lookup: Record<number, any[]> = {};
    games.forEach(game => {
      lookup[game.id] = stableStats[game.id] || EMPTY_STATS;
    });
    return lookup;
  }, [games, stableStats]);
  
  const gameScoresLookup = useMemo(() => {
    const lookup: Record<number, any[]> = {};
    games.forEach(game => {
      lookup[game.id] = stableScores[game.id] || EMPTY_SCORES;
    });
    return lookup;
  }, [games, stableScores]);
  
  // Filter and limit games based on variant, filters, and maxGames
  const displayGames = useMemo(() => {
    let filteredGames = [...games];
    
    // Apply search filter
    if (searchQuery && showFilters) {
      filteredGames = filteredGames.filter(game => 
        game.opponent?.teamName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.round?.toString().includes(searchQuery) ||
        new Date(game.date).toLocaleDateString().includes(searchQuery) ||
        game.homeTeamName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.awayTeamName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all' && showFilters) {
      if (statusFilter === 'completed') {
        filteredGames = filteredGames.filter(game => game.statusIsCompleted === true);
      } else if (statusFilter === 'upcoming') {
        filteredGames = filteredGames.filter(game => game.statusIsCompleted !== true && game.statusName !== 'bye');
      } else {
        filteredGames = filteredGames.filter(game => game.statusName === statusFilter);
      }
    }
    
    // Apply variant-specific filtering
    switch (variant) {
      case 'upcoming':
        filteredGames = filteredGames.filter(game => !game.statusIsCompleted);
        break;
      case 'recent':
        filteredGames = filteredGames.filter(game => game.statusIsCompleted)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'season':
        // Already filtered by caller, just sort by date
        filteredGames = filteredGames.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      default:
        // 'all', 'dashboard', 'opponent' - use games as provided
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
      case 'opponent': return 'Previous Games';
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
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="forfeit-win">Forfeit Win</SelectItem>
                        <SelectItem value="forfeit-loss">Forfeit Loss</SelectItem>
                        <SelectItem value="bye">BYE</SelectItem>
                        <SelectItem value="abandoned">Abandoned</SelectItem>
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
            <GameResultCard
              key={game.id}
              game={game}
              layout={layout}
              currentTeamId={currentTeamId}
              currentClubId={currentClubId}
              clubTeams={clubTeams}
              // Use pre-computed stable lookups - no || [] patterns in render
              gameStats={gameStatsLookup[game.id]}
              centralizedScores={gameScoresLookup[game.id]}
              showQuarterScores={showQuarterScores}
              showLink={true}
              showDate={true}
              showRound={true}
              showScore={true}
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