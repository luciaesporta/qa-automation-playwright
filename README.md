# 🏦 Athena Bank Fintech - Playwright Automation Testing

A comprehensive end-to-end testing suite for the Athena Bank Fintech application using Playwright and TypeScript.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Running Tests](#running-tests)
- [CI/CD Pipeline](#cicd-pipeline)
- [Test Reports](#test-reports)
- [Test Data Management](#test-data-management)
- [Page Object Model](#page-object-model)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

This project provides automated testing for the Athena Bank Fintech application, covering critical user journeys including:

- **Authentication**: Login, Signup, and session management
- **Bank Account Management**: Creating and managing bank accounts
- **Money Transfers**: Sending and receiving money between users
- **API Testing**: Backend API validation and response verification

## ✨ Features

- 🚀 **Fast & Reliable**: Built with Playwright for cross-browser testing
- 📱 **Cross-Browser Support**: Chrome, Firefox, Safari, and Edge
- 🔧 **Page Object Model**: Maintainable and reusable test code
- 📊 **Comprehensive Reporting**: HTML reports with screenshots and videos
- 🔄 **CI/CD Integration**: Automated testing on GitHub Actions
- 📈 **GitHub Pages**: Automated test report deployment
- 🛠️ **API Testing**: Backend validation alongside UI tests
- 📝 **Data-Driven Testing**: JSON-based test data management

## 📁 Project Structure

```
playwright/
├── .github/workflows/          # CI/CD pipeline configuration
│   └── tests.yml              # GitHub Actions workflow
├── data/                       # Test data files
│   └── testData.json          # User credentials and test data
├── pages/                      # Page Object Model classes
│   ├── modalCreateBankAccount.ts
│   ├── modalTransferMoney.ts
│   ├── pageDashboard.ts
│   ├── pageLogin.ts
│   └── pageSignUp.ts
├── support/                    # Support utilities
│   └── routes.ts              # Application routes
├── tests/                      # Test specifications
│   ├── auth.spec.ts           # Authentication tests
│   ├── login.spec.ts          # Login-specific tests
│   ├── signup.setup.ts        # Test setup and user creation
│   ├── signup.spec.ts         # Signup tests
│   └── transactions.spec.ts   # Money transfer tests
├── utils/                      # Utility functions
│   └── backendUtils.ts        # API testing utilities
├── playwright.config.ts       # Playwright configuration
└── package.json               # Project dependencies
```

## 🔧 Prerequisites

Before running the tests, ensure you have:

- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- **Git** for version control
- **MongoDB** (for the backend application)

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/luciaesporta/qa-automation-playwright.git
cd qa-automation-playwright
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install Playwright Browsers

```bash
npx playwright install
```

### 4. Set Up the Application

The tests require the Athena Bank Fintech application to be running. Clone and set up the application:

```bash
# Clone the application repository
git clone https://github.com/Atenea-Conocimientos/redux-athena-bank.git app

# Navigate to backend
cd app/backend
npm install

# Create environment file
echo "MONGO_URI=mongodb://localhost:27017/athena-bank" > .env
echo "JWT_SECRET=your-jwt-secret" >> .env
echo "PORT=6007" >> .env
echo "VITE_API_URL=http://localhost:6007/api" >> .env

# Start the backend
npm run dev
```

In a new terminal:

```bash
# Navigate to frontend
cd app/frontend
npm install

# Start the frontend
npm run dev
```

### 5. Verify Setup

Ensure both applications are running:
- **Backend**: http://localhost:6007
- **Frontend**: http://localhost:3000

## 🧪 Running Tests

### Run All Tests

```bash
npx playwright test
```

### Run Specific Test Files

```bash
# Authentication tests
npx playwright test tests/auth.spec.ts

# Signup tests
npx playwright test tests/signup.spec.ts

# Transaction tests
npx playwright test tests/transactions.spec.ts
```

### Run Tests in Different Modes

```bash
# Run tests in headed mode (see browser)
npx playwright test --headed

# Run tests in debug mode
npx playwright test --debug

# Run tests with specific browser
npx playwright test --project=chromium
```

### Generate Test Reports

```bash
# Generate HTML report
npx playwright test --reporter=html

# View the report
npx playwright show-report
```

## 🔄 CI/CD Pipeline

The project includes a comprehensive GitHub Actions workflow (`.github/workflows/tests.yml`) that:

1. **Sets up the environment** with MongoDB service
2. **Clones and configures** the Athena Bank application
3. **Starts backend and frontend** services
4. **Runs the test suite** with Playwright
5. **Generates and deploys** test reports to GitHub Pages

### Workflow Features

- ✅ **Automated Setup**: Backend and frontend deployment
- ✅ **Database Integration**: MongoDB service for data persistence
- ✅ **Test Execution**: Full test suite with HTML reporting
- ✅ **Report Deployment**: Automatic deployment to GitHub Pages
- ✅ **Artifact Storage**: Test reports saved as GitHub artifacts

### Viewing CI/CD Results

After a successful workflow run, test reports are available at:
```
https://luciaesporta.github.io/qa-automation-playwright/report-{BUILD_NUMBER}/
```

## 📊 Test Reports

The project generates comprehensive test reports including:

- **HTML Reports**: Detailed test results with screenshots
- **Video Recordings**: Test execution videos for failed tests
- **Trace Files**: Step-by-step test execution traces
- **Screenshots**: Visual evidence of test execution

### Accessing Reports

1. **Local Reports**: After running tests, view with `npx playwright show-report`
2. **CI/CD Reports**: Available on GitHub Pages after workflow completion
3. **Artifacts**: Downloadable from GitHub Actions workflow runs

## 📝 Test Data Management

Test data is managed through JSON files for maintainability:

### `data/testData.json`

```json
{
  "validUser": {
    "firstName": "Lucía",
    "lastName": "Esporta",
    "email": "luciaalvarezesporta@gmail.com",
    "password": "12345678"
  },
  "senderMoney": {
    "firstName": "Money",
    "lastName": "Sender",
    "email": "luciaalvarezesporta+moneysender@gmail.com",
    "password": "12345678"
  },
  "receiverMoney": {
    "firstName": "Money",
    "lastName": "Receiver",
    "email": "luciaalvarezesporta+moneyreceiver@gmail.com",
    "password": "12345678"
  }
}
```

## 🏗️ Page Object Model

The project follows the Page Object Model pattern for maintainable test code:

### Page Classes

- **`PageLogin`**: Login page interactions and validations
- **`PageSignUp`**: User registration functionality
- **`PageDashboard`**: Main application dashboard
- **`ModalCreateBankAccount`**: Bank account creation modal
- **`ModalTransferMoney`**: Money transfer functionality

### Example Usage

```typescript
import { PageLogin } from '../pages/pageLogin';

test('User can login successfully', async ({ page }) => {
  const pageLogin = new PageLogin(page);
  await pageLogin.visitLoginPage();
  await pageLogin.loginAndRedirectionToDashboardPage(
    "user@example.com", 
    "password123"
  );
});
```

## 🧪 Test Coverage

### Authentication Tests (`auth.spec.ts`)
- ✅ Successful login with dashboard redirection
- ✅ Login failure with wrong password
- ✅ Login validation with empty email field
- ✅ Login validation with invalid email format
- ✅ Route protection for non-authenticated users

### Signup Tests (`signup.spec.ts`)
- ✅ Successful user registration
- ✅ Signup failure due to existing email
- ✅ Redirection to login after account creation
- ✅ API-based signup validation
- ✅ HTTP status code verification

### Transaction Tests (`transactions.spec.ts`)
- ✅ Bank account creation
- ✅ Money transfer between users
- ✅ Money reception verification
- ✅ API-based transaction validation

## 🔧 Configuration

### Playwright Configuration (`playwright.config.ts`)

```typescript
export default defineConfig({
  testDir: './tests',
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /.*\.setup\.ts/,
      dependencies: ['setup'],
    },
  ],
});
```

### Environment Variables

- **`BASE_URL`**: Application base URL (default: http://localhost:3000)
- **`MONGO_URI`**: MongoDB connection string
- **`JWT_SECRET`**: JWT token secret for authentication
- **`PORT`**: Backend server port (default: 6007)

## 🐛 Troubleshooting

### Common Issues

#### 1. Tests Fail with "Cannot navigate to invalid URL"
- **Solution**: Ensure the application is running on the correct port
- **Check**: Verify `BASE_URL` environment variable is set correctly

#### 2. MongoDB Connection Issues
- **Solution**: Ensure MongoDB is running and accessible
- **Check**: Verify `MONGO_URI` in backend `.env` file

#### 3. Authentication Failures
- **Solution**: Check test data credentials in `data/testData.json`
- **Check**: Verify JWT secret is configured correctly

#### 4. CI/CD Pipeline Failures
- **Solution**: Check GitHub Actions logs for specific errors
- **Check**: Verify repository secrets are configured correctly

### Debug Mode

Run tests in debug mode for step-by-step execution:

```bash
npx playwright test --debug
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing Page Object Model pattern
- Add comprehensive test coverage for new features
- Update test data in `data/testData.json` when needed
- Ensure all tests pass before submitting PRs

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Lucía Esporta** - *Initial work* - [luciaesporta](https://github.com/luciaesporta)

## 🙏 Acknowledgments

- Athena Bank Fintech team for providing the application
- Playwright team for the excellent testing framework
- GitHub Actions for CI/CD capabilities

---

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review existing [Issues](https://github.com/luciaesporta/qa-automation-playwright/issues)
3. Create a new issue with detailed information

---

**Happy Testing! 🎉**