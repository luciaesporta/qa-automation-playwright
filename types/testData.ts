import { AccountType } from './api';


export interface TestUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}


export interface TestBankAccount {
  type: AccountType | string;
  balance: number | string;
}


export interface TestTransaction {
  amount: number;
  recipientEmail: string;
  description?: string;
}


export interface TestDataConfig {
  defaultBalance: string;
  defaultAccountType: string;
  transferAmounts: {
    min: number;
    max: number;
    default: number;
  };
}

