import { describe, it, expect } from 'vitest';

describe('Utility Functions', () => {
  it('should validate email format', () => {
    const isValidEmail = (email: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    expect(isValidEmail('invalid.email@')).toBe(false);
    expect(isValidEmail('no-at-sign.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });

  it('should validate password strength', () => {
    const isStrongPassword = (password: string) => {
      return (
        password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[!@#$%^&*]/.test(password)
      );
    };

    expect(isStrongPassword('StrongPass123!')).toBe(true);
    expect(isStrongPassword('weak')).toBe(false);
    expect(isStrongPassword('NoSpecial123')).toBe(false);
    expect(isStrongPassword('NOLOWERCASE123!')).toBe(false);
  });

  it('should format date properly', () => {
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    };

    const date = new Date('2024-03-16');
    const formatted = formatDate(date);
    expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it('should truncate long text', () => {
    const truncateText = (text: string, maxLength: number) => {
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    expect(truncateText('Hello World', 5)).toBe('Hello...');
    expect(truncateText('Hi', 5)).toBe('Hi');
    expect(truncateText('Testing text truncation', 10)).toBe('Testing te...');
  });

  it('should calculate percentage', () => {
    const calculatePercentage = (value: number, total: number) => {
      return total === 0 ? 0 : (value / total) * 100;
    };

    expect(calculatePercentage(25, 100)).toBe(25);
    expect(calculatePercentage(1, 3)).toBeCloseTo(33.33, 1);
    expect(calculatePercentage(50, 0)).toBe(0);
  });
});
