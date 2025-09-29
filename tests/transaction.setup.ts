import { expect, test as setup } from '@playwright/test';
import { PageAuth } from '../pages/pageAuth';
import { PageDashboard } from '../pages/pageDashboard';
import { ModalCreateBankAccount } from '../pages/modalCreateBankAccount';
import { BackendUtils } from '../utils/backendUtils';
import { Logger } from '../utils/Logger';
import { TEST_DATA } from '../config/environment';
import fs from 'fs/promises';
import path from 'path';

const senderMoneyUserAuthFile = 'playwright/.senderMoneyUser.json'
const receiverMoneyUserAuthFile = 'playwright/.receiverMoneyUser.json'
const userSentDataFile = 'playwright/.senderMoneyUser.data.json'
const newUserWithBankAccountAuthFile = 'playwright/.newUserWithBankAccount.json'

setup ('Creates user via API and sends money', async ({page, request}) => {
    const newUser = await BackendUtils.createUserViaAPI(request, TEST_DATA.USERS.VALID);

    await fs.writeFile(path.resolve(__dirname, '..', userSentDataFile), JSON.stringify(newUser, null, 2))

    const pageAuth = new PageAuth(page);
    const pageDashboard = new PageDashboard(page);
    const modalCreateBankAccount = new ModalCreateBankAccount(page);
    
    await pageAuth.visitLoginPage();
    await pageAuth.loginSuccessfully(newUser.email, newUser.password);
    await pageDashboard.buttonAddAccount.click();
    await modalCreateBankAccount.createAccount(TEST_DATA.ACCOUNTS.DEFAULT_TYPE, TEST_DATA.ACCOUNTS.DEFAULT_BALANCE);
    await page.context().storageState({path: senderMoneyUserAuthFile});
  });

  setup ('Money receiver logs in successfully', async ({page}) => {
    const pageAuth = new PageAuth(page);
    await pageAuth.visitLoginPage();
    await pageAuth.loginSuccessfully(TEST_DATA.USERS.RECEIVER.email, TEST_DATA.USERS.RECEIVER.password);
    await page.context().storageState({path: receiverMoneyUserAuthFile});
  });

  setup ('Creates new user with bank account for testing', async ({page, request}) => {
    const newUser = await BackendUtils.createUserViaAPI(request, TEST_DATA.USERS.VALID);
    
    const pageAuth = new PageAuth(page);
    const pageDashboard = new PageDashboard(page);
    
    await pageAuth.visitLoginPage();
    await pageAuth.loginSuccessfully(newUser.email, newUser.password);
    const accountCreated = await pageDashboard.createBankAccount(TEST_DATA.ACCOUNTS.DEFAULT_TYPE, TEST_DATA.ACCOUNTS.DEFAULT_BALANCE);
    
    if (accountCreated) {
      Logger.info('Bank account created successfully for new user', { 
        testName: 'Create new user with bank account for testing',
        accountType: TEST_DATA.ACCOUNTS.DEFAULT_TYPE,
        balance: TEST_DATA.ACCOUNTS.DEFAULT_BALANCE
      });
    } else {
      Logger.warn('Bank account creation skipped - button not visible', { 
        testName: 'Create new user with bank account for testing' 
      });
    }
    
    await page.context().storageState({path: newUserWithBankAccountAuthFile});
  });
