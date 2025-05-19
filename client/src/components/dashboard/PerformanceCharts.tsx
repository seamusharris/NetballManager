import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Game } from '@shared/schema';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PerformanceChartsProps {
  games: Game[];
  className?: string;
}

export default function PerformanceCharts({ games, className }: PerformanceChartsProps) {
  const [gameRange, setGameRange] = useState('last5');
  const [metricType, setMetricType] = useState('all');
  
  // This is placeholder data - in a real app, you would calculate this from game stats
  const chartData = [
    {
      name: 'Quarter 1',
      teamScore: 10.2,
      opponentScore: 9.5,
      reboundRate: 65,
      interceptions: 7,
      change: 8
    },
    {
      name: 'Quarter 2',
      teamScore: 9.6,
      opponentScore: 10.1,
      reboundRate: 58,
      interceptions: 5,
      change: 3
    },
    {
      name: 'Quarter 3',
      teamScore: 11.4,
      opponentScore: 8.7,
      reboundRate: 70,
      interceptions: 9,
      change: 15
    },
    {
      name: 'Quarter 4',
      teamScore: 11.8,
      opponentScore: 12.2,
      reboundRate: 61,
      interceptions: 6,
      change: -2
    }
  ];
  
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-heading font-semibold text-neutral-dark">Quarter-by-Quarter Performance</h3>
          <div className="flex space-x-3">
            <Select value={gameRange} onValueChange={setGameRange}>
              <SelectTrigger className="bg-white border rounded-md w-[130px]">
                <SelectValue placeholder="Last 5 Games" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last5">Last 5 Games</SelectItem>
                <SelectItem value="all">All Games</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={metricType} onValueChange={setMetricType}>
              <SelectTrigger className="bg-white border rounded-md w-[130px]">
                <SelectValue placeholder="All Metrics" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Metrics</SelectItem>
                <SelectItem value="goals">Goals Only</SelectItem>
                <SelectItem value="defense">Defense Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="h-64 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="teamScore" name="Team Score" fill="hsl(var(--primary))" />
              <Bar dataKey="opponentScore" name="Opponent Score" fill="hsl(var(--secondary))" />
              {metricType !== 'goals' && (
                <>
                  <Bar dataKey="reboundRate" name="Rebound %" fill="hsl(var(--accent))" />
                  <Bar dataKey="interceptions" name="Interceptions" fill="hsl(var(--success))" />
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {chartData.map((quarter, index) => (
            <div key={index} className="p-3 bg-primary/5 rounded-md">
              <p className="text-sm text-gray-500 mb-1">{quarter.name} Avg</p>
              <div className="flex justify-between items-center">
                <p className="text-lg font-bold text-primary">{quarter.teamScore}</p>
                <span className={cn(
                  "text-xs flex items-center",
                  quarter.change >= 0 ? "text-success" : "text-error"
                )}>
                  {quarter.change >= 0 ? (
                    <ArrowUp className="w-3 h-3 mr-0.5" />
                  ) : (
                    <ArrowDown className="w-3 h-3 mr-0.5" />
                  )}
                  {Math.abs(quarter.change)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
