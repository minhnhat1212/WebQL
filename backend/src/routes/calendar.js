const express = require('express');
const controller = require('../controllers/calendarController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Lấy task theo ngày
router.get('/day', authMiddleware, controller.getTasksByDay);
// Lấy task theo tuần
router.get('/week', authMiddleware, controller.getTasksByWeek);
// Lấy task theo tháng
router.get('/month', authMiddleware, controller.getTasksByMonth);
// Lấy tổng số lịch
router.get('/count', authMiddleware, controller.getCalendarCount);

module.exports = router; 