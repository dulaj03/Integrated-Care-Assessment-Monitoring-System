const bcrypt = require('bcryptjs');

describe('Password Hashing Utility', () => {
  it('should hash a password successfully', async () => {
    const password = 'SecurePassword123!';
    const hash = await bcrypt.hash(password, 10);

    expect(hash).toBeDefined();
    expect(typeof hash).toBe('string');
    expect(hash).not.toBe(password); // Hash should be different from original
    expect(hash.length).toBeGreaterThan(20); // bcrypt hashes are long
  });

  it('should return different hashes for the same password', async () => {
    const password = 'SecurePassword123!';
    const hash1 = await bcrypt.hash(password, 10);
    const hash2 = await bcrypt.hash(password, 10);

    expect(hash1).not.toBe(hash2); // Different salts produce different hashes
  });

  it('should compare password with hash successfully', async () => {
    const password = 'SecurePassword123!';
    const hash = await bcrypt.hash(password, 10);
    const isMatch = await bcrypt.compare(password, hash);

    expect(isMatch).toBe(true);
  });

  it('should reject incorrect password', async () => {
    const password = 'SecurePassword123!';
    const wrongPassword = 'WrongPassword123!';
    const hash = await bcrypt.hash(password, 10);
    const isMatch = await bcrypt.compare(wrongPassword, hash);

    expect(isMatch).toBe(false);
  });

  it('should handle empty password', async () => {
    const password = '';
    const hash = await bcrypt.hash(password, 10);

    expect(hash).toBeDefined();
    const isMatch = await bcrypt.compare('', hash);
    expect(isMatch).toBe(true);
  });

  it('should handle special characters in password', async () => {
    const password = 'P@ssw0rd!#$%^&*()_+-=[]{}|;:",.<>?/';
    const hash = await bcrypt.hash(password, 10);
    const isMatch = await bcrypt.compare(password, hash);

    expect(isMatch).toBe(true);
  });
});
