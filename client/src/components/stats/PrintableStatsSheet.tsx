import React, { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Printer, FileText, FileSpreadsheet } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Position, POSITIONS } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';

interface PrintableStatsSheetProps {
  game: any;
  opponent: any;
  roster?: any[];
  players?: any[];
}

export default function PrintableStatsSheet({ game, opponent, roster: propRoster, players: propPlayers }: PrintableStatsSheetProps) {
  // Fetch roster data if not provided via props
    queryKey: ['/api/games', game?.id, 'rosters'],
    queryFn: async () => {
      if (!game?.id) return [];
      const res = await fetch(`/api/games/${game.id}/rosters`);
      return res.json();
    },
    enabled: !!game?.id && !propRoster,
  });

  // Fetch players data if not provided via props
    queryKey: ['/api/players'],
    queryFn: async () => {
      const res = await fetch('/api/players');
      return res.json();
    },
    enabled: !propPlayers,
  });

  const roster = propRoster || rosterData || [];
  const players = propPlayers || playersData || [];

  // Group roster by quarter and position
  const rosterByQuarterPosition = roster.reduce((acc, item) => {
    if (!acc[item.quarter]) {
      acc[item.quarter] = {};
    }
    acc[item.quarter][item.position] = item.playerId;
    return acc;
  }, {});

  // Function to get player name by ID
  const getPlayerName = (playerId) => {
    const player = players.find(p => p.id === playerId);
    return player ? player.displayName : '';
  };
  // Stats categories to track
  const statsCategories = [
    { id: 'goalsFor', label: 'Goals For' },
    { id: 'goalsAgainst', label: 'Goals Against' },
    { id: 'missedGoals', label: 'Missed Goals' },
    { id: 'rebounds', label: 'Rebounds' },
    { id: 'intercepts', label: 'Intercepts' },
    { id: 'badPass', label: 'Bad Passes' },
    { id: 'handlingError', label: 'Handling Errors' },
    { id: 'pickUp', label: 'Pick Ups' },
    { id: 'infringement', label: 'Infringements' }
  ];

  // Handle print function
  const handlePrint = () => {
    window.print();
  };

  // Export to PDF
  const handleExportPDF = () => {
    if (!game) return;

    const doc = new jsPDF();

    // Add title
    const gameDate = formatDate(game.date);
    const opponentName = opponent?.teamName || 'Unknown Opponent';
    const roundInfo = game.round ? ` (Round ${game.round})` : '';
    const title = `${gameDate} - Stats Sheet vs ${opponentName}${roundInfo}`;

    doc.setFontSize(14);
    doc.text(title, 14, 15);

    // Import autotable dynamically
    Promise.all([import('jspdf-autotable')]).then(([autoTableModule]) => {
      const autoTable = autoTableModule.default;

      // First page: Quarter 1 & 2
      let yPos = 20;

      for (let quarter = 1; quarter <= 2; quarter++) {
        // Add quarter heading
        doc.setFontSize(11);
        doc.text(`Quarter ${quarter}`, 14, yPos);

        // Create player names array for position header subtext
        const playerNames = POSITIONS.map(position => {
          const playerId = rosterByQuarterPosition[quarter]?.[position];
          return playerId ? getPlayerName(playerId) : '';
        });

        // Create header row with position columns
        const headers = ['Stat', ...POSITIONS];

        // Create the player names row
        const playerRow = ['Player', ...playerNames];

        // Create rows for each stat category
        const rows = statsCategories.map(category => {
          return [category.label, '', '', '', '', '', '', ''];
        });

        // Add the table
        autoTable(doc, {
          startY: yPos + 4,
          head: [headers, playerRow],
          body: rows,
          theme: 'grid',
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [59, 130, 246], textColor: 255 },
          columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 20 }
          },
          // Custom styles for player names row
          didParseCell: (data) => {
            if (data.section === 'head' && data.row.index === 1) {
              data.cell.styles.fillColor = [224, 242, 254]; // bg-blue-100
              data.cell.styles.textColor = [30, 64, 175]; // text-blue-800
              data.cell.styles.fontStyle = 'normal';
            }
          },
          margin: { left: 10, right: 10 },
          didDrawPage: (data) => {
            if (data.cursor) {
              yPos = data.cursor.y + 10;
            }
          }
        });
      }

      // Second page: Quarter 3 & 4
      doc.addPage();
      yPos = 20;

      for (let quarter = 3; quarter <= 4; quarter++) {
        // Add quarter heading
        doc.setFontSize(11);
        doc.text(`Quarter ${quarter}`, 14, yPos);

        // Create player names array for position header subtext
        const playerNames = POSITIONS.map(position => {
          const playerId = rosterByQuarterPosition[quarter]?.[position];
          return playerId ? getPlayerName(playerId) : '';
        });

        // Create header row with position columns
        const headers = ['Stat', ...POSITIONS];

        // Create the player names row
        const playerRow = ['Player', ...playerNames];

        // Create rows for each stat category
        const rows = statsCategories.map(category => {
          return [category.label, '', '', '', '', '', '', ''];
        });

        // Add the table
        autoTable(doc, {
          startY: yPos + 4,
          head: [headers, playerRow],
          body: rows,
          theme: 'grid',
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [59, 130, 246], textColor: 255 },
          columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 20 }
          },
          // Custom styles for player names row
          didParseCell: (data) => {
            if (data.section === 'head' && data.row.index === 1) {
              data.cell.styles.fillColor = [224, 242, 254]; // bg-blue-100
              data.cell.styles.textColor = [30, 64, 175]; // text-blue-800
              data.cell.styles.fontStyle = 'normal';
            }
          },
          margin: { left: 10, right: 10 },
          didDrawPage: (data) => {
            if (data.cursor) {
              yPos = data.cursor.y + 10;
            }
          }
        });
      }

      // Save PDF
      doc.save(`${gameDate.replace(/\//g, '-')}_stats_sheet_${opponentName.replace(/\s+/g, '_')}${roundInfo ? '_Round' + game.round : ''}.pdf`);
    });
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (!game) return;

    // Create a workbook with one sheet per quarter
    const wb = XLSX.utils.book_new();

    for (let quarter = 1; quarter <= 4; quarter++) {
      // Create headers
      const headers = ['Stat Category', ...POSITIONS];

      // Create player names row
      const playerNames = ['Players'];
      for (const position of POSITIONS) {
        const playerId = rosterByQuarterPosition[quarter]?.[position];
        const playerName = playerId ? getPlayerName(playerId) : '';
        playerNames.push(playerName);
      }

      // Create data array starting with headers and player names
      const data = [
        headers,
        playerNames,
        // Add empty rows for each stat category
        ...statsCategories.map(category => {
          return [category.label, '', '', '', '', '', '', ''];
        })
      ];

      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(data);

      // Set column widths
      const colWidths = [
        { wch: 20 }, // Stat Category
        { wch: 12 }, // GS
        { wch: 12 }, // GA
        { wch: 12 }, // WA
        { wch: 12 }, // C
        { wch: 12 }, // WD
        { wch: 12 }, // GD
        { wch: 12 }, // GK
      ];

      ws['!cols'] = colWidths;

      // Style the player names row
      for (let i = 0; i < playerNames.length; i++) {
        if (!ws[cellRef]) continue;

        // Create cell style for player names (blue background)
        if (!ws[cellRef].s) ws[cellRef].s = {};
        ws[cellRef].s.fill = {fgColor: {rgb: "E0F2FE"}}; // Light blue bg
        ws[cellRef].s.font = {color: {rgb: "1E40AF"}}; // Blue text
      }

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, `Quarter ${quarter}`);
    }

    // Save Excel file
    const gameDate = formatDate(game.date).replace(/\//g, '-');
    const opponentName = opponent?.teamName || 'Unknown';
    const roundInfo = game.round ? `_Round${game.round}` : '';
    XLSX.writeFile(wb, `${gameDate}_stats_sheet_${opponentName.replace(/\s+/g, '_')}${roundInfo}.xlsx`);
  };

  // Print-specific styles (will be active only during printing)
  const printStyles = `
    @media print {
      body * {
        visibility: hidden;
      }
      .print-section, .print-section * {
        visibility: visible;
      }
      .print-section {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
      }
      .no-print {
        display: none !important;
      }
      .page-break {
        page-break-after: always;
      }
      @page {
        size: A4 portrait;
        margin: 0.5cm;
      }
      .compact-table td, .compact-table th {
        padding: 0.15rem 0.25rem !important;
        font-size: 0.8rem !important;
      }
      .compact-heading {
        margin-top: 0.2rem !important;
        margin-bottom: 0.2rem !important;
      }
    }
  `;

  return (
    <div>
      <style>{printStyles}</style>

      <div className="flex justify-between items-center mb-6 no-print">
        <h2 className="text-xl font-bold">Stats Collection Sheet</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handlePrint}
            className="flex items-center gap-1"
          >
            <Printer className="h-4 w-4" /> Print
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportPDF}
            className="flex items-center gap-1"
          >
            <FileText className="h-4 w-4" /> PDF
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportExcel}
            className="flex items-center gap-1"
          >
            <FileSpreadsheet className="h-4 w-4" /> Excel
          </Button>
        </div>
      </div>

      <div className="print-section">
        <div className="mb-2">
          <h1 className="text-xl font-bold compact-heading">
            {formatDate(game?.date || '')} - Stats Sheet
          </h1>
          <p className="text-base compact-heading">
            vs {opponent?.teamName || 'Unknown Opponent'}
            {game?.round && ` (Round ${game.round})`}
          </p>
        </div>

        {/* Score summary section */}
        <div className="mb-4 print:mb-2">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="border border-gray-300 p-2">
              <div className="text-sm font-medium">Q1 Score</div>
              <div className="text-lg border-b border-gray-300 pb-1 mb-1">___</div>
              <div className="text-xs text-gray-500">Us vs Them</div>
            </div>
            <div className="border border-gray-300 p-2">
              <div className="text-sm font-medium">Q2 Score</div>
              <div className="text-lg border-b border-gray-300 pb-1 mb-1">___</div>
              <div className="text-xs text-gray-500">Us vs Them</div>
            </div>
            <div className="border border-gray-300 p-2">
              <div className="text-sm font-medium">Q3 Score</div>
              <div className="text-lg border-b border-gray-300 pb-1 mb-1">___</div>
              <div className="text-xs text-gray-500">Us vs Them</div>
            </div>
            <div className="border border-gray-300 p-2">
              <div className="text-sm font-medium">Q4 Score</div>
              <div className="text-lg border-b border-gray-300 pb-1 mb-1">___</div>
              <div className="text-xs text-gray-500">Us vs Them</div>
            </div>
          </div>
        </div>

        {/* All quarters in a more compact layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-1">
          {[1, 2, 3, 4].map(quarter => (
            <div key={`quarter-${quarter}`} className={`mb-2 ${quarter === 3 ? 'page-break md:page-break-avoid' : ''}`}>
              <h3 className="text-base font-semibold mb-1 compact-heading flex justify-between items-center">
                <span>Quarter {quarter}</span>
                <span className="text-sm font-normal text-gray-500">Score: ___ vs ___</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200 compact-table">
                  <thead>
                    <tr className="bg-blue-500">
                      <th className="border border-gray-300 text-white" style={{width: '90px'}}>Stat</th>
                      {POSITIONS.map(position => (
                        <th key={position} className="border border-gray-300 text-white" style={{width: '40px'}}>{position}</th>
                      ))}
                    </tr>
                    {/* Player names row */}
                    <tr className="bg-blue-100">
                      <th className="border border-gray-300 text-blue-800 text-xs">Player</th>
                      {POSITIONS.map(position => {
                        const playerId = rosterByQuarterPosition[quarter]?.[position];
                        const playerName = playerId ? getPlayerName(playerId) : '';
                        return (
                          <th 
                            key={`player-${position}`} 
                            className="border border-gray-300 text-blue-800 text-xs font-normal p-1"
                          >
                            {playerName}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {statsCategories.map(category => (
                      <tr key={category.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 font-medium">{category.label}</td>
                        {POSITIONS.map(position => (
                          <td key={`${position}-${category.id}`} className="border border-gray-300 text-center h-6"></td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}