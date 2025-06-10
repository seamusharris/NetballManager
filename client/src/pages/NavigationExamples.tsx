
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChevronLeft, ChevronRight, ChevronDown, Home, Users, 
  Settings, MoreHorizontal, Check, ArrowLeft, ArrowRight
} from 'lucide-react';

export default function NavigationExamples() {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentStep, setCurrentStep] = useState(1);
  const totalPages = 12;
  const totalSteps = 4;

  return (
    <PageTemplate 
      title="Navigation Examples" 
      breadcrumbs={[
        { label: "Component Examples", href: "/component-examples" },
        { label: "Navigation Examples" }
      ]}
    >
      <div className="space-y-8">
        <Helmet>
          <title>Navigation Examples - Netball App</title>
        </Helmet>

        <div className="prose max-w-none">
          <p className="text-lg text-gray-700">
            Comprehensive navigation patterns including breadcrumbs, pagination, tabs, steppers, and other navigation components.
          </p>
        </div>

        {/* Breadcrumb Examples */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Breadcrumb Navigation</h2>
          <div className="space-y-6">
            
            {/* Standard Breadcrumb */}
            <Card>
              <CardHeader>
                <CardTitle>Standard Breadcrumb</CardTitle>
              </CardHeader>
              <CardContent>
                <nav className="flex" aria-label="Breadcrumb">
                  <ol className="inline-flex items-center space-x-1 md:space-x-3">
                    <li className="inline-flex items-center">
                      <a href="#" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
                        <Home className="w-4 h-4 mr-2" />
                        Home
                      </a>
                    </li>
                    <li>
                      <div className="flex items-center">
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <a href="#" className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2">Teams</a>
                      </div>
                    </li>
                    <li>
                      <div className="flex items-center">
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <a href="#" className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2">WNC Dingoes</a>
                      </div>
                    </li>
                    <li aria-current="page">
                      <div className="flex items-center">
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Player Stats</span>
                      </div>
                    </li>
                  </ol>
                </nav>
              </CardContent>
            </Card>

            {/* Breadcrumb with Icons */}
            <Card>
              <CardHeader>
                <CardTitle>Breadcrumb with Category Icons</CardTitle>
              </CardHeader>
              <CardContent>
                <nav className="flex" aria-label="Breadcrumb">
                  <ol className="inline-flex items-center space-x-1 md:space-x-3">
                    <li className="inline-flex items-center">
                      <Home className="w-4 h-4 text-blue-600" />
                      <a href="#" className="ml-2 text-sm font-medium text-blue-600 hover:text-blue-800">Dashboard</a>
                    </li>
                    <li>
                      <div className="flex items-center">
                        <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                        <Users className="w-4 h-4 text-gray-600" />
                        <a href="#" className="ml-2 text-sm font-medium text-gray-700 hover:text-blue-600">Players</a>
                      </div>
                    </li>
                    <li>
                      <div className="flex items-center">
                        <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                        <Settings className="w-4 h-4 text-gray-600" />
                        <span className="ml-2 text-sm font-medium text-gray-500">Management</span>
                      </div>
                    </li>
                  </ol>
                </nav>
              </CardContent>
            </Card>

            {/* Compact Breadcrumb */}
            <Card>
              <CardHeader>
                <CardTitle>Compact Breadcrumb with Dropdown</CardTitle>
              </CardHeader>
              <CardContent>
                <nav className="flex items-center space-x-2" aria-label="Breadcrumb">
                  <Home className="w-4 h-4 text-gray-500" />
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <Button variant="ghost" size="sm" className="h-6 px-2">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">Teams</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">Current Page</span>
                </nav>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Pagination Examples */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Pagination Patterns</h2>
          <div className="space-y-6">
            
            {/* Standard Pagination */}
            <Card>
              <CardHeader>
                <CardTitle>Standard Pagination</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, '...', 10, 11, 12].map((page, index) => (
                      <Button
                        key={index}
                        variant={page === currentPage ? "default" : "outline"}
                        size="sm"
                        className="w-10 h-10"
                        disabled={page === '...'}
                        onClick={() => typeof page === 'number' && setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-gray-500 mt-2 text-center">
                  Showing page {currentPage} of {totalPages}
                </div>
              </CardContent>
            </Card>

            {/* Simple Pagination */}
            <Card>
              <CardHeader>
                <CardTitle>Simple Pagination</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center space-x-4">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <span className="text-sm text-gray-700">Page 3 of 15</span>
                  <Button variant="outline" size="sm">
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Load More Pattern */}
            <Card>
              <CardHeader>
                <CardTitle>Load More Pattern</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-sm text-gray-500">
                    Showing 20 of 156 players
                  </div>
                  <Button variant="outline">
                    Load More Players
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Tab Navigation */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Tab Navigation</h2>
          <div className="space-y-6">
            
            {/* Standard Tabs */}
            <Card>
              <CardHeader>
                <CardTitle>Standard Tabs</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="games">Games</TabsTrigger>
                    <TabsTrigger value="stats">Statistics</TabsTrigger>
                    <TabsTrigger value="roster">Roster</TabsTrigger>
                  </TabsList>
                  <TabsContent value="overview" className="mt-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium mb-2">Team Overview</h3>
                      <p className="text-sm text-gray-600">General team information and quick stats...</p>
                    </div>
                  </TabsContent>
                  <TabsContent value="games" className="mt-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium mb-2">Games Schedule</h3>
                      <p className="text-sm text-gray-600">Upcoming and past games...</p>
                    </div>
                  </TabsContent>
                  <TabsContent value="stats" className="mt-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium mb-2">Team Statistics</h3>
                      <p className="text-sm text-gray-600">Performance metrics and analytics...</p>
                    </div>
                  </TabsContent>
                  <TabsContent value="roster" className="mt-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium mb-2">Team Roster</h3>
                      <p className="text-sm text-gray-600">Player list and management...</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Tabs with Badges */}
            <Card>
              <CardHeader>
                <CardTitle>Tabs with Notification Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    <a href="#" className="border-blue-500 text-blue-600 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center">
                      Active Games
                      <Badge variant="default" className="ml-2">3</Badge>
                    </a>
                    <a href="#" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center">
                      Pending Results
                      <Badge variant="destructive" className="ml-2">7</Badge>
                    </a>
                    <a href="#" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
                      Completed
                    </a>
                  </nav>
                </div>
              </CardContent>
            </Card>

            {/* Vertical Tabs */}
            <Card>
              <CardHeader>
                <CardTitle>Vertical Tab Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex">
                  <div className="w-1/4 border-r border-gray-200 pr-4">
                    <nav className="space-y-1">
                      <a href="#" className="bg-blue-50 border-blue-500 text-blue-700 hover:text-blue-700 hover:bg-blue-50 border-l-4 pl-3 pr-2 py-2 text-sm font-medium block">
                        Team Settings
                      </a>
                      <a href="#" className="border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50 border-l-4 pl-3 pr-2 py-2 text-sm font-medium block">
                        Player Management
                      </a>
                      <a href="#" className="border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50 border-l-4 pl-3 pr-2 py-2 text-sm font-medium block">
                        Game Preferences
                      </a>
                      <a href="#" className="border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50 border-l-4 pl-3 pr-2 py-2 text-sm font-medium block">
                        Notifications
                      </a>
                    </nav>
                  </div>
                  <div className="flex-1 pl-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium mb-2">Team Settings</h3>
                      <p className="text-sm text-gray-600">Configure team preferences and basic information...</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Stepper Navigation */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Stepper/Wizard Navigation</h2>
          <div className="space-y-6">
            
            {/* Horizontal Stepper */}
            <Card>
              <CardHeader>
                <CardTitle>Horizontal Stepper</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full">
                  <div className="flex items-center">
                    {[1, 2, 3, 4].map((step, index) => (
                      <div key={step} className="flex items-center">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                          step < currentStep ? 'bg-green-500 border-green-500 text-white' :
                          step === currentStep ? 'bg-blue-500 border-blue-500 text-white' :
                          'bg-white border-gray-300 text-gray-500'
                        }`}>
                          {step < currentStep ? <Check className="w-4 h-4" /> : step}
                        </div>
                        {index < 3 && (
                          <div className={`flex-1 h-0.5 mx-4 ${
                            step < currentStep ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-4">
                    <span className="text-sm text-gray-600">Team Details</span>
                    <span className="text-sm text-gray-600">Players</span>
                    <span className="text-sm text-gray-600">Schedule</span>
                    <span className="text-sm text-gray-600">Review</span>
                  </div>
                  
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium mb-2">Step {currentStep}: {
                      currentStep === 1 ? 'Team Details' :
                      currentStep === 2 ? 'Add Players' :
                      currentStep === 3 ? 'Set Schedule' : 'Review & Submit'
                    }</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {currentStep === 1 ? 'Enter basic team information and division details.' :
                       currentStep === 2 ? 'Add players to your team roster.' :
                       currentStep === 3 ? 'Configure game schedule and preferences.' : 
                       'Review all information before creating the team.'}
                    </p>
                    
                    <div className="flex justify-between">
                      <Button 
                        variant="outline" 
                        onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                        disabled={currentStep === 1}
                      >
                        Previous
                      </Button>
                      <Button 
                        onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
                        disabled={currentStep === totalSteps}
                      >
                        {currentStep === totalSteps ? 'Complete' : 'Next'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vertical Stepper */}
            <Card>
              <CardHeader>
                <CardTitle>Vertical Stepper</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    { title: 'Create Team', desc: 'Set up basic team information', completed: true },
                    { title: 'Add Players', desc: 'Invite players to join your team', completed: true },
                    { title: 'Schedule Games', desc: 'Set up your game schedule', completed: false, current: true },
                    { title: 'Team Setup Complete', desc: 'Review and finalize team setup', completed: false }
                  ].map((step, index) => (
                    <div key={index} className="flex">
                      <div className="flex flex-col items-center mr-4">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                          step.completed ? 'bg-green-500 border-green-500 text-white' :
                          step.current ? 'bg-blue-500 border-blue-500 text-white' :
                          'bg-white border-gray-300 text-gray-500'
                        }`}>
                          {step.completed ? <Check className="w-4 h-4" /> : index + 1}
                        </div>
                        {index < 3 && (
                          <div className={`w-0.5 h-16 mt-2 ${
                            step.completed ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-medium ${step.current ? 'text-blue-600' : step.completed ? 'text-green-600' : 'text-gray-900'}`}>
                          {step.title}
                        </h3>
                        <p className="text-sm text-gray-600">{step.desc}</p>
                        {step.current && (
                          <Button size="sm" className="mt-2">Continue</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Navigation Guidelines */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Navigation Design Guidelines</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div>
                  <h4 className="font-semibold mb-3">Breadcrumb Best Practices</h4>
                  <ul className="text-sm space-y-2 text-gray-600">
                    <li>• Use for hierarchical navigation with 3+ levels</li>
                    <li>• Include icons for visual clarity</li>
                    <li>• Make parent levels clickable</li>
                    <li>• Consider responsive collapse for mobile</li>
                    <li>• Use consistent separators (chevrons)</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Pagination Guidelines</h4>
                  <ul className="text-sm space-y-2 text-gray-600">
                    <li>• Show current page and total pages</li>
                    <li>• Provide Previous/Next navigation</li>
                    <li>• Use ellipsis for large page ranges</li>
                    <li>• Consider "Load More" for infinite scroll</li>
                    <li>• Disable navigation at boundaries</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Tab Navigation</h4>
                  <ul className="text-sm space-y-2 text-gray-600">
                    <li>• Limit to 5-7 tabs for optimal usability</li>
                    <li>• Use badges for notifications/counts</li>
                    <li>• Consider vertical tabs for many options</li>
                    <li>• Maintain state across navigation</li>
                    <li>• Provide clear active state indication</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Stepper Patterns</h4>
                  <ul className="text-sm space-y-2 text-gray-600">
                    <li>• Show progress and remaining steps</li>
                    <li>• Allow backward navigation when possible</li>
                    <li>• Validate each step before proceeding</li>
                    <li>• Use icons/checkmarks for completed steps</li>
                    <li>• Provide clear step labels and descriptions</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </PageTemplate>
  );
}
