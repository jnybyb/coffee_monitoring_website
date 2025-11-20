const bcrypt = require('bcryptjs');
const BaseController = require('./baseController');
const { signToken, findAdminByUsername } = require('../utils/auth');

class AuthController extends BaseController {
  static login = this.asyncHandler(async (req, res) => {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const admin = await findAdminByUsername(username);
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatches = await bcrypt.compare(String(password), String(admin.password_hash));
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken({ 
      id: admin.id, 
      username: admin.username, 
      role: admin.role 
    });

    return res.json({ 
      token, 
      user: { 
        id: admin.id, 
        username: admin.username, 
        role: admin.role
      } 
    });
  });

  static me = this.asyncHandler(async (req, res) => {
    // If authenticate middleware sets req.user
    const user = req.user;
    return res.json({ user });
  });

  static logout = this.asyncHandler(async (req, res) => {
    return res.json({ message: 'Logged out successfully' });
  });
}

module.exports = AuthController;


