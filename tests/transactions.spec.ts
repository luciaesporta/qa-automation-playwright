import { test, expect } from '@playwright/test';
import { PageAuth } from '../pages/pageAuth';
import { PageDashboard } from '../pages/pageDashboard';
import { ModalCreateBankAccount } from '../pages/modalCreateBankAccount';
import TestData from '../data/testData.json';
import { ApiUtils } from '../utils/apiUtils';
import { getUserEmailFromFile, getJwtFromStorage } from '../utils/authUtils';
import { ModalTransferMoney } from '../pages/modalTransferMoney';
import fs from 'fs/promises';

let pageAuth: PageAuth;
let pageDashboard: PageDashboard;
let modalCreateBankAccount: ModalCreateBankAccount;
let modalTransferMoney: ModalTransferMoney;

test.beforeEach(async ({page}) => {
  pageAuth = new PageAuth(page);
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

const testNewUserWithBankAccount = test.extend({
  storageState: 'playwright/.newUserWithBankAccount.json',
});

testNewUserWithBankAccount('TC1 - Verify user can create a bank account correctly', async ({ page }) => {
  const pageDashboard = new PageDashboard(page);
  await expect(pageDashboard.dashboardTitle).toBeVisible({ timeout: 5000 });
  const accountCreated = await pageDashboard.createBankAccount('Débito', '1000');
  expect(accountCreated).toBe(true);
});

testSendsMoneyUser('TC2 - Verify user can send money to another user', async ({page}) => {
  await expect (pageDashboard.dashboardTitle).toBeVisible({ timeout: 5000 });
  await pageDashboard.buttonSendMoney.click(); 
  await modalTransferMoney.completeAndSendMoneyTransfer('luciaalvarezesporta+moneyreceiver@gmail.com', '25')
  await page.waitForTimeout(5000);
});

testReceivesMoneyUser('TC3 - Verify user receives money from another user', async ({page}) => {
  await expect (pageDashboard.dashboardTitle).toBeVisible({ timeout: 5000 });
  await expect(pageDashboard.receivedTransferEmailRow.first()).toBeVisible();
  });

  testReceivesMoneyUser('TC4 - Verify money transfer via API', async ({ page, request }) => {
    const emailSentUser = await getUserEmailFromFile('playwright/.senderMoneyUser.data.json');
    const jwt = await getJwtFromStorage('playwright/.senderMoneyUser.json');
    const randomAmount = PageDashboard.generateRandomAmount();
    await pageDashboard.transferMoneyViaAPI(request, jwt, TestData.receiverMoney.email, randomAmount);
    await pageDashboard.verifyTransferOnDashboard(emailSentUser, randomAmount);
  });
  

    



