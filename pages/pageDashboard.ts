import {Page, Locator, expect} from '@playwright/test';
import { Routes } from '../support/routes';

export class PageDashboard {
    readonly page: Page;
    readonly buttonAddAccount: Locator;
    readonly dashboardTitle: Locator;
    readonly buttonLogOut: Locator;

    constructor(page: Page){
        this.page = page;
        this.buttonAddAccount = this.page.getByTestId('tarjeta-agregar-cuenta');
        this.dashboardTitle = this.page.getByTestId('titulo-dashboard');
        this.buttonLogOut = page.getByTestId('boton-logout');
    }

    async visitDashboardPage(){
        await this.page.goto(Routes.dashboard);
        await this.page.waitForLoadState('domcontentloaded');
    }

    async logout() {
    await this.buttonLogOut.click();
    await this.page.waitForURL('http://localhost:3000/login');
    await expect(this.page).toHaveURL('http://localhost:3000/login');
  }
   }