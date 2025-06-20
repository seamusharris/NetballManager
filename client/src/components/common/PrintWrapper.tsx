
import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer, FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface PrintWrapperProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showPrintButton?: boolean;
  showPDFButton?: boolean;
  className?: string;
  onBeforePrint?: () => void;
  onAfterPrint?: () => void;
}

export default function PrintWrapper({ 
  children, 
  title, 
  subtitle,
  showPrintButton = true,
  showPDFButton = true,
  className = '',
  onBeforePrint,
  onAfterPrint
}: PrintWrapperProps) {
  
  const handlePrint = () => {
    onBeforePrint?.();
    window.print();
    onAfterPrint?.();
  };

  const handlePDF = () => {
    onBeforePrint?.();
    
    // Create PDF from the print content
    const printContent = document.querySelector('.print-content');
    if (printContent) {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Add title
      doc.setFontSize(18);
      doc.text(title, 20, 20);

      if (subtitle) {
        doc.setFontSize(12);
        doc.text(subtitle, 20, 30);
      }

      // For now, we'll capture the content as text
      // In a more advanced implementation, you could use html2canvas
      const textContent = printContent.textContent || '';
      const lines = doc.splitTextToSize(textContent, 170);
      doc.setFontSize(10);
      doc.text(lines, 20, subtitle ? 40 : 30);

      doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
    }
    
    onAfterPrint?.();
  };

  return (
    <div className={className}>
      {/* Print Styles */}
      <style>{`
        @media print {
          /* Hide everything not intended for print */
          .no-print, .no-print * {
            display: none !important;
          }
          
          /* Reset page margins and styling */
          @page {
            size: A4;
            margin: 15mm;
          }
          
          body {
            font-size: 11pt;
            line-height: 1.4;
            color: black;
            background: white;
          }
          
          /* Print content styling */
          .print-content {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
          }
          
          /* Typography for print */
          .print-title {
            font-size: 16pt;
            font-weight: bold;
            margin-bottom: 8pt;
            color: black !important;
          }
          
          .print-subtitle {
            font-size: 12pt;
            margin-bottom: 12pt;
            color: black !important;
          }
          
          /* Tables */
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12pt;
          }
          
          th, td {
            border: 1px solid #333;
            padding: 4pt 6pt;
            text-align: left;
            font-size: 10pt;
          }
          
          th {
            background-color: #f0f0f0 !important;
            font-weight: bold;
          }
          
          /* Cards and sections */
          .print-section {
            margin-bottom: 12pt;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          
          .print-card {
            border: 1px solid #333;
            padding: 8pt;
            margin-bottom: 8pt;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          
          /* Grid layouts */
          .print-grid {
            display: block !important;
          }
          
          .print-grid > * {
            display: block !important;
            width: 100% !important;
            margin-bottom: 8pt;
          }
          
          /* Text sizing */
          .text-lg { font-size: 12pt !important; }
          .text-base { font-size: 11pt !important; }
          .text-sm { font-size: 10pt !important; }
          .text-xs { font-size: 9pt !important; }
          
          /* Colors for print */
          * {
            color: black !important;
            background: white !important;
          }
          
          /* Badges and status indicators */
          .badge, .status-badge {
            border: 1px solid #333 !important;
            padding: 2pt 4pt !important;
            background: white !important;
            color: black !important;
          }
          
          /* Spacing adjustments */
          .space-y-6 > * + * { margin-top: 6pt !important; }
          .space-y-4 > * + * { margin-top: 4pt !important; }
          .space-y-2 > * + * { margin-top: 2pt !important; }
          
          .mb-6 { margin-bottom: 6pt !important; }
          .mb-4 { margin-bottom: 4pt !important; }
          .mb-2 { margin-bottom: 2pt !important; }
          
          /* Flexbox to block for print */
          .flex {
            display: block !important;
          }
          
          .grid {
            display: block !important;
          }
        }
      `}</style>
      
      {/* Print/PDF Controls */}
      {(showPrintButton || showPDFButton) && (
        <div className="flex justify-end gap-2 mb-6 no-print">
          {showPrintButton && (
            <Button 
              variant="outline" 
              onClick={handlePrint}
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
          )}
          {showPDFButton && (
            <Button 
              variant="outline" 
              onClick={handlePDF}
              className="flex items-center gap-2"
            >
              <FileDown className="h-4 w-4" />
              Save PDF
            </Button>
          )}
        </div>
      )}
      
      {/* Print Content */}
      <div className="print-content">
        <div className="print-title">{title}</div>
        {subtitle && <div className="print-subtitle">{subtitle}</div>}
        {children}
      </div>
    </div>
  );
}
