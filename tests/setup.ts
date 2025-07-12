import { beforeAll, afterAll } from 'vitest';

// Global test setup
beforeAll(async () => {
  // Set up test environment variables
  process.env.NODE_ENV = 'test';
  process.env.PORT = '3001'; // Use different port for tests
  
  // Wait for server to be ready (if needed)
  await new Promise(resolve => setTimeout(resolve, 1000));
});

afterAll(async () => {
  // Clean up test environment
  console.log('Tests completed');
});

// Global test utilities
export const testUtils = {
  // Helper to wait for server to be ready
  waitForServer: async (url: string, maxAttempts = 10) => {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch(url);
        if (response.ok) return true;
      } catch (error) {
        // Server not ready yet
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    throw new Error('Server not ready after maximum attempts');
  },

  // Helper to create test data
  createTestData: () => ({
    clubId: 54,
    teamId: 116,
    gameId: 72,
    playerId: 60
  }),

  // Helper to make authenticated requests
  makeAuthenticatedRequest: async (url: string, options: RequestInit = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        'x-current-club-id': '54',
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
  }
}; 