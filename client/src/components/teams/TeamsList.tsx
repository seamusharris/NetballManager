
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Users } from 'lucide-react';
import { Team } from '@shared/schema';

interface TeamsListProps {
  teams: (Team & { seasonName?: string; seasonYear?: number })[];
  onEdit: (team: Team) => void;
  onDelete: (teamId: number) => void;
  onManagePlayers: (teamId: number) => void;
  isLoading?: boolean;
}

export function TeamsList({ teams, onEdit, onDelete, onManagePlayers, isLoading }: TeamsListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">No teams found. Create your first team to get started.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {teams.map((team) => (
        <Card key={team.id} className={!team.isActive ? 'opacity-60' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{team.name}</span>
              {!team.isActive && <Badge variant="secondary">Inactive</Badge>}
            </CardTitle>
            {team.division && (
              <p className="text-sm text-gray-600">{team.division}</p>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Season: {team.seasonName || 'No Season'} ({team.seasonYear || 'N/A'})
              </p>
              
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onManagePlayers(team.id)}
                  className="flex-1"
                >
                  <Users className="w-4 h-4 mr-1" />
                  Players
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(team)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(team.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
