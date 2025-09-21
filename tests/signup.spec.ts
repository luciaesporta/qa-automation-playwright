import { test, expect } from '@playwright/test';
import { PageSignUp } from '../pages/pageSignUp';
import TestData from '../data/testData.json';
import { Routes } from '../support/routes';
let pageSignUp: PageSignUp;

test.beforeEach(async ({ page }) => {
  pageSignUp = new PageSignUp(page);
  await pageSignUp.visitSignUpPage();
});

test('TC1 - Sign up successfully via UI', async ({ page }) => {
  const randomEmail = PageSignUp.generateUniqueEmail(TestData.validUser.email);
  await pageSignUp.signUpUser(TestData.validUser.firstName, TestData.validUser.lastName, randomEmail, TestData.validUser.password);
  await expect(page.getByText(pageSignUp.messageCreationAccount)).toBeVisible();
  await page.waitForTimeout(5000);
});


test('TC2 - Sign up successfully via API', async ({ request }) => {
  const { response, uniqueEmail } = await pageSignUp.signUpUserViaAPI(request, TestData.validUser);
  await pageSignUp.validateSignupAPIResponse(response, TestData.validUser, uniqueEmail);
});


test('TC3 - User is redirected to login flow once the account is created', async ({ page }) => {
  const randomEmail = PageSignUp.generateUniqueEmail(TestData.validUser.email);
  await pageSignUp.signUpUser(TestData.validUser.firstName, TestData.validUser.lastName, randomEmail, TestData.validUser.password);
  await expect(page.getByText(pageSignUp.messageCreationAccount)).toBeVisible();
  await page.waitForURL(Routes.login);
  await page.waitForTimeout(5000);
});

test('TC4 -  Sign up fails due to email already registered', async ({ page }) => {
  await pageSignUp.signUpUser(TestData.validUser.firstName, TestData.validUser.lastName, TestData.validUser.email, TestData.validUser.password);
  await expect(page.getByText(pageSignUp.messageEmailAlreadyUsed)).toBeVisible();
  await page.waitForTimeout(5000);
});


test('TC5 - Sign up successfully verifying API response', async ({ page }) => {
  const email = PageSignUp.generateUniqueEmail(TestData.validUser.email);

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

test('TC6 - Sign up: handles 409 (email already in use) without navigation', async ({ page }) => {
  const email = PageSignUp.generateUniqueEmail(TestData.validUser.email);
   
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