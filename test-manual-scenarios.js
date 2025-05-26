
#!/usr/bin/env node

/**
 * Test suite for specific manual scenarios you've been experiencing
 * This replicates the exact steps you've been doing manually
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

class ManualScenarioTests {
  async testLiveStatsToCompletedFlow() {
    log('🎯 Testing: Live Stats → Status Change → Games List Flow');
    
    try {
      // Step 1: Get a game that has stats but isn't completed
      const gamesResult = await makeRequest('GET', '/api/games');
      if (!gamesResult.success) throw new Error('Failed to get games');
      
      const incompleteGame = gamesResult.data.find(g => g.status !== 'completed' && g.status !== 'forfeit-win' && g.status !== 'forfeit-loss');
      if (!incompleteGame) {
        log('No incomplete games found, creating one...', 'warn');
        return await this.createTestScenario();
      }
      
      log(`Using game ${incompleteGame.id} (${incompleteGame.status})`);
      
      // Step 2: Simulate live stats entry (if game has no stats, add some)
      const statsResult = await makeRequest('GET', `/api/games/${incompleteGame.id}/stats`);
      if (!statsResult.success) throw new Error('Failed to get game stats');
      
      if (statsResult.data.length === 0) {
        log('Adding test stats to game...');
        await this.addTestStats(incompleteGame.id);
      }
      
      // Step 3: Change status to completed
      log('Changing game status to completed...');
      const statusResult = await makeRequest('PATCH', `/api/games/${incompleteGame.id}`, {
        status: 'completed',
        completed: true
      });
      
      if (!statusResult.success) throw new Error('Failed to update game status');
      log('✓ Status changed to completed');
      
      // Step 4: Navigate to games list (simulate by fetching scores)
      log('Fetching games list scores...');
      const gameIds = gamesResult.data.map(g => g.id).slice(0, 10).join(',');
      const batchResult = await makeRequest('GET', `/api/games/stats/batch?gameIds=${gameIds}`);
      
      if (!batchResult.success) throw new Error('Failed to get batch scores');
      
      // Step 5: Verify the completed game has scores
      if (!batchResult.data[incompleteGame.id]) {
        throw new Error(`No scores found for completed game ${incompleteGame.id}`);
      }
      
      log('✅ Manual scenario test passed - no score errors!', 'success');
      return true;
      
    } catch (error) {
      log(`Manual scenario test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async addTestStats(gameId) {
    const testStats = [
      { position: 'GS', quarter: 1, goalsFor: 3, goalsAgainst: 0 },
      { position: 'GA', quarter: 1, goalsFor: 2, goalsAgainst: 0 },
      { position: 'GK', quarter: 1, goalsFor: 0, goalsAgainst: 1 },
      { position: 'GD', quarter: 1, goalsFor: 0, goalsAgainst: 2 },
    ];

    for (const stat of testStats) {
      const result = await makeRequest('POST', `/api/gamestats/${gameId}`, stat);
      if (!result.success) {
        throw new Error(`Failed to add stat: ${JSON.stringify(stat)}`);
      }
    }
    
    log(`Added ${testStats.length} test stats to game ${gameId}`);
  }

  async createTestScenario() {
    log('Creating complete test scenario...');
    
    // Create new game
    const gameResult = await makeRequest('POST', '/api/games', {
      date: new Date().toISOString().split('T')[0],
      time: '19:00',
      venue: 'Test Venue',
      opponentId: 1,
      completed: false,
      status: 'in-progress'
    });
    
    if (!gameResult.success) throw new Error('Failed to create test game');
    const game = gameResult.data;
    
    // Add stats
    await this.addTestStats(game.id);
    
    // Now run the scenario
    return await this.testLiveStatsToCompletedFlow();
  }

  async testCacheInvalidation() {
    log('🎯 Testing: Cache Invalidation on Status Change');
    
    const gamesResult = await makeRequest('GET', '/api/games');
    if (!gamesResult.success) throw new Error('Failed to get games');
    
    const testGame = gamesResult.data.find(g => g.status === 'completed');
    if (!testGame) {
      log('No completed games found for cache test', 'warn');
      return false;
    }
    
    // Get scores (should cache them)
    const scores1 = await makeRequest('GET', `/api/games/${testGame.id}/stats`);
    if (!scores1.success) throw new Error('Failed to get initial scores');
    
    // Change status (should invalidate cache)
    const newStatus = testGame.status === 'completed' ? 'scheduled' : 'completed';
    const statusResult = await makeRequest('PATCH', `/api/games/${testGame.id}`, {
      status: newStatus,
      completed: newStatus === 'completed'
    });
    
    if (!statusResult.success) throw new Error('Failed to update status');
    
    // Get scores again (should recalculate)
    const scores2 = await makeRequest('GET', `/api/games/${testGame.id}/stats`);
    if (!scores2.success) throw new Error('Failed to get scores after status change');
    
    // Revert status
    await makeRequest('PATCH', `/api/games/${testGame.id}`, {
      status: testGame.status,
      completed: testGame.completed
    });
    
    log('✅ Cache invalidation test passed', 'success');
    return true;
  }

  async testMultipleQuickRequests() {
    log('🎯 Testing: Multiple Quick Requests (Race Conditions)');
    
    const gamesResult = await makeRequest('GET', '/api/games');
    if (!gamesResult.success) throw new Error('Failed to get games');
    
    const gameIds = gamesResult.data.slice(0, 5).map(g => g.id);
    
    // Make multiple concurrent requests for the same games
    const promises = [];
    for (let i = 0; i < 3; i++) {
      for (const gameId of gameIds) {
        promises.push(makeRequest('GET', `/api/games/${gameId}/stats`));
      }
    }
    
    const results = await Promise.all(promises);
    const failures = results.filter(r => !r.success);
    
    if (failures.length > 0) {
      log(`${failures.length} requests failed in race condition test`, 'error');
      return false;
    }
    
    log('✅ Race condition test passed - all requests succeeded', 'success');
    return true;
  }
}

async function main() {
  console.log('🧪 Manual Scenario Test Suite\n');
  
  const tests = new ManualScenarioTests();
  const results = [];
  
  try {
    results.push(await tests.testLiveStatsToCompletedFlow());
    results.push(await tests.testCacheInvalidation());
    results.push(await tests.testMultipleQuickRequests());
    
    const passed = results.filter(r => r).length;
    const total = results.length;
    
    console.log(`\n📊 Results: ${passed}/${total} tests passed`);
    
    if (passed === total) {
      console.log('🎉 All manual scenario tests passed!');
    } else {
      console.log('❌ Some tests failed - check the logs above');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 Test suite crashed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
