const request = require('supertest');
const express = require('express');

// ── Mock DB & models before requiring app routes ──────────────────
jest.mock('../../config/db');
jest.mock('../../models/patientModel');
jest.mock('../../models/doctorModel');
jest.mock('../../models/nurseModel');
jest.mock('../../models/hospitalModel');
jest.mock('../../models/adminModel');
jest.mock('../../utils/upload', () => ({
  single: () => (req, res, next) => next(),
}));

const PatientModel = require('../../models/patientModel');
const authRouter   = require('../../routes/auth');

// ── Build a minimal Express app ───────────────────────────────────
const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// ── Tests ─────────────────────────────────────────────────────────
describe('Auth API Integration Tests', () => {

  beforeEach(() => jest.clearAllMocks());

  /* ── Login endpoint ── */
  describe('POST /api/auth/login', () => {

    it('should return 400 when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' }); // missing password & role

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 400 for an invalid role', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'pass123', role: 'unknown' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/invalid role/i);
    });

    it('should return 401 when patient email is not found', async () => {
      PatientModel.findByEmail.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'ghost@example.com', password: 'pass123', role: 'patient' });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error');
    });
  });

  /* ── 404 route ── */
  describe('Unknown routes', () => {
    it('should return 404 for undefined endpoints', async () => {
      const res = await request(app).get('/api/auth/undefined-endpoint');
      expect(res.statusCode).toBe(404);
    });
  });
});
