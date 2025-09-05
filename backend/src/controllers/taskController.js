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

// WIP and dependency helpers
async function checkWipLimit(projectId, targetStatus, excludingTaskId = null) {
  const project = await Project.findById(projectId);
  if (!project) return { ok: false, message: 'Không tìm thấy dự án' };
  const limits = project.wipLimits || {};
  const limit = limits[targetStatus];
  if (!limit || limit <= 0) return { ok: true };
  const filter = { project: projectId, status: targetStatus };
  if (excludingTaskId) filter._id = { $ne: excludingTaskId };
  const count = await Task.countDocuments(filter);
  if (count >= limit) return { ok: false, message: `Vượt quá WIP limit cho cột ${targetStatus}` };
  return { ok: true };
}

async function ensureDependenciesSatisfied(task, targetStatus) {
  if (!task.dependencies || task.dependencies.length === 0) return { ok: true };
  if (targetStatus === 'doing' || targetStatus === 'done') {
    const deps = await Task.find({ _id: { $in: task.dependencies } }).select('status');
    const allDone = deps.every(d => d.status === 'done');
    if (!allDone) return { ok: false, message: 'Chưa hoàn thành task phụ thuộc' };
  }
  return { ok: true };
}

async function detectCircularDependency(taskId, dependencies) {
  const visited = new Set();
  const stack = [...dependencies];
  while (stack.length) {
    const current = stack.pop();
    const currentId = current.toString();
    if (currentId === taskId.toString()) return true;
    if (visited.has(currentId)) continue;
    visited.add(currentId);
    const t = await Task.findById(currentId).select('dependencies');
    if (t && t.dependencies && t.dependencies.length) {
      for (const dep of t.dependencies) stack.push(dep);
    }
  }
  return false;
}

// Helper: update parent task progress based on subtasks and checklist
async function updateParentProgressIfNeeded(taskId) {
  const task = await Task.findById(taskId).populate('subtasks');
  if (!task) return;
  // Calculate checklist progress
  let checklistProgress = null;
  if (task.checklist && task.checklist.length > 0) {
    const doneCount = task.checklist.filter(i => i.done).length;
    checklistProgress = Math.round((doneCount / task.checklist.length) * 100);
  }
  // Calculate subtasks progress
  let subtasksProgress = null;
  if (task.subtasks && task.subtasks.length > 0) {
    const completed = task.subtasks.filter(st => st.status === 'done').length;
    subtasksProgress = Math.round((completed / task.subtasks.length) * 100);
  }
  const parts = [checklistProgress, subtasksProgress].filter(v => v !== null);
  if (parts.length > 0) {
    const newProgress = Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
    if (task.progress !== newProgress) {
      task.progress = newProgress;
      // Auto set status based on progress
      if (newProgress === 100) task.status = 'done';
      else if (newProgress > 0 && task.status === 'todo') task.status = 'doing';
      await task.save();
    }
  }
  if (task.parentTask) {
    await updateParentProgressIfNeeded(task.parentTask);
  }
}

// Tạo task mới
exports.createTask = async (req, res) => {
  try {
    const {
      projectId, name, description, deadline, assignees,
      priority, sla, parentTask, checklist, recurring, dependencies
    } = req.body;
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
      priority,
      sla,
      parentTask: parentTask || null,
      checklist: Array.isArray(checklist) ? checklist : [],
      recurring,
      dependencies,
    });
    await task.save();
    // Validate circular dependencies
    if (Array.isArray(dependencies) && dependencies.length) {
      const hasCycle = await detectCircularDependency(task._id, dependencies);
      if (hasCycle) {
        await task.deleteOne();
        return res.status(400).json({ message: 'Phụ thuộc tạo vòng lặp' });
      }
    }
    // If creating as subtask, attach to parent
    if (parentTask) {
      await Task.findByIdAndUpdate(parentTask, { $addToSet: { subtasks: task._id } });
      await updateParentProgressIfNeeded(parentTask);
    }
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
    const { name, description, status, progress, deadline, assignees: newAssignees, priority, sla, dependencies } = req.body;
    if (name) task.name = name;
    if (description) task.description = description;
    if (status) {
      const depsOk = await ensureDependenciesSatisfied(task, status);
      if (!depsOk.ok) return res.status(400).json({ message: depsOk.message });
      const wipOk = await checkWipLimit(task.project, status, task._id);
      if (!wipOk.ok) return res.status(400).json({ message: wipOk.message });
      task.status = status;
    }
    if (progress !== undefined) task.progress = progress;
    if (deadline) task.deadline = deadline;
    if (newAssignees) task.assignees = newAssignees;
    if (priority) task.priority = priority;
    if (sla) task.sla = sla;
    if (dependencies) {
      const hasCycle = await detectCircularDependency(task._id, dependencies);
      if (hasCycle) return res.status(400).json({ message: 'Phụ thuộc tạo vòng lặp' });
      task.dependencies = dependencies;
    }
    await task.save();
    await updateParentProgressIfNeeded(task._id);
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
    // If this was a subtask, remove from parent
    if (task.parentTask) {
      await Task.findByIdAndUpdate(task.parentTask, { $pull: { subtasks: task._id } });
      await updateParentProgressIfNeeded(task.parentTask);
    }
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

// Thêm subtask cho task cha đã tồn tại
exports.addSubtask = async (req, res) => {
  try {
    const parentId = req.params.id;
    const { name, description, assignees, deadline, priority } = req.body;
    const parent = await Task.findById(parentId);
    if (!parent) return res.status(404).json({ message: 'Không tìm thấy task cha' });
    const project = await Project.findById(parent.project);
    if (
      req.user.role !== 'admin' &&
      !project.leader.equals(req.user._id) &&
      !(parent.assignees && parent.assignees.map(id => id.toString()).includes(req.user._id.toString()))
    ) {
      return res.status(403).json({ message: 'Không có quyền thêm subtask' });
    }
    const subtask = await Task.create({
      project: parent.project,
      name,
      description,
      deadline,
      assignees,
      priority,
      parentTask: parentId
    });
    await Task.findByIdAndUpdate(parentId, { $addToSet: { subtasks: subtask._id } });
    await updateParentProgressIfNeeded(parentId);
    res.status(201).json(subtask);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Time Tracking
exports.startTimer = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Không tìm thấy task' });
    if (task.timeTracking.isTimerRunning) return res.status(400).json({ message: 'Timer đang chạy' });
    task.timeTracking.isTimerRunning = true;
    task.timeTracking.timerStartedAt = new Date();
    await task.save();
    res.json(task.timeTracking);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.stopTimer = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Không tìm thấy task' });
    if (!task.timeTracking.isTimerRunning || !task.timeTracking.timerStartedAt) {
      return res.status(400).json({ message: 'Timer chưa chạy' });
    }
    const startedAt = new Date(task.timeTracking.timerStartedAt);
    const endedAt = new Date();
    const seconds = Math.max(0, Math.floor((endedAt - startedAt) / 1000));
    task.timeTracking.entries.push({ user: req.user._id, startedAt, endedAt, seconds });
    task.timeTracking.totalSeconds += seconds;
    task.timeTracking.isTimerRunning = false;
    task.timeTracking.timerStartedAt = null;
    await task.save();
    res.json(task.timeTracking);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.addTimeEntry = async (req, res) => {
  try {
    const { startedAt, endedAt, seconds, note, userId } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Không tìm thấy task' });
    const s = startedAt ? new Date(startedAt) : null;
    const e = endedAt ? new Date(endedAt) : null;
    let sec = seconds;
    if (!sec && s && e) sec = Math.max(0, Math.floor((e - s) / 1000));
    if (!sec) return res.status(400).json({ message: 'Thiếu thời lượng' });
    task.timeTracking.entries.push({ user: userId || req.user._id, startedAt: s || new Date(Date.now() - sec * 1000), endedAt: e || new Date(), seconds: sec, note: note || '' });
    task.timeTracking.totalSeconds += sec;
    await task.save();
    res.json(task.timeTracking);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.getTimeReport = async (req, res) => {
  try {
    const { projectId, userId, from, to } = req.query;
    const filter = {};
    if (projectId) filter.project = projectId;
    const tasks = await Task.find(filter).select('project timeTracking');
    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;
    const result = {};
    for (const t of tasks) {
      for (const entry of (t.timeTracking?.entries || [])) {
        if (userId && entry.user.toString() !== userId) continue;
        if (fromDate && entry.startedAt < fromDate) continue;
        if (toDate && entry.endedAt > toDate) continue;
        const key = `${t.project}:${entry.user}`;
        result[key] = (result[key] || 0) + entry.seconds;
      }
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Recurring generation (simple forward instances)
exports.generateRecurring = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Không tìm thấy task' });
    const rec = task.recurring || {};
    if (!rec.isRecurring) return res.status(400).json({ message: 'Task không cấu hình lặp' });
    const now = new Date();
    const start = rec.startDate ? new Date(rec.startDate) : now;
    const last = rec.lastGeneratedAt ? new Date(rec.lastGeneratedAt) : start;
    const end = rec.endDate ? new Date(rec.endDate) : null;
    const created = [];
    let next = new Date(last);
    const countToCreate = 3;
    while (created.length < countToCreate) {
      if (rec.frequency === 'daily') next.setUTCDate(next.getUTCDate() + (rec.interval || 1));
      else if (rec.frequency === 'weekly') next.setUTCDate(next.getUTCDate() + 7 * (rec.interval || 1));
      else if (rec.frequency === 'monthly') next.setUTCMonth(next.getUTCMonth() + (rec.interval || 1));
      if (end && next > end) break;
      const newTask = await Task.create({
        project: task.project,
        name: task.name,
        description: task.description,
        status: 'todo',
        progress: 0,
        assignees: task.assignees,
        deadline: task.deadline ? new Date(task.deadline) : null,
        priority: task.priority,
        sla: task.sla,
        checklist: task.checklist || [],
        dependencies: [],
        parentTask: null,
      });
      created.push(newTask);
    }
    task.recurring.lastGeneratedAt = new Date();
    await task.save();
    res.json({ created: created.map(t => t._id) });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Cập nhật checklist của task (replace)
exports.updateChecklist = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Không tìm thấy task' });
    const project = await Project.findById(task.project);
    if (
      req.user.role !== 'admin' &&
      !project.leader.equals(req.user._id) &&
      !(task.assignees && task.assignees.map(id => id.toString()).includes(req.user._id.toString()))
    ) {
      return res.status(403).json({ message: 'Không có quyền cập nhật checklist' });
    }
    const { checklist } = req.body;
    if (!Array.isArray(checklist)) return res.status(400).json({ message: 'Checklist không hợp lệ' });
    task.checklist = checklist;
    await task.save();
    await updateParentProgressIfNeeded(task._id);
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Toggle trạng thái checklist item
exports.toggleChecklistItem = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Không tìm thấy task' });
    const project = await Project.findById(task.project);
    if (
      req.user.role !== 'admin' &&
      !project.leader.equals(req.user._id) &&
      !(task.assignees && task.assignees.map(id => id.toString()).includes(req.user._id.toString()))
    ) {
      return res.status(403).json({ message: 'Không có quyền cập nhật checklist' });
    }
    const { itemId, done } = req.body;
    const item = (task.checklist || []).find(i => i.id === itemId);
    if (!item) return res.status(404).json({ message: 'Không tìm thấy checklist item' });
    item.done = done === undefined ? !item.done : !!done;
    await task.save();
    await updateParentProgressIfNeeded(task._id);
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Recalculate progress explicitly
exports.recalculateProgress = async (req, res) => {
  try {
    await updateParentProgressIfNeeded(req.params.id);
    const task = await Task.findById(req.params.id);
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};