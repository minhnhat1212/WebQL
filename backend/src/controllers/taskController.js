const { Task, Project, User } = require('../models');
const multer = require('multer');
const path = require('path');
const { createNotification } = require('./notificationController');
const Log = require('../models/Log');

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/tasks'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Tạo task mới
exports.createTask = async (req, res) => {
  try {
    const { projectId, name, description, deadline, assignees } = req.body;
    // Chỉ leader hoặc admin mới được tạo task
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Không tìm thấy dự án' });
    if (req.user.role !== 'admin' && !project.leader.equals(req.user._id)) {
      return res.status(403).json({ message: 'Không có quyền tạo task trong dự án này' });
    }
    const task = new Task({
      project: projectId,
      name,
      description,
      deadline,
      assignees,
    });
    await task.save();
    // Gửi thông báo cho từng assignee
    if (assignees && Array.isArray(assignees)) {
      for (const userId of assignees) {
        await createNotification({
          userId,
          content: `Bạn vừa được giao task mới: ${name}`
        });
      }
    }
    // Ghi log
    await Log.create({
      user: req.user._id,
      action: 'create_task',
      targetType: 'Task',
      targetId: task._id,
      detail: `Tạo task "${task.name}" trong dự án ${project.name}`
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Lấy tất cả task mà user có quyền xem
exports.getAllTasks = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    
    // Nếu có filter theo status
    if (status) {
      query.status = status;
    }
    
    let tasks;
    
    // Nếu là admin, lấy tất cả task
    if (req.user.role === 'admin') {
      tasks = await Task.find(query)
        .populate('assignees', 'name email role')
        .populate('project', 'name')
        .sort({ createdAt: -1 });
    } else {
      // Nếu không phải admin, chỉ lấy task từ các project mà user là thành viên hoặc leader
      const userProjects = await Project.find({
        $or: [
          { leader: req.user._id },
          { members: req.user._id }
        ]
      });
      
      const projectIds = userProjects.map(p => p._id);
      query.project = { $in: projectIds };
      
      tasks = await Task.find(query)
        .populate('assignees', 'name email role')
        .populate('project', 'name')
        .sort({ createdAt: -1 });
    }
    
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Lấy danh sách task theo dự án
exports.getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Không tìm thấy dự án' });
    // Chỉ thành viên, leader, admin mới xem được
    if (
      req.user.role !== 'admin' &&
      !project.leader.equals(req.user._id) &&
      !project.members.includes(req.user._id)
    ) {
      return res.status(403).json({ message: 'Không có quyền xem task của dự án này' });
    }
    const tasks = await Task.find({ project: projectId })
      .populate('assignees', 'name email role')
      .populate('project', 'name');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Lấy chi tiết task
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignees', 'name email role')
      .populate('files.uploadedBy', 'name email');
    if (!task) return res.status(404).json({ message: 'Không tìm thấy task' });
    const project = await Project.findById(task.project);
    if (!project) return res.status(404).json({ message: 'Không tìm thấy project của task' });
    // Nếu là admin thì luôn trả về task
    if (req.user.role === 'admin') {
      return res.json(task);
    }
    const userId = req.user._id.toString();
    const assigneeIds = (task.assignees || []).map(u => (u._id ? u._id.toString() : u.toString()));
    const memberIds = (project.members || []).map(m => m._id ? m._id.toString() : m.toString());
    const isAssignee = assigneeIds.includes(userId);
    const isMember = memberIds.includes(userId);
    const isLeader = project.leader && project.leader.toString() === userId;
    if (!isLeader && !isMember && !isAssignee) {
      return res.status(403).json({ message: 'Không có quyền xem task này' });
    }
    res.json(task);
  } catch (err) {
    console.error('ERROR in getTaskById:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Sửa task
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Không tìm thấy task' });
    const project = await Project.findById(task.project);
    // Chỉ leader, admin hoặc người được giao task mới được sửa
    if (
      req.user.role !== 'admin' &&
      !project.leader.equals(req.user._id) &&
      !(task.assignees && task.assignees.map(id => id.toString()).includes(req.user._id.toString()))
    ) {
      return res.status(403).json({ message: 'Không có quyền sửa task này' });
    }
    const oldAssignees = task.assignees ? task.assignees.map(id => id.toString()) : [];
    const { name, description, status, progress, deadline, assignees: newAssignees } = req.body;
    if (name) task.name = name;
    if (description) task.description = description;
    if (status) task.status = status;
    if (progress !== undefined) task.progress = progress;
    if (deadline) task.deadline = deadline;
    if (newAssignees) task.assignees = newAssignees;
    await task.save();
    // Gửi thông báo cho các assignee mới được thêm
    if (newAssignees) {
      const added = newAssignees.filter(id => !oldAssignees.includes(id));
      for (const userId of added) {
        await createNotification({
          userId,
          content: `Bạn vừa được giao task mới: ${task.name}`
        });
      }
    }
    // Ghi log
    await Log.create({
      user: req.user._id,
      action: 'update_task',
      targetType: 'Task',
      targetId: task._id,
      detail: `Cập nhật task "${task.name}"`
    });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Xóa task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Không tìm thấy task' });
    const project = await Project.findById(task.project);
    // Chỉ leader, admin hoặc người được giao task mới được xóa
    if (
      req.user.role !== 'admin' &&
      !project.leader.equals(req.user._id) &&
      !(task.assignees && task.assignees.map(id => id.toString()).includes(req.user._id.toString()))
    ) {
      return res.status(403).json({ message: 'Không có quyền xóa task này' });
    }
    await task.deleteOne();
    // Ghi log
    await Log.create({
      user: req.user._id,
      action: 'delete_task',
      targetType: 'Task',
      targetId: task._id,
      detail: `Xóa task "${task.name}"`
    });
    res.json({ message: 'Đã xóa task' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// API: Upload nhiều file cho task
exports.uploadFiles = [
  upload.array('files', 10), // tối đa 10 file/lần
  async (req, res) => {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) return res.status(404).json({ message: 'Không tìm thấy task' });
      const project = await Project.findById(task.project);
      // Chỉ assignee, leader, admin mới được upload
      if (
        req.user.role !== 'admin' &&
        !project.leader.equals(req.user._id) &&
        !(task.assignees && task.assignees.map(id => id.toString()).includes(req.user._id.toString()))
      ) {
        return res.status(403).json({ message: 'Không có quyền upload file cho task này' });
      }
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'Chưa chọn file upload' });
      }
      // Lưu thông tin file vào task.files
      req.files.forEach(file => {
        task.files.push({
          name: file.originalname,
          url: '/uploads/tasks/' + file.filename,
          uploadedAt: new Date(),
          uploadedBy: req.user._id
        });
      });
      await task.save();
      res.json({ message: 'Đã upload file', files: task.files });
    } catch (err) {
      res.status(500).json({ message: 'Lỗi server' });
    }
  }
];

// Lấy tổng số task
exports.getTaskCount = async (req, res) => {
  try {
    let count;
    if (req.user.role === 'admin') {
      count = await Task.countDocuments();
    } else {
      // Đếm task thuộc các project mà user là leader hoặc member hoặc task được giao cho user
      const projects = await Project.find({
        $or: [
          { leader: req.user._id },
          { members: req.user._id }
        ]
      }).distinct('_id');
      count = await Task.countDocuments({
        $or: [
          { project: { $in: projects } },
          { assignees: req.user._id }
        ]
      });
    }
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
}; 