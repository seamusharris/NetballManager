import React from 'react';

interface StatItemBoxProps {
  label: string;
  value: number | string | null | undefined;
}

export const StatItemBox: React.FC<StatItemBoxProps> = ({ label, value }) => {
  // Safely convert value to display format, handling all possible undefined cases
  let displayValue = '-';
  
  if (value !== undefined && value !== null) {
    displayValue = String(value);
  }
  
  return (
    <div className="flex justify-between w-full">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold">{displayValue}</span>
    </div>
  );
}