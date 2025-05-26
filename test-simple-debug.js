
#!/usr/bin/env node

/**
 * Simple debugging script to identify the exact error
 */

const BASE_URL = 'http://localhost:5000';

// Simple fetch polyfill using Node.js built-in modules
async function makeRequest(endpoint) {
  try {
    // Try to use global fetch first (Node.js 18+)
    if (typeof globalThis.fetch !== 'undefined') {
      const response = await globalThis.fetch(`${BASE_URL}${endpoint}`);
      const data = await response.json();
      return { ok: response.ok, status: response.status, data };
    }
    
    // Fallback to http module
    const http = require('http');
    const url = require('url');
    
    return new Promise((resolve) => {
      const parsedUrl = new URL(`${BASE_URL}${endpoint}`);
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, data: jsonData });
          } catch (e) {
            resolve({ ok: false, error: 'Invalid JSON response', rawData: data });
          }
        });
      });
      
      req.on('error', (error) => {
        resolve({ ok: false, error: error.message });
      });
      
      req.end();
    });
    
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

async function testScoreError() {
  console.log('🔍 Testing for score errors...\n');
  
  try {
    // Test if server is running
    console.log('0. Testing server connection...');
    const healthResult = await makeRequest('/api/games');
    if (!healthResult.ok) {
      console.error('❌ Server connection failed:', healthResult.error);
      console.error('   Make sure the server is running on port 5000');
      return;
    }
    console.log('✓ Server is running');
    
    // Get games list
    console.log('\n1. Getting games list...');
    if (!healthResult.data || !Array.isArray(healthResult.data)) {
      console.error('❌ Invalid games data received');
      return;
    }
    
    console.log(`✓ Found ${healthResult.data.length} games`);
    
    // Find a completed game
    const completedGame = healthResult.data.find(g => g.status === 'completed');
    if (!completedGame) {
      console.log('⚠️  No completed games found');
      console.log('Available games:', healthResult.data.map(g => `${g.id} (${g.status})`));
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
      console.error('   Raw Data:', scoreResult.rawData);
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
      console.error('   Raw Data:', batchResult.rawData);
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

console.log('Starting debug test...');
testScoreError();
