// Test configuration constants
export const TEST_CONSTANTS = {
    ACCOUNT_TYPE: 'Débito',
    INITIAL_AMOUNT: '1000',
    PASSWORD: '12345678',
    FIRST_NAME: 'Test',
    LAST_NAME: 'User',
    BASE_EMAIL_DOMAIN: '@test.com'
} as const;

// Application routes
export const ROUTES = {
    SIGNUP: '/signup',
    LOGIN: '/login',
    DASHBOARD: '/dashboard'
} as const;

// Test data generators
export function createTestUser(testType: string) {
    const timestamp = Date.now();
    return {
        firstName: TEST_CONSTANTS.FIRST_NAME,
        lastName: TEST_CONSTANTS.LAST_NAME,
        email: `${testType}${timestamp}${TEST_CONSTANTS.BASE_EMAIL_DOMAIN}`,
        password: TEST_CONSTANTS.PASSWORD
    };
}
