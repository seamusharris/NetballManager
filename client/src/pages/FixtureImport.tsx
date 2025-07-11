
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Download, Eye, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useClub } from '@/contexts/ClubContext';

interface ScrapedFixture {
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  venue?: string;
  round?: string;
}

interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

export default function FixtureImport() {
  const [url, setUrl] = useState('');
  const [seasonId, setSeasonId] = useState('1');
  const [previewFixtures, setPreviewFixtures] = useState<ScrapedFixture[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const { toast } = useToast();
  const { currentClubId } = useClub();

  const previewMutation = useMutation({
    mutationFn: (url: string) => apiRequest('/api/fixtures/preview', 'POST', { url }),
    onSuccess: (data) => {
      setPreviewFixtures(data.fixtures);
      toast({
        title: "Preview loaded",
        description: `Found ${data.count} fixtures to import`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Preview failed",
        description: error.message || "Failed to load fixtures preview",
        variant: "destructive"
      });
    }
  });

  const importMutation = useMutation({
    mutationFn: ({ url, clubId, seasonId }: { url: string; clubId: number; seasonId: number }) =>
      apiRequest('/api/fixtures/import', 'POST', { url, clubId, seasonId }),
    onSuccess: (data: ImportResult) => {
      setImportResult(data);
      toast({
        title: "Import completed",
        description: `Imported ${data.imported} fixtures, skipped ${data.skipped}`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Import failed",
        description: error.message || "Failed to import fixtures",
        variant: "destructive"
      });
    }
  });

  const handlePreview = () => {
    if (!url.trim()) {
      toast({
        title: "URL required",
        description: "Please enter a NetballConnect fixtures URL",
        variant: "destructive"
      });
      return;
    }
    previewMutation.mutate(url);
  };

  const handleImport = () => {
    if (!currentClubId || !url.trim() || !seasonId) {
      toast({
        title: "Missing information",
        description: "Please ensure club, season, and URL are provided",
        variant: "destructive"
      });
      return;
    }
    importMutation.mutate({ 
      url, 
      clubId: currentClubId, 
      seasonId: parseInt(seasonId) 
    });
  };

  return (
    <PageTemplate
      title="Import Fixtures"
      subtitle="Import fixture data from NetballConnect"
    >
      <div className="grid gap-6 max-w-4xl">
        {/* URL Input */}
        <Card>
          <CardHeader>
            <CardTitle>NetballConnect URL</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="url">Fixtures Page URL</Label>
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://registration.netballconnect.com/livescoreSeasonFixture?..."
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="seasonId">Season ID</Label>
              <Input
                id="seasonId"
                type="number"
                value={seasonId}
                onChange={(e) => setSeasonId(e.target.value)}
                placeholder="1"
                className="mt-1"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handlePreview}
                disabled={previewMutation.isPending}
                variant="outline"
              >
                {previewMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Eye className="w-4 h-4 mr-2" />
                )}
                Preview Fixtures
              </Button>

              {previewFixtures.length > 0 && (
                <Button 
                  onClick={handleImport}
                  disabled={importMutation.isPending}
                >
                  {importMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Import Fixtures
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Preview Results */}
        {previewFixtures.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Preview ({previewFixtures.length} fixtures)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {previewFixtures.map((fixture, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex-1">
                      <div className="font-medium">
                        {fixture.homeTeam} vs {fixture.awayTeam}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {fixture.date} {fixture.time}
                        {fixture.venue && ` • ${fixture.venue}`}
                        {fixture.round && ` • Round ${fixture.round}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Import Results */}
        {importResult && (
          <Card>
            <CardHeader>
              <CardTitle>Import Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Badge variant="default">
                  Imported: {importResult.imported}
                </Badge>
                <Badge variant="secondary">
                  Skipped: {importResult.skipped}
                </Badge>
              </div>

              {importResult.errors.length > 0 && (
                <Alert>
                  <AlertDescription>
                    <div className="font-medium mb-2">Errors occurred:</div>
                    <Textarea
                      value={importResult.errors.join('\n')}
                      readOnly
                      className="text-sm"
                      rows={Math.min(importResult.errors.length, 10)}
                    />
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm">
            <ol className="space-y-2">
              <li>Navigate to NetballConnect and find your competition's fixture page</li>
              <li>Copy the URL from your browser's address bar</li>
              <li>Paste it above and click "Preview Fixtures"</li>
              <li>Review the fixtures that will be imported</li>
              <li>Click "Import Fixtures" to add them to your games</li>
            </ol>
            
            <div className="mt-4 text-sm text-muted-foreground">
              <strong>Note:</strong> The scraper will attempt to match team names with existing teams in your club. 
              Make sure your team names are similar to those used on NetballConnect.
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
}
