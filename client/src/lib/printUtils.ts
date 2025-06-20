
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
  printOnly: 'hidden print:block',
  printShow: 'print:block print:visible',
  
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

// Unified print CSS that targets actual DOM structure
export const UNIFIED_PRINT_CSS = `
  @media print {
    /* Page setup */
    @page {
      size: A4;
      margin: 15mm;
    }
    
    /* STEP 1: Hide navigation and UI elements */
    /* Target actual navigation structure */
    nav, 
    .sidebar,
    header[role="banner"],
    [role="navigation"],
    .no-print,
    .print-hide,
    /* Shadcn UI specific selectors */
    [data-radix-popper-content-wrapper],
    [data-radix-select-content],
    [data-radix-dropdown-menu-content],
    /* Tab navigation */
    [role="tablist"],
    .tabs-list,
    [data-tabs-list],
    /* Buttons except print buttons */
    button:not(.print-keep):not([data-print-keep]),
    .btn:not(.print-keep):not([data-print-keep]),
    /* Breadcrumbs and page actions */
    .breadcrumb,
    .page-actions,
    .no-print * {
      display: none !important;
      visibility: hidden !important;
    }
    
    /* STEP 2: Force show content areas */
    /* Target actual content structure */
    main,
    .print-content,
    .print-show,
    .print-section,
    [data-tabs-content],
    .tab-content,
    .tabs-content {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    }
    
    /* STEP 3: Reset document structure */
    html, body {
      font-size: 10pt !important;
      line-height: 1.3 !important;
      color: black !important;
      background: white !important;
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      max-width: none !important;
      overflow: visible !important;
    }
    
    /* STEP 4: Content container styling */
    .print-content,
    main,
    [data-tabs-content] {
      width: 100% !important;
      max-width: none !important;
      margin: 0 !important;
      padding: 0 !important;
      box-shadow: none !important;
      border: none !important;
      background: white !important;
    }
    
    /* STEP 5: Typography hierarchy */
    .print-title, h1 {
      font-size: 16pt !important;
      font-weight: bold !important;
      margin: 0 0 8pt 0 !important;
      color: black !important;
      border-bottom: 1pt solid black !important;
      padding-bottom: 4pt !important;
    }
    
    .print-subtitle, h2 {
      font-size: 12pt !important;
      font-weight: normal !important;
      margin: 0 0 8pt 0 !important;
      color: black !important;
    }
    
    h3 { font-size: 11pt !important; margin: 6pt 0 3pt 0 !important; }
    h4, h5, h6 { font-size: 10pt !important; margin: 4pt 0 2pt 0 !important; }
    
    p, div, span, td, th, li {
      font-size: 9pt !important;
      line-height: 1.2 !important;
      color: black !important;
      background: transparent !important;
    }
    
    /* STEP 6: Cards and containers */
    .card, 
    [data-card], 
    .bg-card,
    .print-card,
    .content-box,
    .widget-container {
      background: white !important;
      border: 1pt solid #333 !important;
      margin-bottom: 4pt !important;
      padding: 4pt !important;
      box-shadow: none !important;
      border-radius: 0 !important;
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }
    
    /* STEP 7: Tables */
    table {
      width: 100% !important;
      border-collapse: collapse !important;
      margin-bottom: 6pt !important;
      font-size: 8pt !important;
    }
    
    th, td {
      border: 1pt solid #333 !important;
      padding: 2pt !important;
      text-align: left !important;
      font-size: 8pt !important;
      background: white !important;
      color: black !important;
    }
    
    th {
      font-weight: bold !important;
      background-color: #f5f5f5 !important;
    }
    
    /* STEP 8: Layout adjustments */
    .grid, .flex {
      display: block !important;
    }
    
    .grid > *, .flex > * {
      display: block !important;
      width: 100% !important;
      margin-bottom: 3pt !important;
      float: none !important;
    }
    
    /* STEP 9: Remove all colors and effects */
    * {
      color: black !important;
      background: transparent !important;
      text-shadow: none !important;
      box-shadow: none !important;
    }
    
    /* STEP 10: Spacing normalization */
    .space-y-6 > * + *, 
    .space-y-4 > * + *, 
    .space-y-2 > * + * {
      margin-top: 3pt !important;
    }
    
    .mb-8, .mb-6, .mb-4 { margin-bottom: 3pt !important; }
    .mb-2 { margin-bottom: 2pt !important; }
    .mt-8, .mt-6, .mt-4 { margin-top: 3pt !important; }
    .mt-2 { margin-top: 2pt !important; }
    
    /* STEP 11: Page breaks */
    .page-break-before { page-break-before: always !important; }
    .page-break-after { page-break-after: always !important; }
    .break-inside-avoid { break-inside: avoid !important; page-break-inside: avoid !important; }
    
    /* STEP 12: Badges and indicators */
    .badge, [data-badge] {
      border: 1pt solid #333 !important;
      padding: 1pt 2pt !important;
      background: white !important;
      color: black !important;
      display: inline-block !important;
      font-size: 7pt !important;
      border-radius: 0 !important;
    }
    
    /* STEP 13: Interactive elements */
    input, select, textarea, 
    button:not(.print-keep):not([data-print-keep]) {
      display: none !important;
    }
    
    /* STEP 14: Links */
    a {
      color: black !important;
      text-decoration: underline !important;
    }
    
    /* STEP 15: Images */
    img {
      max-width: 100% !important;
      height: auto !important;
    }
    
    /* STEP 16: Print-only elements */
    .print-only {
      display: block !important;
      visibility: visible !important;
    }
  }
`;

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

// Helper to prepare page for print (add unified CSS)
export const preparePrintLayout = () => {
  // Remove any existing print stylesheets
  const existingPrintStyles = document.querySelectorAll('style[data-print-styles]');
  existingPrintStyles.forEach(style => style.remove());
  
  // Add unified print CSS
  const styleElement = document.createElement('style');
  styleElement.setAttribute('data-print-styles', 'unified');
  styleElement.textContent = UNIFIED_PRINT_CSS;
  document.head.appendChild(styleElement);
  
  // Add print-mode class to body
  document.body.classList.add('print-mode');
};

// Clean up after print
export const cleanupPrintLayout = () => {
  document.body.classList.remove('print-mode');
  
  // Remove unified print styles
  const printStyles = document.querySelectorAll('style[data-print-styles="unified"]');
  printStyles.forEach(style => style.remove());
};
