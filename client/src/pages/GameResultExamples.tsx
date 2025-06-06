
import React from 'react';
import { Helmet } from 'react-helmet';
import { GameResultCardExamples } from '@/components/ui/game-result-examples';

export default function GameResultExamples() {
  return (
    <div className="container mx-auto py-6">
      <Helmet>
        <title>Game Result Card Examples - Emerald Netball</title>
      </Helmet>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Game Result Card Examples</h1>
        <p className="text-muted-foreground mt-2">
          Different layouts and configurations of the GameResultCard component
        </p>
      </div>
      
      <GameResultCardExamples />
    </div>
  );
}
