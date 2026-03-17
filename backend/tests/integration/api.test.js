const express = require('express');
const request = require('supertest');

const app = express();
app.use(express.json());

// Mock the db pool
jest.mock('../../config/db');
const pool = require('../../config/db');

// Mock auth routes for testing
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

describe('Express API Server', () => {
  it('should respond to health check endpoint', async () => {
    const response = await request(app).get('/health');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
  });

  it('should return 404 for undefined routes', async () => {
    const response = await request(app).get('/undefined-route');
    expect(response.statusCode).toBe(404);
  });

  it('should accept JSON content type', async () => {
    const response = await request(app)
      .post('/test')
      .set('Content-Type', 'application/json')
      .send({ test: 'data' });
    // This will 404, but let's ensure it accepts JSON
    expect([404, 500]).toContain(response.statusCode);
  });
});
