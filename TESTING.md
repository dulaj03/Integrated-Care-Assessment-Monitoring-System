# I-CAMS Testing & CI/CD Pipeline Documentation

## Overview

This document describes the comprehensive testing and DevOps infrastructure for the I-CAMS (Integrated Clinical & Administrative Management System) application. The system consists of three main components:

- **Backend**: Express.js API with Node.js
- **Frontend**: React application with Vite
- **Admin Panel**: React application with Vite

---

## Table of Contents

1. [Testing Strategy](#testing-strategy)
2. [Backend Testing](#backend-testing)
3. [Frontend Testing](#frontend-testing)
4. [Admin Panel Testing](#admin-panel-testing)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Running Tests Locally](#running-tests-locally)
7. [Code Quality Standards](#code-quality-standards)
8. [Best Practices](#best-practices)

---

## Testing Strategy

### Test Pyramid

```
        E2E Tests (Optional)
       /                    \
      UI Tests               Integration Tests
     /        \            /          \
   Unit Tests for Components    API Integration Tests
  /              \           /              \
Backend Unit Tests  Auth Tests  Database Tests
```

### Test Coverage Goals

| Component | Target Coverage | Current Status |
|-----------|-----------------|-----------------|
| Backend   | 80%            | Configured      |
| Frontend  | 75%            | Configured      |
| Admin     | 75%            | Configured      |

---

## Backend Testing

### Stack
- **Framework**: Express.js
- **Test Runner**: Jest
- **API Testing**: Supertest
- **Database**: PostgreSQL
- **Linter**: ESLint

### Test Structure

```
backend/
├── tests/
│   ├── setup.js              # Test environment setup
│   ├── unit/
│   │   ├── auth.test.js      # JWT token tests
│   │   ├── bcrypt.test.js    # Password hashing tests
│   │   └── database.test.js  # DB connection & queries
│   └── integration/
│       └── api.test.js       # API endpoint tests
├── jest.config.js
└── .eslintrc.js
```

### Running Backend Tests

```bash
# Run all tests
cd backend
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run only unit tests
npm test -- tests/unit

# Run only integration tests
npm test -- tests/integration

# Lint backend code
npm run lint

# Fix linting issues
npm run lint:fix
```

### Test Examples

#### Unit Test: JWT Authentication
```javascript
it('should verify a valid JWT token', () => {
  const payload = { id: 1, email: 'test@example.com', role: 'patient' };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  expect(decoded).toHaveProperty('email', 'test@example.com');
});
```

#### Unit Test: Password Hashing
```javascript
it('should compare password with hash successfully', async () => {
  const password = 'SecurePassword123!';
  const hash = await bcrypt.hash(password, 10);
  const isMatch = await bcrypt.compare(password, hash);
  
  expect(isMatch).toBe(true);
});
```

---

## Frontend Testing

### Stack
- **Framework**: React with Vite
- **Test Runner**: Vitest
- **Testing Library**: @testing-library/react
- **Linter**: ESLint

### Test Structure

```
frontend/
├── src/
│   ├── tests/
│   │   ├── setup.ts         # Test environment setup
│   │   ├── utils.test.ts    # Utility function tests
│   │   └── components.test.ts # Component logic tests
│   ├── components/
│   ├── pages/
│   └── ...
├── vitest.config.ts
└── .eslintrc.js
```

### Running Frontend Tests

```bash
# Run all tests
cd frontend
npm test

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui

# Run tests in watch mode
npm test -- --watch

# Lint frontend code
npm run lint

# Fix linting issues
npm run lint:fix

# Build frontend
npm run build
```

### Test Examples

#### Utility Test: Email Validation
```javascript
it('should validate email format', () => {
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  expect(isValidEmail('test@example.com')).toBe(true);
  expect(isValidEmail('invalid.email@')).toBe(false);
});
```

#### Utility Test: Password Strength
```javascript
it('should validate password strength', () => {
  const isStrongPassword = (password) => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password)
    );
  };

  expect(isStrongPassword('StrongPass123')).toBe(true);
  expect(isStrongPassword('weak')).toBe(false);
});
```

---

## Admin Panel Testing

### Stack
- **Framework**: React with Vite
- **Test Runner**: Vitest
- **Testing Library**: @testing-library/react
- **Linter**: ESLint

### Test Structure

```
admin/
├── src/
│   ├── tests/
│   │   ├── setup.ts          # Test environment setup
│   │   ├── admin-ui.test.ts  # Admin UI component tests
│   │   └── api-services.test.ts # API service mocking tests
│   ├── components/
│   ├── pages/
│   └── ...
├── vitest.config.ts
└── eslint.config.js
```

### Running Admin Panel Tests

```bash
# Run all tests
cd admin
npm test

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui

# Lint admin code
npm run lint

# Fix linting issues
npm run lint:fix

# Build admin panel
npm run build
```

### Test Examples

#### Hospital Data Validation
```javascript
it('should validate hospital data', () => {
  const hospital = {
    id: '1',
    name: 'City Hospital',
    location: 'New York',
    registrationNumber: 'REG123456',
  };

  expect(hospital).toHaveProperty('name', 'City Hospital');
  expect(hospital.registrationNumber).toMatch(/^REG\d+$/);
});
```

---

## CI/CD Pipeline

### Pipeline Overview

The GitHub Actions CI/CD pipeline includes:

1. **Backend Quality Check**
   - ESLint code quality checks
   - Jest unit tests
   - Test coverage validation
   - Runs on Node 18.x and 20.x

2. **Frontend Quality Check**
   - ESLint code quality checks
   - Vitest unit tests
   - Build verification
   - Runs on Node 18.x and 20.x

3. **Admin Panel Quality Check**
   - ESLint code quality checks
   - Vitest unit tests
   - Build verification
   - Runs on Node 18.x and 20.x

4. **Integration Tests**
   - Backend API integration tests
   - Database connectivity tests
   - Auth flow testing

5. **Build Verification**
   - Verify all projects build successfully
   - Check for build errors

6. **Security Checks**
   - npm audit on all dependencies (moderate level)
   - Identify vulnerable packages

7. **Final Status Check**
   - Summary of all jobs
   - Blocks merge if any test fails

### Pipeline Triggers

- **Push to main branch**: Full pipeline runs
- **Push to develop branch**: Full pipeline runs
- **Pull Requests**: Full pipeline runs before merge

### Pipeline Results

All pipeline results are visible in GitHub:
- Go to **Actions** tab
- Click on the workflow run
- View logs for each job

---

## Running Tests Locally

### Prerequisites

```bash
# Node.js 18.x or 20.x
node --version

# npm 9.x or later
npm --version
```

### Setup & Installation

```bash
# Clone repository
git clone <repository-url>
cd I-CAMS

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install admin dependencies
cd ../admin
npm install
```

### Running All Tests

```bash
# From root directory
# Backend tests
cd backend && npm run test:coverage

# Frontend tests
cd ../frontend && npm run test:coverage

# Admin tests
cd ../admin && npm run test:coverage
```

### Running Specific Tests

```bash
# Backend: Auth tests only
cd backend
npm test -- tests/unit/auth.test.js

# Frontend: Utils tests only
cd ../frontend
npm test -- src/tests/utils.test.ts

# Admin: Admin UI tests only
cd ../admin
npm test -- src/tests/admin-ui.test.ts
```

---

## Code Quality Standards

### ESLint Rules

#### Backend Rules
- No console logs (warn)
- Single quotes required
- Semicolons required
- 2-space indentation
- Unused variables (warn)

#### Frontend/Admin Rules
- React components must use proper props
- React hooks must follow rules
- No unused variables (warn)
- Single quotes required
- Semicolons required
- 2-space indentation

### Commit Guidelines

Before committing, ensure:

```bash
# Run linting
npm run lint

# Run tests
npm test

# Check coverage
npm run test:coverage

# Run build
npm run build
```

---

## Best Practices

### 1. Writing Tests

✅ **DO:**
- Write descriptive test names
- Test one thing per test
- Use beforeEach for setup
- Mock external dependencies
- Use positive and negative cases

❌ **DON'T:**
- Write tests that depend on other tests
- Test implementation details
- Skip tests with `.only` or `.skip`
- Leave console.log in tests

### 2. Test Naming Convention

```javascript
// Good
describe('Authentication', () => {
  it('should verify a valid JWT token', () => {});
  it('should reject an expired token', () => {});
});

// Bad
describe('auth', () => {
  it('tests jwt', () => {});
  it('test 2', () => {});
});
```

### 3. Mocking Best Practices

```javascript
// Mock external APIs
vi.mock('../services/api');
const { api } = require('../services/api');

// Mock with return value
api.fetchData.mockResolvedValue({ data: 'test' });

// Verify mock was called
expect(api.fetchData).toHaveBeenCalledWith('/endpoint');
```

### 4. Assertion Best Practices

```javascript
// Specific assertions
expect(result).toEqual({ id: 1, name: 'Test' });
expect(array).toContain('item');
expect(string).toMatch(/^test/);

// Property checks
expect(object).toHaveProperty('name');
expect(object).toHaveProperty('email', 'test@example.com');

// Number checks
expect(count).toBeGreaterThan(0);
expect(percentage).toBeGreaterThanOrEqual(0);
expect(percentage).toBeLessThanOrEqual(100);
```

### 5. Test Organization

```
tests/
├── unit/              # Isolated component tests
├── integration/       # Multi-component tests
├── e2e/              # End-to-end tests (optional)
└── fixtures/         # Test data
```

---

## Troubleshooting

### Issue: Tests Timeout

```bash
# Increase timeout in setup.js or config
// jest.config.js or vitest.config.ts
testTimeout: 30000
```

### Issue: Module Not Found

```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
```

### Issue: Port Already in Use

```bash
# Kill process on port 5432 (postgres)
lsof -ti:5432 | xargs kill -9
```

### Issue: Tests Pass Locally But Fail in CI

```bash
# Check Node version matches CI
node --version  # Should be 18.x or 20.x

# Check environment variables
echo $NODE_ENV
echo $JWT_SECRET
```

---

## Continuous Improvements

### Future Enhancements

- [ ] Add E2E tests with Playwright/Cypress
- [ ] Add performance benchmarking
- [ ] Add visual regression testing
- [ ] Implement code coverage monitoring
- [ ] Add mutation testing
- [ ] Add accessibility testing

---

## Support & Resources

### Documentation Links
- [Jest Docs](https://jestjs.io/)
- [Vitest Docs](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [GitHub Actions](https://docs.github.com/en/actions)

### Contact
For questions or issues, please create a GitHub issue or contact the development team.

---

**Last Updated**: March 16, 2024
**Version**: 1.0.0
