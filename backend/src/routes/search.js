const express = require('express');
const controller = require('../controllers/searchController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Tìm kiếm dự án
router.get('/projects', authMiddleware, controller.searchProjects);
// Tìm kiếm task
router.get('/tasks', authMiddleware, controller.searchTasks);
// Tìm kiếm user
router.get('/users', authMiddleware, controller.searchUsers);
// Lọc task
router.get('/tasks/filter', authMiddleware, controller.filterTasks);

module.exports = router; 