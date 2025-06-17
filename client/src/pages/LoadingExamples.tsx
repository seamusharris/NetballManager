
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Circle, RotateCw, RefreshCw } from 'lucide-react';

export default function LoadingExamples() {
  const [isLoading, setIsLoading] = useState(false);

  const simulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <PageTemplate
      title="Loading Examples"
      subtitle="Various loading states, spinners, and skeleton patterns"
      breadcrumbs={[
        { label: 'Component Examples', href: '/component-examples' },
        { label: 'Loading Examples' }
      ]}
    >
      <Helmet>
        <title>Loading Examples | Team Manager</title>
      </Helmet>

      <div className="space-y-8">
        {/* Spinner Examples */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Loading Spinners</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Default Spinner</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pulsing Circle</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center py-8">
                <Circle className="h-8 w-8 animate-pulse text-blue-500" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rotating Refresh</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center py-8">
                <RotateCw className="h-8 w-8 animate-spin text-green-500" />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Skeleton Loading */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Skeleton Loading</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Player Card Skeleton</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[160px]" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[80%]" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Game Result Skeleton</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-[120px]" />
                  <Skeleton className="h-8 w-[60px]" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Interactive Loading */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Interactive Loading States</h2>
          <Card>
            <CardHeader>
              <CardTitle>Simulated Loading</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={simulateLoading} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Trigger Loading'
                )}
              </Button>
              
              {isLoading && (
                <div className="space-y-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Loading player statistics...</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full animate-pulse w-1/3"></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Progressive Loading */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Progressive Loading</h2>
          <Card>
            <CardHeader>
              <CardTitle>Multi-step Loading Process</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span>Teams loaded</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span>Players loaded</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  <span>Loading game statistics...</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                  <span className="text-gray-500">Performance metrics pending</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </PageTemplate>
  );
}
