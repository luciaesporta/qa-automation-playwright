import { test, expect } from '@playwright/test';
import { PageLogin } from '../pages/pageLogIn';


let pageLogin: PageLogin;


test('TC4 - Log in successfully', async ({ page }) => {
  pageLogin = new PageLogin(page);
  
  await pageLogin.visitLoginPage();
  await pageLogin.loginSuccessfully("luciaalvarezesporta@gmail.com", "12345678");
  await page.waitForTimeout(5000);
});

