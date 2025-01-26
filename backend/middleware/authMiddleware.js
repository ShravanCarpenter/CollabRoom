const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust based on your model

const authMiddleware = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);  // Log the decoded token for inspection
        
        // Ensure userId is correctly being passed from the token's payload
        const userId = decoded.userId; // Check the userId in the decoded token
        if (!userId) {
            return res.status(400).json({ message: 'UserId is missing from token' });
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        req.user = user;  // Attach user to the request object
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(401).json({ message: 'Unauthorized access' });
    }
};

module.exports = authMiddleware;
