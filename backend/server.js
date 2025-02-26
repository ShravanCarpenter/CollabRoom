const express = require('express');
const dotenv = require('dotenv');
const mongoose = require("mongoose");
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
})); 

app.use(express.json()); 

// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
const meetingRoutes = require('./routes/meetingRoutes');
app.use('/api/meetings', meetingRoutes);

app.get('/', (req, res) => {
  res.send('CollabRoom Database is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));