const express = require("express");
const { 
    registerUser, 
    loginUser, 
    getProfile, 
    updateProfile, 
    updatePassword 
} = require("../controllers/authController"); 
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// User Authentication Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile/update", authMiddleware, updateProfile);
router.post("/update-password", authMiddleware, updatePassword);

module.exports = router;