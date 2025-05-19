import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface ExportButtonsProps {
  onExportPDF: () => void;
  onExportExcel: () => void;
  className?: string;
  disabled?: boolean;
}

export default function ExportButtons({ onExportPDF, onExportExcel, className, disabled = false }: ExportButtonsProps) {
  return (
    <div className={`flex gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={onExportPDF}
        disabled={disabled}
        className="flex items-center gap-1 border-blue-400 text-blue-600 hover:bg-blue-50"
      >
        <Download size={16} />
        <span>PDF</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onExportExcel}
        disabled={disabled}
        className="flex items-center gap-1 border-green-400 text-green-600 hover:bg-green-50"
      >
        <Download size={16} />
        <span>Excel</span>
      </Button>
    </div>
  );
}