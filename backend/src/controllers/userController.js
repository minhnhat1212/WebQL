const { User } = require('../models');

// Lấy danh sách tất cả users (không bao gồm password)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ name: 1 });
    res.json(users);
  } catch (err) {
    console.error('Error getting all users:', err);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách users' });
  }
};

// Lấy thông tin user theo ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy user' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Error getting user by ID:', err);
    res.status(500).json({ message: 'Lỗi server khi lấy thông tin user' });
  }
};
