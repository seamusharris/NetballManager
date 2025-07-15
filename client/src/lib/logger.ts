/**
 * Environment-aware logging service
 * Replaces console.log statements with proper logging levels
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;

  private constructor() {
    // Set log level based on environment
    this.logLevel = process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG;
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  debug(message: string, data?: any): void {
    if (this.logLevel <= LogLevel.DEBUG) {
      console.log(`🔍 [DEBUG] ${message}`, data || '');
    }
  }

  info(message: string, data?: any): void {
    if (this.logLevel <= LogLevel.INFO) {
      console.info(`ℹ️ [INFO] ${message}`, data || '');
    }
  }

  warn(message: string, data?: any): void {
    if (this.logLevel <= LogLevel.WARN) {
      console.warn(`⚠️ [WARN] ${message}`, data || '');
    }
  }

  error(message: string, error?: Error | any): void {
    if (this.logLevel <= LogLevel.ERROR) {
      console.error(`❌ [ERROR] ${message}`, error || '');
      
      // In production, send to error reporting service
      if (process.env.NODE_ENV === 'production') {
        // TODO: Integrate with error reporting service (Sentry, etc.)
        // this.sendToErrorReporting(message, error);
      }
    }
  }

  // Performance logging (development only)
  perf(label: string, fn: () => void): void {
    if (process.env.NODE_ENV === 'development') {
      console.time(`⏱️ [PERF] ${label}`);
      fn();
      console.timeEnd(`⏱️ [PERF] ${label}`);
    } else {
      fn();
    }
  }

  // API request logging (development only)
  apiRequest(method: string, url: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.group(`🌐 [API] ${method} ${url}`);
      if (data) console.log('Request data:', data);
      console.groupEnd();
    }
  }

  apiResponse(method: string, url: string, status: number, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      const statusEmoji = status >= 400 ? '❌' : status >= 300 ? '⚠️' : '✅';
      console.group(`${statusEmoji} [API] ${method} ${url} - ${status}`);
      if (data) console.log('Response data:', data);
      console.groupEnd();
    }
  }

  // Component lifecycle logging (development only)
  component(name: string, action: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔧 [COMPONENT] ${name} - ${action}`, data || '');
    }
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Convenience exports
export const { debug, info, warn, error, perf, apiRequest, apiResponse, component } = logger;