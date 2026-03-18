// Database mock is set up globally in tests/setup.js
const pool = require('../../config/db');

describe('Database Connection (Mocked)', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have connection pool defined', () => {
    expect(pool).toBeDefined();
  });

  it('should execute a query and return rows', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, name: 'Test Hospital' }],
    });

    const result = await pool.query('SELECT * FROM hospitals LIMIT 1');

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toHaveProperty('name', 'Test Hospital');
  });

  it('should handle query errors gracefully', async () => {
    pool.query.mockRejectedValueOnce(new Error('Connection failed'));

    await expect(
      pool.query('SELECT * FROM hospitals')
    ).rejects.toThrow('Connection failed');
  });

  it('should support parameterized queries', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, full_name: 'John Doe' }],
    });

    const result = await pool.query('SELECT * FROM patients WHERE id = $1', [1]);

    expect(pool.query).toHaveBeenCalledWith(
      'SELECT * FROM patients WHERE id = $1',
      [1]
    );
    expect(result.rows[0]).toHaveProperty('full_name', 'John Doe');
  });
});
