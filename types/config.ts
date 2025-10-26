export interface EnvironmentConfig {
  baseUrl: string;
  apiUrl: string;
  databaseUrl?: string;
  redisUrl?: string;
  environment: 'development' | 'staging' | 'production' | 'test';
  debug: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}


export interface TimeoutConfig {
  default: number;
  elementVisible: number;
  pageLoad: number;
  apiRequest?: number;
  networkIdle: number;
  short: number;
  medium?: number;
  long: number;
}


export interface RetryConfig {
  element: number;
  api: number;
  navigation: number;
  default?: number;
}


export interface ApiEndpointsConfig {
  auth: {
    signup: string;
    login: string;
    logout: string;
    refresh: string;
  };
  accounts: {
    list: string;
    create: string;
    update: string;
    delete: string;
  };
  transactions: {
    transfer: string;
    list: string;
    history: string;
  };
  users: {
    profile: string;
    update: string;
  };
}


export interface BrowserConfig {
  headless: boolean;
  slowMo: number;
  devtools: boolean;
  viewport: {
    width: number;
    height: number;
  };
  userAgent?: string;
  locale?: string;
  timezone?: string;
}


export interface TestConfig {
  timeout: TimeoutConfig;
  retry: RetryConfig;
  browser: BrowserConfig;
  parallel: boolean;
  workers: number;
  reporter: string[];
  outputDir: string;
  screenshotOnFailure: boolean;
  videoOnFailure: boolean;
  traceOnFailure: boolean;
}


export interface PlaywrightConfig {
  testDir: string;
  testMatch: string[];
  testIgnore: string[];
  timeout: number;
  expect: {
    timeout: number;
  };
  forbidOnly: boolean;
  retries: number;
  reporter: string[];
  use: {
    baseURL: string;
    trace: 'on' | 'off' | 'retain-on-failure' | 'on-first-retry';
    screenshot: 'only-on-failure' | 'off';
    video: 'retain-on-failure' | 'off';
    actionTimeout: number;
    navigationTimeout: number;
  };
  projects: ProjectConfig[];
}


export interface ProjectConfig {
  name: string;
  testMatch: string[];
  testIgnore?: string[];
  dependencies?: string[];
  use?: Partial<BrowserConfig>;
  timeout?: number;
  retries?: number;
}


export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  connectionTimeout: number;
  queryTimeout: number;
}


export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  database: number;
  connectTimeout: number;
  commandTimeout: number;
}


export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'text';
  output: 'console' | 'file' | 'both';
  filePath?: string;
  maxFileSize: number;
  maxFiles: number;
  includeTimestamp: boolean;
  includeLevel: boolean;
}


export interface SecurityConfig {
  jwtSecret: string;
  jwtExpiration: number;
  passwordSaltRounds: number;
  rateLimitWindow: number;
  rateLimitMax: number;
  corsOrigins: string[];
  httpsOnly: boolean;
}


export interface FeatureFlagsConfig {
  enableApiTesting: boolean;
  enableUiTesting: boolean;
  enableParallelExecution: boolean;
  enableRetryLogic: boolean;
  enableScreenshots: boolean;
  enableVideos: boolean;
  enableTraces: boolean;
  enableReporting: boolean;
}


export interface CompleteConfig {
  environment: EnvironmentConfig;
  timeouts: TimeoutConfig;
  retries: RetryConfig;
  apiEndpoints: ApiEndpointsConfig;
  browser: BrowserConfig;
  test: TestConfig;
  playwright: PlaywrightConfig;
  database?: DatabaseConfig;
  redis?: RedisConfig;
  logging: LoggingConfig;
  security: SecurityConfig;
  featureFlags: FeatureFlagsConfig;
}


export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  validatedAt: string;
}


export interface ConfigLoaderOptions {
  configPath?: string;
  environment?: string;
  validate?: boolean;
  strict?: boolean;
  defaults?: Partial<CompleteConfig>;
}
