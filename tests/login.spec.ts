import { test, expect } from '@playwright/test';
import { PageLogin } from '../pages/pageLogIn';


let pageLogin: PageLogin;

test.beforeEach(async ({page}) => {
  pageLogin = new PageLogin(page);
  await pageLogin.visitLoginPage();
});


test('TC4 - Log in successfully', async ({ page }) => {
  await pageLogin.loginSuccessfully("luciaalvarezesporta@gmail.com", "12345678");
  await page.waitForTimeout(5000);
});

