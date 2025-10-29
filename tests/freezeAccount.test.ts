import { test, expect } from '../fixtures/PageFixtures';
import { PageAuth } from '../pages/pageAuth';
import { PageDashboard } from '../pages/pageDashboard';
import { ModalFreezeAccount } from '../pages/modalFreezeAccount';
import { ModalCreateBankAccount } from '../pages/modalCreateBankAccount';
import { PageSignUp } from '../pages/pageSignUp';
import { Logger } from '../utils/Logger';
import { TEST_CONSTANTS, createTestUser, ROUTES } from '../constants/testConstants';

async function setupUserWithBankAccount(page: any, pageAuth: any, pageDashboard: any, pageSignUp: any, user: any) {
    Logger.step(`Setting up user: ${user.email}`);

    await page.goto(ROUTES.SIGNUP);
    await pageSignUp.signUpUser(user.firstName, user.lastName, user.email, user.password);
    
    await pageAuth.loginSuccessfully(user.email, user.password);
    await pageDashboard.visitDashboardPage();
    
    await pageDashboard.createBankAccount(TEST_CONSTANTS.ACCOUNT_TYPE, TEST_CONSTANTS.INITIAL_AMOUNT);
    
    Logger.info(`User ${user.email} setup completed with bank account`);
}

let pageObjects: {
    pageAuth: PageAuth;
    pageDashboard: PageDashboard;
    modalFreezeAccount: ModalFreezeAccount;
    modalCreateBankAccount: ModalCreateBankAccount;
    pageSignUp: PageSignUp;
};

test.beforeEach(async ({ page, pageAuth }) => {
    Logger.step('Initialize page objects', { action: 'setupPageObjects' });
    
    pageObjects = {
        pageAuth,
        pageDashboard: new PageDashboard(page),
        modalFreezeAccount: new ModalFreezeAccount(page),
        modalCreateBankAccount: new ModalCreateBankAccount(page),
        pageSignUp: new PageSignUp(page)
    };
    
    await pageAuth.visitLoginPage();
});

test('TC1 - Freeze account successfully', async ({ page }) => {
    const user = createTestUser('freeze');
    
    Logger.step('Test freeze account successfully', { testName: 'TC1 - Freeze account successfully' });
    
    // Setup user with bank account
    await setupUserWithBankAccount(page, pageObjects.pageAuth, pageObjects.pageDashboard, pageObjects.pageSignUp, user);
    
    // Wait for page to load and account to be visible
    await page.waitForLoadState('networkidle');
    
    // Test freeze functionality
    await pageObjects.modalFreezeAccount.freezeAccount();
    await expect(pageObjects.modalFreezeAccount.freezeSuccessMessage).toBeVisible();
    
    Logger.info('Account frozen successfully');
});

test('TC2 - Unfreeze account successfully', async ({ page }) => {
    const user = createTestUser('unfreeze');
    
    Logger.step('Test unfreeze account successfully', { testName: 'TC2 - Unfreeze account successfully' });
    
    // Setup user with bank account
    await setupUserWithBankAccount(page, pageObjects.pageAuth, pageObjects.pageDashboard, pageObjects.pageSignUp, user);
    
    // Wait for page to load and account to be visible
    await page.waitForLoadState('networkidle');
    
    // First freeze the account
    await pageObjects.modalFreezeAccount.freezeAccount();
    await expect(pageObjects.modalFreezeAccount.freezeSuccessMessage).toBeVisible();
    
    // Wait for UI state to update properly
    await page.waitForLoadState('networkidle');
    
    // Then test unfreeze
    await pageObjects.modalFreezeAccount.unfreezeAccount();
    await expect(pageObjects.modalFreezeAccount.unfreezeSuccessMessage).toBeVisible();
    
    Logger.info('Account unfrozen successfully');
});
