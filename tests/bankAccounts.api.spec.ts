import { test, expect, request, APIRequestContext } from '@playwright/test';
import TestData from '../data/testData.json';
import { ENV } from '../config/environment';
import { AccountsClient } from '../helpers/accountsClient';
import type { LoginSuccessBody, TestUser } from '../types';


interface AccountResponse {
  _id: string;
  user: string;
  type: 'debit' | 'credit' | 'savings' | 'checking';
  last4: string;
  name: string;
  frozen: boolean;
  balance: number;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}


const backendBaseUrl = (() => {
  const configuredApiUrl = process.env.API_URL || ENV.apiUrl;
  const cleanedUrl = configuredApiUrl.endsWith('/') ? configuredApiUrl.slice(0, -1) : configuredApiUrl;
  return cleanedUrl.endsWith('/api') ? cleanedUrl.slice(0, -4) : cleanedUrl;
})();

test.describe('Bank Accounts API', () => {
  let apiContext: APIRequestContext;
  let accountsClient: AccountsClient;
  let validUserToken: string;
  let secondUserToken: string;
  let validUserId: string;
  const createdAccountIds: string[] = [];


  async function loginUser(email: string, password: string): Promise<LoginSuccessBody> {
    const response = await apiContext.post('/api/auth/login', {
      data: { email, password },
    });

    expect(response.status()).toBe(200);
    const body = (await response.json()) as LoginSuccessBody;
    return body;
  }

  async function ensureUserCanLogin(user: TestUser): Promise<{ token: string; userId: string }> {
    try {
      const loginData = await loginUser(user.email, user.password);
      return { token: loginData.token, userId: loginData.user.id };
    } catch {

      const signupResponse = await apiContext.post('/api/auth/signup', {
        data: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          password: user.password,
        },
      });

      if ([200, 201, 409].includes(signupResponse.status())) {
        const loginData = await loginUser(user.email, user.password);
        return { token: loginData.token, userId: loginData.user.id };
      }

      throw new Error(`Failed to ensure user can login: ${user.email}`);
    }
  }


  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext({
      baseURL: backendBaseUrl,
    });
    accountsClient = new AccountsClient(apiContext);

    const validUserData = await ensureUserCanLogin(TestData.validUser as TestUser);
    validUserToken = validUserData.token;
    validUserId = validUserData.userId;

    const secondUserData = await ensureUserCanLogin(TestData.senderMoney as TestUser);
    secondUserToken = secondUserData.token;
  });


  test.afterAll(async () => {
    await apiContext.dispose();
  });


  test.afterEach(async () => {

    const indexesToRemove: number[] = [];
    for (let i = createdAccountIds.length - 1; i >= 0; i--) {
      const id = createdAccountIds[i];
      try {
        const response = await accountsClient.deleteAccount(validUserToken, id);

        if (response.status() === 200) {
          indexesToRemove.push(i);
        }
      } catch {

      }
    }


    for (const index of indexesToRemove) {
      createdAccountIds.splice(index, 1);
    }
  });


  test('[TC-API-ACCOUNTS-01] GET accounts returns empty array when no accounts exist', async () => {
    const response = await accountsClient.getAccounts(secondUserToken);

    expect(response.status()).toBe(200);

    const body = (await response.json()) as AccountResponse[];
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(0);
  });


  test('[TC-API-ACCOUNTS-02] GET accounts returns user accounts with correct schema', async () => {
    await test.step('create a test account', async () => {
      const createResponse = await accountsClient.createAccount(validUserToken, {
        type: 'debit',
        initialAmount: 500,
      });

      expect(createResponse.status()).toBe(201);
      const newAccount = (await createResponse.json()) as AccountResponse;
      createdAccountIds.push(newAccount._id);
    });

    await test.step('GET accounts retrieves accounts successfully', async () => {
      const response = await accountsClient.getAccounts(validUserToken);

      expect(response.status()).toBe(200);

      const body = (await response.json()) as AccountResponse[];
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);

      const account = body[0];

      expect(account._id).toBeTruthy();
      expect(typeof account._id).toBe('string');
      expect(account.user).toBeTruthy();
      expect(typeof account.user).toBe('string');
      expect(account.type).toBeTruthy();
      expect(['debit', 'credit', 'savings', 'checking']).toContain(account.type);
      expect(account.last4).toBeTruthy();
      expect(typeof account.last4).toBe('string');
      expect(account.last4.length).toBe(4);
      expect(account.name).toBeTruthy();
      expect(typeof account.name).toBe('string');
      expect(typeof account.frozen).toBe('boolean');
      expect(typeof account.balance).toBe('number');
      expect(account.createdAt).toBeTruthy();
      expect(account.updatedAt).toBeTruthy();
    });
  });


  test('[TC-API-ACCOUNTS-03] GET accounts only returns accounts for the authenticated user', async () => {
    let validUserAccountId: string;
    let secondUserAccountId: string;

    await test.step('create account with validUser', async () => {
      const response = await accountsClient.createAccount(validUserToken, {
        type: 'debit',
        initialAmount: 100,
      });

      expect(response.status()).toBe(201);
      const account = (await response.json()) as AccountResponse;
      validUserAccountId = account._id;
      createdAccountIds.push(account._id);
    });

    await test.step('create account with secondUser', async () => {
      const response = await accountsClient.createAccount(secondUserToken, {
        type: 'credit',
        initialAmount: 200,
      });

      expect(response.status()).toBe(201);
      const account = (await response.json()) as AccountResponse;
      secondUserAccountId = account._id;
      createdAccountIds.push(account._id);
    });

    await test.step('verify data isolation', async () => {
      const response = await accountsClient.getAccounts(validUserToken);

      expect(response.status()).toBe(200);

      const accounts = (await response.json()) as AccountResponse[];

      const secondUserAccountInList = accounts.find((acc) => acc._id === secondUserAccountId);
      expect(secondUserAccountInList).toBeUndefined();

      for (const account of accounts) {
        expect(account.user).toBe(validUserId);
      }
    });
  });

  
  test('[TC-API-ACCOUNTS-04] Create account with debit type successfully', async () => {
    const response = await accountsClient.createAccount(validUserToken, {
      type: 'debit',
      initialAmount: 500,
    });

    expect(response.status()).toBe(201);

    const body = (await response.json()) as AccountResponse;
    expect(body._id).toBeTruthy();
    expect(typeof body._id).toBe('string');
    expect(body.type).toBe('debit');
    expect(body.balance).toBe(500);
    expect(body.frozen).toBe(false);
    expect(body.name).toBe('Nueva Cuenta');
    expect(body.last4).toBeTruthy();
    expect(body.last4.length).toBe(4);

    createdAccountIds.push(body._id);
  });


  test('[TC-API-ACCOUNTS-05] Create account with each valid type', async () => {
    const types = ['debit', 'credit', 'savings', 'checking'] as const;

    for (const type of types) {
      await test.step(`create account of type ${type}`, async () => {
        const response = await accountsClient.createAccount(validUserToken, {
          type,
          initialAmount: 100 + Math.random() * 100,
        });

        expect(response.status()).toBe(201);

        const body = (await response.json()) as AccountResponse;
        expect(body.type).toBe(type);
        createdAccountIds.push(body._id);
      });
    }
  });


  test('[TC-API-ACCOUNTS-06] Create account without initialAmount has balance 0 by default', async () => {
    const response = await accountsClient.createAccount(validUserToken, {
      type: 'savings',
    });

    expect(response.status()).toBe(201);

    const body = (await response.json()) as AccountResponse;
    expect(body.balance).toBe(0);

    createdAccountIds.push(body._id);
  });


  test('[TC-API-ACCOUNTS-07] Create account with invalid type returns error 400', async () => {
    const response = await accountsClient.createAccount(validUserToken, {
      type: 'bitcoin',
      initialAmount: 100,
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.message).toBeTruthy();
    expect(typeof body.message).toBe('string');
    expect(body.message.toLowerCase()).toContain('type');
  });


  test('[TC-API-ACCOUNTS-08] Create account without type returns error 400', async () => {
    const response = await accountsClient.createAccount(validUserToken, {
      initialAmount: 100,
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.message).toBeTruthy();
    expect(typeof body.message).toBe('string');
  });


  test('[TC-API-ACCOUNTS-09] Delete own account successfully', async () => {
    let accountId: string;

    await test.step('create an account', async () => {
      const response = await accountsClient.createAccount(validUserToken, {
        type: 'debit',
        initialAmount: 100,
      });

      expect(response.status()).toBe(201);
      const account = (await response.json()) as AccountResponse;
      accountId = account._id;
      createdAccountIds.push(accountId);
    });

    await test.step('delete the account', async () => {
      const response = await accountsClient.deleteAccount(validUserToken, accountId);

      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.message).toBe('Account deleted');
    });

    await test.step('remove from tracking', async () => {
      const index = createdAccountIds.indexOf(accountId);
      if (index > -1) {
        createdAccountIds.splice(index, 1);
      }
    });
  });


  test('[TC-API-ACCOUNTS-10] Verify that the deleted account no longer appears in GET', async () => {
    let accountId: string;

    await test.step('create an account', async () => {
      const response = await accountsClient.createAccount(validUserToken, {
        type: 'savings',
        initialAmount: 250,
      });

      expect(response.status()).toBe(201);
      const account = (await response.json()) as AccountResponse;
      accountId = account._id;
      createdAccountIds.push(accountId);
    });

    await test.step('delete the account', async () => {
      const response = await accountsClient.deleteAccount(validUserToken, accountId);

      expect(response.status()).toBe(200);
    });

    await test.step('verify it no longer exists in GET', async () => {
      const response = await accountsClient.getAccounts(validUserToken);

      expect(response.status()).toBe(200);

      const accounts = (await response.json()) as AccountResponse[];
      const deletedAccount = accounts.find((acc) => acc._id === accountId);
      expect(deletedAccount).toBeUndefined();
    });

    await test.step('remove from tracking', async () => {
      const index = createdAccountIds.indexOf(accountId);
      if (index > -1) {
        createdAccountIds.splice(index, 1);
      }
    });
  });


  test('[TC-API-ACCOUNTS-11] Delete non-existent account returns 404', async () => {
    const nonExistentId = '000000000000000000000000';

    const response = await accountsClient.deleteAccount(validUserToken, nonExistentId);

    expect(response.status()).toBe(404);

    const body = await response.json();
    expect(body.message).toBe('Account not found');
  });


  test('[TC-API-ACCOUNTS-12] Delete another user\'s account returns 404', async () => {
    let secondUserAccountId: string;

    await test.step('create account with secondUser', async () => {
      const response = await accountsClient.createAccount(secondUserToken, {
        type: 'checking',
        initialAmount: 300,
      });

      expect(response.status()).toBe(201);
      const account = (await response.json()) as AccountResponse;
      secondUserAccountId = account._id;
      createdAccountIds.push(secondUserAccountId);
    });

    await test.step('attempt to delete with validUser token', async () => {
      const response = await accountsClient.deleteAccount(validUserToken, secondUserAccountId);

      expect(response.status()).toBe(404);

      const body = await response.json();
      expect(body.message).toBe('Account not found');
    });

    await test.step('verify that the account still exists', async () => {
      const response = await accountsClient.getAccounts(secondUserToken);

      expect(response.status()).toBe(200);

      const accounts = (await response.json()) as AccountResponse[];
      const account = accounts.find((acc) => acc._id === secondUserAccountId);
      expect(account).toBeTruthy();
      expect(account?._id).toBe(secondUserAccountId);
    });
  });


  test('[TC-API-ACCOUNTS-13] Delete account with positive balance (without restriction)', async () => {
    let accountId: string;

    await test.step('create an account with positive balance', async () => {
      const response = await accountsClient.createAccount(validUserToken, {
        type: 'credit',
        initialAmount: 1000,
      });

      expect(response.status()).toBe(201);
      const account = (await response.json()) as AccountResponse;
      expect(account.balance).toBe(1000);
      accountId = account._id;
      createdAccountIds.push(accountId);
    });

    await test.step('delete the account', async () => {
      const response = await accountsClient.deleteAccount(validUserToken, accountId);

      expect(response.status()).toBe(200);

      const body = await response.json();
      expect(body.message).toBe('Account deleted');
    });

    await test.step('remove from tracking', async () => {
      const index = createdAccountIds.indexOf(accountId);
      if (index > -1) {
        createdAccountIds.splice(index, 1);
      }
    });
  });
});
