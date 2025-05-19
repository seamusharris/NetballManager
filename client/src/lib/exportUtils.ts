import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Game, Player, Opponent, Roster, GameStat } from '@shared/schema';
import { positionLabels, getQuarterLabel, formatShortDate } from './utils';

// PDF Export Functions
export const exportRosterToPDF = (
  game: Game,
  opponent: Opponent,
  players: Player[],
  rosterState: Record<string, Record<string, number | null>>
) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(18);
  doc.text(`Game Roster: ${formatShortDate(game.date)}`, 14, 22);
  
  // Game details
  doc.setFontSize(12);
  doc.text(`Time: ${game.time}`, 14, 32);
  doc.text(`Opponent: ${opponent.teamName}`, 14, 38);
  
  // Roster Table
  const playerMap = players.reduce((map, player) => {
    map[player.id] = player;
    return map;
  }, {} as Record<number, Player>);
  
  // Define quarters and positions
  const quarters = ['1', '2', '3', '4'];
  const positionOrder: Record<string, number> = { 
    'GS': 1, 'GA': 2, 'WA': 3, 'C': 4, 'WD': 5, 'GD': 6, 'GK': 7 
  };
  
  // Process each quarter
  quarters.forEach((quarter, index) => {
    const quarterPositions = rosterState[quarter];
    if (!quarterPositions) return;
    
    // Create table data for this quarter
    const tableData: string[][] = [];
    
    // Sort positions by their natural order
    const sortedPositions = Object.entries(quarterPositions)
      .sort((a, b) => positionOrder[a[0]] - positionOrder[b[0]]);
      
    // Add each position and player to the table
    sortedPositions.forEach(([position, playerId]) => {
      if (playerId === null) return;
      
      const player = playerMap[playerId];
      if (!player) return;
      
      tableData.push([
        positionLabels[position as keyof typeof positionLabels],
        player.displayName
      ]);
    });
    
    // Skip empty quarters
    if (tableData.length === 0) return;
    
    // Add a header for the quarter
    if (index === 0) {
      doc.setFontSize(14);
      doc.text(`Quarter ${quarter}`, 14, 45);
    }
    
    // Create table
    autoTable(doc, {
      startY: index === 0 ? 50 : undefined,
      head: [['Position', 'Player']],
      body: tableData,
      didDrawPage: (data) => {
        if (index > 0) {
          doc.setFontSize(14);
          doc.text(`Quarter ${quarter}`, 14, data.settings.startY - 10);
        }
      }
    });
  });
  
  // Save the PDF
  doc.save(`Roster_${formatShortDate(game.date)}_vs_${opponent.teamName.replace(/\s+/g, '_')}.pdf`);
};

export const exportStatsToPDF = (
  game: Game,
  opponent: Opponent,
  stats: GameStat[],
  players: Player[]
) => {
  const doc = new jsPDF('landscape');
  
  // Title
  doc.setFontSize(18);
  doc.text(`Game Statistics: ${formatShortDate(game.date)}`, 14, 22);
  
  // Game details
  doc.setFontSize(12);
  doc.text(`Time: ${game.time}`, 14, 32);
  doc.text(`Opponent: ${opponent.teamName}`, 14, 38);
  
  // Player Stats Table
  const playerMap = players.reduce((map, player) => {
    map[player.id] = player;
    return map;
  }, {} as Record<number, Player>);
  
  // Group stats by player
  const statsByPlayer: Record<number, GameStat[]> = {};
  stats.forEach(stat => {
    if (!statsByPlayer[stat.playerId]) {
      statsByPlayer[stat.playerId] = [];
    }
    statsByPlayer[stat.playerId].push(stat);
  });
  
  // Calculate totals for each player
  const playerTotals = Object.keys(statsByPlayer).map(playerId => {
    const playerStats = statsByPlayer[parseInt(playerId)];
    const player = playerMap[parseInt(playerId)];
    
    // Sum up all stats
    const totals = playerStats.reduce((acc, stat) => {
      acc.goalsFor += stat.goalsFor || 0;
      acc.goalsAgainst += stat.goalsAgainst || 0;
      acc.missedGoals += stat.missedGoals || 0;
      acc.rebounds += stat.rebounds || 0;
      acc.intercepts += stat.intercepts || 0;
      acc.badPass += stat.badPass || 0;
      acc.handlingError += stat.handlingError || 0;
      acc.pickUp += stat.pickUp || 0;
      acc.infringement += stat.infringement || 0;
      // Only take the rating from the first quarter
      if (stat.quarter === 1 && stat.rating !== null) {
        acc.rating = stat.rating;
      }
      return acc;
    }, {
      goalsFor: 0,
      goalsAgainst: 0,
      missedGoals: 0,
      rebounds: 0,
      intercepts: 0,
      badPass: 0,
      handlingError: 0,
      pickUp: 0,
      infringement: 0,
      rating: 0
    });
    
    return {
      playerName: player ? player.displayName : 'Unknown Player',
      ...totals
    };
  });
  
  // Create the table
  const tableData = playerTotals.map(pt => {
    return [
      pt.playerName,
      pt.goalsFor,
      pt.goalsAgainst,
      pt.missedGoals,
      pt.rebounds,
      pt.intercepts,
      pt.badPass,
      pt.handlingError,
      pt.pickUp,
      pt.infringement,
      pt.rating.toFixed(1)
    ];
  });
  
  autoTable(doc, {
    startY: 45,
    head: [['Player', 'Goals For', 'Goals Against', 'Missed', 'Rebounds', 'Intercepts', 'Bad Pass', 'Handling Error', 'Pick Up', 'Infringement', 'Rating']],
    body: tableData,
    styles: { cellWidth: 'auto' },
    columnStyles: {
      0: { cellWidth: 40 }
    }
  });
  
  // Save the PDF
  doc.save(`Statistics_${formatShortDate(game.date)}_vs_${opponent.teamName.replace(/\s+/g, '_')}.pdf`);
};

// Excel Export Functions
export const exportRosterToExcel = (
  game: Game,
  opponent: Opponent,
  players: Player[],
  rosterState: Record<string, Record<string, number | null>>
) => {
  const playerMap = players.reduce((map, player) => {
    map[player.id] = player;
    return map;
  }, {} as Record<number, Player>);
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Game details sheet
  const gameDetailsWS = XLSX.utils.aoa_to_sheet([
    ['Game Date', formatShortDate(game.date)],
    ['Time', game.time],
    ['Opponent', opponent.teamName]
  ]);
  XLSX.utils.book_append_sheet(wb, gameDetailsWS, 'Game Details');
  
  // Define quarters and positions
  const quarters = ['1', '2', '3', '4'];
  const positionOrder: Record<string, number> = { 
    'GS': 1, 'GA': 2, 'WA': 3, 'C': 4, 'WD': 5, 'GD': 6, 'GK': 7 
  };
  
  // Create quarter sheets
  quarters.forEach(quarter => {
    const quarterPositions = rosterState[quarter];
    if (!quarterPositions) return;
    
    const sheetData = [
      ['Position', 'Player']
    ];
    
    // Sort positions by their natural order
    const sortedPositions = Object.entries(quarterPositions)
      .sort((a, b) => positionOrder[a[0]] - positionOrder[b[0]]);
      
    // Add each position and player to the sheet
    sortedPositions.forEach(([position, playerId]) => {
      if (playerId === null) return;
      
      const player = playerMap[playerId];
      if (!player) return;
      
      sheetData.push([
        positionLabels[position as keyof typeof positionLabels],
        player.displayName
      ]);
    });
    
    // Skip empty quarters
    if (sheetData.length <= 1) return;
    
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(wb, ws, `Quarter ${quarter}`);
  });
  
  // Create a summary sheet showing all players by position
  const summaryData = [
    ['Position', 'Player', 'Quarters']
  ];
  
  // For each position, find all players assigned to it
  for (const position of Object.keys(positionOrder).sort((a, b) => positionOrder[a] - positionOrder[b])) {
    // For each player in this position, collect their quarters
    const playerQuarters = new Map<number, string[]>();
    
    quarters.forEach(quarter => {
      const playerId = rosterState[quarter]?.[position];
      if (playerId !== null && playerId !== undefined) {
        if (!playerQuarters.has(playerId)) {
          playerQuarters.set(playerId, []);
        }
        playerQuarters.get(playerId)?.push(quarter);
      }
    });
    
    // Add each player with their quarters to the summary
    for (const [playerId, assignedQuarters] of playerQuarters.entries()) {
      const player = playerMap[playerId];
      if (!player) continue;
      
      summaryData.push([
        positionLabels[position as keyof typeof positionLabels],
        player.displayName,
        assignedQuarters.map(q => `Q${q}`).join(', ')
      ]);
    }
  }
  
  // Add the summary sheet if we have data
  if (summaryData.length > 1) {
    const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWS, 'Summary');
  }
  
  // Export the workbook
  XLSX.writeFile(wb, `Roster_${formatShortDate(game.date)}_vs_${opponent.teamName.replace(/\s+/g, '_')}.xlsx`);
};

export const exportStatsToExcel = (
  game: Game,
  opponent: Opponent,
  stats: GameStat[],
  players: Player[]
) => {
  const playerMap = players.reduce((map, player) => {
    map[player.id] = player;
    return map;
  }, {} as Record<number, Player>);
  
  // Group stats by player
  const statsByPlayer: Record<number, GameStat[]> = {};
  stats.forEach(stat => {
    if (!statsByPlayer[stat.playerId]) {
      statsByPlayer[stat.playerId] = [];
    }
    statsByPlayer[stat.playerId].push(stat);
  });
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Game details sheet - convert date to string for Excel
  const gameDetailsData = [
    ['Game Date', formatShortDate(game.date)],
    ['Time', game.time],
    ['Opponent', opponent.teamName]
  ];
  
  const gameDetailsWS = XLSX.utils.aoa_to_sheet(gameDetailsData);
  XLSX.utils.book_append_sheet(wb, gameDetailsWS, 'Game Details');
  
  // Summary sheet - all data as strings for Excel
  const summaryData: Array<Array<string | number>> = [
    ['Player', 'Goals For', 'Goals Against', 'Missed', 'Rebounds', 'Intercepts', 'Bad Pass', 'Handling Error', 'Pick Up', 'Infringement', 'Rating']
  ];
  
  Object.keys(statsByPlayer).forEach(playerId => {
    const playerStats = statsByPlayer[parseInt(playerId)];
    const player = playerMap[parseInt(playerId)];
    
    // Sum up all stats
    const totals = playerStats.reduce((acc, stat) => {
      acc.goalsFor += stat.goalsFor || 0;
      acc.goalsAgainst += stat.goalsAgainst || 0;
      acc.missedGoals += stat.missedGoals || 0;
      acc.rebounds += stat.rebounds || 0;
      acc.intercepts += stat.intercepts || 0;
      acc.badPass += stat.badPass || 0;
      acc.handlingError += stat.handlingError || 0;
      acc.pickUp += stat.pickUp || 0;
      acc.infringement += stat.infringement || 0;
      // Only take the rating from the first quarter
      if (stat.quarter === 1 && stat.rating !== null) {
        acc.rating = stat.rating;
      }
      return acc;
    }, {
      goalsFor: 0,
      goalsAgainst: 0,
      missedGoals: 0,
      rebounds: 0,
      intercepts: 0,
      badPass: 0,
      handlingError: 0,
      pickUp: 0,
      infringement: 0,
      rating: 0
    });
    
    summaryData.push([
      player ? player.displayName : 'Unknown Player',
      totals.goalsFor,
      totals.goalsAgainst,
      totals.missedGoals,
      totals.rebounds,
      totals.intercepts,
      totals.badPass,
      totals.handlingError,
      totals.pickUp,
      totals.infringement,
      totals.rating
    ]);
  });
  
  const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWS, 'Summary');
  
  // Quarter sheets
  for (let quarter = 1; quarter <= 4; quarter++) {
    const quarterData: Array<Array<string | number>> = [
      ['Player', 'Goals For', 'Goals Against', 'Missed', 'Rebounds', 'Intercepts', 'Bad Pass', 'Handling Error', 'Pick Up', 'Infringement', 'Rating']
    ];
    
    // Add data for each player in this quarter
    Object.keys(statsByPlayer).forEach(playerId => {
      const playerStats = statsByPlayer[parseInt(playerId)];
      const player = playerMap[parseInt(playerId)];
      
      // Find the stat for this quarter
      const quartStat = playerStats.find(s => s.quarter === quarter);
      
      if (quartStat) {
        quarterData.push([
          player ? player.displayName : 'Unknown Player',
          quartStat.goalsFor || 0,
          quartStat.goalsAgainst || 0,
          quartStat.missedGoals || 0,
          quartStat.rebounds || 0,
          quartStat.intercepts || 0,
          quartStat.badPass || 0,
          quartStat.handlingError || 0,
          quartStat.pickUp || 0,
          quartStat.infringement || 0,
          quartStat.rating || 0
        ]);
      }
    });
    
    const quarterWS = XLSX.utils.aoa_to_sheet(quarterData);
    XLSX.utils.book_append_sheet(wb, quarterWS, getQuarterLabel(quarter));
  }
  
  // Export the workbook
  XLSX.writeFile(wb, `Statistics_${formatShortDate(game.date)}_vs_${opponent.teamName.replace(/\s+/g, '_')}.xlsx`);
};