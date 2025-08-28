const express = require('express');
const controller = require('../controllers/statisticsController');
const { authMiddleware, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

// Thống kê tiến độ từng dự án
router.get('/project-progress', authMiddleware, authorizeRoles('admin', 'leader', 'member'), controller.projectProgress);
// Thống kê số task theo trạng thái của 1 dự án
router.get('/task-status/:projectId', authMiddleware, authorizeRoles('admin', 'leader', 'member'), controller.taskStatusByProject);
// Thống kê tiến độ từng thành viên trong dự án
router.get('/member-progress/:projectId', authMiddleware, authorizeRoles('admin', 'leader', 'member'), controller.memberProgressByProject);
router.get('/logs', authMiddleware, controller.getLogs);

module.exports = router; 