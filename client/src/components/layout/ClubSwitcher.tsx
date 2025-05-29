
import React from 'react';
import { useClub } from '@/contexts/ClubContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Building2, ChevronDown } from 'lucide-react';

export function ClubSwitcher() {
  const { currentClub, userClubs, switchClub, isLoading } = useClub();

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Building2 className="w-4 h-4 mr-2" />
        Loading...
      </Button>
    );
  }

  if (!currentClub || userClubs.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="justify-between min-w-[200px]">
          <div className="flex items-center">
            <Building2 className="w-4 h-4 mr-2" />
            <span className="truncate">{currentClub.name}</span>
          </div>
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[300px]">
        <DropdownMenuLabel>Switch Club</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {userClubs.map((club) => (
          <DropdownMenuItem
            key={club.clubId}
            onClick={() => switchClub(club.clubId)}
            className="flex items-center justify-between p-3"
          >
            <div className="flex flex-col">
              <span className="font-medium">{club.clubName}</span>
              <span className="text-sm text-muted-foreground">{club.clubCode}</span>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge variant={club.clubId === currentClub.id ? "default" : "secondary"}>
                {club.role}
              </Badge>
              {club.clubId === currentClub.id && (
                <span className="text-xs text-muted-foreground">Active</span>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
