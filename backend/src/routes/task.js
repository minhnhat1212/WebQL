const express = require('express');
const controller = require('../controllers/taskController');
const { authMiddleware, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

// Tạo task mới
router.post('/', authMiddleware, authorizeRoles('admin', 'leader'), controller.createTask);
// Lấy tổng số task (đặt trước route động)
router.get('/count', authMiddleware, controller.getTaskCount);
// Lấy tất cả task mà user có quyền xem
router.get('/', authMiddleware, controller.getAllTasks);
// Lấy danh sách task theo dự án
router.get('/project/:projectId', authMiddleware, controller.getTasksByProject);
// Lấy chi tiết task
router.get('/:id', authMiddleware, controller.getTaskById);
// Sửa task
router.put('/:id', authMiddleware, controller.updateTask);
// Xóa task
router.delete('/:id', authMiddleware, controller.deleteTask);
// Upload file cho task
router.post('/:id/upload-files', authMiddleware, controller.uploadFiles);

module.exports = router; 