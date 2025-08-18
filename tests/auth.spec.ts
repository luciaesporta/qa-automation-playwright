import { test, expect } from '@playwright/test';
import { PageLogin } from '../pages/pageLogin';
import { PageDashboard } from '../pages/pageDashboard';

let pageLogin: PageLogin;

test.beforeEach(async ({ page }) => {
  pageLogin = new PageLogin(page);
  await pageLogin.visitLoginPage();
});

test('TC6 - Log in successfully with redirection to the Dashboard', async ({ page }) => {

  await pageLogin.loginAndRedirectionToDashboardPage("luciaalvarezesporta@gmail.com", "12345678");
  const pageDashboard = new PageDashboard(page);
  await expect(pageDashboard.dashboardTitle).toBeVisible({ timeout: 7000 });
});

test('TC7 - Login fails correctly introducing wrong password', async ({ page }) => {
  await pageLogin.loginFailsIntroducingWrongPassword("luciaalvarezesporta@gmail.com", "wrongpassword");
  await page.pause();
  await page.waitForTimeout(5000);

});

test('TC8 - Login fails when email field is empty', async ({page}) => {
  await pageLogin.submitEmptyEmailLoginFormShouldFail("12345678");
});

test('TC9 - Login fails with invalid email', async ({page}) => {
  await pageLogin.submitIncorrectEmailFormatLoginFormShouldFail('luciaalvarezesporta', '12345678');
});


test('TC10 - Routes are protected for non-authenticated users', async ({page}) => {
  await pageLogin.navigationFailsWhenUserIsLoggedout("luciaalvarezesporta@gmail.com", "12345678");
});