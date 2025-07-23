import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { Landmark } from "lucide-react";

export default function PlayerClubsCard({ playerId }: { playerId: number }) {
  const { data, isLoading } = useQuery({
    queryKey: [`/api/players/${playerId}/clubs`],
    queryFn: () => apiClient.get(`/api/players/${playerId}/clubs`),
    enabled: !!playerId,
  });
  const clubs: any[] = Array.isArray(data) ? data : [];
  return (
    <div className="mb-6 bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
      <h3 className="text-xl font-bold mb-4 text-blue-700 flex items-center gap-2"><Landmark className="w-5 h-5" />Clubs</h3>
      {isLoading ? (
        <div>Loading clubs...</div>
      ) : clubs.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {clubs.map((club: any) => (
            <div key={club.id} className="flex items-center gap-2 bg-blue-50 rounded-xl p-3 shadow-sm border border-blue-100 min-w-[120px]">
              <Landmark className="w-4 h-4 text-blue-500" />
              <span className="font-semibold text-blue-900">{club.name}</span>
            </div>
          ))}
        </div>
      ) : (
        <div>No clubs found.</div>
      )}
    </div>
  );
} 