const { Notification } = require('../models');

// Lấy danh sách thông báo của user
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Đánh dấu đã đọc thông báo
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, user: req.user._id });
    if (!notification) return res.status(404).json({ message: 'Không tìm thấy thông báo' });
    notification.read = true;
    await notification.save();
    res.json({ message: 'Đã đánh dấu đã đọc' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// (Hook mẫu) Tạo thông báo cho user
exports.createNotification = async ({ userId, content }) => {
  try {
    const notification = new Notification({ user: userId, content });
    await notification.save();
  } catch (err) {
    // Log lỗi nếu cần
  }
};

// Lấy tổng số notification
exports.getNotificationCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ user: req.user._id });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
}; 