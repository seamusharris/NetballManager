import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Minus, Save } from 'lucide-react';
import { GameStat } from '@shared/schema';

interface SingleStatTesterProps {
  gameId: number;
  statId: number;
  initialValue: number;
  statName: string;
  statField: keyof GameStat;
}

export default function SingleStatTester({
  gameId,
  statId,
  initialValue = 0,
  statName,
  statField
}: SingleStatTesterProps) {
  const [value, setValue] = useState<number>(initialValue);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null);
  
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);
  
  const increment = () => {
    setValue(prev => prev + 1);
  };
  
  const decrement = () => {
    setValue(prev => Math.max(0, prev - 1));
  };
  
  const saveDirectly = async () => {
    setSaving(true);
    setSaveSuccess(null);
    
    try {
      // Create the payload with just the field we're updating
      const payload: any = {};
      payload[statField] = value;
      
      console.log(`Saving ${statField}=${value} for stat ID ${statId}`);
      
        method: 'PATCH',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        console.log(`Successfully saved ${statField}=${value} for stat ID ${statId}`);
        setSaveSuccess(true);
        
        // Verify value was saved
        const verifyResponse = await fetch(`/api/game-stats/${statId}`);
        const savedStat = await verifyResponse.json();
        console.log(`Verification - Saved value:`, savedStat);
        
        // Check if value matches what we expected
        if (savedStat[statField] === value) {
          console.log(`✅ Verification passed: saved value matches (${value})`);
        } else {
          console.log(`❌ Verification failed: saved value (${savedStat[statField]}) doesn't match ${value}`);
        }
      } else {
        console.error(`Failed to save: ${response.status} ${response.statusText}`);
        setSaveSuccess(false);
      }
    } catch (error) {
      console.error('Error saving:', error);
      setSaveSuccess(false);
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Test: {statName} ({statField})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-2">
          <div className="text-3xl font-bold">{value}</div>
          
          <div className="flex justify-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={decrement}
              disabled={value === 0 || saving}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={increment}
              disabled={saving}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            variant="default"
            size="sm"
            onClick={saveDirectly}
            disabled={saving}
            className="mt-2"
          >
            <Save className="h-4 w-4 mr-2" />
            Save {statName}
          </Button>
          
          {saveSuccess === true && (
            <div className="text-green-600 text-sm mt-1">Saved successfully!</div>
          )}
          {saveSuccess === false && (
            <div className="text-red-600 text-sm mt-1">Failed to save.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}