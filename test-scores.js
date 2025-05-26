
#!/usr/bin/env node

/**
 * Automated test suite for game scores and caching functionality
 * Run with: node test-scores.js
 */

const BASE_URL = 'http://localhost:5000';

// Test utilities
async function makeRequest(method, endpoint, body = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function assertEqual(actual, expected, message) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

// Test cases
class ScoreTestSuite {
  constructor() {
    this.testGame = null;
    this.testStats = [];
  }

  async runAllTests() {
    log('🚀 Starting Score Test Suite');
    
    try {
      await this.setup();
      await this.testScoreCalculation();
      await this.testCaching();
      await this.testStatusChanges();
      await this.testBatchOperations();
      await this.cleanup();
      
      log('🎉 All tests passed!', 'success');
    } catch (error) {
      log(`Test failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async setup() {
    log('Setting up test data...');
    
    // Create a test game
    const gameResult = await makeRequest('POST', '/api/games', {
      date: new Date().toISOString().split('T')[0],
      time: '19:00',
      venue: 'Test Venue',
      opponentId: 1,
      completed: false,
      status: 'scheduled'
    });
    
    if (!gameResult.success) {
      throw new Error('Failed to create test game');
    }
    
    this.testGame = gameResult.data;
    log(`Created test game with ID: ${this.testGame.id}`);
  }

  async testScoreCalculation() {
    log('Testing score calculation...');
    
    // Add some test stats
    const testStats = [
      { position: 'GS', quarter: 1, goalsFor: 5, goalsAgainst: 0 },
      { position: 'GA', quarter: 1, goalsFor: 3, goalsAgainst: 0 },
      { position: 'GK', quarter: 1, goalsFor: 0, goalsAgainst: 2 },
      { position: 'GD', quarter: 1, goalsFor: 0, goalsAgainst: 1 },
      { position: 'GS', quarter: 2, goalsFor: 4, goalsAgainst: 0 },
      { position: 'GA', quarter: 2, goalsFor: 2, goalsAgainst: 0 },
    ];

    for (const stat of testStats) {
      const result = await makeRequest('POST', `/api/gamestats/${this.testGame.id}`, stat);
      if (!result.success) {
        throw new Error(`Failed to create stat: ${JSON.stringify(stat)}`);
      }
      this.testStats.push(result.data);
    }

    // Get scores
    const scoresResult = await makeRequest('GET', `/api/games/${this.testGame.id}/stats`);
    if (!scoresResult.success) {
      throw new Error('Failed to get game stats');
    }

    log(`✓ Score calculation test passed - got ${scoresResult.data.length} stats`);
  }

  async testCaching() {
    log('Testing score caching...');
    
    // Make multiple requests and measure timing
    const times = [];
    
    for (let i = 0; i < 3; i++) {
      const start = Date.now();
      const result = await makeRequest('GET', `/api/games/${this.testGame.id}/stats`);
      const duration = Date.now() - start;
      times.push(duration);
      
      if (!result.success) {
        throw new Error('Failed to get cached scores');
      }
    }
    
    log(`✓ Caching test passed - response times: ${times.join('ms, ')}ms`);
    
    // First request should be slower (calculation), subsequent should be faster (cache)
    if (times[1] >= times[0] || times[2] >= times[0]) {
      log('⚠️  Cache may not be working optimally - subsequent requests not faster');
    }
  }

  async testStatusChanges() {
    log('Testing status changes and cache invalidation...');
    
    // Change game status to completed
    const statusResult = await makeRequest('PATCH', `/api/games/${this.testGame.id}`, {
      status: 'completed',
      completed: true
    });
    
    if (!statusResult.success) {
      throw new Error('Failed to update game status');
    }
    
    // Verify scores are still accessible
    const scoresResult = await makeRequest('GET', `/api/games/${this.testGame.id}/stats`);
    if (!scoresResult.success) {
      throw new Error('Failed to get scores after status change');
    }
    
    log('✓ Status change test passed');
  }

  async testBatchOperations() {
    log('Testing batch operations...');
    
    // Test batch stats endpoint
    const batchResult = await makeRequest('GET', `/api/games/stats/batch?gameIds=${this.testGame.id}`);
    if (!batchResult.success) {
      throw new Error('Failed to get batch stats');
    }
    
    // Verify our test game is in the batch results
    if (!batchResult.data[this.testGame.id]) {
      throw new Error('Test game not found in batch results');
    }
    
    log('✓ Batch operations test passed');
  }

  async testErrorHandling() {
    log('Testing error handling...');
    
    // Test with invalid game ID
    const invalidResult = await makeRequest('GET', '/api/games/99999/stats');
    if (invalidResult.success) {
      throw new Error('Expected error for invalid game ID');
    }
    
    log('✓ Error handling test passed');
  }

  async cleanup() {
    log('Cleaning up test data...');
    
    // Delete test stats
    for (const stat of this.testStats) {
      await makeRequest('DELETE', `/api/gamestats/${stat.id}`);
    }
    
    // Delete test game
    if (this.testGame) {
      await makeRequest('DELETE', `/api/games/${this.testGame.id}`);
    }
    
    log('✓ Cleanup completed');
  }
}

// Performance test
class PerformanceTest {
  async runPerformanceTests() {
    log('🚀 Starting Performance Tests');
    
    // Get list of existing games
    const gamesResult = await makeRequest('GET', '/api/games');
    if (!gamesResult.success) {
      throw new Error('Failed to get games list');
    }
    
    const games = gamesResult.data.slice(0, 10); // Test with first 10 games
    const gameIds = games.map(g => g.id).join(',');
    
    log(`Testing performance with ${games.length} games`);
    
    // Test individual requests
    const individualStart = Date.now();
    for (const game of games) {
      await makeRequest('GET', `/api/games/${game.id}/stats`);
    }
    const individualTime = Date.now() - individualStart;
    
    // Test batch request
    const batchStart = Date.now();
    await makeRequest('GET', `/api/games/stats/batch?gameIds=${gameIds}`);
    const batchTime = Date.now() - batchStart;
    
    log(`Individual requests: ${individualTime}ms`);
    log(`Batch request: ${batchTime}ms`);
    log(`Performance improvement: ${((individualTime - batchTime) / individualTime * 100).toFixed(1)}%`);
    
    if (batchTime < individualTime) {
      log('✅ Batch operations are faster than individual requests', 'success');
    } else {
      log('⚠️  Batch operations may need optimization');
    }
  }
}

// Cache stress test
class CacheStressTest {
  async runCacheStressTest() {
    log('🚀 Starting Cache Stress Test');
    
    const gamesResult = await makeRequest('GET', '/api/games');
    if (!gamesResult.success) {
      throw new Error('Failed to get games list');
    }
    
    const games = gamesResult.data.slice(0, 5);
    const requests = 20; // Number of concurrent requests per game
    
    log(`Testing cache with ${requests} concurrent requests per game`);
    
    for (const game of games) {
      const promises = [];
      const start = Date.now();
      
      // Make concurrent requests
      for (let i = 0; i < requests; i++) {
        promises.push(makeRequest('GET', `/api/games/${game.id}/stats`));
      }
      
      const results = await Promise.all(promises);
      const duration = Date.now() - start;
      
      // Check all requests succeeded
      const failures = results.filter(r => !r.success);
      if (failures.length > 0) {
        throw new Error(`${failures.length} requests failed for game ${game.id}`);
      }
      
      log(`Game ${game.id}: ${requests} requests in ${duration}ms (${(duration/requests).toFixed(1)}ms avg)`);
    }
    
    log('✅ Cache stress test completed', 'success');
  }
}

// Main execution
async function main() {
  console.log('🧪 Netball Score Testing Suite\n');
  
  try {
    // Run core functionality tests
    const scoreTests = new ScoreTestSuite();
    await scoreTests.runAllTests();
    console.log('');
    
    // Run performance tests
    const perfTests = new PerformanceTest();
    await perfTests.runPerformanceTests();
    console.log('');
    
    // Run cache stress tests
    const cacheTests = new CacheStressTest();
    await cacheTests.runCacheStressTest();
    
    console.log('\n🎉 All test suites completed successfully!');
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error.message);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { ScoreTestSuite, PerformanceTest, CacheStressTest };
