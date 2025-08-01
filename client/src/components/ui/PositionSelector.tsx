import React, { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Position, allPositions } from '@shared/schema';

interface PositionSelectorProps {
  value: Position[];
  onChange: (positions: Position[]) => void;
  maxPositions?: number;
  className?: string;
}

/**
 * PositionSelector Component
 * 
 * Renders the same 4-dropdown interface as the original PlayerForm
 * but handles all the complex logic internally:
 * - Duplicate filtering
 * - Available position management
 * - Array conversion
 * - Validation
 */
export function PositionSelector({ 
  value = [], 
  onChange, 
  maxPositions = 4,
  className 
}: PositionSelectorProps) {
  // Convert position array to individual position values for dropdowns
  const position1 = value[0] || '';
  const position2 = value[1] || 'none';
  const position3 = value[2] || 'none';
  const position4 = value[3] || 'none';

  // Manage available positions for each dropdown (same logic as original)
  const [availablePositions, setAvailablePositions] = useState({
    position1: [...allPositions],
    position2: [...allPositions],
    position3: [...allPositions],
    position4: [...allPositions],
  });

  // Update available positions when selections change (same logic as original)
  useEffect(() => {
    const selectedPositions = [position1, position2, position3, position4].filter(
      pos => pos && pos !== 'none'
    );

    const newAvailablePositions = {
      position1: [...allPositions],
      position2: [...allPositions],
      position3: [...allPositions],
      position4: [...allPositions],
    };

    // For each dropdown, filter out positions selected in other dropdowns
    for (let i = 1; i <= 4; i++) {
      const fieldName = `position${i}` as keyof typeof availablePositions;
      const currentValue = i === 1 ? position1 : i === 2 ? position2 : i === 3 ? position3 : position4;
      
      newAvailablePositions[fieldName] = allPositions.filter(position => {
        // Keep the current selection available
        if (position === currentValue) return true;
        // Filter out positions selected in other dropdowns
        return !selectedPositions.includes(position) || position === currentValue;
      });
    }

    setAvailablePositions(newAvailablePositions);
  }, [position1, position2, position3, position4]);

  // Handle position changes and update the array
  const handlePositionChange = (positionIndex: number, newValue: string) => {
    const newPositions = [...value];
    
    if (newValue === 'none' || newValue === '') {
      // Remove this position and all positions after it
      newPositions.splice(positionIndex, newPositions.length - positionIndex);
    } else {
      // Set the position at the specific index
      newPositions[positionIndex] = newValue as Position;
      // Remove any positions after this one if they're the same
      for (let i = positionIndex + 1; i < newPositions.length; i++) {
        if (newPositions[i] === newValue) {
          newPositions.splice(i, newPositions.length - i);
          break;
        }
      }
    }

    // Clean up the array - remove empty slots at the end
    while (newPositions.length > 0 && !newPositions[newPositions.length - 1]) {
      newPositions.pop();
    }

    onChange(newPositions);
  };

  return (
    <div className={className}>
      <h3 className="text-sm font-medium mb-2">Position Preferences (Ranked)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Primary Position */}
        <FormItem>
          <FormLabel required>Primary Position</FormLabel>
          <Select 
            onValueChange={(value) => handlePositionChange(0, value)} 
            value={position1}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {availablePositions.position1.map(position => (
                <SelectItem key={position} value={position}>{position}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>

        {/* Second Preference */}
        <FormItem>
          <FormLabel>Second Preference</FormLabel>
          <Select 
            onValueChange={(value) => handlePositionChange(1, value)} 
            value={position2}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {availablePositions.position2.map(position => (
                <SelectItem key={position} value={position}>{position}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>

        {/* Third Preference */}
        <FormItem>
          <FormLabel>Third Preference</FormLabel>
          <Select 
            onValueChange={(value) => handlePositionChange(2, value)} 
            value={position3}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {availablePositions.position3.map(position => (
                <SelectItem key={position} value={position}>{position}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>

        {/* Fourth Preference */}
        <FormItem>
          <FormLabel>Fourth Preference</FormLabel>
          <Select 
            onValueChange={(value) => handlePositionChange(3, value)} 
            value={position4}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {availablePositions.position4.map(position => (
                <SelectItem key={position} value={position}>{position}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      </div>
    </div>
  );
}