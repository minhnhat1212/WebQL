const { Project, User } = require('../models');
const Log = require('../models/Log');

// Lấy danh sách thành viên dự án
exports.getMembers = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate('leader', 'name email role')
      .populate('members', 'name email role');
      
    if (!project) return res.status(404).json({ message: 'Không tìm thấy dự án' });
    
    // Chỉ thành viên, leader, admin mới xem được
    if (
      req.user.role !== 'admin' &&
      !project.leader._id.equals(req.user._id) &&
      !project.members.some(m => m._id.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Không có quyền xem thành viên dự án này' });
    }
    
    // Trả về cả thông tin project và members
    res.json({
      project: {
        _id: project._id,
        name: project.name,
        leader: project.leader
      },
      members: project.members
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Thêm thành viên vào dự án
exports.addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Không tìm thấy dự án' });
    
    // Chỉ admin hoặc leader mới được thêm thành viên
    if (req.user.role !== 'admin' && !project.leader.equals(req.user._id)) {
      return res.status(403).json({ message: 'Không có quyền thêm thành viên' });
    }
    
    if (project.members.includes(userId)) {
      return res.status(400).json({ message: 'Thành viên đã tồn tại trong dự án' });
    }
    
    project.members.push(userId);
    await project.save();
    
    // Ghi log
    await Log.create({
      user: req.user._id,
      action: 'add_member',
      targetType: 'Project',
      targetId: project._id,
      detail: `Thêm thành viên ${userId} vào dự án "${project.name}"`
    });
    
    res.json({ message: 'Đã thêm thành viên', members: project.members });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Gỡ thành viên khỏi dự án
exports.removeMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const projectId = req.params.projectId;
    
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Không tìm thấy dự án' });
    
    // Chỉ admin hoặc leader mới được gỡ thành viên
    if (req.user.role !== 'admin' && !project.leader.equals(req.user._id)) {
      return res.status(403).json({ message: 'Không có quyền gỡ thành viên' });
    }
    
    // Không cho phép gỡ leader
    if (project.leader.equals(userId)) {
      return res.status(400).json({ message: 'Không thể gỡ trưởng nhóm khỏi dự án' });
    }
    
    project.members = project.members.filter(m => m.toString() !== userId);
    await project.save();
    
    // Ghi log
    await Log.create({
      user: req.user._id,
      action: 'remove_member',
      targetType: 'Project',
      targetId: project._id,
      detail: `Gỡ thành viên ${userId} khỏi dự án "${project.name}"`
    });
    
    res.json({ message: 'Đã gỡ thành viên khỏi dự án' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Đổi leader dự án
exports.changeLeader = async (req, res) => {
  try {
    const { newLeaderId } = req.body;
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Không tìm thấy dự án' });
    // Chỉ admin hoặc leader hiện tại mới được đổi leader
    if (req.user.role !== 'admin' && !project.leader.equals(req.user._id)) {
      return res.status(403).json({ message: 'Không có quyền đổi leader' });
    }
    if (!project.members.includes(newLeaderId)) {
      return res.status(400).json({ message: 'Người này chưa là thành viên dự án' });
    }
    project.leader = newLeaderId;
    await project.save();
    // Ghi log
    await Log.create({
      user: req.user._id,
      action: 'change_leader',
      targetType: 'Project',
      targetId: project._id,
      detail: `Đổi leader dự án "${project.name}" sang ${newLeaderId}`
    });
    res.json({ message: 'Đã đổi leader', leader: project.leader });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
}; 