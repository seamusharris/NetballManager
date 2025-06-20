import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer, FileDown } from 'lucide-react';
import { preparePrintLayout, cleanupPrintLayout, UNIFIED_PRINT_CSS } from '@/lib/printUtils';

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
  showPDFButton = false,
  className = '',
  onBeforePrint,
  onAfterPrint
}: PrintWrapperProps) {

  const handlePrint = () => {
    onBeforePrint?.();

    // Use unified print system
    preparePrintLayout();

    // Set document title for print
    const originalTitle = document.title;
    document.title = title;

    // Trigger print
    window.print();

    // Cleanup after print
    document.title = originalTitle;
    cleanupPrintLayout();

    onAfterPrint?.();
  };

  return (
    <div className={className}>
      {/* Inject unified print CSS directly */}
      <style data-print-styles="wrapper">{UNIFIED_PRINT_CSS}</style>

      {/* Print/PDF Controls */}
      {(showPrintButton || showPDFButton) && (
        <div className="flex justify-end gap-2 mb-6 no-print print-hide">
          {showPrintButton && (
            <Button 
              variant="outline" 
              onClick={handlePrint}
              className="flex items-center gap-2"
              data-print-keep
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
              data-print-keep
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
        <div className="print-only" style={{ display: 'none' }}>
          <h1 className="print-title">{title}</h1>
          {subtitle && <div className="print-subtitle">{subtitle}</div>}
          <hr style={{ border: '1pt solid black', margin: '6pt 0' }} />
        </div>

        {/* Main content */}
        <div className="print-section">
          {children}
        </div>
      </div>
    </div>
  );
}