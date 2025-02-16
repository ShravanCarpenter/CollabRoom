const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register User
const registerUser = async (req, res) => {
  try {
    const { name, email, mobile, mode, password } = req.body;

    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ error: "❌ All fields are required!" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "❌ User already registered!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, mobile, mode, password: hashedPassword });

    await newUser.save();
    res.status(201).json({ message: "✅ Registration successful!" });
  } catch (err) {
    console.error("🚨 Registration Error:", err.message, err.stack); // More detailed error logging
    res.status(500).json({ error: "❌ Internal Server Error!", details: err.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "❌ Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "❌ Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, mode: user.mode } });
  } catch (error) {
    res.status(500).json({ error: "❌ Server error" });
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
