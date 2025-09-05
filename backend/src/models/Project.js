const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['not_started', 'in_progress', 'done'], default: 'not_started' },
  deadline: Date,
  leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // Kanban WIP limits per column
  wipLimits: {
    todo: { type: Number, default: 0 },
    doing: { type: Number, default: 0 },
    done: { type: Number, default: 0 }
  },
  // SLA defaults for tasks under this project
  slaDefaults: {
    isHardDeadline: { type: Boolean, default: false },
    warnBeforeHours: { type: Number, default: 24 }
  }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema); 