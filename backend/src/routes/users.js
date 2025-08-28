const express = require('express');
const controller = require('../controllers/userController');
const { authMiddleware, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

// Lấy danh sách tất cả users (chỉ admin và leader)
router.get('/', authMiddleware, authorizeRoles('admin', 'leader'), controller.getAllUsers);

// Lấy thông tin user theo ID
router.get('/:id', authMiddleware, controller.getUserById);

module.exports = router;
