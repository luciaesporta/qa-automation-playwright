import {Page, Locator, expect} from '@playwright/test';

export class ModalCreateBankAccount {
    readonly page: Page;
    readonly typeOfAccountCombobox: Locator;
    readonly optionCredit: Locator;
    readonly optionDebit: Locator;
    readonly inicialAmount:Locator;
    readonly buttonCreateAccount: Locator;
    readonly successMessage: Locator;


    constructor(page: Page){
        this.page = page;
        this.typeOfAccountCombobox = this.page.getByRole('combobox', { name: 'Tipo de cuenta *' });
        this.optionCredit = this.page.getByRole('option', { name: 'Crédito' });
        this.optionDebit = this.page.getByRole('option', { name: 'Débito' })
        this.inicialAmount = this.page.getByRole('spinbutton', { name: 'Monto inicial *' });
        this.buttonCreateAccount = this.page.getByTestId('boton-crear-cuenta');
        this.successMessage = page.getByText('Cuenta creada exitosamente', { exact: false });

    }

async selectAccountType(typeOfAccount: string){
    await this.typeOfAccountCombobox.click();
    try {
        await this.page.getByRole('option', { name: typeOfAccount}).click();
    } catch (error) {
        console.log('The option does not exist')
    }
}

async completeInitialAmount (amount: string) {
    await this.inicialAmount.fill(amount);
}

async createAccount(typeOfAccount: string, inicialAmount: string) {
    await this.selectAccountType(typeOfAccount);
    await this.completeInitialAmount(inicialAmount);
    await this.buttonCreateAccount.click();
    await expect (this.successMessage).toBeVisible();
}
   }