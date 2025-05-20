import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Download, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportAllData, importData } from '@/lib/dataExportImport';
import { queryClient } from '@/lib/queryClient';

export default function DataManagement() {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importStats, setImportStats] = useState<{
    playersImported: number;
    opponentsImported: number;
    gamesImported: number;
    rostersImported: number;
    statsImported: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setError(null);
      
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
      
      toast({
        title: "Export Successful",
        description: `Your data has been exported to ${filename}`,
        variant: "default",
      });
    } catch (err) {
      console.error('Export failed:', err);
      setError(err instanceof Error ? err.message : 'Export failed due to an unknown error');
      
      toast({
        title: "Export Failed",
        description: "There was a problem exporting your data. Please try again.",
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
        description: `Imported ${stats.playersImported} players, ${stats.opponentsImported} opponents, ${stats.gamesImported} games, ${stats.rostersImported} roster entries, and ${stats.statsImported} stat entries.`,
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

  return (
    <>
      <Helmet>
        <title>Data Management | Netball Team Manager</title>
        <meta name="description" content="Export and import your team data" />
      </Helmet>
      
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Data Management</h1>
        
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
              <ul className="list-disc pl-6 mt-2">
                <li>{importStats.playersImported} players</li>
                <li>{importStats.opponentsImported} opponents</li>
                <li>{importStats.gamesImported} games</li>
                <li>{importStats.rostersImported} roster entries</li>
                <li>{importStats.statsImported} game statistics</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </div>
      </div>
    </>
  );
}