const express = require('express');
const dotenv = require('dotenv');
const mongoose = require("mongoose");
const cors = require('cors');
const http = require("http");
const connectDB = require('./config/db');
const { userJoin, getUsers, userLeave } = require("./utils/user");
const socketIO = require("socket.io");
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser');

// Routes imports
const authRoutes = require('./routes/authRoutes');
const meetingRoutes = require('./routes/meetingRoutes');
const taskRoutes = require('./routes/taskRoutes');
const chatRoutes = require('./routes/chatRoutes');
const documentRoutes = require('./routes/documentRoutes');

dotenv.config();

// Validate essential environment variables
if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not defined in environment variables');
    process.exit(1);
}

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: ["http://localhost:5173"],
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Increase size limits to 100MB
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({
    limit: '100mb',
    extended: true,
    parameterLimit: 50000
}));

// Add body-parser with increased limits
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({
    limit: '100mb',
    extended: true,
    parameterLimit: 50000
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/documents', documentRoutes);

// Track users in rooms
const userRooms = new Map(); // Map to track which rooms a socket is in
const whiteboardStates = new Map(); // Store whiteboard states by room ID

// Socket.io connection handler
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle joining a room with userId
    socket.on('joinRoom', (data) => {
        // Handle both old format (string) and new format (object)
        let roomId, userId;

        if (typeof data === 'object') {
            roomId = data.roomId;
            userId = data.userId;
            console.log(`User ${userId} (Socket ${socket.id}) joined room: ${roomId}`);
        } else {
            roomId = data;
            console.log(`Socket ${socket.id} joined room: ${roomId} (legacy format)`);
        }

        // Join the room
        socket.join(roomId);

        // Track this socket's room for later use
        if (!userRooms.has(socket.id)) {
            userRooms.set(socket.id, new Set());
        }
        userRooms.get(socket.id).add(roomId);
    });

    // Handle leaving a room
    socket.on('leaveRoom', (data) => {
        // Handle both old format (string) and new format (object)
        let roomId;

        if (typeof data === 'object') {
            roomId = data.roomId;
            const userId = data.userId;
            console.log(`User ${userId} (Socket ${socket.id}) left room: ${roomId}`);
        } else {
            roomId = data;
            console.log(`Socket ${socket.id} left room: ${roomId} (legacy format)`);
        }

        // Leave the room
        socket.leave(roomId);

        // Update tracking
        if (userRooms.has(socket.id)) {
            userRooms.get(socket.id).delete(roomId);
        }
    });

    // Handle sending messages
    socket.on('sendMessage', (message) => {
        console.log('Received message:', message);

        // Ensure message is valid
        if (!message || !message.roomId) {
            console.error('Invalid message format:', message);
            return;
        }

        // Make sure senderId is preserved
        if (!message.senderId) {
            console.warn('Message missing senderId:', message);
        }

        // Broadcast to everyone in the room including sender
        io.to(message.roomId).emit('receiveMessage', message);
        console.log(`Message broadcasted to room ${message.roomId}`);
    });

    // Document collaboration events
    socket.on('join-document', (documentId) => {
        socket.join(documentId);
        // Notify others that a new user joined
        socket.to(documentId).emit('user-joined', socket.id);
    });

    socket.on('document-change', ({ id, content }) => {
        // Broadcast changes to all clients in the room except sender
        socket.to(id).emit('document-change', content);
    });

    socket.on('leave-document', (documentId) => {
        socket.leave(documentId);
        // Notify others that user left
        socket.to(documentId).emit('user-left', socket.id);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);

        // Leave all rooms this socket was in
        if (userRooms.has(socket.id)) {
            const rooms = userRooms.get(socket.id);
            rooms.forEach(roomId => {
                socket.leave(roomId);
                console.log(`Socket ${socket.id} left room ${roomId} due to disconnect`);
            });
            userRooms.delete(socket.id);
        }
    });
});

app.get('/', (req, res) => {
    res.send('CollabRoom Database is running...');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
