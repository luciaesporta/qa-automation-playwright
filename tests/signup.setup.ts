
import {expect, test as setup} from '@playwright/test';
import { PageLogin } from '../pages/pageLogin';
import { PageDashboard } from '../pages/pageDashboard';
import { ModalCreateBankAccount } from '../pages/modalCreateBankAccount';
import TestData from '../data/testData.json';
import { BackendUtils } from '../utils/backendUtils';
import fs from 'fs/promises';
import path from 'path';

let pageLogin: PageLogin;
let pageDashboard: PageDashboard;
let modalCreateBankAccount: ModalCreateBankAccount;

const senderMoneyUserAuthFile = 'playwright/.senderMoneyUser.json'
const receiverMoneyUserAuthFile = 'playwright/.receiverMoneyUser.json'
const userSentDataFile = 'playwright/.senderMoneyUser.data.json'

setup.beforeEach(async ({ page }) => {
  pageLogin = new PageLogin(page);
  pageDashboard = new PageDashboard(page);
  modalCreateBankAccount = new ModalCreateBankAccount(page);               
  await pageLogin.visitLoginPage();
});

setup ('Creates user via API and sends money', async ({page, request}) => {
    const newUser = await BackendUtils.createUserViaAPI(request, TestData.validUser);

    await fs.writeFile(path.resolve(__dirname, '..', userSentDataFile), JSON.stringify(newUser, null, 2))

    await pageLogin.loginSuccessfully(newUser.email, newUser.password);
    await pageDashboard.buttonAddAccount.click();
    await modalCreateBankAccount.createAccount('Débito', '1000');
    await page.context().storageState({path: senderMoneyUserAuthFile});
  });

  setup ('Money receiver logs in successfully', async ({page}) => {
    await pageLogin.loginSuccessfully(TestData.receiverMoney.email, TestData.receiverMoney.password);
    await page.context().storageState({path: receiverMoneyUserAuthFile});
  });

