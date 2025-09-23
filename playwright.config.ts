import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
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
  ],
});
