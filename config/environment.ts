import { TimeoutConfig, RetryConfig, TestDataConfig } from '../types';

export interface EnvironmentConfig {
  baseUrl: string;
  apiUrl: string;
  timeouts: TimeoutConfig;
  retries: RetryConfig;
  testData: TestDataConfig;
}


export const ENV: EnvironmentConfig = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  apiUrl: process.env.API_URL || 'http://localhost:6007/api',

  timeouts: {
    default: parseInt(process.env.TEST_TIMEOUT || '30000'),
    short: parseInt(process.env.SHORT_TIMEOUT || '5000'),
    long: parseInt(process.env.LONG_TIMEOUT || '60000'),
    networkIdle: parseInt(process.env.NETWORK_IDLE_TIMEOUT || '5000'),
    elementVisible: parseInt(process.env.ELEMENT_VISIBLE_TIMEOUT || '10000'),
    pageLoad: parseInt(process.env.PAGE_LOAD_TIMEOUT || '30000'),
  },

  retries: {
    api: parseInt(process.env.API_RETRIES || '3'),
    element: parseInt(process.env.ELEMENT_RETRIES || '3'),
    navigation: parseInt(process.env.NAVIGATION_RETRIES || '2'),
  },

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


export const ConfigHelpers = {

  getApiEndpoint: (endpoint: string): string => {
    return `${ENV.apiUrl}${endpoint}`;
  },


  getTimeout: (type: keyof EnvironmentConfig['timeouts'], fallback?: number): number => {
    return ENV.timeouts[type] || fallback || ENV.timeouts.default;
  },


  getRetries: (type: keyof EnvironmentConfig['retries'], fallback?: number): number => {
    return ENV.retries[type] || fallback || 3;
  },

  isCI: (): boolean => {
    return process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
  },


  isDebug: (): boolean => {
    return process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development';
  },

};


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
