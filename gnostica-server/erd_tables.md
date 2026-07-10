# ERD - Danh sách bảng và trường (Đối chiếu)

> [!NOTE]
> **Phiên bản 4** — Đã bổ sung: DECIMAL cho điểm số, cấu hình bài thi (max_attempts, passing_score), 2 bảng mới `Course_Cert_Requirements` và `Revenue_Shares`, cùng cơ chế Versioning (phiên bản hóa) cho Khóa học và các thành phần con.
>
> **Ký hiệu cột Ghi chú:** PK · FK · `UQ` (Unique) · `IDX` (Index) · `C-UQ` (Composite Unique) · `C-IDX` (Composite Index)

**Tổng số bảng: 41**

---

## 1. Account_Banks

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | UUID | PK | |
| 2 | account_id | UUID | FK, C-UQ | |
| 3 | bank_id | INT | FK, C-UQ | |
| 4 | account_number | VARCHAR(255) | C-UQ | |
| 5 | pin | VARCHAR(255) | | |
| 6 | status | INT | | |
| 7 | created_at | DATETIME | | |
| 8 | updated_at | DATETIME | | |
| 9 | deleted_at | DATETIME | | |

> **C-UQ:** `(account_id, bank_id, account_number)` — Mỗi tài khoản chỉ liên kết 1 lần với 1 số tài khoản ngân hàng.
>
> **Status:** 0: Inactive (Ngừng dùng), 1: Active (Đang sử dụng)


---

## 2. Accounts

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | UUID | PK | |
| 2 | role_id | INT | FK | |
| 3 | email | VARCHAR(255) | UQ | |
| 4 | full_name | VARCHAR(255) | | |
| 5 | phone | VARCHAR(12) | | |
| 6 | password | VARCHAR(255) | | |
| 7 | avatar | VARCHAR(255) | | |
| 8 | provider | VARCHAR(255) | IDX | |
| 9 | birth_day | DATE | | |
| 10 | metadata | JSONB | | |
| 11 | status | INT | IDX | |
| 12 | created_at | DATETIME | | |
| 13 | updated_at | DATETIME | | |
| 14 | deleted_at | DATETIME | | |
> **Status:** 0: Unverified (Chưa xác thực), 1: Active (Hoạt động), 2: Banned (Bị khoá), 3: Deleted (Chờ xoá)


---

## 3. Attachments

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | module_id | INT | FK | |
| 3 | file_url | VARCHAR(255) | | |
| 4 | file_type | VARCHAR(255) | | |
| 5 | status | INT | | |
| 6 | created_at | DATETIME | | |
| 7 | updated_at | DATETIME | | |
| 8 | deleted_at | DATETIME | | |
> **Status:** 0: Hidden (Ẩn), 1: Available (Có sẵn)


---

## 4. Banks

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | external_id | INT | UQ | |
| 3 | bank_code | VARCHAR(255) | | |
| 4 | bin | VARCHAR(255) | UQ | |
| 5 | short_name | VARCHAR(255) | | |
| 6 | logo_url | VARCHAR(255) | | |
| 7 | status | INT | | |
| 8 | created_at | DATETIME | | |
| 9 | updated_at | DATETIME | | |
| 10 | deleted_at | DATETIME | | |
> **Status:** 0: Maintenance (Bảo trì), 1: Active (Hoạt động)


---

## Banners

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | title | VARCHAR(255) | | |
| 3 | image_url | VARCHAR(255) | | |
| 4 | link_url | VARCHAR(255) | | |
| 5 | target_type | VARCHAR(50) | IDX | |
| 6 | position | VARCHAR(50) | | |
| 7 | sort_order | INT | | `>= 0` |
| 8 | status | INT | | |
| 9 | created_at | DATETIME | | |
| 10 | updated_at | DATETIME | | |

> **Note:** `target_type` dùng để phân loại banner (vd: WEB, MOBILE, APP_POPUP). `position` dùng để chỉ định vị trí (vd: HERO, SIDEBAR).
>
> **Status:** 0: Hidden (Ẩn), 1: Active (Hiển thị)

---

## 6. Categories

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | account_id | UUID | FK | |
| 3 | parent_id | INT | | |
| 4 | name | VARCHAR(255) | | |
| 5 | slug | VARCHAR(255) | UQ | |
| 6 | description | VARCHAR(255) | | |
| 7 | thumbnail | VARCHAR(255) | | |
| 8 | color | VARCHAR(255) | | |
| 9 | sort_order | INT | | `>= 0` |
| 10 | status | INT | | |
| 11 | created_at | DATETIME | | |
| 12 | updated_at | DATETIME | | |
| 13 | deleted_at | DATETIME | | |
> **Status:** 0: Hidden (Ẩn), 1: Active (Hiển thị)


---

## 7. Cert_Requirements

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | course_id | UUID | FK, UQ | |
| 3 | min_progress | INT | | `>= 0 AND <= 100` |
| 4 | quizzes_passed | BIT | | |
| 5 | created_at | DATETIME | | |
| 6 | updated_at | DATETIME | | |

> **Bảng mới** — Định nghĩa điều kiện để được cấp chứng chỉ (tiến độ tối thiểu, bài kiểm tra bắt buộc).


---

## 8. Comments

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | account_id | UUID | FK | |
| 3 | thread_id | INT | FK | |
| 4 | parent_id | INT | FK | |
| 5 | mention_id | UUID | FK | |
| 6 | content | TEXT | | |
| 7 | status | INT | | |
| 8 | created_at | DATETIME | | |
| 9 | updated_at | DATETIME | | |
| 10 | deleted_at | DATETIME | | |
> **Status:** 0: Hidden (Ẩn), 1: Published (Hiển thị), 2: Spam/Reported (Vi phạm)


---

## 9. Commissions

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | account_id | UUID | FK | |
| 3 | instructor_ratio | DECIMAL(5,2) | | `>= 0 AND <= 100` |
| 4 | platform_ratio | DECIMAL(5,2) | | `>= 0 AND <= 100` |
| 5 | valid_from | DATETIME | | |
| 6 | valid_until | DATETIME | | |
| 7 | status | INT | | |
| 8 | created_at | DATETIME | | |
| 9 | updated_at | DATETIME | | |

> **Bảng mới** — Quản lý phần trăm ăn chia doanh thu theo thời gian của từng giảng viên (Account).
>
> **Status:** 0: Inactive (Đã cũ), 1: Active (Đang áp dụng)


---

## 10. Coupon_Rules

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | coupon_id | UUID | FK | |
| 3 | rule_type | VARCHAR(255) | | |
| 4 | rule_value | VARCHAR(255) | | |
| 5 | start_date | DATETIME | | |
| 6 | created_at | DATETIME | | |
| 7 | updated_at | DATETIME | | |
| 8 | deleted_at | DATETIME | | |
> **Status:** 0: Inactive (Tạm dừng), 1: Active (Hoạt động)


---

## 11. Coupons

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | UUID | PK | |
| 2 | account_id | UUID | FK | |
| 3 | code | VARCHAR(255) | UQ | |
| 4 | name | VARCHAR(255) | | |
| 5 | discount_type | INT | | |
| 6 | discount_value | DECIMAL(18,6) | | `> 0` |
| 7 | min_discount | DECIMAL(18,6) | | `>= 0` |
| 8 | max_discount | DECIMAL(18,6) | | `>= 0` |
| 9 | quantity | INT | | `>= 0` |
| 10 | valid_from | DATETIME | | |
| 11 | valid_until | DATETIME | | |
| 12 | status | INT | | |
| 13 | created_at | DATETIME | | |
| 14 | updated_at | DATETIME | | |
| 15 | deleted_at | DATETIME | | |
> **Status:** 0: Inactive (Tạm dừng), 1: Active (Đang áp dụng), 2: Expired (Hết hạn)


---

## 12. Courses

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | UUID | PK | |
| 2 | account_id | UUID | FK | |
| 3 | category_id | INT | FK, C-IDX | |
| 4 | original_course_id | UUID | FK | |
| 5 | title | VARCHAR(255) | | |
| 6 | slug | VARCHAR(255) | UQ | |
| 7 | description | TEXT | | |
| 8 | thumbnail | VARCHAR(255) | | |
| 9 | price | DECIMAL(18,6) | | `>= 0` |
| 10 | discount | INT | | `>= 0 AND <= 100` |
| 11 | level | VARCHAR(50) | | |
| 12 | promo_video | VARCHAR(255) | | |
| 13 | shared_count | INT | | `>= 0` |
| 14 | version_number | INT | | `>= 1` |
| 15 | status | INT | C-IDX | |
| 16 | created_at | DATETIME | | |
| 17 | updated_at | DATETIME | | |
| 18 | published_at | DATETIME | C-IDX | |
| 19 | deleted_at | DATETIME | | |

> **Versioning:** `original_course_id` trỏ về phiên bản gốc, `version_number` quản lý các bản Draft/Published.
>
> **Status:** 0: Rejected (Từ chối), 1: Draft (Bản nháp), 2: Pending (Chờ duyệt), 3: Published (Đã xuất bản), 4: Archived (Lưu trữ)


---

## 13. Devices

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | UUID | PK | |
| 2 | account_id | UUID | FK | |
| 3 | device_token | VARCHAR(255) | | |
| 4 | device_type | VARCHAR(50) | | |
| 5 | device_name | VARCHAR(255) | | |
| 6 | ip_address | VARCHAR(50) | | |
| 7 | is_trusted | BIT | | |
| 8 | last_login | DATETIME | | |
| 9 | status | INT | | |
| 10 | created_at | DATETIME | | |
| 11 | updated_at | DATETIME | | |
| 12 | deleted_at | DATETIME | | |
> **Status:** 0: Revoked (Đã đăng xuất), 1: Active (Đang đăng nhập)


---

## 14. Enrollments

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | account_id | UUID | FK, C-UQ | |
| 3 | course_id | UUID | FK, C-UQ | |
| 4 | order_detail_id | UUID | FK | |
| 5 | progress | INT | | `>= 0 AND <= 100` |
| 6 | certifi_url | VARCHAR(255) | | |
| 7 | status | INT | | |
| 8 | created_at | DATETIME | | |
| 9 | completed_at | DATETIME | | |
> **Status:** 0: Dropped/Refunded (Đã huỷ/Hoàn tiền), 1: In Progress (Đang học), 2: Completed (Hoàn thành)


---

## 15. Favorites

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | account_id | UUID | FK, C-UQ | |
| 3 | course_id | UUID | FK, C-UQ | |
| 4 | status | INT | | |
| 5 | created_at | DATETIME | | |
> **Status:** 0: Removed (Đã bỏ), 1: Active (Yêu thích)


---

## 16. Follows

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | follower_id | UUID | FK, C-UQ | |
| 3 | followee_id | UUID | FK, C-UQ | |
| 4 | created_at | DATETIME | | |


---

## 17. Hashtags

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | name | VARCHAR(255) | UQ | |
| 3 | usage_count | INT | | `>= 0` |
| 4 | status | INT | | |
| 5 | created_at | DATETIME | | |
| 6 | deleted_at | DATETIME | | |
> **Status:** 0: Hidden (Ẩn), 1: Active (Hoạt động)


---

## 18. Lesson_Progress

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | account_id | UUID | FK, C-UQ | |
| 3 | lesson_id | INT | FK, C-UQ | |
| 4 | last_watched_at | VARCHAR(255) | | |
| 5 | status | INT | | |
| 6 | created_at | DATETIME | | |
| 7 | updated_at | DATETIME | | |
| 8 | completed_at | DATETIME | | |
> **Status:** 1: In Progress (Đang học), 2: Completed (Hoàn thành)


---

## 19. Lessons

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | module_id | INT | FK | |
| 3 | original_lesson_id | INT | FK | |
| 4 | title | VARCHAR(255) | | |
| 5 | content | TEXT | | |
| 6 | video_url | VARCHAR(255) | | |
| 7 | version_number | INT | | `>= 1` |
| 8 | sort_order | INT | | `>= 0` |
| 9 | status | INT | | |
| 10 | created_at | DATETIME | | |
| 11 | updated_at | DATETIME | | |
| 12 | deleted_at | DATETIME | | |

> **Versioning:** Hỗ trợ versioning cho bài giảng tương tự Khóa học.
>
> **Status:** 0: Hidden (Ẩn), 1: Draft (Bản nháp), 2: Published (Đã xuất bản)


---

## 20. Logs

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | account_id | UUID | FK, IDX | |
| 3 | action | VARCHAR(255) | IDX | |
| 4 | payload | JSONB | | |
| 5 | created_at | DATETIME | | |


---

## 21. Members

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | account_id | UUID | FK, C-UQ | |
| 3 | topic_id | INT | FK, C-UQ | |
| 4 | created_at | DATETIME | | |


---

## 22. Modules

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | course_id | UUID | FK | |
| 3 | original_module_id | INT | FK | |
| 4 | title | VARCHAR(255) | | |
| 5 | version_number | INT | | `>= 1` |
| 6 | sort_order | INT | | `>= 0` |
| 7 | status | INT | | |
| 8 | created_at | DATETIME | | |
| 9 | updated_at | DATETIME | | |
| 10 | deleted_at | DATETIME | | |

> **Versioning:** Hỗ trợ versioning cho module tương tự Khóa học.
>
> **Status:** 0: Hidden (Ẩn), 1: Draft (Bản nháp), 2: Published (Đã xuất bản)


---

## 23. Notifications

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | account_id | UUID | FK, C-IDX | |
| 3 | title | VARCHAR(255) | | |
| 4 | message | TEXT | | |
| 5 | is_read | BIT | C-IDX | |
| 6 | created_at | DATETIME | | |
| 7 | updated_at | DATETIME | | |


---

## 24. Order_Details

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | UUID | PK | |
| 2 | order_id | UUID | FK | |
| 3 | course_id | UUID | FK | |
| 4 | price | DECIMAL(18,6) | | `>= 0` |
| 5 | discount | INT | | `>= 0 AND <= 100` |
| 6 | status | INT | | |
| 7 | created_at | DATETIME | | |
| 8 | updated_at | DATETIME | | |
> **Status:** 0: Refunded (Đã hoàn tiền), 1: Valid (Hợp lệ)


---

## 25. Orders

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | UUID | PK | |
| 2 | account_id | UUID | FK, C-IDX | |
| 3 | coupon_id | UUID | FK | |
| 4 | total_price | DECIMAL(18,6) | | `>= 0` |
| 5 | payment_method | VARCHAR(255) | | |
| 6 | order_code | BIGINT | UQ | |
| 7 | status | INT | | |
| 8 | created_at | DATETIME | C-IDX | |
| 9 | updated_at | DATETIME | | |
> **Status:** 1: Pending (Chờ thanh toán), 2: Paid (Đã thanh toán), 3: Cancelled (Đã huỷ), 4: Refunded (Đã hoàn tiền)


---

## Pages

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | title | VARCHAR(255) | | |
| 3 | slug | VARCHAR(255) | UQ | |
| 4 | content | TEXT | | |
| 5 | status | INT | | |
| 6 | created_at | DATETIME | | |
| 7 | updated_at | DATETIME | | |

> **Bảng mới** — Quản lý các trang tĩnh (Điều khoản, Chính sách...).
>
> **Status:** 0: Hidden (Ẩn), 1: Published (Hiển thị)

---

## 27. Payments

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | UUID | PK | |
| 2 | order_id | UUID | FK | |
| 3 | transaction_code | VARCHAR(255) | UQ | |
| 4 | amount | DECIMAL(18,6) | | `> 0` |
| 5 | account_number | VARCHAR(255) | | |
| 6 | sender_bank_bin | VARCHAR(255) | | |
| 7 | sender_account_number | VARCHAR(255) | | |
| 8 | status | INT | | |
| 9 | created_at | DATETIME | | |
| 10 | updated_at | DATETIME | | |
> **Status:** 1: Pending (Chờ xử lý), 2: Success (Thành công), 3: Failed (Thất bại), 4: Refunded (Đã hoàn tiền)


---

## 28. Payouts

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | UUID | PK | |
| 2 | account_id | UUID | FK | |
| 3 | wallet_id | UUID | FK | |
| 4 | account_bank_id | UUID | FK | |
| 5 | amount | DECIMAL(18,6) | | `> 0` |
| 6 | status | INT | | |
| 7 | created_at | DATETIME | | |
| 8 | updated_at | DATETIME | | |
> **Status:** 1: Pending (Chờ duyệt), 2: Processing (Đang chuyển), 3: Completed (Hoàn tất), 4: Failed (Lỗi), 5: Rejected (Từ chối)


---

## 29. Questions

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | course_id | UUID | FK | |
| 3 | original_question_id | INT | FK | |
| 4 | content | TEXT | | |
| 5 | level | VARCHAR(255) | | |
| 6 | explanation | TEXT | | |
| 7 | answer | JSONB | | |
| 8 | version_number | INT | | `>= 1` |
| 9 | status | INT | | |
| 10 | created_at | DATETIME | | |
| 11 | updated_at | DATETIME | | |

> **Versioning:** Hỗ trợ versioning cho câu hỏi tương tự Khóa học.
>
> **Status:** 0: Inactive (Không dùng), 1: Active (Sử dụng)


---

## 30. Quiz_Questions

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | quiz_id | INT | FK, C-UQ | |
| 3 | question_id | INT | FK, C-UQ | |
| 4 | sort_order | INT | | `>= 0` |
| 5 | created_at | DATETIME | | |
| 6 | updated_at | DATETIME | | |
| 7 | deleted_at | DATETIME | | |


---

## 31. Quiz_Results

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | account_id | UUID | FK | |
| 3 | quiz_id | INT | FK | |
| 4 | point | DECIMAL(5,2) | | `>= 0` |
| 5 | total_questions | INT | | `>= 0` |
| 6 | correct_answers | INT | | `>= 0` |
| 7 | time | INT | | `>= 0` |
| 8 | response_detail | JSONB | | |
| 9 | status | INT | | |
| 10 | created_at | DATETIME | | |
| 11 | completed_at | DATETIME | | |

> **Cập nhật:** Đổi `point` thành `DECIMAL(5,2)` để lưu điểm chính xác tuyệt đối.
>
> **Status:** 1: In Progress (Đang làm), 2: Submitted (Đã nộp/Chấm điểm)


---

## 32. Quizzes

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | module_id | INT | FK | |
| 3 | original_quiz_id | INT | FK | |
| 4 | title | VARCHAR(255) | | |
| 5 | max_attempts | INT | | `>= 1` |
| 6 | passing_score | DECIMAL(5,2) | | `>= 0` |
| 7 | version_number | INT | | `>= 1` |
| 8 | status | INT | | |
| 9 | created_at | DATETIME | | |

> **Cập nhật:** Thêm `max_attempts` và `passing_score (DECIMAL)` cho cấu hình bài thi. Thêm versioning.
>
> **Status:** 0: Hidden (Ẩn), 1: Draft (Bản nháp), 2: Published (Đã xuất bản)


---

## 33. Reports

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | account_id | UUID | FK | |
| 3 | target_id | VARCHAR(255) | | |
| 4 | target_type | VARCHAR(255) | | |
| 5 | reason | VARCHAR(255) | | |
| 6 | description | JSONB | | |
| 7 | status | INT | | |
| 8 | created_at | DATETIME | | |
| 9 | updated_at | DATETIME | | |
| 10 | deleted_at | DATETIME | | |
> **Status:** 1: Pending (Chờ xử lý), 2: Processing (Đang xử lý), 3: Resolved (Đã giải quyết), 4: Dismissed (Bỏ qua)


---

## 34. Reviews

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | account_id | UUID | FK | |
| 3 | course_id | UUID | FK, C-IDX | |
| 4 | parent_id | INT | FK | |
| 5 | rating | INT | | `>= 1 AND <= 5` |
| 6 | comment | TEXT | | |
| 7 | status | INT | C-IDX | |
| 8 | created_at | DATETIME | | |
| 9 | updated_at | DATETIME | | |
| 10 | deleted_at | DATETIME | | |
> **Status:** 0: Hidden (Ẩn), 1: Published (Hiển thị), 2: Spam (Vi phạm)


---

## 35. Roles

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | name | VARCHAR(255) | UQ | |
| 3 | description | VARCHAR(255) | | |
| 4 | status | INT | | |
| 5 | created_at | DATETIME | | |
| 6 | updated_at | DATETIME | | |
> **Status:** 0: Inactive (Tạm khoá), 1: Active (Hoạt động)


---

## System_Configs

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | config_key | VARCHAR(255) | UQ | |
| 3 | config_value | TEXT | | |
| 4 | config_type | VARCHAR(50) | | |
| 5 | description | VARCHAR(255) | | |
| 6 | created_at | DATETIME | | |
| 7 | updated_at | DATETIME | | |

> **Bảng mới** — Cấu hình hệ thống động thay vì dùng file .env (vd: MAX_UPLOAD_SIZE, DEFAULT_COMMISSION).

---

## 37. Thread_Hashtags

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | thread_id | INT | FK, C-UQ | |
| 3 | hashtag_id | INT | FK, C-UQ | |
| 4 | created_at | DATETIME | | |


---

## 38. Threads

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | account_id | UUID | FK | |
| 3 | topic_id | INT | FK, C-IDX | |
| 4 | title | VARCHAR(255) | | |
| 5 | slug | VARCHAR(255) | UQ | |
| 6 | content | TEXT | | |
| 7 | view_count | INT | | `>= 0` |
| 8 | shared_count | INT | | `>= 0` |
| 9 | is_locked | BIT | | |
| 10 | is_pinned | BIT | | |
| 11 | status | INT | C-IDX | |
| 12 | created_at | DATETIME | C-IDX | |
| 13 | updated_at | DATETIME | | |
| 14 | deleted_at | DATETIME | | |
> **Status:** 0: Hidden (Ẩn), 1: Draft (Bản nháp), 2: Published (Đã xuất bản), 3: Banned (Vi phạm)


---

## 39. Topics

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | account_id | UUID | FK | |
| 3 | title | VARCHAR(255) | | |
| 4 | slug | VARCHAR(255) | UQ | |
| 5 | description | VARCHAR(255) | | |
| 6 | status | INT | | |
| 7 | created_at | DATETIME | | |
| 8 | updated_at | DATETIME | | |
| 9 | deleted_at | DATETIME | | |
> **Status:** 0: Hidden (Ẩn), 1: Active (Hiển thị)


---

## 40. Votes

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | account_id | UUID | FK | |
| 3 | target_id | VARCHAR(255) | | |
| 4 | type | INT | | |
| 5 | value | BIT | | |
| 6 | created_at | DATETIME | | |
| 7 | updated_at | DATETIME | | |
| 8 | deleted_at | DATETIME | | |


---

## 41. Wallets

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | UUID | PK | |
| 2 | account_id | UUID | FK | |
| 3 | remain | DECIMAL(18,6) | | `>= 0` |
| 4 | daily_withdrawal_count | INT | | `>= 0` |
| 5 | type | INT | | |
| 6 | status | INT | | |
| 7 | created_at | DATETIME | | |
| 8 | available_at | DATETIME | | |
> **Status:** 0: Locked/Frozen (Đóng băng), 1: Active (Hoạt động)



