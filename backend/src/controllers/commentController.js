const { Comment, Task, Project } = require('../models');

// Thêm bình luận vào task
exports.addComment = async (req, res) => {
  try {
    const { taskId, content } = req.body;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Không tìm thấy task' });
    // Chỉ thành viên dự án, leader, admin mới được bình luận
    const project = await Project.findById(task.project);
    if (
      req.user.role !== 'admin' &&
      !project.leader.equals(req.user._id) &&
      !project.members.includes(req.user._id)
    ) {
      return res.status(403).json({ message: 'Không có quyền bình luận task này' });
    }
    const comment = new Comment({
      task: taskId,
      user: req.user._id,
      content,
    });
    await comment.save();
    // Thêm comment vào task
    task.comments.push(comment._id);
    await task.save();
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Lấy danh sách bình luận của task
exports.getCommentsByTask = async (req, res) => {
  try {
    const comments = await require('../models').Comment.find({ task: req.params.taskId }).populate('user', 'name');
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Xóa bình luận
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Không tìm thấy bình luận' });
    // Chỉ người tạo hoặc admin mới được xóa
    if (req.user.role !== 'admin' && !comment.user.equals(req.user._id)) {
      return res.status(403).json({ message: 'Không có quyền xóa bình luận này' });
    }
    // Xóa comment khỏi task
    await Task.findByIdAndUpdate(comment.task, { $pull: { comments: comment._id } });
    await comment.deleteOne();
    res.json({ message: 'Đã xóa bình luận' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
}; 