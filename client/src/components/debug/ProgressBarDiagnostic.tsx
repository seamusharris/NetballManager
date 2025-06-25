
import React from 'react';

interface ProgressBarDiagnosticProps {
  children: React.ReactNode;
  label: string;
  className?: string;
}

export const ProgressBarDiagnostic: React.FC<ProgressBarDiagnosticProps> = ({ 
  children, 
  label, 
  className = "" 
}) => {
  return (
    <div className={`relative ${className}`}>
      {/* Debug label */}
      <div className="absolute -top-6 left-0 z-10 text-xs bg-purple-500 text-white px-2 py-1 rounded font-mono">
        {label}
      </div>
      
      {/* Debug border and background */}
      <div className="border-2 border-dashed border-red-500 bg-red-50 bg-opacity-30 relative">
        {children}
        
        {/* Corner markers */}
        <div className="absolute top-0 left-0 w-2 h-2 bg-red-500"></div>
        <div className="absolute top-0 right-0 w-2 h-2 bg-red-500"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 bg-red-500"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 bg-red-500"></div>
      </div>
    </div>
  );
};

  children, 
  label 
}) => {
  return (
    <div className="relative">
      <div className="absolute -top-4 left-0 z-20 text-xs bg-blue-600 text-white px-1 py-0.5 rounded font-mono">
        {label}
      </div>
      <div className="border border-blue-400 bg-blue-100 bg-opacity-20">
        {children}
      </div>
    </div>
  );
};
