const express = require('express');
const dotenv = require('dotenv');
const mongoose = require("mongoose");
const cors = require('cors');
const http = require("http");
const connectDB = require('./config/db');
const { userJoin, getUsers, userLeave } = require("./utils/user");
const socketIO = require("socket.io");
<<<<<<< HEAD

// Load environment variables first
=======
const { v4: uuidv4 } = require('uuid');
const documentRoutes = require('./routes/documentRoutes');

>>>>>>> a775899 (Document Editing Added)
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
<<<<<<< HEAD
        origin: ["http://localhost:5173"],
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors({
    origin: ["http://localhost:5173"],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

=======
        origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
        methods: ['GET', 'POST'],
        credentials: true
    },
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    allowUpgrades: true,
    pingTimeout: 10000,
    pingInterval: 5000,
    cookie: false,
    maxHttpBufferSize: 1e8 // 100MB
});

// Increase size limits to 100MB
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({
    limit: '100mb',
    extended: true,
    parameterLimit: 50000
}));

// Add body-parser with increased limits
const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({
    limit: '100mb',
    extended: true,
    parameterLimit: 50000
}));

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

>>>>>>> a775899 (Document Editing Added)
// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
const meetingRoutes = require('./routes/meetingRoutes');
app.use('/api/meetings', meetingRoutes);
const taskRoutes = require('./routes/taskRoutes');
app.use('/api/tasks', taskRoutes);
const chatRoutes = require('./routes/chatRoutes');
app.use('/api/chat', chatRoutes);
<<<<<<< HEAD
=======
app.use('/api/documents', documentRoutes);
>>>>>>> a775899 (Document Editing Added)

// Track users in rooms
const userRooms = new Map(); // Map to track which rooms a socket is in

<<<<<<< HEAD
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
=======
// Add this at the top with other imports
const whiteboardStates = new Map(); // Store whiteboard states by room ID

// Add connection validation middleware
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (token) {
        return next();
    }
    return next(new Error('Authentication error'));
});

// WebSocket connection handler
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on('sendMessage', (message) => {
        if (message.roomId) {
            io.to(message.roomId).emit('receiveMessage', message);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

io.on('connection', (socket) => {
    console.log('User connected');

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

    socket.on('disconnect', () => {
        console.log('User disconnected');
>>>>>>> a775899 (Document Editing Added)
    });
});

app.get('/', (req, res) => {
    res.send('CollabRoom Database is running...');
});

<<<<<<< HEAD
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
=======
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        websocket: io.engine.clientsCount !== undefined,
        timestamp: new Date().toISOString()
    });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`WebSocket path: /socket.io`);
    console.log(`CORS allowed origins: http://localhost:5173, http://127.0.0.1:5173`);
});
>>>>>>> a775899 (Document Editing Added)
