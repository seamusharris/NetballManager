
import React from 'react';
import { Helmet } from 'react-helmet';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Filter, Settings, Download, Share, Edit, Trash, ChevronDown } from 'lucide-react';

export default function DropdownExamples() {
  const [selectedPosition, setSelectedPosition] = React.useState('all');
  const [checkedItems, setCheckedItems] = React.useState({
    goals: true,
    assists: false,
    turnovers: true,
  });

  return (
    <PageTemplate
      title="Dropdown Examples"
      subtitle="Various dropdown menu patterns and configurations"
      breadcrumbs={[
        { label: 'Component Examples', href: '/component-examples' },
        { label: 'Dropdown Examples' }
      ]}
    >
      <Helmet>
        <title>Dropdown Examples | Team Manager</title>
      </Helmet>

      <div className="space-y-8">
        {/* Basic Dropdowns */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Basic Dropdown Menus</h2>
          <Card>
            <CardHeader>
              <CardTitle>Simple Action Menus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Actions
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Game
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share className="w-4 h-4 mr-2" />
                      Share Results
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <Trash className="w-4 h-4 mr-2" />
                      Delete Game
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Edit Player</DropdownMenuItem>
                    <DropdownMenuItem>Add to Team</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button>
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                    <DropdownMenuItem>Export as Excel</DropdownMenuItem>
                    <DropdownMenuItem>Export as CSV</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Filter Dropdowns */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Filter Dropdowns</h2>
          <Card>
            <CardHeader>
              <CardTitle>Data Filtering Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Filter className="w-4 h-4 mr-2" />
                      Position Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Filter by Position</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup value={selectedPosition} onValueChange={setSelectedPosition}>
                      <DropdownMenuRadioItem value="all">All Positions</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="GS">Goal Shooter</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="GA">Goal Attack</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="WA">Wing Attack</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="C">Center</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="WD">Wing Defense</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="GD">Goal Defense</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="GK">Goal Keeper</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Statistics View
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Select Statistics</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      checked={checkedItems.goals}
                      onCheckedChange={(checked) => 
                        setCheckedItems(prev => ({ ...prev, goals: checked }))
                      }
                    >
                      Goals & Accuracy
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={checkedItems.assists}
                      onCheckedChange={(checked) => 
                        setCheckedItems(prev => ({ ...prev, assists: checked }))
                      }
                    >
                      Assists & Feeds
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={checkedItems.turnovers}
                      onCheckedChange={(checked) => 
                        setCheckedItems(prev => ({ ...prev, turnovers: checked }))
                      }
                    >
                      Turnovers & Penalties
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Nested Dropdowns */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Nested Dropdown Menus</h2>
          <Card>
            <CardHeader>
              <CardTitle>Complex Menu Structures</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Team Management
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Team Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        Add Players
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem>From Club Players</DropdownMenuItem>
                        <DropdownMenuItem>New Player</DropdownMenuItem>
                        <DropdownMenuItem>Import from CSV</DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        Team Settings
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem>Edit Team Details</DropdownMenuItem>
                        <DropdownMenuItem>Change Division</DropdownMenuItem>
                        <DropdownMenuItem>Archive Team</DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>View Team Stats</DropdownMenuItem>
                    <DropdownMenuItem>Export Team Data</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Reports
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Generate Reports</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        Player Reports
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem>Individual Performance</DropdownMenuItem>
                        <DropdownMenuItem>Position Analysis</DropdownMenuItem>
                        <DropdownMenuItem>Season Summary</DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        Team Reports
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem>Team Performance</DropdownMenuItem>
                        <DropdownMenuItem>Game Analysis</DropdownMenuItem>
                        <DropdownMenuItem>Opposition Comparison</DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Context Menus */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Context-Sensitive Dropdowns</h2>
          <Card>
            <CardHeader>
              <CardTitle>Player Action Menus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Abbey N</p>
                    <p className="text-sm text-gray-600">Goal Shooter • 28 goals this season</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Player Profile</DropdownMenuItem>
                      <DropdownMenuItem>Add to Starting Lineup</DropdownMenuItem>
                      <DropdownMenuItem>View Statistics</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Edit Player Details</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Remove from Team</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Ava</p>
                    <p className="text-sm text-gray-600">Wing Attack • 15 intercepts this season</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Player Profile</DropdownMenuItem>
                      <DropdownMenuItem>Add to Starting Lineup</DropdownMenuItem>
                      <DropdownMenuItem>View Statistics</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Edit Player Details</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Remove from Team</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </PageTemplate>
  );
}
