const express = require('express');
const controller = require('../controllers/commentController');
const { authMiddleware, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

// Thêm bình luận vào task
router.post('/', authMiddleware, authorizeRoles('admin', 'leader', 'member'), controller.addComment);
// Xóa bình luận
router.delete('/:id', authMiddleware, controller.deleteComment);
// Lấy comment theo task
router.get('/task/:taskId', authMiddleware, controller.getCommentsByTask);

module.exports = router; 