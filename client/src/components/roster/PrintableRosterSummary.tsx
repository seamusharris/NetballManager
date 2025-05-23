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
    const title = `${gameDate} - Roster vs ${opponentName}`;
    
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
    
    // Add table to PDF
    (doc as any).autoTable({
      startY: 30,
      head: [['Position', 'Q1', 'Q2', 'Q3', 'Q4']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 245, 255] }
    });
    
    // Save PDF
    doc.save(`${gameDate.replace(/\//g, '-')}_roster_${opponentName.replace(/\s+/g, '_')}.pdf`);
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (!game) return;
    
    // Prepare the data
    const data = POSITIONS.map(position => {
      return {
        'Position': position,
        'Quarter 1': getPlayerName(rosterByQuarter['1'][position] || null),
        'Quarter 2': getPlayerName(rosterByQuarter['2'][position] || null),
        'Quarter 3': getPlayerName(rosterByQuarter['3'][position] || null),
        'Quarter 4': getPlayerName(rosterByQuarter['4'][position] || null)
      };
    });
    
    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Roster");
    
    // Save Excel file
    const gameDate = formatDate(game.date).replace(/\//g, '-');
    const opponentName = opponent?.teamName || 'Unknown';
    XLSX.writeFile(wb, `${gameDate}_roster_${opponentName.replace(/\s+/g, '_')}.xlsx`);
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
        
        <Table className="border-2 border-gray-200">
          <TableHeader className="bg-blue-500">
            <TableRow>
              <TableHead className="text-white font-bold">Position</TableHead>
              <TableHead className="text-white font-bold text-center">Quarter 1</TableHead>
              <TableHead className="text-white font-bold text-center">Quarter 2</TableHead>
              <TableHead className="text-white font-bold text-center">Quarter 3</TableHead>
              <TableHead className="text-white font-bold text-center">Quarter 4</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {POSITIONS.map(position => (
              <TableRow key={position} className="hover:bg-blue-50">
                <TableCell className="font-medium">{position}</TableCell>
                <TableCell className="text-center">{getPlayerName(rosterByQuarter['1'][position])}</TableCell>
                <TableCell className="text-center">{getPlayerName(rosterByQuarter['2'][position])}</TableCell>
                <TableCell className="text-center">{getPlayerName(rosterByQuarter['3'][position])}</TableCell>
                <TableCell className="text-center">{getPlayerName(rosterByQuarter['4'][position])}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}