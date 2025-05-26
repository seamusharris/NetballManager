
#!/usr/bin/env node

/**
 * Simple debugging script to identify the exact error
 */

const BASE_URL = 'http://localhost:5000';

async function makeRequest(endpoint) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

async function testScoreError() {
  console.log('🔍 Testing for score errors...\n');
  
  try {
    // Get games list
    console.log('1. Getting games list...');
    const gamesResult = await makeRequest('/api/games');
    if (!gamesResult.ok) {
      console.error('❌ Failed to get games:', gamesResult.error);
      return;
    }
    
    console.log(`✓ Found ${gamesResult.data.length} games`);
    
    // Find a completed game
    const completedGame = gamesResult.data.find(g => g.status === 'completed');
    if (!completedGame) {
      console.log('⚠️  No completed games found');
      return;
    }
    
    console.log(`\n2. Testing with completed game ${completedGame.id}...`);
    
    // Test individual score request
    console.log('   Testing individual score request...');
    const scoreResult = await makeRequest(`/api/games/${completedGame.id}/stats`);
    if (!scoreResult.ok) {
      console.error(`❌ SCORE ERROR found for game ${completedGame.id}:`);
      console.error('   Status:', scoreResult.status);
      console.error('   Error:', scoreResult.error || 'Unknown error');
      console.error('   Data:', scoreResult.data);
      return;
    }
    
    console.log(`✓ Individual score request successful (${scoreResult.data.length} stats)`);
    
    // Test batch score request
    console.log('   Testing batch score request...');
    const batchResult = await makeRequest(`/api/games/stats/batch?gameIds=${completedGame.id}`);
    if (!batchResult.ok) {
      console.error(`❌ BATCH SCORE ERROR found for game ${completedGame.id}:`);
      console.error('   Status:', batchResult.status);
      console.error('   Error:', batchResult.error || 'Unknown error');
      console.error('   Data:', batchResult.data);
      return;
    }
    
    if (!batchResult.data[completedGame.id]) {
      console.error(`❌ Game ${completedGame.id} missing from batch result`);
      console.error('   Available games in batch:', Object.keys(batchResult.data));
      return;
    }
    
    console.log('✓ Batch score request successful');
    
    console.log('\n🎉 No score errors detected!');
    
  } catch (error) {
    console.error('💥 Test crashed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Check if we're in Node.js environment
if (typeof globalThis.fetch === 'undefined') {
  console.log('Installing fetch polyfill...');
  const { fetch } = require('undici');
  globalThis.fetch = fetch;
}

testScoreError();
