
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Save, X, Plus, Trash2, AlertCircle, CheckCircle, 
  Upload, Download, Eye, EyeOff, Loader2 
} from 'lucide-react';
import TeamForm from '@/components/teams/TeamForm';
import { Season, Team } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export default function FormExamples() {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [selectedTeamForEdit, setSelectedTeamForEdit] = useState<Team | null>(null);

  // Load actual teams from club 1 for testing
  const { data: teams, isLoading: teamsLoading } = useQuery<Team[]>({
    queryKey: ['clubs', 1, 'teams'],
    queryFn: async () => {
      const result = await apiClient.get('/api/clubs/1/teams');
      return result as Team[];
    },
    staleTime: 30000, // 30 seconds
  });
  const [formData, setFormData] = useState({
    playerName: '',
    email: '',
    phone: '',
    positions: [] as string[],
    active: true,
    notes: ''
  });

  const positions = ['GK', 'GD', 'WD', 'C', 'WA', 'GA', 'GS'];

  const togglePosition = (position: string) => {
    setSelectedPositions(prev => 
      prev.includes(position) 
        ? prev.filter(p => p !== position)
        : [...prev, position]
    );
  };

  return (
    <PageTemplate 
      title="Form Examples" 
      breadcrumbs={[
        { label: "Component Examples", href: "/component-examples" },
        { label: "Form Examples" }
      ]}
    >
      <div className="space-y-8">
        <div className="prose max-w-none">
          <p className="text-lg text-gray-700">
            Standard form layouts, validation patterns, and input combinations for consistent user interfaces.
          </p>
        </div>

        {/* Refactored Team Form - NEW! */}
        <section>
          <h2 className="text-2xl font-bold mb-6">🚀 Refactored Team Form (NEW!)</h2>
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This is the new refactored team form using the <code>useStandardForm</code> hook. 
              It replaces 320 lines of duplicated code with a clean, reusable pattern.
              <strong> Note: This will create/edit real team data for Club 1 - be careful!</strong>
              <br />
              <span className="text-sm text-gray-600 mt-1 block">
                All team operations on this page use Club 1 for testing purposes.
              </span>
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Create Team */}
            <Card>
              <CardHeader>
                <CardTitle>Create New Team</CardTitle>
              </CardHeader>
              <CardContent>
                <TeamForm
                  clubId={1} // Test club ID
                  seasons={[]} // Let the form load seasons from API
                  onSuccess={(data) => {
                    console.log('✅ Team created successfully:', data);
                    alert('Team created successfully! Check console for details.');
                  }}
                  onCancel={() => {
                    console.log('❌ Form cancelled');
                    alert('Form cancelled');
                  }}
                />
              </CardContent>
            </Card>

            {/* Edit Team */}
            <Card>
              <CardHeader>
                <CardTitle>Edit Existing Team</CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  Select a real team from club 1 to test editing functionality
                </p>
              </CardHeader>
              <CardContent>
                {teamsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading teams...</span>
                  </div>
                ) : teams && teams.length > 0 ? (
                  <div className="space-y-4">
                    {/* Team Selection */}
                    <div>
                      <Label htmlFor="team-select">Select Team to Edit</Label>
                      <Select
                        value={selectedTeamForEdit?.id?.toString() || ''}
                        onValueChange={(value) => {
                          const team = teams.find(t => t.id === parseInt(value));
                          setSelectedTeamForEdit(team || null);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose a team to edit..." />
                        </SelectTrigger>
                        <SelectContent>
                          {teams.map((team) => (
                            <SelectItem key={team.id} value={team.id.toString()}>
                              {team.name} - Season {team.seasonId} {team.isActive ? '(Active)' : '(Inactive)'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Edit Form */}
                    {selectedTeamForEdit && (
                      <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                        <h4 className="font-medium mb-4">Editing: {selectedTeamForEdit.name}</h4>
                        <TeamForm
                          team={selectedTeamForEdit}
                          clubId={1}
                          seasons={[]} // Let the form load seasons from API
                          onSuccess={(data) => {
                            console.log('✅ Team updated successfully:', data);
                            alert('Team updated successfully! Check console for details.');
                            setSelectedTeamForEdit(null); // Clear selection after successful edit
                          }}
                          onCancel={() => {
                            console.log('❌ Edit cancelled');
                            setSelectedTeamForEdit(null);
                          }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No teams found in club 1.</p>
                    <p className="text-sm mt-2">Create a team first using the form above to test editing.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Benefits Summary */}
          <Card className="mt-6 bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">✅ Refactoring Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-green-700 mb-2">Code Reduction:</h4>
                  <ul className="list-disc list-inside text-green-600 space-y-1">
                    <li>Original TeamForm: ~320 lines</li>
                    <li>Refactored version: ~180 lines</li>
                    <li><strong>44% smaller codebase</strong></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-green-700 mb-2">Eliminated Duplication:</h4>
                  <ul className="list-disc list-inside text-green-600 space-y-1">
                    <li>Manual mutation setup (50+ lines)</li>
                    <li>Manual cache invalidation (30+ lines)</li>
                    <li>Manual error handling (20+ lines)</li>
                    <li>Repeated toast logic (20+ lines)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Basic Form */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Basic Form Layout</h2>
          <Card>
            <CardHeader>
              <CardTitle>Player Registration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="Enter first name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Enter last name" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="player@example.com" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="+61 400 000 000" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="division">Division</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select division" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="13u">13U</SelectItem>
                    <SelectItem value="15u">15U</SelectItem>
                    <SelectItem value="17u">17U</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button>Save Player</Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Advanced Form with Validation */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Form with Validation States</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Success State */}
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Valid Form
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="validEmail">Email Address</Label>
                  <Input 
                    id="validEmail" 
                    type="email" 
                    value="sarah@example.com"
                    className="border-green-300 focus:border-green-500"
                    readOnly
                  />
                  <p className="text-sm text-green-600">✓ Valid email format</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="validPhone">Phone Number</Label>
                  <Input 
                    id="validPhone" 
                    type="tel" 
                    value="+61 400 123 456"
                    className="border-green-300 focus:border-green-500"
                    readOnly
                  />
                  <p className="text-sm text-green-600">✓ Valid phone format</p>
                </div>
                
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    All fields are valid and ready to submit.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Error State */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Form with Errors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invalidEmail">Email Address</Label>
                  <Input 
                    id="invalidEmail" 
                    type="email" 
                    value="invalid-email"
                    className="border-red-300 focus:border-red-500"
                  />
                  <p className="text-sm text-red-600">× Please enter a valid email address</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="requiredField">Required Field</Label>
                  <Input 
                    id="requiredField" 
                    placeholder="This field is required"
                    className="border-red-300 focus:border-red-500"
                  />
                  <p className="text-sm text-red-600">× This field is required</p>
                </div>
                
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    Please fix the errors above before submitting.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Position Selection Form */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Position Selection</h2>
          <Card>
            <CardHeader>
              <CardTitle>Player Positions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Checkbox Grid */}
              <div>
                <Label className="text-base font-medium">Position Preferences (Multiple)</Label>
                <div className="grid grid-cols-4 md:grid-cols-7 gap-3 mt-3">
                  {positions.map(position => (
                    <div key={position} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`pos-${position}`}
                        checked={selectedPositions.includes(position)}
                        onCheckedChange={() => togglePosition(position)}
                      />
                      <Label 
                        htmlFor={`pos-${position}`}
                        className="text-sm cursor-pointer"
                      >
                        {position}
                      </Label>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {selectedPositions.map(position => (
                    <Badge key={position} variant="secondary">
                      {position}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => togglePosition(position)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Radio Group */}
              <div>
                <Label className="text-base font-medium">Primary Position (Single)</Label>
                <RadioGroup defaultValue="C" className="mt-3">
                  <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
                    {positions.map(position => (
                      <div key={position} className="flex items-center space-x-2">
                        <RadioGroupItem value={position} id={`primary-${position}`} />
                        <Label 
                          htmlFor={`primary-${position}`}
                          className="text-sm cursor-pointer"
                        >
                          {position}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Form Controls */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Form Controls & Inputs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <Card>
              <CardHeader>
                <CardTitle>Input Variations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="textInput">Standard Text Input</Label>
                  <Input id="textInput" placeholder="Enter text" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="passwordInput">Password Input</Label>
                  <div className="relative">
                    <Input 
                      id="passwordInput" 
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password" 
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="numberInput">Number Input</Label>
                  <Input id="numberInput" type="number" placeholder="Enter number" min="0" max="100" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="textareaInput">Textarea</Label>
                  <Textarea id="textareaInput" placeholder="Enter longer text" rows={3} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Switches & Toggle</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="activeSwitch">Player Active</Label>
                    <p className="text-sm text-muted-foreground">Enable player for selection</p>
                  </div>
                  <Switch id="activeSwitch" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notificationSwitch">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send game updates via email</p>
                  </div>
                  <Switch id="notificationSwitch" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="publicSwitch">Public Profile</Label>
                    <p className="text-sm text-muted-foreground">Show in public player directory</p>
                  </div>
                  <Switch id="publicSwitch" defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Form Actions */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Form Action Patterns</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <Card>
              <CardHeader>
                <CardTitle>Standard Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>Save</Button>
                </div>
                
                <div className="flex justify-between">
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline">Cancel</Button>
                    <Button>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Player
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Import from File
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Multi-step Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <Button variant="outline" disabled>Previous</Button>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Step 1 of 3</span>
                  </div>
                  <Button>Next</Button>
                </div>
                
                <div className="flex justify-between">
                  <Button variant="outline">Previous</Button>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Step 2 of 3</span>
                  </div>
                  <Button>Next</Button>
                </div>
                
                <div className="flex justify-between">
                  <Button variant="outline">Previous</Button>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Step 3 of 3</span>
                  </div>
                  <Button>Complete</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </PageTemplate>
  );
}
