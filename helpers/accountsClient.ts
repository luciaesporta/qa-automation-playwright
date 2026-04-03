import type { APIRequestContext } from '@playwright/test';

export type AccountType = 'debit' | 'credit' | 'savings' | 'checking';

export interface CreateAccountPayload {
  type?: AccountType | string;
  initialAmount?: number;
}

export class AccountsClient {
  constructor(private apiContext: APIRequestContext) {}

  createAccount(token: string, data: CreateAccountPayload) {
    return this.apiContext.post('/api/accounts', {
      headers: { Authorization: `Bearer ${token}` },
      data,
    });
  }

  getAccounts(token: string) {
    return this.apiContext.get('/api/accounts', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  deleteAccount(token: string, accountId: string) {
    return this.apiContext.delete(`/api/accounts/${accountId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}
