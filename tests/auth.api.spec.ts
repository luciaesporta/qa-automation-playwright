import { test, expect, request, APIRequestContext } from '@playwright/test';
import TestData from '../data/testData.json';
import { ENV, API_ENDPOINTS } from '../config/environment';
import type { LoginSuccessBody, TestUser } from '../types';

const expiredJwtToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0ZjFhMmIzYzRkNWU2ZjdhOGI5YzBkMSIsImVtYWlsIjoiZXhwaXJlZEB0ZXN0LmNvbSIsImlhdCI6MTY5MDAwMDAwMCwiZXhwIjoxNjkwMDAwMDAxfQ.invalidsignature';

const backendBaseUrl = (() => {
  const configuredApiUrl = process.env.API_URL || ENV.apiUrl;
  const cleanedUrl = configuredApiUrl.endsWith('/') ? configuredApiUrl.slice(0, -1) : configuredApiUrl;
  return cleanedUrl.endsWith('/api') ? cleanedUrl.slice(0, -4) : cleanedUrl;
})();

test.describe('Auth API - Security', () => {
  let apiContext: APIRequestContext;

  test.beforeEach(async () => {
    apiContext = await request.newContext({ baseURL: backendBaseUrl });
  });

  test.afterEach(async () => {
    await apiContext.dispose();
  });

  async function loginAndGetAuthData(email: string, password: string): Promise<LoginSuccessBody> {
    const response = await apiContext.post(`/api${API_ENDPOINTS.AUTH.LOGIN}`, { data: { email, password } });
    expect(response.status()).toBe(200);

    const body = (await response.json()) as LoginSuccessBody;
    return body;
  }

  async function ensureUserCanLogin(user: TestUser): Promise<LoginSuccessBody> {
    const loginResponse = await apiContext.post(`/api${API_ENDPOINTS.AUTH.LOGIN}`, {
      data: { email: user.email, password: user.password },
    });

    if (loginResponse.status() === 200) {
      const body = (await loginResponse.json()) as LoginSuccessBody;
      return body;
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
    return loginAndGetAuthData(user.email, user.password);
  }

  function getAccountOwnerId(account: Record<string, any>): string | undefined {
    if (typeof account.userId === 'string') return account.userId;
    if (typeof account.ownerId === 'string') return account.ownerId;
    if (typeof account.owner === 'string') return account.owner;

    if (account.owner && typeof account.owner === 'object') {
      if (typeof account.owner.id === 'string') return account.owner.id;
      if (typeof account.owner._id === 'string') return account.owner._id;
    }

    if (typeof account.user === 'string') return account.user;

    if (account.user && typeof account.user === 'object') {
      if (typeof account.user.id === 'string') return account.user.id;
      if (typeof account.user._id === 'string') return account.user._id;
    }

    return undefined;
  }

  test('TC-API-AUTH-01: Successful login should return token and user schema', async () => {
    const response = await apiContext.post(`/api${API_ENDPOINTS.AUTH.LOGIN}`, {
      data: {
        email: TestData.validUser.email,
        password: TestData.validUser.password,
      },
    });

    expect(response.status()).toBe(200);

    const body = (await response.json()) as LoginSuccessBody;
    expect(body.token).toEqual(expect.any(String));
    expect(body.token.length).toBeGreaterThan(0);
    expect(body.user).toMatchObject({
      id: expect.any(String),
      firstName: expect.any(String),
      lastName: expect.any(String),
      email: expect.any(String),
    });
    expect(body.user.email).toBe(TestData.validUser.email);
  });

  test('TC-API-AUTH-02: Login with wrong password should return invalid credentials', async () => {
    const response = await apiContext.post(`/api${API_ENDPOINTS.AUTH.LOGIN}`, {
      data: {
        email: TestData.validUser.email,
        password: 'wrongpassword',
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toMatchObject({ message: 'Invalid credentials' });
  });

  test('TC-API-AUTH-03: Login with unknown email should return invalid credentials', async () => {
    const response = await apiContext.post(`/api${API_ENDPOINTS.AUTH.LOGIN}`, {
      data: {
        email: 'user-does-not-exist@test.com',
        password: TestData.validUser.password,
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toMatchObject({ message: 'Invalid credentials' });
  });

  test('TC-API-AUTH-04: Login without email should return required fields error', async () => {
    const response = await apiContext.post(`/api${API_ENDPOINTS.AUTH.LOGIN}`, {
      data: {
        password: '12345678',
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toMatchObject({ message: 'Email and password are required' });
  });

  test('TC-API-AUTH-05: Login without password should return required fields error', async () => {
    const response = await apiContext.post(`/api${API_ENDPOINTS.AUTH.LOGIN}`, {
      data: {
        email: 'any-email@test.com',
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toMatchObject({ message: 'Email and password are required' });
  });

  test('TC-API-AUTH-06: Access protected route without token should return unauthorized', async () => {
    const response = await apiContext.get(`/api${API_ENDPOINTS.ACCOUNTS.LIST}`);

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toMatchObject({ message: 'No token provided' });
  });

  test('TC-API-AUTH-07: Access protected route with malformed token should return invalid token', async () => {
    const customContext = await request.newContext({
      baseURL: backendBaseUrl,
      extraHTTPHeaders: {
        Authorization: 'Bearer this_is_not_a_jwt',
      },
    });
    const response = await customContext.get(`/api${API_ENDPOINTS.ACCOUNTS.LIST}`);

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toMatchObject({ message: 'Invalid token' });
    await customContext.dispose();
  });

  test('TC-API-AUTH-08: Access protected route with expired JWT should return invalid token', async () => {
    const customContext = await request.newContext({
      baseURL: backendBaseUrl,
      extraHTTPHeaders: {
        Authorization: `Bearer ${expiredJwtToken}`,
      },
    });
    const response = await customContext.get(`/api${API_ENDPOINTS.ACCOUNTS.LIST}`);

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toMatchObject({ message: 'Invalid token' });
    await customContext.dispose();
  });

  test('TC-API-AUTH-09: Valid token from user A should not expose user B accounts', async () => {
    const authUserA = await ensureUserCanLogin(TestData.senderMoney as TestUser);
    const authUserB = await ensureUserCanLogin(TestData.receiverMoney as TestUser);

    const customContext = await request.newContext({
      baseURL: backendBaseUrl,
      extraHTTPHeaders: {
        Authorization: `Bearer ${authUserA.token}`,
      },
    });
    const response = await customContext.get(`/api${API_ENDPOINTS.ACCOUNTS.LIST}`);

    expect(response.status()).toBe(200);

    const accounts = (await response.json()) as Array<Record<string, any>>;
    expect(Array.isArray(accounts)).toBe(true);

    for (const account of accounts) {
      const ownerId = getAccountOwnerId(account);
      expect(ownerId).toBeTruthy();
      expect(ownerId).toBe(authUserA.user.id);
      expect(ownerId).not.toBe(authUserB.user.id);
    }

    await customContext.dispose();
  });

  test('TC-API-AUTH-10: Access protected route with valid token should work', async () => {
    const authData = await loginAndGetAuthData(TestData.validUser.email, TestData.validUser.password);
    const customContext = await request.newContext({
      baseURL: backendBaseUrl,
      extraHTTPHeaders: {
        Authorization: `Bearer ${authData.token}`,
      },
    });
    const response = await customContext.get(`/api${API_ENDPOINTS.ACCOUNTS.LIST}`);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    await customContext.dispose();
  });
});
