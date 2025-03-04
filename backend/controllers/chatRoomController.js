const ChatRoom = require('../models/ChatRoom');
const User = require('../models/User');
const Message = require('../models/Message');
const { v4: uuidv4 } = require('uuid');

// Create a new chat room
exports.createChatRoom = async (req, res) => {
  try {
    const { name } = req.body;
    const roomId = uuidv4(); // Generate a unique room ID
    const chatRoom = new ChatRoom({ name, roomId });
    await chatRoom.save();
    res.status(201).json({ roomId, message: 'Chat room created successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create chat room' });
  }
};

// Fetch messages for a room
exports.getMessages = async (req, res) => {
  try {
      const messages = await Message.find({ roomId: req.params.roomId }).populate('sender', 'username');
      res.json(messages);
  } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve messages' });
  }
};

// Join a chat room
exports.joinChatRoom = async (req, res) => {
  const { roomId, userId } = req.body;

  if (!roomId || !userId) {
    return res.status(400).json({ error: 'roomId and userId are required' });
  }

  try {
    // Find the room
    const room = await ChatRoom.findOne({ roomId }).populate('participants');
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add user to the room's participants (if not already added)
    await ChatRoom.updateOne(
      { roomId },
      { $addToSet: { participants: userId } }
    );

    res.status(200).json({ message: 'Joined room successfully', room });
  } catch (err) {
    console.error('Error joining room:', err);
    res.status(500).json({ error: 'Failed to join room' });
  }
};