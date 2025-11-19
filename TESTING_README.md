# Testing Guide - Competitor Page Analyzer

This guide explains how to run and write tests for the Competitor Page Analyzer.

---

## Table of Contents

1. [Setup](#setup)
2. [Running Tests](#running-tests)
3. [Test Structure](#test-structure)
4. [Writing Tests](#writing-tests)
5. [Coverage Reports](#coverage-reports)
6. [CI/CD Integration](#cicd-integration)
7. [Troubleshooting](#troubleshooting)

---

## Setup

### 1. Install Dependencies

```bash
npm install
```

This will install all test dependencies including:
- `jest` - Test runner
- `@testing-library/react` - React component testing
- `@testing-library/jest-dom` - DOM matchers
- `@testing-library/user-event` - User interaction simulation
- `@swc/jest` - Fast TypeScript/JSX transformation
- `@types/jest` - TypeScript type definitions

### 2. Verify Installation

```bash
npm test -- --version
```

---

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

Watch mode will automatically re-run tests when files change. Useful during development.

### Run Tests with Coverage

```bash
npm run test:coverage
```

This generates a coverage report showing which lines of code are tested.

### Run Specific Test File

```bash
# Run URL validator tests only
npm test -- __tests__/lib/url-validator.test.ts

# Run API integration tests only
npm test -- __tests__/api/analyze.integration.test.ts
```

### Run Tests Matching Pattern

```bash
# Run all tests with "validation" in the name
npm test -- --testNamePattern="validation"

# Run all tests in __tests__/api/ directory
npm test -- __tests__/api/
```

### Run Unit Tests Only

```bash
npm run test:unit
```

### Run Integration Tests Only

```bash
npm run test:integration
```

### Run Frontend Tests Only

```bash
npm run test:frontend
```

---

## Test Structure

```
seo-analyzer/
├── __tests__/
│   ├── lib/
│   │   └── url-validator.test.ts          # Unit tests for URL validation
│   ├── api/
│   │   ├── robots-txt.test.ts             # Unit tests for robots.txt parsing
│   │   ├── html-parser.test.ts            # Unit tests for HTML parsing
│   │   └── analyze.integration.test.ts    # Integration tests for API endpoint
│   └── components/
│       └── competitor-analyzer-page.test.tsx  # Frontend component tests
├── jest.config.js                         # Jest configuration
├── jest.setup.js                          # Test environment setup
├── TESTING_STRATEGY.md                    # Overall testing strategy
├── QA_CHECKLIST.md                        # Manual QA checklist
└── TESTING_README.md                      # This file
```

---

## Writing Tests

### Unit Test Example

```typescript
// __tests__/lib/my-function.test.ts
import { myFunction } from '@/lib/my-function';

describe('myFunction', () => {
  it('should return expected result', () => {
    const result = myFunction('input');
    expect(result).toBe('expected output');
  });

  it('should handle edge cases', () => {
    expect(myFunction(null)).toBeNull();
    expect(myFunction('')).toBe('');
  });
});
```

### Integration Test Example

```typescript
// __tests__/api/my-endpoint.test.ts
import { POST } from '@/app/api/my-endpoint/route';
import { NextRequest } from 'next/server';

describe('POST /api/my-endpoint', () => {
  it('should return success response', async () => {
    const request = new NextRequest('http://localhost/api/my-endpoint', {
      method: 'POST',
      body: JSON.stringify({ data: 'test' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('success', true);
  });
});
```

### Frontend Test Example

```typescript
// __tests__/components/my-component.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);

    const button = screen.getByRole('button', { name: 'Click me' });
    await user.click(button);

    expect(screen.getByText('Clicked!')).toBeInTheDocument();
  });
});
```

---

## Coverage Reports

### Viewing Coverage

After running `npm run test:coverage`, open:

```bash
open coverage/lcov-report/index.html
```

This opens an HTML report showing:
- **Lines covered** - Which lines of code were executed
- **Branches covered** - Which if/else paths were tested
- **Functions covered** - Which functions were called
- **Statements covered** - Which statements were executed

### Coverage Thresholds

Current thresholds (defined in `jest.config.js`):
- **Branches:** 70%
- **Functions:** 70%
- **Lines:** 70%
- **Statements:** 70%

Tests will fail if coverage drops below these thresholds.

### Coverage Goals

- **Critical paths:** 95%+ (URL validation, API endpoint, form submission)
- **Overall:** 80%+
- **Nice to have:** 70-80% (helper functions, utilities)

---

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

      - name: Build project
        run: npm run build
```

### Pre-commit Hook

Install Husky for pre-commit hooks:

```bash
npm install --save-dev husky
npx husky install
npx husky add .husky/pre-commit "npm test"
```

This runs tests before every commit.

---

## Troubleshooting

### Common Issues

#### 1. "Cannot find module '@/...'"

**Problem:** Path aliases not resolving

**Solution:** Ensure `jest.config.js` has correct `moduleNameMapper`:

```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/$1',
}
```

#### 2. "ReferenceError: fetch is not defined"

**Problem:** `fetch` is not available in Node.js test environment

**Solution:** Mock `fetch` in your test:

```typescript
global.fetch = jest.fn();
```

#### 3. "SyntaxError: Cannot use import statement outside a module"

**Problem:** Jest not transforming TypeScript/JSX

**Solution:** Ensure `jest.config.js` has correct transform:

```javascript
transform: {
  '^.+\\.(ts|tsx)$': '@swc/jest',
}
```

#### 4. Tests timeout

**Problem:** Async tests taking too long

**Solution:** Increase timeout or check for unresolved promises:

```typescript
it('should complete', async () => {
  // ...
}, 10000); // 10 second timeout
```

#### 5. "window is not defined"

**Problem:** Trying to access browser APIs in Node environment

**Solution:** Mock the API or use `testEnvironment: 'jsdom'`:

```javascript
// jest.config.js
testEnvironment: 'jest-environment-jsdom',
```

---

## Best Practices

### 1. Test Behavior, Not Implementation

❌ **Bad:**
```typescript
it('should call setState with correct value', () => {
  const { container } = render(<MyComponent />);
  expect(container.firstChild.setState).toHaveBeenCalledWith('value');
});
```

✅ **Good:**
```typescript
it('should display updated value', () => {
  render(<MyComponent />);
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'new value' } });
  expect(screen.getByText('new value')).toBeInTheDocument();
});
```

### 2. Use Descriptive Test Names

❌ **Bad:**
```typescript
it('works', () => { /* ... */ });
```

✅ **Good:**
```typescript
it('should reject invalid URLs with clear error message', () => { /* ... */ });
```

### 3. Arrange-Act-Assert Pattern

```typescript
it('should calculate total correctly', () => {
  // Arrange
  const items = [{ price: 10 }, { price: 20 }];

  // Act
  const total = calculateTotal(items);

  // Assert
  expect(total).toBe(30);
});
```

### 4. Mock External Dependencies

```typescript
// Mock fetch
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ data: 'mocked' }),
});

// Mock module
jest.mock('@/lib/analytics', () => ({
  track: jest.fn(),
}));
```

### 5. Clean Up After Tests

```typescript
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  cleanup(); // From @testing-library/react
});
```

---

## Quick Reference

### Common Jest Matchers

```typescript
expect(value).toBe(5);                    // Strict equality
expect(value).toEqual({ a: 1 });          // Deep equality
expect(value).toBeTruthy();               // Truthy value
expect(value).toBeFalsy();                // Falsy value
expect(value).toBeNull();                 // null
expect(value).toBeUndefined();            // undefined
expect(value).toBeDefined();              // not undefined
expect(array).toContain(item);            // Array contains
expect(string).toMatch(/regex/);          // Regex match
expect(fn).toHaveBeenCalled();            // Function called
expect(fn).toHaveBeenCalledWith(arg);     // Called with arg
```

### Common Testing Library Queries

```typescript
screen.getByRole('button', { name: 'Submit' });  // Get by ARIA role
screen.getByLabelText('Email');                  // Get by label
screen.getByPlaceholderText('Enter email');      // Get by placeholder
screen.getByText('Hello');                       // Get by text content
screen.getByTestId('custom-element');            // Get by data-testid
screen.queryByText('Not found');                 // Returns null if not found
await screen.findByText('Async');                // Wait for element
```

### User Event API

```typescript
const user = userEvent.setup();

await user.click(button);                    // Click element
await user.type(input, 'Hello');             // Type text
await user.clear(input);                     // Clear input
await user.selectOptions(select, 'option1'); // Select option
await user.upload(input, file);              // Upload file
await user.tab();                            // Tab key
```

---

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Cheatsheet](https://testing-library.com/docs/react-testing-library/cheatsheet/)
- [Common Testing Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## Summary

✅ **Run tests:** `npm test`
✅ **Watch mode:** `npm run test:watch`
✅ **Coverage:** `npm run test:coverage`
✅ **Target:** 80%+ coverage on critical paths
✅ **Strategy:** Unit + Integration + Frontend + Manual QA

Happy testing! 🧪
