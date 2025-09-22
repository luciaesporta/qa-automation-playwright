import {Page, Locator, expect} from '@playwright/test';
import { Routes } from '../support/routes';
import { ModalCreateBankAccount } from './modalCreateBankAccount';

export class PageDashboard {
    readonly page: Page;
    readonly buttonAddAccount: Locator;
    readonly dashboardTitle: Locator;
    readonly buttonLogOut: Locator;
    readonly buttonSendMoney: Locator;
    readonly receivedTransferEmailRow: Locator;
    readonly elementsTransferList: Locator;
    readonly elementsTransactionsAmounts: Locator;

    constructor(page: Page){
        this.page = page;
        this.buttonAddAccount = this.page.getByTestId('tarjeta-agregar-cuenta');
        this.dashboardTitle = this.page.getByTestId('titulo-dashboard');
        this.buttonLogOut = page.getByTestId('boton-logout');
        this.buttonSendMoney = this.page.getByTestId('boton-enviar');
        this.receivedTransferEmailRow = this.page.getByText('Transferencia de ', { exact: false });
        this.elementsTransferList = this.page.locator('[data-testid="descripcion-transaccion"]'); 
        this.elementsTransactionsAmounts = this.page.locator('[data-testid="monto-transaccion"]');
    }

    async visitDashboardPage(){
        await this.page.goto(Routes.dashboard);
        await this.page.waitForLoadState('domcontentloaded');
    }

    async logout() {
    await this.buttonLogOut.click();
    await this.page.waitForURL(Routes.login);
    await expect(this.page).toHaveURL(Routes.login);
  }

  async createBankAccount(accountType: string, balance: string): Promise<boolean> {
    try {
      await this.page.waitForLoadState('networkidle');
      const isButtonVisible = await this.buttonAddAccount.isVisible();
      
      if (!isButtonVisible) {
        console.log('Add account button is not visible - user may already have accounts');
        return false;
      }

      await this.buttonAddAccount.waitFor({ state: 'visible' });
      await this.page.waitForTimeout(1000);
      await this.buttonAddAccount.click();

      const modalCreateBankAccount = new ModalCreateBankAccount(this.page);
      await modalCreateBankAccount.createAccount(accountType, balance);
      
      return true;
    } catch (error) {
      console.log('Error creating bank account:', error);
      return false;
    }
  }

  async expectTransferVisible(senderEmail: string, amount: number) {
    await expect(this.receivedTransferEmailRow.first()).toBeVisible();
    await expect(this.elementsTransferList.first()).toContainText(senderEmail);
    await expect(this.elementsTransactionsAmounts.first()).toContainText(
      new RegExp(String(amount.toFixed(2)))
    );
  }
  
   }