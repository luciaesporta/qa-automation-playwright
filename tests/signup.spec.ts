import { test, expect } from '@playwright/test';
import { PageSignUp } from '../pages/pageSignUp';

let pageSignUp: PageSignUp;

test('TC1 - Sign up successfully', async ({ page }) => {
  pageSignUp = new PageSignUp(page)
  const randomEmail = 'luciaalvarezesporta' + Math.floor(Math.random()*1000)+'@gmail.com';
  
  await pageSignUp.visitSignUpPage();
  await pageSignUp.signUpUser("Lucía", "Esporta", randomEmail,"password123");
  await expect(page.getByText(pageSignUp.messageCreationAccount)).toBeVisible();
  await page.waitForTimeout(5000);
});

test('TC2 -  Sign up fails due to email already registered', async ({ page }) => {
  pageSignUp = new PageSignUp(page)
  
  await pageSignUp.visitSignUpPage();
  await pageSignUp.signUpUser('Lucía', 'Esporta', 'luciaalvarezesporta@gmail.com','password123');
  await expect(page.getByText(pageSignUp.messageEmailAlreadyUsed)).toBeVisible();
  await page.waitForTimeout(5000);
}); 


test('TC3 - User is redirected to login flow once the account is created', async ({ page }) => {
  pageSignUp = new PageSignUp(page);
  const randomEmail = 'luciaalvarezesporta' + Math.floor(Math.random() * 1000) + '@gmail.com';
  
  await pageSignUp.visitSignUpPage();
  await pageSignUp.signUpUser("Lucía", "Esporta", randomEmail, "password123");
  await expect(page.getByText(pageSignUp.messageCreationAccount)).toBeVisible();
  await page.waitForURL('http://localhost:3000/login')
  await page.waitForTimeout(5000);
}); 
