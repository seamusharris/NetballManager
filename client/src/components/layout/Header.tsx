import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Menu } from 'lucide-react';

interface HeaderProps {
  setIsMobileOpen: (open: boolean) => void;
  isTablet: boolean;
}

export default function Header({ setIsMobileOpen, isTablet }: HeaderProps) {
  const [location] = useLocation();
  
  const getPageTitle = () => {
    const path = location.split('/')[1] || 'dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ');
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm z-20">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-600 hover:bg-gray-100 focus:outline-none lg:hidden"
            onClick={() => setIsMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="hidden lg:block">
            <h2 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h2>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Show search only on larger screens to save space on tablet */}
          <div className={`relative ${isTablet ? 'hidden md:block' : ''}`}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              type="text" 
              placeholder="Search..." 
              className="pl-10 pr-4 w-full border rounded-md text-sm focus:border-accent focus:outline-none" 
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="text-gray-600 focus:outline-none relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-secondary"></span>
          </Button>
          
          <div className="flex items-center space-x-2">
            {/* Hide coach name on tablet to save space */}
            <span className={`text-sm font-semibold ${isTablet ? 'hidden md:inline' : ''}`}>Coach Smith</span>
            <Avatar className="w-8 h-8 bg-accent text-white">
              <span className="text-xs font-bold">CS</span>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}
