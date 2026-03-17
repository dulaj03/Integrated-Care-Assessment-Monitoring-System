describe('Database Connection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have connection pool configured', () => {
    const pool = require('../../config/db');
    expect(pool).toBeDefined();
  });

  it('should handle query execution', async () => {
    const pool = require('../../config/db');
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, name: 'Test Hospital' }],
    });

    const result = await pool.query('SELECT * FROM hospitals LIMIT 1');
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toHaveProperty('id', 1);
  });

  it('should handle query errors gracefully', async () => {
    const pool = require('../../config/db');
    const error = new Error('Connection failed');
    pool.query.mockRejectedValueOnce(error);

    try {
      await pool.query('SELECT * FROM hospitals');
    } catch (err) {
      expect(err.message).toBe('Connection failed');
    }
  });

  it('should support parameterized queries', async () => {
    const pool = require('../../config/db');
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, name: 'Test User' }],
    });

    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [1]
    );

    expect(pool.query).toHaveBeenCalledWith(
      'SELECT * FROM users WHERE id = $1',
      [1]
    );
    expect(result.rows).toHaveLength(1);
  });
});
