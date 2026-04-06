const jwt = require('jsonwebtoken');

// Middleware: Verify any valid token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

// Middleware: Verify admin only
const verifyAdminToken = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }
    next();
  });
};

// Middleware: Verify patient only
const verifyPatientToken = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ error: 'Access denied. Patients only.' });
    }
    next();
  });
};

// Middleware: Verify doctor only
const verifyDoctorToken = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ error: 'Access denied. Doctors only.' });
    }
    next();
  });
};

// Middleware: Verify nurse only
const verifyNurseToken = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role !== 'nurse') {
      return res.status(403).json({ error: 'Access denied. Nurses only.' });
    }
    next();
  });
};

// Middleware: Verify hospital only
const verifyHospitalToken = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role !== 'hospital') {
      return res.status(403).json({ error: 'Access denied. Hospitals only.' });
    }
    next();
  });
};

// Middleware: Optional verification (for guests or logged users)
const verifyOptionalToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    req.user = null; // Even if token is bad, we treat as guest
    next();
  }
};

module.exports = { 
  verifyToken, 
  verifyAdminToken,
  verifyPatientToken,
  verifyDoctorToken,
  verifyNurseToken,
  verifyHospitalToken,
  verifyOptionalToken
};
