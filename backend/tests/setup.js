// Test setup file - runs before all tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key';

// Mock database for testing
jest.mock('../config/db', () => ({
  query: jest.fn(),
  end: jest.fn(),
}));

// Set timeout for all tests
jest.setTimeout(30000);
