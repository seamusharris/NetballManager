/**
 * Dashboard Consistency Verification Script
 * 
 * This script helps verify that the Quarter-by-Quarter Breakdown Widget
 * displays consistent data with the actual dashboard API response.
 */

console.log('🔍 DASHBOARD CONSISTENCY VERIFICATION');
console.log('=' .repeat(80));

// Function to manually verify dashboard data consistency
function verifyDashboardConsistency() {
  console.log('\n📋 MANUAL VERIFICATION CHECKLIST');
  console.log('-'.repeat(60));
  
  console.log('\n1. 🌐 NAVIGATE TO DASHBOARD:');
  console.log('   • Go to /team/123/dashboard (or your team ID)');
  console.log('   • Ensure the page loads completely');
  
  console.log('\n2. 🔍 LOCATE WIDGETS:');
  console.log('   • Find "Attack/Defense Quarter-by-Quarter Breakdown" widget');
  console.log('   • Find "Quarter Performance Analysis" widget');
  console.log('   • Find "Attack/Defense Total Breakdown" widget (if separate)');
  
  console.log('\n3. 📊 CHECK TOP ROW (TOTALS):');
  console.log('   • Note the total values shown (e.g., GS: 14.4, GA: 14.4)');
  console.log('   • These should match other total breakdown widgets');
  
  console.log('\n4. 📈 CHECK BOTTOM ROW (QUARTERS):');
  console.log('   • Verify Q1, Q2, Q3, Q4 cards show non-zero values');
  console.log('   • Values should be like "GS: 3.2, GA: 2.1" not "GS: 0.0, GA: 0.0"');
  console.log('   • Each quarter should show meaningful position breakdowns');
  
  console.log('\n5. 🧮 VERIFY CALCULATIONS:');
  console.log('   • Sum quarter values: Q1+Q2+Q3+Q4 should ≈ total values');
  console.log('   • Position totals: GS+GA should ≈ attack total per quarter');
  console.log('   • Position totals: GK+GD should ≈ defense total per quarter');
  
  console.log('\n6. 🔧 CHECK CONSOLE LOGS:');
  console.log('   • Open Developer Tools (F12) → Console');
  console.log('   • Look for "🔍 Quarter calculation result:" logs');
  console.log('   • Verify no errors about data structure mismatches');
  console.log('   • Check detailed calculation verification logs');
  
  console.log('\n7. 📊 COMPARE WITH OTHER WIDGETS:');
  console.log('   • Quarter Performance Analysis should show similar patterns');
  console.log('   • Total values should be consistent across widgets');
  console.log('   • Position percentages should make sense');
  
  console.log('\n8. 🧪 TEST EDGE CASES:');
  console.log('   • Try different teams with varying amounts of data');
  console.log('   • Check teams with limited position statistics');
  console.log('   • Verify behavior with single games vs multiple games');
}

// Function to extract and display current widget values
function extractCurrentWidgetValues() {
  console.log('\n🔍 EXTRACTING CURRENT WIDGET VALUES');
  console.log('-'.repeat(60));
  
  try {
    // Look for quarter breakdown elements
    const quarterElements = document.querySelectorAll('[class*="quarter"], [data-quarter]');
    const attackDefenseElements = document.querySelectorAll('[class*="attack"], [class*="defense"]');
    
    console.log(`Found ${quarterElements.length} quarter elements`);
    console.log(`Found ${attackDefenseElements.length} attack/defense elements`);
    
    // Extract text content and look for patterns
    const allText = Array.from(document.querySelectorAll('*'))
      .map(el => el.textContent || '')
      .join(' ');
    
    // Look for position statistics patterns
    const positionMatches = allText.match(/G[SAKD]:\s*\d+\.?\d*/g) || [];
    const quarterMatches = allText.match(/Q[1-4]/g) || [];
    
    console.log('Position statistics found:', positionMatches.slice(0, 20)); // First 20 matches
    console.log('Quarter references found:', quarterMatches.slice(0, 10)); // First 10 matches
    
    // Look for specific widget containers
    const widgetContainers = document.querySelectorAll('[class*="card"], [class*="widget"], [class*="breakdown"]');
    
    widgetContainers.forEach((container, index) => {
      const text = container.textContent || '';
      if (text.includes('Quarter') && text.includes('Attack')) {
        console.log(`\nWidget ${index + 1} (Quarter + Attack):`, text.substring(0, 300));
      }
    });
    
  } catch (error) {
    console.error('Error extracting widget values:', error);
  }
}

// Function to check API endpoints directly
async function checkAPIEndpoints(teamId = 123) {
  console.log(`\n📡 CHECKING API ENDPOINTS FOR TEAM ${teamId}`);
  console.log('-'.repeat(60));
  
  const endpoints = [
    `/api/teams/${teamId}/games`,
    `/api/teams/${teamId}/batch-scores`,
    `/api/teams/${teamId}/batch-stats`,
    `/api/team/${teamId}/dashboard`
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 Testing ${endpoint}...`);
      const response = await fetch(endpoint);
      
      if (response.ok) {
        const data = await response.json();
        const dataSize = JSON.stringify(data).length;
        console.log(`✅ ${endpoint}: OK (${dataSize} bytes)`);
        
        // Log basic structure
        if (Array.isArray(data)) {
          console.log(`   Array with ${data.length} items`);
          if (data.length > 0) {
            console.log(`   Sample item keys:`, Object.keys(data[0]));
          }
        } else if (typeof data === 'object' && data !== null) {
          console.log(`   Object with keys:`, Object.keys(data));
          if (data.data && Array.isArray(data.data)) {
            console.log(`   Contains data array with ${data.data.length} items`);
          }
        }
      } else {
        console.log(`❌ ${endpoint}: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: Error - ${error.message}`);
    }
  }
}

// Function to provide specific debugging steps
function debugQuarterWidget() {
  console.log('\n🐛 QUARTER WIDGET DEBUGGING STEPS');
  console.log('-'.repeat(60));
  
  console.log('\n1. 🔍 CHECK DATA FLOW:');
  console.log('   • Verify games have "id" property (not "gameId")');
  console.log('   • Check batchScores[game.id] returns data');
  console.log('   • Verify batchStats contains position statistics');
  
  console.log('\n2. 🧮 VERIFY CALCULATIONS:');
  console.log('   • Check quarter score averages are calculated correctly');
  console.log('   • Verify position percentages are not all 50/50');
  console.log('   • Ensure multiplication of averages × percentages works');
  
  console.log('\n3. 🔧 COMMON ISSUES:');
  console.log('   • Data structure mismatch (gameId vs id)');
  console.log('   • Empty batchScores object');
  console.log('   • Missing position statistics');
  console.log('   • Incorrect team ID filtering');
  
  console.log('\n4. 📊 EXPECTED BEHAVIOR:');
  console.log('   • Non-zero values in quarter cards when data exists');
  console.log('   • Values formatted to 1 decimal place');
  console.log('   • Consistent totals across widgets');
  console.log('   • Meaningful position breakdowns');
  
  console.log('\n5. 🧪 TESTING COMMANDS:');
  console.log('   • Run browser-dashboard-test.js in console');
  console.log('   • Use inspectQuarterWidget() function');
  console.log('   • Check window.quarterTestResults object');
}

// Main verification function
function runVerification() {
  console.log('\n🚀 RUNNING DASHBOARD CONSISTENCY VERIFICATION');
  console.log('=' .repeat(80));
  
  // Get team ID from URL
  const urlParts = window.location.pathname.split('/');
  const teamIdIndex = urlParts.indexOf('team') + 1;
  const teamId = teamIdIndex > 0 && teamIdIndex < urlParts.length ? 
    parseInt(urlParts[teamIdIndex]) : 123;
  
  console.log(`📍 Current Team ID: ${teamId}`);
  
  // Run verification steps
  verifyDashboardConsistency();
  extractCurrentWidgetValues();
  
  // Check API endpoints if possible
  if (typeof fetch !== 'undefined') {
    checkAPIEndpoints(teamId);
  }
  
  debugQuarterWidget();
  
  console.log('\n✅ VERIFICATION COMPLETE');
  console.log('Follow the manual steps above to verify dashboard consistency');
}

// Make functions available globally
if (typeof window !== 'undefined') {
  window.verifyDashboardConsistency = verifyDashboardConsistency;
  window.extractCurrentWidgetValues = extractCurrentWidgetValues;
  window.checkAPIEndpoints = checkAPIEndpoints;
  window.debugQuarterWidget = debugQuarterWidget;
  window.runVerification = runVerification;
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  runVerification();
} else {
  console.log('📝 This script should be run in a browser environment');
  console.log('Copy and paste into browser console while on the dashboard page');
}