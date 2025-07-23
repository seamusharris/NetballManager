import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { Users, Shield } from "lucide-react";

export default function PlayerTeamsCard({ playerId }: { playerId: number }) {
  const { data, isLoading } = useQuery({
    queryKey: [`/api/players/${playerId}/teams`],
    queryFn: () => apiClient.get(`/api/players/${playerId}/teams`),
    enabled: !!playerId,
  });
  const teams: any[] = Array.isArray(data) ? data : [];
  return (
    <div className="mb-6 bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
      <h3 className="text-xl font-bold mb-4 text-purple-700 flex items-center gap-2"><Users className="w-5 h-5" />Teams</h3>
      {isLoading ? (
        <div>Loading teams...</div>
      ) : teams.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {teams.map((team: any) => (
            <div key={team.id} className="flex flex-col items-start bg-purple-50 rounded-xl p-3 shadow-sm border border-purple-100 min-w-[160px]">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-purple-500" />
                <span className="font-semibold text-purple-900">{team.name}</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-semibold">{team.seasonName}</span>
                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-semibold">{team.clubName}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>No teams found.</div>
      )}
    </div>
  );
} 