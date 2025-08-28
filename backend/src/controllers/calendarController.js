const { Task, Project } = require('../models');

// Lấy task theo ngày
exports.getTasksByDay = async (req, res) => {
  try {
    const { date } = req.query; // yyyy-mm-dd
    const start = new Date(date);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    const tasks = await Task.find({
      deadline: { $gte: start, $lte: end },
      $or: [
        { assignees: req.user._id },
        { project: { $in: await Project.find({ members: req.user._id }).distinct('_id') } },
        { project: { $in: await Project.find({ leader: req.user._id }).distinct('_id') } },
      ],
    }).populate('project', 'name').populate('assignees', 'name email');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Lấy task theo tuần
exports.getTasksByWeek = async (req, res) => {
  try {
    const { start, end } = req.query; // yyyy-mm-dd
    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);
    const tasks = await Task.find({
      deadline: { $gte: startDate, $lte: endDate },
      $or: [
        { assignees: req.user._id },
        { project: { $in: await Project.find({ members: req.user._id }).distinct('_id') } },
        { project: { $in: await Project.find({ leader: req.user._id }).distinct('_id') } },
      ],
    }).populate('project', 'name').populate('assignees', 'name email');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Lấy task theo tháng
exports.getTasksByMonth = async (req, res) => {
  try {
    const { year, month } = req.query; // month: 1-12
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);
    const tasks = await Task.find({
      deadline: { $gte: start, $lte: end },
      $or: [
        { assignees: req.user._id },
        { project: { $in: await Project.find({ members: req.user._id }).distinct('_id') } },
        { project: { $in: await Project.find({ leader: req.user._id }).distinct('_id') } },
      ],
    }).populate('project', 'name').populate('assignees', 'name email');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Lấy tổng số lịch (task có deadline trong tương lai)
exports.getCalendarCount = async (req, res) => {
  try {
    const now = new Date();
    const projects = await Project.find({
      $or: [
        { leader: req.user._id },
        { members: req.user._id }
      ]
    }).distinct('_id');
    const count = await Task.countDocuments({
      deadline: { $gte: now },
      $or: [
        { assignees: req.user._id },
        { project: { $in: projects } }
      ]
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
}; 