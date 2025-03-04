const express = require("express");
const { 
    registerUser, 
    loginUser, 
    getProfile, 
    updateProfile, 
    updatePassword 
} = require("../controllers/authController"); 
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");

const router = express.Router();

// User Authentication Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile/update", authMiddleware, updateProfile);
router.post("/update-password", authMiddleware, updatePassword);

// Get all users (for chat room creation)
router.get("/users", authMiddleware, async (req, res) => {
    try {
        const users = await User.find({}, 'name email mode');
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

module.exports = router;