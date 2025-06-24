/**
 * Unified Game Score Service
 * Single source of truth for all game score calculations across the application
 */

export interface GameScoreResult {
  ourScore: number;
  theirScore: number;
  result: 'win' | 'loss' | 'draw' | 'upcoming' | 'bye' | 'unknown' | 'inter-club';
  quarterBreakdown: QuarterScore[];
  hasValidScore: boolean;
  scoreSource: 'official' | 'status' | 'none';
  isInterClubGame?: boolean;
}

export interface QuarterScore {
  quarter: number;
  ourScore: number;
  theirScore: number;
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
        ourScore: 0,
        theirScore: 0,
        result: 'bye',
        quarterBreakdown: [],
        hasValidScore: false,
        scoreSource: 'none'
      };
    }

    // Handle upcoming games
    if (!game.statusIsCompleted) {
      return {
        ourScore: 0,
        theirScore: 0,
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
    const statusResult = this.calculateFromStatusScores(game, teamIds);
    if (statusResult.hasValidScore) {
      console.log(`🔍 UNIFIED SERVICE - Game ${game.id} using STATUS scores result:`, statusResult);
      return statusResult;
    }

    // No valid scores found
    console.log(`🔍 UNIFIED SERVICE - Game ${game.id} NO VALID scores found`);
    return {
      ourScore: 0,
      theirScore: 0,
      result: 'unknown',
      quarterBreakdown: [],
      hasValidScore: false,
      scoreSource: 'none'
    };
  }

  /**
   * Get game result (win/loss/draw) for display
   */
  static getGameResult(
    game: Game, 
    officialScores: OfficialScore[] = [], 
    perspective: number | 'club-wide' = 'club-wide',
    clubTeamIds: number[] = []
  ): 'win' | 'loss' | 'draw' | 'upcoming' | 'bye' | 'unknown' {
    const result = this.calculateGameScore(game, officialScores, perspective, clubTeamIds);
    return result.result;
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

    // For team perspective, show our score first
    if (typeof perspective === 'number') {
      return `${result.ourScore}-${result.theirScore}`;
    }

    // For club-wide perspective, show home-away format
    return this.getHomeAwayScoreDisplay(game, result, perspective);
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
      const result = this.calculateGameScore(game, officialScores, teamId, clubTeamIds);

      if (result.hasValidScore) {
        totalGames++;
        switch (result.result) {
          case 'win':
            wins++;
            break;
          case 'loss':
            losses++;
            break;
          case 'draw':
            draws++;
            break;
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
        ourScore: 0,
        theirScore: 0,
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

    let ourTotalScore = 0;
    let theirTotalScore = 0;
    const quarterBreakdown: QuarterScore[] = [];

    const { ourTeamId, theirTeamId } = teamIds;
    
    console.log(`🔍 UNIFIED SERVICE - Game ${game.id} official scores calculation:`, {
      ourTeamId,
      theirTeamId,
      homeTeamId: game.homeTeamId,
      awayTeamId: game.awayTeamId,
      scoresCount: officialScores.length
    });

    // Debug logging for Team 128 games regardless of perspective
    if (game.homeTeamId === 128 || game.awayTeamId === 128) {
      console.log(`🔍 UNIFIED SERVICE - Team 128 official scores for game ${game.id}:`, {
        perspective,
        homeTeamId: game.homeTeamId,
        awayTeamId: game.awayTeamId,
        ourTeamId,
        theirTeamId,
        officialScoresCount: officialScores.length,
        officialScores: officialScores.map(s => `Q${s.quarter}: T${s.teamId}=${s.score}`)
      });
    }





    // Calculate totals and quarter breakdown
    Object.keys(scoresByQuarter).forEach(quarterStr => {
      const quarter = parseInt(quarterStr);
      const quarterScores = scoresByQuarter[quarter];
      
      const ourQuarterScore = quarterScores[ourTeamId] || 0;
      const theirQuarterScore = quarterScores[theirTeamId] || 0;

      ourTotalScore += ourQuarterScore;
      theirTotalScore += theirQuarterScore;





      quarterBreakdown.push({
        quarter,
        ourScore: ourQuarterScore,
        theirScore: theirQuarterScore
      });
    });

    // Verify we have scores for both teams
    const ourTeamHasScores = officialScores.some(s => s.teamId === ourTeamId);
    const theirTeamHasScores = officialScores.some(s => s.teamId === theirTeamId);
    const hasValidScore = ourTeamHasScores && theirTeamHasScores;

    if (!hasValidScore) {
      return {
        ourScore: 0,
        theirScore: 0,
        result: 'unknown',
        quarterBreakdown: [],
        hasValidScore: false,
        scoreSource: 'none'
      };
    }

    // Sort quarter breakdown by quarter number
    quarterBreakdown.sort((a, b) => a.quarter - b.quarter);

    // Check if this is an inter-club game
    const isInterClubGame = clubTeamIds.length > 0 && 
      clubTeamIds.includes(game.homeTeamId || 0) && 
      clubTeamIds.includes(game.awayTeamId || 0);

    const result = this.determineResult(ourTotalScore, theirTotalScore, isInterClubGame);
    
    console.log(`🔍 UNIFIED SERVICE - Game ${game.id} OFFICIAL final calculation:`, {
      ourTotalScore,
      theirTotalScore,
      result,
      hasValidScore: true,
      quarterBreakdown: quarterBreakdown.length
    });

    return {
      ourScore: ourTotalScore,
      theirScore: theirTotalScore,
      result: isInterClubGame ? 'inter-club' : result,
      quarterBreakdown,
      hasValidScore: true,
      scoreSource: 'official',
      isInterClubGame
    };
  }

  private static calculateFromStatusScores(
    game: Game, 
    teamIds: { ourTeamId: number; theirTeamId: number }
  ): GameScoreResult {
    // Check if we have valid status scores
    if (typeof game.statusTeamGoals !== 'number' || typeof game.statusOpponentGoals !== 'number') {
      return {
        ourScore: 0,
        theirScore: 0,
        result: 'unknown',
        quarterBreakdown: [],
        hasValidScore: false,
        scoreSource: 'none'
      };
    }

    const { ourTeamId, theirTeamId } = teamIds;
    
    let ourScore: number;
    let theirScore: number;

    // Determine our score based on which team is ours
    if (game.homeTeamId === ourTeamId) {
      // We are home team
      ourScore = game.statusTeamGoals;
      theirScore = game.statusOpponentGoals;
    } else if (game.awayTeamId === ourTeamId) {
      // We are away team - statusTeamGoals is home score, statusOpponentGoals is away score
      ourScore = game.statusOpponentGoals;
      theirScore = game.statusTeamGoals;
    } else {
      // Team not involved in this game
      return {
        ourScore: 0,
        theirScore: 0,
        result: 'unknown',
        quarterBreakdown: [],
        hasValidScore: false,
        scoreSource: 'none'
      };
    }

    const result = this.determineResult(ourScore, theirScore);
    const hasValidScore = ourScore >= 0 && theirScore >= 0;

    console.log(`🔍 UNIFIED SERVICE - Game ${game.id} STATUS final calculation:`, {
      ourTeamId,
      theirTeamId,
      ourScore,
      theirScore,
      result,
      hasValidScore
    });

    return {
      ourScore,
      theirScore,
      result,
      quarterBreakdown: [],
      hasValidScore,
      scoreSource: 'status'
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
        // Perspective team not in this game - fallback to home vs away
        return { 
          ourTeamId: game.homeTeamId || 0, 
          theirTeamId: game.awayTeamId || 0 
        };
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
        console.log(`🔍 UNIFIED SERVICE - Game ${game.id} INTER-CLUB: our=${game.homeTeamId}, their=${game.awayTeamId}`);
        return { 
          ourTeamId: game.homeTeamId || 0, 
          theirTeamId: game.awayTeamId || 0 
        };
      } else if (homeIsOurs) {
        // Home team is ours
        console.log(`🔍 UNIFIED SERVICE - Game ${game.id} HOME IS OURS: our=${game.homeTeamId}, their=${game.awayTeamId}`);
        return { 
          ourTeamId: game.homeTeamId || 0, 
          theirTeamId: game.awayTeamId || 0 
        };
      } else if (awayIsOurs) {
        // Away team is ours
        console.log(`🔍 UNIFIED SERVICE - Game ${game.id} AWAY IS OURS: our=${game.awayTeamId}, their=${game.homeTeamId}`);
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

  private static getHomeAwayScoreDisplay(
    game: Game, 
    result: GameScoreResult, 
    perspective: number | 'club-wide'
  ): string {
    if (typeof perspective === 'number') {
      // For team perspective, determine home/away format
      if (game.homeTeamId === perspective) {
        // Current team is home
        return `${result.ourScore}-${result.theirScore}`;
      } else if (game.awayTeamId === perspective) {
        // Current team is away - flip for home-away display
        return `${result.theirScore}-${result.ourScore}`;
      }
    }

    // Club-wide or fallback - show as calculated
    return `${result.ourScore}-${result.theirScore}`;
  }
}

// Export singleton instance and static methods for easy importing
export const gameScoreService = UnifiedGameScoreService;
export default gameScoreService;