import { useState, useEffect } from 'react';
import './App.css';

// Bài 5: ưu tiên cấu hình Render lúc container khởi động, rồi đến cấu hình Vite lúc build.
const API_BASE = (window.__APP_CONFIG__?.API_URL ?? import.meta.env.VITE_API_URL ?? 'http://localhost:5000').replace(/\/$/, '');
const API_URL = `${API_BASE}/api/students`;

async function requestStudents(url, options) {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `API trả về lỗi ${res.status}`);
  return data;
}

function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ studentId: '', name: '', email: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Câu 47: lấy danh sách sinh viên
  const fetchStudents = async () => {
    try {
      setError('');
      const data = await requestStudents(API_URL);
      if (!Array.isArray(data)) throw new Error('API chưa trả về danh sách sinh viên.');
      setStudents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Câu 49: gửi dữ liệu POST (hoặc PUT nếu đang sửa)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      if (editingId) {
        await requestStudents(`${API_URL}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        setEditingId(null);
      } else {
        await requestStudents(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }
      setForm({ studentId: '', name: '', email: '' });
      await fetchStudents();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (student) => {
    setForm({ studentId: student.studentId, name: student.name, email: student.email });
    setEditingId(student._id);
  };

  const handleDelete = async (id) => {
    try {
      setError('');
      await requestStudents(`${API_URL}/${id}`, { method: 'DELETE' });
      await fetchStudents();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Quản lý sinh viên - Ver 2.0</h1>
      {loading && <p role="status">Đang tải dữ liệu… Lần khởi động đầu trên Render có thể mất một phút.</p>}
      {error && <p role="alert" style={{ color: '#b42318' }}>{error} <button type="button" onClick={fetchStudents}>Thử lại</button></p>}

      {/* Câu 48: Form nhập liệu */}
      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <input
          name="studentId"
          placeholder="MSSV"
          value={form.studentId}
          onChange={handleChange}
          required
        />{' '}
        <input
          name="name"
          placeholder="Họ tên"
          value={form.name}
          onChange={handleChange}
          required
        />{' '}
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />{' '}
        <button type="submit">{editingId ? 'Cập nhật' : 'Thêm'}</button>
      </form>

      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>MSSV</th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s._id}>
              <td>{s.studentId}</td>
              <td>{s.name}</td>
              <td>{s.email}</td>
              <td>
                <button onClick={() => handleEdit(s)}>Sửa</button>{' '}
                <button onClick={() => handleDelete(s._id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
