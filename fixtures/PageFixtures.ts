import { test as base } from '@playwright/test';
import { PageAuth } from '../pages/pageAuth';
import { PageDashboard } from '../pages/pageDashboard';
import { PageSignUp } from '../pages/pageSignUp';
import { ModalCreateBankAccount } from '../pages/modalCreateBankAccount';
import { ModalTransferMoney } from '../pages/modalTransferMoney';
import { ApiUtils } from '../utils/apiUtils';
import { Logger } from '../utils/Logger';

/**
 * Extended page object fixtures for Playwright tests
 * Eliminates the need for global variables and provides consistent initialization
 */

export type PageFixtures = {
  pageAuth: PageAuth;
  pageDashboard: PageDashboard;
  pageSignUp: PageSignUp;
  modalCreateBankAccount: ModalCreateBankAccount;
  modalTransferMoney: ModalTransferMoney;
  apiUtils: ApiUtils;
};

export const test = base.extend<PageFixtures>({
  /**
   * PageAuth fixture - handles authentication operations
   */
  pageAuth: async ({ page }, use) => {
    const pageAuth = new PageAuth(page);
    Logger.debug('PageAuth fixture initialized', { page: page.url() });
    await use(pageAuth);
    Logger.debug('PageAuth fixture cleanup');
  },

  /**
   * PageDashboard fixture - handles dashboard operations
   */
  pageDashboard: async ({ page }, use) => {
    const pageDashboard = new PageDashboard(page);
    Logger.debug('PageDashboard fixture initialized', { page: page.url() });
    await use(pageDashboard);
    Logger.debug('PageDashboard fixture cleanup');
  },

  /**
   * PageSignUp fixture - handles signup operations
   */
  pageSignUp: async ({ page }, use) => {
    const pageSignUp = new PageSignUp(page);
    Logger.debug('PageSignUp fixture initialized', { page: page.url() });
    await use(pageSignUp);
    Logger.debug('PageSignUp fixture cleanup');
  },

  /**
   * ModalCreateBankAccount fixture - handles bank account creation
   */
  modalCreateBankAccount: async ({ page }, use) => {
    const modalCreateBankAccount = new ModalCreateBankAccount(page);
    Logger.debug('ModalCreateBankAccount fixture initialized', { page: page.url() });
    await use(modalCreateBankAccount);
    Logger.debug('ModalCreateBankAccount fixture cleanup');
  },

  /**
   * ModalTransferMoney fixture - handles money transfer operations
   */
  modalTransferMoney: async ({ page }, use) => {
    const modalTransferMoney = new ModalTransferMoney(page);
    Logger.debug('ModalTransferMoney fixture initialized', { page: page.url() });
    await use(modalTransferMoney);
    Logger.debug('ModalTransferMoney fixture cleanup');
  },

  /**
   * ApiUtils fixture - handles API operations
   */
  apiUtils: async ({ request }, use) => {
    const apiUtils = new ApiUtils(request);
    Logger.debug('ApiUtils fixture initialized');
    await use(apiUtils);
    Logger.debug('ApiUtils fixture cleanup');
  },
});

export { expect } from '@playwright/test';
