import React from 'react';
import { Helmet } from 'react-helmet';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RoundBadgeExamples() {
  const roundNumber = "5";

  return (
    <PageTemplate 
      title="Round Badge Examples" 
      breadcrumbs={[
        { label: "Component Examples", href: "/component-examples" },
        { label: "Round Badge Examples" }
      ]}
    >
      <div className="prose max-w-none mb-6">
        <p className="text-lg text-gray-700">
          Different styles and configurations of round badges and status indicators
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Current Style */}
        <Card>
          <CardHeader>
            <CardTitle>Current Style (round)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span>Default:</span>
              <GameBadge variant="round">Round {roundNumber}</GameBadge>
            </div>
            <div className="flex items-center gap-2">
              <span>Small:</span>
              <GameBadge variant="round" size="sm">R{roundNumber}</GameBadge>
            </div>
            <p className="text-sm text-gray-600">
              Traditional button-like appearance with border and background
            </p>
          </CardContent>
        </Card>

        {/* Pill Style */}
        <Card>
          <CardHeader>
            <CardTitle>Minimalist Pill Style</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span>Default:</span>
              <GameBadge variant="round-pill">Round {roundNumber}</GameBadge>
            </div>
            <div className="flex items-center gap-2">
              <span>Small:</span>
              <GameBadge variant="round-pill" size="sm">R{roundNumber}</GameBadge>
            </div>
            <p className="text-sm text-gray-600">
              Softer, more subtle appearance without borders
            </p>
          </CardContent>
        </Card>

        {/* Outline Style */}
        <Card>
          <CardHeader>
            <CardTitle>Modern Outline Style</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span>Default:</span>
              <GameBadge variant="round-outline">Round {roundNumber}</GameBadge>
            </div>
            <div className="flex items-center gap-2">
              <span>Small:</span>
              <GameBadge variant="round-outline" size="sm">R{roundNumber}</GameBadge>
            </div>
            <p className="text-sm text-gray-600">
              Clean borders with transparent background
            </p>
          </CardContent>
        </Card>

        {/* Minimal Circle Style */}
        <Card>
          <CardHeader>
            <CardTitle>Compact Circle Style</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span>Circle:</span>
              <GameBadge variant="round-minimal">{roundNumber}</GameBadge>
            </div>
            <div className="flex items-center gap-2">
              <span>With text:</span>
              <span>Round</span>
              <GameBadge variant="round-minimal">{roundNumber}</GameBadge>
            </div>
            <p className="text-sm text-gray-600">
              Just the number in a small dark circle - very minimal
            </p>
          </CardContent>
        </Card>

        {/* Timeline Style Examples */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Timeline Style (Color-coded by Game Status)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span>Win:</span>
                <span className="inline-flex items-center rounded-md border-transparent bg-green-200 text-green-800 px-2 py-0.5 text-xs font-medium">
                  Round {roundNumber}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>Loss:</span>
                <span className="inline-flex items-center rounded-md border-transparent bg-red-200 text-red-800 px-2 py-0.5 text-xs font-medium">
                  Round {roundNumber}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>Draw:</span>
                <span className="inline-flex items-center rounded-md border-transparent bg-yellow-200 text-yellow-800 px-2 py-0.5 text-xs font-medium">
                  Round {roundNumber}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>Upcoming:</span>
                <span className="inline-flex items-center rounded-md border-transparent bg-blue-200 text-blue-800 px-2 py-0.5 text-xs font-medium">
                  Round {roundNumber}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Colors indicate game result - helps with quick visual scanning
            </p>
          </CardContent>
        </Card>

      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Which style do you prefer?</h3>
        <p className="text-sm text-gray-700">
          Each style has different advantages:
        </p>
        <ul className="text-sm text-gray-700 mt-2 space-y-1">
          <li><strong>Pill:</strong> Clean and modern, less visual weight</li>
          <li><strong>Outline:</strong> Professional, works well in light/dark themes</li>
          <li><strong>Circle:</strong> Very minimal, saves space</li>
          <li><strong>Timeline:</strong> Adds meaning through color coding</li>
        </ul>
      </div>
    </PageTemplate>
  );
}