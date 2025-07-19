/**
 * Test Setup Configuration
 * 
 * Global setup for all tests to ensure consistent environment
 */

import { beforeAll, afterAll } from 'vitest';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || process.env.TEST_DATABASE_URL;

// Global test timeout (30 seconds for API tests)
const TEST_TIMEOUT = 30000;

beforeAll(() => {
  console.log('🧪 Starting test suite...');
  console.log(`📊 Test timeout: ${TEST_TIMEOUT}ms`);
  console.log(`🗄️ Database URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set'}`);
}, TEST_TIMEOUT);

afterAll(() => {
  console.log('✅ Test suite completed');
});

// Export test utilities
export const testConfig = {
  timeout: TEST_TIMEOUT,
  apiBaseUrl: 'http://localhost:3000',
  testDataPrefix: 'TEST_',
  cleanupDelay: 100 // ms to wait between cleanup operations
};

export const testHelpers = {
  /**
   * Generate unique test identifier
   */
  generateTestId: () => `${testConfig.testDataPrefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  
  /**
   * Wait for a specified amount of time
   */
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  /**
   * Retry an operation with exponential backoff
   */
  retry: async <T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    baseDelay: number = 1000
  ): Promise<T> => {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxAttempts) {
          throw lastError;
        }
        
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.warn(`⚠️ Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await testHelpers.wait(delay);
      }
    }
    
    throw lastError!;
  }
};