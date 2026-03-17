const jwt = require('jsonwebtoken');

// Mock the authMiddleware
jest.mock('../../config/db');

describe('Authentication Middleware', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret-key';
  });

  it('should sign a valid JWT token', () => {
    const payload = { id: 1, email: 'test@example.com', role: 'patient' };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
  });

  it('should verify a valid JWT token', () => {
    const payload = { id: 1, email: 'test@example.com', role: 'patient' };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded).toHaveProperty('id', 1);
    expect(decoded).toHaveProperty('email', 'test@example.com');
    expect(decoded).toHaveProperty('role', 'patient');
  });

  it('should reject an invalid JWT token', () => {
    const invalidToken = 'invalid.token.here';

    expect(() => {
      jwt.verify(invalidToken, process.env.JWT_SECRET);
    }).toThrow();
  });

  it('should reject a token with wrong secret', () => {
    const payload = { id: 1, email: 'test@example.com' };
    const token = jwt.sign(payload, 'correct-secret', { expiresIn: '24h' });

    expect(() => {
      jwt.verify(token, 'wrong-secret');
    }).toThrow();
  });

  it('should reject an expired token', () => {
    const payload = { id: 1, email: 'test@example.com' };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '-1h' }); // Expired

    expect(() => {
      jwt.verify(token, process.env.JWT_SECRET);
    }).toThrow();
  });
});
