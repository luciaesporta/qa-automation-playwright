import { test, expect } from '@playwright/test';
import { PageSignUp } from '../pages/pageSignUp';

let pageSignUp: PageSignUp;

test('TC1 - Sign up successfully', async ({ page }) => {
  pageSignUp = new PageSignUp(page)
  const randomEmail = 'luciaalvarezesporta' + Math.floor(Math.random()*1000)+'@example.com';
  
  await page.goto('http://localhost:3000/signup');
  await pageSignUp.nameInput.fill('Lucía');
  //await page.getByRole ('textbox', {name: 'Nombre'}).fill('Lucía');
  await page.locator('[name="lastName"]').fill('Esporta');
  await page.getByRole('textbox', { name: 'Correo electrónico' }).fill(randomEmail);
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('12345678');
  await page.getByTestId('boton-registrarse').click();
  await expect(page.getByText('Registro exitoso!')).toBeVisible();
  await page.waitForTimeout(5000);
});


test('TC2 -  Sign up fails due to email already registered', async ({ page }) => {
  pageSignUp = new PageSignUp(page)
  await page.goto('http://localhost:3000/signup');
  await pageSignUp.nameInput.fill('Sofía');
  await page.locator('[name="lastName"]').fill('Esporta');
  await page.getByRole('textbox', { name: 'Correo electrónico' }).fill('luciaalvarezesporta@gmail.com');
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('12345678');
  await page.getByTestId('boton-registrarse').click();
  await expect(page.getByText('Email is already taken')).toBeVisible();
  await page.waitForTimeout(5000);
});

/*test('get started link', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});*/
