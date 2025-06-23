
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageTemplate from '@/components/layout/PageTemplate';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target, 
  Trophy, 
  Calendar,
  BarChart3,
  Activity,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Zap,
  Shield,
  Eye,
  Edit,
  Trash2,
  Download,
  Share,
  ArrowUp,
  ArrowDown,
  Minus,
  MapPin,
  Timer,
  Flame,
  ChevronUp,
  ChevronDown,
  Circle,
  Dot,
  LineChart,
  PieChart,
  RotateCcw,
  Gauge,
  Layers,
  Grid3X3,
  GitBranch,
  Repeat,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';

// Enhanced sample data for advanced visualizations
const recentGames = [
  { opponent: "Emeralds", result: "W", score: "32-28", round: "R12", date: "May 31", margin: "+4", color: "bg-green-500", quarter1: 9, quarter2: 8, quarter3: 7, quarter4: 8, opponentQ1: 6, opponentQ2: 7, opponentQ3: 8, opponentQ4: 7 },
  { opponent: "Kool Kats", result: "L", score: "24-31", round: "R11", date: "May 24", margin: "-7", color: "bg-red-500", quarter1: 5, quarter2: 6, quarter3: 7, quarter4: 6, opponentQ1: 8, opponentQ2: 8, opponentQ3: 7, opponentQ4: 8 },
  { opponent: "Gems", result: "W", score: "35-22", round: "R10", date: "May 17", margin: "+13", color: "bg-green-500", quarter1: 10, quarter2: 9, quarter3: 8, quarter4: 8, opponentQ1: 5, opponentQ2: 6, opponentQ3: 5, opponentQ4: 6 },
  { opponent: "Pumas", result: "W", score: "28-25", round: "R9", date: "May 10", margin: "+3", color: "bg-green-500", quarter1: 7, quarter2: 7, quarter3: 7, quarter4: 7, opponentQ1: 6, opponentQ2: 6, opponentQ3: 7, opponentQ4: 6 },
  { opponent: "Tigers", result: "L", score: "20-29", round: "R8", date: "May 3", margin: "-9", color: "bg-red-500", quarter1: 4, quarter2: 5, quarter3: 5, quarter4: 6, opponentQ1: 7, opponentQ2: 8, opponentQ3: 7, opponentQ4: 7 }
];

const upcomingGames = [
  { opponent: "Emeralds", date: "Jun 14", time: "10:00 AM", venue: "Home", lastResult: "W", lastScore: "32-28", strength: 85, difficulty: "Hard", preparation: 78 },
  { opponent: "Panthers", date: "Jun 21", time: "2:00 PM", venue: "Away", lastResult: "W", lastScore: "29-22", strength: 72, difficulty: "Medium", preparation: 85 },
  { opponent: "Wildcats", date: "Jun 28", time: "11:00 AM", venue: "Home", lastResult: "L", lastScore: "18-25", strength: 45, difficulty: "Easy", preparation: 92 }
];

const playerPerformance = [
  { name: "Sarah J", position: "GA", rating: 9.2, goals: 42, trend: "up", performance: 92, consistency: 88, clutch: 95, form: [8, 9, 8, 10, 9] },
  { name: "Emma W", position: "C", rating: 8.8, assists: 28, trend: "up", performance: 88, consistency: 85, clutch: 82, form: [7, 8, 9, 9, 8] },
  { name: "Kate B", position: "GK", rating: 8.5, intercepts: 35, trend: "same", performance: 85, consistency: 90, clutch: 78, form: [8, 8, 9, 8, 8] },
  { name: "Lily C", position: "WA", rating: 8.1, feeds: 52, trend: "down", performance: 81, consistency: 75, clutch: 85, form: [9, 8, 7, 8, 7] }
];

const positionData = [
  { position: "GS", avgGoals: 12.4, accuracy: 85, pressure: 72, form: [11, 13, 12, 14, 12], heatmap: [90, 85, 40, 20, 10, 15, 25] },
  { position: "GA", avgGoals: 8.6, accuracy: 78, pressure: 68, form: [8, 9, 8, 10, 7], heatmap: [70, 95, 80, 45, 30, 25, 35] },
  { position: "WA", avgAssists: 15.2, accuracy: 82, pressure: 71, form: [14, 16, 15, 17, 14], heatmap: [50, 80, 90, 75, 60, 40, 55] },
  { position: "C", avgPasses: 45.8, accuracy: 88, pressure: 85, form: [44, 47, 45, 48, 43], heatmap: [60, 70, 85, 95, 85, 70, 60] },
  { position: "WD", avgIntercepts: 6.4, accuracy: 75, pressure: 78, form: [6, 7, 6, 8, 5], heatmap: [55, 40, 60, 75, 90, 80, 50] },
  { position: "GD", avgIntercepts: 8.2, accuracy: 82, pressure: 88, form: [8, 9, 8, 10, 7], heatmap: [35, 25, 45, 30, 70, 95, 80] },
  { position: "GK", avgSaves: 11.6, accuracy: 85, pressure: 92, form: [11, 12, 11, 13, 10], heatmap: [25, 15, 30, 20, 40, 85, 90] }
];

const teamComparison = [
  { metric: "Attack", ourTeam: 85, league: 72, rank: 3 },
  { metric: "Defense", ourTeam: 78, league: 70, rank: 5 },
  { metric: "Speed", ourTeam: 82, league: 75, rank: 4 },
  { metric: "Accuracy", ourTeam: 88, league: 80, rank: 2 },
  { metric: "Pressure", ourTeam: 75, league: 68, rank: 6 },
  { metric: "Fitness", ourTeam: 90, league: 76, rank: 1 }
];

const StatusIndicator = ({ status, label }: { status: 'excellent' | 'good' | 'warning' | 'danger', label: string }) => {
  const statusConfig = {
    excellent: { color: 'bg-green-500', icon: CheckCircle, pulse: false },
    good: { color: 'bg-blue-500', icon: CheckCircle, pulse: false },
    warning: { color: 'bg-yellow-500', icon: AlertCircle, pulse: true },
    danger: { color: 'bg-red-500', icon: XCircle, pulse: true }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="flex items-center space-x-2">
      <div className={`relative ${config.color} rounded-full p-1`}>
        <Icon className="h-3 w-3 text-white" />
        {config.pulse && (
          <div className={`absolute inset-0 ${config.color} rounded-full animate-ping opacity-75`}></div>
        )}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
};

const CircularProgress = ({ percentage, size = 60, strokeWidth = 6, color = "text-blue-500" }: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${percentage * circumference / 100} ${circumference}`;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          className={color}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute text-sm font-bold">
        {percentage}%
      </div>
    </div>
  );
};

const GaugeChart = ({ value, max = 100, label, color = "text-blue-500" }: {
  value: number;
  max?: number;
  label: string;
  color?: string;
}) => {
  const percentage = (value / max) * 100;
  const angle = (percentage / 100) * 180;
  
  return (
    <div className="relative w-32 h-20">
      <svg width="128" height="80" className="overflow-visible">
        <path
          d="M 10 70 A 54 54 0 0 1 118 70"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-gray-200"
        />
        <path
          d="M 10 70 A 54 54 0 0 1 118 70"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          strokeDasharray={`${(percentage / 100) * 169.65} 169.65`}
          className={color}
          strokeLinecap="round"
        />
        <line
          x1="64"
          y1="70"
          x2={64 + 45 * Math.cos((angle - 90) * Math.PI / 180)}
          y2={70 + 45 * Math.sin((angle - 90) * Math.PI / 180)}
          stroke="currentColor"
          strokeWidth="3"
          className={color}
        />
        <circle cx="64" cy="70" r="4" className={`fill-current ${color}`} />
      </svg>
      <div className="absolute bottom-0 left-0 right-0 text-center">
        <div className="text-xl font-bold">{value}</div>
        <div className="text-xs text-gray-600">{label}</div>
      </div>
    </div>
  );
};

const MiniChart = ({ data, color = "bg-blue-500", type = "bar" }: { data: number[], color?: string, type?: "bar" | "line" }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  
  if (type === "line") {
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 80;
      const y = 32 - ((value - min) / (max - min)) * 24;
      return `${x},${y}`;
    }).join(' ');
    
    return (
      <svg width="80" height="32" className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={color.replace('bg-', 'text-')}
        />
        {data.map((value, index) => {
          const x = (index / (data.length - 1)) * 80;
          const y = 32 - ((value - min) / (max - min)) * 24;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              className={`fill-current ${color.replace('bg-', 'text-')}`}
            />
          );
        })}
      </svg>
    );
  }
  
  return (
    <div className="flex items-end space-x-1 h-8">
      {data.map((value, index) => (
        <div
          key={index}
          className={`${color} rounded-sm w-2`}
          style={{ height: `${(value / max) * 100}%` }}
        />
      ))}
    </div>
  );
};

const HeatmapChart = ({ data, label }: { data: number[], label: string }) => {
  const max = Math.max(...data);
  
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-center">{label}</div>
      <div className="grid grid-cols-7 gap-1">
        {data.map((value, index) => (
          <div
            key={index}
            className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
            style={{
              backgroundColor: `hsl(${220 - (value / max) * 60}, 70%, ${85 - (value / max) * 30}%)`,
              color: value / max > 0.6 ? 'white' : 'black'
            }}
          >
            {Math.round(value)}
          </div>
        ))}
      </div>
    </div>
  );
};

const RadarChart = ({ data, labels, size = 120 }: {
  data: number[];
  labels: string[];
  size?: number;
}) => {
  const center = size / 2;
  const radius = size / 2 - 20;
  const angleStep = (2 * Math.PI) / data.length;
  
  const points = data.map((value, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, value, label: labels[index] };
  });
  
  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ') + ' Z';
  
  return (
    <div className="relative">
      <svg width={size} height={size}>
        {/* Grid circles */}
        {[0.2, 0.4, 0.6, 0.8, 1].map((scale, index) => (
          <circle
            key={index}
            cx={center}
            cy={center}
            r={radius * scale}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-gray-200"
          />
        ))}
        
        {/* Grid lines */}
        {points.map((_, index) => {
          const angle = index * angleStep - Math.PI / 2;
          const endX = center + radius * Math.cos(angle);
          const endY = center + radius * Math.sin(angle);
          return (
            <line
              key={index}
              x1={center}
              y1={center}
              x2={endX}
              y2={endY}
              stroke="currentColor"
              strokeWidth="1"
              className="text-gray-200"
            />
          );
        })}
        
        {/* Data area */}
        <path
          d={pathData}
          fill="currentColor"
          fillOpacity="0.3"
          stroke="currentColor"
          strokeWidth="2"
          className="text-blue-500"
        />
        
        {/* Data points */}
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="3"
            fill="currentColor"
            className="text-blue-600"
          />
        ))}
      </svg>
    </div>
  );
};

const TrendChart = ({ data, positive = true }: { data: number[], positive?: boolean }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  return (
    <div className="flex items-center space-x-2">
      <svg width="60" height="20" className="overflow-visible">
        <polyline
          points={data.map((value, index) => {
            const x = (index / (data.length - 1)) * 60;
            const y = 20 - ((value - min) / range) * 20;
            return `${x},${y}`;
          }).join(' ')}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={positive ? "text-green-500" : "text-red-500"}
        />
      </svg>
      <div className={`flex items-center space-x-1 ${positive ? "text-green-600" : "text-red-600"}`}>
        {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        <span className="text-xs font-medium">
          {positive ? "Improving" : "Declining"}
        </span>
      </div>
    </div>
  );
};

const WaterfallChart = ({ data }: { data: { label: string, value: number, color: string }[] }) => {
  let runningTotal = 0;
  
  return (
    <div className="space-y-2">
      {data.map((item, index) => {
        const prevTotal = runningTotal;
        runningTotal += item.value;
        const height = Math.abs(item.value) * 2;
        const isPositive = item.value > 0;
        
        return (
          <div key={index} className="flex items-center space-x-2">
            <div className="w-16 text-xs truncate">{item.label}</div>
            <div className="flex-1 relative h-6 bg-gray-100 rounded">
              <div
                className={`absolute ${item.color} rounded`}
                style={{
                  left: isPositive ? `${(prevTotal / 50) * 100}%` : `${(runningTotal / 50) * 100}%`,
                  width: `${(Math.abs(item.value) / 50) * 100}%`,
                  height: '100%'
                }}
              />
            </div>
            <div className="w-8 text-xs text-right font-medium">
              {item.value > 0 ? '+' : ''}{item.value}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const BubbleChart = ({ data }: { data: { x: number, y: number, size: number, label: string, color: string }[] }) => {
  const maxX = Math.max(...data.map(d => d.x));
  const maxY = Math.max(...data.map(d => d.y));
  const maxSize = Math.max(...data.map(d => d.size));
  
  return (
    <div className="relative h-48 bg-gray-50 rounded border p-4">
      <svg width="100%" height="100%" className="absolute inset-4">
        {data.map((point, index) => (
          <g key={index}>
            <circle
              cx={`${(point.x / maxX) * 90}%`}
              cy={`${100 - (point.y / maxY) * 90}%`}
              r={Math.max(8, (point.size / maxSize) * 20)}
              className={`fill-current ${point.color} opacity-70`}
            />
            <text
              x={`${(point.x / maxX) * 90}%`}
              y={`${100 - (point.y / maxY) * 90}%`}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs font-medium fill-white"
            >
              {point.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

export default function DashboardExamples() {
  const [activeTab, setActiveTab] = useState("performance");
  
  return (
    <PageTemplate 
      title="Advanced Dashboard Analytics" 
      breadcrumbs={[
        { label: "Component Examples", href: "/component-examples" },
        { label: "Dashboard Examples" }
      ]}
    >
      <div className="prose max-w-none mb-8">
        <p className="text-lg text-gray-700">
          Comprehensive collection of graphical analysis widgets with interactive charts, heatmaps, radar plots, and advanced visualizations.
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance Analytics</TabsTrigger>
          <TabsTrigger value="tactical">Tactical Analysis</TabsTrigger>
          <TabsTrigger value="comparative">Comparative Insights</TabsTrigger>
          <TabsTrigger value="predictive">Predictive Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-8">
          <Helmet>
            <title>Performance Analytics - Dashboard Examples</title>
          </Helmet>

          {/* Real-time Performance Monitoring */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Real-time Performance Monitoring</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Live Performance Gauge */}
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Gauge className="h-5 w-5" />
                    <span>Live Performance Gauge</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <GaugeChart value={85} label="Attack" color="text-green-500" />
                    </div>
                    <div className="text-center">
                      <GaugeChart value={72} label="Defense" color="text-blue-500" />
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Overall Team Rating</span>
                      <div className="flex items-center space-x-2">
                        <CircularProgress percentage={78} size={30} />
                        <span className="font-bold">78%</span>
                      </div>
                    </div>
                    <StatusIndicator status="good" label="Performance Stable" />
                  </div>
                </CardContent>
              </Card>

              {/* Multi-dimensional Player Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Player Skill Radar</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <RadarChart
                        data={[85, 78, 92, 68, 75, 88]}
                        labels={["Speed", "Accuracy", "Power", "Defense", "Vision", "Fitness"]}
                        size={100}
                      />
                      <div className="mt-2 text-sm font-medium">Sarah J (GA)</div>
                    </div>
                    <div className="text-center">
                      <RadarChart
                        data={[72, 88, 65, 92, 85, 78]}
                        labels={["Speed", "Accuracy", "Power", "Defense", "Vision", "Fitness"]}
                        size={100}
                      />
                      <div className="mt-2 text-sm font-medium">Kate B (GK)</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Position Heat Maps */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Grid3X3 className="h-5 w-5" />
                  <span>Position Performance Heatmaps</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {positionData.map((position, index) => (
                    <div key={index} className="text-center">
                      <HeatmapChart data={position.heatmap} label={position.position} />
                      <div className="mt-2 space-y-1">
                        <div className="text-xs font-medium">Effectiveness: {position.accuracy}%</div>
                        <TrendChart data={position.form} positive={position.form[4] > position.form[0]} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Advanced Trend Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <LineChart className="h-5 w-5" />
                  <span>Performance Trend Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Scoring Progression</h4>
                    {playerPerformance.map((player, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {player.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="font-medium">{player.name}</div>
                            <div className="text-xs text-gray-500">{player.position}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <MiniChart data={player.form} type="line" color="text-blue-500" />
                          <div className="text-right">
                            <div className="font-bold">{player.rating}</div>
                            <div className="text-xs text-gray-500">Rating</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Quarter Analysis Waterfall</h4>
                    <WaterfallChart data={[
                      { label: "Q1", value: 12, color: "bg-green-500" },
                      { label: "Q2", value: -3, color: "bg-red-400" },
                      { label: "Q3", value: 8, color: "bg-green-500" },
                      { label: "Q4", value: 5, color: "bg-green-500" }
                    ]} />
                    <div className="p-3 bg-blue-50 rounded border border-blue-200">
                      <div className="text-sm font-medium text-blue-800">
                        Key Insight: Q2 dip indicates halftime adjustments needed
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </TabsContent>

        <TabsContent value="tactical" className="space-y-8">
          {/* Tactical Formation Analysis */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Tactical Formation Analysis</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Formation Effectiveness Bubble Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <GitBranch className="h-5 w-5" />
                    <span>Formation Effectiveness</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BubbleChart data={[
                    { x: 85, y: 78, size: 25, label: "Attack", color: "text-green-500" },
                    { x: 72, y: 88, size: 30, label: "Defense", color: "text-blue-500" },
                    { x: 68, y: 72, size: 20, label: "Midcourt", color: "text-purple-500" },
                    { x: 90, y: 65, size: 22, label: "Counter", color: "text-orange-500" }
                  ]} />
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>High Attack Success</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>Strong Defense</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Position Rotation Effectiveness */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <RotateCcw className="h-5 w-5" />
                    <span>Rotation Patterns</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { rotation: "GS → GA", effectiveness: 92, frequency: 15, color: "bg-green-500" },
                      { rotation: "WA → C", effectiveness: 85, frequency: 22, color: "bg-blue-500" },
                      { rotation: "C → WD", effectiveness: 78, frequency: 18, color: "bg-yellow-500" },
                      { rotation: "GD → GK", effectiveness: 88, frequency: 12, color: "bg-purple-500" }
                    ].map((rotation, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{rotation.rotation}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">{rotation.effectiveness}%</span>
                            <CircularProgress percentage={rotation.effectiveness} size={24} />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`${rotation.color} rounded-full h-2`}
                              style={{ width: `${(rotation.frequency / 25) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{rotation.frequency} times</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Game Flow Analysis */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Game Flow & Momentum Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Quarter Momentum</h4>
                    {recentGames.slice(0, 3).map((game, gameIndex) => (
                      <div key={gameIndex} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">vs {game.opponent}</span>
                          <Badge variant={game.result === 'W' ? 'default' : 'destructive'}>
                            {game.result}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-1">
                          {[
                            { our: game.quarter1, opp: game.opponentQ1 },
                            { our: game.quarter2, opp: game.opponentQ2 },
                            { our: game.quarter3, opp: game.opponentQ3 },
                            { our: game.quarter4, opp: game.opponentQ4 }
                          ].map((quarter, qIndex) => {
                            const diff = quarter.our - quarter.opp;
                            const isWinning = diff > 0;
                            return (
                              <div 
                                key={qIndex} 
                                className={`p-1 rounded text-center text-xs ${
                                  isWinning ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}
                              >
                                <div className="font-bold">Q{qIndex + 1}</div>
                                <div>{diff > 0 ? '+' : ''}{diff}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Pressure Response</h4>
                    <div className="space-y-3">
                      {[
                        { situation: "Down by 5+", response: 85, games: 8 },
                        { situation: "Close game (±3)", response: 78, games: 12 },
                        { situation: "Leading by 10+", response: 92, games: 6 }
                      ].map((pressure, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">{pressure.situation}</span>
                            <span className="text-sm text-gray-500">{pressure.games} games</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Progress value={pressure.response} className="flex-1 h-2" />
                            <span className="text-sm font-bold">{pressure.response}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Critical Moments</h4>
                    <div className="space-y-2">
                      {[
                        { moment: "Last 5 minutes", success: 88, icon: Clock, color: "text-green-600" },
                        { moment: "Overtime", success: 75, icon: Timer, color: "text-orange-600" },
                        { moment: "Power play", success: 92, icon: Zap, color: "text-blue-600" },
                        { moment: "Player down", success: 65, icon: Users, color: "text-red-600" }
                      ].map((moment, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            <moment.icon className={`h-4 w-4 ${moment.color}`} />
                            <span className="text-sm">{moment.moment}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-12 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`${moment.color.replace('text-', 'bg-')} rounded-full h-2`}
                                style={{ width: `${moment.success}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium">{moment.success}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </TabsContent>

        <TabsContent value="comparative" className="space-y-8">
          {/* League Comparison Analysis */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Comparative League Analysis</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Team vs League Radar */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Team vs League Average</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center mb-4">
                    <RadarChart
                      data={teamComparison.map(t => t.ourTeam)}
                      labels={teamComparison.map(t => t.metric)}
                      size={180}
                    />
                  </div>
                  <div className="space-y-2">
                    {teamComparison.map((metric, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{metric.metric}</span>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500">#{metric.rank}</span>
                            <Badge variant={metric.rank <= 3 ? 'default' : 'secondary'} className="text-xs">
                              {metric.ourTeam}
                            </Badge>
                          </div>
                          <span className="text-xs text-gray-500">vs {metric.league}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Opponent Strength Matrix */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Opponent Strength Matrix</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingGames.map((game, index) => (
                      <div key={index} className="p-4 border rounded-lg bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="font-medium">{game.opponent}</div>
                            <div className="text-xs text-gray-500">{game.date} - {game.venue}</div>
                          </div>
                          <div className="text-right">
                            <CircularProgress 
                              percentage={game.strength} 
                              size={40} 
                              color={game.strength > 70 ? "text-green-500" : game.strength > 50 ? "text-orange-500" : "text-red-500"}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <div className="text-center p-2 bg-blue-50 rounded">
                            <div className="text-xs text-blue-600">Strength</div>
                            <div className="font-bold text-blue-800">{game.strength}%</div>
                          </div>
                          <div className="text-center p-2 bg-green-50 rounded">
                            <div className="text-xs text-green-600">Our Prep</div>
                            <div className="font-bold text-green-800">{game.preparation}%</div>
                          </div>
                          <div className="text-center p-2 bg-purple-50 rounded">
                            <div className="text-xs text-purple-600">Difficulty</div>
                            <div className="font-bold text-purple-800">{game.difficulty}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Win Probability</div>
                            <Progress value={game.strength} className="h-2" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Preparation Level</div>
                            <Progress value={game.preparation} className="h-2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Position-by-Position Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Position-by-Position League Comparison</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { position: "Attack", ourRank: 2, total: 12, strength: 88, trend: "up" },
                    { position: "Defense", ourRank: 5, total: 12, strength: 75, trend: "same" },
                    { position: "Midcourt", ourRank: 3, total: 12, strength: 82, trend: "up" },
                    { position: "Overall", ourRank: 3, total: 12, strength: 85, trend: "up" }
                  ].map((pos, index) => (
                    <div key={index} className="p-4 border rounded-lg text-center">
                      <div className="mb-3">
                        <div className="text-lg font-bold">#{pos.ourRank}</div>
                        <div className="text-sm text-gray-600">{pos.position}</div>
                        <div className="text-xs text-gray-500">of {pos.total} teams</div>
                      </div>
                      
                      <CircularProgress 
                        percentage={pos.strength} 
                        size={60} 
                        color={pos.ourRank <= 3 ? "text-green-500" : pos.ourRank <= 6 ? "text-orange-500" : "text-red-500"}
                      />
                      
                      <div className="mt-3">
                        <TrendChart 
                          data={[75, 78, 80, 82, pos.strength]} 
                          positive={pos.trend === "up"} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        </TabsContent>

        <TabsContent value="predictive" className="space-y-8">
          {/* Predictive Analytics */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Predictive Analytics & Insights</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Win Probability Calculator */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Game Outcome Predictor</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingGames.map((game, index) => {
                      const factors = [
                        { name: "Recent Form", weight: 0.3, score: 85 },
                        { name: "Head-to-Head", weight: 0.25, score: game.strength },
                        { name: "Home Advantage", weight: 0.15, score: game.venue === "Home" ? 80 : 60 },
                        { name: "Preparation", weight: 0.3, score: game.preparation }
                      ];
                      
                      const overallProbability = factors.reduce((acc, factor) => 
                        acc + (factor.score * factor.weight), 0
                      );
                      
                      return (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-center mb-3">
                            <div className="font-medium">vs {game.opponent}</div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-green-600">
                                {Math.round(overallProbability)}%
                              </div>
                              <div className="text-xs text-gray-500">Win Probability</div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {factors.map((factor, factorIndex) => (
                              <div key={factorIndex} className="flex items-center justify-between">
                                <span className="text-sm">{factor.name}</span>
                                <div className="flex items-center space-x-2">
                                  <div className="w-16 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-blue-500 rounded-full h-2"
                                      style={{ width: `${factor.score}%` }}
                                    />
                                  </div>
                                  <span className="text-xs w-8">{factor.score}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="mt-3 p-2 bg-blue-50 rounded">
                            <div className="text-xs text-blue-800 text-center">
                              Recommendation: {overallProbability > 75 ? "Focus on maintaining form" : 
                                             overallProbability > 50 ? "Prepare strategic adjustments" : 
                                             "Intensive preparation required"}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Prediction Model */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Performance Trajectory</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">Season Projection</div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-3 bg-green-50 rounded border border-green-200">
                          <div className="text-2xl font-bold text-green-800">14</div>
                          <div className="text-xs text-green-600">Projected Wins</div>
                        </div>
                        <div className="p-3 bg-red-50 rounded border border-red-200">
                          <div className="text-2xl font-bold text-red-800">4</div>
                          <div className="text-xs text-red-600">Projected Losses</div>
                        </div>
                        <div className="p-3 bg-blue-50 rounded border border-blue-200">
                          <div className="text-2xl font-bold text-blue-800">2nd</div>
                          <div className="text-xs text-blue-600">Final Position</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Key Performance Indicators</h4>
                      {[
                        { metric: "Goal Accuracy", current: 82, projected: 85, trend: "improving" },
                        { metric: "Defensive Rating", current: 78, projected: 80, trend: "improving" },
                        { metric: "Fitness Index", current: 88, projected: 92, trend: "improving" },
                        { metric: "Team Chemistry", current: 85, projected: 88, trend: "stable" }
                      ].map((kpi, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{kpi.metric}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">{kpi.current}%</span>
                            <div className="flex items-center space-x-1">
                              <ArrowUp className="h-3 w-3 text-green-500" />
                              <span className="text-xs font-medium text-green-600">{kpi.projected}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium text-yellow-800">Risk Factors</span>
                      </div>
                      <ul className="text-xs text-yellow-700 space-y-1">
                        <li>• Player fatigue in final rounds</li>
                        <li>• Increased opposition pressure</li>
                        <li>• Weather-dependent venue changes</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Analytics Dashboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Layers className="h-5 w-5" />
                  <span>Multi-Layer Analytics Dashboard</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Statistical Anomalies</h4>
                    <div className="space-y-2">
                      {[
                        { alert: "Unusually high Q3 performance", severity: "positive", value: "+15%" },
                        { alert: "Defensive lapses in close games", severity: "warning", value: "-8%" },
                        { alert: "Improved accuracy under pressure", severity: "positive", value: "+12%" }
                      ].map((anomaly, index) => (
                        <div key={index} className={`p-2 rounded text-xs ${
                          anomaly.severity === 'positive' ? 'bg-green-50 text-green-800' :
                          anomaly.severity === 'warning' ? 'bg-yellow-50 text-yellow-800' :
                          'bg-red-50 text-red-800'
                        }`}>
                          <div className="font-medium">{anomaly.alert}</div>
                          <div className="font-bold">{anomaly.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Optimization Suggestions</h4>
                    <div className="space-y-2">
                      {[
                        { suggestion: "Rotate GS/GA more frequently", impact: "High", confidence: 85 },
                        { suggestion: "Focus on Q2 defensive drills", impact: "Medium", confidence: 78 },
                        { suggestion: "Increase midcourt training", impact: "High", confidence: 92 }
                      ].map((opt, index) => (
                        <div key={index} className="p-2 border rounded">
                          <div className="font-medium text-sm">{opt.suggestion}</div>
                          <div className="flex justify-between items-center mt-1">
                            <Badge variant={opt.impact === 'High' ? 'default' : 'secondary'} className="text-xs">
                              {opt.impact} Impact
                            </Badge>
                            <span className="text-xs text-gray-500">{opt.confidence}% confidence</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Real-time Adjustments</h4>
                    <div className="space-y-2">
                      {[
                        { time: "Live", action: "Increase defensive pressure", status: "active" },
                        { time: "Q3 Start", action: "Rotate tired players", status: "queued" },
                        { time: "Close Game", action: "Switch to zone defense", status: "conditional" }
                      ].map((adjustment, index) => (
                        <div key={index} className="p-2 border rounded">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{adjustment.action}</span>
                            <Badge variant={
                              adjustment.status === 'active' ? 'default' :
                              adjustment.status === 'queued' ? 'secondary' : 'outline'
                            } className="text-xs">
                              {adjustment.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{adjustment.time}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </TabsContent>
      </Tabs>

      {/* Design Guidelines */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Advanced Visualization Guidelines</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Interactive Elements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <GaugeChart value={75} label="Example" />
                  <span className="text-sm">Gauge charts for real-time metrics</span>
                </div>
                <div className="flex items-center space-x-3">
                  <RadarChart data={[80, 75, 90, 65]} labels={["A", "B", "C", "D"]} size={60} />
                  <span className="text-sm">Radar charts for multi-dimensional analysis</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="grid grid-cols-4 gap-1">
                    {[90, 75, 60, 45].map((val, i) => (
                      <div key={i} className="w-4 h-4 rounded" style={{backgroundColor: `hsl(${220 - (val/100)*60}, 70%, ${85 - (val/100)*30}%)`}} />
                    ))}
                  </div>
                  <span className="text-sm">Heatmaps for pattern identification</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Advanced Analytics Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Real-time performance monitoring with live updates</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Predictive modeling for game outcomes and performance</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Multi-dimensional comparisons with league data</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Interactive tactical formation analysis</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Anomaly detection and optimization suggestions</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Historical trend analysis with future projections</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
    </PageTemplate>
  );
}
