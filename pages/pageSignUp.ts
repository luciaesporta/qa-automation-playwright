import {Page, Locator} from '@playwright/test';
import { Routes } from '../support/routes';

export class PageSignUp{
    readonly page: Page;
    readonly nameInput: Locator;
    readonly lastNameInput: Locator;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly buttonSignUp: Locator;
    readonly buttonLogIn: Locator;
    readonly messageCreationAccount: string;
    readonly messageEmailAlreadyUsed: string;

    constructor(page: Page){
        this.page = page;
        this.nameInput = page.getByRole ('textbox', {name: 'Nombre'});
        this.lastNameInput = page.locator('[name="lastName"]');
        this.emailInput = page.getByRole('textbox', { name: 'Correo electrónico' });
        this.passwordInput = page.getByRole('textbox', { name: 'Contraseña' });
        this.buttonSignUp = page.getByTestId('boton-registrarse'); 
        this.messageCreationAccount = 'Registro exitoso!';
        this.messageEmailAlreadyUsed = 'Email already in use';
    }
   
    async visitSignUpPage() {
        await this.page.goto(Routes.signup);
    }

    async completeSignUpForm(name: string, lastName: string, email: string, password: string){
        await this.nameInput.fill(name);
        await this.lastNameInput.fill(lastName);
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
    }

    async clickSignUpButton(){
    await this.buttonSignUp.click();
}

    async signUpUser(name: string, lastName: string, email: string, password: string){
    await this.completeSignUpForm(name, lastName, email, password);
    await this.clickSignUpButton();
}


}

