# Kiến trúc Cơ sở Dữ liệu - Gnostica E-Learning 🗄️

> **Mục đích tài liệu:** Mô tả tổng quan kiến trúc cơ sở dữ liệu, nhóm bảng theo nghiệp vụ, các quyết định thiết kế quan trọng, và các mối quan hệ giữa các bảng. Tài liệu chi tiết từng bảng (cột, kiểu dữ liệu, constraints) xem tại `gnostica-server/erd_tables.md`.

---

## 1. Tổng quan

| Thuộc tính | Giá trị |
|-----------|---------|
| **RDBMS chính** | PostgreSQL 16 |
| **Số lượng bảng** | 48 |
| **ORM** | Spring Data JPA (Hibernate) |
| **Migration** | Flyway (13 migrations: V1–V13) |
| **Cache / Session** | Redis Cloud |
| **NoSQL** | MongoDB Atlas (Chat sessions) |
| **Timezone** | `Asia/Ho_Chi_Minh` |
| **DDL Strategy** | `ddl-auto=none` (Flyway quản lý hoàn toàn) |

---

## 2. Nhóm Bảng theo Nghiệp vụ

### 2.1 Quản lý Tài khoản & Phân quyền (6 bảng)

```
Roles ──1:N──→ Accounts ──1:N──→ Devices
                    │
                    ├──1:N──→ Follows (follower_id / followee_id)
                    ├──1:N──→ Logs (audit trail)
                    └──1:N──→ Notifications
```

| Bảng | Vai trò | PK |
|------|---------|-----|
| `Roles` | 3 role cố định: ADMIN, INSTRUCTOR, USER | INT |
| `Accounts` | Tài khoản người dùng (email unique, JSONB metadata) | UUID |
| `Devices` | Quản lý phiên đăng nhập / push token | UUID |
| `Follows` | Theo dõi giảng viên (follower → followee) | INT |
| `Logs` | Audit log (JSONB payload) | INT |
| `Notifications` | Thông báo hệ thống (real-time via WebSocket) | INT |

**Đặc điểm:**
- `Accounts.status`: 0=Unverified, 1=Active, 2=Banned, 3=Deleted
- `Accounts.metadata` (JSONB): Lưu thông tin mở rộng (bio, social links, instructor info)
- `Accounts.provider`: LOCAL, GOOGLE — phân biệt phương thức đăng nhập

---

### 2.2 Quản lý Khóa học & Nội dung (8 bảng)

```
Categories (self-ref parent_id)
    │
    └──1:N──→ Courses ──1:N──→ Modules ──1:N──→ Lessons
                │                  │
                │                  ├──1:N──→ Attachments
                │                  └──1:N──→ Quizzes ──M:N──→ Questions
                │                              │            (via Quiz_Questions)
                │                              └──1:N──→ Quiz_Results
                │
                └── original_course_id (self-ref, versioning)
```

| Bảng | Vai trò | PK | Versioning |
|------|---------|-----|-----------|
| `Categories` | Danh mục khóa học (cây đa cấp via `parent_id`) | INT | Không |
| `Courses` | Khóa học chính | UUID | ✅ `original_course_id`, `version_number` |
| `Modules` | Chương/mục trong khóa học | INT | ✅ `original_module_id` |
| `Lessons` | Bài giảng (video + content) | INT | ✅ `original_lesson_id` |
| `Attachments` | Tài liệu đính kèm (file_url, file_type) | INT | Không |
| `Questions` | Ngân hàng câu hỏi (JSONB answer) | INT | ✅ `original_question_id` |
| `Quizzes` | Bài kiểm tra (max_attempts, passing_score) | INT | ✅ `original_quiz_id` |
| `Quiz_Questions` | Bảng nối Quiz ↔ Question (sort_order) | INT | Không |

**Cơ chế Versioning:**
1. Bản gốc: `original_course_id = NULL`, `version_number = 1`, `status = PUBLISHED`
2. Tạo bản draft: `original_course_id = <id bản gốc>`, `version_number = 2`, `status = DRAFT`
3. Khi Admin duyệt: merge nội dung v2 vào v1, tăng `version_number` của v1
4. Áp dụng tương tự cho Modules, Lessons, Questions, Quizzes

**Course Status Flow:**
```
DRAFT(2) → PENDING(4) → PUBLISHED(1) | REJECTED(3)
                                ↓
                          Tạo DRAFT v2 → PENDING → merge vào v1
```

---

### 2.3 Bài thi & Kết quả (3 bảng)

| Bảng | Vai trò | PK |
|------|---------|-----|
| `Quizzes` | Cấu hình bài thi (max_attempts, passing_score) | INT |
| `Quiz_Questions` | Bảng nối, giữ sort_order | INT |
| `Quiz_Results` | Kết quả làm bài (JSONB response_detail) | INT |

**Quiz_Results.response_detail** (JSONB): Lưu câu trả lời chi tiết của học viên tại thời điểm nộp bài.

---

### 2.4 Tương tác & Cộng đồng (10 bảng)

```
Topics ──1:N──→ Threads ──M:N──→ Hashtags (via Thread_Hashtags)
   │              │
   └── Members    ├──1:N──→ Comments (polymorphic: target_type/target_id)
                  ├──1:N──→ Votes (polymorphic: target_type/target_id)
                  └──1:N──→ Reports (polymorphic: target_type/target_id)

Courses ──1:N──→ Reviews (rating 1-5, parent_id cho reply)
```

| Bảng | Vai trò | PK | Pattern |
|------|---------|-----|---------|
| `Topics` | Danh mục forum | INT | — |
| `Threads` | Bài viết forum (is_locked, is_pinned) | INT | — |
| `Thread_Hashtags` | Bảng nối thread-hashtag | INT | — |
| `Hashtags` | Hashtag (usage_count) | INT | — |
| `Members` | Thành viên topic | INT | — |
| `Comments` | Bình luận (hỗ trợ lồng via parent_id) | INT | **Polymorphic Target** |
| `Votes` | Vote/Reaction | INT | **Polymorphic Target** |
| `Reports` | Báo cáo vi phạm | INT | **Polymorphic Target** |
| `Reviews` | Đánh giá khóa học (1-5 sao) | INT | — |
| `Supports` | Ticket hỗ trợ/CSKH | INT | — |

**Polymorphic Target Pattern:**
- `target_type`: THREAD, LESSON, COMMENT, REVIEW, COURSE
- `target_id`: ID của đối tượng (VARCHAR để linh hoạt UUID/INT)
- Index: `(target_type, target_id)`

---

### 2.5 Tài chính & Thanh toán (10 bảng)

```
Accounts ──1:N──→ Orders ──1:N──→ Order_Details ──→ Courses (snapshot giá)
              │       │                    │
              │       ├── coupon_id → Coupons
              │       │
              │       └──1:N──→ Payments (PayOS/VNPay/Wallet transaction)
              │       └──1:N──→ Refunds (yêu cầu hoàn tiền)
              │
              ├──1:N──→ Wallets (số dư giảng viên)
              ├──1:N──→ Payouts (yêu cầu rút tiền)
              └──1:N──→ Account_Banks → Banks
```

| Bảng | Vai trò | PK |
|------|---------|-----|
| `Orders` | Đơn hàng (total_price, coupon_price, order_code) | UUID |
| `Order_Details` | Chi tiết đơn (snapshot price, discount, commission_id) | UUID |
| `Payments` | Giao dịch thanh toán (gateway, payment_code, amount) | UUID |
| `Coupons` | Mã giảm giá (encrypted code, JSONB metadata rules) | UUID |
| `Commissions` | Tỷ lệ hoa hồng (instructor_ratio, platform_ratio) | INT |
| `Wallets` | Ví tiền (remain, available_at) | UUID |
| `Payouts` | Yêu cầu rút tiền (payout_code, metadata, status 1–6) | UUID |
| `Refunds` | Yêu cầu hoàn tiền (refund_code, decision_type, status 1–3) | UUID |
| `Account_Banks` | Tài khoản ngân hàng liên kết | UUID |
| `Banks` | Danh sách ngân hàng (external_id, BIN) | INT |

**Quy tắc Hoàn tiền (Refund):**
- Tự động duyệt nếu yêu cầu ≤ 14 ngày kể từ khi thanh toán & tiến độ học < 20%.
- Tự động từ chối nếu > 30 ngày; trường hợp còn lại xử lý thủ công bởi Admin.
- `decision_type`: AUTO_APPROVED / AUTO_REJECTED / MANUAL_APPROVED / MANUAL_REJECTED.

**Công thức tính giá:**
```
subtotal = Σ(detail.price - detail.price × detail.discount / 100)
total_price = max(0, subtotal - coupon_price)
```

**Nguyên tắc Snapshot giá:**
- `Order_Details.price` = giá gốc khóa học TẠI THỜI ĐIỂM tạo đơn
- `Order_Details.discount` = % giảm giá khóa học TẠI THỜI ĐIỂM tạo đơn
- `Orders.coupon_price` = số tiền coupon đã chốt (không phải phần trăm)
- KHÔNG ĐỌC LẠI `Courses.price` khi đối soát

**Commission (Append-Only):**
- Đổi tỷ lệ → tạo bản ghi mới, KHÔNG sửa bản ghi cũ
- `instructor_ratio + platform_ratio = 100`
- `Order_Details.commission_id` trỏ đến bản ghi commission được áp dụng

---

### 2.6 Học tập & Chứng chỉ (4 bảng)

```
Accounts ──1:N──→ Enrollments ──→ Courses
              │       │
              │       └── order_detail_id → Order_Details (truy vết quyền học)
              │
              ├──1:N──→ Lesson_Progress (theo dõi tiến độ từng bài)
              ├──1:N──→ Favorites (wishlist)
              └──1:N──→ Gifts (tặng khóa học)
```

| Bảng | Vai trò | PK |
|------|---------|-----|
| `Enrollments` | Ghi danh khóa học (progress 0-100%) | INT |
| `Lesson_Progress` | Tiến độ bài giảng (last_watched_at) | INT |
| `Favorites` | Wishlist khóa học (soft delete) | INT |
| `Gifts` | Tặng khóa học (token-based) | — |

**Enrollment lifecycle:**
```
Thanh toán → Enrollment(status=IN_PROGRESS, progress=0)
    → Học bài → Lesson_Progress cập nhật
    → Enrollment.progress tính từ Lesson_Progress
    → Hoàn thành + Pass Quiz → Enrollment(status=COMPLETED)
    → Certificate URL sinh ra
```

---

### 2.7 Cấu hình & CMS (5 bảng)

| Bảng | Vai trò | PK |
|------|---------|-----|
| `System_Configs` | Cấu hình động (key-value, config_type) | INT |
| `Banners` | Banner trang chủ (target_type, position) | INT |
| `Pages` | Trang tĩnh CMS (slug, HTML/Markdown content) | INT |
| `Term_Modules` | Nhóm menu điều khoản | INT |
| `Terms` | Trang điều khoản/chính sách (url_path, content) | INT |

---

### 2.8 Messaging (Chat) & Trả lời nhanh (4 bảng)

```
Courses ──1:N──→ Conversations ──1:N──→ Messages
                   │  │
                   │  └──1:N──→ Conversation_Participants (STUDENT/INSTRUCTOR)
                   │
Instructor ──1:N──→ Reply_Templates
```

| Bảng | Vai trò | PK |
|------|---------|-----|
| `Conversations` | Hội thoại học viên ↔ giảng viên theo khóa học (unique `(course_id, student_id, instructor_id)`) | UUID |
| `Conversation_Participants` | Thành viên hội thoại (role STUDENT/INSTRUCTOR, `last_read_message_id`, `last_read_at`) | UUID |
| `Messages` | Tin nhắn (idempotency `(sender_id, client_message_id)`, `type` TEXT, cursor pagination) | UUID |
| `Reply_Templates` | Mẫu trả lời nhanh của giảng viên (dùng cho Q&A) | INT |

**Đặc điểm:**
- **Real-time**: WebSocket/STOMP push `MESSAGE_CREATED`, `CONVERSATION_UPDATED`, `CONVERSATION_READ` tới `/user/{email}/queue/*`.
- **Idempotency**: unique `(sender_id, client_message_id)` chống gửi trùng tin nhắn.
- Chỉ tạo hội thoại khi học viên có enrollment hợp lệ trong khóa học đã publish.

### 3.1 Soft Delete
Hầu hết các bảng sử dụng `deleted_at` (DATETIME, nullable):
- `NULL` = chưa xóa (active)
- Có giá trị = đã xóa mềm
- Query cần filter: `WHERE deleted_at IS NULL`

### 3.2 Status Convention
Mọi bảng đều có cột `status` (INT) với ý nghĩa khác nhau tùy bảng. Quy ước chung:
- `0` = Inactive / Hidden / Unverified
- `1` = Active / Published / Paid
- `2+` = Các trạng thái đặc biệt (xem ERD chi tiết)

### 3.3 UUID vs Auto-Increment
- **UUID**: Dùng cho entities có tính phân tán / cần ID duy nhất trước insert (Accounts, Courses, Orders, Payments, Coupons, Wallets, Payouts)
- **INT (IDENTITY)**: Dùng cho entities con / lookup tables (Categories, Modules, Lessons, etc.)

### 3.4 JSONB Columns
Nhiều bảng sử dụng JSONB cho dữ liệu linh hoạt:
- `Accounts.metadata`: Bio, social links, instructor info
- `Courses.metadata`: Cert requirements, rejection reason, SEO
- `Lessons.metadata`: Video duration, transcript, preview config
- `Questions.answer`: Đáp án và cấu hình chấm điểm
- `Quiz_Results.response_detail`: Câu trả lời học viên
- `Coupons.metadata`: Scope rules, usage limits
- `Commissions.metadata`: Additional commission config
- `Orders`: Không dùng JSONB (giá trị tài chính phải là cột chuẩn)
- `Payments.payload`: Raw webhook data từ payment gateway (JSONB)

### 3.5 Composite Unique Constraints
- `(account_id, bank_id, account_number)` trong Account_Banks
- `(account_id, course_id)` trong Enrollments, Favorites
- `(follower_id, followee_id)` trong Follows
- `(quiz_id, question_id)` trong Quiz_Questions
- `(account_id, lesson_id)` trong Lesson_Progress
- `(thread_id, hashtag_id)` trong Thread_Hashtags
- `(account_id, topic_id)` trong Members

---

## 4. Sơ đồ Quan hệ Tổng hợp (ERD Overview)

```
                    ┌──────────┐
                    │  Roles   │
                    └────┬─────┘
                         │ 1:N
                    ┌────┴─────┐
                    │ Accounts │──────────────────────────────┐
                    └────┬─────┘                              │
        ┌────────────────┼─────────────────┐                  │
        │                │                 │                  │
   ┌────┴────┐    ┌──────┴──────┐   ┌─────┴──────┐    ┌─────┴──────┐
   │ Devices │    │   Courses   │   │   Orders   │    │  Wallets   │
   └─────────┘    └──────┬──────┘   └─────┬──────┘    └─────┬──────┘
                         │                │                  │
                  ┌──────┴──────┐  ┌──────┴──────┐   ┌──────┴──────┐
                  │   Modules   │  │Order_Details│   │   Payouts   │
                  └──────┬──────┘  └─────────────┘   └─────────────┘
                         │
                  ┌──────┴──────┐
                  │   Lessons   │
                  └──────┬──────┘
                         │
              ┌──────────┼──────────┐
              │                     │
       ┌──────┴──────┐      ┌──────┴──────┐
       │   Quizzes   │      │ Attachments │
       └──────┬──────┘      └─────────────┘
              │
       ┌──────┴──────┐
       │  Questions  │
       └─────────────┘
```

---

## 5. Database khác (Non-PostgreSQL)

### 5.1 Redis Cloud
| Mục đích | Key Pattern | TTL |
|---------|------------|-----|
| OTP verification | `otp:<email>` | 5 phút |
| Draft auto-save | `draft:<userId>:<courseId>` | 24 giờ |
| Cache (misc) | varies | varies |

### 5.2 MongoDB Atlas
| Collection | Mục đích |
|-----------|---------|
| `chat_sessions` | Lưu lịch sử chat AI (messages, user, timestamps) |
| `user_learning_profiles` | Hồ sơ học tập cá nhân hóa |

---

## 6. Flyway Migrations

| File | Mô tả |
|------|-------|
| `V1__init_database.sql` | Tạo toàn bộ 44 bảng gốc, indexes, constraints, seed data (Roles) |
| `V2__add_coupon_price_to_orders.sql` | Thêm `coupon_price DECIMAL(18,6) DEFAULT 0` vào Orders |
| `V3__secure_payout_reconciliation.sql` | Thêm `gateway_payout_id`, `gateway_reference_id` vào Payouts + unique index |
| `V4__harden_payout_submission.sql` | Thêm `idempotency_key`, `submission_attempts`, `last_submission_at`, `last_submission_error` |
| `V5__add_support_code_to_supports.sql` | Thêm `support_code` (unique) vào Supports |
| `V6__add_refund_code_to_refunds.sql` | Thêm `refund_code` (prefix HT + 12 số) vào Refunds |
| `V7__allow_zero_amount_payments.sql` | Bỏ CHECK `amount > 0`, cho phép đơn 0đ |
| `V8__add_messaging_tables.sql` | Tạo 3 bảng chat: `conversations`, `conversation_participants`, `messages` |
| `V9__add_payout_manual_approval.sql` | Rename `gateway_reference_id` → `payout_code`; thêm `metadata JSONB` vào Payouts |
| `V10__add_refund_decision_type.sql` | Thêm `decision_type` vào Refunds |
| `V11__strip_prefixes_and_rename_payment_code.sql` | Bỏ prefix RT/HT; rename `transaction_code` → `payment_code` |
| `V12__add_gift_code_to_gifts.sql` | Thêm `gift_code` (12 số) vào Gifts + unique index |
| `V13__add_reply_templates_table.sql` | Tạo bảng `reply_templates` (mẫu trả lời nhanh giảng viên) |

---

## 7. Tham khảo Chi tiết

- **ERD đầy đủ (48 bảng, từng cột)**: Xem file `gnostica-server/erd_tables.md`
- **JPA Entities**: `gnostica-server/src/main/java/com/gnostica/core/model/`
- **Repositories**: `gnostica-server/src/main/java/com/gnostica/core/repository/`
- **Migrations**: `gnostica-server/src/main/resources/db/migration/`
