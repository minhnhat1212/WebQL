const { Project, Task, User } = require('../models');
const mongoose = require('mongoose');

// Tìm kiếm dự án theo tên
exports.searchProjects = async (req, res) => {
  try {
    const { q } = req.query;
    const projects = await Project.find({ name: { $regex: q, $options: 'i' } });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Tìm kiếm task theo tên, mô tả
exports.searchTasks = async (req, res) => {
  try {
    const { q } = req.query;
    const tasks = await Task.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ],
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Tìm kiếm user theo tên, email
exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ],
    }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Lọc task theo trạng thái, deadline, assignee
exports.filterTasks = async (req, res) => {
  try {
    const { status, assignee, from, to } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (assignee && mongoose.Types.ObjectId.isValid(assignee)) filter.assignees = assignee;
    if (from || to) {
      filter.deadline = {};
      if (from) filter.deadline.$gte = new Date(from);
      if (to) filter.deadline.$lte = new Date(to);
    }
    const tasks = await Task.find(filter);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
}; 