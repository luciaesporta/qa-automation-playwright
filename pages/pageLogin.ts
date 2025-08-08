import {Page, Locator, expect} from '@playwright/test';
import { PageDashboard } from './pageDashboard';

export class PageLogin{
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
        await this.page.goto('http://localhost:3000/login');
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
        await this.page.waitForURL('http://localhost:3000/dashboard');
        await expect(this.page).toHaveURL('http://localhost:3000/dashboard');

        const pageDashboard = new PageDashboard(this.page);
        await expect(pageDashboard.dashboardTitle).toBeVisible();
    }

    async loginFailsIntroducingWrongPassword(email: string, password: string){
        await this.completeLoginForm(email,password);
        await this.clickLoginButton();
        await expect (this.page.getByText(this.messageLoginFails)).toBeVisible();
}

    async submitEmptyLoginFormShouldFail(){
        await this.clickLoginButton();
        await expect(this.page).toHaveURL('http://localhost:3000/login');
    }

    async navigationFailsWhenUserIsLoggedout(email: string, password: string) {

        await this.loginAndRedirectionToDashboardPage(email, password);
        const pageDashboard = new PageDashboard(this.page);
        await pageDashboard.logout();
        await this.page.goto('http://localhost:3000/dashboard');
        await expect(this.page).toHaveURL('http://localhost:3000/login');
}

}
