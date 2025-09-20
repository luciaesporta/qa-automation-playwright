import { test, expect } from '@playwright/test';
import { PageLogin } from '../pages/pageLogin';
import { PageDashboard } from '../pages/pageDashboard';
import { ModalCreateBankAccount } from '../pages/modalCreateBankAccount';
import TestData from '../data/testData.json';
import { Route } from '@playwright/test';
import { Routes } from '../support/routes';
import { ModalTransferMoney } from '../pages/modalTransferMoney';
import fs from 'fs/promises';

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

 //Refactor this test including POM and creating new user for test execution 
/*test('TC5 - Verify user can create a bank account correctly', async ({ page }) => {
  await pageLogin.visitLoginPage();
  await pageLogin.loginAndRedirectionToDashboardPage(TestData.validUser.email, TestData.validUser.password);
  const pageDashboard = new PageDashboard(page);
  
  await page.waitForLoadState('networkidle');
  
  await pageDashboard.buttonAddAccount.waitFor({ state: 'visible' });
  await page.waitForTimeout(1000);
  
  await pageDashboard.buttonAddAccount.click();
  await modalCreateBankAccount.createAccount('Débito', '1000');
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

  //Refactor this test including POM and API utils
  testReceivesMoneyUser('TC15 - Verify money transfer via API', async ({page, request}) => {
    const userSentDataFile = require.resolve('../playwright/.senderMoneyUser.data.json');
    const dataSentUser = JSON.parse(await fs.readFile(userSentDataFile, 'utf-8'));
    const emailSentUser = dataSentUser.email;
    expect (emailSentUser,'Failed to read user email from file.').toBeDefined();

   const userSentAuth = require.resolve('../playwright/.senderMoneyUser.json')
    const userSentAuthContent = await fs.readFile(userSentAuth, 'utf-8');
    const dataSentAuthUser = JSON.parse(userSentAuthContent);
    const jwtSentAuthUser = dataSentAuthUser.origins[0]?.localStorage.find(item => item.name === 'jwt')?.value;
    expect (jwtSentAuthUser,'The JWT token is not defined.').toBeDefined();
    const jwt = jwtSentAuthUser;
    
    const responseAccounts = await request.get('http://localhost:6007/api/accounts', {
      headers: {
        'Authorization': `Bearer ${jwt}`
      }
    });
    expect(responseAccounts.ok(), `Account API is not working: ${responseAccounts.statusText()}`).toBeTruthy();
    const accounts = await responseAccounts.json();
    expect(accounts.length, 'No accounts found').toBeGreaterThan(0);
    const idOriginAccount = accounts[0]._id;

    const randomAmount = Math.floor(Math.random() * 100) + 1;
    console.log(`Transferring of: $${randomAmount} from account ${idOriginAccount} to ${TestData.receiverMoney.email}`);
 
    const responseTransfer = await request.post('http://localhost:6007/api/transactions/transfer', {
      headers: {
        'Authorization': `Bearer ${jwt}`
      },
      data: {
        fromAccountId: idOriginAccount,
        toEmail: TestData.receiverMoney.email,
        amount: randomAmount
      }
    });
    expect(responseTransfer.ok(), `Transfer API is not working: ${responseTransfer.statusText()}`).toBeTruthy();
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(pageDashboard.receivedTransferEmailRow.first()).toBeVisible();
    await expect(pageDashboard.elementsTransferList.first()).toContainText(emailSentUser);
    const amountRegex = new RegExp(String(randomAmount.toFixed(2)))
    await expect(pageDashboard.elementsTransactionsAmounts.first()).toContainText(amountRegex);
    await page.waitForTimeout(5000);
      });

    



