const express = require('express');
const AuthController = require('../controllers/authController');
const { authenticate, getServerStartupTime } = require('../utils/auth');

const router = express.Router();

router.post('/login', AuthController.login);
router.get('/me', authenticate, AuthController.me);
router.post('/logout', authenticate, AuthController.logout);
router.get('/server-startup', (req, res) => {
  res.json({ 
    serverStartup: getServerStartupTime(),
    timestamp: new Date().toISOString()
  });
});

module.exports = router;


