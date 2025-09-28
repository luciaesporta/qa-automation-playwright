/**
 * Professional Logger utility for Playwright tests
 * Provides structured logging with different levels and context
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LogContext {
  testName?: string;
  page?: string;
  action?: string;
  [key: string]: any;
}

export class Logger {
  private static logLevel: LogLevel = LogLevel.INFO;
  private static isTestEnvironment = process.env.NODE_ENV === 'test';

  /**
   * Set the minimum log level
   */
  static setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Format timestamp for logs
   */
  private static getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Format log message with context
   */
  private static formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = this.getTimestamp();
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level}] ${message}${contextStr}`;
  }

  /**
   * Debug level logging - detailed information for debugging
   */
  static debug(message: string, context?: LogContext): void {
    if (this.logLevel <= LogLevel.DEBUG) {
      console.log(this.formatMessage('DEBUG', message, context));
    }
  }

  /**
   * Info level logging - general information about test execution
   */
  static info(message: string, context?: LogContext): void {
    if (this.logLevel <= LogLevel.INFO) {
      console.log(this.formatMessage('INFO', message, context));
    }
  }

  /**
   * Warning level logging - potential issues or unexpected behavior
   */
  static warn(message: string, context?: LogContext): void {
    if (this.logLevel <= LogLevel.WARN) {
      console.warn(this.formatMessage('WARN', message, context));
    }
  }

  /**
   * Error level logging - errors and failures
   */
  static error(message: string, error?: Error, context?: LogContext): void {
    if (this.logLevel <= LogLevel.ERROR) {
      const errorContext = error ? { ...context, error: error.message, stack: error.stack } : context;
      console.error(this.formatMessage('ERROR', message, errorContext));
    }
  }

  /**
   * Log test step execution
   */
  static step(step: string, context?: LogContext): void {
    this.info(`STEP: ${step}`, context);
  }

  /**
   * Log test assertion
   */
  static assertion(assertion: string, passed: boolean, context?: LogContext): void {
    const level = passed ? 'INFO' : 'ERROR';
    const message = `ASSERTION: ${assertion} - ${passed ? 'PASSED' : 'FAILED'}`;
    
    if (passed) {
      this.info(message, context);
    } else {
      this.error(message, undefined, context);
    }
  }

  /**
   * Log API request/response
   */
  static api(method: string, url: string, status?: number, context?: LogContext): void {
    const apiContext = { ...context, method, url, status };
    const message = `API ${method} ${url}${status ? ` - Status: ${status}` : ''}`;
    this.info(message, apiContext);
  }

  /**
   * Log page navigation
   */
  static navigation(url: string, context?: LogContext): void {
    this.info(`NAVIGATION: ${url}`, context);
  }

  /**
   * Log user action (click, fill, etc.)
   */
  static action(action: string, element?: string, context?: LogContext): void {
    const actionContext = { ...context, element };
    this.debug(`ACTION: ${action}${element ? ` on ${element}` : ''}`, actionContext);
  }
}
