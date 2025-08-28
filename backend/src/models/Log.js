const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // Ví dụ: 'create_task', 'update_project', ...
  targetType: { type: String }, // Loại đối tượng: 'Task', 'Project', 'User', ...
  targetId: { type: mongoose.Schema.Types.ObjectId }, // ID đối tượng
  detail: { type: String }, // Thông tin chi tiết (nếu cần)
}, { timestamps: true });

module.exports = mongoose.model('Log', logSchema); 