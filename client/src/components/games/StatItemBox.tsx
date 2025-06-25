import React from 'react';

interface StatItemBoxProps {
  label: string;
  value: number;
  compact?: boolean;
}

export const StatItemBox: React.FC<StatItemBoxProps> = ({ label, value, compact = false }) => {
  if (compact) {
    return (
      <div className="flex justify-between items-center py-0.5">
        <span className="text-gray-600 text-xs truncate mr-1">{label}</span>
        <span className="font-semibold text-xs bg-white px-1.5 py-0.5 rounded-md border border-gray-100 min-w-[24px] text-center">
          {value}
        </span>
      </div>
    );
  }

  return (
    <div className="flex justify-between">
      <div className="flex justify-between w-full">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold">{value}</span>
      </div>
    </div>
  );
};