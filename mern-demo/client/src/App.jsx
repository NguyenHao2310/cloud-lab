import { useState, useEffect } from 'react';
import './App.css';

// Câu 77: Địa chỉ Backend.
// Khi Frontend mở qua URL public của Codespaces, request tới http://localhost:5000 sẽ KHÔNG chạy
// (localhost lúc này là máy của người dùng, không phải Codespace). Phải trỏ tới URL public
// của port 5000 (PORTS tab -> Copy Port Address).
// Giá trị được nhúng lúc BUILD qua biến VITE_API_URL (xem Dockerfile + docker-compose build args).
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';
const API_URL = `${API_BASE}/api/students`;

function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ studentId: '', name: '', email: '' });
  const [editingId, setEditingId] = useState(null);

  // Câu 47: lấy danh sách sinh viên
  const fetchStudents = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setStudents(data);
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
    if (editingId) {
      await fetch(`${API_URL}/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setEditingId(null);
    } else {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    }
    setForm({ studentId: '', name: '', email: '' });
    fetchStudents();
  };

  const handleEdit = (student) => {
    setForm({ studentId: student.studentId, name: student.name, email: student.email });
    setEditingId(student._id);
  };

  const handleDelete = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    fetchStudents();
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Quản lý sinh viên - Ver 2.0</h1>

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