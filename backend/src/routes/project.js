const express = require('express');
const controller = require('../controllers/projectController');
const { authMiddleware, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

// Tạo project
router.post('/', authMiddleware, authorizeRoles('admin', 'leader'), controller.createProject);
// Lấy danh sách project
router.get('/', authMiddleware, controller.getProjects);
// Lấy tổng số project
router.get('/count', authMiddleware, controller.getProjectCount);
// Lấy chi tiết project
router.get('/:id', authMiddleware, controller.getProjectById);
// Sửa project
router.put('/:id', authMiddleware, controller.updateProject);
// Xóa project
router.delete('/:id', authMiddleware, controller.deleteProject);

module.exports = router; 