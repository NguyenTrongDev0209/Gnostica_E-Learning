# Gnostica Web

Ứng dụng web của nền tảng Gnostica E-Learning, xây dựng bằng React và Vite.

## Công nghệ chính

- React 19 và Vite
- Tailwind CSS
- React Router
- Axios, TanStack Query và Zustand
- SockJS/STOMP cho thông báo thời gian thực

## Yêu cầu

- Node.js `20.19+` hoặc `22.12+` trở lên
- npm
- Server Gnostica đang chạy khi cần gọi API hoặc đăng nhập Google

## Cài đặt và chạy local

```powershell
cd gnostica-web
npm install
Copy-Item .env.example .env
npm run dev
```

Vite sẽ hiển thị địa chỉ truy cập, thông thường là `http://localhost:5173`.

## Cấu hình môi trường

Mọi URL web, API, WebSocket và Google OAuth được chọn từ **một biến duy nhất** trong `.env`:

```env
VITE_APP_ENV=development
```

Giá trị được hỗ trợ:

| Giá trị | Web | API | WebSocket |
| --- | --- | --- | --- |
| `development` | `http://localhost:5173` | `http://localhost:8080/api` | `http://localhost:8080/ws` |
| `production` | `https://gnostica.io.vn` | `https://gnostica.io.vn/api` | `https://gnostica.io.vn/ws` |

Ví dụ khi làm việc trên máy cá nhân:

```env
VITE_APP_ENV=development
VITE_BUNNY_LIBRARY_ID=
```

Ví dụ khi chạy qua Cloudflare Tunnel:

```env
VITE_APP_ENV=production
VITE_BUNNY_LIBRARY_ID=
```

Sau khi đổi `.env`, hãy dừng rồi chạy lại `npm run dev`; Vite đọc các biến `VITE_*` khi khởi động hoặc build.

Không đưa mật khẩu, token riêng tư hoặc `GOOGLE_CLIENT_SECRET` vào biến có tiền tố `VITE_`: các biến này được đóng gói vào mã JavaScript và người dùng có thể xem được.

### Nơi quản lý URL duy nhất

File [src/config/environment.js](src/config/environment.js) là nơi duy nhất khai báo URL theo từng môi trường. Các phần gọi API, WebSocket và OAuth chỉ dùng các giá trị đã xuất từ file này:

- `API_URL`: địa chỉ API
- `WS_URL`: địa chỉ WebSocket
- `OAUTH2_URL`: đường dẫn bắt đầu đăng nhập Google

Vì vậy không thêm `localhost`, IP LAN hoặc domain trực tiếp vào component, hook hay service. Muốn đổi môi trường chỉ cần đổi `VITE_APP_ENV`.

## Đăng nhập Google

Nút đăng nhập Google gọi:

| Môi trường | URL bắt đầu đăng nhập | Redirect URI cần khai báo trên Google Cloud |
| --- | --- | --- |
| `development` | `http://localhost:8080/api/oauth2/authorization/google` | `http://localhost:8080/api/login/oauth2/code/google` |
| `production` | `https://gnostica.io.vn/api/oauth2/authorization/google` | `https://gnostica.io.vn/api/login/oauth2/code/google` |

Google Cloud Console phải khai báo cả hai Redirect URI trên cho OAuth client dạng **Web application**. Client ID và Client Secret chỉ được đặt trong `.env` của `gnostica-server`, không đặt trong web.

## Chạy qua Cloudflare Tunnel

Cloudflare Tunnel cần định tuyến cùng domain `gnostica.io.vn`:

| Path | Service nội bộ |
| --- | --- |
| `/api` | `http://localhost:8080` |
| `*` | `http://localhost:5173` |

Nhờ vậy web luôn gọi API qua `https://gnostica.io.vn/api`; không cần công khai IP hay cấu hình CORS theo IP cho trình duyệt.

## Lệnh thường dùng

```powershell
npm run dev      # Chạy môi trường phát triển
npm run build    # Tạo bản build production
npm run preview  # Xem thử bản build
npm run lint     # Kiểm tra chất lượng mã nguồn
```

## Cấu trúc mã nguồn

```text
src/
├── config/          # Cấu hình dùng chung, gồm environment.js
├── lib/             # Axios và các thư viện nền tảng
├── services/        # Lớp giao tiếp API
├── hooks/           # Logic tái sử dụng theo chức năng
├── components/      # Thành phần giao diện dùng lại
├── pages/           # Các trang ứng dụng
└── routers/         # Khai báo điều hướng
```

## Xử lý sự cố nhanh

- Không gọi được API ở local: kiểm tra `gnostica-server` đang chạy tại cổng `8080` và `VITE_APP_ENV=development`.
- Không gọi được API qua domain: kiểm tra Cloudflare Tunnel đang hoạt động và route `/api` trỏ đến `http://localhost:8080`.
- Google báo `redirect_uri_mismatch`: kiểm tra Redirect URI trong Google Cloud Console khớp hoàn toàn với bảng ở trên, bao gồm `https`, `/api` và không có dấu `/` thừa ở cuối.
- Đổi `.env` nhưng web vẫn dùng URL cũ: dừng Vite rồi chạy lại `npm run dev`.
