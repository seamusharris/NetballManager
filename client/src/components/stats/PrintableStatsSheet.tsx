import React from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Printer, FileText, FileSpreadsheet } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Position, POSITIONS } from '@shared/schema';

interface PrintableStatsSheetProps {
  game: any;
  opponent: any;
}

export default function PrintableStatsSheet({ game, opponent }: PrintableStatsSheetProps) {
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
    const title = `${gameDate} - Stats Collection Sheet vs ${opponentName}${roundInfo}`;
    
    doc.setFontSize(16);
    doc.text(title, 14, 20);
    
    // Quarters loop
    for (let quarter = 1; quarter <= 4; quarter++) {
      // Add quarter heading
      doc.setFontSize(14);
      doc.text(`Quarter ${quarter}`, 14, quarter === 1 ? 30 : (doc as any).lastAutoTable.finalY + 15);
      
      // Create header row with position columns
      const headers = ['Stat Category', ...POSITIONS];
      
      // Create rows for each stat category
      const rows = statsCategories.map(category => {
        return [category.label, '', '', '', '', '', '', ''];
      });
      
      // Import autotable plugin dynamically
      import('jspdf-autotable').then((autoTable) => {
        const autoTablePlugin = autoTable.default;
        autoTablePlugin(doc, {
          startY: quarter === 1 ? 35 : (doc as any).lastAutoTable.finalY + 20,
          head: [headers],
          body: rows,
          theme: 'grid',
          styles: { fontSize: 10, cellPadding: 5 },
          headStyles: { fillColor: [59, 130, 246], textColor: 255 },
          columnStyles: {
            0: { fontStyle: 'bold' }
          }
        });
        
        // Add new page after Q2
        if (quarter === 2) {
          doc.addPage();
        }
        
        // Save PDF after all tables are created
        if (quarter === 4) {
          doc.save(`${gameDate.replace(/\//g, '-')}_stats_sheet_${opponentName.replace(/\s+/g, '_')}${roundInfo ? '_Round' + game.round : ''}.pdf`);
        }
      });
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (!game) return;
    
    // Create a workbook with one sheet per quarter
    const wb = XLSX.utils.book_new();
    
    for (let quarter = 1; quarter <= 4; quarter++) {
      // Create headers
      const headers = ['Stat Category', ...POSITIONS];
      
      // Create data array starting with headers
      const data = [
        headers,
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
    }
  `;

  return (
    <div>
      <style>{printStyles}</style>
      
      <div className="flex justify-between items-center mb-6">
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
        <div className="mb-4">
          <h1 className="text-2xl font-bold">
            {formatDate(game?.date || '')} - Stats Collection Sheet
          </h1>
          <p className="text-lg mb-4">
            vs {opponent?.teamName || 'Unknown Opponent'}
            {game?.round && ` (Round ${game.round})`}
          </p>
        </div>
        
        {/* Quarter 1 and 2 */}
        <div className="mb-8">
          {[1, 2].map(quarter => (
            <div key={`quarter-${quarter}`} className={`mb-6 ${quarter === 2 ? 'page-break' : ''}`}>
              <h3 className="text-xl font-semibold mb-2">Quarter {quarter}</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border-2 border-gray-200">
                  <thead>
                    <tr className="bg-blue-500">
                      <th className="border p-2 text-white">Stat Category</th>
                      {POSITIONS.map(position => (
                        <th key={position} className="border p-2 text-white w-20">{position}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {statsCategories.map(category => (
                      <tr key={category.id} className="hover:bg-gray-50">
                        <td className="border p-2 font-medium">{category.label}</td>
                        {POSITIONS.map(position => (
                          <td key={`${position}-${category.id}`} className="border p-2 text-center h-10"></td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
        
        {/* Quarter 3 and 4 */}
        <div>
          {[3, 4].map(quarter => (
            <div key={`quarter-${quarter}`} className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Quarter {quarter}</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border-2 border-gray-200">
                  <thead>
                    <tr className="bg-blue-500">
                      <th className="border p-2 text-white">Stat Category</th>
                      {POSITIONS.map(position => (
                        <th key={position} className="border p-2 text-white w-20">{position}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {statsCategories.map(category => (
                      <tr key={category.id} className="hover:bg-gray-50">
                        <td className="border p-2 font-medium">{category.label}</td>
                        {POSITIONS.map(position => (
                          <td key={`${position}-${category.id}`} className="border p-2 text-center h-10"></td>
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