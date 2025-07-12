import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/apiClient';
import { useClub } from '@/contexts/ClubContext';

interface ParsedGame {
  round: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  matchId: string;
  isBye: boolean;
}

interface ImportStats {
  gamesCreated: number;
  gamesSkipped: number;
  errors: string[];
}

export function FixtureImporter() {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importStats, setImportStats] = useState<ImportStats | null>(null);
  const [previewData, setPreviewData] = useState<ParsedGame[]>([]);
  const { toast } = useToast();
  const { currentClub, clubTeams } = useClub();

  const parseCSV = (csvText: string): ParsedGame[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    const games: ParsedGame[] = [];

    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      // Parse CSV line with proper CSV parsing (handle quoted values with commas)
      const columns = [];
      let current = '';
      let inQuotes = false;

      for (let k = 0; k < line.length; k++) {
        const char = line[k];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          columns.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      columns.push(current.trim()); // Don't forget the last column

      // Remove quotes from columns that were quoted
      const cleanColumns = columns.map(col => col.replace(/^"|"$/g, ''));

      const round = cleanColumns[0]; // Round number
      const date = cleanColumns[1];  // Date for all games in this round

      // Process games starting from column 2: homeTeam, awayTeam, matchId pattern
      for (let j = 2; j < cleanColumns.length; j += 3) {
        if (j + 2 < cleanColumns.length) {
          const homeTeam = cleanColumns[j];     // Home team
          const awayTeam = cleanColumns[j + 1]; // Away team  
          const matchIdText = cleanColumns[j + 2]; // Match ID

          // Skip if we don't have complete data or empty values
          if (!homeTeam || !awayTeam || !matchIdText || 
              homeTeam.trim() === '' || awayTeam.trim() === '' || matchIdText.trim() === '') {
            continue;
          }

          const isBye = homeTeam.toLowerCase() === 'bye' || awayTeam.toLowerCase() === 'bye';

          // Extract NetballConnect match ID (remove "Match ID: " prefix)
          const netballConnectId = matchIdText.match(/Match ID:\s*(\d+)/)?.[1] || matchIdText;

          games.push({
            round,
            date: formatDate(date),
            homeTeam: homeTeam === 'Bye' ? awayTeam : homeTeam,
            awayTeam: awayTeam === 'Bye' ? null : awayTeam,
            matchId: netballConnectId,
            isBye
          });
        }
      }
    }

    return games;
  };

  const formatDate = (dateStr: string): string => {
    // Convert "Sat, Jul 26, 2025" to "2025-07-26"
    try {
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    } catch {
      return dateStr;
    }
  };

  const parseTeamInfo = (fullTeamName: string) => {
    if (!fullTeamName || fullTeamName.toLowerCase() === 'bye') {
      return { clubName: '', teamName: '', fullName: fullTeamName };
    }

    // Split by spaces and take the last word as team name, rest as club name
    const parts = fullTeamName.trim().split(/\s+/);
    if (parts.length === 1) {
      return { clubName: '', teamName: parts[0], fullName: fullTeamName };
    }

    const teamName = parts[parts.length - 1];
    const clubName = parts.slice(0, -1).join(' ');
    
    return { clubName, teamName, fullName: fullTeamName };
  };

  const findTeamByName = (fullTeamName: string) => {
    if (!fullTeamName || fullTeamName.toLowerCase() === 'bye') return null;

    const { clubName, teamName } = parseTeamInfo(fullTeamName);

    // Try exact match first
    let matchedTeam = clubTeams.find(team => 
      team.name.toLowerCase() === teamName.toLowerCase()
    );

    // If no exact match, try partial matches
    if (!matchedTeam) {
      matchedTeam = clubTeams.find(team => 
        team.name.toLowerCase().includes(teamName.toLowerCase()) ||
        teamName.toLowerCase().includes(team.name.toLowerCase())
      );
    }

    return matchedTeam;
  };

  const getTeamMatchStatus = (fullTeamName: string) => {
    if (!fullTeamName || fullTeamName.toLowerCase() === 'bye') {
      return { status: 'bye', message: 'BYE' };
    }

    const existingTeam = findTeamByName(fullTeamName);
    const { clubName, teamName } = parseTeamInfo(fullTeamName);
    
    if (existingTeam) {
      return { 
        status: 'matched', 
        message: `✓ Matches "${existingTeam.name}"`,
        team: existingTeam
      };
    } else {
      return { 
        status: 'new', 
        message: `⚠ New team needed: Club "${clubName}", Team "${teamName}"`,
        clubName,
        teamName
      };
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);

      // Parse and preview the file
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        try {
          const parsed = parseCSV(text);
          setPreviewData(parsed.slice(0, 10)); // Show first 10 games for preview
        } catch (error) {
          toast({
            title: "Parse Error",
            description: "Failed to parse CSV file. Please check the format.",
            variant: "destructive"
          });
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!file || !currentClub) return;

    setIsImporting(true);
    const stats: ImportStats = { gamesCreated: 0, gamesSkipped: 0, errors: [] };

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        const games = parseCSV(text);

        for (const game of games) {
          try {
            let homeTeamId: number | null = null;
            let awayTeamId: number | null = null;

            // Find team IDs
            if (game.isBye) {
              const team = findTeamByName(game.homeTeam);
              if (team) {
                homeTeamId = team.id;
                awayTeamId = null; // BYE games have no away team
              } else {
                stats.errors.push(`Team not found: ${game.homeTeam}`);
                stats.gamesSkipped++;
                continue;
              }
            } else {
              const homeTeam = findTeamByName(game.homeTeam);
              const awayTeam = findTeamByName(game.awayTeam);

              if (!homeTeam || !awayTeam) {
                stats.errors.push(`Teams not found: ${game.homeTeam} vs ${game.awayTeam}`);
                stats.gamesSkipped++;
                continue;
              }

              homeTeamId = homeTeam.id;
              awayTeamId = awayTeam.id;
            }

            // Create the game
            const gameData = {
              date: game.date,
              time: "14:00", // Default time
              homeTeamId,
              awayTeamId,
              round: game.round,
              statusId: game.isBye ? 6 : 1, // BYE or upcoming
              seasonId: 1, // Default to current season
              venue: game.isBye ? null : "TBD",
              notes: `Imported from CSV - NetballConnect ID: ${game.matchId}`
            };

            await apiClient.post('/api/games', gameData);
            stats.gamesCreated++;
          } catch (error) {
            stats.errors.push(`Failed to create game: ${game.homeTeam} vs ${game.awayTeam} - ${error.message}`);
            stats.gamesSkipped++;
          }
        }

        setImportStats(stats);
        setIsImporting(false);

        toast({
          title: "Import Complete",
          description: `Created ${stats.gamesCreated} games, skipped ${stats.gamesSkipped}`,
          variant: stats.errors.length > 0 ? "destructive" : "default"
        });
      };

      reader.readAsText(file);
    } catch (error) {
      setIsImporting(false);
      toast({
        title: "Import Failed",
        description: "An error occurred during import",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Fixtures from CSV</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            disabled={isImporting}
          />
        </div>

        {previewData.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Preview (first 10 games):</h4>
            <div className="max-h-80 overflow-y-auto border rounded p-3 space-y-3">
              {previewData.map((game, index) => {
                const homeTeamStatus = getTeamMatchStatus(game.homeTeam);
                const awayTeamStatus = game.awayTeam ? getTeamMatchStatus(game.awayTeam) : null;
                
                return (
                  <div key={index} className="text-sm border-b pb-2 last:border-b-0">
                    <div className="font-medium text-blue-600 mb-1">
                      {game.round} - {game.date} - NetballConnect ID: {game.matchId}
                    </div>
                    
                    <div className="space-y-1 ml-2">
                      <div className="flex items-start gap-2">
                        <span className="text-gray-600 min-w-[60px]">Home:</span>
                        <div>
                          <div className="font-medium">{game.homeTeam}</div>
                          <div className={`text-xs ${
                            homeTeamStatus.status === 'matched' ? 'text-green-600' : 
                            homeTeamStatus.status === 'new' ? 'text-orange-600' : 'text-gray-500'
                          }`}>
                            {homeTeamStatus.message}
                          </div>
                        </div>
                      </div>
                      
                      {game.awayTeam && awayTeamStatus && (
                        <div className="flex items-start gap-2">
                          <span className="text-gray-600 min-w-[60px]">Away:</span>
                          <div>
                            <div className="font-medium">{game.awayTeam}</div>
                            <div className={`text-xs ${
                              awayTeamStatus.status === 'matched' ? 'text-green-600' : 
                              awayTeamStatus.status === 'new' ? 'text-orange-600' : 'text-gray-500'
                            }`}>
                              {awayTeamStatus.message}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {game.isBye && (
                        <div className="text-gray-500 italic text-xs ml-[68px]">
                          This is a BYE round
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
              <div className="font-medium mb-1">Legend:</div>
              <div className="space-y-1">
                <div><span className="text-green-600">✓</span> Team found and will be matched</div>
                <div><span className="text-orange-600">⚠</span> New team will need to be created</div>
              </div>
            </div>
          </div>
        )}

        {importStats && (
          <Alert>
            <AlertDescription>
              Import completed: {importStats.gamesCreated} games created, {importStats.gamesSkipped} skipped
              {importStats.errors.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-red-600">
                    {importStats.errors.length} errors (click to expand)
                  </summary>
                  <ul className="mt-1 text-sm space-y-1">
                    {importStats.errors.map((error, index) => (
                      <li key={index} className="text-red-600">• {error}</li>
                    ))}
                  </ul>
                </details>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={handleImport} 
            disabled={!file || isImporting || !currentClub}
            className="flex-1"
          >
            {isImporting ? "Importing..." : "Import Fixtures"}
          </Button>
        </div>

        <div className="text-sm text-gray-600">
          <p><strong>Expected CSV format:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Header row with column names</li>
            <li>Each row represents one round with multiple games</li>
            <li>Column 1: Round number (e.g., "Round 1")</li>
            <li>Column 2: Date for all games in that round</li>
            <li>Columns 3+: Repeating pattern of Home Team, Away Team, Match ID</li>
            <li>Use "Bye" for bye rounds</li>
            <li>Team names should match existing teams in your club</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}