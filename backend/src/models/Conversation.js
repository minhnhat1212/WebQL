const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  type: { type: String, enum: ['group', 'private'], required: true },
  name: { type: String }, // Tên nhóm (nếu là group)
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }, // Nếu là chat nhóm dự án
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
}, { timestamps: true });

module.exports = mongoose.model('Conversation', conversationSchema); 