import {Page, Locator, expect} from '@playwright/test';

export class ModalCreateBankAccount {
    readonly page: Page;
    readonly typeOfAccountCombobox: Locator;
    readonly optionCredit: Locator;
    readonly optionDebit: Locator;
    readonly inicialAmount:Locator;
    readonly buttonCreateAccount: Locator;


    constructor(page: Page){
        this.page = page;
        this.typeOfAccountCombobox = this.page.getByRole('combobox', { name: 'Tipo de cuenta *' });
        this.optionCredit = this.page.getByRole('option', { name: 'Crédito' });
        this.optionDebit = this.page.getByRole('option', { name: 'Débito' })
        this.inicialAmount = this.page.getByRole('spinbutton', { name: 'Monto inicial *' });
        this.buttonCreateAccount = this.page.getByTestId('boton-crear-cuenta');
    }

   }