/**
 * API Standardization Test Page
 * 
 * Safe read-only tests for new standardized endpoints.
 * Does NOT modify any data - only validates responses.
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  data?: any;
  duration?: number;
}

export default function ApiStandardizationTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Test configuration - using known good data from production
  const TEST_CONFIG = {
    clubId: 54,
    teamId: 123,
    gameId: 93, // Known game with stats
    expectedStatsCount: 28 // Expected number of stats for this game/team
  };

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    const results: TestResult[] = [];

    // Test 1: Health Check
    try {
      const startTime = Date.now();
      const health = await apiClient.get('/api/standardized/health');
      const duration = Date.now() - startTime;
      
      results.push({
        name: 'Health Check',
        status: health.status === 'ok' ? 'success' : 'warning',
        message: health.message || 'Health check completed',
        data: { endpoints: health.endpoints },
        duration
      });
    } catch (error) {
      results.push({
        name: 'Health Check',
        status: 'error',
        message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }

    // Test 2: Team Game Endpoint
    try {
      const startTime = Date.now();
      const game = await apiClient.get(`/api/teams/${TEST_CONFIG.teamId}/games/${TEST_CONFIG.gameId}`);
      const duration = Date.now() - startTime;
      
      const isValid = game.id === TEST_CONFIG.gameId && 
                     game.homeTeamName && 
                     game.awayTeamName;
      
      results.push({
        name: 'Team Game Endpoint',
        status: isValid ? 'success' : 'warning',
        message: isValid 
          ? `Game data retrieved: ${game.homeTeamName} vs ${game.awayTeamName}`
          : 'Game data incomplete or invalid',
        data: {
          id: game.id,
          homeTeam: game.homeTeamName,
          awayTeam: game.awayTeamName,
          date: game.date
        },
        duration
      });
    } catch (error) {
      results.push({
        name: 'Team Game Endpoint',
        status: 'error',
        message: `Team game fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }

    // Test 3: Team Stats Endpoint
    try {
      const startTime = Date.now();
      const stats = await apiClient.get(`/api/teams/${TEST_CONFIG.teamId}/games/${TEST_CONFIG.gameId}/stats`);
      const duration = Date.now() - startTime;
      
      const isValidCount = Array.isArray(stats) && stats.length === TEST_CONFIG.expectedStatsCount;
      const hasValidStructure = stats.length > 0 && 
                               stats[0].id && 
                               stats[0].gameId === TEST_CONFIG.gameId &&
                               stats[0].teamId === TEST_CONFIG.teamId;
      
      const positions = [...new Set(stats.map((s: any) => s.position))];
      const quarters = [...new Set(stats.map((s: any) => s.quarter))];
      
      results.push({
        name: 'Team Stats Endpoint',
        status: isValidCount && hasValidStructure ? 'success' : 'warning',
        message: `Retrieved ${stats.length} stats (expected ${TEST_CONFIG.expectedStatsCount})`,
        data: {
          count: stats.length,
          positions: positions.sort(),
          quarters: quarters.sort(),
          sampleStat: stats[0]
        },
        duration
      });
    } catch (error) {
      results.push({
        name: 'Team Stats Endpoint',
        status: 'error',
        message: `Team stats fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }

    // Test 4: Compare with Legacy Endpoint (if available)
    try {
      const startTime = Date.now();
      const legacyGame = await apiClient.get(`/api/games/${TEST_CONFIG.gameId}`);
      const newGame = await apiClient.get(`/api/teams/${TEST_CONFIG.teamId}/games/${TEST_CONFIG.gameId}`);
      const duration = Date.now() - startTime;
      
      const dataMatches = legacyGame.id === newGame.id &&
                         legacyGame.homeTeamName === newGame.homeTeamName &&
                         legacyGame.awayTeamName === newGame.awayTeamName;
      
      results.push({
        name: 'Legacy Compatibility',
        status: dataMatches ? 'success' : 'warning',
        message: dataMatches 
          ? 'New endpoint returns consistent data with legacy endpoint'
          : 'Data inconsistency detected between endpoints',
        data: {
          legacy: { id: legacyGame.id, home: legacyGame.homeTeamName, away: legacyGame.awayTeamName },
          new: { id: newGame.id, home: newGame.homeTeamName, away: newGame.awayTeamName }
        },
        duration
      });
    } catch (error) {
      results.push({
        name: 'Legacy Compatibility',
        status: 'warning',
        message: `Could not compare with legacy endpoint: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }

    setTestResults(results);
    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default: return <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      success: 'default',
      error: 'destructive', 
      warning: 'secondary',
      pending: 'outline'
    } as const;
    
    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  return (
    <PageTemplate 
      title="API Standardization Tests"
      breadcrumbs={[
        { label: "Development", href: "/component-examples" },
        { label: "API Tests" }
      ]}
    >
      <Helmet>
        <title>API Standardization Tests - Development</title>
      </Helmet>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              API Standardization Test Suite
              <Button 
                onClick={runTests} 
                disabled={isRunning}
                className="ml-4"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  'Run Tests'
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 mb-4">
              <p><strong>Test Configuration:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Club ID: {TEST_CONFIG.clubId}</li>
                <li>Team ID: {TEST_CONFIG.teamId}</li>
                <li>Game ID: {TEST_CONFIG.gameId}</li>
                <li>Expected Stats: {TEST_CONFIG.expectedStatsCount}</li>
              </ul>
              <p className="mt-2 text-xs text-gray-500">
                ⚠️ These tests are READ-ONLY and do not modify any data.
              </p>
            </div>
          </CardContent>
        </Card>

        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(result.status)}
                        <h3 className="font-medium">{result.name}</h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        {result.duration && (
                          <span className="text-xs text-gray-500">{result.duration}ms</span>
                        )}
                        {getStatusBadge(result.status)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{result.message}</p>
                    {result.data && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                          View Data
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-50 rounded overflow-x-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>New Standardized Endpoints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="font-mono bg-gray-50 p-2 rounded">
                GET /api/teams/:teamId/games/:gameId
              </div>
              <div className="font-mono bg-gray-50 p-2 rounded">
                GET /api/teams/:teamId/games/:gameId/stats
              </div>
              <div className="font-mono bg-gray-50 p-2 rounded">
                GET /api/standardized/health
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
}