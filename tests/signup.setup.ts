
import {expect, test as setup} from '@playwright/test';
import { PageAuth } from '../pages/pageAuth';
import { PageDashboard } from '../pages/pageDashboard';
import { ModalCreateBankAccount } from '../pages/modalCreateBankAccount';
import TestData from '../data/testData.json';
import { BackendUtils } from '../utils/backendUtils';
import fs from 'fs/promises';
import path from 'path';

let pageAuth: PageAuth;
let pageDashboard: PageDashboard;
let modalCreateBankAccount: ModalCreateBankAccount;

const senderMoneyUserAuthFile = 'playwright/.senderMoneyUser.json'
const receiverMoneyUserAuthFile = 'playwright/.receiverMoneyUser.json'
const userSentDataFile = 'playwright/.senderMoneyUser.data.json'
const newUserWithBankAccountAuthFile = 'playwright/.newUserWithBankAccount.json'

setup.beforeEach(async ({ page }) => {
  pageAuth = new PageAuth(page);
  pageDashboard = new PageDashboard(page);
  modalCreateBankAccount = new ModalCreateBankAccount(page);               
  await pageAuth.visitLoginPage();
});

setup ('Creates user via API and sends money', async ({page, request}) => {
    const newUser = await BackendUtils.createUserViaAPI(request, TestData.validUser);

    await fs.writeFile(path.resolve(__dirname, '..', userSentDataFile), JSON.stringify(newUser, null, 2))

    await pageAuth.loginSuccessfully(newUser.email, newUser.password);
    await pageDashboard.buttonAddAccount.click();
    await modalCreateBankAccount.createAccount('Débito', '1000');
    await page.context().storageState({path: senderMoneyUserAuthFile});
  });

  setup ('Money receiver logs in successfully', async ({page}) => {
    await pageAuth.loginSuccessfully(TestData.receiverMoney.email, TestData.receiverMoney.password);
    await page.context().storageState({path: receiverMoneyUserAuthFile});
  });

  setup ('Creates new user with bank account for testing', async ({page, request}) => {
    const newUser = await BackendUtils.createUserViaAPI(request, TestData.validUser);
    
    await pageAuth.loginSuccessfully(newUser.email, newUser.password);
    const accountCreated = await pageDashboard.createBankAccount('Débito', '1000');
    
    if (accountCreated) {
      console.log('Bank account created successfully for new user');
    } else {
      console.log('Bank account creation skipped - button not visible');
    }
    
    await page.context().storageState({path: newUserWithBankAccountAuthFile});
  });

