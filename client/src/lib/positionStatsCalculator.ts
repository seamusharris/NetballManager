// Removed unused import

export interface PositionTotals {
  'GS': { goalsFor: number; games: number };
  'GA': { goalsFor: number; games: number };
  'GD': { goalsAgainst: number; games: number };
  'GK': { goalsAgainst: number; games: number };
}

export interface PositionAverages {
  gsAvgGoalsFor: number;
  gaAvgGoalsFor: number;
  gdAvgGoalsAgainst: number;
  gkAvgGoalsAgainst: number;
  attackingPositionsTotal: number;
  defendingPositionsTotal: number;
  gamesWithPositionStats: number;
}

export interface UnifiedGameData {
  gameId: number;
  teamId: number;
  officialScores: {
    q1: number;
    q2: number;
    q3: number;
    q4: number;
    total: number;
  };
  positionBreakdown: {
    gsPercentage: number;
    gaPercentage: number;
    gkPercentage: number;
    gdPercentage: number;
  };
  hasPositionStats: boolean;
}

export interface UnifiedPositionAverages {
  gsAvgGoalsFor: number;
  gaAvgGoalsFor: number;
  gdAvgGoalsAgainst: number;
  gkAvgGoalsAgainst: number;
  attackingPositionsTotal: number;
  defendingPositionsTotal: number;
  gamesWithOfficialScores: number;
  gamesWithPositionStats: number;
}

interface QuarterByQuarterStats {
  quarter: number;
  gsGoalsFor: number;
  gaGoalsFor: number;
  gdGoalsAgainst: number;
  gkGoalsAgainst: number;
  gamesWithQuarterData: number;
  hasValidData: boolean;
  dataQuality: 'complete' | 'partial' | 'fallback' | 'no-data';
}

/**
 * Calculate position percentages from position stats
 */
function calculatePositionPercentages(positionStats: any[], teamId: number): {
  gsPercentage: number;
  gaPercentage: number;
  gkPercentage: number;
  gdPercentage: number;
} {
  const teamStats = positionStats.filter(stat => Number(stat.teamId) === Number(teamId));
  
  let totalGoalsFor = 0;
  let totalGoalsAgainst = 0;
  let gsGoalsFor = 0;
  let gaGoalsFor = 0;
  let gkGoalsAgainst = 0;
  let gdGoalsAgainst = 0;

  teamStats.forEach(stat => {
    if (stat.position === 'GS' && typeof stat.goalsFor === 'number') {
      gsGoalsFor += stat.goalsFor;
      totalGoalsFor += stat.goalsFor;
    }
    if (stat.position === 'GA' && typeof stat.goalsFor === 'number') {
      gaGoalsFor += stat.goalsFor;
      totalGoalsFor += stat.goalsFor;
    }
    if (stat.position === 'GK' && typeof stat.goalsAgainst === 'number') {
      gkGoalsAgainst += stat.goalsAgainst;
      totalGoalsAgainst += stat.goalsAgainst;
    }
    if (stat.position === 'GD' && typeof stat.goalsAgainst === 'number') {
      gdGoalsAgainst += stat.goalsAgainst;
      totalGoalsAgainst += stat.goalsAgainst;
    }
  });

  // Calculate percentages, default to 50/50 if no data
  const gsPercentage = totalGoalsFor > 0 ? (gsGoalsFor / totalGoalsFor) * 100 : 50;
  const gaPercentage = totalGoalsFor > 0 ? (gaGoalsFor / totalGoalsFor) * 100 : 50;
  const gkPercentage = totalGoalsAgainst > 0 ? (gkGoalsAgainst / totalGoalsAgainst) * 100 : 50;
  const gdPercentage = totalGoalsAgainst > 0 ? (gdGoalsAgainst / totalGoalsAgainst) * 100 : 50;

  return {
    gsPercentage,
    gaPercentage,
    gkPercentage,
    gdPercentage
  };
}

/**
 * Unified data processing that uses official scores for totals and position stats for breakdowns
 */
export function processUnifiedGameData(
  games: any[],
  batchScores: Record<string, any[]>,
  batchStats: Record<string, any[]>,
  currentTeamId: number
): {
  unifiedData: UnifiedGameData[];
  averages: UnifiedPositionAverages;
} {


  const unifiedData: UnifiedGameData[] = [];
  let totalGoalsFor = 0;
  let totalGoalsAgainst = 0;
  let gamesWithOfficialScores = 0;
  let gamesWithPositionStats = 0;

  // Calculate overall position percentages from all available position stats
  const allPositionStats = Object.values(batchStats).flat();
  const overallPercentages = calculatePositionPercentages(allPositionStats, currentTeamId);


  games.forEach(game => {
    const gameScores = batchScores[game.id.toString()] || batchScores[game.id] || [];
    const gameStats = batchStats[game.id.toString()] || batchStats[game.id];
    
    if (!gameScores || gameScores.length === 0) {
      return; // Skip games without official scores
    }

    // Process scores like QuarterPerformanceAnalysis does
    const transformedScores = Array.isArray(gameScores) ? gameScores.map(score => ({
      id: score.id,
      gameId: score.gameId,
      teamId: score.teamId,
      quarter: score.quarter,
      score: score.score,
      enteredBy: score.enteredBy,
      enteredAt: score.enteredAt,
      updatedAt: score.updatedAt,
      notes: score.notes
    })) : [];

    // Calculate quarter scores for current team (ATTACK - what we scored)
    const q1 = transformedScores.find(s => s.teamId === currentTeamId && s.quarter === 1)?.score || 0;
    const q2 = transformedScores.find(s => s.teamId === currentTeamId && s.quarter === 2)?.score || 0;
    const q3 = transformedScores.find(s => s.teamId === currentTeamId && s.quarter === 3)?.score || 0;
    const q4 = transformedScores.find(s => s.teamId === currentTeamId && s.quarter === 4)?.score || 0;
    
    const gameGoalsFor = q1 + q2 + q3 + q4;

    
    // Calculate quarter scores for opponent (DEFENSE - what we conceded)
    const opponentQ1 = transformedScores.find(s => s.teamId !== currentTeamId && s.quarter === 1)?.score || 0;
    const opponentQ2 = transformedScores.find(s => s.teamId !== currentTeamId && s.quarter === 2)?.score || 0;
    const opponentQ3 = transformedScores.find(s => s.teamId !== currentTeamId && s.quarter === 3)?.score || 0;
    const opponentQ4 = transformedScores.find(s => s.teamId !== currentTeamId && s.quarter === 4)?.score || 0;
    const gameGoalsAgainst = opponentQ1 + opponentQ2 + opponentQ3 + opponentQ4;

    
    if (gameGoalsFor > 0 || gameGoalsAgainst > 0) {
      gamesWithOfficialScores++;
      totalGoalsFor += gameGoalsFor;
      totalGoalsAgainst += gameGoalsAgainst;
      

    }

    // Calculate position breakdown for this specific game
    let positionBreakdown = overallPercentages; // Default to overall percentages
    let hasPositionStats = false;
    
    if (gameStats && gameStats.length > 0) {
      const gamePercentages = calculatePositionPercentages(gameStats, currentTeamId);
      // Use game-specific percentages if we have position stats for this game
      if (gameStats.some(stat => Number(stat.teamId) === Number(currentTeamId))) {
        positionBreakdown = gamePercentages;
        hasPositionStats = true;
        gamesWithPositionStats++;
      }
    }

    unifiedData.push({
      gameId: game.id,
      teamId: currentTeamId,
      officialScores: { q1, q2, q3, q4, total: gameGoalsFor },
      positionBreakdown,
      hasPositionStats
    });
  });



  // Calculate overall position percentages from all games
  let totalGsGoals = 0;
  let totalGaGoals = 0;
  let totalGkGoals = 0;
  let totalGdGoals = 0;
  
  unifiedData.forEach(gameData => {
    if (gameData.officialScores.total > 0) {
      // For Attack: GS and GA scored goals
      totalGsGoals += gameData.officialScores.total * (gameData.positionBreakdown.gsPercentage / 100);
      totalGaGoals += gameData.officialScores.total * (gameData.positionBreakdown.gaPercentage / 100);
    }
  });

  // Calculate averages using official scores and position percentages
  const gsAvgGoalsFor = gamesWithOfficialScores > 0 ? 
    Math.round((totalGsGoals / gamesWithOfficialScores) * 10) / 10 : 0;
  const gaAvgGoalsFor = gamesWithOfficialScores > 0 ? 
    Math.round((totalGaGoals / gamesWithOfficialScores) * 10) / 10 : 0;
  
  // For Defense: Calculate opponent goals conceded
  const gkAvgGoalsAgainst = gamesWithOfficialScores > 0 ? 
    Math.round((totalGoalsAgainst * (overallPercentages.gkPercentage / 100) / gamesWithOfficialScores) * 10) / 10 : 0;
  const gdAvgGoalsAgainst = gamesWithOfficialScores > 0 ? 
    Math.round((totalGoalsAgainst * (overallPercentages.gdPercentage / 100) / gamesWithOfficialScores) * 10) / 10 : 0;

  const attackingPositionsTotal = gsAvgGoalsFor + gaAvgGoalsFor;
  const defendingPositionsTotal = gkAvgGoalsAgainst + gdAvgGoalsAgainst;

  const averages: UnifiedPositionAverages = {
    gsAvgGoalsFor,
    gaAvgGoalsFor,
    gdAvgGoalsAgainst,
    gkAvgGoalsAgainst,
    attackingPositionsTotal,
    defendingPositionsTotal,
    gamesWithOfficialScores,
    gamesWithPositionStats
  };

  return { unifiedData, averages };
}

/**
 * Calculate position-based statistics from game stats (legacy function for backward compatibility)
 * @param games - Array of games to analyze
 * @param batchStats - Stats data keyed by game ID
 * @param currentTeamId - ID of the team to calculate stats for
 * @returns Calculated position averages
 */
export function calculatePositionAverages(
  games: any[],
  batchStats: Record<string, any[]>,
  currentTeamId: number
): PositionAverages {
  // Simplified calculation - assume stats are already filtered by the API for the correct team
  let gsGoalsFor = 0;
  let gaGoalsFor = 0;
  let gdGoalsAgainst = 0;
  let gkGoalsAgainst = 0;
  let gamesWithPositionStats = 0;

  games.forEach((game, gameIndex) => {
    const gameStats = batchStats[game.id.toString()] || batchStats[game.id];

    if (!gameStats || gameStats.length === 0) {
      return;
    }

    let hasPositionStats = false;
    let gameGsGoals = 0;
    let gameGaGoals = 0;
    let gameGdGoals = 0;
    let gameGkGoals = 0;

    // Filter to current team only
    const teamStats = gameStats.filter(stat => Number(stat.teamId) === Number(currentTeamId));

    teamStats.forEach(stat => {
      if (stat.position === 'GS' && typeof stat.goalsFor === 'number') {
        gsGoalsFor += stat.goalsFor;
        gameGsGoals += stat.goalsFor;
        hasPositionStats = true;
      }
      if (stat.position === 'GA' && typeof stat.goalsFor === 'number') {
        gaGoalsFor += stat.goalsFor;
        gameGaGoals += stat.goalsFor;
        hasPositionStats = true;
      }
      if (stat.position === 'GD' && typeof stat.goalsAgainst === 'number') {
        gdGoalsAgainst += stat.goalsAgainst;
        gameGdGoals += stat.goalsAgainst;
        hasPositionStats = true;
      }
      if (stat.position === 'GK' && typeof stat.goalsAgainst === 'number') {
        gkGoalsAgainst += stat.goalsAgainst;
        gameGkGoals += stat.goalsAgainst;
        hasPositionStats = true;
      }
    });

    if (hasPositionStats) {
      gamesWithPositionStats++;
    }
  });

  const gsAvgGoalsFor = gamesWithPositionStats > 0 ? Math.round((gsGoalsFor / gamesWithPositionStats) * 10) / 10 : 0;
  const gaAvgGoalsFor = gamesWithPositionStats > 0 ? Math.round((gaGoalsFor / gamesWithPositionStats) * 10) / 10 : 0;
  const gdAvgGoalsAgainst = gamesWithPositionStats > 0 ? Math.round((gdGoalsAgainst / gamesWithPositionStats) * 10) / 10 : 0;
  const gkAvgGoalsAgainst = gamesWithPositionStats > 0 ? Math.round((gkGoalsAgainst / gamesWithPositionStats) * 10) / 10 : 0;

  const attackingPositionsTotal = gsAvgGoalsFor + gaAvgGoalsFor;
  const defendingPositionsTotal = gdGoalsAgainst + gkGoalsAgainst;

  const result = {
    gsAvgGoalsFor,
    gaAvgGoalsFor,
    gdAvgGoalsAgainst,
    gkAvgGoalsAgainst,
    attackingPositionsTotal,
    defendingPositionsTotal,
    gamesWithPositionStats
  };

  return result;
}

/**
 * Create shared position performance display component
 */
export interface PositionPerformanceDisplayProps {
  averages: PositionAverages;
  label?: string;
  className?: string;
}

/**
 * Calculate quarter-by-quarter attack/defense statistics from position-based game stats (legacy function for backward compatibility)
 * @param games - Array of games to analyze
 * @param batchStats - Stats data keyed by game ID
 * @param currentTeamId - ID of the team to calculate stats for
 * @returns Array of quarter data with position-specific goals
 */
export function calculateQuarterByQuarterStats(
  games: any[],
  batchStats: Record<string, any[]>,
  currentTeamId: number
): Array<{
  quarter: number;
  gsGoalsFor: number;
  gaGoalsFor: number;
  gdGoalsAgainst: number;
  gkGoalsAgainst: number;
  gamesWithQuarterData: number;
}> {
  const quarters = [1, 2, 3, 4];
  
  return quarters.map(quarter => {
    let gsGoalsFor = 0;
    let gaGoalsFor = 0;
    let gdGoalsAgainst = 0;
    let gkGoalsAgainst = 0;
    let gamesWithQuarterData = 0;

    games.forEach(game => {
      const gameStats = batchStats[game.id.toString()] || batchStats[game.id];
      
      if (!gameStats || gameStats.length === 0) {
        return;
      }

      // Filter to current team and specific quarter
      const teamStats = gameStats.filter(stat => 
        Number(stat.teamId) === Number(currentTeamId) && 
        stat.quarter === quarter
      );

      let hasQuarterData = false;
      
      teamStats.forEach(stat => {
        if (stat.position === 'GS' && typeof stat.goalsFor === 'number') {
          gsGoalsFor += stat.goalsFor;
          hasQuarterData = true;
        }
        if (stat.position === 'GA' && typeof stat.goalsFor === 'number') {
          gaGoalsFor += stat.goalsFor;
          hasQuarterData = true;
        }
        if (stat.position === 'GD' && typeof stat.goalsAgainst === 'number') {
          gdGoalsAgainst += stat.goalsAgainst;
          hasQuarterData = true;
        }
        if (stat.position === 'GK' && typeof stat.goalsAgainst === 'number') {
          gkGoalsAgainst += stat.goalsAgainst;
          hasQuarterData = true;
        }
      });

      if (hasQuarterData) {
        gamesWithQuarterData++;
      }
    });

    // Calculate averages per quarter with proper formatting to one decimal place
    const avgGsGoalsFor = gamesWithQuarterData > 0 ? Math.round((gsGoalsFor / gamesWithQuarterData) * 10) / 10 : 0;
    const avgGaGoalsFor = gamesWithQuarterData > 0 ? Math.round((gaGoalsFor / gamesWithQuarterData) * 10) / 10 : 0;
    const avgGdGoalsAgainst = gamesWithQuarterData > 0 ? Math.round((gdGoalsAgainst / gamesWithQuarterData) * 10) / 10 : 0;
    const avgGkGoalsAgainst = gamesWithQuarterData > 0 ? Math.round((gkGoalsAgainst / gamesWithQuarterData) * 10) / 10 : 0;

    // Determine data quality for legacy function
    const hasValidData = gamesWithQuarterData > 0 && (avgGsGoalsFor > 0 || avgGaGoalsFor > 0 || avgGdGoalsAgainst > 0 || avgGkGoalsAgainst > 0);
    const dataQuality: 'complete' | 'partial' | 'fallback' | 'no-data' = 
      hasValidData ? 'complete' : 'no-data';

    return {
      quarter,
      gsGoalsFor: avgGsGoalsFor,
      gaGoalsFor: avgGaGoalsFor,
      gdGoalsAgainst: avgGdGoalsAgainst,
      gkGoalsAgainst: avgGkGoalsAgainst,
      gamesWithQuarterData,
      hasValidData,
      dataQuality
    };
  });
}

/**
 * Calculate GS/GA percentage breakdown from position statistics for a specific quarter
 */
function calculateAttackPositionPercentages(
  positionStats: any[],
  teamId: number,
  quarter?: number
): { gsPercentage: number; gaPercentage: number } {


  // Enhanced logging for input validation
  if (!positionStats || !Array.isArray(positionStats)) {
    console.warn('⚠️ WARNING: Invalid positionStats in calculateAttackPositionPercentages, falling back to 50/50 distribution');
    return { gsPercentage: 0.5, gaPercentage: 0.5 };
  }

  if (positionStats.length === 0) {
    console.warn('⚠️ WARNING: Empty positionStats array in calculateAttackPositionPercentages, falling back to 50/50 distribution');
    return { gsPercentage: 0.5, gaPercentage: 0.5 };
  }

  // Filter to current team and quarter (if specified)
  const relevantStats = positionStats.filter(stat => 
    Number(stat.teamId) === Number(teamId) &&
    (quarter === undefined || stat.quarter === quarter)
  );



  if (relevantStats.length === 0) {
    console.warn(`⚠️ WARNING: No relevant attack stats found for team ${teamId}${quarter ? ` in Q${quarter}` : ''}, falling back to 50/50 distribution`);
    return { gsPercentage: 0.5, gaPercentage: 0.5 };
  }

  let totalGsGoals = 0;
  let totalGaGoals = 0;
  let gsStatCount = 0;
  let gaStatCount = 0;

  relevantStats.forEach(stat => {


    if (stat.position === 'GS' && typeof stat.goalsFor === 'number') {
      totalGsGoals += stat.goalsFor;
      gsStatCount++;
    }
    if (stat.position === 'GA' && typeof stat.goalsFor === 'number') {
      totalGaGoals += stat.goalsFor;
      gaStatCount++;
    }
  });

  const totalAttackGoals = totalGsGoals + totalGaGoals;
  
  // Enhanced logging for calculation details


  // Calculate percentages, default to 50/50 if no data
  const gsPercentage = totalAttackGoals > 0 ? totalGsGoals / totalAttackGoals : 0.5;
  const gaPercentage = totalAttackGoals > 0 ? totalGaGoals / totalAttackGoals : 0.5;

  // Enhanced logging for fallback scenarios
  if (totalAttackGoals === 0) {
    console.warn(`⚠️ WARNING: No attack goals found for team ${teamId}${quarter ? ` in Q${quarter}` : ''}, falling back to 50/50 distribution (GS: 50%, GA: 50%)`);
  } else {

  }

  return { gsPercentage, gaPercentage };
}

/**
 * Calculate GK/GD percentage breakdown from position statistics for a specific quarter
 */
function calculateDefensePositionPercentages(
  positionStats: any[],
  teamId: number,
  quarter?: number
): { gkPercentage: number; gdPercentage: number } {

  // Enhanced logging for input validation
  if (!positionStats || !Array.isArray(positionStats)) {
    console.warn('⚠️ WARNING: Invalid positionStats in calculateDefensePositionPercentages, falling back to 50/50 distribution');
    return { gkPercentage: 0.5, gdPercentage: 0.5 };
  }

  if (positionStats.length === 0) {
    console.warn('⚠️ WARNING: Empty positionStats array in calculateDefensePositionPercentages, falling back to 50/50 distribution');
    return { gkPercentage: 0.5, gdPercentage: 0.5 };
  }

  // Filter to current team and quarter (if specified)
  const relevantStats = positionStats.filter(stat => 
    Number(stat.teamId) === Number(teamId) &&
    (quarter === undefined || stat.quarter === quarter)
  );



  if (relevantStats.length === 0) {
    console.warn(`⚠️ WARNING: No relevant defense stats found for team ${teamId}${quarter ? ` in Q${quarter}` : ''}, falling back to 50/50 distribution`);
    return { gkPercentage: 0.5, gdPercentage: 0.5 };
  }

  let totalGkGoals = 0;
  let totalGdGoals = 0;
  let gkStatCount = 0;
  let gdStatCount = 0;

  relevantStats.forEach(stat => {


    if (stat.position === 'GK' && typeof stat.goalsAgainst === 'number') {
      totalGkGoals += stat.goalsAgainst;
      gkStatCount++;
    }
    if (stat.position === 'GD' && typeof stat.goalsAgainst === 'number') {
      totalGdGoals += stat.goalsAgainst;
      gdStatCount++;
    }
  });

  const totalDefenseGoals = totalGkGoals + totalGdGoals;
  
  // Enhanced logging for calculation details


  // Calculate percentages, default to 50/50 if no data
  const gkPercentage = totalDefenseGoals > 0 ? totalGkGoals / totalDefenseGoals : 0.5;
  const gdPercentage = totalDefenseGoals > 0 ? totalGdGoals / totalDefenseGoals : 0.5;

  // Enhanced logging for fallback scenarios
  if (totalDefenseGoals === 0) {
    console.warn(`⚠️ WARNING: No defense goals found for team ${teamId}${quarter ? ` in Q${quarter}` : ''}, falling back to 50/50 distribution (GK: 50%, GD: 50%)`);
  } else {

  }

  return { gkPercentage, gdPercentage };
}

/**
 * Calculate average goals scored per quarter across all games
 */
function calculateQuarterScoredAverages(
  games: any[],
  batchScores: Record<number, any[]>,
  currentTeamId: number
): { quarter: number; average: number; gamesWithData: number }[] {
  // Validation: Check inputs
  if (!games || !Array.isArray(games)) {
    console.error('❌ ERROR: Invalid games parameter in calculateQuarterScoredAverages:', games);
    return [1, 2, 3, 4].map(quarter => ({ quarter, average: 0, gamesWithData: 0 }));
  }

  if (!batchScores || typeof batchScores !== 'object') {
    console.error('❌ ERROR: Invalid batchScores parameter in calculateQuarterScoredAverages:', batchScores);
    return [1, 2, 3, 4].map(quarter => ({ quarter, average: 0, gamesWithData: 0 }));
  }

  if (!currentTeamId || typeof currentTeamId !== 'number') {
    console.error('❌ ERROR: Invalid currentTeamId parameter in calculateQuarterScoredAverages:', currentTeamId);
    return [1, 2, 3, 4].map(quarter => ({ quarter, average: 0, gamesWithData: 0 }));
  }

  const quarters = [1, 2, 3, 4];
  
  return quarters.map(quarter => {
    let totalQuarterGoals = 0;
    let gamesWithQuarterData = 0;
    
    try {
      games.forEach(game => {
        // Validation: Check if game has required id property
        if (!game || !game.id) {
          console.warn(`⚠️ WARNING: Game missing id property in calculateQuarterScoredAverages:`, game);
          return;
        }

        // Fallback logic when batchScores[game.id] returns undefined
        const gameScores = batchScores[game.id];
        if (!gameScores) {
          console.warn(`⚠️ WARNING: No batchScores found for game.id ${game.id} in calculateQuarterScoredAverages`);
          return;
        }

        if (!Array.isArray(gameScores)) {
          console.warn(`⚠️ WARNING: Invalid gameScores format for game.id ${game.id}:`, gameScores);
          return;
        }
        
        if (gameScores.length > 0) {
          const quarterScore = gameScores.find(s => s && s.teamId === currentTeamId && s.quarter === quarter);
          const quarterTeamScore = quarterScore?.score || 0;
          
          // Include games with 0 scores in the average calculation (they are valid data points)
          if (typeof quarterTeamScore === 'number' && quarterTeamScore >= 0) {
            totalQuarterGoals += quarterTeamScore;
            gamesWithQuarterData++;
          }
        }
      });
    } catch (error) {
      console.error(`❌ ERROR: Exception in calculateQuarterScoredAverages for Q${quarter}:`, error);
    }

    const average = gamesWithQuarterData > 0 ? totalQuarterGoals / gamesWithQuarterData : 0;
    
    console.log(`🔍 Q${quarter} scored average calculation:`, {
      totalQuarterGoals,
      gamesWithQuarterData,
      average: average.toFixed(2),
      gamesProcessed: games.length,
      dataQuality: gamesWithQuarterData > 0 ? 'valid' : 'no_data',
      averagePerGame: gamesWithQuarterData > 0 ? (totalQuarterGoals / gamesWithQuarterData).toFixed(2) : '0.00'
    });

    // Additional verification logging
    if (gamesWithQuarterData === 0) {
      console.warn(`⚠️ WARNING: No valid quarter data found for Q${quarter} scored averages`);
    } else if (gamesWithQuarterData < games.length / 2) {
      console.warn(`⚠️ WARNING: Limited data for Q${quarter} scored averages: ${gamesWithQuarterData}/${games.length} games`);
    }

    return {
      quarter,
      average,
      gamesWithData: gamesWithQuarterData
    };
  });
}

/**
 * Calculate average goals conceded per quarter across all games
 */
function calculateQuarterConcededAverages(
  games: any[],
  batchScores: Record<number, any[]>,
  currentTeamId: number
): { quarter: number; average: number; gamesWithData: number }[] {
  console.log('🔍 calculateQuarterConcededAverages called with:', {
    gamesLength: games?.length,
    currentTeamId,
    batchScoresAvailable: Object.keys(batchScores || {}).length,
    sampleGameIds: games?.slice(0, 3).map(g => g.id || g.gameId)
  });

  // Validation: Check inputs
  if (!games || !Array.isArray(games)) {
    console.error('❌ ERROR: Invalid games parameter in calculateQuarterConcededAverages:', games);
    return [1, 2, 3, 4].map(quarter => ({ quarter, average: 0, gamesWithData: 0 }));
  }

  if (!batchScores || typeof batchScores !== 'object') {
    console.error('❌ ERROR: Invalid batchScores parameter in calculateQuarterConcededAverages:', batchScores);
    return [1, 2, 3, 4].map(quarter => ({ quarter, average: 0, gamesWithData: 0 }));
  }

  if (!currentTeamId || typeof currentTeamId !== 'number') {
    console.error('❌ ERROR: Invalid currentTeamId parameter in calculateQuarterConcededAverages:', currentTeamId);
    return [1, 2, 3, 4].map(quarter => ({ quarter, average: 0, gamesWithData: 0 }));
  }

  const quarters = [1, 2, 3, 4];
  
  return quarters.map(quarter => {
    let totalOpponentQuarterGoals = 0;
    let gamesWithOpponentData = 0;
    
    try {
      games.forEach(game => {
        // Validation: Check if game has required id property
        if (!game || !game.id) {
          console.warn(`⚠️ WARNING: Game missing id property in calculateQuarterConcededAverages:`, game);
          return;
        }

        // Fallback logic when batchScores[game.id] returns undefined
        const gameScores = batchScores[game.id];
        if (!gameScores) {
          console.warn(`⚠️ WARNING: No batchScores found for game.id ${game.id} in calculateQuarterConcededAverages`);
          return;
        }

        if (!Array.isArray(gameScores)) {
          console.warn(`⚠️ WARNING: Invalid gameScores format for game.id ${game.id}:`, gameScores);
          return;
        }
        
        if (gameScores.length > 0) {
          const quarterScore = gameScores.find(s => s && s.teamId !== currentTeamId && s.quarter === quarter);
          const quarterOpponentScore = quarterScore?.score || 0;
          
          // Include games with 0 scores in the average calculation (they are valid data points)
          if (typeof quarterOpponentScore === 'number' && quarterOpponentScore >= 0) {
            totalOpponentQuarterGoals += quarterOpponentScore;
            gamesWithOpponentData++;
          }
        }
      });
    } catch (error) {
      console.error(`❌ ERROR: Exception in calculateQuarterConcededAverages for Q${quarter}:`, error);
    }

    const average = gamesWithOpponentData > 0 ? totalOpponentQuarterGoals / gamesWithOpponentData : 0;
    
    console.log(`🔍 Q${quarter} conceded average calculation:`, {
      totalOpponentQuarterGoals,
      gamesWithOpponentData,
      average: average.toFixed(2),
      gamesProcessed: games.length,
      dataQuality: gamesWithOpponentData > 0 ? 'valid' : 'no_data',
      averagePerGame: gamesWithOpponentData > 0 ? (totalOpponentQuarterGoals / gamesWithOpponentData).toFixed(2) : '0.00'
    });

    // Additional verification logging
    if (gamesWithOpponentData === 0) {
      console.warn(`⚠️ WARNING: No valid quarter data found for Q${quarter} conceded averages`);
    } else if (gamesWithOpponentData < games.length / 2) {
      console.warn(`⚠️ WARNING: Limited data for Q${quarter} conceded averages: ${gamesWithOpponentData}/${games.length} games`);
    }

    return {
      quarter,
      average,
      gamesWithData: gamesWithOpponentData
    };
  });
}

/**
 * Apply position percentages to quarter score averages with proper formatting
 */
function applyPositionBreakdownToQuarterAverages(
  scoredAverage: number,
  concededAverage: number,
  attackPercentages: { gsPercentage: number; gaPercentage: number },
  defensePercentages: { gkPercentage: number; gdPercentage: number }
): {
  gsGoalsFor: number;
  gaGoalsFor: number;
  gkGoalsAgainst: number;
  gdGoalsAgainst: number;
  hasValidData: boolean;
  dataQuality: 'complete' | 'partial' | 'fallback' | 'no-data';
} {
  console.log('🔍 applyPositionBreakdownToQuarterAverages called with:', {
    scoredAverage,
    concededAverage,
    attackPercentages,
    defensePercentages
  });

  // Determine data quality based on input values
  let dataQuality: 'complete' | 'partial' | 'fallback' | 'no-data' = 'no-data';
  let hasValidData = false;

  // Check if we have valid score data
  const hasScoreData = scoredAverage > 0 || concededAverage > 0;
  
  // Check if we're using fallback percentages (50/50)
  const usingAttackFallback = attackPercentages.gsPercentage === 0.5 && attackPercentages.gaPercentage === 0.5;
  const usingDefenseFallback = defensePercentages.gkPercentage === 0.5 && defensePercentages.gdPercentage === 0.5;

  if (hasScoreData) {
    hasValidData = true;
    if (!usingAttackFallback && !usingDefenseFallback) {
      dataQuality = 'complete';
    } else if (usingAttackFallback || usingDefenseFallback) {
      dataQuality = 'partial';
    } else {
      dataQuality = 'fallback';
    }
  }

  // Calculate GS and GA values by multiplying attack averages by percentages
  // Format to one decimal place for display consistency
  const gsGoalsFor = hasScoreData ? 
    Math.round((scoredAverage * attackPercentages.gsPercentage) * 10) / 10 : 0;
  const gaGoalsFor = hasScoreData ? 
    Math.round((scoredAverage * attackPercentages.gaPercentage) * 10) / 10 : 0;
  
  // Calculate GK and GD values by multiplying defense averages by percentages
  // Format to one decimal place for display consistency
  const gkGoalsAgainst = hasScoreData ? 
    Math.round((concededAverage * defensePercentages.gkPercentage) * 10) / 10 : 0;
  const gdGoalsAgainst = hasScoreData ? 
    Math.round((concededAverage * defensePercentages.gdPercentage) * 10) / 10 : 0;

  console.log('🔍 Position breakdown applied with formatting:', {
    gsGoalsFor,
    gaGoalsFor,
    gkGoalsAgainst,
    gdGoalsAgainst,
    hasValidData,
    dataQuality
  });

  return {
    gsGoalsFor,
    gaGoalsFor,
    gkGoalsAgainst,
    gdGoalsAgainst,
    hasValidData,
    dataQuality
  };
}

/**
 * Create empty quarter stats for error handling
 */
function createEmptyQuarterStats(): QuarterByQuarterStats[] {
  return [1, 2, 3, 4].map(quarter => createEmptyQuarterStat(quarter));
}

/**
 * Create empty quarter stat for a specific quarter with proper fallback indicators
 */
function createEmptyQuarterStat(quarter: number): QuarterByQuarterStats {
  return {
    quarter,
    gsGoalsFor: 0,
    gaGoalsFor: 0,
    gkGoalsAgainst: 0,
    gdGoalsAgainst: 0,
    gamesWithQuarterData: 0,
    hasValidData: false,
    dataQuality: 'no-data'
  };
}

/**
 * Calculate quarter averages using the same method as Quarter Performance Analysis widget
 */
export function calculateQuarterAverages(
  games: any[],
  batchScores: Record<number, any[]>,
  currentTeamId: number,
  excludeSpecialGames: boolean = true
): { quarter: number; avgTeamScore: number; avgOpponentScore: number; gamesWithData: number }[] {
  return [1, 2, 3, 4].map(quarter => {
    let totalTeamScore = 0;
    let totalOpponentScore = 0;
    let gamesWithData = 0;

    games.forEach(game => {
      // Use the same filtering logic as season statistics method
      const isCompleted = game.status === 'completed' || game.statusIsCompleted === true;
    if (isCompleted && game.statusAllowsStatistics === true) {
        const gameScores = batchScores?.[game.id] || [];
        const transformedScores = Array.isArray(gameScores) ? gameScores.map(score => ({
          id: score.id,
          gameId: score.gameId,
          teamId: score.teamId,
          quarter: score.quarter,
          score: score.score,
          enteredBy: score.enteredBy,
          enteredAt: score.enteredAt,
          updatedAt: score.updatedAt,
          notes: score.notes
        })) : [];

        const quarterTeamScore = transformedScores.find(s => s.teamId === currentTeamId && s.quarter === quarter)?.score || 0;
        const quarterOpponentScore = transformedScores.find(s => s.teamId !== currentTeamId && s.quarter === quarter)?.score || 0;

        totalTeamScore += quarterTeamScore;
        totalOpponentScore += quarterOpponentScore;

        if(quarterTeamScore > 0 || quarterOpponentScore > 0){
          gamesWithData++;
        }
      }
    });

    const avgTeamScore = gamesWithData > 0 ? totalTeamScore / gamesWithData : 0;
    const avgOpponentScore = gamesWithData > 0 ? totalOpponentScore / gamesWithData : 0;

    return { quarter, avgTeamScore, avgOpponentScore, gamesWithData };
  });
}

/**
 * Calculate quarter-by-quarter statistics using unified data approach
 */
export function calculateUnifiedQuarterByQuarterStats(
  games: any[],
  batchScores: Record<number, any[]>,
  currentTeamId: number,
  batchStats?: Record<number, any[]>
): QuarterByQuarterStats[] {
  console.log('🔍 calculateUnifiedQuarterByQuarterStats called with:', {
    gamesLength: games?.length,
    batchScoresKeys: Object.keys(batchScores || {}),
    batchStatsKeys: Object.keys(batchStats || {}),
    currentTeamId
  });

  // Validation: Check for null/undefined inputs
  if (!games) {
    console.error('❌ ERROR: games parameter is null or undefined');
    return createEmptyQuarterStats();
  }

  if (!Array.isArray(games)) {
    console.error('❌ ERROR: games parameter is not an array:', typeof games);
    return createEmptyQuarterStats();
  }

  if (games.length === 0) {
    console.warn('⚠️ WARNING: No games provided to calculateUnifiedQuarterByQuarterStats');
    return createEmptyQuarterStats();
  }

  if (!batchScores || typeof batchScores !== 'object') {
    console.error('❌ ERROR: batchScores parameter is invalid:', batchScores);
    return createEmptyQuarterStats();
  }

  if (!currentTeamId || typeof currentTeamId !== 'number') {
    console.error('❌ ERROR: currentTeamId parameter is invalid:', currentTeamId);
    return createEmptyQuarterStats();
  }

  // Enhanced validation: Check for id vs gameId property mismatch
  const firstGame = games[0];
  const gameStructureAnalysis = {
    totalGames: games.length,
    hasIdProperty: games.filter(g => g && g.id).length,
    hasGameIdProperty: games.filter(g => g && g.gameId).length,
    sampleGameKeys: firstGame ? Object.keys(firstGame) : [],
    sampleIdValues: games.slice(0, 3).map(g => ({ id: g?.id, gameId: g?.gameId }))
  };

  console.log('🔍 DETAILED GAMES STRUCTURE ANALYSIS:', gameStructureAnalysis);

  // Check for data structure mismatch with enhanced warnings
  if (firstGame && !firstGame.id && firstGame.gameId) {
    console.error('❌ CRITICAL DATA STRUCTURE MISMATCH DETECTED:');
    console.error('❌ - Games have gameId property but function expects id property');
    console.error('❌ - This will cause ALL batchScores lookups to fail (batchScores[undefined])');
    console.error('❌ - Component should pass allSeasonGamesWithStatistics instead of unifiedData');
    console.error('❌ - Expected: games with .id property');
    console.error('❌ - Received: games with .gameId property');
    console.error('❌ - Impact: All quarter calculations will return zeros');
    return createEmptyQuarterStats();
  }

  if (firstGame && !firstGame.id) {
    console.error('❌ ERROR: Games missing required id property for batchScores lookup');
    console.error('❌ Available properties:', Object.keys(firstGame));
    console.error('❌ This will prevent quarter score calculations from working');
    return createEmptyQuarterStats();
  }

  // Additional data structure validation
  const gamesWithoutId = games.filter(g => !g || !g.id);
  if (gamesWithoutId.length > 0) {
    console.warn(`⚠️ WARNING: ${gamesWithoutId.length}/${games.length} games missing id property`);
    console.warn('⚠️ These games will be skipped in calculations:', gamesWithoutId.slice(0, 3));
  }

  // Validation: Check if batchScores has data for any of the games
  const gameIds = games.map(g => g.id).filter(Boolean);
  const availableScoreIds = Object.keys(batchScores).map(Number);
  const hasMatchingScores = gameIds.some(id => availableScoreIds.includes(id));
  
  if (!hasMatchingScores) {
    console.warn('⚠️ WARNING: No matching batchScores found for any game IDs');
    console.warn('⚠️ Game IDs:', gameIds);
    console.warn('⚠️ Available score IDs:', availableScoreIds);
  }

  // Calculate quarter score averages using the new dedicated functions
  const scoredAverages = calculateQuarterScoredAverages(games, batchScores, currentTeamId);
  const concededAverages = calculateQuarterConcededAverages(games, batchScores, currentTeamId);
  
  // Validation: Check if quarter calculation functions returned valid data
  if (!scoredAverages || !Array.isArray(scoredAverages) || scoredAverages.length === 0) {
    console.error('❌ ERROR: calculateQuarterScoredAverages returned invalid data:', scoredAverages);
    return createEmptyQuarterStats();
  }

  if (!concededAverages || !Array.isArray(concededAverages) || concededAverages.length === 0) {
    console.error('❌ ERROR: calculateQuarterConcededAverages returned invalid data:', concededAverages);
    return createEmptyQuarterStats();
  }

  if (scoredAverages.length !== concededAverages.length) {
    console.error('❌ ERROR: Mismatch between scored and conceded averages length');
    console.error('❌ Scored length:', scoredAverages.length, 'Conceded length:', concededAverages.length);
    return createEmptyQuarterStats();
  }

  // Collect all position statistics for overall percentage calculation
  const allPositionStats = batchStats ? Object.values(batchStats).flat() : [];
  
  // Enhanced position statistics analysis
  const positionStatsAnalysis = {
    totalStats: allPositionStats.length,
    byPosition: {
      GS: allPositionStats.filter(s => s.position === 'GS').length,
      GA: allPositionStats.filter(s => s.position === 'GA').length,
      GK: allPositionStats.filter(s => s.position === 'GK').length,
      GD: allPositionStats.filter(s => s.position === 'GD').length
    },
    byQuarter: {
      Q1: allPositionStats.filter(s => s.quarter === 1).length,
      Q2: allPositionStats.filter(s => s.quarter === 2).length,
      Q3: allPositionStats.filter(s => s.quarter === 3).length,
      Q4: allPositionStats.filter(s => s.quarter === 4).length
    },
    forCurrentTeam: allPositionStats.filter(s => Number(s.teamId) === Number(currentTeamId)).length
  };

  console.log('🔍 POSITION STATISTICS ANALYSIS:', positionStatsAnalysis);
  
  // Validation: Check if we have any position statistics
  if (!allPositionStats || allPositionStats.length === 0) {
    console.warn('⚠️ WARNING: No position statistics available, ALL calculations will use 50/50 fallback distribution');
    console.warn('⚠️ - Impact: GS/GA will be split 50/50, GK/GD will be split 50/50');
    console.warn('⚠️ - This may indicate missing batchStats data or no recorded position statistics');
  } else if (positionStatsAnalysis.forCurrentTeam === 0) {
    console.warn(`⚠️ WARNING: No position statistics found for team ${currentTeamId}, will use 50/50 fallback distribution`);
    console.warn('⚠️ - Available team IDs in stats:', Array.from(new Set(allPositionStats.map(s => s.teamId))));
  }
  
  try {
    return scoredAverages.map((scoredData, index) => {
      // Validation: Check if conceded data exists for this index
      const concededData = concededAverages[index];
      if (!concededData) {
        console.error(`❌ ERROR: Missing conceded data for quarter index ${index}`);
        return createEmptyQuarterStat(index + 1);
      }

      const quarter = scoredData.quarter;
      
      // Validation: Check quarter consistency
      if (quarter !== concededData.quarter) {
        console.error(`❌ ERROR: Quarter mismatch at index ${index}: scored=${quarter}, conceded=${concededData.quarter}`);
        return createEmptyQuarterStat(quarter);
      }

      // Validation: Check for valid quarter number
      if (!quarter || quarter < 1 || quarter > 4) {
        console.error(`❌ ERROR: Invalid quarter number: ${quarter}`);
        return createEmptyQuarterStat(quarter || index + 1);
      }
      
      try {
        // Calculate position percentages from actual position statistics
        // First try quarter-specific percentages, then fall back to overall percentages
        let attackPercentages = calculateAttackPositionPercentages(allPositionStats, currentTeamId, quarter);
        let defensePercentages = calculateDefensePositionPercentages(allPositionStats, currentTeamId, quarter);
        
        // Validation: Check if percentage calculation functions returned valid data
        if (!attackPercentages || typeof attackPercentages.gsPercentage !== 'number' || typeof attackPercentages.gaPercentage !== 'number') {
          console.error(`❌ ERROR: Invalid attack percentages for Q${quarter}:`, attackPercentages);
          attackPercentages = { gsPercentage: 0.5, gaPercentage: 0.5 };
        }

        if (!defensePercentages || typeof defensePercentages.gkPercentage !== 'number' || typeof defensePercentages.gdPercentage !== 'number') {
          console.error(`❌ ERROR: Invalid defense percentages for Q${quarter}:`, defensePercentages);
          defensePercentages = { gkPercentage: 0.5, gdPercentage: 0.5 };
        }
        
        // Enhanced logging for fallback scenarios
        if (attackPercentages.gsPercentage === 0.5 && attackPercentages.gaPercentage === 0.5) {
          console.log(`🔍 No quarter-specific attack data for Q${quarter}, attempting overall percentages`);
          attackPercentages = calculateAttackPositionPercentages(allPositionStats, currentTeamId);
          
          // Validate overall percentages with detailed logging
          if (!attackPercentages || typeof attackPercentages.gsPercentage !== 'number' || typeof attackPercentages.gaPercentage !== 'number') {
            console.warn(`⚠️ WARNING: Invalid overall attack percentages for Q${quarter}, falling back to 50/50 distribution`);
            console.warn(`⚠️ - Reason: No valid position statistics available for attack calculations`);
            console.warn(`⚠️ - Impact: GS and GA will be split equally (50%/50%)`);
            attackPercentages = { gsPercentage: 0.5, gaPercentage: 0.5 };
          } else if (attackPercentages.gsPercentage === 0.5 && attackPercentages.gaPercentage === 0.5) {
            console.warn(`⚠️ WARNING: Overall attack percentages also defaulted to 50/50 for Q${quarter}`);
            console.warn(`⚠️ - Reason: No attack position statistics found in any quarter`);
            console.warn(`⚠️ - Using default distribution: GS: 50%, GA: 50%`);
          }
        }
        
        if (defensePercentages.gkPercentage === 0.5 && defensePercentages.gdPercentage === 0.5) {
          console.log(`🔍 No quarter-specific defense data for Q${quarter}, attempting overall percentages`);
          defensePercentages = calculateDefensePositionPercentages(allPositionStats, currentTeamId);
          
          // Validate overall percentages with detailed logging
          if (!defensePercentages || typeof defensePercentages.gkPercentage !== 'number' || typeof defensePercentages.gdPercentage !== 'number') {
            console.warn(`⚠️ WARNING: Invalid overall defense percentages for Q${quarter}, falling back to 50/50 distribution`);
            console.warn(`⚠️ - Reason: No valid position statistics available for defense calculations`);
            console.warn(`⚠️ - Impact: GK and GD will be split equally (50%/50%)`);
            defensePercentages = { gkPercentage: 0.5, gdPercentage: 0.5 };
          } else if (defensePercentages.gkPercentage === 0.5 && defensePercentages.gdPercentage === 0.5) {
            console.warn(`⚠️ WARNING: Overall defense percentages also defaulted to 50/50 for Q${quarter}`);
            console.warn(`⚠️ - Reason: No defense position statistics found in any quarter`);
            console.warn(`⚠️ - Using default distribution: GK: 50%, GD: 50%`);
          }
        }
        
        // Apply position percentages to quarter averages using the dedicated function
        const positionBreakdown = applyPositionBreakdownToQuarterAverages(
          scoredData.average,
          concededData.average,
          attackPercentages,
          defensePercentages
        );

        // Validation: Check if position breakdown calculation succeeded
        if (!positionBreakdown || typeof positionBreakdown !== 'object') {
          console.error(`❌ ERROR: Invalid position breakdown for Q${quarter}:`, positionBreakdown);
          return createEmptyQuarterStat(quarter);
        }

        // Validation: Check if breakdown values are numbers
        const { gsGoalsFor, gaGoalsFor, gkGoalsAgainst, gdGoalsAgainst, hasValidData, dataQuality } = positionBreakdown;
        if (typeof gsGoalsFor !== 'number' || typeof gaGoalsFor !== 'number' || 
            typeof gkGoalsAgainst !== 'number' || typeof gdGoalsAgainst !== 'number') {
          console.error(`❌ ERROR: Invalid breakdown values for Q${quarter}:`, positionBreakdown);
          return createEmptyQuarterStat(quarter);
        }

        // Enhanced verification logging for final output
        console.log(`🔍 Q${quarter} DETAILED CALCULATION VERIFICATION:`, { 
          inputData: {
            scoredAverage: scoredData.average.toFixed(2),
            concededAverage: concededData.average.toFixed(2),
            gamesWithScoredData: scoredData.gamesWithData,
            gamesWithConcededData: concededData.gamesWithData
          },
          percentages: {
            attack: {
              gs: `${(attackPercentages.gsPercentage * 100).toFixed(1)}%`,
              ga: `${(attackPercentages.gaPercentage * 100).toFixed(1)}%`,
              isDefault: attackPercentages.gsPercentage === 0.5 && attackPercentages.gaPercentage === 0.5
            },
            defense: {
              gk: `${(defensePercentages.gkPercentage * 100).toFixed(1)}%`,
              gd: `${(defensePercentages.gdPercentage * 100).toFixed(1)}%`,
              isDefault: defensePercentages.gkPercentage === 0.5 && defensePercentages.gdPercentage === 0.5
            }
          },
          calculations: {
            gsGoalsFor: `${scoredData.average.toFixed(2)} × ${(attackPercentages.gsPercentage * 100).toFixed(1)}% = ${gsGoalsFor.toFixed(1)}`,
            gaGoalsFor: `${scoredData.average.toFixed(2)} × ${(attackPercentages.gaPercentage * 100).toFixed(1)}% = ${gaGoalsFor.toFixed(1)}`,
            gkGoalsAgainst: `${concededData.average.toFixed(2)} × ${(defensePercentages.gkPercentage * 100).toFixed(1)}% = ${gkGoalsAgainst.toFixed(1)}`,
            gdGoalsAgainst: `${concededData.average.toFixed(2)} × ${(defensePercentages.gdPercentage * 100).toFixed(1)}% = ${gdGoalsAgainst.toFixed(1)}`
          },
          finalOutput: { gsGoalsFor, gaGoalsFor, gkGoalsAgainst, gdGoalsAgainst },
          dataQuality: {
            hasValidData,
            quality: dataQuality,
            usingDefaults: (attackPercentages.gsPercentage === 0.5 && attackPercentages.gaPercentage === 0.5) || 
                          (defensePercentages.gkPercentage === 0.5 && defensePercentages.gdPercentage === 0.5)
          }
        });

        return {
          quarter,
          gsGoalsFor,
          gaGoalsFor,
          gkGoalsAgainst,
          gdGoalsAgainst,
          gamesWithQuarterData: Math.max(scoredData.gamesWithData, concededData.gamesWithData),
          hasValidData,
          dataQuality
        };
      } catch (quarterError) {
        console.error(`❌ ERROR: Exception processing quarter ${quarter}:`, quarterError);
        return createEmptyQuarterStat(quarter);
      }
    });
  } catch (error) {
    console.error('❌ ERROR: Exception in calculateUnifiedQuarterByQuarterStats:', error);
    return createEmptyQuarterStats();
  }
}

/**
 * Calculate season averages from all games using consistent filtering
 */
export function calculateSeasonAverages(
  games: any[],
  batchScores: Record<number, any[]>,
  teamId: number
): { avgGoalsFor: number; avgGoalsAgainst: number; gamesWithStats: number } {
  let totalGoalsFor = 0;
  let totalGoalsAgainst = 0;
  let gamesWithStats = 0;

  games.forEach(game => {
    // Use consistent filtering across all widgets - support both data structures
    const isCompleted = game.status === 'completed' || game.statusIsCompleted === true;
    if (isCompleted && game.statusAllowsStatistics === true) {
      const gameScores = batchScores?.[game.id] || [];
      
      if (gameScores.length > 0) {
        gamesWithStats++;
        
        // Calculate total goals for this game
        let gameGoalsFor = 0;
        let gameGoalsAgainst = 0;
        
        gameScores.forEach(score => {
          if (score.teamId === teamId) {
            gameGoalsFor += score.score;
          } else {
            gameGoalsAgainst += score.score;
          }
        });
        
        totalGoalsFor += gameGoalsFor;
        totalGoalsAgainst += gameGoalsAgainst;
      }
    }
  });

  const avgGoalsFor = gamesWithStats > 0 ? totalGoalsFor / gamesWithStats : 0;
  const avgGoalsAgainst = gamesWithStats > 0 ? totalGoalsAgainst / gamesWithStats : 0;

  return { avgGoalsFor, avgGoalsAgainst, gamesWithStats };
}

/**
 * Calculate quarter proportions from quarter averages
 */
export function calculateQuarterProportions(
  quarterAverages: { quarter: number; avgTeamScore: number; avgOpponentScore: number; gamesWithData: number }[]
): { quarterProportions: Record<number, { attack: number; defense: number }>; totalQuarterScores: number; totalQuarterDefense: number } {
  const totalQuarterScores = quarterAverages.reduce((sum, q) => sum + q.avgTeamScore, 0);
  const totalQuarterDefense = quarterAverages.reduce((sum, q) => sum + q.avgOpponentScore, 0);

  const quarterProportions: Record<number, { attack: number; defense: number }> = {};

  quarterAverages.forEach(({ quarter, avgTeamScore, avgOpponentScore }) => {
    const attackProportion = totalQuarterScores > 0 ? avgTeamScore / totalQuarterScores : 0.25;
    const defenseProportion = totalQuarterDefense > 0 ? avgOpponentScore / totalQuarterDefense : 0.25;
    
    quarterProportions[quarter] = { attack: attackProportion, defense: defenseProportion };
  });

  return { quarterProportions, totalQuarterScores, totalQuarterDefense };
}

/**
 * Calculate quarter-by-quarter position breakdowns using actual quarter averages
 */
export function calculateQuarterPositionBreakdowns(
  seasonAverages: { avgGoalsFor: number; avgGoalsAgainst: number },
  quarterAverages: { quarter: number; avgTeamScore: number; avgOpponentScore: number; gamesWithData: number }[],
  batchStats: Record<number, any[]> | undefined,
  games: any[],
  teamId: number
): {
  quarterData: Array<{
    quarter: number;
    gsGoalsFor: number;
    gaGoalsFor: number;
    gkGoalsAgainst: number;
    gdGoalsAgainst: number;
    gamesWithQuarterData: number;
  }>;
  positionTotals: {
    gsAvgGoalsFor: number;
    gaAvgGoalsFor: number;
    gkAvgGoalsAgainst: number;
    gdAvgGoalsAgainst: number;
    attackingPositionsTotal: number;
    defendingPositionsTotal: number;
  };
} {

  // Calculate season-level position percentages as fallback
  let seasonGsGoals = 0, seasonGaGoals = 0, seasonGkGoals = 0, seasonGdGoals = 0;
  
  if (batchStats) {
    games.forEach(game => {
      const isCompleted = game.status === 'completed' || game.statusIsCompleted === true;
      if (isCompleted && game.statusAllowsStatistics === true) {
        const gameStats = batchStats[game.id] || [];
        const teamStats = gameStats.filter(stat => stat.teamId === teamId);
        
        teamStats.forEach(stat => {
          if (stat.position === 'GS') seasonGsGoals += stat.goalsFor || 0;
          if (stat.position === 'GA') seasonGaGoals += stat.goalsFor || 0;
          if (stat.position === 'GK') seasonGkGoals += stat.goalsAgainst || 0;
          if (stat.position === 'GD') seasonGdGoals += stat.goalsAgainst || 0;
        });
      }
    });
  }
  
  const seasonAttackTotal = seasonGsGoals + seasonGaGoals;
  const seasonDefenseTotal = seasonGkGoals + seasonGdGoals;
  
  const seasonGsPercentage = seasonAttackTotal > 0 ? seasonGsGoals / seasonAttackTotal : 0.5;
  const seasonGaPercentage = seasonAttackTotal > 0 ? seasonGaGoals / seasonAttackTotal : 0.5;
  const seasonGkPercentage = seasonDefenseTotal > 0 ? seasonGkGoals / seasonDefenseTotal : 0.5;
  const seasonGdPercentage = seasonDefenseTotal > 0 ? seasonGdGoals / seasonDefenseTotal : 0.5;



  const quarterData = quarterAverages.map(({ quarter, avgTeamScore, avgOpponentScore, gamesWithData }) => {

    
    // Calculate quarter-specific position percentages from game stats
    let qGsGoals = 0, qGaGoals = 0, qGkGoals = 0, qGdGoals = 0;

    if (batchStats) {
      games.forEach(game => {
        const isCompleted = game.status === 'completed' || game.statusIsCompleted === true;
    if (isCompleted && game.statusAllowsStatistics === true) {
          const gameStats = batchStats[game.id] || [];
          const quarterTeamStats = gameStats.filter(stat => 
            stat.teamId === teamId && stat.quarter === quarter
          );
          
          quarterTeamStats.forEach(stat => {
            if (stat.position === 'GS') qGsGoals += stat.goalsFor || 0;
            if (stat.position === 'GA') qGaGoals += stat.goalsFor || 0;
            if (stat.position === 'GK') qGkGoals += stat.goalsAgainst || 0;
            if (stat.position === 'GD') qGdGoals += stat.goalsAgainst || 0;
          });
        }
      });
    }

    // Calculate quarter-specific percentages (default to 50/50 if no data)
    const qAttackTotal = qGsGoals + qGaGoals;
    const qDefenseTotal = qGkGoals + qGdGoals;
    
    // Check if we have complete position data for this quarter
    const hasCompleteQuarterData = qAttackTotal > 0 && qDefenseTotal > 0;
    
    const qGsPercentage = qAttackTotal > 0 ? qGsGoals / qAttackTotal : 0.5;
    const qGaPercentage = qAttackTotal > 0 ? qGaGoals / qAttackTotal : 0.5;
    const qGkPercentage = qDefenseTotal > 0 ? qGkGoals / qDefenseTotal : 0.5;
    const qGdPercentage = qDefenseTotal > 0 ? qGdGoals / qDefenseTotal : 0.5;

    // Use quarter-specific percentages if available, otherwise use season percentages
    const finalGsPercentage = hasCompleteQuarterData ? qGsPercentage : seasonGsPercentage;
    const finalGaPercentage = hasCompleteQuarterData ? qGaPercentage : seasonGaPercentage;
    const finalGkPercentage = hasCompleteQuarterData ? qGkPercentage : seasonGkPercentage;
    const finalGdPercentage = hasCompleteQuarterData ? qGdPercentage : seasonGdPercentage;
    

    
    // Use actual quarter averages and apply position percentages
    // Calculate unrounded values first
    const gsGoalsForUnrounded = avgTeamScore * finalGsPercentage;
    const gaGoalsForUnrounded = avgTeamScore * finalGaPercentage;
    const gkGoalsAgainstUnrounded = avgOpponentScore * finalGkPercentage;
    const gdGoalsAgainstUnrounded = avgOpponentScore * finalGdPercentage;
    

    
    // Round each position individually
    const gsGoalsFor = Math.round(gsGoalsForUnrounded * 10) / 10;
    const gaGoalsFor = Math.round(gaGoalsForUnrounded * 10) / 10;
    const gkGoalsAgainst = Math.round(gkGoalsAgainstUnrounded * 10) / 10;
    const gdGoalsAgainst = Math.round(gdGoalsAgainstUnrounded * 10) / 10;
    


    return {
      quarter,
      gsGoalsFor: gsGoalsFor,
      gaGoalsFor: gaGoalsFor,
      gkGoalsAgainst: gkGoalsAgainst,
      gdGoalsAgainst: gdGoalsAgainst,
      gamesWithQuarterData: gamesWithData
    };
  });

  // Calculate position totals from quarter data
  const totalGsFromQuarters = quarterData.reduce((sum, q) => sum + q.gsGoalsFor, 0);
  const totalGaFromQuarters = quarterData.reduce((sum, q) => sum + q.gaGoalsFor, 0);
  const totalGkFromQuarters = quarterData.reduce((sum, q) => sum + q.gkGoalsAgainst, 0);
  const totalGdFromQuarters = quarterData.reduce((sum, q) => sum + q.gdGoalsAgainst, 0);

  const positionTotals = {
    gsAvgGoalsFor: totalGsFromQuarters,
    gaAvgGoalsFor: totalGaFromQuarters,
    gkAvgGoalsAgainst: totalGkFromQuarters,
    gdAvgGoalsAgainst: totalGdFromQuarters,
    attackingPositionsTotal: totalGsFromQuarters + totalGaFromQuarters,
    defendingPositionsTotal: totalGkFromQuarters + totalGdFromQuarters
  };



  return { quarterData, positionTotals };
}

/**
 * Calculate consistent quarter performance data for all widgets
 */
export function calculateConsistentQuarterPerformance(
  games: any[],
  batchScores: Record<number, any[]>,
  batchStats: Record<number, any[]> | undefined,
  teamId: number
): {
  seasonAverages: { avgGoalsFor: number; avgGoalsAgainst: number; gamesWithStats: number };
  quarterAverages: { quarter: number; avgTeamScore: number; avgOpponentScore: number; gamesWithData: number }[];
  quarterData: Array<{
    quarter: number;
    gsGoalsFor: number;
    gaGoalsFor: number;
    gkGoalsAgainst: number;
    gdGoalsAgainst: number;
    gamesWithQuarterData: number;
  }>;
  positionTotals: {
    gsAvgGoalsFor: number;
    gaAvgGoalsFor: number;
    gkAvgGoalsAgainst: number;
    gdAvgGoalsAgainst: number;
    attackingPositionsTotal: number;
    defendingPositionsTotal: number;
  };
} {
  // Calculate season averages using consistent filtering
  const seasonAverages = calculateSeasonAverages(games, batchScores, teamId);
  
  // Calculate quarter averages using consistent filtering
  const quarterAverages = calculateQuarterAverages(games, batchScores, teamId, true);
  
  // Distribute season averages to quarters
  const { quarterData, positionTotals } = calculateQuarterPositionBreakdowns(
    seasonAverages,
    quarterAverages,
    batchStats,
    games,
    teamId
  );

  return {
    seasonAverages,
    quarterAverages,
    quarterData,
    positionTotals
  };
}

