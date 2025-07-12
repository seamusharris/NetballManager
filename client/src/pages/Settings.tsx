import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { TEAM_NAME, TEAM_SHORT_NAME, TIMEZONE, COMMON_TIMEZONES } from '@/lib/settings';
import BackButton from '@/components/ui/back-button';
import { 
  Download, 
  Upload, 
  Database, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Trash2,
  BarChart3,
  TrendingUp,
  Clock,
  Target,
  Calendar,
  Users
} from "lucide-react";
import { exportAllData, importData } from "@/lib/dataExportImport";
import { createFlourishExporter, downloadCSV } from '@/lib/flourishDataExporter';
import { queryClient } from '@/lib/queryClient';
import { apiClient } from '@/lib/apiClient';
import { GameStatusManager } from '@/components/settings/GameStatusManager';
import { FixtureImporter } from '@/components/settings/FixtureImporter';
import { useClub } from '@/contexts/ClubContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SectionManager from '@/components/sections/SectionManager';
import SeasonsManager from '@/components/seasons/SeasonsManager';
import { useQuery } from '@tanstack/react-query';

export default function Settings() {
  const { toast } = useToast();
  const [timezone, setTimezone] = useState(TIMEZONE);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [importStats, setImportStats] = useState<{
    playersImported: number;
    opponentsImported: number;
    gamesImported: number;
    rostersImported: number;
    statsImported: number;
    clubsImported?: number;
    seasonsImported?: number;
    gameStatusesImported?: number;
    teamsImported?: number;
    clubPlayersImported?: number;
    teamPlayersImported?: number;
    playerAvailabilityImported?: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { currentClubId, currentTeamId, currentTeamName } = useClub();

  // Fetch active season directly
  const { data: activeSeason } = useQuery<any>({
    queryKey: ['/api/seasons/active', currentClubId],
    queryFn: () => apiClient.get('/api/seasons/active'),
    enabled: !!currentClubId,
  });

  // Get current browser timezone
  const getBrowserTimezone = () => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  };

  // Format timezone for display
  const formatTimezone = (tz: string) => {
    try {
      // Get current time in the timezone
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { 
        timeZone: tz,
        timeZoneName: 'short'
      };
      const tzPart = new Intl.DateTimeFormat('en-US', options)
        .formatToParts(now)
        .find(part => part.type === 'timeZoneName');

      // Format like "America/New_York (EST)"
      return `${tz} (${tzPart?.value || ''})`;
    } catch (e) {
      return tz;
    }
  };

  // This would normally save to backend, but for now we'll just update localStorage
  const saveSettings = () => {
    localStorage.setItem('app_timezone', timezone);

    toast({
      title: "Settings saved",
      description: "Your display preferences have been saved successfully.",
    });

    // Reload the page to apply the settings
    window.location.reload();
  };

  const handleExport = async () => {
    if (!currentClubId) {
      toast({
        title: "Export Failed",
        description: "No club selected. Please select a club before exporting.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsExporting(true);
      setError(null);

      console.log('Starting export for club:', currentClubId);

      // Export all data
      const { fileContents, filename } = await exportAllData();

      // Create and download file
      const blob = new Blob([fileContents], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `Your data has been exported to ${filename}`,
        variant: "default",
      });
    } catch (err) {
      console.error('Export failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Export failed due to an unknown error';
      setError(errorMessage);

      toast({
        title: "Export Failed",
        description: `There was a problem exporting your data: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    // Trigger file input click
    const fileInput = document.getElementById('import-file-input');
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    try {
      setIsImporting(true);
      setError(null);
      setImportStats(null);

      // Read file contents
      const fileContent = await readFileAsText(file);

      // Import the data
      const stats = await importData(fileContent);
      setImportStats(stats);

      // Show success toast
      toast({
        title: "Import Successful",
        description: `Imported ${stats.playersImported} players, ${stats.opponentsImported || 0} opponents, ${stats.gamesImported} games, ${stats.rostersImported} roster entries, and ${stats.statsImported} stat entries.`,
        variant: "default",
      });

      // Invalidate all queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['/api/players'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/opponents'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/games'] });

      // Reset file input
      event.target.value = '';
    } catch (err) {
      console.error('Import failed:', err);
      setError(err instanceof Error ? err.message : 'Import failed due to an unknown error');

      toast({
        title: "Import Failed",
        description: "There was a problem importing your data. Please check the file format.",
        variant: "destructive",
      });

      // Reset file input
      event.target.value = '';
    } finally {
      setIsImporting(false);
    }
  };

  // Helper function to read file content
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  };

  // Handle delete all data
  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
    setDeleteConfirmation('');
  };

  const handleDeleteAllData = async () => {
    if (deleteConfirmation !== 'DELETE') {
      return; // Don't proceed if confirmation text doesn't match
    }

    try {
      setIsDeleting(true);
      setError(null);

      // Create a backup first
      try {
        const backupResult = await exportAllData();
        console.log("Backup created before deletion:", backupResult.filename);

        toast({
          title: "Backup Created",
          description: `A backup of your data was created as "${backupResult.filename}" before deletion.`,
          variant: "default",
        });
      } catch (backupError) {
        console.error("Failed to create backup before deletion:", backupError);
        toast({
          title: "Backup Failed",
          description: "We couldn't create a backup before deletion. You may want to cancel and export your data manually first.",
          variant: "destructive",
        });
        setIsDeleting(false);
        return;
      }

      // Delete all players - this will cascade delete related records due to database constraints
      const players = await (await fetch('/api/players')).json();

      for (const player of players) {
        await fetch(`/api/players/${player.id}`, { method: 'DELETE' });
      }

      // Delete all opponents
      const opponents = await (await fetch('/api/opponents')).json();

      for (const opponent of opponents) {
        await fetch(`/api/opponents/${opponent.id}`, { method: 'DELETE' });
      }

      // Delete all games - this should also delete associated rosters and game stats
      const games = await (await fetch('/api/games')).json();

      // Delete all rosters and game stats first
      for (const game of games) {
        const rosters = await (await fetch(`/api/games/${game.id}/rosters`)).json();
        for (const roster of rosters) {
          await fetch(`/api/rosters/${roster.id}`, { method: 'DELETE' });
        }

        const stats = await (await fetch(`/api/games/${game.id}/stats`)).json();
        for (const stat of stats) {
          await fetch(`/api/games/${stat.gameId}/stats/${stat.id}`, { method: 'DELETE' });
        }

        // Now delete the game
        await fetch(`/api/games/${game.id}`, { method: 'DELETE' });
      }

      // Invalidate all queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['/api/players'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/opponents'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/games'] });

      toast({
        title: "Data Deleted",
        description: "All data has been successfully deleted from the system.",
        variant: "default",
      });

      // Close the dialog
      setShowDeleteDialog(false);
    } catch (err) {
      console.error('Delete failed:', err);
      setError(err instanceof Error ? err.message : 'Delete failed due to an unknown error');

      toast({
        title: "Delete Failed",
        description: "There was a problem deleting your data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportPlayers = async () => {
    if (!currentClubId) {
      toast({
        title: "Error",
        description: "No club selected",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsExporting(true);
      const players = await apiClient.get(`/api/clubs/${currentClubId}/players`);

      const csvContent = [
        ['Name', 'First Name', 'Last Name', 'Display Name', 'Avatar Color', 'Active'],
        ...players.map((player: any) => [
          player.name || '',
          player.firstName || '',
          player.lastName || '',
          player.displayName || '',
          player.avatarColor || '',
          player.active ? 'Yes' : 'No'
        ])
      ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `players-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Players exported successfully"
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "An error occurred during export",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getFlourishData = async () => {
    if (!currentClubId || !currentTeamId) {
      throw new Error('No club or team selected');
    }

    // First fetch games and players
    const [games, players] = await Promise.all([
      apiClient.get(`/api/teams/${currentTeamId}/games`),
      apiClient.get(`/api/clubs/${currentClubId}/players`)
    ]);

    // Extract game IDs from the games data
    const gameIds = games.map((game: any) => game.id);

    // Only fetch batch data if we have game IDs
    if (gameIds.length === 0) {
      return { games, players, stats: {}, scores: {}, rosters: {} };
    }

    // Now fetch batch data with actual game IDs
    const [stats, scores, rosters] = await Promise.all([
      apiClient.post(`/api/clubs/${currentClubId}/games/stats/batch`, { gameIds }),
      apiClient.post(`/api/clubs/${currentClubId}/games/scores/batch`, { gameIds }),
      apiClient.post(`/api/clubs/${currentClubId}/games/rosters/batch`, { gameIds })
    ]);

    return { games, players, stats, scores, rosters };
  };

  const handleExportTeamPerformance = async () => {
    try {
      setIsExporting(true);
      const { games, players, stats, scores, rosters } = await getFlourishData();

      const exporter = createFlourishExporter({
        games,
        stats,
        scores,
        players,
        rosters,
        teamName: currentTeamName || 'Team',
        currentTeamId: currentTeamId!
      });

      const csvContent = exporter.exportTeamPerformanceOverTime();
      downloadCSV(csvContent, `${currentTeamName || 'team'}-performance-timeline.csv`);

      toast({
        title: "Success",
        description: "Team performance data exported for Flourish bar chart race"
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "An error occurred during export",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportQuarterAnalysis = async () => {
    try {
      setIsExporting(true);
      const { games, players, stats, scores, rosters } = await getFlourishData();

      const exporter = createFlourishExporter({
        games,
        stats,
        scores,
        players,
        rosters,
        teamName: currentTeamName || 'Team',
        currentTeamId: currentTeamId!
      });

      const csvContent = exporter.exportQuarterPerformanceHeatmap();
      downloadCSV(csvContent, `${currentTeamName || 'team'}-quarter-analysis.csv`);

      toast({
        title: "Success",
        description: "Quarter analysis data exported for Flourish heatmap"
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "An error occurred during export",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPositionData = async () => {
    try {
      setIsExporting(true);
      const { games, players, stats, scores, rosters } = await getFlourishData();

      const exporter = createFlourishExporter({
        games,
        stats,
        scores,
        players,
        rosters,
        teamName: currentTeamName || 'Team',
        currentTeamId: currentTeamId!
      });

      const csvContent = exporter.exportPositionPerformance();
      downloadCSV(csvContent, `${currentTeamName || 'team'}-position-performance.csv`);

      toast({
        title: "Success",
        description: "Position performance data exported for Flourish radar chart"
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "An error occurred during export",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPlayerNetwork = async () => {
    try {
      setIsExporting(true);
      const { games, players, stats, scores, rosters } = await getFlourishData();

      const exporter = createFlourishExporter({
        games,
        stats,
        scores,
        players,
        rosters,
        teamName: currentTeamName || 'Team',
        currentTeamId: currentTeamId!
      });

      const csvContent = exporter.exportPlayerNetworkData();
      downloadCSV(csvContent, `${currentTeamName || 'team'}-player-network.csv`);

      toast({
        title: "Success",
        description: "Player network data exported for Flourish network diagram"
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "An error occurred during export",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportGameTimeline = async () => {
    try {
      setIsExporting(true);
      const { games, players, stats, scores, rosters } = await getFlourishData();

      const exporter = createFlourishExporter({
        games,
        stats,
        scores,
        players,
        rosters,
        teamName: currentTeamName || 'Team',
        currentTeamId: currentTeamId!
      });

      const csvContent = exporter.exportGameTimeline();
      downloadCSV(csvContent, `${currentTeamName || 'team'}-game-timeline.csv`);

      toast({
        title: "Success",
        description: "Game timeline data exported for Flourish timeline chart"
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "An error occurred during export",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container py-8 mx-auto">
      <Helmet>
        <title>Application Settings | Netball Stats Tracker</title>
      </Helmet>

      <div className="mb-6">
        <BackButton fallbackPath="/dashboard" className="mb-4">
          Back to Dashboard
        </BackButton>
        <h1 className="text-2xl font-bold">Application Settings</h1>
        <p className="text-gray-500">Configure your application preferences and data management</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {importStats && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle>Import Successful</AlertTitle>
          <AlertDescription>
            <p>Successfully imported:</p>
            <div className="grid grid-cols-2 gap-x-6 mt-2">
              <ul className="list-disc pl-6">
                {importStats.clubsImported && importStats.clubsImported > 0 && <li>{importStats.clubsImported} clubs</li>}
                {importStats.seasonsImported && importStats.seasonsImported > 0 && <li>{importStats.seasonsImported} seasons</li>}
                {importStats.gameStatusesImported && importStats.gameStatusesImported > 0 && <li>{importStats.gameStatusesImported} game statuses</li>}
                {importStats.teamsImported && importStats.teamsImported > 0 && <li>{importStats.teamsImported} teams</li>}
                <li>{importStats.playersImported} players</li>
                {importStats.opponentsImported && importStats.opponentsImported > 0 && <li>{importStats.opponentsImported} opponents (legacy)</li>}
              </ul>
              <ul className="list-disc pl-6">
                <li>{importStats.gamesImported} games</li>
                <li>{importStats.rostersImported} roster entries</li>
                <li>{importStats.statsImported} game statistics</li>
                {importStats.clubPlayersImported && importStats.clubPlayersImported > 0 && <li>{importStats.clubPlayersImported} club-player relationships</li>}
                {importStats.teamPlayersImported && importStats.teamPlayersImported > 0 && <li>{importStats.teamPlayersImported} team-player relationships</li>}
                {importStats.playerAvailabilityImported && importStats.playerAvailabilityImported > 0 && <li>{importStats.playerAvailabilityImported} availability records</li>}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Data Management Section - Full Width */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Data Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
              <CardDescription>
                Export your team data for backup or transfer to another system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-gray-600">
                This will export all your team data including players, opponents, games, rosters, and statistics.
                The data will be saved as a JSON file on your device.
              </p>
              <Button 
                onClick={handleExport} 
                disabled={isExporting}
                className="w-full"
              >
                {isExporting ? 'Exporting...' : 'Export Data'}
                <Download className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Import Data</CardTitle>
              <CardDescription>
                Import team data from a previously exported file.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-gray-600">
                Warning: Importing data will add to your current data, creating duplicate records if the data already exists.
                This operation cannot be undone.
              </p>
              <input 
                type="file" 
                id="import-file-input"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button 
                onClick={handleImportClick} 
                disabled={isImporting}
                variant="outline"
                className="w-full"
              >
                {isImporting ? 'Importing...' : 'Import Data'}
                <Upload className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200">
            <CardHeader>
              <CardTitle className="text-red-700">Delete All Data</CardTitle>
              <CardDescription className="text-red-600">
                Permanently delete all data from the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-red-600">
                <strong>Warning:</strong> This will delete ALL data in the system including players, opponents, games, rosters, and statistics.
                This operation cannot be undone. Make sure to export your data first if you want to keep it.
              </p>
              <Button 
                onClick={handleDeleteClick} 
                disabled={isDeleting}
                variant="destructive"
                className="w-full"
              >
                {isDeleting ? 'Deleting...' : 'Delete All Data'}
                <Trash2 className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Application Settings - Grid Layout */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="seasons">Seasons</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="game-statuses">Game Statuses</TabsTrigger>
          <TabsTrigger value="import">Import</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Display Settings</CardTitle>
                <CardDescription>
                  Configure how dates and times are displayed in the application.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={getBrowserTimezone()}>
                        {formatTimezone(getBrowserTimezone())} (Browser Default)
                      </SelectItem>
                      {COMMON_TIMEZONES.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {formatTimezone(tz)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={saveSettings} className="w-full">
                  Save Settings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Export for Visualization</CardTitle>
                <CardDescription>
                  Export data in formats optimized for Flourish and other visualization tools.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleExportPlayers} 
                  disabled={isExporting}
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Export Players List
                </Button>
                
                <Button 
                  onClick={handleExportTeamPerformance} 
                  disabled={isExporting}
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Team Performance Timeline
                </Button>
                
                <Button 
                  onClick={handleExportQuarterAnalysis} 
                  disabled={isExporting}
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Quarter Analysis Heatmap
                </Button>
                
                <Button 
                  onClick={handleExportPositionData} 
                  disabled={isExporting}
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <Target className="mr-2 h-4 w-4" />
                  Position Performance
                </Button>
                
                <Button 
                  onClick={handleExportPlayerNetwork} 
                  disabled={isExporting}
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Player Network Analysis
                </Button>
                
                <Button 
                  onClick={handleExportGameTimeline} 
                  disabled={isExporting}
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Game Timeline
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="seasons" className="mt-6">
          <SeasonsManager />
        </TabsContent>

        <TabsContent value="sections" className="mt-6">
          {activeSeason?.id ? (
            <SectionManager 
              seasonId={activeSeason.id} 
              seasonName={activeSeason.name}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  {activeSeason === undefined ? 'Loading active season...' : 'Please set an active season first to manage sections.'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="game-statuses" className="mt-6">
          <GameStatusManager />
        </TabsContent>

        <TabsContent value="import" className="mt-6">
          <FixtureImporter />
        </TabsContent>
      </Tabs>
      

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-700">Delete All Data</DialogTitle>
            <DialogDescription>
              This action cannot be undone. All data will be permanently deleted from the system.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="mb-4 text-sm text-gray-700">
              To confirm deletion, please type <strong>DELETE</strong> in the field below.
            </p>
            <Input 
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="w-full"
            />
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAllData}
              disabled={deleteConfirmation !== 'DELETE' || isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Confirm Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}