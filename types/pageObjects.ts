import { Page, Locator } from '@playwright/test';

/**
 * Base interface for all Page Objects
 */
export interface BasePageInterface {
  readonly page: Page;
}

/**
 * Interface for authentication page operations
 */
export interface AuthPageInterface extends BasePageInterface {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly buttonLogIn: Locator;
  readonly linkSignUp: Locator;
  readonly buttonCreateAccount: Locator;
  
  visitLoginPage(): Promise<void>;
  completeLoginForm(email: string, password: string): Promise<void>;
  clickLoginButton(): Promise<void>;
  loginSuccessfully(email: string, password: string): Promise<void>;
  loginWithInvalidCredentials(email: string, password: string): Promise<void>;
}

/**
 * Interface for dashboard page operations
 */
export interface DashboardPageInterface extends BasePageInterface {
  readonly buttonAddAccount: Locator;
  readonly dashboardTitle: Locator;
  readonly buttonLogOut: Locator;
  readonly buttonSendMoney: Locator;
  readonly receivedTransferEmailRow: Locator;
  readonly elementsTransferList: Locator;
  readonly elementsTransactionsAmounts: Locator;
  
  visitDashboardPage(): Promise<void>;
  logout(): Promise<void>;
  createBankAccount(accountType: string, balance: string): Promise<boolean>;
  transferMoneyViaAPI(request: any, jwt: string, recipientEmail: string, amount: number): Promise<any>;
  refreshDashboardAndWait(): Promise<void>;
  verifyTransferOnDashboard(senderEmail: string, amount: number): Promise<void>;
  expectTransferVisible(senderEmail: string, amount: number): Promise<void>;
  generateRandomAmount(minAmount?: number, maxAmount?: number): number;
}

/**
 * Interface for signup page operations
 */
export interface SignupPageInterface extends BasePageInterface {
  readonly nameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly buttonSignUp: Locator;
  readonly messageCreationAccount: string;
  readonly messageSignupFails: string;
  
  visitSignUpPage(): Promise<void>;
  completeSignUpForm(firstName: string, lastName: string, email: string, password: string): Promise<void>;
  clickSignUpButton(): Promise<void>;
  signUpUser(firstName: string, lastName: string, email: string, password: string): Promise<void>;
  signUpUserViaAPI(request: any, firstName: string, lastName: string, email: string, password: string): Promise<any>;
  validateSignupAPIResponse(response: any): void;
  signUpUserViaUIWithAPIVerification(request: any, firstName: string, lastName: string, email: string, password: string): Promise<void>;
  testSignupWith409Error(request: any, firstName: string, lastName: string, email: string, password: string): Promise<void>;
  generateUniqueEmail(baseEmail: string): string;
}

/**
 * Interface for modal operations
 */
export interface ModalInterface extends BasePageInterface {
  // Common modal operations can be defined here
  close(): Promise<void>;
  isVisible(): Promise<boolean>;
}

/**
 * Interface for bank account creation modal
 */
export interface BankAccountModalInterface extends ModalInterface {
  readonly accountTypeCombobox: Locator;
  readonly balanceInput: Locator;
  readonly buttonCreate: Locator;
  readonly buttonCancel: Locator;
  readonly messageAccountCreated: Locator;
  
  createAccount(accountType: string, balance: string): Promise<void>;
  cancelAccountCreation(): Promise<void>;
}

/**
 * Interface for money transfer modal
 */
export interface TransferModalInterface extends ModalInterface {
  readonly recipientEmailInput: Locator;
  readonly fromAccountCombobox: Locator;
  readonly amountInput: Locator;
  readonly buttonSend: Locator;
  readonly buttonCancel: Locator;
  readonly messageTransferSent: Locator;
  
  sendMoney(recipientEmail: string, amount: string): Promise<void>;
  cancelTransfer(): Promise<void>;
}
