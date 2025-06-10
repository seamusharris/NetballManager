
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Trash2, AlertTriangle, Info, CheckCircle, 
  XCircle, Settings, User, Calendar, Mail
} from 'lucide-react';

export default function ModalExamples() {
  const [isBasicOpen, setIsBasicOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);

  return (
    <PageTemplate 
      title="Modal Examples" 
      breadcrumbs={[
        { label: "Component Examples", href: "/component-examples" },
        { label: "Modal Examples" }
      ]}
    >
      <div className="space-y-8">
        <Helmet>
          <title>Modal Examples - Netball App</title>
        </Helmet>

        <div className="prose max-w-none">
          <p className="text-lg text-gray-700">
            Different modal sizes, content types, confirmation dialogs, and overlay patterns for various use cases.
          </p>
        </div>

        {/* Basic Modals */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Basic Modal Sizes</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Small Modal */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Small Modal</CardTitle>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">Open Small Modal</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Quick Action</DialogTitle>
                      <DialogDescription>
                        This is a small modal for simple confirmations or quick actions.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center space-x-2">
                      <div className="grid flex-1 gap-2">
                        <Label htmlFor="link" className="sr-only">Link</Label>
                        <Input id="link" defaultValue="https://ui.shadcn.com/docs/installation" readOnly />
                      </div>
                    </div>
                    <DialogFooter className="sm:justify-start">
                      <Button type="button" variant="secondary">
                        Copy Link
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Medium Modal */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Medium Modal</CardTitle>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">Open Medium Modal</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Player Information</DialogTitle>
                      <DialogDescription>
                        View and edit player details and statistics.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          SJ
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">Sarah Johnson</h3>
                          <Badge variant="outline">Goal Attack</Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Games Played</Label>
                          <div className="text-2xl font-bold">12</div>
                        </div>
                        <div>
                          <Label>Goals Scored</Label>
                          <div className="text-2xl font-bold">89</div>
                        </div>
                        <div>
                          <Label>Accuracy</Label>
                          <div className="text-2xl font-bold">78%</div>
                        </div>
                        <div>
                          <Label>Rating</Label>
                          <div className="text-2xl font-bold">8.5</div>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline">View Full Profile</Button>
                      <Button>Edit Player</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Large Modal */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Large Modal</CardTitle>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">Open Large Modal</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Game Statistics Dashboard</DialogTitle>
                      <DialogDescription>
                        Comprehensive game statistics and performance metrics.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-900">45</div>
                          <div className="text-sm text-blue-700">Team Goals</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-900">32</div>
                          <div className="text-sm text-green-700">Opponent Goals</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-900">13</div>
                          <div className="text-sm text-purple-700">Goal Difference</div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3">Quarter Performance</h4>
                        <div className="space-y-2">
                          {['Q1: 12-8', 'Q2: 11-9', 'Q3: 10-7', 'Q4: 12-8'].map((quarter, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <span>{quarter.split(':')[0]}</span>
                              <span className="font-bold">{quarter.split(':')[1]}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline">Download Report</Button>
                      <Button>View Full Analysis</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Full Screen Modal */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Full Screen Modal</CardTitle>
              </CardHeader>
              <CardContent>
                <Dialog open={isFullScreenOpen} onOpenChange={setIsFullScreenOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">Open Full Screen</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-screen-lg h-screen max-h-screen m-0 rounded-none">
                    <DialogHeader>
                      <DialogTitle>Team Management Dashboard</DialogTitle>
                      <DialogDescription>
                        Full-screen view for comprehensive team management and analysis.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 py-4 overflow-auto">
                      <div className="lg:col-span-2">
                        <h4 className="font-semibold mb-4">Team Roster</h4>
                        <div className="space-y-3">
                          {Array.from({length: 8}, (_, i) => (
                            <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                  {i + 1}
                                </div>
                                <div>
                                  <div className="font-medium">Player {i + 1}</div>
                                  <div className="text-sm text-gray-500">Position</div>
                                </div>
                              </div>
                              <Badge>Active</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-4">Quick Stats</h4>
                        <div className="space-y-4">
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-900">12</div>
                            <div className="text-sm text-blue-700">Games Played</div>
                          </div>
                          <div className="p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-900">9</div>
                            <div className="text-sm text-green-700">Games Won</div>
                          </div>
                          <div className="p-4 bg-yellow-50 rounded-lg">
                            <div className="text-2xl font-bold text-yellow-900">75%</div>
                            <div className="text-sm text-yellow-700">Win Rate</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsFullScreenOpen(false)}>
                        Close
                      </Button>
                      <Button>Save Changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Form Modals */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Form Modals</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Simple Form Modal */}
            <Card>
              <CardHeader>
                <CardTitle>Create Player Modal</CardTitle>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Player
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Player</DialogTitle>
                      <DialogDescription>
                        Enter the player's basic information to add them to the team.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input id="firstName" placeholder="First name" />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input id="lastName" placeholder="Last name" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="player@example.com" />
                      </div>
                      <div>
                        <Label htmlFor="position">Preferred Position</Label>
                        <Input id="position" placeholder="e.g., GA, GS, C" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline">Cancel</Button>
                      <Button>Add Player</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Complex Form Modal */}
            <Card>
              <CardHeader>
                <CardTitle>Game Setup Modal</CardTitle>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Game
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Schedule New Game</DialogTitle>
                      <DialogDescription>
                        Set up a new game with opponent and venue details.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="gameDate">Date</Label>
                          <Input id="gameDate" type="date" />
                        </div>
                        <div>
                          <Label htmlFor="gameTime">Time</Label>
                          <Input id="gameTime" type="time" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="opponent">Opponent Team</Label>
                        <Input id="opponent" placeholder="Enter opponent team name" />
                      </div>
                      <div>
                        <Label htmlFor="venue">Venue</Label>
                        <Input id="venue" placeholder="Court location" />
                      </div>
                      <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea id="notes" placeholder="Additional game information..." rows={3} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline">Cancel</Button>
                      <Button>Schedule Game</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Confirmation Dialogs */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Confirmation Dialogs</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Destructive Action */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Destructive Action</CardTitle>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Player
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        <AlertDialogTitle>Delete Player</AlertDialogTitle>
                      </div>
                      <AlertDialogDescription>
                        Are you sure you want to delete Sarah Johnson? This action cannot be undone. 
                        All game statistics and history for this player will be permanently removed.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                        Delete Player
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>

            {/* Warning Dialog */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Warning Dialog</CardTitle>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Archive Team
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        <AlertDialogTitle>Archive Team</AlertDialogTitle>
                      </div>
                      <AlertDialogDescription>
                        Archiving this team will hide it from active lists but preserve all data. 
                        You can restore it later if needed. Are you sure you want to continue?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-amber-600 hover:bg-amber-700">
                        Archive Team
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>

            {/* Info Dialog */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Info Dialog</CardTitle>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Info className="w-4 h-4 mr-2" />
                      View Rules
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <div className="flex items-center space-x-2">
                        <Info className="w-5 h-5 text-blue-500" />
                        <AlertDialogTitle>Game Rules Information</AlertDialogTitle>
                      </div>
                      <AlertDialogDescription className="space-y-2">
                        <p>Standard netball game rules apply:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>4 quarters of 15 minutes each</li>
                          <li>7 players per team on court</li>
                          <li>Each player has specific court areas</li>
                          <li>Goals can only be scored from within the goal circle</li>
                        </ul>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogAction>Got it</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>

            {/* Success Dialog */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Success Dialog</CardTitle>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="w-full">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <AlertDialogTitle>Changes Saved Successfully</AlertDialogTitle>
                      </div>
                      <AlertDialogDescription>
                        Your team configuration has been saved successfully. 
                        All players have been notified of the updates via email.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogAction className="bg-green-600 hover:bg-green-700">
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Modal Guidelines */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Modal Design Guidelines</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div>
                  <h4 className="font-semibold mb-3">Modal Sizing</h4>
                  <ul className="text-sm space-y-2 text-gray-600">
                    <li>• Small (max-w-md): Quick actions, confirmations</li>
                    <li>• Medium (max-w-lg): Forms, detailed content</li>
                    <li>• Large (max-w-2xl): Dashboards, complex data</li>
                    <li>• Full Screen: Comprehensive interfaces</li>
                    <li>• Choose size based on content complexity</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Content Guidelines</h4>
                  <ul className="text-sm space-y-2 text-gray-600">
                    <li>• Keep titles clear and descriptive</li>
                    <li>• Provide helpful descriptions for context</li>
                    <li>• Use icons to reinforce message type</li>
                    <li>• Organize content with proper spacing</li>
                    <li>• Include relevant visual elements</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Interaction Patterns</h4>
                  <ul className="text-sm space-y-2 text-gray-600">
                    <li>• Provide clear primary and secondary actions</li>
                    <li>• Use appropriate button styles for actions</li>
                    <li>• Include escape routes (cancel, close)</li>
                    <li>• Support keyboard navigation (ESC to close)</li>
                    <li>• Focus management for accessibility</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Confirmation Dialogs</h4>
                  <ul className="text-sm space-y-2 text-gray-600">
                    <li>• Use warning colors for destructive actions</li>
                    <li>• Explain consequences clearly</li>
                    <li>• Make cancel option easily accessible</li>
                    <li>• Use appropriate icons for message type</li>
                    <li>• Provide context-specific information</li>
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
