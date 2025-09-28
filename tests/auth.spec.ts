import { test, expect } from '../fixtures/PageFixtures';
import { Logger } from '../utils/Logger';

test.beforeEach(async ({ pageAuth }) => {
  Logger.step('Navigate to login page', { action: 'visitLoginPage' });
  await pageAuth.visitLoginPage();
});

test('TC1 - Log in successfully', async ({ pageAuth, page }) => {
  Logger.step('Execute successful login', { testName: 'TC1 - Log in successfully' });
  await pageAuth.loginSuccessfully("luciaalvarezesporta@gmail.com", "12345678");
  await page.waitForTimeout(5000);
  Logger.info('Login test completed successfully');
});

test('TC2 - Log in successfully with redirection to the Dashboard', async ({ pageAuth, pageDashboard, page }) => {
  Logger.step('Execute login with dashboard redirection', { testName: 'TC2 - Log in successfully with redirection to the Dashboard' });
  await pageAuth.loginAndRedirectionToDashboardPage("luciaalvarezesporta@gmail.com", "12345678");
  await expect(pageDashboard.dashboardTitle).toBeVisible({ timeout: 7000 });
  Logger.info('Dashboard redirection test completed successfully');
});

test('TC3 - Routes are protected for non-authenticated users', async ({ pageAuth }) => {
  Logger.step('Test route protection for non-authenticated users', { testName: 'TC3 - Routes are protected for non-authenticated users' });
  await pageAuth.navigationFailsWhenUserIsLoggedout("luciaalvarezesporta@gmail.com", "12345678");
  Logger.info('Route protection test completed successfully');
});

test('TC4 - Login fails introducing wrong password', async ({ pageAuth, page }) => {
  Logger.step('Test login failure with wrong password', { testName: 'TC4 - Login fails introducing wrong password' });
  await pageAuth.loginFailsIntroducingWrongPassword("luciaalvarezesporta@gmail.com", "wrongpassword");
  await page.pause();
  await page.waitForTimeout(5000);
  Logger.info('Wrong password test completed successfully');
});

test('TC5 - Login fails when email field is empty', async ({ pageAuth }) => {
  Logger.step('Test login failure with empty email', { testName: 'TC5 - Login fails when email field is empty' });
  await pageAuth.submitEmptyEmailLoginFormShouldFail("12345678");
  Logger.info('Empty email test completed successfully');
});

test('TC6 - Login fails with invalid email', async ({ pageAuth }) => {
  Logger.step('Test login failure with invalid email format', { testName: 'TC6 - Login fails with invalid email' });
  await pageAuth.submitIncorrectEmailFormatLoginFormShouldFail('luciaalvarezesporta', '12345678');
  Logger.info('Invalid email format test completed successfully');
});


