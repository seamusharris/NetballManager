/**
 * Unified Game Score Service
 * Single source of truth for all game score calculations across the application
 */

export interface GameScoreResult {
  homeScore: number;
  awayScore: number;
  result: 'win' | 'loss' | 'draw' | 'upcoming' | 'bye' | 'unknown' | 'inter-club';
  quarterBreakdown: QuarterScore[];
  hasValidScore: boolean;
  scoreSource: 'official' | 'status' | 'none';
  isInterClubGame?: boolean;
}

export interface QuarterScore {
  quarter: number;
  homeScore: number;
  awayScore: number;
}

export interface WinRateResult {
  wins: number;
  losses: number;
  draws: number;
  totalGames: number;
  winRate: number;
}

interface OfficialScore {
  id: number;
  gameId: number;
  teamId: number;
  quarter: number;
  score: number;
}

interface Game {
  id: number;
  statusIsCompleted: boolean;
  statusName?: string;
  statusId?: number;
  homeTeamId: number | null;
  awayTeamId: number | null;
  homeTeamName?: string;
  awayTeamName?: string;
  statusTeamGoals?: number | null;
  statusOpponentGoals?: number | null;
  isBye?: boolean;
}

/**
 * Unified Game Score Service
 * Provides consistent score calculations across all components
 */
export class UnifiedGameScoreService {

  /**
   * Calculate game score from team or club perspective
   * @param game - Game data
   * @param officialScores - Array of official score entries
   * @param perspective - Team ID for team perspective, or 'club-wide' for neutral view
   * @returns Calculated score result with all relevant data
   */
  static calculateGameScore(
    game: Game, 
    officialScores: OfficialScore[] = [], 
    perspective: number | 'club-wide' = 'club-wide',
    clubTeamIds: number[] = []
  ): GameScoreResult {

    // Handle BYE games first
    if (this.isByeGame(game)) {
      return {
        homeScore: 0,
        awayScore: 0,
        result: 'bye',
        quarterBreakdown: [],
        hasValidScore: false,
        scoreSource: 'none'
      };
    }

    // Handle upcoming games
    if (!game.statusIsCompleted) {
      return {
        homeScore: 0,
        awayScore: 0,
        result: 'upcoming',
        quarterBreakdown: [],
        hasValidScore: false,
        scoreSource: 'none'
      };
    }

    // Determine team perspective and get team IDs
    const teamIds = this.getTeamIds(game, perspective, clubTeamIds);

    // Try official scores first (highest priority)
    const officialResult = this.calculateFromOfficialScores(game, officialScores, teamIds, clubTeamIds);
    if (officialResult.hasValidScore) {
      console.log(`🔍 UNIFIED SERVICE - Game ${game.id} using OFFICIAL scores result:`, officialResult);
      return officialResult;
    }

    // Fall back to status scores
    const statusResult = this.calculateFromStatusScores(game, teamIds, clubTeamIds);
    if (statusResult.hasValidScore) {
      console.log(`🔍 UNIFIED SERVICE - Game ${game.id} using STATUS scores result:`, statusResult);
      return statusResult;
    }

    // No valid scores found
    console.log(`🔍 UNIFIED SERVICE - Game ${game.id} NO VALID scores found`);
    return {
      homeScore: 0,
      awayScore: 0,
      result: 'unknown',
      quarterBreakdown: [],
      hasValidScore: false,
      scoreSource: 'none'
    };
  }

  /**
   * Get game result (win/loss/draw) for display from team perspective
   */
  static getGameResult(
    game: Game, 
    officialScores: OfficialScore[] = [], 
    perspective: number | 'club-wide' = 'club-wide',
    clubTeamIds: number[] = []
  ): 'win' | 'loss' | 'draw' | 'upcoming' | 'bye' | 'unknown' {
    const scores = this.calculateGameScore(game, officialScores, perspective, clubTeamIds);
    
    if (['bye', 'upcoming', 'unknown'].includes(scores.result as string)) {
      return scores.result;
    }
    
    // For team perspective, determine win/loss based on which team they are
    if (typeof perspective === 'number') {
      const isHomeTeam = game.homeTeamId === perspective;
      const teamScore = isHomeTeam ? scores.homeScore : scores.awayScore;
      const opponentScore = isHomeTeam ? scores.awayScore : scores.homeScore;
      
      if (teamScore > opponentScore) return 'win';
      if (teamScore < opponentScore) return 'loss';
      return 'draw';
    }
    
    // For club-wide perspective, no team-specific result
    return 'unknown';
  }

  /**
   * Get formatted score display string
   */
  static getDisplayScore(
    game: Game, 
    officialScores: OfficialScore[] = [], 
    perspective: number | 'club-wide' = 'club-wide',
    clubTeamIds: number[] = []
  ): string {
    const result = this.calculateGameScore(game, officialScores, perspective, clubTeamIds);

    if (result.result === 'bye') return 'BYE';
    if (result.result === 'upcoming') return '—';
    if (!result.hasValidScore) return '—';

    // Always show in Home-Away format for consistency
    return `${result.homeScore}-${result.awayScore}`;
  }

  /**
   * Calculate win rate for multiple games
   */
  static calculateWinRate(
    games: Game[], 
    teamId: number, 
    officialScoresMap: Record<number, OfficialScore[]> = {},
    clubTeamIds: number[] = []
  ): WinRateResult {
    const eligibleGames = games.filter(game => 
      game.statusIsCompleted && 
      (game.homeTeamId === teamId || game.awayTeamId === teamId) &&
      !this.isByeGame(game)
    );

    let wins = 0;
    let losses = 0;
    let draws = 0;
    let totalGames = 0;

    for (const game of eligibleGames) {
      const officialScores = officialScoresMap[game.id] || [];
      const scores = this.calculateGameScore(game, officialScores, teamId, clubTeamIds);
      
      if (scores.hasValidScore) {
        totalGames++;
        
        // Determine result from team perspective
        const isHomeTeam = game.homeTeamId === teamId;
        const teamScore = isHomeTeam ? scores.homeScore : scores.awayScore;
        const opponentScore = isHomeTeam ? scores.awayScore : scores.homeScore;
        
        if (teamScore > opponentScore) {
          wins++;
        } else if (teamScore < opponentScore) {
          losses++;
        } else {
          draws++;
        }
      }
    }

    const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;

    return {
      wins,
      losses,
      draws,
      totalGames,
      winRate
    };
  }

  // Private helper methods

  private static isByeGame(game: Game): boolean {
    return game.statusId === 6 || 
           game.statusName === 'bye' || 
           game.isBye === true ||
           game.awayTeamId === null;
  }

  private static calculateFromOfficialScores(
    game: Game, 
    officialScores: OfficialScore[], 
    teamIds: { ourTeamId: number; theirTeamId: number },
    clubTeamIds: number[] = []
  ): GameScoreResult {
    if (!officialScores.length) {
      return {
        homeScore: 0,
        awayScore: 0,
        result: 'unknown',
        quarterBreakdown: [],
        hasValidScore: false,
        scoreSource: 'none'
      };
    }

    // Group scores by quarter and team
    const scoresByQuarter: Record<number, Record<number, number>> = {};
    officialScores.forEach(score => {
      if (!scoresByQuarter[score.quarter]) {
        scoresByQuarter[score.quarter] = {};
      }
      scoresByQuarter[score.quarter][score.teamId] = score.score;
    });

    let homeTotalScore = 0;
    let awayTotalScore = 0;
    const quarterBreakdown: QuarterScore[] = [];

    const homeTeamId = game.homeTeamId || 0;
    const awayTeamId = game.awayTeamId || 0;

    console.log(`🔍 UNIFIED SERVICE - Game ${game.id} official scores calculation:`, {
      teamIds,
      homeTeamId: game.homeTeamId,
      awayTeamId: game.awayTeamId,
      scoresCount: officialScores.length
    });

    // Debug logging for Team 128 games regardless of perspective
    if (game.homeTeamId === 128 || game.awayTeamId === 128) {
      console.log(`🔍 UNIFIED SERVICE - Team 128 official scores for game ${game.id}:`, {
        homeTeamId: game.homeTeamId,
        awayTeamId: game.awayTeamId,
        teamIds,
        officialScoresCount: officialScores.length,
        officialScores: officialScores.map(s => `Q${s.quarter}: T${s.teamId}=${s.score}`)
      });
    }





    // Calculate quarter breakdown
    Object.keys(scoresByQuarter).forEach(quarterStr => {
      const quarter = parseInt(quarterStr);
      const quarterScores = scoresByQuarter[quarter];

      const homeQuarterScore = quarterScores[homeTeamId] || 0;
      const awayQuarterScore = quarterScores[awayTeamId] || 0;

      homeTotalScore += homeQuarterScore;
      awayTotalScore += awayQuarterScore;

      quarterBreakdown.push({
        quarter,
        homeScore: homeQuarterScore,
        awayScore: awayQuarterScore
      });
    });

    // Verify we have scores for both teams
    const homeTeamHasScores = officialScores.some(s => s.teamId === homeTeamId);
    const awayTeamHasScores = officialScores.some(s => s.teamId === awayTeamId);
    const hasValidScore = homeTeamHasScores && awayTeamHasScores;

    if (!hasValidScore) {
      return {
        homeScore: 0,
        awayScore: 0,
        result: 'unknown',
        quarterBreakdown: [],
        hasValidScore: false,
        scoreSource: 'none'
      };
    }

    // Sort quarter breakdown by quarter number
    quarterBreakdown.sort((a, b) => a.quarter - b.quarter);

    // Check if this is an inter-club game
    const homeIsOurs = clubTeamIds.includes(homeTeamId);
    const awayIsOurs = clubTeamIds.includes(awayTeamId);
    const isInterClubGame = homeIsOurs && awayIsOurs;
    
    // For display purposes, result is always from home team perspective for consistency
    let result: 'win' | 'loss' | 'draw' | 'inter-club';
    if (isInterClubGame) {
      result = 'inter-club';
    } else {
      result = this.determineHomeAwayResult(homeTotalScore, awayTotalScore);
    }

    console.log(`🔍 UNIFIED SERVICE - Game ${game.id} OFFICIAL final calculation:`, {
      homeTotalScore,
      awayTotalScore,
      result,
      isInterClubGame,
      hasValidScore: true,
      quarterBreakdown: quarterBreakdown.length
    });

    return {
      homeScore: homeTotalScore,
      awayScore: awayTotalScore,
      result,
      quarterBreakdown,
      hasValidScore: true,
      scoreSource: 'official',
      isInterClubGame
    };
  }

  private static calculateFromStatusScores(
    game: Game, 
    teamIds: { ourTeamId: number; theirTeamId: number },
    clubTeamIds: number[] = []
  ): GameScoreResult {
    // Check if game status has fixed scores (forfeit games, etc.)
    if (typeof game.statusTeamGoals !== 'number' || typeof game.statusOpponentGoals !== 'number') {
      return {
        homeScore: 0,
        awayScore: 0,
        result: 'unknown',
        quarterBreakdown: [],
        hasValidScore: false,
        scoreSource: 'none'
      };
    }

    // For status-based games (forfeit), scores are already in home/away format
    const homeScore = game.statusTeamGoals;
    const awayScore = game.statusOpponentGoals;

    // Check if this is an inter-club game
    const homeIsOurs = clubTeamIds.includes(game.homeTeamId || 0);
    const awayIsOurs = clubTeamIds.includes(game.awayTeamId || 0);
    const isInterClubGame = homeIsOurs && awayIsOurs;
    
    let result: 'win' | 'loss' | 'draw' | 'inter-club';
    if (isInterClubGame) {
      result = 'inter-club';
    } else {
      result = this.determineHomeAwayResult(homeScore, awayScore);
    }
    
    const hasValidScore = homeScore >= 0 && awayScore >= 0;

    console.log(`🔍 UNIFIED SERVICE - Game ${game.id} STATUS final calculation:`, {
      homeTeamId: game.homeTeamId,
      awayTeamId: game.awayTeamId,
      statusName: game.statusName,
      statusTeamGoals: game.statusTeamGoals,
      statusOpponentGoals: game.statusOpponentGoals,
      homeScore,
      awayScore,
      result,
      hasValidScore
    });

    return {
      homeScore,
      awayScore,
      result,
      quarterBreakdown: [],
      hasValidScore,
      scoreSource: 'status',
      isInterClubGame
    };
  }

  private static getTeamIds(game: Game, perspective: number | 'club-wide', clubTeamIds: number[] = []): { ourTeamId: number; theirTeamId: number } {
    if (typeof perspective === 'number') {
      // Team perspective - ensure perspective team is always returned as ourTeamId
      if (game.homeTeamId === perspective) {
        return { ourTeamId: perspective, theirTeamId: game.awayTeamId || 0 };
      } else if (game.awayTeamId === perspective) {
        return { ourTeamId: perspective, theirTeamId: game.homeTeamId || 0 };
      } else {
        // Perspective team not in this game - this should not happen for valid team perspectives
        console.warn(`Team ${perspective} not found in game ${game.id} (${game.homeTeamId} vs ${game.awayTeamId})`);
        return { ourTeamId: 0, theirTeamId: 0 }; // Invalid game for this team
      }
    }

    // Club-wide perspective - determine which team belongs to our club
    if (clubTeamIds.length > 0) {
      const homeIsOurs = clubTeamIds.includes(game.homeTeamId || 0);
      const awayIsOurs = clubTeamIds.includes(game.awayTeamId || 0);

      console.log(`🔍 UNIFIED SERVICE - Game ${game.id} getTeamIds:`, {
        homeTeamId: game.homeTeamId,
        awayTeamId: game.awayTeamId,
        clubTeamIds,
        homeIsOurs,
        awayIsOurs,
        perspective
      });

      if (homeIsOurs && awayIsOurs) {
        // Inter-club game: both teams are ours
        console.log('🔍 UNIFIED SERVICE - Game ' + game.id + ' INTER-CLUB: our=' + game.homeTeamId + ', their=' + game.awayTeamId);
        return { 
          ourTeamId: game.homeTeamId || 0, 
          theirTeamId: game.awayTeamId || 0 
        };
      } else if (homeIsOurs) {
        // Home team is ours
        console.log('🔍 UNIFIED SERVICE - Game ' + game.id + ' HOME IS OURS: our=' + game.homeTeamId + ', their=' + game.awayTeamId);
        return { 
          ourTeamId: game.homeTeamId || 0, 
          theirTeamId: game.awayTeamId || 0 
        };
      } else if (awayIsOurs) {
        // Away team is ours
        console.log('🔍 UNIFIED SERVICE - Game ' + game.id + ' AWAY IS OURS: our=' + game.awayTeamId + ', their=' + game.homeTeamId);
        return { 
          ourTeamId: game.awayTeamId || 0, 
          theirTeamId: game.homeTeamId || 0 
        };
      }
    }

    // Fallback to home vs away format
    return { 
      ourTeamId: game.homeTeamId || 0, 
      theirTeamId: game.awayTeamId || 0 
    };
  }

  private static determineResult(ourScore: number, theirScore: number, isInterClubGame: boolean = false): 'win' | 'loss' | 'draw' {
    console.log(`🔍 UNIFIED SERVICE - determineResult:`, {
      ourScore,
      theirScore,
      isInterClubGame,
      calculation: ourScore > theirScore ? 'WIN' : ourScore < theirScore ? 'LOSS' : 'DRAW'
    });

    if (isInterClubGame) {
      return 'inter-club';
    }

    if (ourScore > theirScore) return 'win';
    if (ourScore < theirScore) return 'loss';
    return 'draw';
  }

  private static determineHomeAwayResult(homeScore: number, awayScore: number): 'win' | 'loss' | 'draw' {
    // For neutral display, we use 'win' when home team wins, 'loss' when away wins
    if (homeScore > awayScore) return 'win';
    if (homeScore < awayScore) return 'loss';
    return 'draw';
  }
}

// Export singleton instance and static methods for easy importing
export const gameScoreService = UnifiedGameScoreService;
export default gameScoreService;