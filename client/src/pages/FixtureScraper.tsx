
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Download, Globe, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ScrapedFixture {
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  venue?: string;
  round?: string;
}

export default function FixtureScraper() {
  const [url, setUrl] = useState('https://registration.netballconnect.com/livescoreSeasonFixture?organisationKey=383c3e85-6160-4657-8e7d-665a81491f1e&competitionUniqueKey=4166e02b-43fa-4ed7-bcae-bd151c0251e3&yearId=7&divisionId=26122');
  const [isLoading, setIsLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState<ScrapedFixture[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { toast } = useToast();

  const handleScrape = async () => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a URL to scrape",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setScrapedData([]);

    try {
      const response = await fetch('/api/fixtures/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.fixtures) {
        setScrapedData(data.fixtures || []);
        setShowConfirmation(true);
        toast({
          title: "Preview Ready",
          description: `Found ${data.fixtures?.length || 0} fixtures to review`,
        });
      } else {
        throw new Error(data.error || 'Failed to scrape data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({
        title: "Scraping Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportGames = async () => {
    if (scrapedData.length === 0) {
      toast({
        title: "No Data",
        description: "No games to import",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/fixtures/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: url,
          clubId: 54, // You may want to get this from club context
          seasonId: 1  // You may want to get this from season context
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      toast({
        title: "Import Complete",
        description: `Successfully imported ${result.imported || 0} games`,
      });
      
      setScrapedData([]);
      setShowConfirmation(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Import failed';
      toast({
        title: "Import Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return (
    <PageTemplate 
      title="Fixture Scraper" 
      breadcrumbs={[
        { label: "Administration" },
        { label: "Fixture Scraper" }
      ]}
    >
      <div className="space-y-6">
        <Helmet>
          <title>Fixture Scraper - Netball App</title>
        </Helmet>

        <div className="prose max-w-none">
          <p className="text-lg text-gray-700">
            Scrape fixture data from Netball Connect websites and import games into your system.
          </p>
        </div>

        {/* URL Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Web Scraper
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">Netball Connect Fixture URL</Label>
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://registration.netballconnect.com/livescoreSeasonFixture?..."
                className="font-mono text-sm"
              />
              <p className="text-sm text-muted-foreground">
                Enter the full URL from a Netball Connect fixture page
              </p>
            </div>

            <Button 
              onClick={handleScrape} 
              disabled={isLoading || !url.trim()}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {isLoading ? 'Scraping...' : 'Scrape Fixtures'}
            </Button>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        {scrapedData.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Preview Fixtures
                  <Badge variant="secondary">{scrapedData.length} fixtures</Badge>
                </CardTitle>
                {!showConfirmation && (
                  <Button onClick={() => setShowConfirmation(true)} variant="outline">
                    Review & Import
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="max-h-96 overflow-y-auto">
                  <div className="grid gap-2">
                    {scrapedData.map((fixture, index) => (
                      <div key={index} className="border rounded-lg p-3 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                          <div>
                            <span className="font-medium">Date:</span> {fixture.date || 'Not specified'}
                          </div>
                          <div>
                            <span className="font-medium">Time:</span> {fixture.time || 'Not specified'}
                          </div>
                          <div>
                            <span className="font-medium">Round:</span> {fixture.round || 'Not specified'}
                          </div>
                          <div className="md:col-span-2">
                            <span className="font-medium">Teams:</span> {fixture.homeTeam} vs {fixture.awayTeam}
                          </div>
                          <div>
                            <span className="font-medium">Venue:</span> {fixture.venue || 'Not specified'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Confirmation Dialog */}
        {showConfirmation && scrapedData.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertCircle className="h-5 w-5" />
                Confirm Import
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-orange-700">
                  You're about to import <strong>{scrapedData.length} fixtures</strong> into your system. 
                  This action cannot be undone. Please review the fixtures above and confirm if you want to proceed.
                </p>
                
                <div className="flex gap-3">
                  <Button 
                    onClick={handleImportGames} 
                    variant="default"
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Yes, Import All Fixtures
                  </Button>
                  <Button 
                    onClick={() => setShowConfirmation(false)} 
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Navigate to a Netball Connect fixture page for your competition</li>
              <li>Copy the full URL from your browser's address bar</li>
              <li>Paste the URL into the input field above</li>
              <li>Click "Scrape Fixtures" to extract the fixture data</li>
              <li>Review the scraped fixtures in the preview section</li>
              <li>Click "Review & Import" to confirm the import</li>
              <li>Click "Yes, Import All Fixtures" to add them to your system</li>
            </ol>
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> The scraper works with Netball Connect fixture pages. 
                Make sure you have the correct permissions to scrape the data and that it complies with the website's terms of service.
              </p>
            </div>

            {/* NetballConnect specific guidance */}
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <h4 className="font-semibold text-yellow-800 mb-2">NetballConnect Limitations</h4>
              <p className="text-sm text-yellow-700 mb-3">
                NetballConnect pages use JavaScript to load fixture data dynamically, which cannot be scraped directly with this tool.
              </p>
              <div className="text-sm text-yellow-700">
                <p className="font-semibold mb-1">Alternative options for NetballConnect:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Export fixture data from NetballConnect as CSV/Excel file</li>
                  <li>Use NetballConnect API if your organization has access</li>
                  <li>Copy fixture data manually from the loaded page</li>
                  <li>Contact NetballConnect support for data export options</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
}
