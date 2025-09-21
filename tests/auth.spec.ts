import { test, expect } from '@playwright/test';
import { PageAuth } from '../pages/pageAuth';
import { PageDashboard } from '../pages/pageDashboard';

let pageAuth: PageAuth;

test.beforeEach(async ({ page }) => {
  pageAuth = new PageAuth(page);
  await pageAuth.visitLoginPage();
});

test('TC1 - Log in successfully', async ({ page }) => {
  await pageAuth.loginSuccessfully("luciaalvarezesporta@gmail.com", "12345678");
  await page.waitForTimeout(5000);
});

test('TC2 - Log in successfully with redirection to the Dashboard', async ({ page }) => {
  await pageAuth.loginAndRedirectionToDashboardPage("luciaalvarezesporta@gmail.com", "12345678");
  const pageDashboard = new PageDashboard(page);
  await expect(pageDashboard.dashboardTitle).toBeVisible({ timeout: 7000 });
});

test('TC3 - Routes are protected for non-authenticated users', async ({page}) => {
  await pageAuth.navigationFailsWhenUserIsLoggedout("luciaalvarezesporta@gmail.com", "12345678");
});

test('TC4 - Login fails introducing wrong password', async ({ page }) => {
  await pageAuth.loginFailsIntroducingWrongPassword("luciaalvarezesporta@gmail.com", "wrongpassword");
  await page.pause();
  await page.waitForTimeout(5000);

});

test('TC5 - Login fails when email field is empty', async ({page}) => {
  await pageAuth.submitEmptyEmailLoginFormShouldFail("12345678");
});

test('TC6 - Login fails with invalid email', async ({page}) => {
  await pageAuth.submitIncorrectEmailFormatLoginFormShouldFail('luciaalvarezesporta', '12345678');
});


