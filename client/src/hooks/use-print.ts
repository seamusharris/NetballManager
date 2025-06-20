
import { useCallback, useEffect, useState } from 'react';
import { preparePrintLayout, cleanupPrintLayout } from '@/lib/printUtils';

export function usePrint() {
  const [isPrinting, setIsPrinting] = useState(false);
  
  const handleBeforePrint = useCallback(() => {
    setIsPrinting(true);
    preparePrintLayout();
  }, []);
  
  const handleAfterPrint = useCallback(() => {
    setIsPrinting(false);
    cleanupPrintLayout();
  }, []);
  
  const printPage = useCallback((title?: string) => {
    if (title) {
      const originalTitle = document.title;
      document.title = title;
      handleBeforePrint();
      window.print();
      document.title = originalTitle;
      // Note: handleAfterPrint will be called by the print event listeners
    } else {
      handleBeforePrint();
      window.print();
    }
  }, [handleBeforePrint]);
  
  // Listen for browser print events
  useEffect(() => {
    const beforePrint = () => handleBeforePrint();
    const afterPrint = () => handleAfterPrint();
    
    window.addEventListener('beforeprint', beforePrint);
    window.addEventListener('afterprint', afterPrint);
    
    return () => {
      window.removeEventListener('beforeprint', beforePrint);
      window.removeEventListener('afterprint', afterPrint);
    };
  }, [handleBeforePrint, handleAfterPrint]);
  
  return {
    isPrinting,
    printPage,
    handleBeforePrint,
    handleAfterPrint,
  };
}
