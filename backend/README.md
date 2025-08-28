# WebQL Backend

Backend cho hệ thống quản lý dự án/công việc WebQL.

## Hướng dẫn cài đặt

1. Cài đặt package:
```bash
npm install
```

2. Tạo file `.env` và cấu hình chuỗi kết nối MongoDB:
```
MONGODB_URI=mongodb://localhost:27017/webql
JWT_SECRET=your_jwt_secret
PORT=5000
```

3. Chạy server:
```bash
npm run dev
```

> Lưu ý: Nếu chưa có file `.env`, hãy tạo file `.env` trong thư mục backend với nội dung ví dụ:
```
MONGODB_URI=mongodb://localhost:27017/webql
JWT_SECRET=your_jwt_secret
PORT=5000
```

> Lệnh `npm run dev` sẽ chạy cả API và Socket.io (qua file `server.js`).

## Cấu trúc thư mục
- `src/models/`: Định nghĩa schema Mongoose
- `src/routes/`: Định nghĩa các route API
- `src/controllers/`: Xử lý logic cho route
- `src/middlewares/`: Middleware (auth, error, ...)
- `src/utils/`: Tiện ích chung
- `src/app.js`: Điểm khởi động ứng dụng 