import { Page, Locator, expect } from '@playwright/test';

export class ModalFreezeAccount {
    readonly page: Page;
    readonly freezeAccountButton: Locator;
    readonly unfreezeAccountButton: Locator;
    readonly freezeSuccessMessage: Locator;
    readonly modalFreezeAccountFreezeButton: Locator;
    readonly modalUnfreezeAccountUnfreezeButton: Locator;
    readonly unfreezeSuccessMessage: Locator;


constructor(page: Page) {
    this.page = page;
    this.freezeAccountButton = page.getByTestId('boton-congelar-cuenta').first();
    this.modalFreezeAccountFreezeButton = page.getByRole('button', { name: 'Congelar' })
    this.unfreezeAccountButton = page.getByRole('button', { name: 'Descongelar' }).first();
    this.freezeSuccessMessage = page.getByText('Cuenta congelada ❄️')
    this.modalUnfreezeAccountUnfreezeButton = page.getByRole('button', { name: 'Descongelar' })
    this.unfreezeSuccessMessage = page.getByText('Cuenta descongelada')
}

async freezeAccount() {
    await this.freezeAccountButton.click();
    await this.modalFreezeAccountFreezeButton.click();
    await expect(this.freezeSuccessMessage).toBeVisible();
}

async unfreezeAccount() {
    await this.unfreezeAccountButton.click();
    await this.modalUnfreezeAccountUnfreezeButton.click();
    await expect(this.unfreezeSuccessMessage).toBeVisible();
}
}