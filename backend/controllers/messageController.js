const Message = require('../models/Message');
const User = require('../models/User');

const getMessages = async (req, res) => {
  try {
      const messages = await Message.find({ roomId: req.params.roomId })
          .sort({ timestamp: 1 });
      
      res.json(messages);
  } catch (err) {
      console.error('Error getting messages:', err);
      res.status(500).json({ message: 'Server error' });
  }
};

// Send a message
const sendMessage = async (req, res) => {
  try {
      const { roomId, senderId, senderName, text } = req.body;
      
      // Validate required fields
      if (!roomId || !senderId || !text) {
          return res.status(400).json({ message: 'Missing required fields' });
      }
      
      // Create and save the message
      const newMessage = new Message({
          roomId,
          senderId,
          senderName,
          text,
          timestamp: new Date()
      });
      
      const savedMessage = await newMessage.save();
      console.log('Message saved:', savedMessage);
      
      res.status(201).json(savedMessage);
  } catch (err) {
      console.error('Error sending message:', err);
      res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
    getMessages,
    sendMessage
};
