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
    console.log('Print initiated - preparing layout...');
    
    onBeforePrint?.();

    // Use unified print system with tab detection
    preparePrintLayout();

    // Set document title for print
    const originalTitle = document.title;
    document.title = title;

    console.log('Triggering browser print dialog...');
    
    // Small delay to ensure layout preparation is complete
    setTimeout(() => {
      window.print();
      
      // Cleanup after print dialog
      setTimeout(() => {
        document.title = originalTitle;
        cleanupPrintLayout();
        onAfterPrint?.();
        console.log('Print cleanup completed');
      }, 100);
    }, 50);
  };

  return (
    <div className={className}>
      {/* Inject unified print CSS directly */}
      <style data-print-styles="wrapper">{UNIFIED_PRINT_CSS}</style>
      
      {/* Additional specific CSS to hide navigation elements we can see in the screenshot */}
      <style data-print-styles="navigation-hide">{`
        @media print {
          /* Hide the specific sidebar structure visible in screenshot */
          .layout > div:first-child,
          div[class*="sidebar"],
          div[class*="navigation"],
          div:has(> div > a[href*="Club Dashboard"]),
          div:has(> div > a[href*="Team Dashboard"]),
          div:has(> div > a[href*="Games"]),
          
          /* Hide navigation sections by content */
          div:has(> h2:contains("NAVIGATION")),
          div:has(> div:contains("Club Dashboard")),
          div:has(> div:contains("Team Dashboard")),
          
          /* Hide any flex container that might be the sidebar */
          .flex > div:first-child:has(nav),
          .flex > aside,
          
          /* Target by typical sidebar positioning */
          div[style*="width: 250px"],
          div[style*="width: 240px"],
          div[style*="width: 200px"],
          
          /* Hide breadcrumb navigation */
          nav[aria-label="breadcrumb"],
          ol[class*="breadcrumb"],
          .breadcrumb-nav
          {
            display: none !important;
            visibility: hidden !important;
            width: 0 !important;
            height: 0 !important;
            overflow: hidden !important;
            position: absolute !important;
            left: -9999px !important;
          }
          
          /* Ensure main content takes full width */
          main,
          .main-content,
          .page-content {
            margin-left: 0 !important;
            width: 100% !important;
            max-width: none !important;
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
              data-print-keep
            >
              <Printer className="h-4 w-4" />
              Print Current Tab
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