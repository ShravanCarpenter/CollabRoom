const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register User
exports.registerUser = async (req, res) => {
  const { name, email, mode, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, mode, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, mode: user.mode } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.forgetPassword = async (req, res) => {
  res.json({ message: 'Password reset link sent to your email' });
};

exports.getProfile = async (req, res) => {
  try {
      // Get the token from request headers
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
          return res.status(401).json({ message: 'Access Denied. No token provided.' });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;  // Assuming the payload contains user ID

      // Find user in database
      const user = await User.findById(userId).select('-password');  // Exclude password from response

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Send user data as response
      res.status(200).json({
          name: user.name,
          mode: user.mode,
          image: user.image || null,  // Send image if available, otherwise null
      });

  } catch (error) {
      console.error('Error fetching profile:', error.message);
      res.status(500).json({ message: 'Server Error' });
  }
};
