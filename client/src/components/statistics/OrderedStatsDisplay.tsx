
import React from 'react';
import { Position } from '@shared/schema';
import { getPositionOrderedStats, getAllStatsOrdered, getStatsByCategoryOrdered } from '@/lib/statOrderUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OrderedStatsDisplayProps {
  position?: Position;
  statsData: Record<string, number>;
  showByCategory?: boolean;
}

/**
 * Example component demonstrating how to use the centralized stat ordering
 */
export const OrderedStatsDisplay: React.FC<OrderedStatsDisplayProps> = ({ 
  position, 
  statsData, 
  showByCategory = false 
}) => {
  
  if (showByCategory) {
    const attackingStats = getStatsByCategoryOrdered('attacking', statsData);
    const defendingStats = getStatsByCategoryOrdered('defending', statsData);
    const universalStats = getStatsByCategoryOrdered('universal', statsData);

    return (
      <div className="space-y-4">
        {attackingStats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Attacking Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {attackingStats.map(stat => (
                <div key={stat.key} className="flex justify-between">
                  <span>{stat.label}</span>
                  <span className="font-mono">{stat.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        
        {defendingStats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Defending Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {defendingStats.map(stat => (
                <div key={stat.key} className="flex justify-between">
                  <span>{stat.label}</span>
                  <span className="font-mono">{stat.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Universal Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {universalStats.map(stat => (
              <div key={stat.key} className="flex justify-between">
                <span>{stat.label}</span>
                <span className="font-mono">{stat.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Position-specific ordering or all stats
  const orderedStats = position 
    ? getPositionOrderedStats(position, statsData)
    : getAllStatsOrdered(statsData);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">
          {position ? `${position} Stats` : 'All Stats'} (Ordered)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {orderedStats.map(stat => (
          <div key={stat.key} className="flex justify-between">
            <span>{stat.label}</span>
            <span className="font-mono">{stat.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
