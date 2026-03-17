# I-CAMS - Integrated Clinical & Administrative Management System

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18+-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791)
![License](https://img.shields.io/badge/License-MIT-yellow)
![CI Status](https://github.com/dulaj03/I-CAMS/actions/workflows/ci-cd.yml/badge.svg)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Testing](#testing)
- [DevOps & CI/CD](#devops--cicd)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

---

## 🏥 Overview

**I-CAMS** is a comprehensive healthcare management system designed to streamline clinical and administrative operations in multi-hospital environments. The system provides integrated solutions for patient management, staff coordination, health monitoring, and hospital administration.

### Key Capabilities

- 👥 **Multi-Role Support**: Patients, Doctors, Nurses, Admins, Hospitals
- 🏨 **Multi-Hospital Management**: Manage multiple hospitals from a centralized admin panel
- 🔐 **Secure Authentication**: JWT-based authentication with role-based access control
- 📊 **Health Monitoring**: Real-time health tracking and trend analysis
- 💻 **Responsive Design**: Works on desktop, tablet, and mobile devices
- 🌐 **Multi-Language Support**: Internationalization ready (English, Sinhala, Tamil)

---

## ⭐ Features

### For Patients
- User registration and profile management
- Health record tracking
- Appointment scheduling
- Doctor consultation access
- Health trend visualization

### For Doctors
- Professional licensing verification
- Patient record access
- Appointment management
- Health monitoring
- Electronic prescriptions

### For Nurses
- Nursing certification management
- Patient care coordination
- Health monitoring
- Staff scheduling

### For System Admins
- Hospital management
- User management
- System configuration
- Reports and analytics
- Security controls

---

## 🏗️ Architecture

### Three-Tier Architecture

```
┌────────────────────────────────────────────┐
│          Frontend & Admin Panel             │
│     (React with Vite - Client Layer)        │
└────────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────┐
│           Backend API Server               │
│    (Express.js - Application Layer)        │
└────────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────┐
│          PostgreSQL Database                │
│        (Data Persistence Layer)             │
└────────────────────────────────────────────┘
```

### Project Structure

```
I-CAMS/
├── backend/                    # Express API
│   ├── controllers/           # Business logic
│   ├── models/                # Data models & queries
│   ├── routes/                # API endpoints
│   ├── middleware/            # Auth & validation
│   ├── tests/                 # Jest test suite
│   ├── jest.config.js         # Jest configuration
│   └── server.js              # Entry point
│
├── frontend/                   # Patient Portal
│   ├── src/
│   │   ├── app/              # Main app component
│   │   ├── pages/            # Route pages
│   │   ├── components/       # Reusable components
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/              # Utilities & helpers
│   │   ├── tests/            # Vitest test suite
│   │   ├── locales/          # i18n translations
│   │   └── styles/           # Global styles
│   ├── vitest.config.ts      # Vitest configuration
│   └── vite.config.ts        # Vite configuration
│
├── admin/                      # Admin Panel
│   ├── src/
│   │   ├── app/              # Main app
│   │   ├── pages/            # Admin pages
│   │   ├── components/       # UI components
│   │   ├── tests/            # Vitest test suite
│   │   └── styles/           # Tailwind styles
│   ├── vitest.config.ts
│   └── vite.config.ts
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml         # GitHub Actions pipeline
│
├── TESTING.md                 # Testing documentation
├── DEVOPS.md                  # DevOps & CI/CD guide
└── README.md                  # This file
```

---

## 💻 Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 5+
- **Database**: PostgreSQL 15+
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: Bcrypt
- **File Upload**: Multer
- **Validation**: express-validator
- **Security**: Helmet, CORS
- **Testing**: Jest, Supertest
- **Linting**: ESLint

### Frontend
- **Library**: React 18+
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Material UI, Radix UI
- **Routing**: React Router
- **Forms**: React Hook Form
- **State**: React Context + Hooks
- **UI Charts**: Recharts
- **i18n**: i18next
- **Testing**: Vitest, Testing Library
- **Linting**: ESLint

### Admin Panel
- **Library**: React 19+
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **Icons**: Lucide React
- **Animations**: Motion, Sonner
- **Testing**: Vitest, Testing Library
- **Linting**: ESLint

### DevOps & CI/CD
- **Version Control**: Git & GitHub
- **CI/CD**: GitHub Actions
- **Testing**: Jest, Vitest
- **Coverage**: Codecov
- **Code Quality**: ESLint, Code Coverage
- **Database**: PostgreSQL Docker image
- **Deployment**: Containerizable

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or 20.x
- npm 9.x or later
- PostgreSQL 15+
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/dulaj03/I-CAMS.git
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

### Environment Setup

#### Backend (.env)
```bash
NODE_ENV=development
PORT=5000
JWT_SECRET=your_jwt_secret_key

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=icams_db
```

#### Frontend (.env)
```bash
VITE_API_URL=http://localhost:5000
```

#### Admin (.env)
```bash
VITE_API_URL=http://localhost:5000
```

### Running the Application

```bash
# Terminal 1: Start Backend
cd backend
npm run dev

# Terminal 2: Start Frontend
cd frontend
npm run dev

# Terminal 3: Start Admin Panel
cd admin
npm run dev
```

### Access the Application
- Frontend: http://localhost:5173
- Admin Panel: http://localhost:5174
- Backend API: http://localhost:5000

---

## 🧪 Testing

I-CAMS includes comprehensive testing across all three components with 75-80% code coverage targets.

### Quick Test Commands

```bash
# Backend
cd backend
npm test                   # Run all tests
npm run test:coverage     # Run with coverage
npm run test:watch       # Watch mode

# Frontend
cd frontend
npm test                   # Run all tests
npm run test:coverage     # Run with coverage
npm run test:ui          # UI mode

# Admin
cd admin
npm test                   # Run all tests
npm run test:coverage     # Run with coverage
npm run test:ui          # UI mode
```

### Test Structure
- **Unit Tests**: Component and function isolation
- **Integration Tests**: Multi-component workflows
- **API Tests**: Backend endpoint testing

For detailed testing documentation, see [TESTING.md](TESTING.md)

---

## 🔄 DevOps & CI/CD

### GitHub Actions Pipeline

The project includes an automated CI/CD pipeline that runs on every push and pull request:

#### Pipeline Jobs
1. ✅ **Backend Quality Check** - Linting, tests, coverage
2. ✅ **Frontend Quality Check** - Linting, tests, build
3. ✅ **Admin Quality Check** - Linting, tests, build
4. ✅ **Integration Tests** - API & database tests
5. ✅ **Build Verification** - Verify all builds successful
6. ✅ **Security Checks** - npm audit on dependencies
7. ✅ **Final Status Check** - Merge gating

### Code Quality Standards
- ESLint enforces code style
- Tests must pass with no failures
- Builds must succeed
- Security vulnerabilities must be addressed
- Code coverage maintained above targets

### Pre-Commit Checklist

```bash
# Run before committing
npm run lint              # Check code style
npm test                  # Run tests
npm run test:coverage    # Check coverage
npm run build            # Verify builds
```

For detailed DevOps documentation, see [DEVOPS.md](DEVOPS.md)

---

## 📚 Documentation

- **[TESTING.md](TESTING.md)** - Comprehensive testing guide
  - Testing strategy & frameworks
  - Unit, integration, and E2E tests
  - Coverage goals and reports
  - Best practices

- **[DEVOPS.md](DEVOPS.md)** - DevOps & deployment guide
  - CI/CD architecture
  - Environment management
  - Deployment strategies
  - Monitoring & logging

---

## 🤝 Contributing

### Development Workflow

1. **Fork & Clone**
   ```bash
   git clone https://github.com/yourusername/I-CAMS.git
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes**
   - Follow code style guidelines
   - Write/update tests
   - Update documentation

4. **Test Locally**
   ```bash
   npm run lint
   npm test
   npm run build
   ```

5. **Commit & Push**
   ```bash
   git commit -m "feat: your feature description"
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Describe changes clearly
   - Reference related issues
   - Wait for CI/CD to pass
   - Request code review

### Commit Message Format

```
<type>(<scope>): <subject>

Types: feat, fix, docs, style, refactor, test, chore
Scope: backend, frontend, admin, ci
```

### Code Style

- Use ESLint configuration
- Follow existing code patterns
- Write descriptive comments
- No console.log in production code
- Proper error handling

---

## 📊 Project Statistics

### Code Metrics
- **Backend**: ~2000+ lines of code
- **Frontend**: ~5000+ lines of code
- **Admin**: ~3000+ lines of code
- **Test Coverage**: 75-80%
- **Test Suite**: 50+ tests

### Performance Targets
- Frontend build time: < 3 minutes
- Backend test time: < 2 minutes
- Admin build time: < 3 minutes
- API response time: < 200ms

---

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ SQL injection prevention (prepared statements)
- ✅ CORS protection
- ✅ Helmet for HTTP security headers
- ✅ Input validation & sanitization
- ✅ Secure file upload handling
- ✅ Environment variable management

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

Developed as a final project for the NSBM Green University 3rd Year.

### Contributors
- Dulaj (Lead Developer)
- Development Team

---

## 📞 Support

For issues, questions, or suggestions, please:
1. Check existing issues on GitHub
2. Create a new issue with detailed description
3. Contact the development team

---

## 🎯 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Real-time notifications (WebSockets)
- [ ] Advanced analytics dashboard
- [ ] Telemedicine features
- [ ] Insurance integration
- [ ] Prescription management
- [ ] Inventory tracking
- [ ] E2E tests (Playwright/Cypress)

---

**Last Updated**: March 16, 2024
**Version**: 1.0.0

---

Made with ❤️ by the I-CAMS Team
