import { test, expect } from '../fixtures/PageFixtures';
import { Logger } from '../utils/Logger';
import { PageSignUp } from '../pages/pageSignUp';
import TestData from '../data/testData.json';
import { Routes } from '../support/routes';

test.beforeEach(async ({ pageSignUp }) => {
  Logger.step('Navigate to signup page', { action: 'visitSignUpPage' });
  await pageSignUp.visitSignUpPage();
});

test('TC1 - Sign up successfully via UI', async ({ pageSignUp, page }) => {
  Logger.step('Execute UI signup test', { testName: 'TC1 - Sign up successfully via UI' });
  const randomEmail = PageSignUp.generateUniqueEmail(TestData.validUser.email);
  await pageSignUp.signUpUser(TestData.validUser.firstName, TestData.validUser.lastName, randomEmail, TestData.validUser.password);
  await expect(page.getByText(pageSignUp.messageCreationAccount)).toBeVisible();
  await page.waitForTimeout(5000);
  Logger.info('UI signup test completed successfully');
});

test('TC2 - Sign up successfully via API', async ({ pageSignUp, request }) => {
  Logger.step('Execute API signup test', { testName: 'TC2 - Sign up successfully via API' });
  const { response, uniqueEmail } = await pageSignUp.signUpUserViaAPI(request, TestData.validUser);
  await pageSignUp.validateSignupAPIResponse(response, TestData.validUser, uniqueEmail);
  Logger.info('API signup test completed successfully');
});

test('TC3 - User is redirected to login flow once the account is created', async ({ pageSignUp, page }) => {
  Logger.step('Execute signup with redirection test', { testName: 'TC3 - User is redirected to login flow once the account is created' });
  const randomEmail = PageSignUp.generateUniqueEmail(TestData.validUser.email);
  Logger.info(`Testing signup with email: ${randomEmail}`);
  await pageSignUp.signUpUser(TestData.validUser.firstName, TestData.validUser.lastName, randomEmail, TestData.validUser.password);
  await expect(page.getByText(pageSignUp.messageCreationAccount)).toBeVisible({ timeout: 10000 });
  await page.waitForURL(Routes.login);
  await page.waitForTimeout(2000);
  Logger.info('Signup redirection test completed successfully');
});

test('TC4 -  Sign up fails due to email already registered', async ({ pageSignUp, page }) => {
  Logger.step('Execute signup failure test', { testName: 'TC4 - Sign up fails due to email already registered' });
  await pageSignUp.signUpUser(TestData.validUser.firstName, TestData.validUser.lastName, TestData.validUser.email, TestData.validUser.password);
  await expect(page.getByText(pageSignUp.messageEmailAlreadyUsed)).toBeVisible();
  await page.waitForTimeout(5000);
  Logger.info('Signup failure test completed successfully');
});

test('TC5 - Sign up successfully verifying API response', async ({ pageSignUp }) => {
  Logger.step('Execute signup with API verification test', { testName: 'TC5 - Sign up successfully verifying API response' });
  await pageSignUp.signUpUserViaUIWithAPIVerification(TestData.validUser);
  Logger.info('Signup with API verification test completed successfully');
});

test('TC6 - Sign up: handles 409 (email already in use) without navigation', async ({ pageSignUp }) => {
  Logger.step('Execute 409 error handling test', { testName: 'TC6 - Sign up: handles 409 (email already in use) without navigation' });
  await pageSignUp.testSignupWith409Error(TestData.validUser);
  Logger.info('409 error handling test completed successfully');
});