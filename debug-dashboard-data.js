/**
 * Debug Dashboard Data Flow
 * 
 * This script helps debug the actual data being passed to the 
 * CompactAttackDefenseWidget to identify inconsistencies.
 */

console.log('🔍 DEBUGGING DASHBOARD DATA FLOW');
console.log('=' .repeat(80));

// Function to inspect the actual data being passed to widgets
function inspectDashboardData() {
  console.log('\n📊 INSPECTING DASHBOARD DATA...');
  
  // Try to access React DevTools data if available
  if (typeof window !== 'undefined' && window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('✅ React DevTools detected');
  }
  
  // Look for console logs from the Dashboard component
  console.log('\n🔍 Look for these console logs in the browser:');
  console.log('  - "🔍 BATCH SCORES QUERY RUNNING:"');
  console.log('  - "🔍 Game IDs for batch scores:"');
  console.log('  - "🔍 Batch scores API result:"');
  console.log('  - "🔍 Quarter calculation result:"');
  console.log('  - "🔍 allSeasonGamesWithStatistics sample:"');
  
  // Instructions for manual inspection
  console.log('\n📋 MANUAL INSPECTION STEPS:');
  console.log('1. Open Dashboard page in browser');
  console.log('2. Open Developer Tools (F12) → Console');
  console.log('3. Look for the logs above to see actual data structure');
  console.log('4. Check if batchScores keys are numbers or strings');
  console.log('5. Verify games have "id" property (not "gameId")');
  console.log('6. Check if quarter calculations return non-zero values');
}

// Function to test data consistency
function testDataConsistency() {
  console.log('\n🧪 TESTING DATA CONSISTENCY...');
  
  // Check if we can access the actual data from the page
  try {
    // Look for React components in the DOM
    const reactElements = document.querySelectorAll('[data-reactroot], [data-react-checksum]');
    console.log(`Found ${reactElements.length} React elements`);
    
    // Look for specific widget elements
    const attackDefenseElements = document.querySelectorAll('[class*="attack"], [class*="defense"]');
    console.log(`Found ${attackDefenseElements.length} attack/defense elements`);
    
    // Check for quarter elements
    const quarterElements = document.querySelectorAll('[class*="quarter"]');
    console.log(`Found ${quarterElements.length} quarter elements`);
    
    // Look for zero values (indicating the bug)
    const textContent = document.body.textContent || '';
    const zeroMatches = textContent.match(/G[SAKD]:\s*0\.0/g) || [];
    console.log(`Found ${zeroMatches.length} zero values:`, zeroMatches.slice(0, 10));
    
    // Look for non-zero values (indicating success)
    const nonZeroMatches = textContent.match(/G[SAKD]:\s*[1-9]\d*\.?\d*/g) || [];
    console.log(`Found ${nonZeroMatches.length} non-zero values:`, nonZeroMatches.slice(0, 10));
    
  } catch (error) {
    console.error('Error inspecting DOM:', error);
  }
}

// Function to check API endpoints
async function checkAPIEndpoints() {
  console.log('\n📡 CHECKING API ENDPOINTS...');
  
  try {
    // Get team ID from URL
    const urlParts = window.location.pathname.split('/');
    const teamIdIndex = urlParts.indexOf('team') + 1;
    const teamId = teamIdIndex > 0 ? parseInt(urlParts[teamIdIndex]) : 123;
    
    console.log(`Testing with team ID: ${teamId}`);
    
    // Test games endpoint
    try {
      const gamesResponse = await fetch(`/api/teams/${teamId}/games`);
      if (gamesResponse.ok) {
        const gamesData = await gamesResponse.json();
        console.log('✅ Games endpoint working');
        console.log(`   Found ${gamesData.length || 0} games`);
        if (gamesData.length > 0) {
          console.log('   Sample game keys:', Object.keys(gamesData[0]));
          console.log('   Has id property:', 'id' in gamesData[0]);
          console.log('   Has gameId property:', 'gameId' in gamesData[0]);
        }
      } else {
        console.log('❌ Games endpoint failed:', gamesResponse.status);
      }
    } catch (error) {
      console.log('❌ Games endpoint error:', error.message);
    }
    
    // Test batch scores endpoint (this might be the issue)
    try {
      const scoresResponse = await fetch(`/api/clubs/1/games/scores/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameIds: [1, 2, 3] }) // Sample IDs
      });
      
      if (scoresResponse.ok) {
        const scoresData = await scoresResponse.json();
        console.log('✅ Batch scores endpoint working');
        console.log('   Keys type:', typeof Object.keys(scoresData)[0]);
        console.log('   Sample keys:', Object.keys(scoresData).slice(0, 5));
      } else {
        console.log('❌ Batch scores endpoint failed:', scoresResponse.status);
      }
    } catch (error) {
      console.log('❌ Batch scores endpoint error:', error.message);
    }
    
  } catch (error) {
    console.error('Error checking API endpoints:', error);
  }
}

// Function to provide debugging recommendations
function provideDebuggingRecommendations() {
  console.log('\n💡 DEBUGGING RECOMMENDATIONS:');
  console.log('=' .repeat(60));
  
  console.log('\n1. 🔍 DATA TYPE MISMATCH:');
  console.log('   • Check if batchScores keys are numbers vs strings');
  console.log('   • Verify games have "id" property, not "gameId"');
  console.log('   • Ensure calculateUnifiedQuarterByQuarterStats gets correct data types');
  
  console.log('\n2. 🧮 CALCULATION ISSUES:');
  console.log('   • Verify quarter score averages are calculated correctly');
  console.log('   • Check if position percentages are being applied');
  console.log('   • Ensure non-zero values when data is available');
  
  console.log('\n3. 🔧 COMMON FIXES:');
  console.log('   • Update CompactAttackDefenseWidget prop types');
  console.log('   • Fix batchScores key type (number vs string)');
  console.log('   • Ensure consistent data structure across components');
  
  console.log('\n4. 🧪 TESTING STEPS:');
  console.log('   • Run this script in browser console on dashboard page');
  console.log('   • Check console logs for data structure details');
  console.log('   • Verify API endpoints return expected data');
  console.log('   • Test with different teams/data scenarios');
}

// Main execution
function main() {
  inspectDashboardData();
  testDataConsistency();
  
  if (typeof fetch !== 'undefined') {
    checkAPIEndpoints();
  }
  
  provideDebuggingRecommendations();
  
  console.log('\n✅ DEBUGGING COMPLETE');
  console.log('Check the output above and follow the recommendations');
}

// Make functions available globally
if (typeof window !== 'undefined') {
  window.debugDashboard = {
    inspectDashboardData,
    testDataConsistency,
    checkAPIEndpoints,
    provideDebuggingRecommendations,
    main
  };
  
  // Auto-run
  main();
} else {
  console.log('Run this script in browser console on the dashboard page');
}