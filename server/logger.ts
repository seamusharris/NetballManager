/**
 * Server-side environment-aware logging service
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class ServerLogger {
  private static instance: ServerLogger;
  private logLevel: LogLevel;

  private constructor() {
    // Set log level based on environment
    this.logLevel = process.env.NODE_ENV === "production" ? LogLevel.INFO : LogLevel.DEBUG;
  }

  static getInstance(): ServerLogger {
    if (!ServerLogger.instance) {
      ServerLogger.instance = new ServerLogger();
    }
    return ServerLogger.instance;
  }

  debug(message: string, data?: any): void {
    if (this.logLevel <= LogLevel.DEBUG) {
      console.log(`🔍 [DEBUG] ${new Date().toISOString()} - ${message}`, data || "");
    }
  }

  info(message: string, data?: any): void {
    if (this.logLevel <= LogLevel.INFO) {
      console.info(`ℹ️ [INFO] ${new Date().toISOString()} - ${message}`, data || "");
    }
  }

  warn(message: string, data?: any): void {
    if (this.logLevel <= LogLevel.WARN) {
      console.warn(`⚠️ [WARN] ${new Date().toISOString()} - ${message}`, data || "");
    }
  }

  error(message: string, error?: Error | any): void {
    if (this.logLevel <= LogLevel.ERROR) {
      console.error(`❌ [ERROR] ${new Date().toISOString()} - ${message}`, error || "");

      // In production, send to error reporting service
      if (process.env.NODE_ENV === "production") {
        // TODO: Integrate with error reporting service
        // this.sendToErrorReporting(message, error);
      }
    }
  }

  // Database operation logging
  db(operation: string, table: string, data?: any): void {
    if (process.env.NODE_ENV === "development") {
      console.log(`🗄️ [DB] ${operation} on ${table}`, data || "");
    }
  }

  // API endpoint logging
  api(method: string, endpoint: string, status: number, duration?: number): void {
    const statusEmoji = status >= 400 ? "❌" : status >= 300 ? "⚠️" : "✅";
    const durationText = duration ? ` (${duration}ms)` : "";

    if (this.logLevel <= LogLevel.INFO) {
      console.log(`${statusEmoji} [API] ${method} ${endpoint} - ${status}${durationText}`);
    }
  }

  // Performance timing
  time(label: string): void {
    if (process.env.NODE_ENV === "development") {
      console.time(`⏱️ [PERF] ${label}`);
    }
  }

  timeEnd(label: string): void {
    if (process.env.NODE_ENV === "development") {
      console.timeEnd(`⏱️ [PERF] ${label}`);
    }
  }
}

// Export singleton instance
export const logger = ServerLogger.getInstance();

// Convenience exports
export const { debug, info, warn, error, db, api, time, timeEnd } = logger;
