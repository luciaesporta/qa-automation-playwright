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
      testMatch: /.*\.setup\.ts/,
    },

    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /.*\.setup\.ts/,
      dependencies: ['setup'],
  
    },
  ],
});
