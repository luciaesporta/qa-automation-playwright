import {Page, Locator, expect} from '@playwright/test';

export class ModalCreateBankAccount {
    readonly page: Page;
    readonly typeOfAccountCombobox: Locator;
    readonly optionCredit: Locator;
    readonly optionDebit: Locator;
    readonly inicialAmount:Locator;
    readonly buttonCreateAccount: Locator;
    readonly successMessage: Locator;
    readonly buttonDeleteAccount: Locator;
    readonly modalDeleteAcountCombobox: Locator;
    readonly modalDeleteAcountOption: Locator;
    readonly modalDeleteAccountButton: Locator;
    readonly modalDeleteAccountSuccessMessage: Locator;

    constructor(page: Page){
        this.page = page;
        this.typeOfAccountCombobox = this.page.getByRole('combobox', { name: 'Tipo de cuenta *' });
        this.optionCredit = this.page.getByRole('option', { name: 'Crédito' });
        this.optionDebit = this.page.getByRole('option', { name: 'Débito' })
        this.inicialAmount = this.page.getByRole('spinbutton', { name: 'Monto inicial *' });
        this.buttonCreateAccount = this.page.getByTestId('boton-crear-cuenta');
        this.successMessage = page.getByText('Cuenta creada exitosamente', { exact: false });
        this.buttonDeleteAccount = this.page.getByTestId('boton-eliminar-cuenta')
        this.modalDeleteAcountCombobox = this.page.getByRole('combobox', { name: 'Selecciona cuenta' })
        this.modalDeleteAcountOption = this.page.getByRole('option', { name: 'Nueva Cuenta' })
        this.modalDeleteAccountButton = this.page.getByRole('button', { name: 'Eliminar' })
        this.modalDeleteAccountSuccessMessage = this.page.getByText('Cuenta eliminada exitosamente')
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

async deleteBankAccount() {
    await this.buttonDeleteAccount.click();
    await this.modalDeleteAcountCombobox.click();
    await this.modalDeleteAcountOption.click();
    await this.modalDeleteAccountButton.click();
    await expect(this.modalDeleteAccountSuccessMessage).toBeVisible();
   }
}