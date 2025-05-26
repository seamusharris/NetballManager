
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, description, children, className = "" }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div className={`relative bg-white dark:bg-slate-900 p-6 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto ${className}`}>
        <button 
          className="absolute right-4 top-4 rounded-sm opacity-70 text-gray-600 hover:opacity-100" 
          onClick={onClose}
        >
          ✕
          <span className="sr-only">Close</span>
        </button>
        
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        {description && (
          <p className="text-sm text-gray-500 mb-4">
            {description}
          </p>
        )}
        
        {children}
      </div>
    </div>
  );
}
