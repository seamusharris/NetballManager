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

        {/* Sport-Specific Components */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Sport-Specific Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Player Components */}
            <Card>
              <CardHeader>
                <CardTitle>Player Components</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Player Box</h4>
                  <PlayerBox player={samplePlayer} />
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Player Avatar</h4>
                  <div className="flex gap-2">
                    {samplePlayers.slice(0, 4).map(player => (
                      <PlayerAvatar key={player.id} player={player} size="md" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Components */}
            <Card>
              <CardHeader>
                <CardTitle>Team Components</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Team Box</h4>
                  <TeamBox team={sampleTeam} />
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Team Gallery</h4>
                  <div className="space-y-2">
                    {sampleTeams.slice(0, 2).map(team => (
                      <TeamBox key={team.id} team={team} variant="compact" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Game Components */}
            <Card>
              <CardHeader>
                <CardTitle>Game Components</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Game Badges</h4>
                  <div className="flex gap-2">
                    <GameBadge variant="round">Round 5</GameBadge>
                    <GameBadge variant="status">Completed</GameBadge>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Score Badges</h4>
                  <div className="flex gap-2">
                    <ScoreBadge homeScore={42} awayScore={38} />
                    <ScoreBadge homeScore={35} awayScore={41} />
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Result Badges</h4>
                  <div className="flex gap-2">
                    <ResultBadge result="win" />
                    <ResultBadge result="loss" />
                    <ResultBadge result="draw" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Court Components */}
            <Card>
              <CardHeader>
                <CardTitle>Court Display</CardTitle>
              </CardHeader>
              <CardContent>
                <CourtDisplay 
                  positions={{
                    GS: samplePlayers[0],
                    GA: samplePlayers[1],
                    WA: samplePlayers[2],
                    C: samplePlayers[3]
                  }}
                />
              </CardContent>
            </Card>

            {/* Action Components */}
            <Card>
              <CardHeader>
                <CardTitle>Action Components</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Action Buttons</h4>
                  <div className="flex gap-2">
                    <ActionButton
                      icon={<Edit className="h-4 w-4" />}
                      onClick={() => console.log('Edit clicked')}
                      variant="edit"
                    >
                      Edit
                    </ActionButton>
                    <ActionButton
                      icon={<Eye className="h-4 w-4" />}
                      onClick={() => console.log('View clicked')}
                      variant="view"
                    >
                      View
                    </ActionButton>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Base Widget</h4>
                  <BaseWidget title="Performance" description="Player stats">
                    <div className="p-4 text-center">
                      <div className="text-2xl font-bold">87%</div>
                      <div className="text-sm text-muted-foreground">Success Rate</div>
                    </div>
                  </BaseWidget>
                </div>
              </CardContent>
            </Card>

            {/* Status Components */}
            <Card>
              <CardHeader>
                <CardTitle>Status & Loading</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Loading States</h4>
                  <LoadingState message="Loading game data..." />
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Error Display</h4>
                  <ErrorDisplay 
                    title="Connection Error"
                    message="Unable to load data"
                    onRetry={() => console.log('Retry clicked')}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Tabs Examples */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Tab Components</h2>
          <Card>
            <CardHeader>
              <CardTitle>Statistics Tabs</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="statistics">Statistics</TabsTrigger>
                  <TabsTrigger value="analysis">Analysis</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Games Played</h4>
                      <div className="text-2xl font-bold">12</div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Win Rate</h4>
                      <div className="text-2xl font-bold">75%</div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="performance" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Performance Rating</Label>
                    <Progress value={78} />
                    <div className="text-sm text-muted-foreground">78% - Above Average</div>
                  </div>
                </TabsContent>
                <TabsContent value="statistics" className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold">156</div>
                      <div className="text-sm text-muted-foreground">Goals</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">42</div>
                      <div className="text-sm text-muted-foreground">Intercepts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">89%</div>
                      <div className="text-sm text-muted-foreground">Accuracy</div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="analysis" className="space-y-4">
                  <Alert>
                    <TrendingUp className="h-4 w-4" />
                    <AlertDescription>
                      Performance has improved by 15% over the last 4 games.
                    </AlertDescription>
                  </Alert>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </section>

        {/* Alert Examples */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Alerts & Notifications</h2>
          <div className="space-y-4">
            <Alert>
              <Trophy className="h-4 w-4" />
              <AlertDescription>
                Great job! Your team won their last 3 games in a row.
              </AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Warning: Several players are unavailable for the next game.
              </AlertDescription>
            </Alert>
            <Alert className="border-green-200 bg-green-50">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                All game statistics have been successfully submitted.
              </AlertDescription>
            </Alert>
          </div>
        </section>

        {/* Calendar Example */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Calendar & Date Selection</h2>
          <Card>
            <CardHeader>
              <CardTitle>Game Scheduling</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </section>

        {/* Collapsible Example */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Collapsible Content</h2>
          <Card>
            <CardHeader>
              <CardTitle>Game Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    Show Quarter Statistics
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-2">
                  <div className="grid grid-cols-4 gap-2 text-sm">
                    <div className="p-2 border rounded">Q1: 10-8</div>
                    <div className="p-2 border rounded">Q2: 12-9</div>
                    <div className="p-2 border rounded">Q3: 8-11</div>
                    <div className="p-2 border rounded">Q4: 12-10</div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        </section>

        {/* External Links */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Component Example Pages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <Card>
              <CardHeader>
                <CardTitle>Specialized Examples</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild variant="outline" className="w-full justify-start">
                  <a href="/action-button-examples">
                    <Settings className="h-4 w-4 mr-2" />
                    Action Button Examples
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <a href="/player-box-examples">
                    <Users className="h-4 w-4 mr-2" />
                    Player Box Examples
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <a href="/team-box-examples">
                    <Shield className="h-4 w-4 mr-2" />
                    Team Box Examples
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <a href="/round-badge-examples">
                    <Award className="h-4 w-4 mr-2" />
                    Round Badge Examples
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Layout & Design</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild variant="outline" className="w-full justify-start">
                  <a href="/layout-examples">
                    <Eye className="h-4 w-4 mr-2" />
                    Layout Examples
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <a href="/color-examples">
                    <Target className="h-4 w-4 mr-2" />
                    Color Examples
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <a href="/navigation-examples">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Navigation Examples
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <a href="/court-layout-examples">
                    <Target className="h-4 w-4 mr-2" />
                    Court Layout Examples
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data & Widgets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild variant="outline" className="w-full justify-start">
                  <a href="/chart-examples">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Chart Examples
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <a href="/widget-examples">
                    <Trophy className="h-4 w-4 mr-2" />
                    Widget Examples
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <a href="/dashboard-examples">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Dashboard Examples
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <a href="/form-examples">
                    <Edit className="h-4 w-4 mr-2" />
                    Form Examples
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sport-Specific</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild variant="outline" className="w-full justify-start">
                  <a href="/game-result-examples">
                    <Trophy className="h-4 w-4 mr-2" />
                    Game Result Examples
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <a href="/statistics-examples">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Statistics Examples
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <a href="/sport-specific-examples">
                    <Play className="h-4 w-4 mr-2" />
                    Sport Specific Examples
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Advanced Examples</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild variant="outline" className="w-full justify-start">
                  <a href="/table-examples">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Table Examples
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <a href="/modal-examples">
                    <Eye className="h-4 w-4 mr-2" />
                    Modal Examples
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <a href="/timeline-examples">
                    <Clock className="h-4 w-4 mr-2" />
                    Timeline Examples
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <a href="/design-system-examples">
                    <Settings className="h-4 w-4 mr-2" />
                    Design System Examples
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance & Debug</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild variant="outline" className="w-full justify-start">
                  <a href="/performance-demo">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Performance Demo
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </PageTemplate>
  );
}