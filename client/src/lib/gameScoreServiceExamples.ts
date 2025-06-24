/**
 * Usage Examples for Unified Game Score Service
 * This file demonstrates how components will use the new service
 */

import { gameScoreService } from './unifiedGameScoreService';

// Example 1: GameResultCard usage
function exampleGameResultCard(game: any, centralizedScores: any[], currentTeamId: number) {
  // OLD WAY: 100+ lines of complex calculation logic
  // NEW WAY: Simple service calls
  
  const scoreResult = gameScoreService.calculateGameScore(game, centralizedScores, currentTeamId);
  const displayScore = gameScoreService.getDisplayScore(game, centralizedScores, currentTeamId);
  
  // Use results for styling
  const isWin = scoreResult.result === 'win';
  const isLoss = scoreResult.result === 'loss';
  const cardClass = isWin ? 'border-green-500' : isLoss ? 'border-red-500' : 'border-gray-500';
  
  return {
    score: displayScore,
    result: scoreResult.result,
    styling: cardClass,
    quarters: scoreResult.quarterBreakdown
  };
}

// Example 2: Win Rate Calculator usage
function exampleWinRateCalculation(games: any[], teamId: number, officialScoresMap: Record<number, any[]>) {
  // OLD WAY: Duplicate calculation logic in winRateCalculator.ts
  // NEW WAY: Single service call
  
  const winRate = gameScoreService.calculateWinRate(games, teamId, officialScoresMap);
  
  return {
    wins: winRate.wins,
    losses: winRate.losses,
    draws: winRate.draws,
    percentage: winRate.winRate,
    totalGames: winRate.totalGames
  };
}

// Example 3: Dashboard Summary usage
function exampleDashboardSummary(games: any[], currentTeamId: number, scoresBatch: Record<number, any[]>) {
  // Calculate team performance metrics
  const recentGames = games.slice(0, 5);
  const results = recentGames.map(game => {
    const scores = scoresBatch[game.id] || [];
    return gameScoreService.calculateGameScore(game, scores, currentTeamId);
  });
  
  // Aggregate results
  const wins = results.filter(r => r.result === 'win').length;
  const losses = results.filter(r => r.result === 'loss').length;
  const form = results.map(r => r.result === 'win' ? 'W' : r.result === 'loss' ? 'L' : 'D').join('');
  
  return { wins, losses, form };
}

// Example 4: Club-wide vs Team perspective
function examplePerspectiveHandling(game: any, officialScores: any[]) {
  // Team perspective (from team 123's view)
  const teamView = gameScoreService.calculateGameScore(game, officialScores, 123);
  console.log(`Team view: ${teamView.ourScore}-${teamView.theirScore} (${teamView.result})`);
  
  // Club-wide perspective (neutral view)
  const clubView = gameScoreService.calculateGameScore(game, officialScores, 'club-wide');
  console.log(`Club view: ${clubView.ourScore}-${clubView.theirScore}`);
  
  // Display strings
  const teamDisplay = gameScoreService.getDisplayScore(game, officialScores, 123);
  const clubDisplay = gameScoreService.getDisplayScore(game, officialScores, 'club-wide');
  
  return { teamView, clubView, teamDisplay, clubDisplay };
}

export { 
  exampleGameResultCard, 
  exampleWinRateCalculation, 
  exampleDashboardSummary, 
  examplePerspectiveHandling 
};