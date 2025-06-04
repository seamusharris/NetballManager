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
  const { currentClub, currentClubId, userClubs, switchClub, isLoading } = useClub();

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Building2 className="w-4 h-4 mr-2" />
        Loading...
      </Button>
    );
  }

  if (!userClubs || userClubs.length === 0) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Building2 className="w-4 h-4 mr-2" />
        No clubs
      </Button>
    );
  }

  // Find the current club from userClubs data or fall back to first club
  // Use the currentClubId from context to find the right club

  const currentUserClub = userClubs.find(club => 
    club.clubId === (currentClub?.id || currentClubId)
  );

  const displayClub = currentUserClub ? {
    id: currentUserClub.clubId,
    name: currentUserClub.clubName,
    code: currentUserClub.clubCode
  } : userClubs.length > 0 ? {
    id: userClubs[0].clubId,
    name: userClubs[0].clubName,
    code: userClubs[0].clubCode
  } : null;

  if (!displayClub) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Building2 className="w-4 h-4 mr-2" />
        No clubs
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="justify-between min-w-[200px]">
          <div className="flex items-center">
            <Building2 className="w-4 h-4 mr-2" />
            <span className="truncate">{displayClub.name}</span>
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
            onClick={() => {
              console.log('Switching to club:', club.clubId, club.clubName);
              switchClub(club.clubId);
            }}
            className="flex items-center justify-between p-3"
          >
            <div className="flex flex-col">
              <span className="font-medium">{club.clubName}</span>
              <span className="text-sm text-muted-foreground">{club.clubCode}</span>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge variant={club.clubId === displayClub.id ? "default" : "secondary"}>
                {club.role}
              </Badge>
              {club.clubId === displayClub.id && (
                <span className="text-xs text-muted-foreground">Active</span>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}