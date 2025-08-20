
import {expect, test as setup} from '@playwright/test';
import { PageLogin } from '../pages/pageLogin';
import { PageDashboard } from '../pages/pageDashboard';
import { ModalCreateBankAccount } from '../pages/modalCreateBankAccount';
import TestData from '../data/testData.json';
import { BackendUtils } from '../utils/backendUtils';

let pageLogin: PageLogin;
let pageDashboard: PageDashboard;
let modalCreateBankAccount: ModalCreateBankAccount;

const senderMoneyUserAuthFile = 'playwright/.senderMoneyUser.json'
const receiverMoneyUserAuthFile = 'playwright/.receiverMoneyUser.json'

setup.beforeEach(async ({ page }) => {
  pageLogin = new PageLogin(page);
  pageDashboard = new PageDashboard(page);
  modalCreateBankAccount = new ModalCreateBankAccount(page);               
  await pageLogin.visitLoginPage();
});

setup ('Creates user via API and sends money', async ({page, request}) => {
    const newUser = await BackendUtils.createUserViaAPI(request, TestData.validUser);

    await pageLogin.loginSuccessfully(newUser.email, newUser.password);
    await pageDashboard.buttonAddAccount.click();
    await modalCreateBankAccount.createAccount('Débito', '1000');
    await page.context().storageState({path: senderMoneyUserAuthFile});
  });

  setup ('Money receiver logs in successfully', async ({page}) => {
    await pageLogin.loginSuccessfully(TestData.receiverMoney.email, TestData.receiverMoney.password);
    //await pageDashboard.buttonAddAccount.click();
    //await modalCreateBankAccount.createAccount('Débito', '1000');
    await page.context().storageState({path: receiverMoneyUserAuthFile});
  });

