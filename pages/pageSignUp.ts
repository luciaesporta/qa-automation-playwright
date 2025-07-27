import {Page, Locator} from '@playwright/test';

export class PageSignUp{
    readonly page: Page;
    readonly nameInput: Locator

    constructor(page: Page){
        this.page = page;
        this.nameInput = page.getByRole ('textbox', {name: 'Nombre'});
    }
}

