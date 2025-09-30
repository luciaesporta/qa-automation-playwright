import { AccountType } from './api';

/**
 * User test data structure
 */
export interface TestUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

/**
 * Bank account test data structure
 */
export interface TestBankAccount {
  type: AccountType | string;
  balance: number | string;
}

/**
 * Transaction test data structure
 */
export interface TestTransaction {
  amount: number;
  recipientEmail: string;
  description?: string;
}

/**
 * Test data configuration
 */
export interface TestDataConfig {
  defaultBalance: string;
  defaultAccountType: string;
  transferAmounts: {
    min: number;
    max: number;
    default: number;
  };
}

/**
 * Environment-specific test data
 */
export interface EnvironmentTestData {
  baseUrl: string;
  apiUrl: string;
  testUsers: TestUser[];
  testAccounts: TestBankAccount[];
}

/**
 * Test scenario data
 */
export interface TestScenario {
  name: string;
  description: string;
  user: TestUser;
  accounts: TestBankAccount[];
  expectedResults: {
    loginSuccess: boolean;
    accountCreationSuccess: boolean;
    transferSuccess: boolean;
  };
}

/**
 * Data generation parameters
 */
export interface DataGenerationParams {
  emailDomain?: string;
  namePrefix?: string;
  amountRange?: {
    min: number;
    max: number;
  };
  accountTypes?: string[];
}

/**
 * Test data validation rules
 */
export interface TestDataValidation {
  email: {
    required: boolean;
    format: RegExp;
    unique: boolean;
  };
  password: {
    required: boolean;
    minLength: number;
    maxLength: number;
  };
  name: {
    required: boolean;
    minLength: number;
    maxLength: number;
  };
  amount: {
    min: number;
    max: number;
    precision: number;
  };
}

/**
 * Test data factory configuration
 */
export interface TestDataFactoryConfig {
  validation: TestDataValidation;
  generation: DataGenerationParams;
  environment: EnvironmentTestData;
}

/**
 * Generated test data result
 */
export interface GeneratedTestData {
  user: TestUser;
  account?: TestBankAccount;
  transaction?: TestTransaction;
  metadata: {
    generatedAt: string;
    scenario: string;
    environment: string;
  };
}

/**
 * Test data cleanup information
 */
export interface TestDataCleanup {
  userIds: string[];
  accountIds: string[];
  transactionIds: string[];
  files: string[];
  timestamp: string;
}

/**
 * Test data state management
 */
export interface TestDataState {
  currentUser?: TestUser;
  currentAccount?: TestBankAccount;
  createdEntities: {
    users: string[];
    accounts: string[];
    transactions: string[];
  };
  cleanupQueue: TestDataCleanup;
}
