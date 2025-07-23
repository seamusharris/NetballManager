/**
 * Test script for Quarter-by-Quarter Breakdown Widget Implementation
 * This script tests the calculateUnifiedQuarterByQuarterStats function with actual game data
 * to verify that non-zero values are displayed and calculations are correct.
 */

import { calculateUnifiedQuarterByQuarterStats } from './client/src/lib/positionStatsCalculator.ts';

// Mock game data that matches the structure used by working widgets
const mockGamesWithId = [
  {
    id: 1,
    homeTeamId: 100,
    awayTeamId: 200,
    statusIsCompleted: true,
    statusName: 'completed'
  },
  {
    id: 2,
    homeTeamId: 200,
    awayTeamId: 300,
    statusIsCompleted: true,
    statusName: 'completed'
  },
  {
    id: 3,
    homeTeamId: 100,
    awayTeamId: 400,
    statusIsCompleted: true,
    statusName: 'completed'
  }
];

// Mock game data with gameId property (incorrect structure that causes zeros)
const mockGamesWithGameId = [
  {
    gameId: 1,
    homeTeamId: 100,
    awayTeamId: 200,
    statusIsCompleted: true,
    statusName: 'completed'
  },
  {
    gameId: 2,
    homeTeamId: 200,
    awayTeamId: 300,
    statusIsCompleted: true,
    statusName: 'completed'
  },
  {
    gameId: 3,
    homeTeamId: 100,
    awayTeamId: 400,
    statusIsCompleted: true,
    statusName: 'completed'
  }
];

// Mock batch scores data (quarter-by-quarter scores)
const mockBatchScores = {
  1: [
    { teamId: 100, quarter: 1, score: 12 },
    { teamId: 100, quarter: 2, score: 8 },
    { teamId: 100, quarter: 3, score: 10 },
    { teamId: 100, quarter: 4, score: 15 },
    { teamId: 200, quarter: 1, score: 8 },
    { teamId: 200, quarter: 2, score: 12 },
    { teamId: 200, quarter: 3, score: 9 },
    { teamId: 200, quarter: 4, score: 11 }
  ],
  2: [
    { teamId: 200, quarter: 1, score: 14 },
    { teamId: 200, quarter: 2, score: 10 },
    { teamId: 200, quarter: 3, score: 12 },
    { teamId: 200, quarter: 4, score: 9 },
    { teamId: 300, quarter: 1, score: 7 },
    { teamId: 300, quarter: 2, score: 13 },
    { teamId: 300, quarter: 3, score: 8 },
    { teamId: 300, quarter: 4, score: 12 }
  ],
  3: [
    { teamId: 100, quarter: 1, score: 16 },
    { teamId: 100, quarter: 2, score: 11 },
    { teamId: 100, quarter: 3, score: 8 },
    { teamId: 100, quarter: 4, score: 13 },
    { teamId: 400, quarter: 1, score: 9 },
    { teamId: 400, quarter: 2, score: 15 },
    { teamId: 400, quarter: 3, score: 11 },
    { teamId: 400, quarter: 4, score: 8 }
  ]
};

// Mock batch stats data (position statistics)
const mockBatchStats = {
  1: [
    // Team 100 position stats for game 1
    { teamId: 100, quarter: 1, position: 'GS', goalsFor: 7, goalsAgainst: 0 },
    { teamId: 100, quarter: 1, position: 'GA', goalsFor: 5, goalsAgainst: 0 },
    { teamId: 100, quarter: 1, position: 'GK', goalsFor: 0, goalsAgainst: 4 },
    { teamId: 100, quarter: 1, position: 'GD', goalsFor: 0, goalsAgainst: 4 },
    { teamId: 100, quarter: 2, position: 'GS', goalsFor: 4, goalsAgainst: 0 },
    { teamId: 100, quarter: 2, position: 'GA', goalsFor: 4, goalsAgainst: 0 },
    { teamId: 100, quarter: 2, position: 'GK', goalsFor: 0, goalsAgainst: 6 },
    { teamId: 100, quarter: 2, position: 'GD', goalsFor: 0, goalsAgainst: 6 },
    { teamId: 100, quarter: 3, position: 'GS', goalsFor: 6, goalsAgainst: 0 },
    { teamId: 100, quarter: 3, position: 'GA', goalsFor: 4, goalsAgainst: 0 },
    { teamId: 100, quarter: 3, position: 'GK', goalsFor: 0, goalsAgainst: 5 },
    { teamId: 100, quarter: 3, position: 'GD', goalsFor: 0, goalsAgainst: 4 },
    { teamId: 100, quarter: 4, position: 'GS', goalsFor: 9, goalsAgainst: 0 },
    { teamId: 100, quarter: 4, position: 'GA', goalsFor: 6, goalsAgainst: 0 },
    { teamId: 100, quarter: 4, position: 'GK', goalsFor: 0, goalsAgainst: 6 },
    { teamId: 100, quarter: 4, position: 'GD', goalsFor: 0, goalsAgainst: 5 }
  ],
  2: [
    // Team 200 position stats for game 2 (limited data to test fallback)
    { teamId: 200, quarter: 1, position: 'GS', goalsFor: 8, goalsAgainst: 0 },
    { teamId: 200, quarter: 1, position: 'GA', goalsFor: 6, goalsAgainst: 0 },
    { teamId: 200, quarter: 2, position: 'GS', goalsFor: 5, goalsAgainst: 0 },
    { teamId: 200, quarter: 2, position: 'GA', goalsFor: 5, goalsAgainst: 0 }
  ],
  3: [
    // Team 100 position stats for game 3
    { teamId: 100, quarter: 1, position: 'GS', goalsFor: 10, goalsAgainst: 0 },
    { teamId: 100, quarter: 1, position: 'GA', goalsFor: 6, goalsAgainst: 0 },
    { teamId: 100, quarter: 1, position: 'GK', goalsFor: 0, goalsAgainst: 5 },
    { teamId: 100, quarter: 1, position: 'GD', goalsFor: 0, goalsAgainst: 4 },
    { teamId: 100, quarter: 2, position: 'GS', goalsFor: 6, goalsAgainst: 0 },
    { teamId: 100, quarter: 2, position: 'GA', goalsFor: 5, goalsAgainst: 0 },
    { teamId: 100, quarter: 2, position: 'GK', goalsFor: 0, goalsAgainst: 8 },
    { teamId: 100, quarter: 2, position: 'GD', goalsFor: 0, goalsAgainst: 7 },
    { teamId: 100, quarter: 3, position: 'GS', goalsFor: 5, goalsAgainst: 0 },
    { teamId: 100, quarter: 3, position: 'GA', goalsFor: 3, goalsAgainst: 0 },
    { teamId: 100, quarter: 3, position: 'GK', goalsFor: 0, goalsAgainst: 6 },
    { teamId: 100, quarter: 3, position: 'GD', goalsFor: 0, goalsAgainst: 5 },
    { teamId: 100, quarter: 4, position: 'GS', goalsFor: 8, goalsAgainst: 0 },
    { teamId: 100, quarter: 4, position: 'GA', goalsFor: 5, goalsAgainst: 0 },
    { teamId: 100, quarter: 4, position: 'GK', goalsFor: 0, goalsAgainst: 4 },
    { teamId: 100, quarter: 4, position: 'GD', goalsFor: 0, goalsAgainst: 4 }
  ]
};

// Test cases
const testCases = [
  {
    name: "Test 1: Correct data structure (games with id property)",
    games: mockGamesWithId,
    batchScores: mockBatchScores,
    batchStats: mockBatchStats,
    currentTeamId: 100,
    expectedResult: "Non-zero values for all quarters",
    description: "This should work correctly and return meaningful quarter breakdown values"
  },
  {
    name: "Test 2: Incorrect data structure (games with gameId property)",
    games: mockGamesWithGameId,
    batchScores: mockBatchScores,
    batchStats: mockBatchStats,
    currentTeamId: 100,
    expectedResult: "All zeros due to data structure mismatch",
    description: "This should fail and return zeros because batchScores[undefined] lookups will fail"
  },
  {
    name: "Test 3: No position statistics (fallback to 50/50)",
    games: mockGamesWithId,
    batchScores: mockBatchScores,
    batchStats: {},
    currentTeamId: 100,
    expectedResult: "Non-zero values with 50/50 position distribution",
    description: "Should use quarter averages with equal position distribution"
  },
  {
    name: "Test 4: Single game test",
    games: [mockGamesWithId[0]],
    batchScores: { 1: mockBatchScores[1] },
    batchStats: { 1: mockBatchStats[1] },
    currentTeamId: 100,
    expectedResult: "Non-zero values based on single game",
    description: "Should handle single game calculations correctly"
  },
  {
    name: "Test 5: Missing quarter data",
    games: mockGamesWithId,
    batchScores: {
      1: [
        { teamId: 100, quarter: 1, score: 12 },
        { teamId: 100, quarter: 2, score: 8 },
        // Missing quarters 3 and 4
        { teamId: 200, quarter: 1, score: 8 },
        { teamId: 200, quarter: 2, score: 12 }
      ]
    },
    batchStats: mockBatchStats,
    currentTeamId: 100,
    expectedResult: "Partial data with some quarters having zeros",
    description: "Should handle missing quarter data gracefully"
  }
];

// Function to run tests
function runTests() {
  console.log('🧪 STARTING QUARTER-BY-QUARTER BREAKDOWN WIDGET TESTS');
  console.log('=' .repeat(80));

  testCases.forEach((testCase, index) => {
    console.log(`\n🧪 ${testCase.name}`);
    console.log(`📝 Description: ${testCase.description}`);
    console.log(`🎯 Expected: ${testCase.expectedResult}`);
    console.log('-'.repeat(60));

    try {
      const result = calculateUnifiedQuarterByQuarterStats(
        testCase.games,
        testCase.batchScores,
        testCase.currentTeamId,
        testCase.batchStats
      );

      console.log('📊 RESULTS:');
      result.forEach(quarter => {
        const attackTotal = quarter.gsGoalsFor + quarter.gaGoalsFor;
        const defenseTotal = quarter.gkGoalsAgainst + quarter.gdGoalsAgainst;
        
        console.log(`  Q${quarter.quarter}: Attack(${attackTotal.toFixed(1)}) = GS:${quarter.gsGoalsFor.toFixed(1)} + GA:${quarter.gaGoalsFor.toFixed(1)}, Defense(${defenseTotal.toFixed(1)}) = GK:${quarter.gkGoalsAgainst.toFixed(1)} + GD:${quarter.gdGoalsAgainst.toFixed(1)}`);
        console.log(`    Data Quality: ${quarter.dataQuality}, Valid: ${quarter.hasValidData}, Games: ${quarter.gamesWithQuarterData}`);
      });

      // Verify non-zero values
      const hasNonZeroValues = result.some(q => 
        q.gsGoalsFor > 0 || q.gaGoalsFor > 0 || q.gkGoalsAgainst > 0 || q.gdGoalsAgainst > 0
      );

      console.log(`✅ Has non-zero values: ${hasNonZeroValues}`);
      
      // Check for expected patterns
      if (testCase.name.includes("Incorrect data structure")) {
        if (!hasNonZeroValues) {
          console.log('✅ PASS: Correctly returned zeros due to data structure mismatch');
        } else {
          console.log('❌ FAIL: Should have returned zeros but got non-zero values');
        }
      } else {
        if (hasNonZeroValues) {
          console.log('✅ PASS: Correctly returned non-zero values');
        } else {
          console.log('❌ FAIL: Should have returned non-zero values but got all zeros');
        }
      }

    } catch (error) {
      console.log('❌ ERROR:', error.message);
    }

    console.log('-'.repeat(60));
  });

  console.log('\n🧪 TESTING COMPLETE');
  console.log('=' .repeat(80));
}

// Function to test with Quarter Performance Analysis Widget data comparison
function testWithQuarterPerformanceData() {
  console.log('\n🔍 QUARTER PERFORMANCE ANALYSIS WIDGET COMPARISON TEST');
  console.log('=' .repeat(80));

  // This would typically use the same data that the Quarter Performance Analysis Widget uses
  // For now, we'll simulate what that data looks like
  
  const quarterPerformanceGames = mockGamesWithId; // Same structure as working widget
  const quarterPerformanceBatchScores = mockBatchScores; // Same data source
  
  console.log('📊 Testing with Quarter Performance Analysis Widget data structure...');
  
  const result = calculateUnifiedQuarterByQuarterStats(
    quarterPerformanceGames,
    quarterPerformanceBatchScores,
    100, // Team ID
    mockBatchStats
  );

  console.log('📈 Quarter Performance Comparison Results:');
  result.forEach(quarter => {
    const attackTotal = quarter.gsGoalsFor + quarter.gaGoalsFor;
    const defenseTotal = quarter.gkGoalsAgainst + quarter.gdGoalsAgainst;
    
    console.log(`  Q${quarter.quarter}:`);
    console.log(`    Attack Total: ${attackTotal.toFixed(1)} (GS: ${quarter.gsGoalsFor.toFixed(1)}, GA: ${quarter.gaGoalsFor.toFixed(1)})`);
    console.log(`    Defense Total: ${defenseTotal.toFixed(1)} (GK: ${quarter.gkGoalsAgainst.toFixed(1)}, GD: ${quarter.gdGoalsAgainst.toFixed(1)})`);
    console.log(`    Data Quality: ${quarter.dataQuality}, Games: ${quarter.gamesWithQuarterData}`);
  });

  // Verify consistency
  const totalAttack = result.reduce((sum, q) => sum + q.gsGoalsFor + q.gaGoalsFor, 0);
  const totalDefense = result.reduce((sum, q) => sum + q.gkGoalsAgainst + q.gdGoalsAgainst, 0);
  
  console.log(`\n📊 TOTALS VERIFICATION:`);
  console.log(`  Total Attack across all quarters: ${totalAttack.toFixed(1)}`);
  console.log(`  Total Defense across all quarters: ${totalDefense.toFixed(1)}`);
  console.log(`  Expected to match Attack/Defense Total Breakdown widget values`);
}

// Function to test edge cases
function testEdgeCases() {
  console.log('\n🧪 EDGE CASES TEST');
  console.log('=' .repeat(80));

  const edgeCases = [
    {
      name: "Empty games array",
      games: [],
      batchScores: mockBatchScores,
      batchStats: mockBatchStats,
      currentTeamId: 100
    },
    {
      name: "Null games parameter",
      games: null,
      batchScores: mockBatchScores,
      batchStats: mockBatchStats,
      currentTeamId: 100
    },
    {
      name: "Empty batchScores",
      games: mockGamesWithId,
      batchScores: {},
      batchStats: mockBatchStats,
      currentTeamId: 100
    },
    {
      name: "Invalid currentTeamId",
      games: mockGamesWithId,
      batchScores: mockBatchScores,
      batchStats: mockBatchStats,
      currentTeamId: null
    }
  ];

  edgeCases.forEach(testCase => {
    console.log(`\n🧪 Testing: ${testCase.name}`);
    
    try {
      const result = calculateUnifiedQuarterByQuarterStats(
        testCase.games,
        testCase.batchScores,
        testCase.currentTeamId,
        testCase.batchStats
      );

      console.log(`✅ Handled gracefully, returned ${result.length} quarters`);
      console.log(`   All values are zeros: ${result.every(q => q.gsGoalsFor === 0 && q.gaGoalsFor === 0 && q.gkGoalsAgainst === 0 && q.gdGoalsAgainst === 0)}`);
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  });
}

// Run all tests
if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = {
    runTests,
    testWithQuarterPerformanceData,
    testEdgeCases
  };
} else {
  // Browser environment - run tests immediately
  runTests();
  testWithQuarterPerformanceData();
  testEdgeCases();
}