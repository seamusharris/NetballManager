import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlayerBox } from '@/components/ui/player-box';
import { TeamBox } from '@/components/ui/team-box';
import { GameBadge } from '@/components/ui/game-badge';
import { ResultBadge } from '@/components/ui/result-badge';
import { ScoreBadge } from '@/components/ui/score-badge';
import { BaseWidget } from '@/components/ui/base-widget';
import { CourtDisplay } from '@/components/ui/court-display';
import { PlayerAvatar } from '@/components/ui/player-avatar';
import { ActionButton } from '@/components/ui/ActionButton';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorDisplay } from '@/components/ui/error-display';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { 
  Trophy, Users, Calendar as CalendarIcon, Star, Shield, BarChart3, 
  TrendingUp, Target, Eye, Edit, Settings, Plus, ChevronDown,
  Heart, Award, AlertTriangle, Play, Save, Download, Search,
  Filter, MoreHorizontal, Mail, Phone, MapPin, Clock, Check,
  X, Upload, Trash2, Copy, ExternalLink, Info, HelpCircle
} from 'lucide-react';

export default function ComponentExamples() {
  const [progress, setProgress] = useState(45);
  const [switchChecked, setSwitchChecked] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [sliderValue, setSliderValue] = useState([50]);
  const [selectedValue, setSelectedValue] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Sample data
  const samplePlayer = {
    id: 1,
    displayName: "Sarah Johnson",
    firstName: "Sarah",
    lastName: "Johnson",
    positionPreferences: ["GS", "GA", "WA"],
    avatarColor: "bg-blue-500",
    active: true
  };

  const samplePlayers = [
    { id: 1, displayName: "Sarah J", firstName: "Sarah", lastName: "Johnson", positionPreferences: ["GS", "GA"], avatarColor: "bg-blue-500", active: true },
    { id: 2, displayName: "Emma K", firstName: "Emma", lastName: "Kelly", positionPreferences: ["GK", "GD"], avatarColor: "bg-red-500", active: true },
    { id: 3, displayName: "Lisa M", firstName: "Lisa", lastName: "Miller", positionPreferences: ["C", "WA"], avatarColor: "bg-green-500", active: true },
    { id: 4, displayName: "Amy R", firstName: "Amy", lastName: "Roberts", positionPreferences: ["WD", "GD"], avatarColor: "bg-purple-500", active: true }
  ];

  const sampleTeam = {
    id: 1,
    name: "Thunder Hawks",
    division: "A Grade",
    clubName: "Metro Netball Club",
    clubCode: "MNC",
    seasonName: "2024 Season"
  };

  const sampleTeams = [
    { id: 1, name: "Thunder Hawks", division: "A Grade", clubName: "Metro Netball Club", clubCode: "MNC" },
    { id: 2, name: "Lightning Bolts", division: "A Grade", clubName: "City Netball", clubCode: "CNC" },
    { id: 3, name: "Storm Eagles", division: "B Grade", clubName: "Valley Sports", clubCode: "VSC" }
  ];

  const sampleGame = {
    id: 1,
    round: "5",
    homeTeamName: "Thunder Hawks",
    awayTeamName: "Lightning Bolts",
    date: "2024-03-15",
    time: "10:00"
  };

  const sampleGames = [
    { id: 1, round: "5", homeTeamName: "Thunder Hawks", awayTeamName: "Lightning Bolts", date: "2024-03-15", time: "10:00", homeScore: 42, awayScore: 38 },
    { id: 2, round: "6", homeTeamName: "Storm Eagles", awayTeamName: "Thunder Hawks", date: "2024-03-22", time: "11:30", homeScore: 35, awayScore: 41 },
    { id: 3, round: "7", homeTeamName: "Thunder Hawks", awayTeamName: "Fire Panthers", date: "2024-03-29", time: "09:00", homeScore: null, awayScore: null }
  ];

  const tableData = [
    { player: "Sarah Johnson", position: "GS", goals: 28, accuracy: "87%" },
    { player: "Emma Kelly", position: "GK", intercepts: 12, rebounds: 8 },
    { player: "Lisa Miller", position: "C", feeds: 35, assists: 22 }
  ];

  return (
    <PageTemplate 
      title="Component Examples" 
      description="Comprehensive showcase of all UI components and patterns"
    >
      <Helmet>
        <title>Component Examples - Netball Manager</title>
      </Helmet>

      <div className="space-y-8">
        {/* Basic Components */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Basic Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Buttons */}
            <Card>
              <CardHeader>
                <CardTitle>Buttons</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Button>Primary Button</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
                <div className="flex gap-2">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                </div>
                <div className="space-y-2">
                  <Button disabled>Disabled</Button>
                  <Button>
                    <Play className="h-4 w-4 mr-2" />
                    With Icon
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card>
              <CardHeader>
                <CardTitle>Badges</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-green-500">Success</Badge>
                  <Badge className="bg-yellow-500">Warning</Badge>
                  <Badge className="bg-blue-500">Info</Badge>
                  <Badge className="bg-purple-500">Custom</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Form Elements */}
            <Card>
              <CardHeader>
                <CardTitle>Form Elements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" placeholder="Enter email" />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="Password" />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Enter description" />
                </div>
                <Button className="w-full">Submit</Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Interactive Components */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Interactive Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Checkboxes and Switches */}
            <Card>
              <CardHeader>
                <CardTitle>Checkboxes & Switches</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="terms" 
                    checked={checkboxChecked}
                    onCheckedChange={setCheckboxChecked}
                  />
                  <Label htmlFor="terms">Accept terms</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="notifications"
                    checked={switchChecked}
                    onCheckedChange={setSwitchChecked}
                  />
                  <Label htmlFor="notifications">Enable notifications</Label>
                </div>
                <RadioGroup defaultValue="option1">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option1" id="option1" />
                    <Label htmlFor="option1">Option 1</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option2" id="option2" />
                    <Label htmlFor="option2">Option 2</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Select and Sliders */}
            <Card>
              <CardHeader>
                <CardTitle>Select & Sliders</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Select Position</Label>
                  <Select value={selectedValue} onValueChange={setSelectedValue}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gs">Goal Shooter</SelectItem>
                      <SelectItem value="ga">Goal Attack</SelectItem>
                      <SelectItem value="wa">Wing Attack</SelectItem>
                      <SelectItem value="c">Centre</SelectItem>
                      <SelectItem value="wd">Wing Defence</SelectItem>
                      <SelectItem value="gd">Goal Defence</SelectItem>
                      <SelectItem value="gk">Goal Keeper</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Performance Rating: {sliderValue[0]}%</Label>
                  <Slider
                    value={sliderValue}
                    onValueChange={setSliderValue}
                    max={100}
                    step={1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Progress: {progress}%</Label>
                  <Progress value={progress} className="mt-2" />
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" onClick={() => setProgress(Math.max(0, progress - 10))}>-10</Button>
                    <Button size="sm" onClick={() => setProgress(Math.min(100, progress + 10))}>+10</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Avatars */}
            <Card>
              <CardHeader>
                <CardTitle>Avatars</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>SJ</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>EK</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>LM</AvatarFallback>
                  </Avatar>
                </div>
                <div className="space-y-2">
                  {samplePlayers.slice(0, 3).map(player => (
                    <div key={player.id} className="flex items-center gap-2">
                      <PlayerAvatar player={player} size="sm" />
                      <span className="text-sm">{player.displayName}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Data Display Components */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Data Display</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Tables */}
            <Card>
              <CardHeader>
                <CardTitle>Data Tables</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Player</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Stats</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.player}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{row.position}</Badge>
                        </TableCell>
                        <TableCell>
                          {'goals' in row ? `${row.goals} goals (${row.accuracy})` : 
                           'intercepts' in row ? `${row.intercepts} intercepts, ${row.rebounds} rebounds` :
                           `${row.feeds} feeds, ${row.assists} assists`}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Accordion */}
            <Card>
              <CardHeader>
                <CardTitle>Accordion</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Game Statistics</AccordionTrigger>
                    <AccordionContent>
                      Track individual player performance across all quarters including goals, intercepts, and other key metrics.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Team Management</AccordionTrigger>
                    <AccordionContent>
                      Manage team rosters, player availability, and position rotations for optimal performance.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Season Planning</AccordionTrigger>
                    <AccordionContent>
                      Plan and schedule games, track season progress, and analyze team performance trends.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Dialog and Sheet Examples */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Overlay Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            <Card>
              <CardHeader>
                <CardTitle>Dialog</CardTitle>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Open Dialog</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Player</DialogTitle>
                      <DialogDescription>
                        Enter the player details below to add them to your team.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Player Name</Label>
                        <Input id="name" placeholder="Enter player name" />
                      </div>
                      <div>
                        <Label>Preferred Positions</Label>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">GS</Badge>
                          <Badge variant="outline">GA</Badge>
                          <Badge variant="outline">WA</Badge>
                        </div>
                      </div>
                      <Button>Add Player</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sheet</CardTitle>
              </CardHeader>
              <CardContent>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline">Open Sheet</Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Game Statistics</SheetTitle>
                      <SheetDescription>
                        View detailed statistics for this game.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">Quarter 1</h4>
                        <div className="text-sm text-muted-foreground">
                          Team Score: 12 - 8
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">Quarter 2</h4>
                        <div className="text-sm text-muted-foreground">
                          Team Score: 22 - 18
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Popover</CardTitle>
              </CardHeader>
              <CardContent>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <div className="space-y-2">
                      <h4 className="font-medium">Quick Actions</h4>
                      <div className="space-y-1">
                        <Button variant="ghost" size="sm" className="w-full justify-start">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Player
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start">
                          <Eye className="h-4 w-4 mr-2" />
                          View Stats
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tooltip</CardTitle>
              </CardHeader>
              <CardContent>
                <TooltipProvider>
                  <div className="space-y-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline">
                          <HelpCircle className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Click for help information</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline">
                          <Info className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Additional information available</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Navigation Components */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Navigation</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <Card>
              <CardHeader>
                <CardTitle>Breadcrumbs</CardTitle>
              </CardHeader>
              <CardContent>
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/teams">Teams</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Thunder Hawks</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dropdown Menu</CardTitle>
              </CardHeader>
              <CardContent>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Actions
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Player
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Info
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Loading States */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Loading & Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            <Card>
              <CardHeader>
                <CardTitle>Skeleton Loading</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Loading States</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <LoadingState message="Loading player data..." />
                <Separator />
                <LoadingState message="Calculating statistics..." />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Display</CardTitle>
              </CardHeader>
              <CardContent>
                <ErrorDisplay 
                  title="Failed to load data"
                  message="Unable to fetch player statistics. Please try again."
                  onRetry={() => console.log('Retry clicked')}
                />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* External Links */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Related Examples</h2>
          <Card>
            <CardHeader>
              <CardTitle>Court Layout Examples</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  View detailed court layout examples and position management similar to the game details page.
                </p>
                <Button asChild>
                  <a href="/court-layout-examples">
                    <Eye className="h-4 w-4 mr-2" />
                    View Court Layouts
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </PageTemplate>
  );
}