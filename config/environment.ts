/**
 * Centralized environment configuration for Playwright tests
 * All URLs, timeouts, and environment-specific settings are managed here
 */

export interface EnvironmentConfig {
  baseUrl: string;
  apiUrl: string;
  timeouts: {
    default: number;
    short: number;
    long: number;
    networkIdle: number;
    elementVisible: number;
    pageLoad: number;
  };
  retries: {
    api: number;
    element: number;
    navigation: number;
  };
  testData: {
    defaultBalance: string;
    defaultAccountType: string;
    transferAmounts: {
      min: number;
      max: number;
      default: number;
    };
  };
}

/**
 * Environment configuration based on environment variables or defaults
 */
export const ENV: EnvironmentConfig = {
  // Base URLs
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  apiUrl: process.env.API_URL || 'http://localhost:6007/api',

  // Timeout configurations
  timeouts: {
    default: parseInt(process.env.TEST_TIMEOUT || '30000'),
    short: parseInt(process.env.SHORT_TIMEOUT || '5000'),
    long: parseInt(process.env.LONG_TIMEOUT || '60000'),
    networkIdle: parseInt(process.env.NETWORK_IDLE_TIMEOUT || '5000'),
    elementVisible: parseInt(process.env.ELEMENT_VISIBLE_TIMEOUT || '10000'),
    pageLoad: parseInt(process.env.PAGE_LOAD_TIMEOUT || '30000'),
  },

  // Retry configurations
  retries: {
    api: parseInt(process.env.API_RETRIES || '3'),
    element: parseInt(process.env.ELEMENT_RETRIES || '3'),
    navigation: parseInt(process.env.NAVIGATION_RETRIES || '2'),
  },

  // Test data defaults
  testData: {
    defaultBalance: process.env.DEFAULT_BALANCE || '1000',
    defaultAccountType: process.env.DEFAULT_ACCOUNT_TYPE || 'Débito',
    transferAmounts: {
      min: parseInt(process.env.MIN_TRANSFER_AMOUNT || '1'),
      max: parseInt(process.env.MAX_TRANSFER_AMOUNT || '100'),
      default: parseInt(process.env.DEFAULT_TRANSFER_AMOUNT || '25'),
    },
  },
};

/**
 * Helper functions for common configuration access
 */
export const ConfigHelpers = {
  /**
   * Get full API endpoint URL
   */
  getApiEndpoint: (endpoint: string): string => {
    return `${ENV.apiUrl}${endpoint}`;
  },

  /**
   * Get timeout with fallback
   */
  getTimeout: (type: keyof EnvironmentConfig['timeouts'], fallback?: number): number => {
    return ENV.timeouts[type] || fallback || ENV.timeouts.default;
  },

  /**
   * Get retry count with fallback
   */
  getRetries: (type: keyof EnvironmentConfig['retries'], fallback?: number): number => {
    return ENV.retries[type] || fallback || 3;
  },

  /**
   * Check if running in CI environment
   */
  isCI: (): boolean => {
    return process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
  },

  /**
   * Check if running in debug mode
   */
  isDebug: (): boolean => {
    return process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development';
  },
};

/**
 * API Endpoints configuration
 */
export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
  },
  ACCOUNTS: {
    LIST: '/accounts',
    CREATE: '/accounts',
    DELETE: '/accounts',
  },
  TRANSACTIONS: {
    LIST: '/transactions',
    TRANSFER: '/transactions/transfer',
    DEPOSIT: '/transactions/deposit',
  },
} as const;

/**
 * Test Data Configuration
 */
export const TEST_DATA = {
  USERS: {
    VALID: {
      firstName: 'Lucía',
      lastName: 'Esporta',
      email: 'luciaalvarezesporta@gmail.com',
      password: '12345678',
    },
    SENDER: {
      firstName: 'Money',
      lastName: 'Sender',
      email: 'luciaalvarezesporta+moneysender@gmail.com',
      password: '12345678',
    },
    RECEIVER: {
      firstName: 'Money',
      lastName: 'Receiver',
      email: 'luciaalvarezesporta+moneyreceiver@gmail.com',
      password: '12345678',
    },
  },
  ACCOUNTS: {
    DEFAULT_TYPE: ENV.testData.defaultAccountType,
    DEFAULT_BALANCE: ENV.testData.defaultBalance,
  },
  TRANSFERS: {
    MIN_AMOUNT: ENV.testData.transferAmounts.min,
    MAX_AMOUNT: ENV.testData.transferAmounts.max,
    DEFAULT_AMOUNT: ENV.testData.transferAmounts.default,
  },
} as const;
