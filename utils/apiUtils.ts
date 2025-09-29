import { APIRequestContext, expect } from '@playwright/test';
import { ENV, ConfigHelpers, API_ENDPOINTS } from '../config/environment';
import { Logger } from './Logger';
import { TestHelpers } from './TestHelpers';

export class ApiUtils {
  private request: APIRequestContext;
  private baseUrl: string;
  

  constructor(request: APIRequestContext, baseUrl?: string) {
    this.request = request;
    this.baseUrl = baseUrl || ENV.apiUrl;
    Logger.debug('ApiUtils initialized', { baseUrl: this.baseUrl });
  }

  async getAccounts(jwt: string) {
    const endpoint = ConfigHelpers.getApiEndpoint(API_ENDPOINTS.ACCOUNTS.LIST);
    
    return TestHelpers.waitForApiResponse(
      async () => {
        Logger.api('GET', endpoint);
        
        const response = await this.request.get(endpoint, {
          headers: { Authorization: `Bearer ${jwt}` },
          timeout: ConfigHelpers.getTimeout('default'),
        });
        
        Logger.api('GET', endpoint, response.status());
        
        if (!response.ok()) {
          await TestHelpers.handleApiError(
            response, 
            endpoint, 
            'GET', 
            { jwt: jwt.substring(0, 10) + '...' }
          );
        }
        
        return response.json();
      },
      ConfigHelpers.getRetries('api'),
      { endpoint, operation: 'getAccounts' }
    );
  }

  async transferMoney(jwt: string, fromAccountId: string, toEmail: string, amount: number) {
    const endpoint = ConfigHelpers.getApiEndpoint(API_ENDPOINTS.TRANSACTIONS.TRANSFER);
    
    return TestHelpers.waitForApiResponse(
      async () => {
        Logger.api('POST', endpoint);
        
        const response = await this.request.post(endpoint, {
          headers: { Authorization: `Bearer ${jwt}` },
          data: { fromAccountId, toEmail, amount },
          timeout: ConfigHelpers.getTimeout('default'),
        });
        
        Logger.api('POST', endpoint, response.status());
        
        if (!response.ok()) {
          await TestHelpers.handleApiError(
            response, 
            endpoint, 
            'POST', 
            { fromAccountId, toEmail, amount }
          );
        }
        
        return response.json();
      },
      ConfigHelpers.getRetries('api'),
      { endpoint, operation: 'transferMoney', amount }
    );
  }

  async transferMoneyFromFirstAccount(jwt: string, toEmail: string, amount: number) {
    const accounts = await this.getAccounts(jwt);
    expect(accounts.length, 'No accounts found').toBeGreaterThan(0);
    const idOriginAccount = accounts[0]._id;
    return this.transferMoney(jwt, idOriginAccount, toEmail, amount);
  }
}
