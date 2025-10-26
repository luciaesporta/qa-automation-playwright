import { test, expect } from '../fixtures/PageFixtures';
import { PageAuth } from '../pages/pageAuth';
import { PageDashboard } from '../pages/pageDashboard';
import { ModalFreezeAccount } from '../pages/modalFreezeAccount';
import { ModalCreateBankAccount } from '../pages/modalCreateBankAccount';
import { PageSignUp } from '../pages/pageSignUp';
import { Logger } from '../utils/Logger';

test.beforeEach(async ({ pageAuth }) => {
    Logger.step('Navigate to login page', { action: 'visitLoginPage' });
    await pageAuth.visitLoginPage();
});

test('TC1 - Freeze account successfully', async ({ pageAuth, pageDashboard, page }) => {
    const modalFreezeAccount = new ModalFreezeAccount(page);
    const modalCreateBankAccount = new ModalCreateBankAccount(page);
    const pageSignUp = new PageSignUp(page);
    
    const timestamp = Date.now();
    const freezeUser = {
        firstName: "Freeze",
        lastName: "Test",
        email: `freeze${timestamp}@test.com`,
        password: "12345678"
    };
    
    Logger.step('Create user for freeze test', { testName: 'TC1 - Freeze account successfully' });
    await page.goto('/signup');
    await pageSignUp.signUpUser(freezeUser.firstName, freezeUser.lastName, freezeUser.email, freezeUser.password);
    await pageAuth.loginSuccessfully(freezeUser.email, freezeUser.password);
    await pageDashboard.visitDashboardPage();
    await pageDashboard.createBankAccount('Débito', '1000')
    await modalFreezeAccount.freezeAccount();

});

test('TC2 - Unfreeze account successfully', async ({ pageAuth, pageDashboard, page }) => {
    const modalFreezeAccount = new ModalFreezeAccount(page);
    const modalCreateBankAccount = new ModalCreateBankAccount(page);
    const pageSignUp = new PageSignUp(page);
    const timestamp = Date.now();
    const unfreezeUser = {
        firstName: "Unfreeze",
        lastName: "Test",
        email: `unfreeze${timestamp}@test.com`,
        password: "12345678"
    };
    
    Logger.step('Create user for unfreeze test', { testName: 'TC2 - Unfreeze account successfully' });
    
    await page.goto('/signup');
    await pageSignUp.signUpUser(unfreezeUser.firstName, unfreezeUser.lastName, unfreezeUser.email, unfreezeUser.password);
    await pageAuth.loginSuccessfully(unfreezeUser.email, unfreezeUser.password);
    await pageDashboard.visitDashboardPage();
    await pageDashboard.createBankAccount("Débito", "1000");
    await modalFreezeAccount.freezeAccount();
    await modalFreezeAccount.unfreezeAccount();
});
