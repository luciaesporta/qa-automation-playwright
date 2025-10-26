import { defineConfig, devices } from '@playwright/test';
import { ENV, ConfigHelpers } from './config/environment';

export default defineConfig({
  testDir: './tests',
  reporter: 'html',
  use: {
    baseURL: ENV.baseUrl,
    trace: 'on-first-retry',
    actionTimeout: ConfigHelpers.getTimeout('elementVisible'),
    navigationTimeout: ConfigHelpers.getTimeout('pageLoad'),
  },

  testMatch: /.*\.(spec|test)\.(ts|js|mjs)/,

  projects: [
    {
      name: 'setup',
      testMatch: /.*transaction\.setup\.ts/,
    },

    {
      name: 'auth-tests',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /.*auth\.spec\.ts/,
      dependencies: [], 
    },

    {
      name: 'signup-tests',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /.*signup\.spec\.ts/,
      dependencies: [],
    },

    {
      name: 'transaction-tests',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /.*transactions\.spec\.ts/,
      dependencies: ['setup'], 
    },

    {
      name: 'funding-tests',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /.*funding\.test\.ts$/,
      dependencies: [], 
    },
  ],
});
