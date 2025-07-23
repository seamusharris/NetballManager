/**
 * Browser Console Test for Quarter-by-Quarter Breakdown Widget
 * 
 * Run this script in the browser console while on the Dashboard page
 * to test with real data from /team/123/dashboard
 */

(async function testQuarterBreakdownWithRealData() {
  console.log('🧪 TESTING QUARTER-BY-QUARTER BREAKDOWN WITH REAL DASHBOARD DATA');
  console.log('=' .repeat(80));
  
  try {
    // Get the current team ID from the URL
    const urlParts = window.location.pathname.split('/');
    const teamIdIndex = urlParts.indexOf('team') + 1;
    const teamId = teamIdIndex > 0 && teamIdIndex < urlParts.length ? 
      parseInt(urlParts[teamIdIndex]) : 123;
    
    console.log(`📍 Testing with Team ID: ${teamId}`);
    
    // Fetch real dashboard data
    console.log('📡 Fetching dashboard data...');
    
    // Try to get data from the existing React components if available
    let dashboardData = null;
    
    // Method 1: Try to access React component data
    if (window.React && window.ReactDOM) {
      console.log('🔍 Attempting to access React component data...');
      // This would access the actual component state if possible
    }
    
    // Method 2: Make direct API calls
    console.log('📡 Making API calls for dashboard data...');
    
    const [gamesResponse, scoresResponse, statsResponse] = await Promise.all([
      fetch(`/api/teams/${teamId}/games`).catch(e => ({ ok: false, error: e })),
      fetch(`/api/teams/${teamId}/batch-scores`).catch(e => ({ ok: false, error: e })),
      fetch(`/api/teams/${teamId}/batch-stats`).catch(e => ({ ok: false, error: e }))
    ]);
    
    let games = [], batchScores = {}, batchStats = {};
    
    if (gamesResponse.ok) {
      const gamesData = await gamesResponse.json();
      games = gamesData.data || gamesData || [];
      console.log(`✅ Fetched ${games.length} games`);
    } else {
      console.log('⚠️ Could not fetch games data');
    }
    
    if (scoresResponse.ok) {
      const scoresData = await scoresResponse.json();
      batchScores = scoresData.data || scoresData || {};
      console.log(`✅ Fetched batch scores for ${Object.keys(batchScores).length} games`);
    } else {
      console.log('⚠️ Could not fetch batch scores data');
    }
    
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      batchStats = statsData.data || statsData || {};
      console.log(`✅ Fetched batch stats for ${Object.keys(batchStats).length} games`);
    } else {
      console.log('⚠️ Could not fetch batch stats data');
    }
    
    // Filter games like Dashboard component does
    const completedGamesWithStats = games.filter(game => 
      game.status === 'completed' && 
      (game.statusAllowsStatistics === true || game.statusAllowsStatistics === 1)
    );
    
    console.log(`📊 Found ${completedGamesWithStats.length} completed games with statistics enabled`);
    
    if (completedGamesWithStats.length === 0) {
      console.log('❌ No games available for testing');
      return;
    }
    
    // Log sample data structure
    console.log('🔍 Sample game structure:', completedGamesWithStats[0]);
    console.log('🔍 Sample batch scores:', Object.keys(batchScores)[0], batchScores[Object.keys(batchScores)[0]]?.[0]);
    console.log('🔍 Sample batch stats:', Object.keys(batchStats)[0], batchStats[Object.keys(batchStats)[0]]?.[0]);
    
    // Test the calculation function (assuming it's available globally or can be imported)
    console.log('\n🧮 Testing calculateUnifiedQuarterByQuarterStats...');
    
    // Since we can't import in browser console, we'll simulate the calculation
    // or access it from the global scope if available
    let quarterResults = [];
    
    if (typeof calculateUnifiedQuarterByQuarterStats === 'function') {
      quarterResults = calculateUnifiedQuarterByQuarterStats(
        completedGamesWithStats,
        batchScores,
        teamId,
        batchStats
      );
    } else {
      console.log('⚠️ calculateUnifiedQuarterByQuarterStats function not available in global scope');
      console.log('📝 Manual calculation verification required');
      
      // Provide manual verification steps
      console.log('\n📋 Manual Verification Steps:');
      console.log('1. Check the Quarter-by-Quarter Breakdown widget on this page');
      console.log('2. Verify it shows non-zero values in quarter cards');
      console.log('3. Compare with Quarter Performance Analysis widget');
      console.log('4. Check browser console for calculation logs');
      
      return;
    }
    
    // Display results
    console.log('\n📈 QUARTER-BY-QUARTER RESULTS:');
    console.log('-'.repeat(60));
    
    quarterResults.forEach(quarter => {
      const attackTotal = quarter.gsGoalsFor + quarter.gaGoalsFor;
      const defenseTotal = quarter.gkGoalsAgainst + quarter.gdGoalsAgainst;
      
      console.log(`Q${quarter.quarter}: Attack(${attackTotal.toFixed(1)}) Defense(${defenseTotal.toFixed(1)})`);
      console.log(`  GS: ${quarter.gsGoalsFor.toFixed(1)}, GA: ${quarter.gaGoalsFor.toFixed(1)}`);
      console.log(`  GK: ${quarter.gkGoalsAgainst.toFixed(1)}, GD: ${quarter.gdGoalsAgainst.toFixed(1)}`);
      console.log(`  Quality: ${quarter.dataQuality}, Games: ${quarter.gamesWithQuarterData}`);
    });
    
    // Calculate totals
    const totalAttack = quarterResults.reduce((sum, q) => sum + q.gsGoalsFor + q.gaGoalsFor, 0);
    const totalDefense = quarterResults.reduce((sum, q) => sum + q.gkGoalsAgainst + q.gdGoalsAgainst, 0);
    
    console.log('\n📊 TOTALS:');
    console.log(`Total Attack: ${totalAttack.toFixed(1)}`);
    console.log(`Total Defense: ${totalDefense.toFixed(1)}`);
    
    // Check for non-zero values
    const hasNonZeroValues = quarterResults.some(q => 
      q.gsGoalsFor > 0 || q.gaGoalsFor > 0 || q.gkGoalsAgainst > 0 || q.gdGoalsAgainst > 0
    );
    
    console.log(`\n✅ Has non-zero values: ${hasNonZeroValues ? 'YES' : 'NO'}`);
    
    // Visual verification instructions
    console.log('\n📋 VISUAL VERIFICATION:');
    console.log('1. Look at the Attack/Defense Quarter-by-Quarter Breakdown widget on this page');
    console.log('2. The bottom row should show the calculated values above');
    console.log('3. Compare with the top row (total breakdown) for consistency');
    console.log('4. Check that values match the Quarter Performance Analysis widget patterns');
    
    // Return results for further inspection
    window.quarterTestResults = {
      quarterResults,
      totalAttack,
      totalDefense,
      hasNonZeroValues,
      games: completedGamesWithStats,
      batchScores,
      batchStats
    };
    
    console.log('\n💾 Results saved to window.quarterTestResults for inspection');
    
  } catch (error) {
    console.error('❌ Error testing with real dashboard data:', error);
    console.log('\n📝 Fallback verification:');
    console.log('1. Check the Quarter-by-Quarter Breakdown widget visually');
    console.log('2. Verify it shows non-zero values instead of all zeros');
    console.log('3. Compare values with other widgets for consistency');
  }
})();

// Helper function to inspect current widget state
function inspectQuarterWidget() {
  console.log('🔍 INSPECTING QUARTER-BY-QUARTER BREAKDOWN WIDGET');
  console.log('=' .repeat(60));
  
  // Look for the widget in the DOM
  const widgets = document.querySelectorAll('[class*="attack"], [class*="defense"], [class*="quarter"]');
  
  console.log(`Found ${widgets.length} potential widget elements`);
  
  widgets.forEach((widget, index) => {
    const text = widget.textContent || widget.innerText || '';
    if (text.includes('Attack') || text.includes('Defense') || text.includes('Quarter')) {
      console.log(`Widget ${index + 1}:`, text.substring(0, 200) + '...');
      
      // Look for quarter values
      const quarterMatches = text.match(/Q[1-4]|GS:\s*\d+\.?\d*|GA:\s*\d+\.?\d*|GK:\s*\d+\.?\d*|GD:\s*\d+\.?\d*/g);
      if (quarterMatches) {
        console.log(`  Quarter data found:`, quarterMatches);
      }
    }
  });
}

// Make helper function available globally
window.inspectQuarterWidget = inspectQuarterWidget;

console.log('\n📝 Additional helper functions available:');
console.log('- window.inspectQuarterWidget() - Inspect current widget DOM');
console.log('- window.quarterTestResults - Test results object');