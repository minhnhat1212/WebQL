const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  name: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['todo', 'doing', 'done'], default: 'todo' },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  deadline: Date,
  // Priority & SLA
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  sla: {
    isHardDeadline: { type: Boolean, default: false },
    warnBeforeHours: { type: Number, default: 24 }, // early warning window
  },
  // Subtasks & Checklist
  parentTask: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
  subtasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  checklist: [{
    _id: false,
    id: { type: String, required: true },
    title: { type: String, required: true },
    done: { type: Boolean, default: false },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    dueAt: { type: Date, default: null }
  }],
  // Recurring
  recurring: {
    isRecurring: { type: Boolean, default: false },
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' },
    interval: { type: Number, default: 1 }, // every n units
    byWeekday: [{ type: Number, min: 0, max: 6 }], // for weekly
    byMonthDay: [{ type: Number, min: 1, max: 31 }], // for monthly
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    timezone: { type: String, default: 'UTC' },
    lastGeneratedAt: { type: Date, default: null },
    templateTaskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
  },
  // Dependencies
  dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  // Time tracking
  timeTracking: {
    isTimerRunning: { type: Boolean, default: false },
    timerStartedAt: { type: Date, default: null },
    totalSeconds: { type: Number, default: 0 },
    entries: [{
      _id: false,
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      startedAt: { type: Date, required: true },
      endedAt: { type: Date, required: true },
      seconds: { type: Number, required: true },
      note: { type: String, default: '' }
    }]
  },
  files: [{
    name: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema); 