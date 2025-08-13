import { test, expect } from '@playwright/test';
import { PageSignUp } from '../pages/pageSignUp';
import TestData from '../data/testData.json';
let pageSignUp: PageSignUp;

test.beforeEach(async ({ page }) => {
  pageSignUp = new PageSignUp(page);
  await pageSignUp.visitSignUpPage();
});

test('TC1 - Sign up successfully', async ({ page }) => {
  const randomEmail = 'luciaalvarezesporta' + Math.floor(Math.random() * 1000) + '@gmail.com';
  await pageSignUp.signUpUser('Lucía', 'Esporta', randomEmail, 'password123');
  await expect(page.getByText(pageSignUp.messageCreationAccount)).toBeVisible();
  await page.waitForTimeout(5000);
});

test('TC2 -  Sign up fails due to email already registered', async ({ page }) => {
  await pageSignUp.signUpUser('Lucía', 'Esporta', 'luciaalvarezesporta@gmail.com', 'password123');
  await expect(page.getByText(pageSignUp.messageEmailAlreadyUsed)).toBeVisible();
  await page.waitForTimeout(5000);
});

test('TC3 - User is redirected to login flow once the account is created', async ({ page }) => {
  const randomEmail = 'luciaalvarezesporta' + Math.floor(Math.random() * 1000) + '@gmail.com';
  await pageSignUp.signUpUser('Lucía', 'Esporta', randomEmail, 'password123');
  await expect(page.getByText(pageSignUp.messageCreationAccount)).toBeVisible();
  await page.waitForURL('http://localhost:3000/login');
  await page.waitForTimeout(5000);
});

test('TC10 - Sign up successfully via API', async ({ request }) => {
  const email = (TestData.validUser.email.split('@'))[0] + Math.floor(Math.random() * 1000) + '@' + (TestData.validUser.email.split('@')[1]); 
  const response = await request.post('http://localhost:6007/api/auth/signup', {
    headers: { 'Content-Type': 'application/json' },
    data: {
      firstName: TestData.validUser.firstName,
      lastName: TestData.validUser.lastName,
      email: email,
      password: TestData.validUser.password,
    },
  });

  const responseBody = await response.json();
  expect(response.status()).toBe(201);
  expect(responseBody).toHaveProperty('token');
  expect(typeof responseBody.token).toBe('string');
  expect(responseBody).toHaveProperty('user');

  expect(responseBody.user).toEqual(
    expect.objectContaining({
      id: expect.any(String), 
      firstName: 'Lucía',
      lastName: 'Esporta',
      email: email,
    }));
});


test('TC11 - Sign up successfully verifying API response', async ({ page }) => {
  const email =
    TestData.validUser.email.split('@')[0] +
    Math.floor(Math.random() * 1000) +
    '@' +
    TestData.validUser.email.split('@')[1];

  await test.step('Complete sign up form', async () => {
    await pageSignUp.signUpUser(
      TestData.validUser.firstName,
      TestData.validUser.lastName,
      email,
      TestData.validUser.password
    );
  });

  const messageCreationAccountAPI = page.waitForResponse('**/api/auth/signup');

  const response = await messageCreationAccountAPI;
  const responseBody = await response.json();

  expect(response.status()).toBe(201);
  expect(responseBody).toHaveProperty('token');
  expect(typeof responseBody.token).toBe('string');
  expect(responseBody).toHaveProperty('user');
  expect(responseBody.user).toEqual(
    expect.objectContaining({
      id: expect.any(String),
      firstName: TestData.validUser.firstName,
      lastName: TestData.validUser.lastName,
      email
    }));

  await expect(page.getByText(pageSignUp.messageCreationAccount)).toBeVisible();
})

test('TC12 - Sign up: handles 409 (email already in use) without navigation', async ({ page }) => {
const email =
    TestData.validUser.email.split('@')[0] +
    Math.floor(Math.random() * 1000) +
    '@' +
    TestData.validUser.email.split('@')[1];
   
  await page.route('**/api/auth/signup', route => {
  route.fulfill({
    status: 409,
    contentType: 'application/json',
    body: JSON.stringify ({message: 'Email already in use'})
  })
  })

  await pageSignUp.signUpUser(
      TestData.validUser.firstName,
      TestData.validUser.lastName,
      email,
      TestData.validUser.password
    );
})