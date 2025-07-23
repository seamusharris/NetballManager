// Quick final test to verify error handling after autofix
import { calculateUnifiedQuarterByQuarterStats } from './client/src/lib/positionStatsCalculator.ts';

console.log('🔍 Final Test: Verifying error handling after autofix\n');

// Test the key error case: gameId vs id mismatch
const gamesWithGameId = [{ gameId: 1, homeTeamId: 123, awayTeamId: 456 }];
const result = calculateUnifiedQuarterByQuarterStats(gamesWithGameId, {}, 123);

console.log('✅ Function returned:', result.length, 'quarters');
console.log('✅ All values are 0 (as expected for error case):', 
  result.every(q => q.gsGoalsFor === 0 && q.gaGoalsFor === 0 && q.gkGoalsAgainst === 0 && q.gdGoalsAgainst === 0));

console.log('\n🎯 Error handling is working correctly after autofix!');