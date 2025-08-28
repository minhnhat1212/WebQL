const { Project, Task } = require('../models');
const Log = require('../models/Log');

// Thống kê tiến độ từng dự án (% hoàn thành)
exports.projectProgress = async (req, res) => {
  try {
    const projects = await Project.find({});
    const result = [];
    for (const project of projects) {
      const tasks = await Task.find({ project: project._id });
      const total = tasks.length;
      const done = tasks.filter(t => t.status === 'done').length;
      const percent = total === 0 ? 0 : Math.round((done / total) * 100);
      result.push({
        projectId: project._id,
        projectName: project.name,
        totalTasks: total,
        doneTasks: done,
        percentDone: percent,
      });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Thống kê số task theo trạng thái của 1 dự án
exports.taskStatusByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const tasks = await Task.find({ project: projectId });
    const statusCount = { todo: 0, doing: 0, done: 0 };
    tasks.forEach(t => {
      if (statusCount[t.status] !== undefined) statusCount[t.status]++;
    });
    res.json({ projectId, ...statusCount });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Thống kê tiến độ từng thành viên trong dự án
exports.memberProgressByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const tasks = await Task.find({ project: projectId }).populate('assignees', 'name email');
    const memberStats = {};
    tasks.forEach(t => {
      // Nếu có assignees (mới)
      if (t.assignees && t.assignees.length > 0) {
        t.assignees.forEach(user => {
          const id = user._id ? user._id.toString() : user.toString();
          if (!memberStats[id]) {
            memberStats[id] = { name: user.name || '', email: user.email || '', total: 0, done: 0 };
          }
          memberStats[id].total++;
          if (t.status === 'done') memberStats[id].done++;
        });
      // Nếu là dữ liệu cũ (chỉ có assignee)
      } else if (t.assignee) {
        const user = t.assignee;
        const id = user._id ? user._id.toString() : user.toString();
        if (!memberStats[id]) {
          memberStats[id] = { name: user.name || '', email: user.email || '', total: 0, done: 0 };
        }
        memberStats[id].total++;
        if (t.status === 'done') memberStats[id].done++;
      }
    });
    res.json(Object.values(memberStats));
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// API: Lấy lịch sử hoạt động (log)
exports.getLogs = async (req, res) => {
  try {
    let logs;
    if (req.user.role === 'admin') {
      logs = await Log.find({})
        .populate('user', 'name email role')
        .sort({ createdAt: -1 })
        .limit(200);
    } else {
      // Lấy log liên quan đến user hoặc các dự án user tham gia
      const userId = req.user._id;
      // Lấy các project user tham gia
      const projects = await require('../models/Project').find({
        $or: [
          { leader: userId },
          { members: userId }
        ]
      }).distinct('_id');
      logs = await Log.find({
        $or: [
          { user: userId },
          { targetType: 'Project', targetId: { $in: projects } },
          { targetType: 'Task', targetId: { $exists: true } } // Có thể mở rộng nếu cần
        ]
      })
        .populate('user', 'name email role')
        .sort({ createdAt: -1 })
        .limit(200);
    }
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
}; 