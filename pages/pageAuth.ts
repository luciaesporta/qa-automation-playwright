import {Page, Locator, expect} from '@playwright/test';
import { PageDashboard } from './pageDashboard';
import { Routes } from '../support/routes';

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
        await this.page.goto(Routes.login);
        await this.page.waitForLoadState('domcontentloaded');
    }
   
     async completeLoginForm(email: string, password: string){
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
    }
    
    async clickLoginButton(){
        await this.buttonLogIn.click();
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
