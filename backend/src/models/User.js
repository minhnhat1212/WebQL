const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'leader', 'member'], default: 'member' },
  avatar: { type: String, default: '' },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  bio: { type: String, default: '' },
  dateOfBirth: { type: Date, default: null },
  gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema); 