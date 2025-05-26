
#!/usr/bin/env node

/**
 * Simple test script to verify score calculation and caching functionality
 * Run with: node test-score-functionality.js
 */

const BASE_URL = 'http://localhost:5000';

async function makeRequest(method, endpoint, body = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  
  if (body) options.body = JSON.stringify(body);
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function log(message, type = 'info') {
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warn' ? '⚠️' : 'ℹ️';
  console.log(`${prefix} ${message}`);
}

async function testLiveStatsToCompletedFlow() {
  log('🎯 Testing: Live Stats → Status Change → Games List Flow');
  
  try {
    // Step 1: Get existing games
    const gamesResult = await makeRequest('GET', '/api/games');
    if (!gamesResult.success) throw new Error('Failed to get games');
    
    // Find a game with stats but not completed
    const testGame = gamesResult.data.find(g => 
      g.status !== 'completed' && 
      g.status !== 'forfeit-win' && 
      g.status !== 'forfeit-loss'
    );
    
    if (!testGame) {
      log('No suitable test game found', 'warn');
      return false;
    }
    
    log(`Testing with game ${testGame.id} (status: ${testGame.status})`);
    
    // Step 2: Get current stats
    const statsResult = await makeRequest('GET', `/api/games/${testGame.id}/stats`);
    if (!statsResult.success) throw new Error('Failed to get game stats');
    
    log(`Game has ${statsResult.data.length} stats entries`);
    
    // Step 3: Change status to completed
    log('Changing game status to completed...');
    const statusResult = await makeRequest('PATCH', `/api/games/${testGame.id}`, {
      status: 'completed',
      completed: true
    });
    
    if (!statusResult.success) throw new Error('Failed to update game status');
    log('✓ Status changed to completed');
    
    // Step 4: Test scores access after status change
    log('Testing scores access after status change...');
    const scoresAfterResult = await makeRequest('GET', `/api/games/${testGame.id}/stats`);
    if (!scoresAfterResult.success) throw new Error('Failed to get scores after status change');
    
    // Step 5: Test batch scores
    log('Testing batch scores...');
    const batchResult = await makeRequest('GET', `/api/games/stats/batch?gameIds=${testGame.id}`);
    if (!batchResult.success) throw new Error('Failed to get batch scores');
    
    if (!batchResult.data[testGame.id]) {
      throw new Error(`No scores found for game ${testGame.id} in batch result`);
    }
    
    // Revert status back to original
    log('Reverting game status...');
    await makeRequest('PATCH', `/api/games/${testGame.id}`, {
      status: testGame.status,
      completed: testGame.completed
    });
    
    log('✅ Live stats to completed flow test passed!', 'success');
    return true;
    
  } catch (error) {
    log(`Test failed: ${error.message}`, 'error');
    return false;
  }
}

async function testCachePerformance() {
  log('🎯 Testing: Cache Performance');
  
  try {
    const gamesResult = await makeRequest('GET', '/api/games');
    if (!gamesResult.success) throw new Error('Failed to get games');
    
    const testGameId = gamesResult.data[0]?.id;
    if (!testGameId) throw new Error('No games available for testing');
    
    // Make multiple requests and measure timing
    const times = [];
    for (let i = 0; i < 3; i++) {
      const start = Date.now();
      const result = await makeRequest('GET', `/api/games/${testGameId}/stats`);
      const duration = Date.now() - start;
      times.push(duration);
      
      if (!result.success) throw new Error('Failed to get scores');
    }
    
    log(`Response times: ${times.join('ms, ')}ms`);
    log('✅ Cache performance test completed', 'success');
    return true;
    
  } catch (error) {
    log(`Cache test failed: ${error.message}`, 'error');
    return false;
  }
}

async function testErrorScenarios() {
  log('🎯 Testing: Error Scenarios');
  
  try {
    // Test invalid game ID
    const invalidResult = await makeRequest('GET', '/api/games/99999/stats');
    if (invalidResult.success) {
      throw new Error('Expected error for invalid game ID');
    }
    
    log('✓ Invalid game ID handling works');
    
    // Test invalid batch request
    const invalidBatchResult = await makeRequest('GET', '/api/games/stats/batch?gameIds=99999');
    if (!invalidBatchResult.success) {
      log('✓ Invalid batch request handled gracefully');
    }
    
    log('✅ Error scenarios test passed', 'success');
    return true;
    
  } catch (error) {
    log(`Error scenarios test failed: ${error.message}`, 'error');
    return false;
  }
}

async function main() {
  console.log('🧪 Score Functionality Test Suite\n');
  
  const results = [];
  
  try {
    results.push(await testLiveStatsToCompletedFlow());
    results.push(await testCachePerformance());
    results.push(await testErrorScenarios());
    
    const passed = results.filter(r => r).length;
    const total = results.length;
    
    console.log(`\n📊 Results: ${passed}/${total} tests passed`);
    
    if (passed === total) {
      console.log('🎉 All tests passed!');
    } else {
      console.log('❌ Some tests failed');
    }
    
  } catch (error) {
    console.error('💥 Test suite crashed:', error.message);
  }
}

// Check if fetch is available
if (typeof fetch === 'undefined') {
  console.error('❌ fetch is not available. Please run with Node.js 18+ or install node-fetch');
  process.exit(1);
}

main();
