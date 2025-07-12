
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

      // Parse CSV line (handle quoted values)
      const columns = line.split(',').map(col => col.replace(/^"|"$/g, '').trim());
      
      const round = columns[0]; // Round number
      const date = columns[1];  // Date for all games in this round

      // Process games starting from column 2: homeTeam, awayTeam, matchId pattern
      for (let j = 2; j < columns.length; j += 3) {
        if (j + 2 < columns.length) {
          const homeTeam = columns[j];     // Home team
          const awayTeam = columns[j + 1]; // Away team  
          const matchIdText = columns[j + 2]; // Match ID
          
          // Skip if we don't have complete data
          if (!homeTeam || !awayTeam || !matchIdText) continue;

          const isBye = homeTeam.toLowerCase() === 'bye' || awayTeam.toLowerCase() === 'bye';
          
          games.push({
            round,
            date: formatDate(date),
            homeTeam: homeTeam === 'Bye' ? awayTeam : homeTeam,
            awayTeam: awayTeam === 'Bye' ? null : awayTeam,
            matchId: matchIdText,
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

  const findTeamByName = (teamName: string) => {
    if (!teamName || teamName.toLowerCase() === 'bye') return null;
    
    return clubTeams.find(team => 
      team.name.toLowerCase().includes(teamName.toLowerCase()) ||
      teamName.toLowerCase().includes(team.name.toLowerCase())
    );
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
              notes: `Imported from CSV - ${game.matchId}`
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
            <div className="max-h-60 overflow-y-auto border rounded p-2 space-y-1">
              {previewData.map((game, index) => (
                <div key={index} className="text-sm">
                  <span className="font-medium">{game.round}</span> - {game.date}: 
                  <span className={game.isBye ? "text-gray-500 italic" : ""}>
                    {game.homeTeam} {game.awayTeam ? `vs ${game.awayTeam}` : '(BYE)'}
                  </span>
                </div>
              ))}
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
