const express = require('express');
const dotenv = require('dotenv');
const mongoose = require("mongoose");
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors()); 
app.use(express.json()); 

// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('CollabRoom Database is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
