const { Project, User } = require('../models');
const Log = require('../models/Log');

// Tạo project mới
exports.createProject = async (req, res) => {
  try {
    const { name, description, deadline, members } = req.body;
    if (req.user.role !== 'admin' && req.user.role !== 'leader') {
      return res.status(403).json({ message: 'Không có quyền tạo dự án' });
    }
    let status = 'not_started';
    if (deadline && new Date(deadline).setHours(0,0,0,0) <= new Date().setHours(0,0,0,0)) {
      status = 'in_progress';
    }
    const project = new Project({
      name,
      description,
      deadline,
      leader: req.user._id,
      members: members || [req.user._id],
      status,
    });
    await project.save();
    // Ghi log
    await Log.create({
      user: req.user._id,
      action: 'create_project',
      targetType: 'Project',
      targetId: project._id,
      detail: `Tạo dự án "${project.name}"`
    });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Lấy danh sách project
exports.getProjects = async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'admin') {
      projects = await Project.find().populate('leader members', 'name email role');
    } else {
      projects = await Project.find({ $or: [
        { leader: req.user._id },
        { members: req.user._id }
      ] }).populate('leader members', 'name email role');
    }
    // Tự động cập nhật status thành 'done' nếu deadline đã qua
    const today = new Date().setHours(0,0,0,0);
    for (const project of projects) {
      if (project.deadline && new Date(project.deadline).setHours(0,0,0,0) < today && project.status !== 'done') {
        project.status = 'done';
        await project.save();
      }
    }
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Lấy chi tiết project
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('leader members', 'name email role');
    if (!project) return res.status(404).json({ message: 'Không tìm thấy dự án' });
    // Chỉ thành viên hoặc admin mới xem được
    if (req.user.role !== 'admin' && !project.members.includes(req.user._id) && !project.leader.equals(req.user._id)) {
      return res.status(403).json({ message: 'Không có quyền truy cập dự án này' });
    }
    // Tự động cập nhật status thành 'done' nếu deadline đã qua
    const today = new Date().setHours(0,0,0,0);
    if (project.deadline && new Date(project.deadline).setHours(0,0,0,0) < today && project.status !== 'done') {
      project.status = 'done';
      await project.save();
    }
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Sửa project
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Không tìm thấy dự án' });
    // Chỉ admin hoặc leader của dự án mới được sửa
    if (req.user.role !== 'admin' && !project.leader.equals(req.user._id)) {
      return res.status(403).json({ message: 'Không có quyền sửa dự án này' });
    }
    const { name, description, status, deadline, members } = req.body;
    if (name) project.name = name;
    if (description) project.description = description;
    if (status) project.status = status; // Cho phép chỉnh status thủ công
    if (deadline) project.deadline = deadline;
    if (members) project.members = members;
    await project.save();
    // Ghi log
    await Log.create({
      user: req.user._id,
      action: 'update_project',
      targetType: 'Project',
      targetId: project._id,
      detail: `Cập nhật dự án "${project.name}"`
    });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Xóa project
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Không tìm thấy dự án' });
    // Chỉ admin hoặc leader của dự án mới được xóa
    if (req.user.role !== 'admin' && !project.leader.equals(req.user._id)) {
      return res.status(403).json({ message: 'Không có quyền xóa dự án này' });
    }
    await project.deleteOne();
    // Ghi log
    await Log.create({
      user: req.user._id,
      action: 'delete_project',
      targetType: 'Project',
      targetId: project._id,
      detail: `Xóa dự án "${project.name}"`
    });
    res.json({ message: 'Đã xóa dự án' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Lấy tổng số project
exports.getProjectCount = async (req, res) => {
  try {
    const count = await require('../models').Project.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
}; 