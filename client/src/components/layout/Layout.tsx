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
  
  // Detect iPad/tablet screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Overlay to close sidebar when clicking outside on tablet/mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-20 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header setIsMobileOpen={setIsMobileOpen} />
        
        <main className={cn(
          "flex-1 overflow-y-auto bg-background",
          // Adjust padding for different screen sizes
          "p-3 sm:p-4 md:p-5 lg:p-6",
          // Add more horizontal space on tablet by reducing padding
          isTablet ? "px-2" : ""
        )}>
          {children}
        </main>
      </div>
    </div>
  );
}
