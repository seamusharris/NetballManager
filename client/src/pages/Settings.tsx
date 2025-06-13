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
import { useToast } from "@/hooks/use-toast";
import { TEAM_NAME, TEAM_SHORT_NAME, TIMEZONE, COMMON_TIMEZONES } from '@/lib/settings';
import { BackButton } from '@/components/ui/back-button';
import { Download, Upload, Database, FileText } from "lucide-react";
import { exportToJSON, exportToCSV, importFromJSON } from "@/lib/dataExportImport";
import { useRef } from "react";
import { GameStatusManager } from "@/components/settings/GameStatusManager";

export default function Settings() {
  const { toast } = useToast();
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
    localStorage.setItem('app_timezone', timezone);

    toast({
      title: "Settings saved",
      description: "Your display preferences have been saved successfully.",
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
        <BackButton fallbackPath="/dashboard" className="mb-4">
          Back to Dashboard
        </BackButton>
        <h1 className="text-2xl font-bold">Application Settings</h1>
        <p className="text-gray-500">Configure your application preferences and data management</p>
      </div>

      {/* Game Status Management - Full Width */}
      <div className="mb-8">
        <GameStatusManager />
      </div>

      {/* Other Settings - Grid Layout */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Common data management tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open('/data-management', '_blank')}
                >
                  Open Data Management
                </Button>
              </CardContent>
            </Card>

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
          </div>
        </div>
    </div>
  );
}