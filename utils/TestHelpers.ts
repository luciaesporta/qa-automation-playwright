import { Page, Locator, APIRequestContext, expect } from '@playwright/test';
import { ConfigHelpers } from '../config/environment';
import { Logger } from './Logger';

/**
 * Utility class for common test operations with robust error handling
 * Provides retry logic, timeout management, and error recovery
 */
export class TestHelpers {
  /**
   * Wait for network to be idle with configurable timeout
   */
  static async waitForNetworkIdle(
    page: Page, 
    timeout?: number,
    context?: Record<string, any>
  ): Promise<void> {
    const timeoutMs = timeout || ConfigHelpers.getTimeout('networkIdle');
    Logger.debug('Waiting for network idle', { timeout: timeoutMs, ...context });
    
    try {
      await page.waitForLoadState('networkidle', { timeout: timeoutMs });
      Logger.debug('Network idle achieved', { timeout: timeoutMs, ...context });
    } catch (error) {
      Logger.warn('Network idle timeout exceeded', { 
        timeout: timeoutMs, 
        error: (error as Error).message,
        ...context 
      });
      throw error;
    }
  }

  /**
   * Wait for page to load completely with all resources
   */
  static async waitForPageLoad(
    page: Page, 
    timeout?: number,
    context?: Record<string, any>
  ): Promise<void> {
    const timeoutMs = timeout || ConfigHelpers.getTimeout('pageLoad');
    Logger.debug('Waiting for page load', { timeout: timeoutMs, ...context });
    
    try {
      await page.waitForLoadState('domcontentloaded', { timeout: timeoutMs });
      await page.waitForLoadState('networkidle', { timeout: timeoutMs });
      Logger.debug('Page loaded successfully', { timeout: timeoutMs, ...context });
    } catch (error) {
      Logger.warn('Page load timeout exceeded', { 
        timeout: timeoutMs, 
        error: (error as Error).message,
        ...context 
      });
      throw error;
    }
  }

  /**
   * Wait for element to be visible with retry logic
   */
  static async waitForElementVisible(
    selector: Locator,
    timeout?: number,
    context?: Record<string, any>
  ): Promise<void> {
    const timeoutMs = timeout || ConfigHelpers.getTimeout('elementVisible');
    const maxRetries = ConfigHelpers.getRetries('element');
    
    Logger.debug('Waiting for element to be visible', { 
      timeout: timeoutMs, 
      maxRetries,
      ...context 
    });

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await selector.waitFor({ state: 'visible', timeout: timeoutMs });
        Logger.debug('Element became visible', { attempt, ...context });
        return;
      } catch (error) {
        Logger.warn(`Element visibility attempt ${attempt}/${maxRetries} failed`, { 
          error: (error as Error).message,
          timeout: timeoutMs,
          ...context 
        });
        
        if (attempt === maxRetries) {
          Logger.error('Element never became visible after all retries', error as Error, context);
          throw error;
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  /**
   * Retry operation with configurable retry count and backoff
   */
  static async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries?: number,
    backoffMs?: number,
    context?: Record<string, any>
  ): Promise<T> {
    const retries = maxRetries || ConfigHelpers.getRetries('element');
    const backoff = backoffMs || 1000;
    let lastError: Error | null = null;
    
    Logger.debug(`Starting retry operation`, { maxRetries: retries, backoffMs: backoff, ...context });
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        Logger.debug(`Retry attempt ${attempt}/${retries}`, context);
        const result = await operation();
        Logger.debug(`Operation succeeded on attempt ${attempt}`, context);
        return result;
      } catch (error) {
        lastError = error as Error;
        Logger.warn(`Retry attempt ${attempt}/${retries} failed`, { 
          error: lastError.message,
          attempt,
          ...context 
        });
        
        if (attempt < retries) {
          const waitTime = backoff * Math.pow(2, attempt - 1); // Exponential backoff
          Logger.debug(`Waiting ${waitTime}ms before next attempt`, context);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    Logger.error(`All ${retries} retry attempts failed`, lastError!, context);
    throw lastError!;
  }

  /**
   * Wait for API response with retry logic
   */
  static async waitForApiResponse<T>(
    apiCall: () => Promise<T>,
    maxRetries?: number,
    context?: Record<string, any>
  ): Promise<T> {
    const retries = maxRetries || ConfigHelpers.getRetries('api');
    
    Logger.debug('Starting API call with retry logic', { maxRetries: retries, ...context });
    
    return this.retryOperation(
      apiCall,
      retries,
      2000, // 2 second base backoff for API calls
      { ...context, operationType: 'api' }
    );
  }

  /**
   * Safe element interaction with retry
   */
  static async safeElementAction(
    action: () => Promise<void>,
    selector: Locator,
    actionName: string,
    context?: Record<string, any>
  ): Promise<void> {
    Logger.debug(`Starting safe element action: ${actionName}`, context);
    
    await this.retryOperation(
      async () => {
        await this.waitForElementVisible(selector, undefined, { action: actionName });
        await action();
      },
      ConfigHelpers.getRetries('element'),
      500,
      { ...context, actionName, selector: selector.toString() }
    );
    
    Logger.debug(`Safe element action completed: ${actionName}`, context);
  }

  /**
   * Fill input with validation and retry
   */
  static async safeFillInput(
    selector: Locator,
    value: string,
    context?: Record<string, any>
  ): Promise<void> {
    await this.safeElementAction(
      async () => {
        await selector.clear();
        await selector.fill(value);
        
        // Verify the value was set correctly
        const actualValue = await selector.inputValue();
        if (actualValue !== value) {
          throw new Error(`Input value mismatch. Expected: "${value}", Actual: "${actualValue}"`);
        }
        
        Logger.debug('Input filled successfully', { 
          expectedValue: value.substring(0, 10) + '...',
          ...context 
        });
      },
      selector,
      'fillInput',
      { ...context, value: value.substring(0, 10) + '...' }
    );
  }

  /**
   * Click element with retry and validation
   */
  static async safeClick(
    selector: Locator,
    context?: Record<string, any>
  ): Promise<void> {
    await this.safeElementAction(
      async () => {
        await selector.click();
        Logger.debug('Element clicked successfully', context);
      },
      selector,
      'click',
      context
    );
  }

  /**
   * Wait for navigation with timeout
   */
  static async waitForNavigation(
    page: Page,
    urlPattern: string | RegExp,
    timeout?: number,
    context?: Record<string, any>
  ): Promise<void> {
    const timeoutMs = timeout || ConfigHelpers.getTimeout('default');
    
    Logger.debug('Waiting for navigation', { 
      pattern: urlPattern.toString(), 
      timeout: timeoutMs,
      ...context 
    });
    
    try {
      await page.waitForURL(urlPattern, { timeout: timeoutMs });
      Logger.debug('Navigation completed', { 
        currentUrl: page.url(),
        ...context 
      });
    } catch (error) {
      Logger.error('Navigation timeout', error as Error, { 
        expectedPattern: urlPattern.toString(),
        currentUrl: page.url(),
        timeout: timeoutMs,
        ...context 
      });
      throw error;
    }
  }

  /**
   * Take screenshot with automatic naming
   */
  static async takeScreenshot(
    page: Page,
    name: string,
    context?: Record<string, any>
  ): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `screenshots/${name}_${timestamp}.png`;
    
    Logger.debug('Taking screenshot', { filename, ...context });
    
    try {
      await page.screenshot({ 
        path: filename, 
        fullPage: true 
      });
      Logger.debug('Screenshot saved', { filename, ...context });
    } catch (error) {
      Logger.error('Failed to take screenshot', error as Error, { filename, ...context });
      throw error;
    }
  }

  /**
   * Handle API errors with detailed logging
   */
  static async handleApiError(
    error: any,
    endpoint: string,
    method: string,
    context?: Record<string, any>
  ): Promise<never> {
    const errorMessage = `API ${method} ${endpoint} failed`;
    const errorDetails = {
      endpoint,
      method,
      status: error.status,
      statusText: error.statusText,
      message: error.message,
      ...context
    };
    
    Logger.error(errorMessage, error, errorDetails);
    throw new Error(`${errorMessage}: ${error.message}`);
  }

  /**
   * Check if element exists without throwing
   */
  static async elementExists(selector: Locator, timeout?: number): Promise<boolean> {
    const timeoutMs = timeout || 5000;
    
    try {
      await selector.waitFor({ state: 'attached', timeout: timeoutMs });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for multiple elements to be visible
   */
  static async waitForMultipleElements(
    selectors: Locator[],
    timeout?: number,
    context?: Record<string, any>
  ): Promise<void> {
    const timeoutMs = timeout || ConfigHelpers.getTimeout('elementVisible');
    
    Logger.debug(`Waiting for ${selectors.length} elements to be visible`, { 
      timeout: timeoutMs,
      ...context 
    });
    
    const promises = selectors.map((selector, index) => 
      this.waitForElementVisible(selector, timeoutMs, { 
        ...context, 
        elementIndex: index 
      })
    );
    
    await Promise.all(promises);
    Logger.debug('All elements are now visible', context);
  }
}
