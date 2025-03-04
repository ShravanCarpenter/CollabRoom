const express = require('express');
const router = express.Router();
const chatRoomController = require('../controllers/chatRoomController');
const messageController = require('../controllers/messageController');

// Chat Room Routes
router.post('/create', chatRoomController.createChatRoom);
router.post('/join', chatRoomController.joinChatRoom);

// Message Routes
router.post('/message/send', messageController.sendMessage);
router.get('/message/:roomId', messageController.getMessages);

router.get('/room/:roomId/participants', async (req, res) => {
    try {
      const { roomId } = req.params;
      // Query your database for users in this room
      const participants = await YourUserModel.find({ roomId: roomId });
      res.json(participants);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

module.exports = router;