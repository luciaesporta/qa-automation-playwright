import {Page, Locator, APIRequestContext, expect} from '@playwright/test';
import { Routes, ApiRoutes } from '../support/routes';

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
    readonly apiEndpoint: string;

    constructor(page: Page){
        this.page = page;
        this.nameInput = page.getByRole ('textbox', {name: 'Nombre'});
        this.lastNameInput = page.locator('[name="lastName"]');
        this.emailInput = page.getByRole('textbox', { name: 'Correo electrónico' });
        this.passwordInput = page.getByRole('textbox', { name: 'Contraseña' });
        this.buttonSignUp = page.getByTestId('boton-registrarse'); 
        this.messageCreationAccount = 'Registro exitoso!';
        this.messageEmailAlreadyUsed = 'Email already in use';
        this.apiEndpoint = `http://localhost:6007${ApiRoutes.signup}`;
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
        
        await this.page.waitForTimeout(1000);
    }

    static generateUniqueEmail(baseEmail: string): string {
        const [user, domain] = baseEmail.split('@');
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        return `${user}${timestamp}${random}@${domain}`;
    }

    async signUpUserViaAPI(request: APIRequestContext, userData: {firstName: string, lastName: string, email: string, password: string}) {
        const uniqueEmail = PageSignUp.generateUniqueEmail(userData.email);
        
        const response = await request.post(this.apiEndpoint, {
            headers: { 'Content-Type': 'application/json' },
            data: {
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: uniqueEmail,
                password: userData.password,
            },
        });

        console.log(`API Response Status: ${response.status()} for email: ${uniqueEmail}`);
        
        return { response, uniqueEmail };
    }

    async validateSignupAPIResponse(response: any, userData: {firstName: string, lastName: string}, email: string) {
        if (response.status() !== 201) {
            const errorBody = await response.text();
            console.log(`Expected status 201, but got ${response.status()}. Response body: ${errorBody}`);
            console.log(`Email used: ${email}`);
        }
        
        expect(response.status()).toBe(201);
        
        const responseBody = await response.json();
        
        expect(responseBody).toHaveProperty('token');
        expect(typeof responseBody.token).toBe('string');
        expect(responseBody).toHaveProperty('user');
        
        expect(responseBody.user).toEqual(
            expect.objectContaining({
                id: expect.any(String),
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: email,
            })
        );
    }

    async signUpUserViaUIWithAPIVerification(userData: {firstName: string, lastName: string, email: string, password: string}) {
        const uniqueEmail = PageSignUp.generateUniqueEmail(userData.email);
        const apiResponsePromise = this.page.waitForResponse(`**${ApiRoutes.signup}`);
        await this.signUpUser(userData.firstName, userData.lastName, uniqueEmail, userData.password);
        const response = await apiResponsePromise;
        await this.validateSignupAPIResponse(response, userData, uniqueEmail);
        await expect(this.page.getByText(this.messageCreationAccount)).toBeVisible();
        
        return { response, uniqueEmail };
    }

    async testSignupWith409Error(userData: {firstName: string, lastName: string, email: string, password: string}) {
        const uniqueEmail = PageSignUp.generateUniqueEmail(userData.email);
        
        await this.page.route(`**${ApiRoutes.signup}`, route => {
            route.fulfill({
                status: 409,
                contentType: 'application/json',
                body: JSON.stringify({ message: 'Email already in use' })
            });
        });

        await this.signUpUser(userData.firstName, userData.lastName, uniqueEmail, userData.password);
        
        return { uniqueEmail };
    }
}

