# I-CAMS Quick Reference Guide

## 🚀 Developer Cheat Sheet

### Before Every Commit

```bash
# 1. Lint your code
npm run lint

# 2. Run tests
npm test

# 3. Check coverage
npm run test:coverage

# 4. Build to verify
npm run build
```

### Running Tests

#### Backend
```bash
cd backend

# All tests
npm test

# Watch mode
npm test -- --watch

# Specific test file
npm test -- auth.test.js

# With coverage
npm run test:coverage
```

#### Frontend
```bash
cd frontend

# All tests
npm test

# UI mode (visual)
npm run test:ui

# Specific file
npm test -- utils.test.ts

# Watch mode
npm test -- --watch
```

#### Admin
```bash
cd admin

# All tests
npm test

# Coverage report
npm run test:coverage

# UI mode
npm run test:ui
```

---

## 📋 Test File Locations

### Backend Tests
```
backend/tests/
├── unit/
│   ├── auth.test.js          # JWT & auth tests
│   ├── bcrypt.test.js        # Password tests
│   └── database.test.js      # DB tests
└── integration/
    └── api.test.js           # API tests
```

### Frontend Tests
```
frontend/src/tests/
├── utils.test.ts            # Utility functions
└── components.test.ts       # Component logic
```

### Admin Tests
```
admin/src/tests/
├── admin-ui.test.ts        # Admin UI tests
└── api-services.test.ts    # API mocking
```

---

## 🔧 Common Commands

### Development
```bash
# Start each component in separate terminals:
cd backend && npm run dev       # :5000
cd frontend && npm run dev      # :5173
cd admin && npm run dev         # :5174
```

### Testing
```bash
# Run all tests in a component
npm test

# Run specific test
npm test -- specific.test.js

# Watch mode
npm test -- --watch

# Coverage report
npm run test:coverage
```

### Linting
```bash
# Check for issues
npm run lint

# Fix automatically
npm run lint:fix
```

### Building
```bash
# Production build
npm run build

# Preview build
npm run preview
```

---

## 📊 CI/CD Pipeline Status

### Check Pipeline Status
1. Go to GitHub → Actions tab
2. Click on latest workflow run
3. View status of each job:
   - ✅ Passed (green)
   - ❌ Failed (red)
   - ⏳ Running (yellow)

### Common Failures

| Issue | Solution |
|-------|----------|
| ESLint errors | Run `npm run lint:fix` |
| Test failures | Run `npm test` to see details |
| Build error | Check for syntax errors |
| Coverage low | Write more tests or improve |

---

## 🎯 Git Workflow

### Create Feature Branch
```bash
git checkout -b feature/my-feature
```

### Make Changes
```bash
# Edit files
git add .
git commit -m "feat(backend): add new feature"
```

### Push & Create PR
```bash
git push origin feature/my-feature

# Then create PR on GitHub
```

### After Review
```bash
# Pull latest main
git checkout main
git pull origin main

# Merge feature branch
git merge feature/my-feature

# Push
git push origin main
```

---

## 📝 Writing Tests

### Backend Test Template
```javascript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup before each test
  });

  it('should do something specific', () => {
    // Test logic
    expect(result).toBe(expected);
  });

  afterEach(() => {
    // Cleanup after each test
  });
});
```

### Frontend Test Template
```javascript
import { describe, it, expect, vi } from 'vitest';

describe('Component/Function', () => {
  it('should render correctly', () => {
    // Test logic
    expect(result).toBe(expected);
  });
});
```

### Assertion Patterns
```javascript
// Equality
expect(value).toBe(5);
expect(object).toEqual({ id: 1 });

// Booleans
expect(boolean).toBe(true);
expect(array).toContain('item');

// Strings
expect(string).toMatch(/pattern/);
expect(string).toContain('text');

// Numbers
expect(number).toBeGreaterThan(0);
expect(number).toBeLessThan(10);

// Properties
expect(obj).toHaveProperty('name');
expect(obj).toHaveProperty('name', 'John');

// Functions
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith(args);
```

---

## 🐛 Debugging Tests

### Run Specific Test
```bash
# Jest (Backend)
npm test -- --testNamePattern="should verify"

# Vitest (Frontend/Admin)
npm test -- -t "should verify"
```

### Debug Mode
```bash
# Node debug
node --inspect-brk ./node_modules/.bin/jest

# VS Code: Add to launch.json
{
  "type": "node",
  "request": "launch",
  "program": "${workspaceFolder}/backend/node_modules/.bin/jest",
  "args": ["--runInBand", "--watch"]
}
```

### View Test Coverage
```bash
npm run test:coverage

# Html report (open in browser)
open coverage/index.html
```

---

## 🔒 Security Checklist

- [ ] No passwords in code
- [ ] No API keys in environment
- [ ] Use environment variables for secrets
- [ ] Validate user inputs
- [ ] Hash passwords with bcrypt
- [ ] Use JWT for authentication
- [ ] Set CORS properly
- [ ] Update dependencies: `npm audit`

---

## 📚 Test Writing Tips

### Good Test Practices
✅ One assertion per test (or focused group)  
✅ Descriptive test names  
✅ Use beforeEach for setup  
✅ Mock external dependencies  
✅ Test both success and failure cases  

### Avoid
❌ Tests that depend on other tests  
❌ Testing implementation details  
❌ Skipping tests with `.skip`  
❌ Using timeout as stop-gap  

---

## 🚨 Troubleshooting

### "Tests Timeout"
```javascript
// In setup file or config
jest.setTimeout(30000);  // 30 seconds
```

### "Module not found"
```bash
rm -rf node_modules
npm install
npm test
```

### "Port already in use"
```bash
# Find process: lsof -i :5000
# Kill it: kill -9 <PID>
```

### "Unexpected token"
```bash
# Usually TypeScript/JSX issue
# Ensure vitest.config/jest.config is correct
npm test -- --clearCache
```

---

## 📞 Quick Links

- **GitHub Actions Docs**: https://docs.github.com/actions
- **Jest Docs**: https://jestjs.io
- **Vitest Docs**: https://vitest.dev
- **Testing Library**: https://testing-library.com
- **Node.js Docs**: https://nodejs.org/docs

---

## 💡 Pro Tips

1. **Use watch mode while developing**
   ```bash
   npm test -- --watch
   ```

2. **Run only changed tests**
   ```bash
   npm test -- --onlyChanged
   ```

3. **Use UI mode for debugging**
   ```bash
   npm run test:ui
   ```

4. **Coverage threshold**
   - Backend: 80%
   - Frontend: 75%
   - Admin: 75%

5. **CI/CD requires ALL tests to pass before merge**

---

## 🎓 Learning Resources

### Testing Best Practices
- [Jest Testing Best Practices](https://jestjs.io/docs/en/getting-started)
- [Vitest Guide](https://vitest.dev/guide/)
- [Testing Library Docs](https://testing-library.com/docs/)

### DevOps
- [GitHub Actions](https://docs.github.com/en/actions)
- [CI/CD Basics](https://www.atlassian.com/continuous-delivery/ci-cd)

---

**Last Updated**: March 16, 2024  
**For Questions**: Check TESTING.md or DEVOPS.md for detailed guides
