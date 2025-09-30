// Page Object interfaces
export * from './pageObjects';

// API types
export * from './api';

// Test data types
export * from './testData';

// Configuration types
export * from './config';

// Re-export commonly used types for convenience
export type {
  BasePageInterface,
  AuthPageInterface,
  DashboardPageInterface,
  SignupPageInterface,
  ModalInterface,
  BankAccountModalInterface,
  TransferModalInterface
} from './pageObjects';

export type {
  BaseApiResponse,
  UserData,
  BankAccount,
  Transaction,
  TransferRequest,
  TransferResponse,
  SignupRequest,
  SignupResponse,
  LoginRequest,
  LoginResponse,
  AccountsListResponse,
  ApiErrorResponse
} from './api';

export type {
  TestUser,
  TestBankAccount,
  TestTransaction,
  TestDataConfig,
  TestScenario,
  GeneratedTestData
} from './testData';

export type {
  EnvironmentConfig,
  TimeoutConfig,
  RetryConfig,
  TestConfig,
  PlaywrightConfig,
  CompleteConfig
} from './config';
