
export const printClasses = {
  // Layout classes that work well in print
  section: 'print-section mb-6 break-inside-avoid',
  card: 'print-card bg-white border rounded-lg p-4 break-inside-avoid',
  grid: 'print-grid grid gap-4',
  
  // Typography classes optimized for print
  title: 'print-title text-xl font-bold mb-4',
  subtitle: 'print-subtitle text-lg font-semibold mb-3',
  heading: 'text-base font-semibold mb-2',
  text: 'text-sm',
  caption: 'text-xs text-gray-600',
  
  // Table classes for print
  table: 'w-full border-collapse break-inside-avoid',
  tableHeader: 'bg-gray-50 font-semibold',
  tableCell: 'border border-gray-200 px-3 py-2 text-sm',
  
  // Utility classes
  noBreak: 'break-inside-avoid page-break-inside-avoid',
  noPrint: 'no-print print-hide',
  printOnly: 'hidden print-show',
  
  // Status and badge classes for print
  badge: 'badge inline-block px-2 py-1 text-xs rounded border',
  statusBadge: 'status-badge inline-block px-2 py-1 text-xs rounded border',
};

export const formatForPrint = {
  // Format dates for print
  date: (date: string | Date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-AU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },
  
  // Format time for print
  time: (time: string) => {
    if (!time) return 'TBD';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  },
  
  // Format game title for print
  gameTitle: (date: string, opponent: string, round?: string) => {
    const formattedDate = formatForPrint.date(date);
    const roundText = round ? ` - Round ${round}` : '';
    return `${formattedDate} vs ${opponent}${roundText}`;
  },
};

// Helper function to trigger print with custom title
export const printPage = (title?: string) => {
  if (title) {
    const originalTitle = document.title;
    document.title = title;
    window.print();
    document.title = originalTitle;
  } else {
    window.print();
  }
};

// Helper to prepare page for print (hide navigation, etc.)
export const preparePrintLayout = () => {
  // Add print-mode class to body
  document.body.classList.add('print-mode');
  
  // Hide navigation elements
  const nav = document.querySelector('nav');
  const sidebar = document.querySelector('.sidebar');
  const header = document.querySelector('header');
  
  [nav, sidebar, header].forEach(element => {
    if (element) {
      element.classList.add('no-print');
    }
  });
};

// Clean up after print
export const cleanupPrintLayout = () => {
  document.body.classList.remove('print-mode');
  
  // Remove no-print classes that we added
  const elements = document.querySelectorAll('.no-print');
  elements.forEach(element => {
    // Only remove if we added it (check if it's nav/sidebar/header)
    if (element.tagName === 'NAV' || 
        element.classList.contains('sidebar') || 
        element.tagName === 'HEADER') {
      element.classList.remove('no-print');
    }
  });
};
