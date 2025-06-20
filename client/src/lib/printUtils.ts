
// Print utility classes and functions for consistent printing across the application
export const printClasses = {
  // Content visibility
  printOnly: 'print-only',
  printShow: 'print-show', 
  printHide: 'print-hide',
  noPrint: 'no-print',
  printContent: 'print-content',
  section: 'print-section',
  
  // Layout
  grid: 'print-grid',
  pageBreak: 'print-page-break',
  
  // Typography
  title: 'print-title',
  subtitle: 'print-subtitle',
  heading: 'print-heading',
  
  // Spacing
  spacing: 'print-spacing',
  compact: 'print-compact'
};

// Format utilities for print content
export const formatForPrint = {
  gameTitle: (date: string, opponent: string, round: string) => 
    `Game Preparation: ${opponent} - Round ${round} (${new Date(date).toLocaleDateString()})`,
  
  time: (time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return time;
    }
  },
  
  date: (dateStr: string) => new Date(dateStr).toLocaleDateString('en-AU', {
    weekday: 'long',
    year: 'numeric', 
    month: 'long',
    day: 'numeric'
  })
};

// Enhanced print CSS with selective tab support
export const UNIFIED_PRINT_CSS = `
  @media print {
    @page {
      size: A4;
      margin: 15mm;
      color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    
    /* CRITICAL: Hide ALL navigation elements including sidebar */
    nav,
    [role="navigation"],
    [role="banner"], 
    header[role="banner"],
    .sidebar,
    .breadcrumb,
    .page-actions,
    .no-print,
    .print-hide,
    
    /* Specific sidebar targeting - multiple approaches */
    aside,
    [data-sidebar],
    .sidebar-content,
    .sidebar-menu,
    .sidebar-nav,
    div[class*="sidebar"],
    
    /* Layout containers that might contain sidebar */
    .layout-sidebar,
    .app-sidebar,
    .main-sidebar,
    
    /* Navigation sections */
    section:has([role="navigation"]),
    div:has(nav),
    
    /* Breadcrumb and navigation lists */
    .breadcrumb,
    .breadcrumb-nav,
    ol[class*="breadcrumb"],
    
    /* Shadcn/Radix UI specific navigation */
    [data-radix-popper-content-wrapper],
    [data-radix-select-content],
    [data-radix-dropdown-menu-content],
    [data-radix-popover-content],
    
    /* Tab navigation - CRITICAL */
    [role="tablist"],
    .tabs-list,
    [data-tabs-list],
    [data-radix-tabs-list],
    div[role="tablist"],
    
    /* All buttons except explicitly kept ones */
    button:not(.print-keep):not([data-print-keep]),
    .btn:not(.print-keep):not([data-print-keep]),
    
    /* Page chrome and headers */
    .page-header .flex.justify-end,
    .page-template > div:first-child > div:last-child,
    
    /* Common layout elements to hide */
    .header-actions,
    .page-actions,
    .toolbar,
    .action-bar
    {
      display: none !important;
      visibility: hidden !important;
      height: 0 !important;
      width: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: hidden !important;
      position: absolute !important;
      left: -9999px !important;
    }
    
    /* FORCE SHOW: Print content */
    .print-content,
    .print-show,
    .print-section,
    [data-print="show"],
    main {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    }
    
    /* TAB CONTENT MANAGEMENT */
    /* Hide inactive tab content by default */
    [data-radix-tabs-content]:not([data-state="active"]) {
      display: none !important;
    }
    
    /* Force show active tab content */
    [data-radix-tabs-content][data-state="active"],
    [data-radix-tabs-content][data-print-tab="active"] {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    }
    
    /* Override any hiding on print-marked content */
    [data-print-tab="active"] * {
      visibility: visible !important;
      opacity: 1 !important;
    }
    
    /* Reset document structure for proper printing */
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
      height: auto !important;
    }
    
    /* Force single column layout */
    body * {
      position: static !important;
      float: none !important;
    }
    
    /* Content structure - ensure full width */
    .print-content,
    main,
    [data-radix-tabs-content],
    .page-container,
    .layout,
    .main-content {
      display: block !important;
      width: 100% !important;
      max-width: none !important;
      margin: 0 !important;
      padding: 0 !important;
      box-shadow: none !important;
      border: none !important;
      background: white !important;
      position: static !important;
      left: auto !important;
      right: auto !important;
      top: auto !important;
    }
    
    /* Ensure content flows naturally across pages */
    .print-content > *,
    main > *,
    [data-radix-tabs-content] > * {
      margin-left: 0 !important;
      margin-right: 0 !important;
      width: 100% !important;
      max-width: none !important;
    }
    
    /* Typography hierarchy */
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
    
    /* Cards and containers */
    .card, 
    [data-card], 
    .bg-card,
    .print-card,
    .content-box,
    .widget-container {
      background: white !important;
      border: 1pt solid #333 !important;
      margin-bottom: 4pt !important;
      padding: 6pt !important;
      border-radius: 0 !important;
      box-shadow: none !important;
    }
    
    /* Tables */
    table {
      width: 100% !important;
      border-collapse: collapse !important;
      margin-bottom: 8pt !important;
    }
    
    th, td {
      border: 1pt solid #333 !important;
      padding: 3pt !important;
      font-size: 8pt !important;
      text-align: left !important;
    }
    
    th {
      background: #f0f0f0 !important;
      font-weight: bold !important;
    }
    
    /* Badges and status indicators */
    .badge, 
    [class*="badge-"] {
      border: 1pt solid #333 !important;
      padding: 1pt 3pt !important;
      font-size: 7pt !important;
      font-weight: bold !important;
    }
    
    /* Progress bars */
    .progress,
    [role="progressbar"] {
      border: 1pt solid #333 !important;
      height: 8pt !important;
      background: white !important;
    }
    
    /* Grid layouts - convert to linear flow */
    .grid {
      display: block !important;
      columns: 1 !important;
      column-gap: 0 !important;
    }
    
    .grid > * {
      display: block !important;
      margin-bottom: 8pt !important;
      page-break-inside: avoid !important;
      width: 100% !important;
      break-inside: avoid !important;
    }
    
    /* Print-only content */
    .print-only {
      display: block !important;
    }
    
    /* Page breaks */
    .print-page-break {
      page-break-before: always !important;
    }
    
    /* Better page break handling */
    .card, 
    .widget-container, 
    .content-box,
    .game-preparation-section,
    .analysis-widget,
    .stats-section {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      margin-bottom: 12pt !important;
    }
    
    /* Force page breaks after major sections */
    .section-separator {
      page-break-after: always !important;
    }
    
    /* Allow breaks in large content areas */
    .large-content,
    .stats-table,
    .analysis-content {
      page-break-inside: auto !important;
    }
  }
`;

// Print preparation functions
export function preparePrintLayout() {
  // Add print mode class to body
  document.body.classList.add('print-mode');
  
  // Mark the currently active tab for printing
  const activeTab = document.querySelector('[data-radix-tabs-content][data-state="active"]');
  if (activeTab) {
    activeTab.setAttribute('data-print-tab', 'active');
  }
  
  // Ensure all content in active tab is visible
  if (activeTab) {
    const allElements = activeTab.querySelectorAll('*');
    allElements.forEach(el => {
      (el as HTMLElement).style.setProperty('visibility', 'visible', 'important');
      (el as HTMLElement).style.setProperty('opacity', '1', 'important');
    });
  }
}

export function cleanupPrintLayout() {
  // Remove print mode class
  document.body.classList.remove('print-mode');
  
  // Clean up print tab markers
  const printTabs = document.querySelectorAll('[data-print-tab]');
  printTabs.forEach(tab => {
    tab.removeAttribute('data-print-tab');
  });
  
  // Remove forced styles
  const allElements = document.querySelectorAll('[style*="visibility"][style*="important"]');
  allElements.forEach(el => {
    (el as HTMLElement).style.removeProperty('visibility');
    (el as HTMLElement).style.removeProperty('opacity');
  });
}

// Print-specific component wrapper
export function withPrintSupport<T extends Record<string, any>>(
  Component: React.ComponentType<T>
): React.ComponentType<T> {
  return function PrintSupportedComponent(props: T) {
    React.useEffect(() => {
      const handleBeforePrint = () => preparePrintLayout();
      const handleAfterPrint = () => cleanupPrintLayout();
      
      window.addEventListener('beforeprint', handleBeforePrint);
      window.addEventListener('afterprint', handleAfterPrint);
      
      return () => {
        window.removeEventListener('beforeprint', handleBeforePrint);
        window.removeEventListener('afterprint', handleAfterPrint);
      };
    }, []);
    
    return React.createElement(Component, props);
  };
}
