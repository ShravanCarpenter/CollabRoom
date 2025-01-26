const express = require('express');
const { registerUser, loginUser, forgetPassword, getProfile, updateProfile} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgetPassword);
router.get('/profile', authMiddleware, getProfile);
router.post('/update-profile', authMiddleware, updateProfile);

const TokenBlacklist = require('../models/TokenBlacklist');

router.post('/logout', async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) return res.status(400).json({ error: 'Token required for logout' });

  try {
    const blacklistedToken = new TokenBlacklist({ token });
    await blacklistedToken.save();

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
