/**
 * Test with Actual Dashboard Data
 * 
 * This script should be run in the browser console while on the dashboard page
 * to test the Quarter-by-Quarter Breakdown Widget with real data.
 */

console.log('🧪 TESTING QUARTER-BY-QUARTER BREAKDOWN WITH ACTUAL DASHBOARD DATA');
console.log('=' .repeat(80));

// Function to extract and test real dashboard data
function testWithActualData() {
  console.log('\n🔍 EXTRACTING REAL DASHBOARD DATA...');
  
  // Look for existing console logs from Dashboard component
  console.log('\n📋 Check for these existing console logs:');
  console.log('  - "🔍 Quarter calculation result:" - Shows the actual calculation output');
  console.log('  - "🔍 allSeasonGamesWithStatistics sample:" - Shows game data structure');
  console.log('  - "🔍 Batch scores API result:" - Shows batchScores structure');
  console.log('  - "🔍 Sample batchStats data:" - Shows batchStats structure');
  
  // Try to access global React state if available
  if (typeof window !== 'undefined') {
    // Look for React Fiber nodes to extract component state
    const reactElements = document.querySelectorAll('[data-reactroot]');
    if (reactElements.length > 0) {
      console.log('✅ Found React root elements');
    }
  }
  
  // Check current widget display
  console.log('\n🔍 CHECKING CURRENT WIDGET DISPLAY...');
  
  // Look for quarter cards with zero values (the bug)
  const bodyText = document.body.textContent || '';
  const zeroValues = bodyText.match(/G[SAKD]:\s*0\.0/g) || [];
  const nonZeroValues = bodyText.match(/G[SAKD]:\s*[1-9]\d*\.?\d*/g) || [];
  
  console.log(`❌ Found ${zeroValues.length} zero values:`, zeroValues.slice(0, 10));
  console.log(`✅ Found ${nonZeroValues.length} non-zero values:`, nonZeroValues.slice(0, 10));
  
  if (zeroValues.length > nonZeroValues.length) {
    console.log('🚨 BUG CONFIRMED: More zero values than non-zero values detected');
    console.log('   This indicates the Quarter-by-Quarter widget is showing zeros');
  } else {
    console.log('✅ Widget appears to be working - more non-zero values detected');
  }
  
  return {
    zeroValues: zeroValues.length,
    nonZeroValues: nonZeroValues.length,
    bugDetected: zeroValues.length > nonZeroValues.length
  };
}

// Function to manually test the calculation function
function testCalculationFunction() {
  console.log('\n🧮 TESTING CALCULATION FUNCTION...');
  
  // Check if the function is available globally
  if (typeof calculateUnifiedQuarterByQuarterStats === 'function') {
    console.log('✅ calculateUnifiedQuarterByQuarterStats function found');
    
    // Try to call it with sample data
    const sampleGames = [
      { id: 1, homeTeamId: 123, awayTeamId: 456, status: 'completed' }
    ];
    
    const sampleBatchScores = {
      1: [
        { teamId: 123, quarter: 1, score: 12 },
        { teamId: 123, quarter: 2, score: 8 },
        { teamId: 123, quarter: 3, score: 10 },
        { teamId: 123, quarter: 4, score: 15 },
        { teamId: 456, quarter: 1, score: 8 },
        { teamId: 456, quarter: 2, score: 12 },
        { teamId: 456, quarter: 3, score: 9 },
        { teamId: 456, quarter: 4, score: 11 }
      ]
    };
    
    const sampleBatchStats = {
      1: [
        { teamId: 123, quarter: 1, position: 'GS', goalsFor: 7, goalsAgainst: 0 },
        { teamId: 123, quarter: 1, position: 'GA', goalsFor: 5, goalsAgainst: 0 }
      ]
    };
    
    try {
      const result = calculateUnifiedQuarterByQuarterStats(
        sampleGames, 
        sampleBatchScores, 
        123, 
        sampleBatchStats
      );
      
      console.log('✅ Function executed successfully');
      console.log('📊 Sample result:', result);
      
      const hasNonZeroValues = result.some(q => 
        q.gsGoalsFor > 0 || q.gaGoalsFor > 0 || q.gkGoalsAgainst > 0 || q.gdGoalsAgainst > 0
      );
      
      console.log(`✅ Produces non-zero values: ${hasNonZeroValues}`);
      
      return { success: true, hasNonZeroValues, result };
    } catch (error) {
      console.error('❌ Function execution failed:', error);
      return { success: false, error: error.message };
    }
  } else {
    console.log('❌ calculateUnifiedQuarterByQuarterStats function not available');
    console.log('   This might indicate the function is not in global scope');
    return { success: false, error: 'Function not available' };
  }
}

// Function to provide specific debugging steps
function provideDebuggingSteps() {
  console.log('\n🔧 DEBUGGING STEPS FOR QUARTER-BY-QUARTER WIDGET:');
  console.log('-'.repeat(60));
  
  console.log('\n1. 📊 CHECK CONSOLE LOGS:');
  console.log('   • Look for "🔍 Quarter calculation result:" in console');
  console.log('   • Check if result shows all zeros or actual values');
  console.log('   • Verify "🔍 allSeasonGamesWithStatistics sample:" shows games with "id" property');
  
  console.log('\n2. 🔍 INSPECT WIDGET VISUALLY:');
  console.log('   • Find the Attack/Defense Quarter-by-Quarter Breakdown widget');
  console.log('   • Check if quarter cards (Q1, Q2, Q3, Q4) show "GS: 0.0, GA: 0.0"');
  console.log('   • Compare with top row totals which should show non-zero values');
  
  console.log('\n3. 🧮 VERIFY DATA STRUCTURE:');
  console.log('   • Games should have "id" property, not "gameId"');
  console.log('   • batchScores should have numeric keys (1, 2, 3) not string keys');
  console.log('   • batchStats should contain position statistics');
  
  console.log('\n4. 🔧 COMMON FIXES:');
  console.log('   • Ensure CompactAttackDefenseWidget receives correct data types');
  console.log('   • Verify calculateUnifiedQuarterByQuarterStats handles data correctly');
  console.log('   • Check that Dashboard passes allSeasonGamesWithStatistics (not unifiedData)');
  
  console.log('\n5. 🧪 MANUAL TESTING:');
  console.log('   • Run testCalculationFunction() to test with sample data');
  console.log('   • Check different teams to see if issue is data-specific');
  console.log('   • Verify behavior with teams that have limited data');
}

// Function to check specific data inconsistencies
function checkDataInconsistencies() {
  console.log('\n🔍 CHECKING FOR DATA INCONSISTENCIES...');
  
  // Check if there are multiple attack/defense widgets with different values
  const attackElements = Array.from(document.querySelectorAll('*')).filter(el => {
    const text = el.textContent || '';
    return text.includes('Attack') && text.includes('Defense') && text.includes('GS:');
  });
  
  console.log(`Found ${attackElements.length} potential attack/defense widgets`);
  
  attackElements.forEach((element, index) => {
    const text = element.textContent || '';
    const gsMatches = text.match(/GS:\s*(\d+\.?\d*)/g) || [];
    const gaMatches = text.match(/GA:\s*(\d+\.?\d*)/g) || [];
    
    console.log(`Widget ${index + 1}:`);
    console.log(`  GS values: ${gsMatches.join(', ')}`);
    console.log(`  GA values: ${gaMatches.join(', ')}`);
  });
  
  // Check for inconsistencies between widgets
  const allGsValues = bodyText.match(/GS:\s*(\d+\.?\d*)/g) || [];
  const uniqueGsValues = [...new Set(allGsValues)];
  
  if (uniqueGsValues.length > 2) {
    console.log('⚠️ INCONSISTENCY DETECTED: Multiple different GS values found');
    console.log('   This suggests widgets are showing different data');
    console.log('   Unique GS values:', uniqueGsValues);
  } else {
    console.log('✅ GS values appear consistent across widgets');
  }
}

// Main execution function
function main() {
  console.log('\n🚀 RUNNING ACTUAL DASHBOARD DATA TEST');
  console.log('=' .repeat(80));
  
  const displayTest = testWithActualData();
  const calculationTest = testCalculationFunction();
  checkDataInconsistencies();
  provideDebuggingSteps();
  
  console.log('\n📊 TEST RESULTS SUMMARY:');
  console.log('=' .repeat(60));
  console.log(`  Zero values found: ${displayTest.zeroValues}`);
  console.log(`  Non-zero values found: ${displayTest.nonZeroValues}`);
  console.log(`  Bug detected: ${displayTest.bugDetected ? '❌ YES' : '✅ NO'}`);
  console.log(`  Calculation function works: ${calculationTest.success ? '✅ YES' : '❌ NO'}`);
  
  if (calculationTest.success) {
    console.log(`  Function produces non-zero values: ${calculationTest.hasNonZeroValues ? '✅ YES' : '❌ NO'}`);
  }
  
  // Provide next steps
  console.log('\n📋 NEXT STEPS:');
  if (displayTest.bugDetected) {
    console.log('  1. ❌ Bug confirmed - Quarter cards showing zeros');
    console.log('  2. 🔧 Check console logs for "🔍 Quarter calculation result:"');
    console.log('  3. 🧮 Verify data structure in Dashboard component');
    console.log('  4. 🔄 Fix data type mismatches if found');
  } else {
    console.log('  1. ✅ Widget appears to be working correctly');
    console.log('  2. 🔍 Verify values are consistent across different teams');
    console.log('  3. 🧪 Test edge cases with limited data');
  }
  
  // Save results for inspection
  window.dashboardTestResults = {
    displayTest,
    calculationTest,
    timestamp: new Date().toISOString()
  };
  
  console.log('\n💾 Results saved to window.dashboardTestResults');
  
  return {
    displayTest,
    calculationTest,
    bugDetected: displayTest.bugDetected,
    functionWorks: calculationTest.success
  };
}

// Make functions available globally
if (typeof window !== 'undefined') {
  window.testActualDashboardData = {
    main,
    testWithActualData,
    testCalculationFunction,
    checkDataInconsistencies,
    provideDebuggingSteps
  };
  
  // Auto-run the test
  main();
} else {
  console.log('📝 This script should be run in browser console on the dashboard page');
}

console.log('\n📝 USAGE INSTRUCTIONS:');
console.log('1. Navigate to /team/123/dashboard in your browser');
console.log('2. Open Developer Tools (F12) → Console tab');
console.log('3. This script should run automatically');
console.log('4. Check the test results and follow the debugging steps');
console.log('5. Use window.testActualDashboardData.main() to re-run tests');