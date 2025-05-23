import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Printer, FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Position, POSITIONS } from '@shared/schema';

interface PrintableRosterSummaryProps {
  game: any;
  opponent: any;
  roster: any[];
  players: any[];
}

export default function PrintableRosterSummary({ game, opponent, roster, players }: PrintableRosterSummaryProps) {
  // Get the player name by ID
  const getPlayerName = (playerId: number | null) => {
    if (!players || !playerId) return '-';
    const player = players.find(p => p.id === playerId);
    return player ? (player.displayName || `${player.firstName} ${player.lastName}`) : '-';
  };

  // Organize roster data by quarter and position
  const rosterByQuarter = React.useMemo(() => {
    const result: Record<string, Record<string, number | null>> = {
      '1': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
      '2': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
      '3': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null },
      '4': { 'GS': null, 'GA': null, 'WA': null, 'C': null, 'WD': null, 'GD': null, 'GK': null }
    };
    
    if (roster && roster.length > 0) {
      roster.forEach(entry => {
        if (entry.quarter >= 1 && entry.quarter <= 4 && POSITIONS.includes(entry.position as Position)) {
          result[entry.quarter.toString()][entry.position] = entry.playerId;
        }
      });
    }
    
    return result;
  }, [roster]);
  
  // Identify players who are off in each quarter
  const offPlayersByQuarter = React.useMemo(() => {
    const result: Record<string, number[]> = {
      '1': [],
      '2': [],
      '3': [],
      '4': []
    };
    
    // Only process if we have both roster and players
    if (roster && roster.length > 0 && players && players.length > 0) {
      // Get all player IDs from the roster
      const uniquePlayerIds = new Set<number>();
      roster.forEach(entry => {
        if (entry.playerId) {
          uniquePlayerIds.add(entry.playerId);
        }
      });
      
      // For each quarter, find players who aren't assigned a position
      for (let quarter = 1; quarter <= 4; quarter++) {
        const quarterKey = quarter.toString();
        const assignedPlayers = new Set<number>();
        
        // Get all players assigned in this quarter
        Object.values(rosterByQuarter[quarterKey]).forEach(playerId => {
          if (playerId !== null) {
            assignedPlayers.add(playerId);
          }
        });
        
        // Find players who are on the roster but not assigned in this quarter
        uniquePlayerIds.forEach(playerId => {
          if (!assignedPlayers.has(playerId)) {
            result[quarterKey].push(playerId);
          }
        });
      }
    }
    
    return result;
  }, [roster, players, rosterByQuarter]);

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
    const title = `${gameDate} - Roster vs ${opponentName}${roundInfo}`;
    
    doc.setFontSize(18);
    doc.text(title, 14, 20);
    
    // Create table data for positions by quarter
    const tableData = POSITIONS.map(position => {
      return [
        position,
        getPlayerName(rosterByQuarter['1'][position] || null),
        getPlayerName(rosterByQuarter['2'][position] || null),
        getPlayerName(rosterByQuarter['3'][position] || null),
        getPlayerName(rosterByQuarter['4'][position] || null)
      ];
    });
    
    // Add table to PDF - use the properly imported autoTable
    import('jspdf-autotable').then((autoTable) => {
      const autoTablePlugin = autoTable.default;
      
      // First table - Players by position
      autoTablePlugin(doc, {
        startY: 30,
        head: [['Position', 'Q1', 'Q2', 'Q3', 'Q4']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 245, 255] }
      });
      
      // Get the Y position after the first table
      const finalY = (doc as any).lastAutoTable.finalY || 120;
      
      // Add "Players Off" section title
      doc.setFontSize(14);
      doc.text("Players Off Court", 14, finalY + 15);
      
      // Second table - Players off
      autoTablePlugin(doc, {
        startY: finalY + 20,
        head: [['Players Off', 'Q1', 'Q2', 'Q3', 'Q4']],
        body: [[
          'Off Court',
          offPlayersByQuarter['1'].length > 0 ? offPlayersByQuarter['1'].map(id => getPlayerName(id)).join(', ') : 'None',
          offPlayersByQuarter['2'].length > 0 ? offPlayersByQuarter['2'].map(id => getPlayerName(id)).join(', ') : 'None',
          offPlayersByQuarter['3'].length > 0 ? offPlayersByQuarter['3'].map(id => getPlayerName(id)).join(', ') : 'None',
          offPlayersByQuarter['4'].length > 0 ? offPlayersByQuarter['4'].map(id => getPlayerName(id)).join(', ') : 'None',
        ]],
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [59, 130, 246], textColor: 255 }
      });
      
      // Save PDF after both tables are applied
      doc.save(`${gameDate.replace(/\//g, '-')}_roster_${opponentName.replace(/\s+/g, '_')}.pdf`);
    });
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (!game) return;
    
    // Prepare the data for positions by quarter
    const positionData = POSITIONS.map(position => {
      return {
        'Position': position,
        'Quarter 1': getPlayerName(rosterByQuarter['1'][position] || null),
        'Quarter 2': getPlayerName(rosterByQuarter['2'][position] || null),
        'Quarter 3': getPlayerName(rosterByQuarter['3'][position] || null),
        'Quarter 4': getPlayerName(rosterByQuarter['4'][position] || null)
      };
    });
    
    // Prepare data for players who are off in each quarter
    const offPlayersData = [{
      'Players Off': 'Off Court',
      'Quarter 1': offPlayersByQuarter['1'].length > 0 
        ? offPlayersByQuarter['1'].map(id => getPlayerName(id)).join(', ') 
        : 'None',
      'Quarter 2': offPlayersByQuarter['2'].length > 0 
        ? offPlayersByQuarter['2'].map(id => getPlayerName(id)).join(', ') 
        : 'None',
      'Quarter 3': offPlayersByQuarter['3'].length > 0 
        ? offPlayersByQuarter['3'].map(id => getPlayerName(id)).join(', ') 
        : 'None',
      'Quarter 4': offPlayersByQuarter['4'].length > 0 
        ? offPlayersByQuarter['4'].map(id => getPlayerName(id)).join(', ') 
        : 'None'
    }];
    
    // Create workbook and worksheets
    const wb = XLSX.utils.book_new();
    
    // Add positions worksheet
    const positionsWs = XLSX.utils.json_to_sheet(positionData);
    XLSX.utils.book_append_sheet(wb, positionsWs, "Positions");
    
    // Add off players worksheet
    const offPlayersWs = XLSX.utils.json_to_sheet(offPlayersData);
    XLSX.utils.book_append_sheet(wb, offPlayersWs, "Players Off");
    
    // Save Excel file
    const gameDate = formatDate(game.date).replace(/\//g, '-');
    const opponentName = opponent?.teamName || 'Unknown';
    const roundInfo = game.round ? `_Round${game.round}` : '';
    XLSX.writeFile(wb, `${gameDate}_roster_${opponentName.replace(/\s+/g, '_')}${roundInfo}.xlsx`);
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
    }
  `;

  return (
    <div>
      <style>{printStyles}</style>
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Roster Summary</h2>
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
            <FileDown className="h-4 w-4" /> PDF
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportExcel}
            className="flex items-center gap-1"
          >
            <FileDown className="h-4 w-4" /> Excel
          </Button>
        </div>
      </div>
      
      <div className="print-section">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">
            {formatDate(game?.date || '')} - Game Roster
          </h1>
          <p className="text-lg">
            vs {opponent?.teamName || 'Unknown Opponent'}
            {game?.round && ` (Round ${game.round})`}
          </p>
        </div>
        
        <Table className="border-2 border-gray-200 mb-8 w-full table-fixed">
          <TableHeader className="bg-blue-500">
            <TableRow>
              <TableHead className="text-white font-bold w-[10%] border-r border-gray-200">Position</TableHead>
              <TableHead className="text-white font-bold text-center w-[22.5%] border-r border-gray-200">Quarter 1</TableHead>
              <TableHead className="text-white font-bold text-center w-[22.5%] border-r border-gray-200">Quarter 2</TableHead>
              <TableHead className="text-white font-bold text-center w-[22.5%] border-r border-gray-200">Quarter 3</TableHead>
              <TableHead className="text-white font-bold text-center w-[22.5%]">Quarter 4</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {POSITIONS.map(position => (
              <TableRow key={position} className="hover:bg-blue-50">
                <TableCell className="font-medium text-center border-r border-gray-200">{position}</TableCell>
                <TableCell className="text-left pl-4 border-r border-gray-200">{getPlayerName(rosterByQuarter['1'][position])}</TableCell>
                <TableCell className="text-left pl-4 border-r border-gray-200">{getPlayerName(rosterByQuarter['2'][position])}</TableCell>
                <TableCell className="text-left pl-4 border-r border-gray-200">{getPlayerName(rosterByQuarter['3'][position])}</TableCell>
                <TableCell className="text-left pl-4">{getPlayerName(rosterByQuarter['4'][position])}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {/* Players who are off in each quarter */}
        <Table className="border-2 border-gray-200 w-full table-fixed">
          <TableHeader className="bg-blue-500">
            <TableRow>
              <TableHead className="text-white font-bold w-[10%] border-r border-gray-200">Off</TableHead>
              <TableHead className="text-white font-bold text-center w-[22.5%] border-r border-gray-200">Quarter 1</TableHead>
              <TableHead className="text-white font-bold text-center w-[22.5%] border-r border-gray-200">Quarter 2</TableHead>
              <TableHead className="text-white font-bold text-center w-[22.5%] border-r border-gray-200">Quarter 3</TableHead>
              <TableHead className="text-white font-bold text-center w-[22.5%]">Quarter 4</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium text-center border-r border-gray-200">Off</TableCell>
              <TableCell className="text-left pl-4 border-r border-gray-200">
                {offPlayersByQuarter['1'].length > 0 
                  ? offPlayersByQuarter['1'].map(id => getPlayerName(id)).join(', ') 
                  : 'None'}
              </TableCell>
              <TableCell className="text-left pl-4 border-r border-gray-200">
                {offPlayersByQuarter['2'].length > 0 
                  ? offPlayersByQuarter['2'].map(id => getPlayerName(id)).join(', ') 
                  : 'None'}
              </TableCell>
              <TableCell className="text-left pl-4 border-r border-gray-200">
                {offPlayersByQuarter['3'].length > 0 
                  ? offPlayersByQuarter['3'].map(id => getPlayerName(id)).join(', ') 
                  : 'None'}
              </TableCell>
              <TableCell className="text-left pl-4">
                {offPlayersByQuarter['4'].length > 0 
                  ? offPlayersByQuarter['4'].map(id => getPlayerName(id)).join(', ') 
                  : 'None'}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}