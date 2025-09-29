import {Page, Locator, expect} from '@playwright/test';
import { PageDashboard } from './pageDashboard';
import { Routes } from '../support/routes';
import { Logger } from '../utils/Logger';
import { TestHelpers } from '../utils/TestHelpers';

export class PageAuth{
    readonly page: Page;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly buttonLogIn: Locator;
    readonly linkSignUp: Locator;
    readonly buttonCreateAccount: Locator;
    readonly messageLoginSuccessfull: string;
    readonly messageLoginFails: string;
 


    constructor(page: Page){
        this.page = page;
        this.emailInput = page.getByRole('textbox', { name: 'Correo electrónico' });
        this.passwordInput = page.getByRole('textbox', { name: 'Contraseña' });
        this.buttonLogIn = page.getByTestId('boton-login');
        this.linkSignUp = page.getByTestId('link-registrarse-login');
        this.buttonCreateAccount = page.getByTestId('boton-signup-header');
        this.messageLoginSuccessfull = "Inicio de sesión exitoso";
        this.messageLoginFails = "Invalid credentials";
    }

    async visitLoginPage(){
        Logger.step('Navigate to login page', { url: Routes.login });
        await TestHelpers.waitForPageLoad(this.page);
        await this.page.goto(Routes.login);
        await TestHelpers.waitForPageLoad(this.page);
    }
   
     async completeLoginForm(email: string, password: string){
        Logger.step('Complete login form', { email: email.substring(0, 10) + '...' });
        await TestHelpers.safeFillInput(this.emailInput, email, { field: 'email' });
        await TestHelpers.safeFillInput(this.passwordInput, password, { field: 'password' });
    }
    
    async clickLoginButton(){
        Logger.step('Click login button');
        await TestHelpers.safeClick(this.buttonLogIn, { action: 'login' });
    }
    async loginSuccessfully(email: string, password: string){
        await this.completeLoginForm(email,password);
        await this.clickLoginButton();
        await expect (this.page.getByText(this.messageLoginSuccessfull)).toBeVisible();
    }

    async loginAndRedirectionToDashboardPage(email: string, password: string){
        await this.visitLoginPage(); 
        await this.completeLoginForm(email, password);
        await this.clickLoginButton();
        await expect(this.page.getByText(this.messageLoginSuccessfull)).toBeVisible();
        await this.page.waitForURL(Routes.dashboard);
        await expect(this.page).toHaveURL(Routes.dashboard);

        const pageDashboard = new PageDashboard(this.page);
        await expect(pageDashboard.dashboardTitle).toBeVisible();
    }

    async loginFailsIntroducingWrongPassword(email: string, password: string){
        await this.completeLoginForm(email,password);
        await this.clickLoginButton();
        await expect (this.page.getByText(this.messageLoginFails)).toBeVisible();
}

    async submitEmptyEmailLoginFormShouldFail(password: string){
        await this.passwordInput.fill(password);
        await this.clickLoginButton();
        const emailInput = this.emailInput;
        await expect(emailInput).toBeEmpty();
        await expect(emailInput).toHaveJSProperty('validationMessage', 'Please fill out this field.');
        await expect(this.page).toHaveURL(Routes.login);
}
//TC9
    async submitIncorrectEmailFormatLoginFormShouldFail(email: string, password: string){
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.clickLoginButton();
        const emailInput = this.emailInput;
        const message = await emailInput.evaluate((el) => (el as HTMLInputElement).validationMessage);
        expect(message).toContain("Please include an '@' in the email address");
}

    async navigationFailsWhenUserIsLoggedout(email: string, password: string) {

        await this.loginAndRedirectionToDashboardPage(email, password);
        const pageDashboard = new PageDashboard(this.page);
        await pageDashboard.logout();
        await this.page.goto(Routes.login);
        await expect(this.page).toHaveURL(Routes.login);
}

}
