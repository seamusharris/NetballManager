
import React from 'react';
import { Helmet } from 'react-helmet';
import { GameResultCardExamples } from '@/components/ui/game-result-examples';

export default function GameResultExamples() {
  return (
    <PageTemplate 
      title="Game Result Card Examples" 
      breadcrumbs={[
        { label: "Component Examples", href: "/component-examples" },
        { label: "Game Result Examples" }
      ]}
    >
      <div className="prose max-w-none mb-6">
        <p className="text-lg text-gray-700">
          Different layouts and configurations of the GameResultCard component
        </p>
      </div>
      
      <GameResultCardExamples />
    </PageTemplate>
  );
}
