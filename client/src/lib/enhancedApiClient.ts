/**
 * Enhanced API Client with Global Error Handler Integration
 * 
 * Provides type-safe API calls with automatic error handling,
 * retry logic, and integration with the global error handler.
 */

import { apiClient as baseApiClient } from './apiClient';
import { 
  globalErrorHandler, 
  apiClientErrorInterceptor,
  isRetryable,
  getRetryDelay,
  type ErrorContext 
} from './globalErrorHandler';
import { ApiResponse } from '@shared/types';

interface RequestOptions {
  retries?: number;
  timeout?: number;
  context?: ErrorContext;
  skipErrorHandling?: boolean;
  customHeaders?: Record<string, string>;
}

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  retryableStatuses: number[];
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  retryableStatuses: [500, 502, 503, 504, 408, 429]
};

/**
 * Enhanced API Client with error handling and retry logic
 */
class EnhancedApiClient {
  private retryConfig: RetryConfig;

  constructor(retryConfig: Partial<RetryConfig> = {}) {
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  }

  /**
   * Make API request with error handling and retry logic
   */
  async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      retries = this.retryConfig.maxRetries,
      context = {},
      skipErrorHandling = false,
      customHeaders
    } = options;

    let lastError: unknown;
    const enhancedContext: ErrorContext = {
      component: 'enhanced-api-client',
      action: `${method.toLowerCase()}-request`,
      ...context,
      additionalData: {
        endpoint,
        method,
        attempt: 1,
        maxRetries: retries,
        ...context.additionalData
      }
    };

    for (let attempt = 1; attempt <= retries + 1; attempt++) {
      try {
        // Update attempt number in context
        enhancedContext.additionalData = {
          ...enhancedContext.additionalData,
          attempt
        };

        const result = await this.makeRequest<T>(method, endpoint, data, customHeaders);
        
        // Log successful retry if this wasn't the first attempt
        if (attempt > 1) {
          console.log(`API request succeeded on attempt ${attempt}/${retries + 1}: ${method} ${endpoint}`);
        }

        return result;

      } catch (error) {
        lastError = error;

        // Don't retry on the last attempt
        if (attempt === retries + 1) {
          break;
        }

        // Check if error is retryable
        const normalizedError = globalErrorHandler.handleError(error, enhancedContext);
        if (!isRetryable(normalizedError)) {
          console.log(`Non-retryable error, not retrying: ${normalizedError.message}`);
          break;
        }

        // Calculate delay for next attempt
        const delay = getRetryDelay(attempt);
        console.log(`Retrying request in ${delay}ms (attempt ${attempt + 1}/${retries + 1}): ${method} ${endpoint}`);
        
        await this.delay(delay);
      }
    }

    // Handle final error
    if (!skipErrorHandling && lastError) {
      apiClientErrorInterceptor(lastError, endpoint, method);
    }

    throw lastError;
  }

  /**
   * Make the actual API request using the base client
   */
  private async makeRequest<T>(
    method: string,
    endpoint: string,
    data?: any,
    customHeaders?: Record<string, string>
  ): Promise<T> {
    switch (method.toUpperCase()) {
      case 'GET':
        return baseApiClient.get<T>(endpoint, customHeaders);
      case 'POST':
        return baseApiClient.post<T>(endpoint, data, customHeaders);
      case 'PUT':
        return baseApiClient.put<T>(endpoint, data, customHeaders);
      case 'PATCH':
        return baseApiClient.patch<T>(endpoint, data, customHeaders);
      case 'DELETE':
        return baseApiClient.delete<T>(endpoint, customHeaders);
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  }

  /**
   * Delay utility for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // HTTP method helpers with error handling

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('GET', endpoint, undefined, options);
  }

  async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>('POST', endpoint, data, options);
  }

  async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>('PUT', endpoint, data, options);
  }

  async patch<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>('PATCH', endpoint, data, options);
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('DELETE', endpoint, undefined, options);
  }

  /**
   * Typed API response helpers
   */
  async getWithResponse<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.get<ApiResponse<T>>(endpoint, options);
  }

  async postWithResponse<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.post<ApiResponse<T>>(endpoint, data, options);
  }

  async putWithResponse<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.put<ApiResponse<T>>(endpoint, data, options);
  }

  async patchWithResponse<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.patch<ApiResponse<T>>(endpoint, data, options);
  }

  async deleteWithResponse<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.delete<ApiResponse<T>>(endpoint, options);
  }

  /**
   * Safe request methods that return null on error instead of throwing
   */
  async safeGet<T>(endpoint: string, options?: RequestOptions): Promise<T | null> {
    try {
      return await this.get<T>(endpoint, options);
    } catch (error) {
      return null;
    }
  }

  async safePost<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T | null> {
    try {
      return await this.post<T>(endpoint, data, options);
    } catch (error) {
      return null;
    }
  }

  async safePut<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T | null> {
    try {
      return await this.put<T>(endpoint, data, options);
    } catch (error) {
      return null;
    }
  }

  async safePatch<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T | null> {
    try {
      return await this.patch<T>(endpoint, data, options);
    } catch (error) {
      return null;
    }
  }

  async safeDelete<T>(endpoint: string, options?: RequestOptions): Promise<T | null> {
    try {
      return await this.delete<T>(endpoint, options);
    } catch (error) {
      return null;
    }
  }

  /**
   * Batch request utility
   */
  async batchRequests<T>(
    requests: Array<{
      method: string;
      endpoint: string;
      data?: any;
      options?: RequestOptions;
    }>
  ): Promise<Array<T | Error>> {
    const promises = requests.map(async ({ method, endpoint, data, options }) => {
      try {
        return await this.request<T>(method, endpoint, data, options);
      } catch (error) {
        return error instanceof Error ? error : new Error(String(error));
      }
    });

    return Promise.all(promises);
  }

  /**
   * Update retry configuration
   */
  updateRetryConfig(newConfig: Partial<RetryConfig>): void {
    this.retryConfig = { ...this.retryConfig, ...newConfig };
  }

  /**
   * Get current retry configuration
   */
  getRetryConfig(): RetryConfig {
    return { ...this.retryConfig };
  }
}

// Create singleton instance
export const enhancedApiClient = new EnhancedApiClient();

// Export types
export type { RequestOptions, RetryConfig };

// Default export
export default enhancedApiClient;