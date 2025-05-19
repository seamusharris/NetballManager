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
  
  // Group rosters by quarter
  const rosterByQuarter: Record<number, Roster[]> = {};
  rosters.forEach(roster => {
    if (!rosterByQuarter[roster.quarter]) {
      rosterByQuarter[roster.quarter] = [];
    }
    rosterByQuarter[roster.quarter].push(roster);
  });
  
  // Add tables for each quarter
  Object.keys(rosterByQuarter).forEach((quarter, index) => {
    const quarterNum = parseInt(quarter);
    const quarterRosters = rosterByQuarter[quarterNum];
    
    const tableData = quarterRosters.map(roster => {
      const player = playerMap[roster.playerId];
      return [
        positionLabels[roster.position], 
        player ? player.displayName : 'Unknown Player'
      ];
    });
    
    // Add a header for the quarter
    if (index === 0) {
      doc.setFontSize(14);
      doc.text(getQuarterLabel(quarterNum), 14, 45);
    }
    
    autoTable(doc, {
      startY: index === 0 ? 50 : undefined,
      head: [['Position', 'Player']],
      body: tableData,
      didDrawPage: (data) => {
        if (index > 0) {
          doc.setFontSize(14);
          doc.text(getQuarterLabel(quarterNum), 14, data.settings.startY - 10);
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
  rosters: Roster[],
  players: Player[]
) => {
  const playerMap = players.reduce((map, player) => {
    map[player.id] = player;
    return map;
  }, {} as Record<number, Player>);
  
  // Group rosters by quarter
  const rosterByQuarter: Record<number, Roster[]> = {};
  rosters.forEach(roster => {
    if (!rosterByQuarter[roster.quarter]) {
      rosterByQuarter[roster.quarter] = [];
    }
    rosterByQuarter[roster.quarter].push(roster);
  });
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Game details sheet
  const gameDetailsWS = XLSX.utils.aoa_to_sheet([
    ['Game Date', formatShortDate(game.date)],
    ['Time', game.time],
    ['Opponent', opponent.teamName]
  ]);
  XLSX.utils.book_append_sheet(wb, gameDetailsWS, 'Game Details');
  
  // Quarter sheets
  Object.keys(rosterByQuarter).forEach(quarter => {
    const quarterNum = parseInt(quarter);
    const quarterRosters = rosterByQuarter[quarterNum];
    
    const sheetData = [
      ['Position', 'Player']
    ];
    
    quarterRosters.forEach(roster => {
      const player = playerMap[roster.playerId];
      sheetData.push([
        positionLabels[roster.position],
        player ? player.displayName : 'Unknown Player'
      ]);
    });
    
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(wb, ws, getQuarterLabel(quarterNum));
  });
  
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