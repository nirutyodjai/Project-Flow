/**
 * Logger utility for handling application logging
 * Provides different log levels and environment-based filtering
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  enabledInProduction: boolean;
  minLevel: LogLevel;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private config: LoggerConfig;
  private isDevelopment: boolean;

  constructor(config: LoggerConfig = { enabledInProduction: false, minLevel: 'info' }) {
    this.config = config;
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.isDevelopment && !this.config.enabledInProduction) {
      return level === 'error'; // Always log errors
    }
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel];
  }

  private formatMessage(level: LogLevel, message: string, context?: string): string {
    const timestamp = new Date().toISOString();
    const prefix = context ? `[${context}]` : '';
    return `${timestamp} [${level.toUpperCase()}] ${prefix} ${message}`;
  }

  debug(message: string, data?: any, context?: string): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, context), data || '');
    }
  }

  info(message: string, data?: any, context?: string): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, context), data || '');
    }
  }

  warn(message: string, data?: any, context?: string): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, context), data || '');
    }
  }

  error(message: string, error?: any, context?: string): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, context), error || '');
    }
  }

  // Firestore specific logging methods
  firestore = {
    operation: (operation: string, collection: string, id?: string) => {
      const message = id 
        ? `${operation} document in ${collection} collection with id: ${id}`
        : `${operation} documents in ${collection} collection`;
      this.info(message, undefined, 'Firestore');
    },
    
    error: (operation: string, collection: string, error: any, id?: string) => {
      const message = id
        ? `Error ${operation} document in ${collection} collection with id: ${id}`
        : `Error ${operation} documents in ${collection} collection`;
      this.error(message, error, 'Firestore');
    },

    warning: (message: string, data?: any) => {
      this.warn(message, data, 'Firestore');
    }
  };
}

// Export singleton instance
export const logger = new Logger({
  enabledInProduction: false,
  minLevel: 'info'
});

// Export class for custom instances
export { Logger };
