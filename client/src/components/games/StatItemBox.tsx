import React from 'react';

interface StatItemBoxProps {
  label: string;
  value: number;
}

export const StatItemBox: React.FC<StatItemBoxProps> = ({ label, value }) => {
  return (
    <div className="flex justify-between">
      <div className="flex justify-between w-full">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold">{value}</span>
      </div>
    </div>
  );
};