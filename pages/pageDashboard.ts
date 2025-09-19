import {Page, Locator, expect} from '@playwright/test';
import { Routes } from '../support/routes';

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
   }