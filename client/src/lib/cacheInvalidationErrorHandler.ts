
/**
 * Error-safe cache invalidation wrapper
 * Ensures app continues working even if cache invalidation fails
 */

export class CacheInvalidationErrorHandler {
  private static instance: CacheInvalidationErrorHandler;
  private errorCount = 0;
  private maxErrors = 5;

  static getInstance(): CacheInvalidationErrorHandler {
    if (!CacheInvalidationErrorHandler.instance) {
      CacheInvalidationErrorHandler.instance = new CacheInvalidationErrorHandler();
    }
    return CacheInvalidationErrorHandler.instance;
  }

  async safeInvalidate(invalidationFn: () => Promise<void>, fallbackFn?: () => Promise<void>): Promise<void> {
    try {
      await invalidationFn();
      this.errorCount = 0; // Reset error count on success
    } catch (error) {
      this.errorCount++;
      console.error(`Cache invalidation error (${this.errorCount}/${this.maxErrors}):`, error);

      // If we've hit too many errors, fall back to simple invalidation
      if (this.errorCount >= this.maxErrors) {
        console.warn('Too many cache invalidation errors, falling back to simple invalidation');
        if (fallbackFn) {
          try {
            await fallbackFn();
          } catch (fallbackError) {
            console.error('Fallback invalidation also failed:', fallbackError);
            // Continue execution - don't block the app
          }
        }
      }
      
      // Don't throw error - continue app execution
    }
  }

  resetErrorCount(): void {
    this.errorCount = 0;
  }
}

// Wrapper function for safe invalidation
export async function safeInvalidate(
  invalidationFn: () => Promise<void>,
  fallbackFn?: () => Promise<void>
): Promise<void> {
  const handler = CacheInvalidationErrorHandler.getInstance();
  await handler.safeInvalidate(invalidationFn, fallbackFn);
}
