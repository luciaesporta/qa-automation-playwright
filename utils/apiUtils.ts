import { APIRequestContext, expect } from '@playwright/test';

export class ApiUtils {
  private request: APIRequestContext;
  private baseUrl: string;

  constructor(request: APIRequestContext, baseUrl = 'http://localhost:6007/api') {
    this.request = request;
    this.baseUrl = baseUrl;
  }

  async getAccounts(jwt: string) {
    const response = await this.request.get(`${this.baseUrl}/accounts`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    expect(response.ok(), `Account API is not working: ${response.statusText()}`).toBeTruthy();
    return response.json();
  }

  async transferMoney(jwt: string, fromAccountId: string, toEmail: string, amount: number) {
    const response = await this.request.post(`${this.baseUrl}/transactions/transfer`, {
      headers: { Authorization: `Bearer ${jwt}` },
      data: { fromAccountId, toEmail, amount },
    });
    expect(response.ok(), `Transfer API failed: ${response.statusText()}`).toBeTruthy();
    return response.json();
  }
}
