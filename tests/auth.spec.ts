import { test, expect } from '@playwright/test';
import { PageLogin } from '../pages/pageLogIn';
import { PageDashboard } from '../pages/pageDashboard';

let pageLogin: PageLogin;

test('TC6 - Log in successfully with redirection to the Dashboard', async ({ page }) => {
  pageLogin = new PageLogin(page);
  await pageLogin.loginAndRedirectionToDashboardPage("luciaalvarezesporta@gmail.com", "12345678");

  const pageDashboard = new PageDashboard(page);
  await expect(pageDashboard.dashboardTitle).toBeVisible({ timeout: 7000 });
});
