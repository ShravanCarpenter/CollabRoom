const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register User
const registerUser = async (req, res) => {
  try {
    // Log the entire request body
    console.log('Registration request body:', JSON.stringify(req.body, null, 2));
    
    const { name, email, mobile, mode, password } = req.body;

    // Log the extracted data
    console.log('Extracted registration data:', {
      name,
      email,
      mobile,
      mode,
      passwordLength: password ? password.length : 0
    });

    // Validate required fields
    const missingFields = [];
    if (!name) missingFields.push('name');
    if (!email) missingFields.push('email');
    if (!mobile) missingFields.push('mobile');
    if (!password) missingFields.push('password');

    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields);
      return res.status(400).json({ 
        error: "All fields are required!", 
        missingFields 
      });
    }

    // Validate mode
    const validModes = ['student', 'educator'];
    if (mode && !validModes.includes(mode)) {
      console.log('Invalid mode value:', mode);
      return res.status(400).json({
        error: "Invalid mode value",
        validModes
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists with email:', email);
      return res.status(400).json({ error: "User already registered!" });
    }

    // Hash password
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

    // Create user object
    const userData = {
      name,
      email,
      mobile,
      mode: mode || 'student',
      password: hashedPassword
    };

    console.log('Creating new user with data:', {
      ...userData,
      password: '[HIDDEN]'
    });

    // Create and validate user instance
    const newUser = new User(userData);
    
    // Validate the user object
    const validationError = newUser.validateSync();
    if (validationError) {
      console.error('Mongoose validation error:', JSON.stringify(validationError, null, 2));
      return res.status(400).json({ 
        error: "Validation failed", 
        details: validationError.errors 
      });
    }

    // Save user to database
    console.log('Attempting to save user to database...');
    const savedUser = await newUser.save();
    console.log('User saved successfully with ID:', savedUser._id);

    // Send success response
    res.status(201).json({ 
      message: "Registration successful!",
      userId: savedUser._id 
    });

  } catch (err) {
    // Detailed error logging
    console.error('Registration Error:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: err.code,
      errors: err.errors,
      keyPattern: err.keyPattern,
      keyValue: err.keyValue
    });

    // Handle specific error cases
    if (err.code === 11000) {
      return res.status(400).json({ 
        error: "Email already registered!",
        field: Object.keys(err.keyPattern)[0]
      });
    }

    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: "Validation Error",
        details: Object.values(err.errors).map(e => e.message)
      });
    }
    
    // Generic error response
    res.status(500).json({ 
      error: "Internal Server Error!", 
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    console.log('Login attempt:', { email: req.body.email });
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log('Missing login credentials');
      return res.status(400).json({ 
        error: "Email and password are required" 
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ 
        error: "No account found with this email" 
      });
    }

    // Compare password
    console.log('Comparing passwords for user:', email);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Invalid password for user:', email);
      return res.status(400).json({ 
        error: "Incorrect password" 
      });
    }

    // Generate JWT token
    console.log('Generating token for user:', email);
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1h" }
    );

    console.log('Login successful for user:', email);
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        mode: user.mode 
      } 
    });
  } catch (error) {
    console.error('Login Error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      error: "Server error during login",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get Profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update Profile 
const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findByIdAndUpdate(req.user.id, { name, email }, { new: true });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update Password (Logged-in User)
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id; // Extract user ID from the token

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the current password matches
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "❌ Incorrect current password" });
    }

    // Hash the new password and update
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "✅ Password updated successfully!" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Export all functions correctly
module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  updatePassword
};