import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Users, Calendar, BarChart3 } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useEffect } from 'react';
import { ClubSwitcher } from '@/components/layout/ClubSwitcher';

export default function HomePage() {
  
  const [, setLocation] = useLocation();

  // Redirect to club dashboard if club context is set
  useEffect(() => {
    if (!isLoading && clubId) {
      setLocation(`/club/${clubId}`);
    }
  }, [clubId, isLoading, setLocation]);

  // Show loading while checking club context
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show club selector if no club context
  if (!clubId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 bg-orange-500 rounded-full">
                <Trophy className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Netball Team
              <span className="text-orange-500"> Management</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Welcome back! Choose your club to access the team management dashboard.
            </p>
          </div>

          {/* Club Selection */}
          <div className="max-w-md mx-auto">
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Choose Your Club</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ClubSwitcher />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }
  // This will never render since we redirect above
  return null;
}