
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, XCircle, AlertTriangle, Info, RefreshCw } from 'lucide-react';

export default function ErrorExamples() {
  const [errorState, setErrorState] = useState<string | null>(null);

  const triggerError = (type: string) => {
    setErrorState(type);
    setTimeout(() => setErrorState(null), 3000);
  };

  return (
    <PageTemplate
      title="Error Examples"
      subtitle="Various error states, empty states, and error handling patterns"
      breadcrumbs={[
        { label: 'Component Examples', href: '/component-examples' },
        { label: 'Error Examples' }
      ]}
    >
      <Helmet>
        <title>Error Examples | Team Manager</title>
      </Helmet>

      <div className="space-y-8">
        {/* Error Alerts */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Error Alerts</h2>
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load game statistics. Please check your connection and try again.
              </AlertDescription>
            </Alert>

            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                Some player data is missing. Statistics may be incomplete.
              </AlertDescription>
            </Alert>

            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                No games scheduled for this week.
              </AlertDescription>
            </Alert>
          </div>
        </section>

        {/* Empty States */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Empty States</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>No Players Found</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">No players in this team</h3>
                <p className="text-gray-600 mb-4">Get started by adding your first player to the team.</p>
                <Button>Add Player</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>No Games Scheduled</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Info className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">No upcoming games</h3>
                <p className="text-gray-600 mb-4">Schedule your first game to get started.</p>
                <Button>Schedule Game</Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Interactive Error States */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Interactive Error States</h2>
          <Card>
            <CardHeader>
              <CardTitle>Simulated Errors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Button 
                  variant="destructive" 
                  onClick={() => triggerError('network')}
                  disabled={!!errorState}
                >
                  Network Error
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => triggerError('validation')}
                  disabled={!!errorState}
                >
                  Validation Error
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => triggerError('server')}
                  disabled={!!errorState}
                >
                  Server Error
                </Button>
              </div>

              {errorState === 'network' && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    Network connection failed. Please check your internet connection.
                  </AlertDescription>
                </Alert>
              )}

              {errorState === 'validation' && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    Invalid player data. Please check all required fields.
                  </AlertDescription>
                </Alert>
              )}

              {errorState === 'server' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Internal server error. Our team has been notified.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Retry Patterns */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Retry Patterns</h2>
          <Card>
            <CardHeader>
              <CardTitle>Failed Operations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border border-red-200 bg-red-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="text-red-800">Failed to save game statistics</span>
                  </div>
                  <Button size="sm" variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              </div>

              <div className="border border-yellow-200 bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <span className="text-yellow-800">Connection timeout - trying again...</span>
                  </div>
                  <div className="text-sm text-yellow-700">Attempt 2/3</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </PageTemplate>
  );
}
