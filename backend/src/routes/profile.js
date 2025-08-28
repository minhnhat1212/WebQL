const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authMiddleware } = require('../middlewares/authMiddleware');
const profileController = require('../controllers/profileController');

// Cấu hình multer cho upload avatar
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads/avatars/');
    // Tạo thư mục nếu không tồn tại
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Lấy thông tin profile
router.get('/', authMiddleware, profileController.getProfile);

// Cập nhật thông tin profile cơ bản
router.put('/', authMiddleware, profileController.updateProfile);

// Cập nhật avatar
router.put('/avatar', authMiddleware, (req, res, next) => {
  upload.single('avatar')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, profileController.updateAvatar);

// Thay đổi mật khẩu
router.put('/password', authMiddleware, profileController.changePassword);

module.exports = router;
