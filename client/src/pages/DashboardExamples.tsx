
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

          {/* Advanced Sentiment & Psychological Analysis */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Team Psychology & Sentiment Analytics</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Team Morale Tracker */}
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Team Morale & Confidence Index</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { aspect: "Overall Confidence", current: 85, trend: [78, 80, 82, 85], color: "text-green-500" },
                      { aspect: "Pressure Handling", current: 72, trend: [68, 70, 71, 72], color: "text-blue-500" },
                      { aspect: "Team Unity", current: 92, trend: [88, 90, 91, 92], color: "text-purple-500" },
                      { aspect: "Focus Level", current: 78, trend: [82, 79, 76, 78], color: "text-orange-500" }
                    ].map((metric, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                        <div className="flex items-center space-x-3">
                          <CircularProgress percentage={metric.current} size={40} color={metric.color} />
                          <div>
                            <div className="font-medium">{metric.aspect}</div>
                            <div className="text-xs text-gray-500">Current Level</div>
                          </div>
                        </div>
                        <MiniChart data={metric.trend} type="line" color={metric.color} />
                      </div>
                    ))}
                    
                    <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                      <div className="text-sm font-medium text-green-800 mb-2">Psychological Insights</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>High team cohesion</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>Strong leadership</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span>Positive momentum</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span>Needs motivation</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Network Analysis - Player Connections */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <GitBranch className="h-5 w-5" />
                    <span>Player Connection Network</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative h-64 bg-gray-50 rounded-lg p-4 overflow-hidden">
                    <svg width="100%" height="100%" className="absolute inset-0">
                      {/* Network connections */}
                      <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                          <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
                        </marker>
                      </defs>
                      
                      {/* Connection lines */}
                      {[
                        { x1: 80, y1: 80, x2: 160, y2: 120, strength: 0.9 },
                        { x1: 160, y1: 120, x2: 240, y2: 80, strength: 0.8 },
                        { x1: 80, y1: 80, x2: 200, y2: 180, strength: 0.7 },
                        { x1: 240, y1: 80, x2: 280, y2: 160, strength: 0.85 },
                        { x1: 160, y1: 120, x2: 200, y2: 180, strength: 0.75 }
                      ].map((line, index) => (
                        <line
                          key={index}
                          x1={line.x1}
                          y1={line.y1}
                          x2={line.x2}
                          y2={line.y2}
                          stroke={`hsl(${220 - line.strength * 60}, 70%, 60%)`}
                          strokeWidth={line.strength * 4}
                          opacity={0.7}
                          markerEnd="url(#arrowhead)"
                        />
                      ))}
                      
                      {/* Player nodes */}
                      {[
                        { x: 80, y: 80, name: "S", role: "GS", connections: 3, color: "text-red-500" },
                        { x: 160, y: 120, name: "E", role: "C", connections: 4, color: "text-blue-500" },
                        { x: 240, y: 80, name: "K", role: "GK", connections: 2, color: "text-green-500" },
                        { x: 200, y: 180, name: "L", role: "WA", connections: 2, color: "text-purple-500" },
                        { x: 280, y: 160, name: "M", role: "GD", connections: 1, color: "text-orange-500" }
                      ].map((node, index) => (
                        <g key={index}>
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={15 + node.connections * 3}
                            fill="currentColor"
                            className={`${node.color} opacity-80`}
                          />
                          <text
                            x={node.x}
                            y={node.y + 4}
                            textAnchor="middle"
                            className="text-white font-bold text-sm"
                          >
                            {node.name}
                          </text>
                          <text
                            x={node.x}
                            y={node.y + 35}
                            textAnchor="middle"
                            className="text-xs font-medium"
                          >
                            {node.role}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Connection Strength</h4>
                      {[
                        { players: "Sarah ↔ Emma", strength: 92, color: "bg-green-500" },
                        { players: "Emma ↔ Kate", strength: 85, color: "bg-blue-500" },
                        { players: "Kate ↔ Lily", strength: 78, color: "bg-yellow-500" }
                      ].map((conn, index) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                          <span>{conn.players}</span>
                          <div className="flex items-center space-x-1">
                            <div className={`w-8 h-2 ${conn.color} rounded-full`}></div>
                            <span>{conn.strength}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Key Insights</h4>
                      <div className="text-xs space-y-1">
                        <div>• Emma is the central connector</div>
                        <div>• Strong attacking partnerships</div>
                        <div>• Weak defensive communication</div>
                        <div>• Isolated player: Maria (GD)</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Pattern Recognition */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>Advanced Pattern Recognition & Anomaly Detection</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Scoring Patterns</h4>
                    <div className="space-y-3">
                      {[
                        { pattern: "Fast Break Success", frequency: 78, anomaly: false },
                        { pattern: "Corner Shot Accuracy", frequency: 45, anomaly: true },
                        { pattern: "Pressure Response", frequency: 82, anomaly: false },
                        { pattern: "Q4 Momentum Shift", frequency: 23, anomaly: true }
                      ].map((pattern, index) => (
                        <div key={index} className={`p-3 rounded-lg border-2 ${
                          pattern.anomaly 
                            ? 'bg-red-50 border-red-200' 
                            : 'bg-green-50 border-green-200'
                        }`}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">{pattern.pattern}</span>
                            {pattern.anomaly && <AlertCircle className="h-4 w-4 text-red-500" />}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Progress value={pattern.frequency} className="flex-1 h-2" />
                            <span className="text-xs font-bold">{pattern.frequency}%</span>
                          </div>
                          {pattern.anomaly && (
                            <div className="text-xs text-red-600 mt-1">
                              ⚠ Significant deviation detected
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Movement Heat Patterns</h4>
                    <div className="space-y-2">
                      {['Attack Third', 'Center Court', 'Defense Third'].map((zone, zoneIndex) => (
                        <div key={zoneIndex} className="space-y-2">
                          <div className="text-sm font-medium">{zone}</div>
                          <div className="grid grid-cols-8 gap-1">
                            {Array.from({length: 24}, (_, i) => {
                              const intensity = Math.random() * 100;
                              return (
                                <div
                                  key={i}
                                  className="w-3 h-3 rounded-sm"
                                  style={{
                                    backgroundColor: `hsl(${intensity < 30 ? 220 : intensity < 70 ? 45 : 0}, 70%, ${Math.max(90 - intensity, 40)}%)`
                                  }}
                                  title={`${Math.round(intensity)}% activity`}
                                />
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 p-2 bg-blue-50 rounded text-xs">
                      <div className="font-medium text-blue-800 mb-1">Movement Insights</div>
                      <div className="text-blue-700 space-y-1">
                        <div>• High center court activity</div>
                        <div>• Left-side preference in attack</div>
                        <div>• Defensive clustering patterns</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Time-based Analytics</h4>
                    <div className="space-y-2">
                      {[
                        { time: "0-5 min", performance: 85, trend: "stable" },
                        { time: "5-10 min", performance: 78, trend: "declining" },
                        { time: "10-15 min", performance: 92, trend: "improving" },
                        { time: "Last 5 min", performance: 88, trend: "strong" }
                      ].map((period, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm font-medium">{period.time}</span>
                          <div className="flex items-center space-x-2">
                            <div className={`w-12 h-2 rounded-full ${
                              period.performance > 85 ? 'bg-green-500' :
                              period.performance > 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}></div>
                            <span className="text-xs">{period.performance}%</span>
                            <div className={`text-xs px-1 py-0.5 rounded text-white ${
                              period.trend === 'improving' || period.trend === 'strong' ? 'bg-green-500' :
                              period.trend === 'declining' ? 'bg-red-500' : 'bg-gray-500'
                            }`}>
                              {period.trend}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 space-y-2">
                      <h5 className="font-medium text-sm">Fatigue Indicators</h5>
                      <div className="space-y-1">
                        {[
                          { metric: "Sprint Speed", decline: 12, alert: true },
                          { metric: "Pass Accuracy", decline: 5, alert: false },
                          { metric: "Reaction Time", decline: 18, alert: true },
                          { metric: "Decision Making", decline: 8, alert: false }
                        ].map((fatigue, index) => (
                          <div key={index} className="flex items-center justify-between text-xs">
                            <span>{fatigue.metric}</span>
                            <div className={`flex items-center space-x-1 ${
                              fatigue.alert ? 'text-red-600' : 'text-green-600'
                            }`}>
                              <span>-{fatigue.decline}%</span>
                              {fatigue.alert && <AlertCircle className="h-3 w-3" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Real-time Monitoring Dashboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Real-time Performance Monitoring</span>
                  <Badge variant="outline" className="ml-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                    LIVE
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "Current Score", value: "24-18", status: "winning", icon: Trophy },
                    { label: "Quarter", value: "Q3 - 8:32", status: "active", icon: Clock },
                    { label: "Possession", value: "67%", status: "good", icon: Target },
                    { label: "Team Energy", value: "82%", status: "high", icon: Flame }
                  ].map((stat, index) => (
                    <div key={index} className={`p-4 rounded-lg border-2 ${
                      stat.status === 'winning' || stat.status === 'high' ? 'bg-green-50 border-green-300' :
                      stat.status === 'good' ? 'bg-blue-50 border-blue-300' :
                      'bg-yellow-50 border-yellow-300'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <stat.icon className={`h-5 w-5 ${
                          stat.status === 'winning' || stat.status === 'high' ? 'text-green-600' :
                          stat.status === 'good' ? 'text-blue-600' : 'text-yellow-600'
                        }`} />
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          stat.status === 'winning' || stat.status === 'high' ? 'bg-green-200 text-green-800' :
                          stat.status === 'good' ? 'bg-blue-200 text-blue-800' :
                          'bg-yellow-200 text-yellow-800'
                        }`}>
                          {stat.status.toUpperCase()}
                        </div>
                      </div>
                      <div className="text-2xl font-bold mb-1">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Live Player Performance</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {[
                        { name: "Sarah J", position: "GS", status: "excellent", goals: 8, attempts: 10 },
                        { name: "Emma W", position: "C", status: "good", assists: 12, turnovers: 2 },
                        { name: "Kate B", position: "GK", status: "warning", intercepts: 3, misses: 4 },
                        { name: "Lily C", position: "WA", status: "good", feeds: 15, errors: 1 },
                        { name: "Maya S", position: "WD", status: "excellent", deflections: 8, steals: 3 },
                        { name: "Zoe K", position: "GA", status: "good", goals: 4, assists: 6 },
                        { name: "Amy L", position: "GD", status: "excellent", intercepts: 6, rebounds: 4 }
                      ].map((player, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              player.status === 'excellent' ? 'bg-green-500' :
                              player.status === 'good' ? 'bg-blue-500' : 'bg-yellow-500'
                            } ${player.status === 'warning' ? 'animate-pulse' : ''}`}></div>
                            <div>
                              <div className="font-medium text-sm">{player.name}</div>
                              <div className="text-xs text-gray-500">{player.position}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {player.goals !== undefined ? `${player.goals}/${player.attempts}` : 
                               player.assists !== undefined ? `${player.assists}A, ${player.turnovers}TO` :
                               player.intercepts !== undefined ? `${player.intercepts}I, ${player.misses}M` :
                               `${player.feeds}F, ${player.errors}E`}
                            </div>
                            <div className="text-xs text-gray-500">
                              {player.goals !== undefined ? 'Goals' : 
                               player.assists !== undefined ? 'Assists/TO' : 'Stats'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Live Game Flow</h4>
                    <div className="relative h-48 bg-gray-100 rounded-lg p-4">
                      <svg width="100%" height="100%">
                        {/* Game momentum line */}
                        <polyline
                          points="0,80 40,70 80,60 120,75 160,65 200,55 240,60 280,50"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="3"
                          className="drop-shadow-sm"
                        />
                        <polyline
                          points="0,120 40,125 80,130 120,115 160,125 200,135 240,130 280,140"
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="3"
                          className="drop-shadow-sm"
                        />
                        
                        {/* Current position indicator */}
                        <circle cx="280" cy="50" r="4" fill="#10b981" className="animate-pulse" />
                        <circle cx="280" cy="140" r="4" fill="#ef4444" className="animate-pulse" />
                        
                        {/* Quarter markers */}
                        {[70, 140, 210, 280].map((x, index) => (
                          <line key={index} x1={x} y1="20" x2={x} y2="180" stroke="#d1d5db" strokeWidth="1" strokeDasharray="4,4" />
                        ))}
                      </svg>
                      
                      <div className="absolute bottom-2 left-4 right-4 flex justify-between text-xs text-gray-500">
                        <span>Q1</span>
                        <span>Q2</span>
                        <span>Q3</span>
                        <span>Q4</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-1 bg-green-500 rounded"></div>
                        <span>Our Team Momentum</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-1 bg-red-500 rounded"></div>
                        <span>Opposition Momentum</span>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-sm font-medium text-blue-800 mb-2">Live Coaching Alerts</div>
                      <div className="space-y-1 text-xs text-blue-700">
                        <div className="flex items-center space-x-1">
                          <AlertCircle className="h-3 w-3" />
                          <span>Kate (GK) showing fatigue - consider rotation</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="h-3 w-3" />
                          <span>Strong attacking momentum - maintain pressure</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Target className="h-3 w-3" />
                          <span>Opposition weak on left side - exploit gap</span>
                        </div>
                      </div>
                    </div>
                  </div>
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

          {/* Tree Map & Hierarchical Visualizations */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Hierarchical Performance Analysis</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Performance Tree Map */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Layers className="h-5 w-5" />
                    <span>Performance Tree Map</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-50 rounded-lg p-2">
                    <div className="grid grid-cols-4 grid-rows-4 h-full gap-1">
                      {/* Large performance areas */}
                      <div className="col-span-2 row-span-2 bg-green-500 rounded flex items-center justify-center text-white font-bold">
                        <div className="text-center">
                          <div className="text-lg">Attack</div>
                          <div className="text-sm">85%</div>
                        </div>
                      </div>
                      <div className="col-span-2 row-span-1 bg-blue-500 rounded flex items-center justify-center text-white font-bold">
                        <div className="text-center">
                          <div className="text-sm">Defense</div>
                          <div className="text-xs">78%</div>
                        </div>
                      </div>
                      <div className="col-span-1 row-span-1 bg-purple-500 rounded flex items-center justify-center text-white font-bold text-xs">
                        Fitness<br/>92%
                      </div>
                      <div className="col-span-1 row-span-1 bg-orange-500 rounded flex items-center justify-center text-white font-bold text-xs">
                        Mental<br/>76%
                      </div>
                      <div className="col-span-2 row-span-1 bg-yellow-500 rounded flex items-center justify-center text-white font-bold">
                        <div className="text-center">
                          <div className="text-sm">Transitions</div>
                          <div className="text-xs">72%</div>
                        </div>
                      </div>
                      <div className="col-span-1 row-span-1 bg-red-500 rounded flex items-center justify-center text-white font-bold text-xs">
                        Pressure<br/>65%
                      </div>
                      <div className="col-span-1 row-span-1 bg-indigo-500 rounded flex items-center justify-center text-white font-bold text-xs">
                        Tactics<br/>80%
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-gray-600">
                    Size represents impact on game outcome. Color intensity shows performance level.
                  </div>
                </CardContent>
              </Card>

              {/* Candlestick Performance Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Performance Candlestick Analysis</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-50 rounded-lg p-4">
                    <svg width="100%" height="100%">
                      {[
                        { x: 40, open: 60, close: 80, high: 85, low: 55, positive: true },
                        { x: 80, open: 80, close: 75, high: 85, low: 70, positive: false },
                        { x: 120, open: 75, close: 90, high: 95, low: 72, positive: true },
                        { x: 160, open: 90, close: 85, high: 92, low: 80, positive: false },
                        { x: 200, open: 85, close: 95, high: 98, low: 82, positive: true },
                        { x: 240, open: 95, close: 88, high: 96, low: 85, positive: false }
                      ].map((candle, index) => {
                        const scaledHigh = 200 - (candle.high * 2);
                        const scaledLow = 200 - (candle.low * 2);
                        const scaledOpen = 200 - (candle.open * 2);
                        const scaledClose = 200 - (candle.close * 2);
                        
                        return (
                          <g key={index}>
                            {/* High-Low line */}
                            <line
                              x1={candle.x}
                              y1={scaledHigh}
                              x2={candle.x}
                              y2={scaledLow}
                              stroke="#64748b"
                              strokeWidth="1"
                            />
                            
                            {/* Open-Close body */}
                            <rect
                              x={candle.x - 8}
                              y={Math.min(scaledOpen, scaledClose)}
                              width="16"
                              height={Math.abs(scaledOpen - scaledClose)}
                              fill={candle.positive ? "#10b981" : "#ef4444"}
                              stroke={candle.positive ? "#059669" : "#dc2626"}
                              strokeWidth="1"
                            />
                            
                            {/* Game labels */}
                            <text
                              x={candle.x}
                              y="230"
                              textAnchor="middle"
                              className="text-xs fill-gray-600"
                            >
                              G{index + 1}
                            </text>
                          </g>
                        );
                      })}
                      
                      {/* Performance scale */}
                      {[50, 60, 70, 80, 90].map((value, index) => (
                        <g key={index}>
                          <line
                            x1="20"
                            y1={200 - (value * 2)}
                            x2="260"
                            y2={200 - (value * 2)}
                            stroke="#e5e7eb"
                            strokeWidth="1"
                            strokeDasharray="2,2"
                          />
                          <text
                            x="15"
                            y={205 - (value * 2)}
                            textAnchor="end"
                            className="text-xs fill-gray-500"
                          >
                            {value}%
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="font-medium mb-2">Legend</div>
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span>Performance gained</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded"></div>
                        <span>Performance lost</span>
                      </div>
                    </div>
                    <div>
                      <div className="font-medium mb-2">Analysis</div>
                      <div className="text-gray-600 space-y-1">
                        <div>• Volatile Q2 performance</div>
                        <div>• Strong recovery pattern</div>
                        <div>• Consistent high peaks</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 3D Position Analysis */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Grid3X3 className="h-5 w-5" />
                  <span>3D Position Performance Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Multi-Dimensional Position Mapping</h4>
                    <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 relative overflow-hidden">
                      <svg width="100%" height="100%" className="absolute inset-0">
                        {/* 3D-style court representation */}
                        <defs>
                          <linearGradient id="courtGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#e0f2fe" />
                            <stop offset="100%" stopColor="#f3e8ff" />
                          </linearGradient>
                        </defs>
                        
                        {/* Court outline with perspective */}
                        <polygon
                          points="50,50 250,30 280,180 20,200"
                          fill="url(#courtGradient)"
                          stroke="#64748b"
                          strokeWidth="2"
                          opacity="0.8"
                        />
                        
                        {/* Position performance bubbles with 3D effect */}
                        {[
                          { x: 80, y: 80, size: 25, performance: 92, position: "GS", color: "#ef4444" },
                          { x: 140, y: 75, size: 20, performance: 85, position: "GA", color: "#f97316" },
                          { x: 180, y: 110, size: 30, performance: 88, position: "WA", color: "#eab308" },
                          { x: 160, y: 140, size: 35, performance: 90, position: "C", color: "#22c55e" },
                          { x: 120, y: 165, size: 28, performance: 78, position: "WD", color: "#3b82f6" },
                          { x: 80, y: 180, size: 25, performance: 82, position: "GD", color: "#8b5cf6" },
                          { x: 50, y: 190, size: 22, performance: 86, position: "GK", color: "#ec4899" }
                        ].map((pos, index) => (
                          <g key={index}>
                            {/* Shadow for 3D effect */}
                            <circle
                              cx={pos.x + 3}
                              cy={pos.y + 3}
                              r={pos.size}
                              fill="rgba(0,0,0,0.2)"
                            />
                            {/* Main position bubble */}
                            <circle
                              cx={pos.x}
                              cy={pos.y}
                              r={pos.size}
                              fill={pos.color}
                              opacity="0.8"
                              stroke="white"
                              strokeWidth="2"
                            />
                            {/* Performance indicator */}
                            <circle
                              cx={pos.x}
                              cy={pos.y}
                              r={pos.size * 0.6}
                              fill="none"
                              stroke="white"
                              strokeWidth="2"
                              strokeDasharray={`${(pos.performance / 100) * (pos.size * 3.14 * 1.2)} ${pos.size * 3.14 * 1.2}`}
                              transform={`rotate(-90 ${pos.x} ${pos.y})`}
                            />
                            {/* Position label */}
                            <text
                              x={pos.x}
                              y={pos.y + 4}
                              textAnchor="middle"
                              className="text-white font-bold text-xs"
                            >
                              {pos.position}
                            </text>
                            {/* Performance text */}
                            <text
                              x={pos.x}
                              y={pos.y - 35}
                              textAnchor="middle"
                              className="text-gray-700 font-medium text-xs"
                            >
                              {pos.performance}%
                            </text>
                          </g>
                        ))}
                        
                        {/* Connection lines showing player interactions */}
                        <line x1="80" y1="80" x2="140" y2="75" stroke="#64748b" strokeWidth="2" opacity="0.6" />
                        <line x1="140" y1="75" x2="180" y2="110" stroke="#64748b" strokeWidth="2" opacity="0.6" />
                        <line x1="180" y1="110" x2="160" y2="140" stroke="#64748b" strokeWidth="2" opacity="0.6" />
                        <line x1="160" y1="140" x2="120" y2="165" stroke="#64748b" strokeWidth="3" opacity="0.7" />
                        <line x1="120" y1="165" x2="80" y2="180" stroke="#64748b" strokeWidth="2" opacity="0.6" />
                        <line x1="80" y1="180" x2="50" y2="190" stroke="#64748b" strokeWidth="2" opacity="0.6" />
                      </svg>
                    </div>
                    <div className="text-xs text-gray-600">
                      Bubble size = court influence. Position = average game location. Color = position type.
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Advanced Position Metrics</h4>
                    <div className="space-y-3">
                      {[
                        { position: "GS", metrics: { efficiency: 92, positioning: 88, pressure: 75, connection: 85 } },
                        { position: "GA", metrics: { efficiency: 85, positioning: 90, pressure: 78, connection: 88 } },
                        { position: "WA", metrics: { efficiency: 78, positioning: 85, pressure: 82, connection: 92 } },
                        { position: "C", metrics: { efficiency: 88, positioning: 95, pressure: 85, connection: 95 } },
                        { position: "WD", metrics: { efficiency: 82, positioning: 78, pressure: 88, connection: 85 } },
                        { position: "GD", metrics: { efficiency: 85, positioning: 88, pressure: 90, connection: 80 } },
                        { position: "GK", metrics: { efficiency: 90, positioning: 92, pressure: 85, connection: 75 } }
                      ].map((pos, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-sm">{pos.position}</span>
                            <div className="text-xs text-gray-500">
                              Avg: {Math.round((pos.metrics.efficiency + pos.metrics.positioning + pos.metrics.pressure + pos.metrics.connection) / 4)}%
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {Object.entries(pos.metrics).map(([metric, value]) => (
                              <div key={metric} className="flex items-center space-x-1">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: `hsl(${value * 1.2}, 70%, 60%)` }}></div>
                                <span className="capitalize">{metric}: {value}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Multi-Layer Control Dashboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="h-5 w-5" />
                  <span>Multi-Layer Analytics Control Center</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Control Panel */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                    {[
                      { label: "Time Frame", options: ["Last 5 Games", "Season", "All Time"], active: "Season" },
                      { label: "Metric Type", options: ["Performance", "Physical", "Mental"], active: "Performance" },
                      { label: "Comparison", options: ["Team", "League", "Historical"], active: "League" },
                      { label: "Analysis", options: ["Individual", "Position", "Collective"], active: "Position" }
                    ].map((control, index) => (
                      <div key={index} className="space-y-2">
                        <label className="text-sm font-medium">{control.label}</label>
                        <select className="w-full text-xs p-2 border rounded">
                          {control.options.map((option, optIndex) => (
                            <option key={optIndex} selected={option === control.active}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>

                  {/* Dynamic Visualization Area */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Layer 1: Summary Cards */}
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">Key Performance Indicators</h5>
                      {[
                        { metric: "Overall Rating", value: 85, change: "+3", positive: true },
                        { metric: "Consistency", value: 78, change: "-1", positive: false },
                        { metric: "Peak Performance", value: 94, change: "+8", positive: true },
                        { metric: "Under Pressure", value: 72, change: "+5", positive: true }
                      ].map((kpi, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                          <span className="text-sm">{kpi.metric}</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold">{kpi.value}%</span>
                            <span className={`text-xs ${kpi.positive ? 'text-green-600' : 'text-red-600'}`}>
                              {kpi.change}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Layer 2: Trend Analysis */}
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">Trend Analysis</h5>
                      <div className="h-32 bg-white rounded border p-2">
                        <svg width="100%" height="100%">
                          <polyline
                            points="10,80 30,70 50,60 70,75 90,65 110,55 130,60 150,50"
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="2"
                          />
                          <polyline
                            points="10,90 30,85 50,80 70,85 90,90 110,85 130,80 150,75"
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth="2"
                          />
                        </svg>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Week 1</span>
                        <span>Week 8</span>
                      </div>
                    </div>

                    {/* Layer 3: Predictive Insights */}
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">Predictive Insights</h5>
                      <div className="space-y-2">
                        {[
                          { prediction: "Performance will improve", confidence: 85, color: "text-green-600" },
                          { prediction: "Risk of fatigue building", confidence: 72, color: "text-yellow-600" },
                          { prediction: "Strong end-season finish", confidence: 78, color: "text-blue-600" }
                        ].map((pred, index) => (
                          <div key={index} className={`p-2 bg-white rounded border border-l-4 ${
                            pred.color.includes('green') ? 'border-l-green-500' :
                            pred.color.includes('yellow') ? 'border-l-yellow-500' : 'border-l-blue-500'
                          }`}>
                            <div className="text-sm">{pred.prediction}</div>
                            <div className="text-xs text-gray-500">
                              Confidence: {pred.confidence}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Items */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h5 className="font-medium text-blue-800 mb-3">Recommended Actions</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { action: "Increase midcourt training", priority: "High", timeline: "This week" },
                        { action: "Review defensive rotations", priority: "Medium", timeline: "Next 2 weeks" },
                        { action: "Mental conditioning focus", priority: "High", timeline: "Ongoing" },
                        { action: "Player rest rotation", priority: "Medium", timeline: "Next game" }
                      ].map((action, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-white rounded">
                          <div>
                            <div className="text-sm font-medium">{action.action}</div>
                            <div className="text-xs text-gray-500">{action.timeline}</div>
                          </div>
                          <Badge variant={action.priority === 'High' ? 'default' : 'secondary'} className="text-xs">
                            {action.priority}
                          </Badge>
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
