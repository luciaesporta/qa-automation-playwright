/**
 * Base API response structure
 */
export interface BaseApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  status: number;
}

/**
 * User data structure for API responses
 */
export interface UserData {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string; // Usually not included in responses
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Bank account data structure
 */
export interface BankAccount {
  _id: string;
  userId: string;
  type: AccountType;
  balance: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Account types enumeration
 */
export enum AccountType {
  DEBIT = 'Débito',
  CREDIT = 'Crédito',
  SAVINGS = 'Ahorros'
}

/**
 * Transaction data structure
 */
export interface Transaction {
  _id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description?: string;
  status: TransactionStatus;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Transaction status enumeration
 */
export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

/**
 * Transfer request payload
 */
export interface TransferRequest {
  fromAccountId: string;
  toEmail: string;
  amount: number;
  description?: string;
}

/**
 * Transfer response
 */
export interface TransferResponse extends BaseApiResponse<Transaction> {
  data: Transaction;
}

/**
 * Signup request payload
 */
export interface SignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

/**
 * Signup response
 */
export interface SignupResponse extends BaseApiResponse<UserData> {
  data: UserData;
}

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Login response
 */
export interface LoginResponse extends BaseApiResponse<{
  user: UserData;
  token: string;
}> {
  data: {
    user: UserData;
    token: string;
  };
}

/**
 * Accounts list response
 */
export interface AccountsListResponse extends BaseApiResponse<BankAccount[]> {
  data: BankAccount[];
}

/**
 * API error response
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
  status: number;
  details?: any;
}

/**
 * API endpoint configuration
 */
export interface ApiEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  requiresAuth?: boolean;
  timeout?: number;
}

/**
 * API client configuration
 */
export interface ApiClientConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  headers?: Record<string, string>;
}

/**
 * Request context for API calls
 */
export interface ApiRequestContext {
  jwt?: string;
  userId?: string;
  requestId?: string;
  timeout?: number;
}
