# Báo cáo triển khai thực hành buổi 5 và buổi 6

Sinh viên: Nguyen Pham Gia Hao. MSSV: 235692. Lớp: DH23TIN06.

Ngày kiểm tra: 12/10/2026, múi giờ Asia/Saigon.

Ứng dụng quản lý sinh viên đã được triển khai lên hai Web Service Render Free tại Singapore. Buổi 5 hoàn tất trước, có commit riêng 9689164 và báo cáo docs/LAB05_RENDER_235692.md. Sau đó hệ thống được nâng cấp theo file thuc hanh buoi 6.md: Docker Hub Webhooks, Nginx Reverse Proxy, health check, quản lý secrets và kiểm tra cập nhật.

## Hai link nộp bài

| Cột trong biểu mẫu | Giá trị |
| --- | --- |
| Link_Render_App | https://mern-frontend-235692.onrender.com |
| Link_Render_API | https://mern-frontend-235692.onrender.com/api/students |

Hai giá trị này cũng nằm trong submission-links.tsv để sao chép vào bảng tính.

## Các liên kết bổ sung

- GitHub: https://github.com/NguyenHao2310/cloud-lab
- Docker Hub backend: https://hub.docker.com/r/haonguyen2310/mern-backend
- Docker Hub frontend: https://hub.docker.com/r/haonguyen2310/mern-frontend
- Backend API trực tiếp: https://mern-backend-235692.onrender.com/api/students
- Backend health: https://mern-backend-235692.onrender.com/health
- Health qua Nginx: https://mern-frontend-235692.onrender.com/api/health

## Triển khai và CI/CD

Backend và frontend sử dụng tag latest. Image cuối của cả hai cũng được đẩy với tag 2.0. Frontend proxy trung gian đã được build và đẩy với tag 3.0; backend thử CI/CD đã được build với tag 1.2 và push dưới tag latest.

Hai Webhooks Docker Hub đã được tạo:

- Render Auto Deploy Backend trong repository haonguyen2310/mern-backend.
- Render Auto Deploy Frontend trong repository haonguyen2310/mern-frontend.

Deploy Hook URL là secret, chỉ lưu trong Docker Hub; không ghi vào GitHub hoặc báo cáo. Docker Hub ghi nhận phản hồi thành công 200/202. Render ghi nhận Triggered via Deploy Hook và các lượt triển khai v2.0 thành công. Backend /api/hello cung cấp trường version để kiểm tra đúng image đang chạy.

Ban đầu một số lượt webhook triển khai lại image cũ. Sau đó đã build image Linux amd64 không kèm manifest provenance/SBOM trung gian và xác minh lại image mới qua API. Khi sửa Image URL trong Render, phải đợi bước xác thực image hoàn tất rồi mới nhấn Connect; đọc lại Source để xác nhận đúng tag.

Chạy scripts/deploy-render.ps1 từ PowerShell để build và push bản tiếp theo. Script không chứa mật khẩu và không lưu Deploy Hook. Sau push, vẫn cần xác nhận Events và health để phát hiện lỗi triển khai.

## Nginx và biến môi trường

React chỉ gọi đường dẫn tương đối /api/students. Nginx đọc BACKEND_URL lúc container khởi động rồi chuyển tiếp /api/* sang backend. Trên Render, BACKEND_URL=https://mern-backend-235692.onrender.com và PORT=80. Kết nối HTTPS từ Nginx tới backend kiểm tra chứng chỉ và bật SNI. Read timeout 120 giây hỗ trợ lần khởi động lại của Render Free.

MONGODB_URI nằm trong Environment Group MERN-Production-Secrets, chỉ liên kết với backend. Backend có NODE_ENV=production, PORT=5000 và CLIENT_URL là URL frontend. Secrets không truyền vào frontend hoặc Docker image. Các file .env.example chứa mẫu không có mật khẩu.

Chạy local bằng Docker Compose:

```powershell
docker compose --env-file ./mern-demo/server/.env up --build -d
```

Frontend local dùng http://localhost:3000 và Nginx gọi backend trên network Compose. Vite dev server cũng proxy /api tới localhost:5000.

## Health check và cập nhật phiên bản

Backend /health và /api/health trả status UP, version 2.0, database connected, timestamp và uptime khi Atlas sẵn sàng. Nếu database chưa sẵn sàng, trả HTTP 503 và status DOWN. Render Health Check Path được đặt thành /health. Backend xử lý SIGTERM để đóng HTTP server và MongoDB sau các request đang xử lý.

Trong 150 giây theo dõi cập nhật backend, thu được 98 mẫu HTTP 200 và không có mẫu lỗi. Có 81 mẫu version 1.2 và 17 mẫu version 2.0. Đây là bằng chứng trong khoảng đo này, không phải cam kết mọi request hoặc mọi lượt deploy luôn không gián đoạn. Dữ liệu nằm trong evidence/lab06/backend-rolling-update.json.

Đã thực hành Manual Deploy bằng Deploy latest reference. Service sử dụng image có sẵn không có tùy chọn Clear build cache; không ghi nhận đã xóa build cache khi nền tảng không cung cấp thao tác đó.

## Kiểm thử và HTTPS

- Ứng dụng hiển thị Phiên bản 2.0 - Production Cloud PaaS (Auto-Deployed).
- Trên giao diện production: thêm SV999 / Sinh Vien Tong Hop / tonghop@cloud.edu.vn; đọc bản ghi, sửa email thành tonghop.updated@cloud.edu.vn, xác nhận giao diện cập nhật và xóa đúng bản ghi thử. Năm bản ghi ban đầu được giữ nguyên.
- Link API nộp bài trả HTTP 200, Content-Type application/json và danh sách 5 sinh viên bằng request không có tài khoản/token.
- Health backend và qua proxy đều trả UP, version 2.0, database connected.
- POST dữ liệu thiếu trả HTTP 400; không tạo document thiếu dữ liệu. Dùng request này để kiểm tra validation và nhật ký HTTP.
- Console trong lượt kiểm tra giao diện không có lỗi.
- Kiểm tra local với hai container trên một network xác nhận health qua Nginx và toàn bộ CRUD. Database không sẵn sàng trả đúng 503.
- HTTP frontend trả 301 và chuyển sang HTTPS.
- Lượt HEAD HTTPS không quan sát thấy header Strict-Transport-Security; không ghi nhận HSTS đã được nền tảng bật mặc định. Kết quả header nằm trong https-headers.txt.
- Bắt tay TLS có kiểm tra chứng chỉ thành công, TLS 1.3. Chứng chỉ quan sát được có issuer CN=WE1, O=Google Trust Services, C=US; không khẳng định issuer Let's Encrypt theo ví dụ trong tài liệu. Chứng chỉ có hạn tới 20/12/2026 UTC, chi tiết trong tls-certificate.json.

## Bằng chứng và phạm vi chưa xác minh trực tiếp

Ảnh và kết quả kiểm tra nằm trong evidence/lab05 và evidence/lab06. Có ảnh CRUD, v2.0, deployment, settings health check; JSON health, TLS, validation và dữ liệu quan sát cập nhật. Các bí mật được ẩn khỏi ảnh.

Dashboard yêu cầu compute trả phí để xem CPU/RAM; chỉ ghi nhận giới hạn Free, không có số đo CPU/RAM cloud để phân tích. Không nâng cấp hoặc nhập thẻ thanh toán. Custom domain là phần tùy chọn khi có tên miền riêng; đang dùng hai URL onrender.com được cấp sẵn.

Kết nối và đồng bộ Atlas được xác minh qua API và CRUD thực tế. Chưa đăng nhập trực tiếp Atlas Dashboard để chụp Browse Collections. Chưa chụp riêng tab Network F12 vì API điều khiển tab không cung cấp giao diện DevTools. Có kiểm tra API cùng domain qua HTTP và mã nguồn React chỉ sử dụng đường dẫn tương đối.

Một tab Chrome điều khiển bằng công cụ chặn điều hướng trực tiếp tới JSON bằng ERR_BLOCKED_BY_CLIENT. Request HTTP độc lập tới cùng URL trả 200 và giao diện truy cập API bình thường; không đổi cài đặt bảo vệ của Chrome để bỏ chặn.

Báo cáo và hai link đã sẵn sàng để sinh viên nộp vào biểu mẫu/LMS. Chưa tự nộp thay sinh viên.

## Tài liệu tham khảo

- https://render.com/docs/deploying-an-image
- https://render.com/docs/deploy-hooks
- https://render.com/docs/deploys
- https://render.com/docs/free
- https://vite.dev/guide/env-and-mode
