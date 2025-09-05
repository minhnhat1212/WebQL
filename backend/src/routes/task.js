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
// Subtasks & Checklist
router.post('/:id/subtasks', authMiddleware, controller.addSubtask);
router.put('/:id/checklist', authMiddleware, controller.updateChecklist);
router.post('/:id/checklist/toggle', authMiddleware, controller.toggleChecklistItem);
router.post('/:id/recalculate-progress', authMiddleware, controller.recalculateProgress);
// Time tracking
router.post('/:id/timer/start', authMiddleware, controller.startTimer);
router.post('/:id/timer/stop', authMiddleware, controller.stopTimer);
router.post('/:id/time-entries', authMiddleware, controller.addTimeEntry);
router.get('/time-report', authMiddleware, controller.getTimeReport);
// Recurring generation
router.post('/:id/generate-recurring', authMiddleware, controller.generateRecurring);

module.exports = router; 