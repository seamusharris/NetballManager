
import { Game, GameStat, Player, Roster } from '@shared/schema';
import { formatDate } from './utils';

interface FlourishExportOptions {
  games: Game[];
  stats: Record<number, GameStat[]>;
  scores: Record<number, any[]>;
  players: Player[];
  rosters: Record<number, Roster[]>;
  teamName: string;
  currentTeamId: number;
}

export class FlourishDataExporter {
  private options: FlourishExportOptions;

  constructor(options: FlourishExportOptions) {
    this.options = options;
  }

  /**
   * Export team performance data for bar chart race
   */
  exportTeamPerformanceOverTime(): string {
    const headers = ['Date', 'Game', 'Goals For', 'Goals Against', 'Goal Difference', 'Win Rate', 'Cumulative Wins'];
    const rows: string[][] = [headers];

    let cumulativeWins = 0;
    let totalGames = 0;

    const completedGames = this.options.games
      .filter(game => game.statusIsCompleted)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    completedGames.forEach((game, index) => {
      const gameStats = this.options.stats[game.id] || [];
      const gameScores = this.options.scores[game.id] || [];
      
      // Calculate team and opponent scores
      const teamScore = this.calculateTeamScore(game, gameStats, gameScores);
      const opponentScore = this.calculateOpponentScore(game, gameStats, gameScores);
      
      const goalDifference = teamScore - opponentScore;
      const isWin = teamScore > opponentScore;
      
      if (isWin) cumulativeWins++;
      totalGames++;
      
      const winRate = (cumulativeWins / totalGames) * 100;

      rows.push([
        formatDate(game.date),
        `Game ${index + 1}`,
        teamScore.toString(),
        opponentScore.toString(),
        goalDifference.toString(),
        winRate.toFixed(1),
        cumulativeWins.toString()
      ]);
    });

    return this.convertToCSV(rows);
  }

  /**
   * Export quarter performance data for heatmap
   */
  exportQuarterPerformanceHeatmap(): string {
    const headers = ['Quarter', 'Average Goals For', 'Average Goals Against', 'Goal Difference', 'Win Percentage'];
    const rows: string[][] = [headers];

    const quarterData = { 1: [], 2: [], 3: [], 4: [] } as Record<number, Array<{for: number, against: number, won: boolean}>>;

    this.options.games
      .filter(game => game.statusIsCompleted)
      .forEach(game => {
        const gameStats = this.options.stats[game.id] || [];
        const gameScores = this.options.scores[game.id] || [];
        
        for (let quarter = 1; quarter <= 4; quarter++) {
          const quarterStats = gameStats.filter(stat => stat.quarter === quarter);
          const quarterScores = gameScores.filter(score => score.quarter === quarter);
          
          const teamQuarterScore = this.calculateQuarterScore(game, quarterStats, quarterScores, quarter, true);
          const opponentQuarterScore = this.calculateQuarterScore(game, quarterStats, quarterScores, quarter, false);
          
          if (teamQuarterScore > 0 || opponentQuarterScore > 0) {
            quarterData[quarter].push({
              for: teamQuarterScore,
              against: opponentQuarterScore,
              won: teamQuarterScore > opponentQuarterScore
            });
          }
        }
      });

    for (let quarter = 1; quarter <= 4; quarter++) {
      const data = quarterData[quarter];
      if (data.length > 0) {
        const avgFor = data.reduce((sum, d) => sum + d.for, 0) / data.length;
        const avgAgainst = data.reduce((sum, d) => sum + d.against, 0) / data.length;
        const winCount = data.filter(d => d.won).length;
        const winPercentage = (winCount / data.length) * 100;

        rows.push([
          `Q${quarter}`,
          avgFor.toFixed(1),
          avgAgainst.toFixed(1),
          (avgFor - avgAgainst).toFixed(1),
          winPercentage.toFixed(1)
        ]);
      }
    }

    return this.convertToCSV(rows);
  }

  /**
   * Export position performance data
   */
  exportPositionPerformance(): string {
    const headers = ['Position', 'Games Played', 'Total Goals', 'Total Assists', 'Total Turnovers', 'Average Rating', 'Goals Per Game'];
    const rows: string[][] = [headers];

    const positions = ['GS', 'GA', 'WA', 'C', 'WD', 'GD', 'GK'];
    const positionData = {} as Record<string, {
      games: number;
      goals: number;
      assists: number;
      turnovers: number;
      ratings: number[];
    }>;

    // Initialize position data
    positions.forEach(pos => {
      positionData[pos] = { games: 0, goals: 0, assists: 0, turnovers: 0, ratings: [] };
    });

    // Aggregate stats by position
    this.options.games
      .filter(game => game.statusIsCompleted)
      .forEach(game => {
        const gameStats = this.options.stats[game.id] || [];
        const teamStats = gameStats.filter(stat => stat.teamId === this.options.currentTeamId);
        
        teamStats.forEach(stat => {
          const position = stat.position;
          if (position && positionData[position]) {
            positionData[position].games++;
            positionData[position].goals += stat.goalsFor || 0;
            positionData[position].assists += stat.rebounds || 0; // Using rebounds as assists proxy
            positionData[position].turnovers += stat.badPass || 0;
            if (stat.rating) positionData[position].ratings.push(stat.rating);
          }
        });
      });

    // Generate CSV rows
    positions.forEach(position => {
      const data = positionData[position];
      if (data.games > 0) {
        const avgRating = data.ratings.length > 0 ? data.ratings.reduce((sum, r) => sum + r, 0) / data.ratings.length : 0;
        const goalsPerGame = data.goals / data.games;

        rows.push([
          position,
          data.games.toString(),
          data.goals.toString(),
          data.assists.toString(),
          data.turnovers.toString(),
          avgRating.toFixed(1),
          goalsPerGame.toFixed(1)
        ]);
      }
    });

    return this.convertToCSV(rows);
  }

  /**
   * Export player network data for network visualization
   */
  exportPlayerNetworkData(): string {
    const headers = ['Player A', 'Player B', 'Games Together', 'Combined Performance', 'Connection Strength'];
    const rows: string[][] = [headers];

    const playerMap = this.options.players.reduce((map, player) => {
      map[player.id] = player.displayName;
      return map;
    }, {} as Record<number, string>);

    const playerConnections = {} as Record<string, {
      games: number;
      totalPerformance: number;
      playerAId: number;
      playerBId: number;
    }>;

    // Analyze player combinations in rosters
    this.options.games
      .filter(game => game.statusIsCompleted)
      .forEach(game => {
        const gameRosters = this.options.rosters[game.id] || [];
        const gameStats = this.options.stats[game.id] || [];
        
        // Group players by quarter
        const quarterPlayers = {} as Record<number, number[]>;
        
        gameRosters.forEach(roster => {
          if (!quarterPlayers[roster.quarter]) quarterPlayers[roster.quarter] = [];
          quarterPlayers[roster.quarter].push(roster.playerId);
        });

        // Calculate connections for each quarter
        Object.entries(quarterPlayers).forEach(([quarter, playerIds]) => {
          const quarterNum = parseInt(quarter);
          
          // Get performance for this quarter
          const quarterStats = gameStats.filter(stat => stat.quarter === quarterNum);
          const quarterPerformance = quarterStats.reduce((sum, stat) => sum + (stat.rating || 0), 0);
          
          // Create connections between all players in this quarter
          for (let i = 0; i < playerIds.length; i++) {
            for (let j = i + 1; j < playerIds.length; j++) {
              const playerA = playerIds[i];
              const playerB = playerIds[j];
              const connectionKey = `${Math.min(playerA, playerB)}-${Math.max(playerA, playerB)}`;
              
              if (!playerConnections[connectionKey]) {
                playerConnections[connectionKey] = {
                  games: 0,
                  totalPerformance: 0,
                  playerAId: Math.min(playerA, playerB),
                  playerBId: Math.max(playerA, playerB)
                };
              }
              
              playerConnections[connectionKey].games++;
              playerConnections[connectionKey].totalPerformance += quarterPerformance;
            }
          }
        });
      });

    // Generate CSV rows
    Object.entries(playerConnections).forEach(([key, data]) => {
      const playerAName = playerMap[data.playerAId] || 'Unknown';
      const playerBName = playerMap[data.playerBId] || 'Unknown';
      const avgPerformance = data.totalPerformance / data.games;
      const connectionStrength = Math.min(data.games * 2, 10); // Cap at 10 for visualization

      rows.push([
        playerAName,
        playerBName,
        data.games.toString(),
        avgPerformance.toFixed(1),
        connectionStrength.toString()
      ]);
    });

    return this.convertToCSV(rows);
  }

  /**
   * Export game timeline data for timeline visualization
   */
  exportGameTimeline(): string {
    const headers = ['Date', 'Opponent', 'Result', 'Team Score', 'Opponent Score', 'Goal Difference', 'Game Type'];
    const rows: string[][] = [headers];

    const completedGames = this.options.games
      .filter(game => game.statusIsCompleted)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    completedGames.forEach(game => {
      const gameStats = this.options.stats[game.id] || [];
      const gameScores = this.options.scores[game.id] || [];
      
      const teamScore = this.calculateTeamScore(game, gameStats, gameScores);
      const opponentScore = this.calculateOpponentScore(game, gameStats, gameScores);
      
      const result = teamScore > opponentScore ? 'Win' : 
                    teamScore < opponentScore ? 'Loss' : 'Draw';
      
      const opponent = this.getOpponentName(game);
      const gameType = this.getGameType(game);

      rows.push([
        formatDate(game.date),
        opponent,
        result,
        teamScore.toString(),
        opponentScore.toString(),
        (teamScore - opponentScore).toString(),
        gameType
      ]);
    });

    return this.convertToCSV(rows);
  }

  private calculateTeamScore(game: Game, stats: GameStat[], scores: any[]): number {
    // Use official scores if available, otherwise fall back to stats
    const officialScores = scores.filter(score => score.teamId === this.options.currentTeamId);
    if (officialScores.length > 0) {
      return officialScores.reduce((sum, score) => sum + score.score, 0);
    }
    
    const teamStats = stats.filter(stat => stat.teamId === this.options.currentTeamId);
    return teamStats.reduce((sum, stat) => sum + (stat.goalsFor || 0), 0);
  }

  private calculateOpponentScore(game: Game, stats: GameStat[], scores: any[]): number {
    // Use official scores if available, otherwise fall back to stats
    const officialScores = scores.filter(score => score.teamId !== this.options.currentTeamId);
    if (officialScores.length > 0) {
      return officialScores.reduce((sum, score) => sum + score.score, 0);
    }
    
    const teamStats = stats.filter(stat => stat.teamId === this.options.currentTeamId);
    return teamStats.reduce((sum, stat) => sum + (stat.goalsAgainst || 0), 0);
  }

  private calculateQuarterScore(game: Game, stats: GameStat[], scores: any[], quarter: number, isTeam: boolean): number {
    const quarterScores = scores.filter(score => score.quarter === quarter);
    const teamScores = quarterScores.filter(score => 
      isTeam ? score.teamId === this.options.currentTeamId : score.teamId !== this.options.currentTeamId
    );
    
    if (teamScores.length > 0) {
      return teamScores.reduce((sum, score) => sum + score.score, 0);
    }
    
    const quarterStats = stats.filter(stat => stat.quarter === quarter && stat.teamId === this.options.currentTeamId);
    return quarterStats.reduce((sum, stat) => sum + (isTeam ? (stat.goalsFor || 0) : (stat.goalsAgainst || 0)), 0);
  }

  private getOpponentName(game: Game): string {
    const isHome = game.homeTeamId === this.options.currentTeamId;
    return isHome ? (game.awayTeamName || 'Unknown') : (game.homeTeamName || 'Unknown');
  }

  private getGameType(game: Game): string {
    const isHome = game.homeTeamId === this.options.currentTeamId;
    return isHome ? 'Home' : 'Away';
  }

  private convertToCSV(rows: string[][]): string {
    return rows.map(row => 
      row.map(cell => {
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        const escaped = cell.replace(/"/g, '""');
        return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
      }).join(',')
    ).join('\n');
  }
}

// Export utility functions
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export function createFlourishExporter(options: FlourishExportOptions): FlourishDataExporter {
  return new FlourishDataExporter(options);
}
