const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.PORT || 5000;

// Khởi tạo HTTP server
const server = http.createServer(app);

// Khởi tạo Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Lưu trữ mapping userId <-> socketId
const userSocketMap = {};

io.on('connection', (socket) => {
  // Nhận userId khi client kết nối
  socket.on('join', (userId) => {
    userSocketMap[userId] = socket.id;
  });

  // Tham gia room hội thoại
  socket.on('join-conversation', (conversationId) => {
    socket.join(conversationId);
  });

  // Gửi tin nhắn real-time
  socket.on('send-message', ({ conversationId, message }) => {
    // Gửi tới tất cả user trong room hội thoại
    io.to(conversationId).emit('receive-message', message);
  });

  // Ngắt kết nối
  socket.on('disconnect', () => {
    for (const [userId, sockId] of Object.entries(userSocketMap)) {
      if (sockId === socket.id) {
        delete userSocketMap[userId];
        break;
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server + Socket.io running on port ${PORT}`);
}); 