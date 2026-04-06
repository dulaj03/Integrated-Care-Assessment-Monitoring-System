const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
require('dotenv').config();

// Import DB connection (runs the test on startup)
const pool = require('./config/db');
const { initSocket } = require('./utils/socket');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize socket.io with the HTTP server
initSocket(server);

// ─── Middleware ───────────────────────────────────────────────
app.use(helmet());                          // Security headers
app.use(cors({
  origin: [
    'http://localhost:5173',                  // Frontend
    'http://localhost:5174',                  // Admin panel
  ]
}));
app.use(morgan('dev'));                      // HTTP request logs
app.use(express.json());                    // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (license documents, etc.)
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// ─── Routes (add more as we build them) ───────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/doctor', require('./routes/doctor'));
app.use('/api/nurse', require('./routes/nurse'));
app.use('/api/health', require('./routes/health'));
app.use('/api/hospitals', require('./routes/hospitals'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/appointments', require('./routes/appointment'));
app.use('/api/doctors', require('./routes/doctors_info'));
app.use('/api/lab', require('./routes/lab'));
app.use('/api/public', require('./routes/public'));
app.use('/api/messages', require('./routes/message'));
app.use('/api/rounds', require('./routes/nurseRounds'));

// ─── Health Check ─────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: '✅ I-CAMS API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// ─── Start Server ─────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`🚀 I-CAMS Backend running on http://localhost:${PORT}`);
});
