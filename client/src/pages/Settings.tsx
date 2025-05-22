import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { TEAM_NAME, TEAM_SHORT_NAME } from '@/lib/settings';

export default function Settings() {
  const { toast } = useToast();
  const [teamName, setTeamName] = useState(TEAM_NAME);
  const [teamShortName, setTeamShortName] = useState(TEAM_SHORT_NAME);
  
  // This would normally save to backend, but for now we'll just update localStorage
  const saveSettings = () => {
    localStorage.setItem('app_team_name', teamName);
    localStorage.setItem('app_team_short_name', teamShortName);
    
    toast({
      title: "Settings saved",
      description: "Your settings have been saved successfully.",
    });
    
    // Reload the page to apply the settings
    window.location.reload();
  };
  
  return (
    <div className="container py-8 mx-auto">
      <Helmet>
        <title>Application Settings | Netball Stats Tracker</title>
      </Helmet>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Application Settings</h1>
        <p className="text-gray-500">Configure your team information and application preferences</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Team Information</CardTitle>
            <CardDescription>Configure your team name and basic details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teamName">Team Name</Label>
              <Input 
                id="teamName" 
                placeholder="Enter your team name" 
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="teamShortName">Team Short Name</Label>
              <Input 
                id="teamShortName" 
                placeholder="Short team name (for limited space)" 
                value={teamShortName}
                onChange={(e) => setTeamShortName(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                This shorter name will be used where space is limited
              </p>
            </div>
            
            <Button onClick={saveSettings} className="w-full">Save Settings</Button>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Display Preferences</CardTitle>
              <CardDescription>Customize how information is displayed</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-sm italic">
                More display preferences will be added in future updates.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Backup & Export</CardTitle>
              <CardDescription>Manage your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full">
                Backup All Data
              </Button>
              <Button variant="outline" className="w-full">
                Export Statistics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}