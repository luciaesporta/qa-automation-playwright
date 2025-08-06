import {Page, Locator, expect} from '@playwright/test';

export class PageDashboard {
    readonly page: Page;
    readonly buttonAddAccount: Locator;
    readonly dashboardTitle: Locator;


    constructor(page: Page){
        this.page = page;
        this.buttonAddAccount = this.page.getByTestId('tarjeta-agregar-cuenta');
        this.dashboardTitle = this.page.getByTestId('titulo-dashboard');
    }

    async visitDashboardPage(){
        await this.page.goto('http://localhost:3000/dashboard');
        await this.page.waitForLoadState('domcontentloaded');
    }

   }