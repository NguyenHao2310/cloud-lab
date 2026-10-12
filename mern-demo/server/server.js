if (!globalThis.crypto) globalThis.crypto = require('crypto');
const express = require('express');
const cors = require('cors');
require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');

mongoose.set('bufferCommands', false);
mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 })
  .then(() => console.log('✅ Kết nối MongoDB Atlas thành công'))
  .catch(() => console.error('❌ Kết nối MongoDB thất bại. Kiểm tra MONGODB_URI và Atlas Network Access.'));

const app = express();
const PORT = process.env.PORT || 5000;
const APP_VERSION = '2.0';

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use((req, res, next) => {
  const started = Date.now();
  res.on('finish', () => console.log(`${req.method} ${req.path} ${res.statusCode} ${Date.now() - started}ms`));
  next();
});
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    const error = new Error('Domain không được phép truy cập API. Kiểm tra CLIENT_URL.');
    error.status = 403;
    callback(error);
  },
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ service: 'Student Management API', version: APP_VERSION, students: '/api/students', health: '/health' });
});

// Chỉ nhận traffic khi kết nối Atlas đã sẵn sàng.
app.get(['/health', '/api/health'], (req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({
    status: ready ? 'UP' : 'DOWN',
    version: APP_VERSION,
    database: ready ? 'connected' : 'unavailable',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Câu 22: API xác nhận Backend hoạt động
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Backend đang hoạt động!', version: APP_VERSION });
});

const Student = require('./models/Student');

// Câu 36: GET danh sách sinh viên
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Câu 37: POST thêm sinh viên
app.post('/api/students', async (req, res) => {
  try {
    const newStudent = await Student.create(req.body);
    res.status(201).json(newStudent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Câu 38: PUT cập nhật sinh viên
app.put('/api/students/:id', async (req, res) => {
  try {
    const updated = await Student.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after', runValidators: true });
    if (!updated) return res.status(404).json({ error: 'Không tìm thấy sinh viên' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Câu 39: DELETE xóa sinh viên
app.delete('/api/students/:id', async (req, res) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Không tìm thấy sinh viên' });
    res.json({ message: 'Đã xóa sinh viên' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend bài 6 v${APP_VERSION} tự động triển khai trên cổng ${PORT}`);
});

// Hoàn tất request đang xử lý trước khi Render thay instance.
process.on('SIGTERM', () => {
  console.log('Nhận SIGTERM: đóng HTTP server và MongoDB sau các request đang xử lý.');
  server.close(async () => {
    await mongoose.disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
});
