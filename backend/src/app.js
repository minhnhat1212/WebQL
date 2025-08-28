const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Import routes
const routes = require('./routes');
const userRoutes = require('./routes/users');

// Route API
app.use('/api/auth', routes.auth);
app.use('/api/projects', routes.project);
app.use('/api/tasks', routes.task);
app.use('/api/members', routes.member);
app.use('/api/comments', routes.comment);
app.use('/api/notifications', routes.notification);
app.use('/api/statistics', routes.statistics);
app.use('/api/calendar', routes.calendar);
app.use('/api/search', routes.search);
app.use('/api/users', userRoutes);
app.use('/api/chat', routes.chat);
app.use('/api/profile', routes.profile);

// Serve uploaded files
const uploadsPath = path.join(__dirname, '../uploads/tasks');
const avatarUploadsPath = path.join(__dirname, '../uploads/avatars');
app.use('/uploads/tasks', express.static(uploadsPath));
app.use('/uploads/avatars', express.static(avatarUploadsPath));

// Route mẫu
app.get('/', (req, res) => {
  res.send('WebQL API is running');
});

const PORT = process.env.PORT || 5000;
// Thay vì app.listen, export app để server.js hoặc index.js có thể dùng cho Socket.io
module.exports = app;
// Xóa hoặc comment dòng app.listen
// app.listen(PORT, () => { ... }); 