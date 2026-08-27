# Tính năng Chi tiết - Gnostica E-Learning 🌟

> **Mục đích tài liệu:** Mô tả đầy đủ, chi tiết các tính năng của hệ thống theo từng vai trò người dùng, kèm theo luồng hoạt động (workflow), công nghệ sử dụng, và mapping tới mã nguồn (file, endpoint, bảng DB). Dùng để AI hoàn thiện tài liệu tính năng và viết báo cáo.

---

## 1. Tổng quan Vai trò Người dùng

| Vai trò | Mô tả | Số lượng trang Web | Mobile |
|---------|-------|-------------------|--------|
| **Learner (USER)** | Học viên — mua và học khóa học | 20+ trang | ✅ Đầy đủ |
| **Instructor** | Giảng viên — tạo và quản lý khóa học, doanh thu | 8+ trang | ⚠️ Giới hạn |
| **Admin** | Quản trị viên — quản lý toàn hệ thống | 15+ trang | ❌ Không có |
| **Guest** | Khách (chưa đăng nhập) — xem khóa học, forum | 15+ trang | ✅ |

---

## 2. Tính năng dành cho Khách (Guest / Public)

### 2.1 Trang chủ & Khám phá

| Tính năng | Mô tả | Web Page | API Endpoint |
|-----------|-------|----------|-------------|
| **Hero Banner** | Slideshow banner quảng cáo | `HomePage` | `GET /api/banners` |
| **Khóa học nổi bật** | Danh sách khóa học được đề xuất | `HomePage` | `GET /api/courses?featured=true` |
| **Danh mục khóa học** | Cây danh mục đa cấp | `CourseCatalog`, `CourseCategory` | `GET /api/categories` |
| **Danh sách giảng viên** | Trang hiển thị các giảng viên | `InstructorList` | `GET /api/instructors` |

### 2.2 Tìm kiếm Khóa học

| Tính năng | Mô tả | Công nghệ |
|-----------|-------|-----------|
| **Tìm kiếm Fuzzy** | Tìm kiếm thông minh, chấp nhận typo | `fuse.js` (client-side) |
| **Lọc theo danh mục** | Filter theo category tree | Server-side query |
| **Lịch sử tìm kiếm** | Lưu lịch sử tìm kiếm gần đây | `localStorage` via `useRecentSearchHistory` |
| **Typewriter placeholder** | Hiệu ứng gợi ý trong ô tìm kiếm | `useTypewriterPlaceholder` |

### 2.3 Chi tiết Khóa học

| Tính năng | Mô tả | DB Table |
|-----------|-------|----------|
| **Thông tin khóa học** | Title, description (Rich Text), thumbnail, promo video | `Courses` |
| **Giáo trình (Curriculum)** | Danh sách Module → Lesson (expandable) | `Modules`, `Lessons` |
| **Đánh giá (Reviews)** | Rating 1-5 sao, comment, phân bố đánh giá | `Reviews` |
| **Giảng viên** | Hồ sơ giảng viên, số học viên, rating trung bình | `Accounts` |
| **Giá & Giảm giá** | Giá gốc, % giảm giá, giá sau giảm | `Courses.price`, `Courses.discount` |
| **Preview bài giảng** | Một số bài giảng miễn phí có thể xem trước | `Lessons.metadata` (preview config) |

### 2.4 Diễn đàn (Forum)

| Tính năng | Mô tả | DB Table |
|-----------|-------|----------|
| **Xem Topics** | Danh sách chủ đề forum | `Topics` |
| **Xem Threads** | Danh sách bài viết theo topic | `Threads` |
| **Xem Chi tiết Thread** | Nội dung bài viết + bình luận | `Threads`, `Comments` |
| **Xem Hashtags** | Hashtag trending | `Hashtags` |

### 2.5 Trang Tĩnh (CMS)

| Tính năng | Path | DB Table |
|-----------|------|----------|
| **Điều khoản sử dụng** | `/terms/*` | `Term_Modules`, `Terms` |
| **Chính sách bảo mật** | `/privacy` | `Pages` |
| **Giới thiệu** | `/about` | Static page |
| **Trang nội dung CMS** | `/*` (catch-all) | `Pages` |

---

## 3. Tính năng dành cho Học viên (Learner/USER)

### 3.1 Xác thực (Authentication)

| Tính năng | Mô tả | Luồng hoạt động |
|-----------|-------|-----------------|
| **Đăng ký** | Email + password, gửi OTP | Register → OTP email → Verify → Active |
| **Đăng nhập** | Email/password hoặc Google | Login → JWT token → Store |
| **Google Login (Web)** | OAuth2 via server redirect | Click → `/api/oauth2/authorization/google` → Google → Callback → JWT |
| **Google Login (Mobile)** | OAuth2 via WebBrowser | Click → In-app browser → Google → Deep link `gnostica://auth/callback` → JWT |
| **Quên mật khẩu** | OTP qua email | Forgot → OTP → Verify → New password |
| **Đổi mật khẩu** | Trong trang Settings | Old password → New password |
| **OTP** | 6 chữ số, lưu Redis, TTL 5 phút | `OtpService` → Redis `otp:<email>` |

### 3.2 Giỏ hàng & Thanh toán

| Tính năng | Mô tả | Luồng |
|-----------|-------|-------|
| **Thêm giỏ hàng** | Thêm khóa học vào giỏ | Click "Thêm vào giỏ" → Create Order |
| **Áp dụng Coupon** | Nhập mã giảm giá | Validate → Tính coupon_price → Cập nhật total |
| **Thanh toán PayOS** | Quét QR code → tự động xác nhận | Tạo payment link → Hiển thị QR → Webhook/Polling → Enrollment |
| **Thanh toán VNPay** | Redirect sang cổng VNPay | Tạo payment URL → Redirect → Return URL → Verify |
| **Tặng khóa học (Gift)** | Mua khóa học tặng người khác | Tạo Gift (token + gift_code) → Gửi link → Người nhận accept/reject (hết hạn sau X ngày) |
| **Hoàn tiền (Refund)** | Yêu cầu hoàn tiền khóa học | Tạo Refund request → Admin duyệt/từ chối → hoàn tiền vào ví |

**Quy tắc hoàn tiền:**
- Tự động duyệt nếu yêu cầu ≤ 14 ngày kể từ khi thanh toán và tiến độ học < 20%.
- Tự động từ chối nếu > 30 ngày.
- Trường hợp còn lại chuyển cho Admin xử lý thủ công (approve/reject kèm lý do).
- Khi hoàn tiền: đơn chuyển REFUNDED, trả lại coupon, hủy enrollment, hoàn tiền vào ví (addRefund).

**Công thức thanh toán:**
```
subtotal = Σ(course.price × (1 - course.discount/100))
total = max(0, subtotal - coupon_price)
```

### 3.3 Không gian Học tập (Learning Workspace)

| Tính năng | Mô tả | Công nghệ |
|-----------|-------|-----------|
| **Video Player** | Phát video bài giảng (HLS stream) | Bunny.net CDN, `react-resizable-panels` |
| **Theo dõi tiến độ** | Lưu bài giảng gần nhất, % hoàn thành | `Lesson_Progress`, `Enrollments.progress` |
| **Tài liệu đính kèm** | Download tài liệu bài giảng | `Attachments`, Bunny.net Storage |
| **Nội dung bài giảng** | Rich text content kèm video | `Lessons.content`, DOMPurify sanitize |
| **Resizable panels** | Tùy chỉnh kích thước video/nội dung | `react-resizable-panels` |
| **CDN Token Auth** | Bảo vệ video (optional) | `BunnyNetService.generateSignedUrl()` |

### 3.4 Bài kiểm tra (Quiz)

| Tính năng | Mô tả | DB Table |
|-----------|-------|----------|
| **Làm bài trắc nghiệm** | Chọn đáp án, submit | `Quizzes`, `Quiz_Questions`, `Questions` |
| **Giới hạn lần thử** | max_attempts cấu hình theo quiz | `Quizzes.max_attempts` |
| **Điểm đỗ** | passing_score cấu hình | `Quizzes.passing_score` |
| **Xem kết quả** | Điểm, đáp án đúng, giải thích | `Quiz_Results.response_detail` |
| **Lịch sử làm bài** | Xem các lần làm bài trước | `Quiz_Results` |

### 3.5 Chứng chỉ (Certificate)

| Tính năng | Mô tả | Công nghệ |
|-----------|-------|-----------|
| **Tự động cấp** | Khi hoàn thành ≥ X% + pass quiz bắt buộc | `CourseCompletionEmailJob`, `Enrollments.certificate_url` |
| **Tải PDF** | Generate chứng chỉ PDF | `html2canvas` + `jsPDF` (web), `html-to-image` |
| **Tải Image** | Generate chứng chỉ PNG | `html-to-image` |
| **Hiệu ứng ăn mừng** | Confetti animation khi nhận chứng chỉ | `canvas-confetti` |

### 3.6 Tương tác Cộng đồng

| Tính năng | Mô tả | DB Table |
|-----------|-------|----------|
| **Đánh giá khóa học** | Rating 1-5 sao + comment | `Reviews` |
| **Tạo bài viết Forum** | Viết bài (Rich Text), gắn hashtag | `Threads`, `Thread_Hashtags` |
| **Bình luận** | Comment bài viết, reply lồng nhau | `Comments` (polymorphic) |
| **Vote** | Upvote/Downvote bài viết, comment | `Votes` (polymorphic) |
| **Follow giảng viên** | Theo dõi để nhận cập nhật | `Follows` |
| **Báo cáo vi phạm** | Report bài viết/comment | `Reports` (polymorphic) |

### 3.7 Thông báo Real-time

| Tính năng | Mô tả | Công nghệ |
|-----------|-------|-----------|
| **WebSocket** | Nhận thông báo tức thời | SockJS + STOMP (`/ws` endpoint) |
| **Thông báo thanh toán** | Cập nhật trạng thái đơn hàng | `PaymentStatusWebSocketPublisher` |
| **Thông báo hệ thống** | Bài viết mới, comment mới, etc. | `NotificationService` + WebSocket |
| **Badge count** | Đếm thông báo chưa đọc | `Notifications.is_read` |

### 3.8 Quản lý Tài khoản

| Tính năng | Mô tả | Page |
|-----------|-------|------|
| **Tổng quan** | Thông tin tài khoản, thống kê | `AccountOverview` |
| **Khóa học của tôi** | Danh sách khóa học đã mua | `MyCourses` |
| **Chứng chỉ** | Danh sách chứng chỉ đã nhận | `CertificatesPage` |
| **Wishlist** | Khóa học yêu thích | `WishlistPage` |
| **Đơn hàng** | Lịch sử đơn hàng | `OrdersPage` |
| **Hoàn tiền** | Yêu cầu hoàn tiền | `RefundsPage` |
| **Mã giảm giá** | Voucher khả dụng | `VouchersPage` |
| **Thông báo** | Danh sách thông báo | `NotificationsPage` |
| **Cài đặt** | Cập nhật profile, avatar | `SettingsPage` |
| **Đổi mật khẩu** | Thay đổi mật khẩu | `ChangePassword` |
| **Đang theo dõi** | Giảng viên đang follow | `FavoriteInstructors` |
| **Cắt ảnh avatar** | Crop ảnh trước upload | `react-easy-crop` |

### 3.9 Đăng ký làm Giảng viên

| Tính năng | Mô tả | Luồng |
|-----------|-------|-------|
| **Apply Instructor** | Điền form đăng ký | Submit → Pending → Admin review → Approve/Reject |

### 3.10 Nhắn tin với giảng viên (Messaging)

| Tính năng | Mô tả | Công nghệ |
|-----------|-------|-----------|
| **Hội thoại theo khóa học** | Học viên ↔ giảng viên chat trong bối cảnh khóa học đã mua | `Conversations` (unique course+student+instructor) |
| **Gửi/nhận tin nhắn** | Tin nhắn text (tối đa 5000 ký tự) | `POST /api/conversations/{id}/messages`, `Messages` |
| **Realtime** | Nhận tin nhắn mới tức thời, cập nhật danh sách hội thoại | WebSocket STOMP `/user/{email}/queue/messages`, `/user/{email}/queue/conversations` |
| **Đã đọc (Read receipt)** | Đánh dấu đã đọc, đếm tin chưa đọc | `Conversation_Participants.last_read_message_id`, `/user/{email}/queue/read-receipts` |
| **Chống gửi trùng** | Idempotency qua client_message_id | Unique `(sender_id, client_message_id)` |

> Web: `/account/messages` (học viên), `/instructor/messages` (giảng viên). Mobile chưa có tính năng này (chỉ có AI chat).

---

## 4. Tính năng dành cho Giảng viên (Instructor)

### 4.1 Dashboard Thống kê

| Tính năng | Mô tả | Công nghệ |
|-----------|-------|-----------|
| **Tổng doanh thu** | Tổng tiền thu được (sau commission) | `InstructorDashboardStatsDTO` |
| **Số học viên** | Tổng số enrollment | `Recharts` |
| **Biểu đồ doanh thu** | Theo tháng/tuần | `Recharts` bar/line chart |
| **Top khóa học** | Khóa học bán chạy nhất | `CoursePerformanceDTO` |
| **Phân bố đánh giá** | Rating distribution | `RatingDistributionDTO` |

### 4.2 Quản lý Khóa học

| Tính năng | Mô tả | Luồng |
|-----------|-------|-------|
| **Tạo khóa học** | Form: title, description (Rich Text), thumbnail, price, level, category | Create → Draft |
| **Quản lý Module** | Thêm/sửa/xóa chương, kéo thả sắp xếp | CRUD Modules (sort_order) |
| **Quản lý Lesson** | Upload video (Bunny.net TUS), soạn nội dung | Upload → Processing → Ready |
| **Upload tài liệu** | Đính kèm file cho module | Bunny.net Storage |
| **Draft/Publish** | Chỉnh sửa mà không ảnh hưởng học viên | Versioning (v1 Published, v2 Draft) |
| **Ngân hàng câu hỏi** | Tạo câu hỏi trắc nghiệm (JSONB answer) | `Questions` |
| **Tạo Quiz** | Chọn câu hỏi, cấu hình passing_score, max_attempts | `Quizzes`, `Quiz_Questions` |
| **Auto-save Draft** | Lưu tự động bản nháp | Redis (`RedisDraftService`) |
| **AI hỗ trợ** | AI tạo mô tả, outcomes, requirements | OpenRouter (Gemini 2.5 Flash Lite) |

**Luồng Submit khóa học:**
```
Draft → Submit Review (PENDING) → Admin Review
  ├── Approve → Published (merge vào bản gốc)
  └── Reject → Rejected (kèm lý do, metadata.rejectionReason)
```

### 4.3 Quản lý Mã giảm giá (Coupon)

| Tính năng | Mô tả | DB Table |
|-----------|-------|----------|
| **Tạo coupon** | Mã giảm giá (%) hoặc số tiền cố định | `Coupons` |
| **Scope coupon** | Áp dụng cho khóa học cụ thể, danh mục, hoặc toàn bộ | `Coupons.metadata` |
| **Giới hạn** | Số lượng, thời gian, số lần dùng/user | `Coupons.quantity`, `valid_from/until` |
| **Mã hóa** | Mã coupon được encrypt | `CouponCodeCipher` |

### 4.4 Quản lý Tài chính

| Tính năng | Mô tả | DB Table |
|-----------|-------|----------|
| **Xem số dư ví** | Tổng tiền trong wallet | `Wallets` |
| **Xem Commission** | Tỷ lệ chia sẻ doanh thu | `Commissions` |
| **Thêm tài khoản ngân hàng** | Liên kết bank account | `Account_Banks`, `Banks` |
| **Yêu cầu rút tiền** | Tạo payout request | `Payouts` → Admin approve |
| **Lịch sử rút tiền** | Theo dõi trạng thái payout | `Payouts.status` |

### 4.5 Tương tác Học viên

| Tính năng | Mô tả | Page |
|-----------|-------|------|
| **Xem học viên** | Danh sách học viên theo khóa học | `InstructorStudents` |
| **Hỏi đáp (Q&A)** | Trả lời câu hỏi học viên | `InstructorQA` |
| **Phản hồi review** | Reply đánh giá khóa học | `Reviews.parent_id` |

---

## 5. Tính năng dành cho Quản trị viên (Admin)

### 5.1 Dashboard Tổng quan

| Tính năng | Mô tả | DTO |
|-----------|-------|-----|
| **Tổng doanh thu nền tảng** | Tổng revenue toàn hệ thống | `DashboardStatsResponse` |
| **Số người dùng** | Tổng users, mới trong tuần/tháng | `StudentStatsResponse` |
| **Biểu đồ** | Revenue, enrollments, users theo thời gian | `Recharts` |
| **Đơn hàng gần đây** | Danh sách đơn mới nhất | `RecentOrderDTO` |

### 5.2 Quản lý Người dùng

| Tính năng | Mô tả | Page |
|-----------|-------|------|
| **Danh sách users** | Tìm kiếm, filter theo role/status | `AdminUsers` |
| **Chi tiết user** | Xem profile, courses, orders | `AdminUserDetailController` |
| **Ban/Unban** | Khóa/mở khóa tài khoản | `Accounts.status` = 2 (Banned) |
| **Duyệt Instructor** | Phê duyệt đơn đăng ký giảng viên | `AdminRequests` |

### 5.3 Kiểm duyệt Khóa học

| Tính năng | Mô tả | Page |
|-----------|-------|------|
| **Danh sách chờ duyệt** | Khóa học status=PENDING | `AdminCourseModeration` |
| **Chi tiết duyệt** | Xem toàn bộ nội dung khóa học | `AdminCourseDetailModeration` |
| **Approve** | Duyệt → merge vào bản Published | Course.status → PUBLISHED |
| **Reject** | Từ chối + lý do | Course.status → REJECTED + metadata.rejectionReason |

### 5.4 Quản lý Nội dung

| Tính năng | Page | DB Table |
|-----------|------|----------|
| **Quản lý danh mục** | `AdminCategories` | `Categories` |
| **Quản lý banner** | `AdminSettings` | `Banners` |
| **Quản lý trang CMS** | `AdminSettings` | `Pages` |
| **Quản lý điều khoản** | `AdminSettings` | `Term_Modules`, `Terms` |
| **Quản lý ngân hàng** | `AdminBanks` | `Banks` |
| **Đồng bộ ngân hàng** | Sync từ VietQR API | `BankSyncService` |

### 5.5 Quản lý Tài chính

| Tính năng | Page | Mô tả |
|-----------|------|-------|
| **Đơn hàng** | `AdminOrders` | Xem/filter đơn hàng |
| **Giao dịch** | `AdminTransactions` | Lịch sử payment |
| **Mã giảm giá** | `AdminCoupons` | Quản lý coupons toàn hệ thống |
| **Commission** | `AdminSettings` | Thiết lập tỷ lệ commission |
| **Xử lý rút tiền** | `AdminRequests` | Approve/Reject payout |
| **Hoàn tiền** | `AdminRequests` | Xử lý refund requests |

### 5.6 Kiểm duyệt Cộng đồng

| Tính năng | Page | Mô tả |
|-----------|------|-------|
| **Duyệt bài forum** | `AdminThreadModeration` | Approve/Reject threads |
| **Quản lý báo cáo** | `AdminReports` | Xử lý reports vi phạm |
| **Quản lý đánh giá** | `AdminReviews` | Ẩn/hiển thị reviews |

### 5.7 Cấu hình Hệ thống

| Tính năng | Mô tả | DB Table |
|-----------|-------|----------|
| **System Configs** | Key-value configs động | `System_Configs` |
| **Ví dụ configs** | MAX_UPLOAD_SIZE, DEFAULT_COMMISSION, MAINTENANCE_MODE | `config_key`, `config_value`, `config_type` |

---

## 6. Tính năng Mobile App

### 6.1 Đầy đủ cho Learner

| Tính năng | Có trên Mobile | Ghi chú |
|-----------|---------------|---------|
| Đăng nhập/Đăng ký | ✅ | Google OAuth qua WebBrowser |
| Trang chủ & Khám phá | ✅ | |
| Chi tiết khóa học | ✅ | |
| Giỏ hàng & Thanh toán | ✅ | PayOS QR qua WebView |
| Video bài giảng | ✅ | Expo Video / RN Video |
| Làm Quiz | ✅ | |
| Forum | ✅ | |
| Profile & Settings | ✅ | |
| Thông báo | ✅ | |
| Trợ lý AI (Chat) | ✅ | `AiChatScreen`, REST `POST /ai/chat`, quota 15 lượt/ngày |

### 6.2 Giới hạn

| Tính năng | Mobile | Lý do |
|-----------|--------|-------|
| Admin Dashboard | ❌ | Quá phức tạp cho mobile |
| Instructor Dashboard | ⚠️ Giới hạn | Chỉ xem cơ bản |
| Tạo/Edit khóa học | ❌ | Cần Rich Text editor, drag-drop |
| Certificate download | ⚠️ | Qua WebView/Share |
| Nhắn tin giảng viên–học viên (Messaging) | ❌ | Backend + Web đã có; Mobile chưa triển khai (chỉ có AI chat) |

---

## 7. Tính năng Cross-cutting (Xuyên suốt)

### 7.1 AI Integration

| Tính năng | Mô tả | Service |
|-----------|-------|---------|
| **AI Chat** | Hỗ trợ học tập (hỏi đáp) | `OpenRouterAiService` (Gemini 2.5 Flash Lite) |
| **AI Moderation** | Kiểm duyệt nội dung tự động | `AiModerationService` |
| **AI Course Content** | Tạo mô tả, outcomes, requirements | `AiService` |
| **Chat History** | Lưu lịch sử chat | MongoDB `ChatSession` |
| **AI Fallback** | DeepSeek khi OpenRouter lỗi | `DeepSeek API` |

### 7.2 Email Notifications

| Event | Email | Template |
|-------|-------|----------|
| Đăng ký | OTP verification | Thymeleaf |
| Quên mật khẩu | OTP reset | Thymeleaf |
| Thanh toán thành công | Order confirmation | Thymeleaf |
| Hoàn thành khóa học | Certificate notification | Thymeleaf |
| Instructor approved | Welcome email | Thymeleaf |
| Payout completed | Payout confirmation | Thymeleaf |

### 7.3 File Upload & Media

| Loại | Service | CDN |
|------|---------|-----|
| **Ảnh** (avatar, thumbnail) | Cloudinary | Cloudinary CDN |
| **Video** bài giảng | Bunny.net Stream (TUS upload) | Bunny.net CDN (HLS) |
| **Tài liệu** đính kèm | Bunny.net Storage | Bunny.net Storage CDN |
| **Transcript video** | `BunnyTranscriptionService` | Auto-generated |
| **OCR** tài liệu | `FptOcrService` | FPT AI |

### 7.4 Real-time Features

| Feature | Protocol | Endpoint |
|---------|----------|----------|
| Thông báo | WebSocket (STOMP) | `/ws` |
| Trạng thái thanh toán | WebSocket | `/topic/payment/{orderId}` |
| Chat giảng viên – học viên (Messaging) | WebSocket (STOMP, subscribe-only) | `/user/{email}/queue/messages`, `/user/{email}/queue/conversations`, `/user/{email}/queue/read-receipts` |
| Server metrics (Admin) | WebSocket (STOMP) | `/topic/metrics` |
