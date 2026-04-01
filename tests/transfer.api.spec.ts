import { test, expect, request, APIRequestContext } from '@playwright/test';
import TestData from '../data/testData.json';
import { ENV, API_ENDPOINTS } from '../config/environment';
import type { LoginSuccessBody, TestUser } from '../types';

const API_DEBIT_ACCOUNT_TYPE = 'debit';

const SENDER_SETUP_BALANCE = 5000;
const VALID_TRANSFER_AMOUNT = 100;
const NONEXISTENT_OBJECT_ID = '000000000000000000000000';

const backendBaseUrl = (() => {
  const configuredApiUrl = process.env.API_URL || ENV.apiUrl;
  const cleanedUrl = configuredApiUrl.endsWith('/') ? configuredApiUrl.slice(0, -1) : configuredApiUrl;
  return cleanedUrl.endsWith('/api') ? cleanedUrl.slice(0, -4) : cleanedUrl;
})();

type AccountRecord = {
  _id: string;
  balance: number;
  frozen?: boolean;
  user?: string;
};

function authHeader(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

function sumBalances(accounts: Pick<AccountRecord, 'balance'>[]): number {
  return accounts.reduce((sum, a) => sum + a.balance, 0);
}

test.describe('Transfer API — Business Logic', () => {
  test.describe.configure({ mode: 'serial' });

  let apiContext: APIRequestContext;
  let senderToken: string;
  let receiverToken: string;
  let senderAccountId: string;

  const accountsToDelete: { id: string; token: string }[] = [];

  async function loginUser(email: string, password: string): Promise<LoginSuccessBody> {
    const response = await apiContext.post(`/api${API_ENDPOINTS.AUTH.LOGIN}`, {
      data: { email, password },
    });
    expect(response.status()).toBe(200);
    return (await response.json()) as LoginSuccessBody;
  }

  async function ensureUserCanLogin(user: TestUser): Promise<LoginSuccessBody> {
    const loginResponse = await apiContext.post(`/api${API_ENDPOINTS.AUTH.LOGIN}`, {
      data: { email: user.email, password: user.password },
    });

    if (loginResponse.status() === 200) {
      return (await loginResponse.json()) as LoginSuccessBody;
    }

    const signupResponse = await apiContext.post(`/api${API_ENDPOINTS.AUTH.SIGNUP}`, {
      data: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: user.password,
      },
    });

    expect([200, 201, 400, 409]).toContain(signupResponse.status());
    return loginUser(user.email, user.password);
  }

  async function getAccounts(token: string): Promise<AccountRecord[]> {
    const response = await apiContext.get(`/api${API_ENDPOINTS.ACCOUNTS.LIST}`, {
      headers: authHeader(token),
    });
    expect(response.status()).toBe(200);
    return (await response.json()) as AccountRecord[];
  }

  async function createAccount(
    token: string,
    initialAmount: number,
    options: { trackForCleanup?: boolean } = {}
  ): Promise<AccountRecord> {
    const response = await apiContext.post(`/api${API_ENDPOINTS.ACCOUNTS.CREATE}`, {
      headers: { ...authHeader(token), 'Content-Type': 'application/json' },
      data: { type: API_DEBIT_ACCOUNT_TYPE, initialAmount },
    });
    expect(response.status()).toBe(201);
    const body = (await response.json()) as AccountRecord;
    if (options.trackForCleanup !== false) {
      accountsToDelete.push({ id: body._id, token });
    }
    return body;
  }

  async function deleteAccount(token: string, accountId: string): Promise<void> {
    const response = await apiContext.delete(`/api${API_ENDPOINTS.ACCOUNTS.DELETE}/${accountId}`, {
      headers: authHeader(token),
    });
    expect([200, 204, 404]).toContain(response.status());
  }

  async function setAccountFrozen(token: string, accountId: string, isFrozen: boolean): Promise<void> {
    const response = await apiContext.put(`/api/accounts/${accountId}/freeze`, {
      headers: { ...authHeader(token), 'Content-Type': 'application/json' },
      data: { isFrozen },
    });
    expect(response.status()).toBe(200);
  }

  async function postTransfer(
    token: string,
    data: { fromAccountId: string; toEmail: string; amount?: number }
  ) {
    return apiContext.post(`/api${API_ENDPOINTS.TRANSACTIONS.TRANSFER}`, {
      headers: { ...authHeader(token), 'Content-Type': 'application/json' },
      data,
    });
  }

  test.beforeAll(async () => {
    apiContext = await request.newContext({ baseURL: backendBaseUrl });

    const senderAuth = await ensureUserCanLogin(TestData.senderMoney as TestUser);
    const receiverAuth = await ensureUserCanLogin(TestData.receiverMoney as TestUser);
    senderToken = senderAuth.token;
    receiverToken = receiverAuth.token;

    const senderAccount = await createAccount(senderToken, SENDER_SETUP_BALANCE);
    senderAccountId = senderAccount._id;
    expect(senderAccount.balance).toBe(SENDER_SETUP_BALANCE);

    let receiverAccounts = await getAccounts(receiverToken);
    if (receiverAccounts.length === 0) {
      await createAccount(receiverToken, 1000);
      receiverAccounts = await getAccounts(receiverToken);
    }
    expect(receiverAccounts.length).toBeGreaterThan(0);
  });

  test.afterAll(async () => {
    for (const { id, token } of [...accountsToDelete].reverse()) {
      try {
        await deleteAccount(token, id);
      } catch {
      }
    }
    await apiContext.dispose();
  });

  test('[TC-API-TRANSFER-01] Successful transfer — response and balance effect', async () => {
    const senderBalanceBefore = (await getAccounts(senderToken)).find((a) => a._id === senderAccountId)!.balance;
    const receiverTotalBefore = sumBalances(await getAccounts(receiverToken));

    await test.step('Send transfer', async () => {
      const response = await postTransfer(senderToken, {
        fromAccountId: senderAccountId,
        toEmail: TestData.receiverMoney.email,
        amount: VALID_TRANSFER_AMOUNT,
      });
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toMatchObject({ message: 'Transfer successful' });
    });

    await test.step('Verify sender balance', async () => {
      const senderAccount = (await getAccounts(senderToken)).find((a) => a._id === senderAccountId);
      expect(senderAccount).toBeTruthy();
      await expect.soft(senderAccount!.balance).toBe(senderBalanceBefore - VALID_TRANSFER_AMOUNT);
    });

    await test.step('Verify receiver balance', async () => {
      const receiverTotalAfter = sumBalances(await getAccounts(receiverToken));
      await expect.soft(receiverTotalAfter).toBe(receiverTotalBefore + VALID_TRANSFER_AMOUNT);
    });
  });

  test('[TC-API-TRANSFER-02] Insufficient funds', async () => {
    const lowAccount = await createAccount(senderToken, 10, { trackForCleanup: false });
    const response = await postTransfer(senderToken, {
      fromAccountId: lowAccount._id,
      toEmail: TestData.receiverMoney.email,
      amount: 9999,
    });
    expect(response.status()).toBe(400);
    expect(await response.json()).toMatchObject({ message: 'Insufficient funds' });
    await deleteAccount(senderToken, lowAccount._id);
  });

  test('[TC-API-TRANSFER-03] Non-existent recipient email', async () => {
    const response = await postTransfer(senderToken, {
      fromAccountId: senderAccountId,
      toEmail: 'usuario.que.no.existe.nunca@test.com',
      amount: 10,
    });
    expect(response.status()).toBe(404);
    expect(await response.json()).toMatchObject({ message: 'Recipient user not found' });
  });

  test('[TC-API-TRANSFER-04] Registered recipient with no bank account', async () => {
    const signupResponse = await apiContext.post(`/api${API_ENDPOINTS.AUTH.SIGNUP}`, {
      data: {
        firstName: 'No',
        lastName: 'Account',
        email: `no-account-user-${Date.now()}@test.com`,
        password: TestData.validUser.password,
      },
    });
    expect(signupResponse.status()).toBe(201);
    const signupBody = (await signupResponse.json()) as LoginSuccessBody;
    const recipientEmail = signupBody.user.email;

    const response = await postTransfer(senderToken, {
      fromAccountId: senderAccountId,
      toEmail: recipientEmail,
      amount: 10,
    });
    expect(response.status()).toBe(400);
    expect(await response.json()).toMatchObject({ message: 'Recipient has no account' });
  });

  test('[TC-API-TRANSFER-05] Zero amount rejected', async () => {
    const response = await postTransfer(senderToken, {
      fromAccountId: senderAccountId,
      toEmail: TestData.receiverMoney.email,
      amount: 0,
    });
    expect(response.status()).toBe(400);
    expect(await response.json()).toMatchObject({ message: 'Invalid transfer data' });
  });

  test('[TC-API-TRANSFER-06] Negative amount rejected', async () => {
    const response = await postTransfer(senderToken, {
      fromAccountId: senderAccountId,
      toEmail: TestData.receiverMoney.email,
      amount: -50,
    });
    expect(response.status()).toBe(400);
    expect(await response.json()).toMatchObject({ message: 'Invalid transfer data' });
  });

  test('[TC-API-TRANSFER-07] Missing amount in body', async () => {
    const response = await apiContext.post(`/api${API_ENDPOINTS.TRANSACTIONS.TRANSFER}`, {
      headers: { ...authHeader(senderToken), 'Content-Type': 'application/json' },
      data: {
        fromAccountId: senderAccountId,
        toEmail: TestData.receiverMoney.email,
      },
    });
    expect(response.status()).toBe(400);
    expect(await response.json()).toMatchObject({ message: 'Invalid transfer data' });
  });

  test('[TC-API-TRANSFER-08] Non-existent sender account id', async () => {
    const response = await postTransfer(senderToken, {
      fromAccountId: NONEXISTENT_OBJECT_ID,
      toEmail: TestData.receiverMoney.email,
      amount: 10,
    });
    expect(response.status()).toBe(404);
    expect(await response.json()).toMatchObject({ message: 'Sender account not found' });
  });

  test('[TC-API-TRANSFER-09] Another user account id as sender (data isolation)', async () => {
    const receiverAccounts = await getAccounts(receiverToken);
    expect(receiverAccounts.length).toBeGreaterThan(0);
    const receiverAccountId = receiverAccounts[0]._id;

    const response = await postTransfer(senderToken, {
      fromAccountId: receiverAccountId,
      toEmail: TestData.receiverMoney.email,
      amount: 10,
    });
    expect(response.status()).toBe(404);
    expect(await response.json()).toMatchObject({ message: 'Sender account not found' });
  });

  test('[TC-API-TRANSFER-10] Sender account frozen', async () => {
    await test.step('Freeze sender account', async () => {
      await setAccountFrozen(senderToken, senderAccountId, true);
    });

    await test.step('Transfer should fail', async () => {
      const response = await postTransfer(senderToken, {
        fromAccountId: senderAccountId,
        toEmail: TestData.receiverMoney.email,
        amount: 1,
      });
      expect(response.status()).toBe(400);
      expect(await response.json()).toMatchObject({ message: 'Sender account is frozen' });
    });

    await test.step('cleanup', async () => {
      await setAccountFrozen(senderToken, senderAccountId, false);
    });
  });

  test('[TC-API-TRANSFER-11] Recipient account frozen', async () => {
    const receiverAccounts = await getAccounts(receiverToken);
    expect(receiverAccounts.length).toBeGreaterThan(0);

    for (const acc of receiverAccounts) {
      await setAccountFrozen(receiverToken, acc._id, true);
    }

    try {
      const response = await postTransfer(senderToken, {
        fromAccountId: senderAccountId,
        toEmail: TestData.receiverMoney.email,
        amount: 1,
      });
      expect(response.status()).toBe(400);
      expect(await response.json()).toMatchObject({ message: 'Recipient account is frozen' });
    } finally {
      for (const acc of receiverAccounts) {
        await setAccountFrozen(receiverToken, acc._id, false);
      }
    }
  });

  test('[TC-API-TRANSFER-12] Self-transfer is accepted (documented backend gap)', async () => {
    const response = await postTransfer(senderToken, {
      fromAccountId: senderAccountId,
      toEmail: TestData.senderMoney.email,
      amount: 1,
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({ message: 'Transfer successful' });
  });
});
