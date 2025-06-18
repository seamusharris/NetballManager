import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Detect iPad/tablet screen size including large 12" iPads
  useEffect(() => {
    const checkScreenSize = () => {
      // Include both regular iPads and larger 12" iPad Pro (up to 1366px)
      // Also consider touch devices
      const width = window.innerWidth;
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsTablet((width >= 768 && width < 1367) || (isTouch && width >= 768 && width <= 1024));
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden w-full max-w-full">
      {/* Overlay to close sidebar when clicking outside on tablet/mobile */}
      {isMobileOpen && isTablet && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-20"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} isTablet={isTablet} />

      <div className="flex-1 flex flex-col overflow-hidden w-full max-w-full">
        <Header setIsMobileOpen={setIsMobileOpen} isTablet={isTablet} />

        <main className={cn(
          "flex-1 overflow-y-auto bg-gray-50",
          // Better responsive padding with consistent spacing
          "p-4 sm:p-6 lg:p-8",
          // Consistent padding on tablet
          isTablet ? "px-4" : ""
        )}>
          {children}
        </main>
      </div>
    </div>
  );
}