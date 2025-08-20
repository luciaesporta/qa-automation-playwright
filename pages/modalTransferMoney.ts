import {Page, Locator, expect} from '@playwright/test';

export class ModalTransferMoney {
    readonly page: Page;
    readonly recipientEmailInput: Locator;
    readonly fromAccountCombobox : Locator;
    readonly amountInput : Locator;
    readonly sendButton: Locator;
    readonly cancelButton: Locator;
    readonly typeOfAccountOption: Locator;
    readonly transferSuccessMessage: Locator
   


    constructor(page: Page){
        this.page = page; 
        this.recipientEmailInput = this.page.getByRole('textbox', { name: 'Email del destinatario *' });
        this.fromAccountCombobox = this.page.getByRole('combobox', { name: 'Cuenta origen *' });
        this.amountInput = this.page.getByRole('spinbutton', { name: 'Monto a enviar *' });
        this.sendButton = this.page.getByRole('button', { name: 'Enviar' });
        this.cancelButton = this.page.getByRole('button', { name: 'Cancelar' });
        this.typeOfAccountOption = this.page.getByRole('option', { name: '••••' });
        this.transferSuccessMessage = this.page. getByText('Transferencia enviada a ');
       
    }


    async completeAndSendMoneyTransfer(recipientEmail: string, amount: string) {
        await this.recipientEmailInput.fill(recipientEmail);
        await this.fromAccountCombobox.click();
        await this.typeOfAccountOption.click();
        await this.amountInput.fill(amount);
        await this.sendButton.click();
        await expect(this.transferSuccessMessage).toContainText(`Transferencia enviada a ${recipientEmail}`);


    }
}

