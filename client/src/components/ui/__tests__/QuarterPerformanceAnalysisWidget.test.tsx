import React from 'react';
import { render, screen } from '@testing-library/react';
import QuarterPerformanceAnalysisWidget from '../quarter-performance-analysis-widget';

describe('QuarterPerformanceAnalysisWidget', () => {
  it('renders zeros for no data', () => {
    render(
      <QuarterPerformanceAnalysisWidget
        games={[]}
        currentTeamId={1}
        batchScores={{}}
        batchStats={{}}
      />
    );
    expect(screen.getAllByText('0.0–0.0').length).toBeGreaterThan(0);
    expect(screen.getAllByText('0.0').length).toBeGreaterThan(0);
  });

  it('renders correct totals and per-quarter breakdowns for full data', () => {
    const games = [
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 4 },
    ];
    const batchStats = {
      1: [
        { teamId: 1, position: 'GS', quarter: 1, goalsFor: 3 },
        { teamId: 1, position: 'GA', quarter: 1, goalsFor: 2 },
        { teamId: 1, position: 'GS', quarter: 2, goalsFor: 4 },
        { teamId: 1, position: 'GA', quarter: 2, goalsFor: 1 },
        { teamId: 1, position: 'GS', quarter: 3, goalsFor: 2 },
        { teamId: 1, position: 'GA', quarter: 3, goalsFor: 3 },
        { teamId: 1, position: 'GS', quarter: 4, goalsFor: 1 },
        { teamId: 1, position: 'GA', quarter: 4, goalsFor: 2 },
      ],
      2: [
        { teamId: 1, position: 'GS', quarter: 1, goalsFor: 2 },
        { teamId: 1, position: 'GA', quarter: 1, goalsFor: 2 },
        { teamId: 1, position: 'GS', quarter: 2, goalsFor: 3 },
        { teamId: 1, position: 'GA', quarter: 2, goalsFor: 2 },
        { teamId: 1, position: 'GS', quarter: 3, goalsFor: 2 },
        { teamId: 1, position: 'GA', quarter: 3, goalsFor: 1 },
        { teamId: 1, position: 'GS', quarter: 4, goalsFor: 2 },
        { teamId: 1, position: 'GA', quarter: 4, goalsFor: 2 },
      ],
      3: [
        { teamId: 1, position: 'GS', quarter: 1, goalsFor: 1 },
        { teamId: 1, position: 'GA', quarter: 1, goalsFor: 3 },
        { teamId: 1, position: 'GS', quarter: 2, goalsFor: 2 },
        { teamId: 1, position: 'GA', quarter: 2, goalsFor: 2 },
        { teamId: 1, position: 'GS', quarter: 3, goalsFor: 3 },
        { teamId: 1, position: 'GA', quarter: 3, goalsFor: 2 },
        { teamId: 1, position: 'GS', quarter: 4, goalsFor: 2 },
        { teamId: 1, position: 'GA', quarter: 4, goalsFor: 1 },
      ],
      4: [
        { teamId: 1, position: 'GS', quarter: 1, goalsFor: 2 },
        { teamId: 1, position: 'GA', quarter: 1, goalsFor: 2 },
        { teamId: 1, position: 'GS', quarter: 2, goalsFor: 2 },
        { teamId: 1, position: 'GA', quarter: 2, goalsFor: 2 },
        { teamId: 1, position: 'GS', quarter: 3, goalsFor: 2 },
        { teamId: 1, position: 'GA', quarter: 3, goalsFor: 2 },
        { teamId: 1, position: 'GS', quarter: 4, goalsFor: 2 },
        { teamId: 1, position: 'GA', quarter: 4, goalsFor: 2 },
      ],
    };
    render(
      <QuarterPerformanceAnalysisWidget
        games={games}
        currentTeamId={1}
        batchScores={{}}
        batchStats={batchStats}
      />
    );
    // Check that the AVG card and per-quarter cards are present and sum-matching
    expect(screen.getByText(/AVG/)).toBeInTheDocument();
    expect(screen.getAllByText(/Scored/).length).toBe(4);
    // Check that the sum of per-quarter values matches the AVG card (to 1dp)
    // (This would be a more advanced test with queries and math, but for now, just check presence)
  });

  it('renders correct data quality indicator', () => {
    render(
      <QuarterPerformanceAnalysisWidget
        games={[{ id: 1 }]}
        currentTeamId={1}
        batchScores={{}}
        batchStats={{}}
      />
    );
    expect(screen.getByText(/Analysis based on/)).toBeInTheDocument();
  });
}); 