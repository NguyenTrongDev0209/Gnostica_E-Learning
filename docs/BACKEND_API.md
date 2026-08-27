# Backend API - Gnostica Server 🖥️

> **Mục đích tài liệu:** Chi tiết kỹ thuật của phân hệ Backend, bao gồm cấu trúc mã nguồn, danh sách API endpoints, cấu hình, database migrations, và các service tích hợp. Dùng để AI hoàn thiện tài liệu API và báo cáo kỹ thuật.

---

## 1. Thông tin Tổng quan

| Thuộc tính | Giá trị |
|-----------|---------|
| **Framework** | Spring Boot 4.0.5 |
| **Java Version** | 17 |
| **Build Tool** | Maven |
| **Packaging** | WAR |
| **Group ID** | `com.gnostica` |
| **Artifact ID** | `gnostica-server` |
| **Port mặc định** | 8080 |
| **API Base Path** | `/api` |
| **Database Migration** | Flyway |
| **ORM** | Spring Data JPA (Hibernate) |

---

## 2. Danh sách Dependencies Chính

### 2.1 Core Spring Boot Starters
| Starter | Mục đích |
|---------|---------|
| `spring-boot-starter-web` | REST API |
| `spring-boot-starter-data-jpa` | ORM/Repository |
| `spring-boot-starter-data-mongodb` | MongoDB integration |
| `spring-boot-starter-data-redis` | Redis cache |
| `spring-boot-starter-security` | Authentication/Authorization |
| `spring-boot-starter-oauth2-client` | Google OAuth2 login |
| `spring-boot-starter-mail` | Email (Gmail SMTP) |
| `spring-boot-starter-validation` | Bean Validation |
| `spring-boot-starter-websocket` | Real-time notifications |
| `spring-boot-starter-thymeleaf` | Email templates |

### 2.2 Thư viện Bên ngoài
| Thư viện | Version | Mục đích |
|---------|---------|---------|
| `jjwt-api/impl/jackson` | 0.12.5 | JWT token generation/validation |
| `payos-java` | 2.0.1 | PayOS payment gateway |
| `cloudinary-http44` | 1.36.0 | Image upload/management |
| `dotenv-java` | 3.1.0 | Load `.env` file |
| `pdfbox` | 3.0.2 | PDF processing |
| `poi-ooxml` | 5.2.5 | Excel/Word processing |
| `flyway-core` + `flyway-database-postgresql` | (managed) | Database migration |
| `gson` | (managed) | JSON processing |
| `jackson-datatype-jsr310` | (managed) | Java 8+ Date/Time support |
| `lombok` | (managed) | Boilerplate code reduction |

---

## 3. Cấu trúc Package Chi tiết

### 3.1 Package `core` — Lớp nền tảng

#### `core.config` — Cấu hình Spring Bean
| File | Mô tả |
|------|-------|
| `SecurityConfig.java` | Cấu hình Spring Security, CORS, filter chain, endpoint permissions |
| `RedisConfig.java` | Cấu hình kết nối Redis, RedisTemplate |
| `CloudinaryConfig.java` | Cấu hình Cloudinary SDK |
| `PayOSConfig.java` | Cấu hình PayOS credentials |
| `VNPayProperties.java` | Properties mapping cho VNPay |
| `BunnyNetConfig.java` | Cấu hình Bunny.net Stream (video) |
| `BunnyStorageConfig.java` | Cấu hình Bunny.net Storage (documents) |
| `MongoConfig.java` | Cấu hình MongoDB connection |
| `WebSocketConfig.java` | Cấu hình STOMP/WebSocket endpoint `/ws` |
| `FlywayConfig.java` | Cấu hình Flyway migration |
| `JacksonConfig.java` | Cấu hình JSON serialization |
| `RestTemplateConfig.java` | Cấu hình RestTemplate |
| `DatabaseCleanupConfig.java` | Cấu hình dọn dẹp dữ liệu cũ |
| `DotenvEnvironmentPostProcessor.java` | Load `.env` trước khi Spring khởi động |

#### `core.security` — Bảo mật
| File | Mô tả |
|------|-------|
| `JwtProvider.java` | Tạo/verify JWT token (HMAC SHA-256) |
| `JwtAuthenticationFilter.java` | Filter xác thực JWT trên mỗi request |
| `CustomUserDetailsService.java` | Load user từ DB cho Spring Security |
| `CustomOAuth2UserService.java` | Xử lý thông tin user từ Google OAuth2 |
| `OAuth2SuccessHandler.java` | Redirect sau OAuth2 thành công (JWT → web/mobile callback) |
| `OAuth2FailureHandler.java` | Xử lý lỗi OAuth2 |
| `CouponCodeCipher.java` | Mã hóa/giải mã mã coupon |

#### `core.model` — JPA Entities (48 models)

Danh sách entities tương ứng với 48 bảng trong database:

| Entity | Table | PK Type | Mô tả |
|--------|-------|---------|-------|
| `Account` | accounts | UUID | Tài khoản người dùng |
| `AccountBank` | account_banks | UUID | Tài khoản ngân hàng liên kết |
| `Attachment` | attachments | INT (Identity) | Tài liệu đính kèm module |
| `Bank` | banks | INT (Identity) | Danh sách ngân hàng |
| `Banner` | banners | INT (Identity) | Banner trang chủ |
| `Category` | categories | INT (Identity) | Danh mục khóa học (cây đa cấp) |
| `Comment` | comments | INT (Identity) | Bình luận (polymorphic target) |
| `Commission` | commissions | INT (Identity) | Tỷ lệ hoa hồng (append-only) |
| `Coupon` | coupons | UUID | Mã giảm giá |
| `Course` | courses | UUID | Khóa học (có versioning) |
| `Device` | devices | UUID | Thiết bị đăng nhập |
| `Enrollment` | enrollments | INT (Identity) | Ghi danh khóa học |
| `Favorite` | favorites | INT (Identity) | Wishlist/yêu thích |
| `Follow` | follows | INT (Identity) | Theo dõi giảng viên |
| `Gift` | gifts | — | Tặng khóa học |
| `Hashtag` | hashtags | INT (Identity) | Hashtag forum |
| `Lesson` | lessons | INT (Identity) | Bài giảng (có versioning) |
| `LessonProgress` | lesson_progress | INT (Identity) | Tiến độ bài giảng |
| `Log` | logs | INT (Identity) | Audit log |
| `Member` | members | INT (Identity) | Thành viên topic |
| `Module` | modules | INT (Identity) | Chương/module khóa học (có versioning) |
| `Notification` | notifications | INT (Identity) | Thông báo |
| `Order` | orders | UUID | Đơn hàng |
| `OrderDetail` | order_details | UUID | Chi tiết đơn hàng (snapshot giá) |
| `Page` | pages | INT (Identity) | Trang tĩnh (CMS) |
| `Payment` | payments | UUID | Giao dịch thanh toán |
| `Payout` | payouts | UUID | Yêu cầu rút tiền |
| `Question` | questions | INT (Identity) | Câu hỏi trắc nghiệm (có versioning) |
| `Quiz` | quizzes | INT (Identity) | Bài kiểm tra (có versioning) |
| `QuizQuestion` | quiz_questions | INT (Identity) | Bảng nối quiz-question |
| `QuizResult` | quiz_results | INT (Identity) | Kết quả làm bài |
| `Refund` | refunds | — | Yêu cầu hoàn tiền |
| `Report` | reports | INT (Identity) | Báo cáo vi phạm |
| `Review` | reviews | INT (Identity) | Đánh giá khóa học |
| `Role` | roles | INT (Identity) | Vai trò (ADMIN, INSTRUCTOR, USER) |
| `Support` | supports | INT (Identity) | Ticket hỗ trợ |
| `SystemConfig` | system_configs | INT (Identity) | Cấu hình hệ thống động |
| `Term` | terms | INT (Identity) | Trang điều khoản |
| `TermModule` | term_modules | INT (Identity) | Nhóm điều khoản |
| `Thread` | threads | INT (Identity) | Bài viết forum |
| `ThreadHashtag` | thread_hashtags | INT (Identity) | Bảng nối thread-hashtag |
| `Topic` | topics | INT (Identity) | Topic/danh mục forum |
| `Vote` | votes | INT (Identity) | Vote (polymorphic target) |
| `Wallet` | wallets | UUID | Ví tiền giảng viên |
| `Conversation` | conversations | UUID | Hội thoại chat (học viên ↔ giảng viên theo khóa học) |
| `ConversationParticipant` | conversation_participants | UUID | Thành viên hội thoại (role STUDENT/INSTRUCTOR) |
| `Message` | messages | UUID | Tin nhắn trong hội thoại |
| `ReplyTemplate` | reply_templates | INT (Identity) | Mẫu trả lời nhanh của giảng viên |

#### `core.repository` — Spring Data JPA Repositories
Mỗi entity có một repository interface tương ứng kế thừa `JpaRepository`.

#### `core.event` & `core.listener` — Event-Driven Architecture
| Event | Listeners | Mô tả |
|-------|-----------|-------|
| `PaymentSuccessEvent` | `EnrollmentListener`, `WalletListener`, `MailListener` | Khi thanh toán thành công |
| `LogEvent` | `LogEventListener`, `AuditListener` | Ghi audit log |
| `PayoutSubmissionRequestedEvent` | `PayoutSubmissionListener` | Khi submit yêu cầu rút tiền |

#### `core.util` — Utilities
| File | Mô tả |
|------|-------|
| `AuthUtil.java` | Lấy thông tin user hiện tại từ SecurityContext |
| `DateTimeUtil.java` | Format date/time theo timezone `Asia/Ho_Chi_Minh` |
| `FileUtil.java` | Xử lý file upload |
| `SlugUtil.java` | Tạo slug từ tiêu đề (Vietnamese → ASCII) |
| `RandomUtil.java` | Tạo chuỗi ngẫu nhiên (OTP, token) |
| `VttParserUtil.java` | Parse file VTT (video subtitle/transcript) |
| `PolicyHtmlSanitizer.java` | Sanitize HTML content |

---

### 3.2 Package `modules` — Các Module Nghiệp vụ

#### Module `adminstats` — Thống kê Admin (kiểm duyệt)
| Controller | Endpoints chính |
|-----------|----------------|
| `AdminStatsController` | `GET /api/admin/stats/supports` — Thống kê ticket hỗ trợ |
| | `GET /api/admin/stats/refunds` — Thống kê yêu cầu hoàn tiền |
| | `GET /api/admin/stats/withdrawals` — Thống kê yêu cầu rút tiền |
| | `GET /api/admin/stats/thread-reports` — Thống kê báo cáo diễn đàn |

**Services**: `AdminStatsService` → `AdminStatsServiceImpl`

---

#### Module `auth` — Xác thực & Đăng ký
| Controller | Endpoints chính |
|-----------|----------------|
| `AuthController` | `POST /api/auth/register` — Đăng ký |
| | `POST /api/auth/login` — Đăng nhập (trả JWT) |
| | `POST /api/auth/google` — Đăng nhập Google (mobile) |
| | `POST /api/auth/verify-otp` — Xác thực OTP |
| | `POST /api/auth/forgot-password` — Quên mật khẩu |
| | `POST /api/auth/reset-password` — Đặt lại mật khẩu |

**Services**: `AuthService` → `AuthServiceImpl`, `OtpService` (Redis-based OTP)

---

#### Module `course` — Quản lý Khóa học
| Controller | Endpoints chính |
|-----------|----------------|
| `CourseController` | `GET /api/courses` — Danh sách khóa học (public, paginated) |
| | `GET /api/courses/{slug}` — Chi tiết khóa học |
| | `GET /api/courses/category/{slug}` — Khóa học theo danh mục |
| `DraftCourseController` | `POST /api/instructor/courses` — Tạo khóa học mới |
| | `PUT /api/instructor/courses/{id}` — Cập nhật khóa học |
| | `POST /api/instructor/courses/{id}/submit` — Submit duyệt |
| `CategoryController` | `GET /api/categories` — Danh sách danh mục |
| `EnrollmentController` | `GET /api/enrollments/my-courses` — Khóa học đã đăng ký |
| `CertificateController` | `GET /api/certificates/{enrollmentId}` — Lấy chứng chỉ |
| `LessonProgressController` | `POST /api/progress/{lessonId}` — Cập nhật tiến độ |
| `LessonPlaybackController` | `GET /api/lessons/{id}/playback` — URL phát video bài giảng |
| `QuestionBankController` | CRUD ngân hàng câu hỏi |
| `FavouriteController` | CRUD wishlist |

**Services**: `CourseService`, `DraftCourseService`, `CategoryService`, `EnrollmentService`, `LessonProgressService`, `LessonPlaybackService`, `QuizService`, `QuizResultService`, `QuestionBankService`

---

#### Module `checkout` — Thanh toán
| Controller | Endpoints chính |
|-----------|----------------|
| `OrderController` | `POST /api/checkout/orders` — Tạo đơn hàng |
| | `GET /api/checkout/orders` — Lịch sử đơn hàng |
| `PaymentController` | `POST /api/checkout/payments/payos` — Tạo link PayOS |
| | `POST /api/checkout/payments/vnpay` — Tạo link VNPay |
| | `POST /api/checkout/payments/payos/webhook` — Webhook PayOS |
| | `GET /api/checkout/payments/vnpay/return` — VNPay return URL |
| `CouponController` | `POST /api/checkout/coupons/validate` — Kiểm tra coupon |
| `GiftController` | CRUD quà tặng khóa học |
| `RefundController` | CRUD yêu cầu hoàn tiền |

**Schedulers**: `OrderCleanupScheduler` (hủy đơn hết hạn), `PayOSReconciliationScheduler`, `VNPayReconciliationScheduler`, `GiftExpiryScheduler`, `RefundAutoRejectScheduler`

**Services**: `OrderService`, `PaymentService`, `PayosService`, `VnpayService`, `CouponService`, `GiftService`, `RefundService`, `OrderPriceCalculator`

---

#### Module `dashboard` — Thống kê
| Controller | Endpoints chính |
|-----------|----------------|
| `DashboardController` | `GET /api/admin/dashboard` — Thống kê tổng quan Admin |
| `InstructorDashboardController` | `GET /api/instructor/dashboard` — Thống kê Instructor |

**DTOs**: `DashboardStatsResponse`, `InstructorDashboardStatsDTO`, `ChartDataDTO`, `CoursePerformanceDTO`, `RevenueMonthDTO`, `TopCourseDTO`, `MemberGrowthDTO`, `RecentOrderDTO`, `RatingDistributionDTO`

---

#### Module `forum` — Diễn đàn
| Controller | Endpoints chính |
|-----------|----------------|
| `ThreadController` | CRUD bài viết forum |
| `CommentController` | CRUD bình luận |
| `ForumCategoryController` | Quản lý topic/category forum |
| `ThreadReportController` | Báo cáo bài viết vi phạm |

**Services**: `ThreadService` → `ThreadServiceImpl`, `CommentService` → `CommentServiceImpl`

---

#### Module `integration` — Tích hợp bên ngoài
| Controller/Service | Mô tả |
|-----------|-------|
| `UploadController` | Upload file lên Cloudinary/Bunny.net |
| `AiController` | Chat AI (OpenRouter / DeepSeek) |
| `CloudinaryService` | Upload/delete ảnh |
| `BunnyNetService` | Upload/stream video (HLS), CDN token |
| `BunnyStorageService` | Upload/download tài liệu |
| `BunnyTranscriptionService` | Transcript tự động video |
| `OpenRouterAiService` | Gọi AI (Gemini 2.5 Flash Lite) |
| `AiModerationService` | AI kiểm duyệt nội dung |
| `FptOcrService` | OCR trích xuất văn bản |
| `DocumentExtractionService` | Trích xuất nội dung tài liệu PDF/DOCX |
| `MetricsPublisher` | Publish metrics (nếu có) |

**MongoDB Models**: `ChatSession` — lưu lịch sử chat AI

---

#### Module `messaging` — Chat học viên ↔ giảng viên
| Controller | Endpoints chính |
|-----------|----------------|
| `MessagingConversationController` | `POST /api/conversations` — Tạo/lấy hội thoại (theo studentId/instructorId) |
| | `GET /api/conversations` — Danh sách hội thoại (phân trang) |
| | `GET /api/conversations/{id}` — Chi tiết hội thoại |
| | `GET /api/conversations/{id}/messages` — Tin nhắn (cursor pagination) |
| | `POST /api/conversations/{id}/messages` — Gửi tin nhắn text |
| | `PATCH /api/conversations/{id}/read` — Đánh dấu đã đọc |

**Services**: `MessagingConversationService`, `MessagingMessageService` (+ `impl/`)

**Realtime**: `MessagingEventListener` (`@TransactionalEventListener AFTER_COMMIT`) dùng `SimpMessagingTemplate` push tới `/user/{email}/queue/messages`, `/user/{email}/queue/conversations`, `/user/{email}/queue/read-receipts`. Client chỉ subscribe (REST để gửi tin).

---

#### Module `user` — Quản lý Người dùng
| Controller | Endpoints chính |
|-----------|----------------|
| `InstructorProfileController` | `GET /api/instructors` — Danh sách giảng viên |
| `InstructorApplicationController` | `POST /api/apply-instructor` — Đăng ký làm giảng viên |
| `InstructorStudentController` | Quản lý học viên của giảng viên |
| `FollowingController` | Follow/Unfollow giảng viên |
| `NotificationController` | CRUD thông báo |
| `ReviewController` | CRUD đánh giá khóa học |
| `AdminUserDetailController` | Admin: quản lý chi tiết user |

**Services**: `FollowingService`, `NotificationService`, `ReviewService`, `InstructorApplicationService`, `AdminUserDetailService`

---

#### Module `wallet` — Tài chính Giảng viên
| Controller | Endpoints chính |
|-----------|----------------|
| `WalletController` | `GET /api/wallet` — Xem số dư ví |
| `PayoutsController` | `POST /api/payouts` — Tạo yêu cầu rút tiền |
| | `GET /api/payouts` — Lịch sử rút tiền |
| `CommissionController` | `GET /api/commissions` — Xem tỷ lệ hoa hồng |
| `BankController` | `GET /api/banks` — Danh sách ngân hàng |

**Services**: `WalletService`, `PayoutsService`, `PayoutSubmissionService`, `PayoutSecurityService`, `CommissionService`, `CommissionResolver`, `BankService`, `BankSyncService`

---

#### Module `settings` — Cài đặt Hệ thống
| Controller | Endpoints chính |
|-----------|----------------|
| `PublicSettingsController` | `GET /api/settings` — Cấu hình công khai |
| `PublicBannerController` | `GET /api/banners` — Banner public |
| `PublicPageController` | `GET /api/pages/{slug}` — Trang tĩnh |
| `PublicTermsController` | `GET /api/terms` — Menu điều khoản |
| `AdminSettingsController` | Admin: CRUD cấu hình hệ thống |
| `AdminBannerController` | Admin: CRUD banner |
| `AdminCategoryController` | Admin: CRUD danh mục |
| `AdminSupportController` | Admin: quản lý ticket hỗ trợ |
| `AdminTermsController` | Admin: quản lý trang điều khoản |
| `AdminTransactionController` | Admin: xem giao dịch tài chính |

---

## 4. Database Migrations (Flyway)

| Migration | Mô tả |
|-----------|-------|
| `V1__init_database.sql` | Khởi tạo toàn bộ 44 bảng, indexes, constraints |
| `V2__add_coupon_price_to_orders.sql` | Thêm cột `coupon_price` vào bảng Orders |
| `V3__secure_payout_reconciliation.sql` | Thêm `gateway_payout_id`, `gateway_reference_id` vào Payouts |
| `V4__harden_payout_submission.sql` | Thêm `idempotency_key`, `submission_attempts`, `last_submission_*` vào Payouts |
| `V5__add_support_code_to_supports.sql` | Thêm `support_code` (unique) vào Supports |
| `V6__add_refund_code_to_refunds.sql` | Thêm `refund_code` vào Refunds |
| `V7__allow_zero_amount_payments.sql` | Cho phép thanh toán 0đ (bỏ CHECK amount > 0) |
| `V8__add_messaging_tables.sql` | Tạo 3 bảng chat: conversations, conversation_participants, messages |
| `V9__add_payout_manual_approval.sql` | Rename `gateway_reference_id` → `payout_code`; thêm `metadata JSONB` |
| `V10__add_refund_decision_type.sql` | Thêm `decision_type` vào Refunds |
| `V11__strip_prefixes_and_rename_payment_code.sql` | Bỏ prefix RT/HT; rename `transaction_code` → `payment_code` |
| `V12__add_gift_code_to_gifts.sql` | Thêm `gift_code` (12 số) vào Gifts |
| `V13__add_reply_templates_table.sql` | Tạo bảng `reply_templates` |

---

## 5. Cấu hình Biến Môi trường

### 5.1 Biến Bắt buộc (xem `.env.example`)

| Biến | Mô tả |
|------|-------|
| `APP_ENV` | `development` hoặc `production` |
| `DB_URL` | JDBC URL PostgreSQL |
| `DB_USERNAME` / `DB_PASSWORD` | Credentials PostgreSQL |
| `JWT_SECRET` | Secret key cho JWT (nên dùng chuỗi dài, ngẫu nhiên) |
| `SPRING_MAIL_USERNAME` / `PASSWORD` | Gmail credentials (App Password) |
| `GOOGLE_CLIENT_ID` / `SECRET` | Google OAuth2 credentials |
| `PAYOS_CLIENT_ID` / `API_KEY` / `CHECKSUM_KEY` | PayOS payment gateway |
| `CLOUDINARY_CLOUD_NAME` / `API_KEY` / `API_SECRET` | Cloudinary |
| `BUNNY_STREAM_LIBRARY_ID` / `API_KEY` | Bunny.net video streaming |
| `BUNNY_STORAGE_ZONE_NAME` / `API_KEY` | Bunny.net document storage |
| `REDIS_HOST` / `PORT` / `PASSWORD` | Redis Cloud |
| `OPENROUTER_API_KEY` | OpenRouter AI service |

### 5.2 Biến Tùy chọn

| Biến | Mặc định | Mô tả |
|------|----------|-------|
| `PAYOS_WEBHOOK_ENABLED` | `false` | Bật webhook (production), polling (dev) |
| `PAYOS_RECONCILIATION_INTERVAL_MS` | `30000` | Chu kỳ polling PayOS (ms) |
| `APP_TIME_ZONE` | `Asia/Ho_Chi_Minh` | Timezone mặc định |
| `APP_SQL_LOGGING_ENABLED` | `false` | Hiển thị SQL queries |
| `VNPAY_*` | (sandbox) | VNPay configuration |
| `BUNNY_CDN_TOKEN_ENABLED` | `false` | Bật CDN token auth cho video |
| `DEEPSEEK_API_KEY` | (blank) | DeepSeek AI fallback |

---

## 6. Build & Run

### Development
```bash
cd gnostica-server
cp .env.example .env    # Cấu hình các biến môi trường
./mvnw spring-boot:run  # Chạy tại http://localhost:8080
```

### Production (Docker)
```bash
cd docker
docker compose -f docker-compose.production.yml up -d --build
```

### Docker Build
```dockerfile
# Stage 1: Build (Maven + JDK 17)
FROM maven:3.9-eclipse-temurin-17-alpine AS build
# Stage 2: Run (JRE 17)
FROM eclipse-temurin:17-jre-alpine
EXPOSE 8080
```
