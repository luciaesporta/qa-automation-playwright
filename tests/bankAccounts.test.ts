import { test, expect } from '../fixtures/PageFixtures';
import { PageAuth } from '../pages/pageAuth';
import { PageDashboard } from '../pages/pageDashboard';
import { ModalCreateBankAccount } from '../pages/modalCreateBankAccount';
import { PageSignUp } from '../pages/pageSignUp';
import { Logger } from '../utils/Logger';

let testUser: { firstName: string; lastName: string; email: string; password: string };

test.beforeEach(async ({ page, pageAuth }) => {
    Logger.step('Navigate to login page', { action: 'visitLoginPage' });
    await pageAuth.visitLoginPage();

    const timestamp = Date.now();
    testUser = {
        firstName: "Bank",
        lastName: "Test",
        email: `bankaccount${timestamp}@test.com`,
        password: "12345678"
    };

    await page.goto('/signup');
    const pageSignUp = new PageSignUp(page);
    await pageSignUp.signUpUser(testUser.firstName, testUser.lastName, testUser.email, testUser.password);

    Logger.step('User created for bank account tests', { user: testUser.email });
});

test('TC1 - Create bank account successfully', async ({ pageAuth, pageDashboard, page }) => {
    const modalCreateBankAccount = new ModalCreateBankAccount(page);
    Logger.step('Test create bank account successfully', { testName: 'TC1 - Create bank account successfully' });
    await pageAuth.loginSuccessfully(testUser.email, testUser.password);
    await pageDashboard.visitDashboardPage();
    await pageDashboard.buttonAddAccount.click();
    await modalCreateBankAccount.createAccount("Débito", "1000");
    await expect(modalCreateBankAccount.successMessage).toBeVisible();
    Logger.info('Bank account created successfully');
});

test('TC2 - Delete bank account successfully', async ({ pageAuth, pageDashboard, page }) => {
    const modalCreateBankAccount = new ModalCreateBankAccount(page);
    Logger.step('Test delete bank account successfully', { testName: 'TC2 - Delete bank account successfully' });
    await pageAuth.loginSuccessfully(testUser.email, testUser.password);
    await pageDashboard.visitDashboardPage();
    await pageDashboard.buttonAddAccount.click();
    await modalCreateBankAccount.createAccount("Débito", "1000");
    await expect(modalCreateBankAccount.successMessage).toBeVisible();
    await modalCreateBankAccount.deleteBankAccount();
    await expect(pageDashboard.buttonAddAccount).toBeVisible();
    Logger.info('Bank account deleted successfully');
});
