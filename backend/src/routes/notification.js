const express = require('express');
const controller = require('../controllers/notificationController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Lấy danh sách thông báo của user
router.get('/', authMiddleware, controller.getNotifications);
// Đánh dấu đã đọc thông báo
router.put('/:id/read', authMiddleware, controller.markAsRead);
// Lấy tổng số notification
router.get('/count', authMiddleware, controller.getNotificationCount);

module.exports = router; 