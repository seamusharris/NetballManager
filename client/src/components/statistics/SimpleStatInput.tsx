import React, { useState } from 'react';

interface SimpleStatInputProps {
  initialValue: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export default function SimpleStatInput({ 
  initialValue, 
  onChange,
  disabled = false
}: SimpleStatInputProps) {
  const [value, setValue] = useState(initialValue.toString());
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Only allow numbers
    if (newValue !== '' && !/^\d+$/.test(newValue)) {
      return;
    }
    
    setValue(newValue);
    onChange(newValue === '' ? 0 : parseInt(newValue, 10));
  };
  
  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      disabled={disabled}
      className="stats-input w-full p-2 border border-gray-300 rounded-md text-center"
    />
  );
}