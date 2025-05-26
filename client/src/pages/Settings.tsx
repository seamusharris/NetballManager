import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { TEAM_NAME, TEAM_SHORT_NAME, TIMEZONE, COMMON_TIMEZONES } from '@/lib/settings';
import { BackButton } from '@/components/ui/back-button';

export default function Settings() {
  const { toast } = useToast();
  const [teamName, setTeamName] = useState(TEAM_NAME);
  const [teamShortName, setTeamShortName] = useState(TEAM_SHORT_NAME);
  const [timezone, setTimezone] = useState(TIMEZONE);
  
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
    localStorage.setItem('app_team_name', teamName);
    localStorage.setItem('app_team_short_name', teamShortName);
    localStorage.setItem('app_timezone', timezone);
    
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
        <title>Application Settings | {TEAM_NAME} Stats Tracker</title>
      </Helmet>
      
      <div className="mb-6">
        <BackButton fallbackPath="/dashboard" className="mb-4">
          Back to Dashboard
        </BackButton>
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
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select 
                  value={timezone} 
                  onValueChange={setTimezone}
                >
                  <SelectTrigger id="timezone" className="w-full">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={getBrowserTimezone()}>
                      Browser Default ({getBrowserTimezone()})
                    </SelectItem>
                    
                    {COMMON_TIMEZONES.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {formatTimezone(tz)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  This timezone will be used for displaying dates and times across the application
                </p>
              </div>
              
              <Button onClick={saveSettings} variant="outline" className="w-full">
                Save Display Preferences
              </Button>
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