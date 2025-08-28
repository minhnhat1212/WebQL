const express = require('express');
const controller = require('../controllers/chatController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Tạo hội thoại mới
router.post('/conversations', authMiddleware, controller.createConversation);
// Lấy danh sách hội thoại của user
router.get('/conversations', authMiddleware, controller.getConversations);
// Gửi tin nhắn
router.post('/messages', authMiddleware, controller.sendMessage);
// Lấy tin nhắn của hội thoại
router.get('/messages/:conversationId', authMiddleware, controller.getMessages);

module.exports = router; 