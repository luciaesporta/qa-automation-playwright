import { test, expect } from '@playwright/test';
import { PageLogin } from '../pages/pageLogin';
import { PageDashboard } from '../pages/pageDashboard';
import { ModalCreateBankAccount } from '../pages/modalCreateBankAccount';
import TestData from '../data/testData.json';
import { Route } from '@playwright/test';
import { Routes } from '../support/routes';
import { ModalTransferMoney } from '../pages/modalTransferMoney';

let pageLogin: PageLogin;
let pageDashboard: PageDashboard;
let modalCreateBankAccount: ModalCreateBankAccount;
let modalTransferMoney: ModalTransferMoney;

test.beforeEach(async ({page}) => {
  pageLogin = new PageLogin(page);
  pageDashboard = new PageDashboard(page);
  modalCreateBankAccount = new ModalCreateBankAccount(page);
  modalTransferMoney = new ModalTransferMoney(page);
  await pageDashboard.visitDashboardPage();
});

const testSendsMoneyUser = test.extend({
  storageState: 'playwright/.senderMoneyUser.json',
});

const testReceivesMoneyUser = test.extend({
  storageState: 'playwright/.receiverMoneyUser.json',
});

/*test('TC5 - Verify user can create a bank account correctly', async ({ page }) => {
  await pageLogin.visitLoginPage();
  await pageLogin.loginAndRedirectionToDashboardPage(TestData.validUser.email, TestData.validUser.password);
  const pageDashboard = new PageDashboard(page);
  
  // Wait for the page to be fully loaded
  await page.waitForLoadState('networkidle');
  
  // Wait for the button to be visible and add a small delay for stability
  await pageDashboard.buttonAddAccount.waitFor({ state: 'visible' });
  await page.waitForTimeout(1000);
  
  await pageDashboard.buttonAddAccount.click();
  await modalCreateBankAccount.createAccount('Débito', '1000');
  //await modalCreateBankAccount.optionDebit.click();
  //await modalCreateBankAccount.inicialAmount.fill('150');
});*/

testSendsMoneyUser('TC13 - Verify user can send money to another user', async ({page}) => {
  //await page.goto(Routes.dashboard);
  await expect (pageDashboard.dashboardTitle).toBeVisible({ timeout: 5000 });
  await pageDashboard.buttonSendMoney.click(); 
  await modalTransferMoney.completeAndSendMoneyTransfer('luciaalvarezesporta+moneyreceiver@gmail.com', '25')
  await page.waitForTimeout(5000);
});

testReceivesMoneyUser('TC14 - Verify user receives money from another user', async ({page}) => {
  await expect (pageDashboard.dashboardTitle).toBeVisible({ timeout: 5000 });
  await expect(pageDashboard.receivedTransferEmailRow.first()).toBeVisible();


  });


