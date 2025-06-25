
import React from 'react';
import { Helmet } from 'react-helmet';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export default function ToastExamples() {

  const showSuccess = () => {
    toast({
      title: "Success!",
      description: "Player statistics saved successfully.",
      variant: "default",
    });
  };

  const showError = () => {
    toast({
      title: "Error",
      description: "Failed to save statistics. Please try again.",
      variant: "destructive",
    });
  };

  const showWarning = () => {
    toast({
      title: "Warning",
      description: "Some data may be incomplete.",
      variant: "default",
    });
  };

  const showInfo = () => {
    toast({
      title: "Information",
      description: "Game has been scheduled for next week.",
      variant: "default",
    });
  };

  return (
    <PageTemplate
      title="Toast Examples"
      subtitle="Success/error notifications and action confirmations"
      breadcrumbs={[
        { label: 'Component Examples', href: '/component-examples' },
        { label: 'Toast Examples' }
      ]}
    >
      <Helmet>
        <title>Toast Examples | Team Manager</title>
      </Helmet>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Toast Notifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Success</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={showSuccess} className="w-full">
                  Show Success
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span>Error</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={showError} variant="destructive" className="w-full">
                  Show Error
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <span>Warning</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={showWarning} variant="outline" className="w-full">
                  Show Warning
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  <span>Info</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={showInfo} variant="outline" className="w-full">
                  Show Info
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Common Use Cases</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Game Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  onClick={() => toast({ title: "Game Saved", description: "Game details updated successfully." })}
                  className="w-full"
                >
                  Save Game
                </Button>
                <Button 
                  onClick={() => toast({ title: "Game Deleted", description: "Game removed from schedule." })}
                  variant="destructive"
                  className="w-full"
                >
                  Delete Game
                </Button>
                <Button 
                  onClick={() => toast({ title: "Statistics Recorded", description: "Player stats saved for Quarter 1." })}
                  variant="outline"
                  className="w-full"
                >
                  Save Stats
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Player Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  onClick={() => toast({ title: "Player Added", description: "Emma Smith added to the team." })}
                  className="w-full"
                >
                  Add Player
                </Button>
                <Button 
                  onClick={() => toast({ title: "Player Updated", description: "Player preferences saved." })}
                  variant="outline"
                  className="w-full"
                >
                  Update Player
                </Button>
                <Button 
                  onClick={() => toast({ title: "Roster Set", description: "Starting lineup confirmed for next game." })}
                  variant="outline"
                  className="w-full"
                >
                  Set Roster
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </PageTemplate>
  );
}
