# Kiến trúc Tổng quan Hệ thống Gnostica E-Learning 🏗️

> **Mục đích tài liệu:** Mô tả toàn bộ kiến trúc hệ thống, luồng dữ liệu, cách các phân hệ giao tiếp, và các quyết định thiết kế quan trọng để AI hoặc developer mới có thể hiểu nhanh dự án.

---

## 1. Tổng quan Hệ thống

Gnostica là nền tảng E-Learning full-stack gồm **3 phân hệ** chính hoạt động trên kiến trúc **Monorepo**:

```
Gnostica_E-Learning/
├── gnostica-server/     # Backend REST API (Spring Boot 4.x, Java 17)
├── gnostica-web/        # Web Application (React 19 + Vite + Tailwind CSS 4)
├── gnostica-mobile/     # Mobile Application (React Native 0.81 + Expo SDK 54)
├── docker/              # Docker Compose production + Cloudflare Tunnel config
└── .github/workflows/   # CI/CD pipeline (GitHub Actions)
```

---

## 2. Sơ đồ Kiến trúc Hệ thống

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        INTERNET / CDN                                  │
│  ┌──────────┐   ┌──────────────┐   ┌────────────┐   ┌──────────────┐  │
│  │ Cloudflare│   │ Bunny.net CDN│   │ Cloudinary │   │ PayOS / VNPay│  │
│  │ Tunnel    │   │ (Video+Docs) │   │ (Images)   │   │ (Payments)   │  │
│  └─────┬────┘   └──────────────┘   └────────────┘   └──────────────┘  │
│        │                                                               │
└────────┼───────────────────────────────────────────────────────────────┘
         │
    ┌────┴────────────────────────────────────────────┐
    │            Docker Compose Production            │
    │                                                 │
    │  ┌──────────────┐     ┌──────────────────────┐  │
    │  │ gnostica-web │     │  gnostica-server     │  │
    │  │ (Nginx:80)   │     │  (Spring Boot:8080)  │  │
    │  │              │     │                      │  │
    │  │ React 19 SPA │     │  REST API + WebSocket│  │
    │  │ Vite Build   │     │  JWT + OAuth2        │  │
    │  └──────────────┘     │  Flyway Migrations   │  │
    │                       └──────────┬───────────┘  │
    │                                  │              │
    │  ┌──────────────┐   ┌────────────┴───────────┐  │
    │  │   Redis      │   │   PostgreSQL 16        │  │
    │  │   (Cache/OTP)│   │   (48 bảng, JPA)       │  │
    │  └──────────────┘   └────────────────────────┘  │
    │                                                 │
    │  ┌──────────────┐                               │
    │  │  MongoDB      │  (Atlas Cloud - ChatSession) │
    │  └──────────────┘                               │
    └─────────────────────────────────────────────────┘

    ┌──────────────────────┐
    │  gnostica-mobile     │  (Expo Go / Development Build)
    │  React Native 0.81   │  ──→ gọi cùng REST API
    │  NativeWind + GS UI  │
    └──────────────────────┘
```

---

## 3. Kiến trúc Backend (gnostica-server)

### 3.1 Kiến trúc Phân lớp (Layered Architecture)

```
com.gnostica/
├── core/                          # Lớp nền tảng dùng chung
│   ├── config/                    # Cấu hình Spring (Security, Redis, Cloudinary, Jackson, etc.)
│   ├── constant/                  # Hằng số hệ thống
│   ├── dto/response/              # DTO chung (ApiResponse, ResponseDTO, v.v.)
│   ├── event/                     # Domain Events (PaymentSuccessEvent, LogEvent, etc.)
│   ├── exception/                 # Global Exception Handler, ResourceNotFoundException
│   ├── listener/                  # Event Listeners (Mail, Audit, Enrollment, Wallet, Payout)
│   ├── model/                     # JPA Entities (48 models tương ứng 48 bảng DB)
│   ├── repository/                # Spring Data JPA Repositories
│   ├── security/                  # JWT, OAuth2, UserDetailsService
│   └── util/                      # Utility classes (Auth, DateTime, File, Slug, Random, VTT Parser)
│
└── modules/                       # Các module nghiệp vụ
    ├── adminstats/                # Thống kê kiểm duyệt Admin (refunds, withdrawals, reports)
    ├── auth/                      # Đăng ký, Đăng nhập, OTP, OAuth2, Quên mật khẩu
    ├── checkout/                  # Đơn hàng, Thanh toán (PayOS, VNPay), Coupon, Gift, Hoàn tiền (Refund)
    ├── course/                    # Quản lý khóa học, Module, Lesson, Quiz, Enrollment, Certificate
    ├── dashboard/                 # Dashboard thống kê cho Admin và Instructor
    ├── forum/                     # Diễn đàn (Topics, Threads, Comments, Votes, Hashtags)
    ├── integration/               # Tích hợp bên ngoài (Bunny.net, Cloudinary, AI, OCR, Email)
    ├── messaging/                 # Chat học viên ↔ giảng viên (Conversations, Messages, WebSocket STOMP)
    ├── settings/                  # Cài đặt hệ thống, Quản lý trang tĩnh (Pages, Terms)
    ├── user/                      # Hồ sơ người dùng, Follow, Notification, Admin user mgmt
    └── wallet/                    # Ví tiền, Rút tiền (Payout), Hoa hồng (Commission)
```

### 3.2 Mỗi Module tuân theo cấu trúc

```
modules/<tên_module>/
├── controller/         # REST Controller (nhận request, trả response)
├── dto/
│   ├── request/        # Request DTOs (validation bằng Jakarta Validation)
│   └── response/       # Response DTOs
├── service/            # Interface service
│   └── impl/           # Service implementation (business logic)
├── job/                # Scheduled jobs (nếu có, ví dụ: CourseCompletionEmailJob)
├── scheduler/          # Schedulers (OrderCleanup, PayOSReconciliation, VNPayReconciliation)
├── listener/           # Event listeners module-specific
├── event/              # Domain events module-specific
└── util/               # Utilities module-specific
```

### 3.3 Các Pattern & Quyết định Thiết kế Quan trọng

| Pattern | Mô tả | Ví dụ |
|---------|--------|-------|
| **Event-Driven** | Sử dụng Spring ApplicationEvent để giảm coupling giữa modules | `PaymentSuccessEvent` → `EnrollmentListener`, `WalletListener`, `MailListener` |
| **Polymorphic Target** | `target_type + target_id` để một bảng phục vụ nhiều loại đối tượng | `Comments`, `Votes`, `Reports` dùng chung cho Thread, Lesson, Review |
| **Course Versioning** | Cơ chế Draft/Published cho phép sửa mà không ảnh hưởng học viên đang học | `original_course_id`, `version_number` trong Courses, Modules, Lessons, Questions, Quizzes |
| **Append-Only Commission** | Đổi tỷ lệ hoa hồng tạo bản ghi mới, không sửa bản ghi cũ | `Commissions` table, `OrderDetail.commission_id` snapshot |
| **Price Snapshot** | Giá lưu tại thời điểm tạo đơn, không đọc lại từ Course | `OrderDetail.price`, `OrderDetail.discount`, `Orders.coupon_price` |
| **Soft Delete** | Xóa mềm bằng `deleted_at` thay vì xóa cứng | Hầu hết các entity đều có trường `deleted_at` |
| **Scheduled Reconciliation** | Đối soát thanh toán định kỳ khi webhook không khả dụng (dev mode) | `PayOSReconciliationScheduler`, `VNPayReconciliationScheduler`, `OrderCleanupScheduler` |

### 3.4 Bảo mật (Security)

- **JWT Authentication**: Access token (24h TTL), lưu trong header `Authorization: Bearer <token>`
- **OAuth2 Social Login**: Google (Web + Mobile), xử lý bởi `OAuth2SuccessHandler` / `OAuth2FailureHandler`
- **Mobile Deep Link**: Redirect callback sau OAuth2 về `gnostica://auth/callback`
- **Role-Based Access**: 3 vai trò chính — `ADMIN`, `INSTRUCTOR`, `USER`
- **Coupon Encryption**: Mã coupon được mã hóa/giải mã bằng `CouponCodeCipher` với master key
- **CORS**: Cấu hình cho phép các origin từ `APP_CORS_ALLOWED_ORIGIN_PATTERNS`

### 3.5 Dịch vụ Tích hợp Bên ngoài

| Dịch vụ | Mục đích | File cấu hình |
|---------|---------|---------------|
| **PayOS** | Thanh toán QR tự động | `PayOSConfig.java`, `PayosService.java` |
| **VNPay** | Cổng thanh toán thay thế | `VNPayProperties.java`, `VnpayService.java` |
| **Cloudinary** | Lưu trữ ảnh (avatar, thumbnail) | `CloudinaryConfig.java`, `CloudinaryService.java` |
| **Bunny.net Stream** | Lưu trữ và phát video bài giảng (HLS) | `BunnyNetConfig.java`, `BunnyNetService.java` |
| **Bunny.net Storage** | Lưu trữ tài liệu đính kèm | `BunnyStorageConfig.java`, `BunnyStorageService.java` |
| **Redis Cloud** | Cache, OTP, Draft auto-save | `RedisConfig.java`, `RedisDraftService.java`, `OtpService.java` |
| **MongoDB Atlas** | Lưu trữ chat session (AI Chat) | `MongoConfig.java`, `ChatSession.java` |
| **OpenRouter / DeepSeek** | AI Chat (hỗ trợ học tập) | `OpenRouterAiService.java`, `AiService.java` |
| **Gmail SMTP** | Gửi email xác thực, thông báo | `MailService.java`, Thymeleaf templates |
| **FPT AI OCR** | Trích xuất text từ tài liệu | `FptOcrService.java` |

---

## 4. Kiến trúc Frontend Web (gnostica-web)

### 4.1 Cấu trúc Source Code

```
src/
├── App.jsx              # Root component, routing setup
├── main.jsx             # Entry point, QueryClientProvider, ThemeProvider
├── index.css            # Global styles (Tailwind CSS 4)
├── config/
│   └── environment.js   # Quản lý URL tập trung (development/production)
├── lib/                 # Axios instance, utility libraries
├── store/
│   └── useAuthStore.js  # Zustand global auth state
├── services/            # API service layer (Axios calls)
│   ├── admin/           # Admin API services
│   ├── auth/            # Authentication services
│   ├── course/          # Course, enrollment, quiz services
│   ├── forum/           # Thread, comment services
│   ├── home/            # Homepage data services
│   ├── instructor/      # Instructor-specific services
│   ├── order/           # Order, coupon services
│   ├── payment/         # Wallet, bank, refund services
│   ├── settings/        # System settings services
│   └── user/            # Account, notification services
├── hooks/               # Custom React hooks (theo feature)
├── components/
│   ├── ui/              # Shadcn UI (Radix) components
│   ├── common/          # Shared components (Header, Footer, etc.)
│   ├── fragments/       # Page fragments/sections
│   ├── layouts/         # Layout wrappers
│   └── modals/          # Modal dialogs
├── pages/
│   ├── general/         # Trang chung (Home, About, Profile, Terms)
│   ├── auth/            # Đăng nhập, Đăng ký, Quên mật khẩu
│   ├── course/          # Catalog, Detail, Search, Category
│   ├── learning/        # Learning Workspace (video player, progress)
│   ├── forum/           # Forum pages
│   ├── account/         # Account management pages
│   ├── order/           # Checkout, Payment
│   ├── admin/           # Admin dashboard & management (15+ pages)
│   ├── instructor/      # Instructor dashboard & management (8+ pages)
│   └── user/            # User profile pages
├── routers/
│   ├── publicRoutes.js  # Các route public (không cần login)
│   └── privateRoutes.js # Các route private (cần auth, phân theo role)
├── mocks/               # Mock data cho development
└── utils/               # Utility functions
```

### 4.2 Quản lý State

| Loại State | Công cụ | Mô tả |
|-----------|---------|-------|
| **Server State** | React Query v5 (`@tanstack/react-query`) | Fetch, cache, invalidate API data |
| **Global Client State** | Zustand | Auth state (`useAuthStore`) |
| **Form State** | React Hook Form + Zod | Validation, form management |
| **Real-time** | SockJS + StompJS | WebSocket notifications |

### 4.3 Routing Strategy

```
Public Routes (không cần đăng nhập):
  /                    → HomePage
  /courses             → CourseCatalog
  /courses/:slug       → CourseDetail
  /search              → SearchPage
  /forum               → ForumPage
  /login, /register    → Auth pages

Private Routes (cần đăng nhập, phân theo layout/role):
  /account/*           → Account management (USER)
  /learning/:id        → Learning Workspace (ENROLLED USER)
  /checkout/*          → Checkout flow
  /admin/*             → Admin Dashboard (ADMIN only, 15+ routes)
  /instructor/*        → Instructor Dashboard (INSTRUCTOR only, 8+ routes)
```

---

## 5. Kiến trúc Mobile App (gnostica-mobile)

### 5.1 Cấu trúc Source Code

```
src/
├── config/
│   ├── environment.js   # URL tập trung (dev dùng IP LAN, prod dùng domain)
│   └── api.js           # Axios instance cho mobile
├── context/
│   ├── AuthContext.js    # Authentication context
│   ├── CartContext.js    # Shopping cart context
│   └── LoadingContext.jsx # Loading state context
├── navigation/
│   └── AppNavigator.jsx  # React Navigation (Stack + Bottom Tabs)
├── screens/
│   ├── auth/            # Login, Register, Forgot Password
│   ├── home/            # Home screen, Search
│   ├── course/          # Course detail, Learning space
│   ├── checkout/        # Checkout, Payment
│   ├── forum/           # Forum screens
│   ├── profile/         # User profile screens
│   ├── instructor/      # Instructor screens
│   └── common/          # Shared screens
├── components/
│   ├── ui/              # Gluestack UI components
│   └── course/          # Course-specific components
├── services/            # API services (mirroring web structure)
├── hooks/               # Custom hooks
├── constants/           # App constants
├── styles/              # Shared styles
├── assets/              # Images, fonts
└── utils/               # Utility functions
```

### 5.2 Đặc điểm Kiến trúc Mobile

- **Navigation**: React Navigation v7 (Native Stack + Bottom Tabs)
- **Styling**: NativeWind v4 (Tailwind CSS cho React Native, dùng TW v3.x)
- **UI Kit**: Gluestack UI
- **State**: React Context (AuthContext, CartContext) — không dùng Zustand
- **Video**: Expo Video / React Native Video
- **Environment**: `EXPO_PUBLIC_APP_ENV` + `EXPO_PUBLIC_DEV_API_HOST` (IP LAN cho dev)

---

## 6. Luồng Dữ liệu Chính

### 6.1 Luồng Thanh toán

```
Learner thêm khóa học vào giỏ hàng
    ↓
Tạo Order (status: PENDING) + OrderDetails (snapshot giá)
    ↓
Áp dụng Coupon (nếu có) → tính coupon_price → total_price
    ↓
Chọn cổng thanh toán (PayOS QR / VNPay)
    ↓
┌─ Production: Webhook callback từ cổng thanh toán
│  ↓
└─ Development: Scheduled Reconciliation (polling mỗi 2-30s)
    ↓
PaymentSuccessEvent (Spring Event)
    ↓
├── EnrollmentListener: Tạo Enrollment cho học viên
├── WalletListener: Cộng tiền vào Wallet giảng viên (theo Commission)
├── MailListener: Gửi email xác nhận
└── AuditListener: Ghi log
```

### 6.2 Luồng Versioning Khóa học

```
Giảng viên tạo khóa học mới → Course v1 (status: DRAFT)
    ↓
Submit duyệt → Course v1 (status: PENDING)
    ↓
Admin duyệt → Course v1 (status: PUBLISHED)
    ↓
Giảng viên muốn sửa → Tạo Course v2 (original_course_id = v1.id, status: DRAFT)
    ↓ (v1 vẫn PUBLISHED, học viên vẫn học bình thường)
Submit duyệt v2 → v2 (status: PENDING)
    ↓
Admin duyệt v2 → Merge nội dung v2 vào v1, v1 cập nhật → version_number++
```

### 6.3 Luồng Rút tiền Giảng viên

```
Doanh thu từ bán khóa học → Wallet (chia theo Commission ratio)
    ↓
Giảng viên tạo Payout Request (status: PENDING)
    ↓
Admin xử lý Payout → PayOS Payout API (tự động chuyển khoản)
    ↓
PayoutReconciliationScheduler đối soát kết quả
    ↓
Payout (status: COMPLETED) → Trừ Wallet
```

---

## 7. Giao tiếp giữa các Phân hệ

| Từ | Đến | Phương thức | Mô tả |
|----|-----|------------|-------|
| Web/Mobile | Server | REST API (Axios → Spring) | Tất cả CRUD operations |
| Web/Mobile | Server | WebSocket (SockJS/STOMP) | Thông báo real-time, cập nhật thanh toán, chat messaging (học viên ↔ giảng viên), server metrics |
| Server | PayOS/VNPay | REST API | Tạo link thanh toán, webhook/polling |
| Server | Cloudinary | REST API | Upload/delete ảnh |
| Server | Bunny.net | REST API + TUS Protocol | Upload/stream video, lưu tài liệu |
| Server | Redis | Spring Data Redis | Cache, OTP, Draft auto-save |
| Server | PostgreSQL | Spring Data JPA + Flyway | CRUD + Database migration |
| Server | MongoDB | Spring Data MongoDB | AI Chat Sessions |
| Server | OpenRouter/DeepSeek | REST API | AI Chat |
| Server | Gmail SMTP | Spring Mail | Email notifications |
| Cloudflare Tunnel | Server + Web | HTTP Proxy | Production routing (domain → containers) |

---

## 8. Domain Production

- **Domain**: `gnostica.io.vn`
- **Routing qua Cloudflare Tunnel**:
  - `/api/*` → `http://server:8080`
  - `/ws/*` → `http://server:8080`
  - `*` (tất cả còn lại) → `http://web:80` (Nginx serving React SPA)
