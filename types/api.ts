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


export interface UserData {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string; // Usually not included in responses
  createdAt?: string;
  updatedAt?: string;
}


export interface BankAccount {
  _id: string;
  userId: string;
  type: AccountType;
  balance: number;
  createdAt?: string;
  updatedAt?: string;
}


export enum AccountType {
  DEBIT = 'Débito',
  CREDIT = 'Crédito',
  SAVINGS = 'Ahorros'
}


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


export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}


export interface TransferRequest {
  fromAccountId: string;
  toEmail: string;
  amount: number;
  description?: string;
}


export interface TransferResponse extends BaseApiResponse<Transaction> {
  data: Transaction;
}


export interface SignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}


export interface SignupResponse extends BaseApiResponse<UserData> {
  data: UserData;
}


export interface LoginRequest {
  email: string;
  password: string;
}


export interface LoginResponse extends BaseApiResponse<{
  user: UserData;
  token: string;
}> {
  data: {
    user: UserData;
    token: string;
  };
}


export interface AccountsListResponse extends BaseApiResponse<BankAccount[]> {
  data: BankAccount[];
}


export interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
  status: number;
  details?: any;
}


export interface ApiEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  requiresAuth?: boolean;
  timeout?: number;
}


export interface ApiClientConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  headers?: Record<string, string>;
}


export interface ApiRequestContext {
  jwt?: string;
  userId?: string;
  requestId?: string;
  timeout?: number;
}
