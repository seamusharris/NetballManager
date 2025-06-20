
import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer, FileDown } from 'lucide-react';

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
  showPDFButton = false, // Disable PDF for now
  className = '',
  onBeforePrint,
  onAfterPrint
}: PrintWrapperProps) {
  
  const handlePrint = () => {
    onBeforePrint?.();
    
    // Add print-mode class to body to trigger print styles
    document.body.classList.add('print-mode');
    
    // Set document title for print
    const originalTitle = document.title;
    document.title = title;
    
    // Trigger print
    window.print();
    
    // Cleanup after print
    document.title = originalTitle;
    document.body.classList.remove('print-mode');
    
    onAfterPrint?.();
  };

  return (
    <div className={className}>
      {/* Enhanced Print Styles */}
      <style>{`
        @media print {
          /* Page setup */
          @page {
            size: A4;
            margin: 15mm;
          }
          
          /* Hide non-essential elements - be more specific */
          header[role="banner"], 
          nav[role="navigation"], 
          .sidebar, 
          .navigation, 
          .no-print,
          .print-hide,
          button:not(.print-keep), 
          .btn:not(.print-keep),
          [data-radix-popper-content-wrapper],
          .tabs-list, 
          .tab-trigger,
          .breadcrumb,
          .page-actions {
            display: none !important;
          }
          
          /* Show print-only elements */
          .print-only, .print-show {
            display: block !important;
          }
          
          /* Force show main content areas */
          main, .print-content, [data-tabs-content] {
            display: block !important;
            visibility: visible !important;
          }
          
          /* Body and root styling */
          html, body {
            font-size: 10pt !important;
            line-height: 1.3 !important;
            color: black !important;
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: none !important;
          }
          
          /* Main content container */
          .print-content, main, .tab-content, [data-tabs-content] {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            display: block !important;
            visibility: visible !important;
          }
          
          /* Typography hierarchy */
          .print-title, h1 {
            font-size: 16pt !important;
            font-weight: bold !important;
            margin: 0 0 8pt 0 !important;
            color: black !important;
            border-bottom: 2pt solid black !important;
            padding-bottom: 4pt !important;
          }
          
          .print-subtitle, h2 {
            font-size: 12pt !important;
            font-weight: normal !important;
            margin: 0 0 12pt 0 !important;
            color: black !important;
          }
          
          h3 { font-size: 11pt !important; margin: 8pt 0 4pt 0 !important; }
          h4, h5, h6 { font-size: 10pt !important; margin: 6pt 0 3pt 0 !important; }
          
          p, div, span, td, th {
            font-size: 9pt !important;
            line-height: 1.2 !important;
            color: black !important;
            background: transparent !important;
          }
          
          /* Cards and containers */
          .card, [data-card], .bg-card {
            background: white !important;
            border: 1pt solid #333 !important;
            margin-bottom: 6pt !important;
            padding: 6pt !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          
          /* Tables */
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin-bottom: 8pt !important;
            font-size: 8pt !important;
          }
          
          th, td {
            border: 1pt solid #333 !important;
            padding: 3pt !important;
            text-align: left !important;
            font-size: 8pt !important;
            background: white !important;
            color: black !important;
          }
          
          th {
            font-weight: bold !important;
            background-color: #f5f5f5 !important;
          }
          
          /* Grid and flex layouts */
          .grid, .flex {
            display: block !important;
          }
          
          .grid > *, .flex > * {
            display: block !important;
            width: 100% !important;
            margin-bottom: 4pt !important;
            float: none !important;
          }
          
          /* Badges and status indicators */
          .badge, [data-badge] {
            border: 1pt solid #333 !important;
            padding: 1pt 3pt !important;
            background: white !important;
            color: black !important;
            display: inline-block !important;
            font-size: 7pt !important;
            border-radius: 0 !important;
          }
          
          /* Progress bars - show as text */
          .progress, [data-progress] {
            border: 1pt solid #333 !important;
            height: auto !important;
            background: white !important;
            padding: 2pt !important;
          }
          
          .progress > *, [data-progress] > * {
            display: none !important;
          }
          
          .progress::after, [data-progress]::after {
            content: "Progress: " attr(data-value) "%" !important;
            font-size: 8pt !important;
            color: black !important;
          }
          
          /* Remove all colors and backgrounds */
          * {
            color: black !important;
            background: transparent !important;
            text-shadow: none !important;
            box-shadow: none !important;
          }
          
          /* Spacing adjustments */
          .space-y-6 > * + *, .space-y-4 > * + *, .space-y-2 > * + * {
            margin-top: 4pt !important;
          }
          
          .mb-8, .mb-6, .mb-4 { margin-bottom: 4pt !important; }
          .mb-2 { margin-bottom: 2pt !important; }
          .mt-8, .mt-6, .mt-4 { margin-top: 4pt !important; }
          .mt-2 { margin-top: 2pt !important; }
          
          /* Page breaks */
          .page-break-before { page-break-before: always !important; }
          .page-break-after { page-break-after: always !important; }
          .break-inside-avoid { break-inside: avoid !important; page-break-inside: avoid !important; }
          
          /* Tabs - show all content and hide tab navigation */
          .tabs-content, [data-tabs-content] {
            display: block !important;
            visibility: visible !important;
          }
          
          /* Hide tab navigation completely */
          [role="tablist"], .tabs-list {
            display: none !important;
          }
          
          /* Hide interactive elements */
          input, select, textarea, button:not(.print-keep) {
            display: none !important;
          }
          
          /* Links */
          a {
            color: black !important;
            text-decoration: underline !important;
          }
          
          /* Images */
          img {
            max-width: 100% !important;
            height: auto !important;
          }
          
          /* Ensure specific containers are visible */
          .print-section, .content-section {
            display: block !important;
            margin-bottom: 8pt !important;
          }
        }
      `}</style>
      
      {/* Print/PDF Controls */}
      {(showPrintButton || showPDFButton) && (
        <div className="flex justify-end gap-2 mb-6 no-print print-hide">
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
              onClick={() => console.log('PDF generation not implemented')}
              className="flex items-center gap-2"
              disabled
            >
              <FileDown className="h-4 w-4" />
              Save PDF
            </Button>
          )}
        </div>
      )}
      
      {/* Print Content */}
      <div className="print-content">
        {/* Print header - only visible when printing */}
        <div className="print-only print-show" style={{ display: 'none' }}>
          <h1 className="print-title">{title}</h1>
          {subtitle && <div className="print-subtitle">{subtitle}</div>}
          <hr style={{ border: '1pt solid black', margin: '8pt 0' }} />
        </div>
        
        {/* Main content */}
        {children}
      </div>
    </div>
  );
}
