# Báo cáo thực hành buổi 5 triển khai MERN trên Render

- Sinh viên: Nguyen Pham Gia Hao
- MSSV: 235692
- Lớp: DH23TIN06
- Ngày kiểm tra: 12/10/2026, múi giờ Asia/Saigon

## Các đường link đã kiểm tra

- GitHub: https://github.com/NguyenHao2310/cloud-lab
- Docker Hub backend: https://hub.docker.com/r/haonguyen2310/mern-backend
- Docker Hub frontend: https://hub.docker.com/r/haonguyen2310/mern-frontend
- Link_Render_App: https://mern-frontend-235692.onrender.com
- Link_Render_API của bài 5: https://mern-backend-235692.onrender.com/api/students

## Cấu hình đã triển khai

Hai Web Service dùng Docker image public trên Docker Hub, vùng Singapore và compute Free.

| Service | Image | Biến môi trường |
| --- | --- | --- |
| mern-backend-235692 | haonguyen2310/mern-backend:1.1 | MONGODB_URI riêng trên Render, PORT=5000, NODE_ENV=production, CLIENT_URL=https://mern-frontend-235692.onrender.com |
| mern-frontend-235692 | haonguyen2310/mern-frontend:2.0 | PORT=80, VITE_API_URL=https://mern-backend-235692.onrender.com |

Frontend nạp VITE_API_URL qua config.js khi Nginx khởi động. Đây là cấu hình public; không có mật khẩu trong config.js. Biến Vite lúc build vẫn được hỗ trợ. Backend cho phép origin frontend qua CLIENT_URL, và ghi nhật ký HTTP. Docker image mới không chứa file .env.

## Kết quả kiểm tra

- Render hiển thị Deploy succeeded và Live cho cả hai service.
- GET /api/hello trả HTTP 200 với thông báo backend hoạt động.
- GET /api/students trả HTTP 200, đọc được 5 bản ghi hiện có từ MongoDB Atlas.
- Giao diện tải danh sách qua HTTPS và CORS đúng origin frontend.
- Thêm bản ghi riêng LAB05_RENDER_235692 bằng form, sửa tên thành bản Updated, xác nhận dòng đã thay đổi và xóa đúng bản ghi thử này trên giao diện. Các bản ghi ban đầu được giữ nguyên.
- Không có lỗi console trong lượt kiểm tra giao diện.
- Bản local cũng được kiểm tra CRUD, CORS chặn domain lạ bằng HTTP 403, runtime config và SPA fallback.

## Bằng chứng

Ảnh nằm trong evidence/lab05: backend-render.png, frontend-render.png, app-crud.png, backend-metrics-free.png và frontend-metrics-free.png.

## Giới hạn quan sát

Dashboard hiện tại yêu cầu compute trả phí để xem CPU và RAM thực tế. Không nâng cấp hoặc phát sinh phí; ảnh Metrics ghi nhận giới hạn này. Không ghi nhận số đo CPU/RAM giả định.

Render Free tự ngủ khi không có hoạt động và có thể cần khoảng một phút để khởi động lại. Chưa thực hiện lượt chờ 15 phút đo cold start; đã ghi nhận thông báo của Dashboard.

Kết nối Atlas được xác minh bằng dữ liệu thực từ API và thao tác CRUD. Chưa kiểm tra trực tiếp Browse Collections trên Atlas Dashboard.

Sau bài 6, endpoint nộp cuối cùng sẽ được kiểm tra lại qua /api/students trên domain frontend theo mô hình Nginx Reverse Proxy.
