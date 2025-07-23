import React from "react";
import { Trophy, Shield, XCircle, Repeat, ArrowUpRight, ArrowDownLeft, RefreshCw, Hand, AlertTriangle, Star } from "lucide-react";

const statIcons: Record<string, React.ReactNode> = {
  goalsFor: <Trophy className="w-5 h-5 text-primary" />, // Offensive
  goalsAgainst: <Shield className="w-5 h-5 text-blue-500" />, // Defensive
  missedGoals: <XCircle className="w-5 h-5 text-red-500" />,
  rebounds: <Repeat className="w-5 h-5 text-amber-500" />,
  intercepts: <ArrowUpRight className="w-5 h-5 text-green-500" />,
  deflections: <ArrowDownLeft className="w-5 h-5 text-cyan-500" />,
  turnovers: <RefreshCw className="w-5 h-5 text-rose-500" />,
  gains: <Hand className="w-5 h-5 text-lime-500" />,
  receives: <Hand className="w-5 h-5 text-indigo-500" />,
  penalties: <AlertTriangle className="w-5 h-5 text-orange-500" />,
  rating: <Star className="w-5 h-5 text-yellow-500" />,
};

const statLabels: Record<string, string> = {
  goalsFor: "Goals For",
  goalsAgainst: "Goals Against",
  missedGoals: "Missed Goals",
  rebounds: "Rebounds",
  intercepts: "Intercepts",
  deflections: "Deflections",
  turnovers: "Turnovers",
  gains: "Gains",
  receives: "Receives",
  penalties: "Penalties",
  rating: "Rating",
};

const statOrder = [
  "goalsFor", "goalsAgainst", "missedGoals", "rebounds", "intercepts",
  "deflections", "turnovers", "gains", "receives", "penalties", "rating"
];

export default function PlayerSeasonStatsCard({ playerStats, isLoading }: { playerStats: any, isLoading: boolean }) {
  return (
    <div className="mb-6 bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
      <h3 className="text-xl font-bold mb-4 text-primary">Season Statistics</h3>
      {isLoading ? (
        <div>Loading stats...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {statOrder.map((key) => (
            <div key={key} className="flex flex-col items-center bg-gray-50 rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="mb-2">{statIcons[key]}</div>
              <div className="text-lg font-semibold">{playerStats?.overall?.[key] ?? 0}</div>
              <div className="text-xs text-gray-500 mt-1">{statLabels[key]}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 