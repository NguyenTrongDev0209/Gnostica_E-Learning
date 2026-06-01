# Gnostica E-Learning Platform

Gnostica là nền tảng học trực tuyến (E-Learning) full-stack chuyên nghiệp, được xây dựng cho học viên, giảng viên và quản trị viên. Hệ thống bao gồm **3 ứng dụng chính**: Backend API, Web App và Mobile App — cùng phục vụ trên một kiến trúc nhất quán.

---

## Cấu trúc Monorepo

```
Gnostica_E-Learning/
├── gnostica-server/     # Backend API (Spring Boot)
├── gnostica-web/        # Web Application (React + Vite)
└── gnostica-mobile/     # Mobile Application (Expo + React Native)
```

---

## Công nghệ sử dụng

### `gnostica-server` — Backend API
| Thành phần | Công nghệ |
|---|---|
| Framework | Spring Boot 3.x (Java 17) |
| Database | PostgreSQL (Persistence), Redis (Caching) |
| Security | Spring Security, JWT, OAuth2 Client |
| Payment | PayOS |
| Storage | Cloudinary |
| Real-time | WebSocket (STOMP) |
| Architecture | Domain-Driven Design (Controller / Service / Repository / DTO) |

### `gnostica-web` — Web Application
| Thành phần | Công nghệ |
|---|---|
| Library | React 19 |
| Build Tool | Vite |
| Styling | Tailwind CSS 4 & Shadcn UI (Radix UI) |
| State / Forms | React Hook Form & Zod |
| Networking | Axios |
| Real-time | SockJS + STOMP.js |
| Charts | Recharts |
| Animations | Framer Motion |
| Rich Text | React Quill |
| Icons | Lucide React |
| Typography | Geist / Inter (Fontsource) |

### `gnostica-mobile` — Mobile Application
| Thành phần | Công nghệ |
|---|---|
| Framework | Expo SDK 54 (React Native 0.81) |
| Styling | NativeWind 4 (Tailwind CSS) |
| Navigation | React Navigation (Stack & Bottom Tabs) |
| UI Components | Gluestack UI |
| Animations | React Native Reanimated |
| Icons | Lucide React Native |

---

## Tính năng chính

### Dành cho Học viên
- **Trang chủ & Khám phá**: Duyệt khóa học nổi bật, danh mục, giảng viên top.
- **Tìm kiếm & Lọc**: Tìm kiếm khóa học nâng cao với fuzzy search (Fuse.js).
- **Chi tiết khóa học**: Xem nội dung bài học, đánh giá, thông tin giảng viên.
- **Thanh toán**: Giỏ hàng, checkout, thanh toán qua PayOS (QR Code).
- **Học tập**: Trình phát bài học với theo dõi tiến độ bài học.
- **Chứng chỉ**: Nhận và tải chứng chỉ hoàn thành khóa học (PDF/Image).
- **Diễn đàn**: Tạo và tham gia thảo luận trong các diễn đàn khóa học.
- **Hồ sơ cá nhân**: Quản lý thông tin, ảnh đại diện, khóa học đã mua.
- **Wishlist & Thông báo**: Lưu khóa học yêu thích và nhận thông báo mới.

### Dành cho Giảng viên
- **Dashboard**: Tổng quan doanh thu, số học viên, đánh giá theo thời gian thực.
- **Quản lý khóa học**: Tạo/sửa/xóa khóa học với soạn thảo nội dung rich text.
- **Quản lý học viên**: Xem danh sách học viên đã đăng ký.
- **Q&A**: Trả lời câu hỏi của học viên trong các diễn đàn.
- **Hệ thống Coupon**: Tạo và quản lý mã giảm giá.
- **Doanh thu & Rút tiền**: Theo dõi thu nhập và gửi yêu cầu rút tiền qua PayOS.
- **Báo cáo**: Thống kê chi tiết về hiệu suất khóa học.

### Dành cho Quản trị viên
- **Dashboard**: Theo dõi tăng trưởng nền tảng và doanh thu tổng thể.
- **Quản lý người dùng**: Xem, tìm kiếm, khóa/mở khóa tài khoản.
- **Kiểm duyệt khóa học**: Duyệt, từ chối hoặc gỡ bỏ khóa học.
- **Quản lý danh mục**: Thêm/sửa/xóa danh mục khóa học.
- **Quản lý Coupon**: Kích hoạt/vô hiệu hóa mã giảm giá.
- **Quản lý Diễn đàn**: Tạo danh mục forum, kiểm duyệt bài viết.
- **Quản lý giao dịch & lệnh rút tiền**.
- **Báo cáo vi phạm**: Xem xét các báo cáo từ cộng đồng.

### Mobile App (`gnostica-mobile`)
Ứng dụng di động mang đầy đủ tính năng học tập của web lên iOS & Android:
- Trang chủ, tìm kiếm, duyệt danh mục
- Chi tiết & mua khóa học
- Học tập, theo dõi tiến độ
- Diễn đàn & bài viết cộng đồng
- Hồ sơ, giỏ hàng, wishlist, thông báo
- Xem chứng chỉ, quản lý tài khoản giảng viên & admin

---

## Bắt đầu

### Điều kiện tiên quyết
- **JDK 17+** & Maven
- **Node.js 18+** & npm
- **PostgreSQL** & **Redis**
- **Expo CLI** (cho mobile): `npm install -g expo-cli`

### 1. Clone Repository
```bash
git clone <repository-url>
cd Gnostica_E-Learning
```

### 2. Cài đặt Backend (`gnostica-server`)
```bash
cd gnostica-server
# Cấu hình src/main/resources/application.properties:
#   - spring.datasource.url, username, password (PostgreSQL)
#   - spring.data.redis.host, port (Redis)
#   - cloudinary.cloud-name, api-key, api-secret
#   - payos.client-id, api-key, checksum-key
./mvnw spring-boot:run
# Server chạy tại: http://localhost:8080
```

### 3. Cài đặt Web App (`gnostica-web`)
```bash
cd gnostica-web
npm install
# Tạo file .env và cấu hình VITE_API_BASE_URL
npm run dev
# App chạy tại: http://localhost:5173
```

### 4. Cài đặt Mobile App (`gnostica-mobile`)
```bash
cd gnostica-mobile
npm install
# Cấu hình API URL trong src/constants/
npx expo start
# Quét QR code bằng Expo Go (iOS/Android)
```

---

## Cấu trúc thư mục chính

<details>
<summary><strong>gnostica-server</strong></summary>

```
src/main/java/com/gnostica/
├── config/          # Cấu hình Spring (Security, CORS, WebSocket...)
├── controller/      # REST API Controllers (27 controllers)
├── service/         # Business Logic
├── repository/      # Spring Data JPA Repositories
├── model/           # JPA Entities
├── dto/             # Data Transfer Objects
├── security/        # JWT, OAuth2 handlers
└── util/            # Shared utilities
```
</details>

<details>
<summary><strong>gnostica-web</strong></summary>

```
src/
├── components/      # UI Components (Common, Fragments, Pages)
├── pages/
│   ├── client/      # Trang dành cho học viên
│   ├── instructor/  # Trang dành cho giảng viên
│   ├── admin/       # Trang quản trị
│   ├── auth/        # Đăng nhập / Đăng ký
│   └── learning/    # Trình phát bài học
├── services/        # Axios API service modules
├── hooks/           # Custom React Hooks
├── routers/         # React Router configuration
└── utils/           # Helper functions
```
</details>

<details>
<summary><strong>gnostica-mobile</strong></summary>

```
src/
├── screens/
│   ├── client/      # 24 màn hình dành cho học viên
│   ├── instructor/  # Màn hình quản lý giảng viên
│   ├── admin/       # Màn hình quản trị
│   └── auth/        # Đăng nhập / Đăng ký
├── components/      # UI Components tái sử dụng
├── navigation/      # React Navigation setup
├── context/         # React Context (Auth, ...)
└── constants/       # API URLs, config constants
```
</details>

---

## Bản quyền

Dự án được cấp phép theo [MIT License](LICENSE).
