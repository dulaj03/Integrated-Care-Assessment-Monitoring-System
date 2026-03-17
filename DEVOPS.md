# I-CAMS DevOps & Deployment Guide

## Overview

This guide documents the DevOps infrastructure, deployment strategies, and continuous integration/deployment processes for the I-CAMS application.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [CI/CD Pipeline](#cicd-pipeline)
3. [Three-Tier Application Structure](#three-tier-application-structure)
4. [Environment Management](#environment-management)
5. [Deployment Strategies](#deployment-strategies)
6. [Monitoring & Logging](#monitoring--logging)
7. [Best Practices](#best-practices)

---

## Architecture Overview

### Application Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React/Vite)                    │
│            Patient Portal & Public Website                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Admin Panel (React/Vite)                    │
│         Hospital & System Administration Interface           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                Backend API (Express.js)                      │
│         Authentication, Business Logic, Data Access          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   PostgreSQL Database                         │
│              Data Persistence & Management                   │
└─────────────────────────────────────────────────────────────┘
```

### Repository Structure

```
I-CAMS/
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # Primary CI/CD pipeline
├── backend/                    # Express API
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── tests/
│   ├── jest.config.js
│   └── .eslintrc.js
├── frontend/                   # React SPA (Patients/Public)
│   ├── src/
│   ├── tests/
│   ├── vitest.config.ts
│   └── .eslintrc.js
├── admin/                      # React SPA (Admin)
│   ├── src/
│   ├── tests/
│   ├── vitest.config.ts
│   └── eslint.config.js
├── TESTING.md                  # Testing guide
├── DEVOPS.md                   # This file
└── README.md                   # Project overview
```

---

## CI/CD Pipeline

### Pipeline Architecture

```
Developer Push → GitHub
        ↓
   ┌────────────────────────────────────────┐
   │      GitHub Actions Workflow           │
   └────────────────────────────────────────┘
        ↓
   ┌────────────────────────────────────────┐
   │   Backend Quality (Lint & Test)        │
   │   Frontend Quality (Lint & Test)       │
   │   Admin Quality (Lint & Test)          │
   │   (All run in parallel)                │
   └────────────────────────────────────────┘
        ↓
   ┌────────────────────────────────────────┐
   │   Integration Tests                    │
   │   Build Verification                   │
   │   Security Checks                      │
   │   (Depends on above jobs)              │
   └────────────────────────────────────────┘
        ↓
   ┌────────────────────────────────────────┐
   │   Final Status Check                   │
   │   ✅ Pass → Can Merge                  │
   │   ❌ Fail → Block Merge                │
   └────────────────────────────────────────┘
```

### Pipeline Jobs

#### 1. Backend Quality Check
```yaml
- Run: ESLint linting
- Run: Jest unit tests with coverage
- Run: Integration tests
- Collect: Code coverage metrics
- Report: ESLint violations
```

**Configuration:**
- Node versions: 18.x, 20.x
- Database: PostgreSQL 15
- Timeout: 30 seconds per test

#### 2. Frontend Quality Check
```yaml
- Run: ESLint linting
- Run: Vitest unit tests
- Build: Production build
- Collect: Code coverage metrics
- Report: Build errors & linting violations
```

**Configuration:**
- Node versions: 18.x, 20.x
- Build tool: Vite
- Timeout: 5 minutes per build

#### 3. Admin Quality Check
```yaml
- Run: ESLint linting
- Run: Vitest unit tests with coverage
- Build: Production build
- Collect: Code coverage metrics
- Report: All issues
```

**Configuration:**
- Node versions: 18.x, 20.x
- Build tool: Vite
- Timeout: 5 minutes per build

#### 4. Integration Tests
```yaml
- Depends on: All quality checks passing
- Run: Backend integration tests
- Test: API endpoints
- Test: Database operations
- Test: Auth flows
```

#### 5. Build Verification
```yaml
- Depends on: All quality checks passing
- Verify: Backend build
- Verify: Frontend build
- Verify: Admin build
- Ensure: No build artifacts in source
```

#### 6. Security Checks
```yaml
- Run: npm audit (all projects)
- Level: Moderate (blocks on moderate+ vulnerabilities)
- Report: Vulnerability details
- Recommend: Updates for packages
```

#### 7. Final Status Check
```yaml
- Depends on: All above jobs
- Summary: Pass/Fail status
- Actions: Block merge if failed
- Notifications: Send status updates
```

---

## Three-Tier Application Structure

### Tier 1: Frontend (Client Layer)

**Purpose:** User interface and client-side logic

```
Frontend Components
├── Pages (React components)
├── Components (Reusable UI)
├── Hooks (Custom React hooks)
├── Services (API calls)
├── Context (State management)
└── Utils (Helper functions)

Technologies:
- React 18+
- Vite (Build tool)
- Tailwind CSS / Material UI
- React Router
- i18n (Internationalization)
- React Hook Form
- Recharts (Data visualization)
```

**Deployment:**
- Build artifact: Static files (HTML, CSS, JS)
- Environment: CDN or Static web hosting
- Build time: ~2 minutes
- Size: ~1-2 MB

### Tier 2: Backend API (Application Layer)

**Purpose:** Business logic, authentication, data processing

```
Backend Components
├── Routes (API endpoints)
├── Controllers (Request handlers)
├── Models (Data models)
├── Middleware (Auth, validation, error handling)
├── Services (Business logic)
└── Utils (Helper functions)

Technologies:
- Node.js 18+
- Express.js 5.x
- PostgreSQL
- JWT (Authentication)
- Bcrypt (Password hashing)
- Multer (File uploads)
- Helmet (Security)
- CORS (Cross-origin)
- Morgan (Logging)
```

**Deployment:**
- Runtime: Node.js
- Environment: Docker container or VM
- Port: 5000 (configurable)
- Database: PostgreSQL 15+
- Health check: GET /

### Tier 3: Data Layer (Database)

**Purpose:** Persistent data storage

```
Database Components
├── Users (auth, roles)
├── Patients (health records)
├── Doctors (staff management)
├── Hospitals (multi-hospital support)
├── Health Logs (health records)
└── Admins (system administration)

Technologies:
- PostgreSQL 15+
- Connection pooling
- Prepared statements
- SSL connections
```

**Deployment:**
- Managed: RDS or self-hosted
- Backup: Daily automated backups
- Replication: Read replicas for scaling

---

## Environment Management

### Environment Variables

#### Backend (.env)
```bash
# Server
NODE_ENV=production
PORT=5000
JWT_SECRET=<secure-random-key>

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=icams_user
DB_PASSWORD=<secure-password>
DB_NAME=icams_db

# Security
CORS_ORIGIN=https://yourdomain.com
HELMET_ENABLED=true

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880  # 5MB

# Logging
LOG_LEVEL=info
LOG_DIR=./logs
```

#### Frontend (.env)
```bash
VITE_API_URL=https://api.yourdomain.com
VITE_APP_NAME=I-CAMS
VITE_ENVIRONMENT=production
```

#### Admin (.env)
```bash
VITE_API_URL=https://api.yourdomain.com
VITE_APP_NAME=I-CAMS Admin
VITE_ENVIRONMENT=production
```

### Environment Tiers

| Environment | CI/CD | Database | Frontend | Backend |
|-------------|-------|----------|----------|---------|
| Development | Local | Local    | Localhost:5173 | Localhost:5000 |
| Staging     | GitHub | RDS Staging | staging.domain.com | api-staging.domain.com |
| Production  | GitHub | RDS Prod | domain.com | api.domain.com |

---

## Deployment Strategies

### Strategy 1: Blue-Green Deployment

```
Current (Blue)        New (Green)
Production Version    New Version
  ↓                      ↓
Load Balancer Routes to Blue
        ↓
     (Test Green)
        ↓
   Switch to Green
```

**Benefits:**
- Zero downtime
- Easy rollback
- Full testing before switch

### Strategy 2: Rolling Deployment

```
V1 Instance 1  →  Rolling Update  →  V2 Instance 1
V1 Instance 2  →  Rolling Update  →  V2 Instance 2
V1 Instance 3  →  Rolling Update  →  V2 Instance 3
```

**Benefits:**
- Gradual rollout
- Reduced resource needs
- Quick rollback if issues

### Strategy 3: Canary Deployment

```
Current Version: 100% traffic
        ↓
Canary: 5% traffic to new version
        ↓
Monitor metrics & errors
        ↓
Canary: 25% traffic
        ↓
Canary: 50% traffic
        ↓
Full: 100% new version
```

**Benefits:**
- Risk mitigation
- Real-world testing
- Gradual adoption

---

## Monitoring & Logging

### Application Monitoring

```yaml
Metrics to Monitor:
  - Request count
  - Response time
  - Error rate
  - Database query time
  - Memory usage
  - CPU usage
  - Active connections
```

### Log Aggregation

```
Application Logs
      ↓
  LogStash / Fluentd
      ↓
  Elasticsearch / CloudWatch
      ↓
  Kibana / Console
```

### Error Tracking

```
Application Errors
      ↓
  Error Handler
      ↓
  Sentry / New Relic / DataDog
      ↓
  Alerts & Notifications
```

### Health Checks

```bash
# Backend health check
GET /

Response:
{
  "message": "✅ I-CAMS API is running",
  "version": "1.0.0",
  "timestamp": "2024-03-16T10:30:00Z"
}
```

---

## Best Practices

### 1. Code Quality

```bash
# Always lint before commit
npm run lint

# Always test before commit
npm test

# Always build before push
npm run build
```

### 2. Commit Messages

```
Format: <type>(<scope>): <subject>

Types: feat, fix, docs, style, refactor, test, chore
Scope: backend, frontend, admin, ci
Subject: Clear, concise, lowercase

Examples:
- feat(backend): add user authentication
- fix(frontend): resolve login form validation
- docs(ci): update CI/CD documentation
- test(admin): add hospital crud tests
```

### 3. Branch Strategy

```
main              # Production-ready code
├── hotfix/       # Emergency fixes from main
└── develop       # Development integration branch
    ├── feature/  # Feature development
    ├── fix/      # Bug fixes
    └── test/     # Testing branches
```

### 4. Code Review Checklist

- [ ] Tests pass locally
- [ ] Code follows linting standards
- [ ] No console.log statements
- [ ] No commented-out code
- [ ] Proper error handling
- [ ] Security considerations addressed
- [ ] Documentation updated
- [ ] Performance impact minimized

### 5. Release Process

```
1. Create release branch: release/v1.0.0
2. Update version numbers
3. Update CHANGELOG
4. Run full test suite
5. Create release tag
6. Deploy to production
7. Document any issues
8. Monitor for errors
```

---

## Troubleshooting

### Issue: CI Pipeline Fails

```bash
# Check failure reason in GitHub Actions
1. Go to Actions tab
2. Click on failed workflow
3. View logs for each job
4. Check error messages
```

### Issue: Build Fails Locally But Passes in CI

```bash
# Ensure same Node version
node --version  # Should match CI

# Clear cache
rm -rf node_modules
npm install

# Try build
npm run build
```

### Issue: Database Connection Error

```bash
# Check database service
psql -U user -d database_name -c "SELECT 1;"

# Check environment variables
echo $DB_HOST
echo $DB_USER
echo $DB_NAME
```

### Issue: Tests Timeout

```bash
# Increase timeout in config
// jest.config.js or vitest.config.ts
testTimeout: 60000  // 60 seconds
```

---

## Continuous Improvements

### Planned Enhancements

- [ ] Implement container orchestration (Kubernetes)
- [ ] Add automated performance testing
- [ ] Implement feature flags
- [ ] Add blue-green deployment automation
- [ ] Implement canary deployments
- [ ] Add infrastructure as code (Terraform)
- [ ] Add automated scaling
- [ ] Implement chaos engineering tests

---

## DevOps Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Linting passed
- [ ] Build successful
- [ ] Security audit passed
- [ ] Performance benchmarks met
- [ ] Database migrations tested
- [ ] Environment variables configured

### Deployment
- [ ] Backup database
- [ ] Monitor deployment progress
- [ ] Verify health checks
- [ ] Check error rates
- [ ] Verify user experience

### Post-Deployment
- [ ] Monitor application metrics
- [ ] Check error logs
- [ ] Monitor database performance
- [ ] Collect user feedback
- [ ] Document any issues

---

## Resources

- [GitHub Actions Docs](https://docs.github.com/actions)
- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [React Best Practices](https://react.dev/learn)

---

**Last Updated**: March 16, 2024
**Version**: 1.0.0
**Maintained by**: I-CAMS Development Team
