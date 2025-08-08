const User = require('../models/users');

const authController = {
  // POST /api/auth/login
  async login(req, res) {
    try {
      const { username } = req.body;

      if (!username || !username.trim()) {
        return res.status(400).json({ error: 'Username is required' });
      }

      const trimmedUsername = username.trim();

      // Create or find user
      const user = await User.create(trimmedUsername);
      
      // Set session
      req.session.username = trimmedUsername;
      
      console.log(`User logged in: ${trimmedUsername}`);
      res.json({ ok: true, username: trimmedUsername });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  },

  // GET /api/auth/session
  async getSession(req, res) {
    try {
      const username = req.session.username || null;
      res.json({ username });
    } catch (error) {
      console.error('Session error:', error);
      res.status(500).json({ error: 'Failed to get session' });
    }
  },

  // POST /api/auth/logout
  async logout(req, res) {
    try {
      const username = req.session.username;
      req.session.destroy((err) => {
        if (err) {
          console.error('Logout error:', err);
          return res.status(500).json({ error: 'Logout failed' });
        }
        
        console.log(`User logged out: ${username}`);
        res.json({ ok: true, message: 'Logged out successfully' });
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  }
};

module.exports = authController;
