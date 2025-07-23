// Simple test for position percentage calculation logic
const { calculateUnifiedQuarterByQuarterStats } = require('./client/src/lib/positionStatsCalculator.ts');

// Mock data similar to what the function would receive
const mockGames = [
  { id: 1 },
  { id: 2 }
];

const mockBatchScores = {
  1: [
    { teamId: 123, quarter: 1, score: 5 },
    { teamId: 123, quarter: 2, score: 4 },
    { teamId: 123, quarter: 3, score: 6 },
    { teamId: 123, quarter: 4, score: 3 },
    { teamId: 456, quarter: 1, score: 3 },
    { teamId: 456, quarter: 2, score: 5 },
    { teamId: 456, quarter: 3, score: 4 },
    { teamId: 456, quarter: 4, score: 6 }
  ],
  2: [
    { teamId: 123, quarter: 1, score: 7 },
    { teamId: 123, quarter: 2, score: 5 },
    { teamId: 123, quarter: 3, score: 4 },
    { teamId: 123, quarter: 4, score: 6 },
    { teamId: 456, quarter: 1, score: 4 },
    { teamId: 456, quarter: 2, score: 3 },
    { teamId: 456, quarter: 3, score: 5 },
    { teamId: 456, quarter: 4, score: 4 }
  ]
};

const mockBatchStats = {
  1: [
    { teamId: 123, position: 'GS', goalsFor: 8, goalsAgainst: 0, quarter: 1 },
    { teamId: 123, position: 'GA', goalsFor: 6, goalsAgainst: 0, quarter: 1 },
    { teamId: 123, position: 'GK', goalsFor: 0, goalsAgainst: 3, quarter: 1 },
    { teamId: 123, position: 'GD', goalsFor: 0, goalsAgainst: 2, quarter: 1 }
  ],
  2: [
    { teamId: 123, position: 'GS', goalsFor: 10, goalsAgainst: 0, quarter: 1 },
    { teamId: 123, position: 'GA', goalsFor: 4, goalsAgainst: 0, quarter: 1 },
    { teamId: 123, position: 'GK', goalsFor: 0, goalsAgainst: 4, quarter: 1 },
    { teamId: 123, position: 'GD', goalsFor: 0, goalsAgainst: 3, quarter: 1 }
  ]
};

console.log('Testing position percentage calculation...');

try {
  const result = calculateUnifiedQuarterByQuarterStats(mockGames, mockBatchScores, 123, mockBatchStats);
  console.log('Result:', JSON.stringify(result, null, 2));
  
  // Check if we get non-zero values
  const hasNonZeroValues = result.some(quarter => 
    quarter.gsGoalsFor > 0 || quarter.gaGoalsFor > 0 || 
    quarter.gkGoalsAgainst > 0 || quarter.gdGoalsAgainst > 0
  );
  
  console.log('Has non-zero values:', hasNonZeroValues);
  
} catch (error) {
  console.error('Error:', error.message);
}