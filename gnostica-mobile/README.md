# Gnostica Mobile

Ứng dụng Expo/React Native của Gnostica E-Learning.

## Cấu hình môi trường

Mobile dùng một biến để chọn môi trường:

```env
EXPO_PUBLIC_APP_ENV=development
```

| Môi trường | API | WebSocket |
| --- | --- | --- |
| `development` | `http://<EXPO_PUBLIC_DEV_API_HOST>:8080/api` | `http://<EXPO_PUBLIC_DEV_API_HOST>:8080/ws` |
| `production` | `https://gnostica.io.vn/api` | `https://gnostica.io.vn/ws` |

Ví dụ làm việc trên cùng mạng Wi-Fi với máy chạy Spring Boot:

```env
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_DEV_API_HOST=192.168.1.10
EXPO_PUBLIC_OAUTH_REDIRECT_URI=gnostica://auth/callback
```

Khi dùng Cloudflare Tunnel:

```env
EXPO_PUBLIC_APP_ENV=production
EXPO_PUBLIC_OAUTH_REDIRECT_URI=gnostica://auth/callback
```

`EXPO_PUBLIC_DEV_API_HOST` chỉ cần là IP LAN, không thêm `http://` hoặc cổng. Mọi URL được tập trung trong `src/config/environment.js`; không thêm IP hoặc domain trực tiếp vào màn hình hay service.

Sau khi đổi `.env`, dừng Expo rồi chạy lại để Metro nạp biến mới.

## Chạy ứng dụng

```powershell
cd gnostica-mobile
npm install
Copy-Item .env.example .env
npm run start
```

Điện thoại và máy chạy Spring Boot phải cùng mạng LAN. Android development được cấu hình cho phép HTTP nội bộ; production chỉ dùng HTTPS. Khi đổi `EXPO_PUBLIC_APP_ENV`, hãy tạo lại development build nếu bạn không dùng Expo Go.

## Google đăng nhập

Google OAuth luôn khởi tạo qua `https://gnostica.io.vn/api/...`, kể cả khi API thường dùng IP LAN ở development. Điều này cần thiết vì Google callback phải quay về một HTTPS public domain, sau đó server chuyển về deep link `gnostica://auth/callback`.

Vì vậy khi kiểm thử Google trên mobile, Tunnel và Spring Boot cần đang chạy với `APP_ENV=production`. Các API thông thường vẫn có thể dùng IP LAN trong mobile development.

Không đặt client secret hay token riêng tư vào biến `EXPO_PUBLIC_*`; các biến này được đóng gói vào ứng dụng.
