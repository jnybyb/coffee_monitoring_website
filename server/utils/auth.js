const jwt = require('jsonwebtoken');
const { getPromisePool } = require('../config/database');
const BaseController = require('../controllers/baseController');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';
const JWT_EXPIRES_IN = '7d';

// Server startup timestamp - this will invalidate all existing tokens when server restarts
const SERVER_STARTUP_TIME = Date.now();

const signToken = (payload) => {
  return jwt.sign({
    ...payload,
    serverStartup: SERVER_STARTUP_TIME
  }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const verifyToken = (token) => {
  const decoded = jwt.verify(token, JWT_SECRET);
  
  // Check if token was issued before current server startup
  if (decoded.serverStartup !== SERVER_STARTUP_TIME) {
    throw new Error('Token invalid - server restarted');
  }
  
  return decoded;
};

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return BaseController.sendUnauthorized(res, 'Missing token');
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.message === 'Token invalid - server restarted') {
      return BaseController.sendUnauthorized(res, 'Session expired - please login again');
    }
    return BaseController.sendUnauthorized(res, 'Invalid or expired token');
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return BaseController.sendForbidden(res, 'Admin access required');
  }
  next();
};

const findAdminByUsername = async (username) => {
  const [rows] = await getPromisePool().query('SELECT admin_id AS id, username, password_hash, role FROM admins WHERE username = ?', [username]);
  return rows[0] || null;
};

// Export server startup time for potential client-side use
const getServerStartupTime = () => SERVER_STARTUP_TIME;

module.exports = {
  signToken,
  verifyToken,
  authenticate,
  requireAdmin,
  findAdminByUsername,
  getServerStartupTime
};


