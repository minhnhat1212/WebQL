const express = require('express');
const controller = require('../controllers/memberController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Lấy danh sách thành viên dự án
router.get('/:projectId', authMiddleware, controller.getMembers);
// Thêm thành viên vào dự án
router.post('/:projectId/add', authMiddleware, controller.addMember);
// Gỡ thành viên khỏi dự án
router.post('/:projectId/remove', authMiddleware, controller.removeMember);
// Đổi leader dự án
router.post('/:projectId/change-leader', authMiddleware, controller.changeLeader);

module.exports = router; 