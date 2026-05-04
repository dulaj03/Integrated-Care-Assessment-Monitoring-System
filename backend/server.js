require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const { scheduleWeeklySundayNotification } = require('./utils/scheduler');

// Import DB connection
require('./config/db');
const { initSocket } = require('./utils/socket');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize socket.io
initSocket(server);

// ─── Middleware ───────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'https://icams.pandanlabs.net',
    process.env.ADMIN_URL || 'https://icams.pandanlabs.net/admin',
  ],
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// ─── Routes ──────────────────────────────────────────────────
const apiRouter = express.Router();

apiRouter.use('/auth', require('./routes/auth'));
apiRouter.use('/admin', require('./routes/admin'));
apiRouter.use('/doctor', require('./routes/doctor'));
apiRouter.use('/nurse', require('./routes/nurse'));
apiRouter.use('/health', require('./routes/health'));
apiRouter.use('/hospitals', require('./routes/hospitals'));
apiRouter.use('/notifications', require('./routes/notifications'));
apiRouter.use('/appointments', require('./routes/appointment'));
apiRouter.use('/doctors', require('./routes/doctors_info'));
apiRouter.use('/lab', require('./routes/lab'));
apiRouter.use('/public', require('./routes/public'));
apiRouter.use('/messages', require('./routes/message'));
apiRouter.use('/rounds', require('./routes/nurseRounds'));
apiRouter.use('/ai', require('./routes/ai'));
apiRouter.use('/ratings', require('./routes/rating'));
apiRouter.use('/platform-reviews', require('./routes/platformReview'));
apiRouter.use('/payment', require('./routes/payment'));
apiRouter.use('/availability', require('./routes/availability'));

// Mount the router on /api
apiRouter.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'uploads')));
app.use('/api', apiRouter);

// ─── Static Frontend Serving ──────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin', express.static(path.join(__dirname, 'public', 'admin')));

// Catch-all Middleware for React Routing
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('🔥 Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// ─── Start Server ─────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`🚀 I-CAMS Backend running on PORT ${PORT}`);
  // Start weekly Sunday doctor schedule reminder
  scheduleWeeklySundayNotification();
});
