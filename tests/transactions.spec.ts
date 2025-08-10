import { test, expect } from '@playwright/test';
import { PageLogin } from '../pages/pageLogIn';
import { PageDashboard } from '../pages/pageDashboard';
import { ModalCreateBankAccount } from '../pages/modalCreateBankAccount';

let pageLogin: PageLogin;
let pageDashboard: PageDashboard;
let modalCreateBankAccount: ModalCreateBankAccount;

test.beforeEach(async ({page}) => {
  pageLogin = new PageLogin(page);
  pageDashboard = new PageDashboard(page);
  modalCreateBankAccount = new ModalCreateBankAccount(page);
  await pageLogin.visitLoginPage();
  await page.waitForURL('http://localhost:3000/dashboard');
});


test('TC5 - Verify user can create a bank account correctly', async ({ page }) => {
  await pageLogin.loginSuccessfully("luciaalvarezesporta@gmail.com", "12345678");
  await pageDashboard.buttonAddAccount.click();
  await modalCreateBankAccount.typeOfAccountCombobox.click();
  await modalCreateBankAccount.optionDebit.click();
  await modalCreateBankAccount.inicialAmount.fill('150');
  await modalCreateBankAccount.buttonCreateAccount.click();
  await page.waitForTimeout(5000);
});

