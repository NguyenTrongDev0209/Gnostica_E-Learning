# ERD - Danh sách bảng và trường (Đối chiếu)

> [!NOTE]
> **Phiên bản 5** — Cập nhật mô hình gọn hơn: thêm `metadata` cho `Courses` và `Coupons`, bỏ `Coupon_Rules`, bỏ `Cert_Requirements`, bỏ `Revenue_Shares`; `Order_Details` tham chiếu trực tiếp `Commissions` bằng `commission_id`.
>
> **Ký hiệu cột Ghi chú:** PK · FK · `UQ` (Unique) · `IDX` (Index) · `C-UQ` (Composite Unique) · `C-IDX` (Composite Index)

**Tổng số bảng: 42**

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
>
> **Note:** Mỗi account chỉ nên có một tài khoản ngân hàng active tại một thời điểm nếu dùng làm tài khoản nhận payout mặc định.


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
| 7 | avatar | VARCHAR(2048) | | |
| 8 | provider | VARCHAR(255) | IDX | |
| 9 | birth_day | DATE | | |
| 10 | metadata | JSONB | | |
| 11 | status | INT | IDX | |
| 12 | created_at | DATETIME | | |
| 13 | updated_at | DATETIME | | |
| 14 | deleted_at | DATETIME | | |
> **Metadata:** Lưu hồ sơ mở rộng không cố định như thông tin đăng ký instructor, bio, social links, trạng thái xác minh bổ sung.
>
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
> **Note:** Attachment gắn với `Modules`; tài nguyên chính của lesson như video nên nằm ở `Lessons.video_url` hoặc `Lessons.metadata`.
>
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
> **Note:** Dữ liệu ngân hàng có thể đồng bộ từ nhà cung cấp bên ngoài qua `external_id`, `bank_code`, `bin`.
>
> **Status:** 0: Maintenance (Bảo trì), 1: Active (Hoạt động)


---

## 5. Banners

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | title | VARCHAR(255) | | |
| 3 | image_url | VARCHAR(1000) | | |
| 4 | link_url | VARCHAR(1000) | | |
| 5 | alt_text | VARCHAR(255) | | |
| 6 | target_type | VARCHAR(50) | IDX | |
| 7 | position | VARCHAR(50) | | |
| 8 | sort_order | INT | | `>= 0` |
| 9 | status | INT | | |
| 10 | created_at | DATETIME | | |
| 11 | updated_at | DATETIME | | |

> **Note:** `target_type` dùng để phân loại banner (vd: WEB, MOBILE, APP_POPUP). `position` dùng để chỉ định vị trí (vd: HERO, SIDEBAR). `alt_text` hỗ trợ accessibility/SEO cho ảnh banner.
>
> **Status:** 0: Hidden (Ẩn), 1: Active (Hiển thị)

---

## 6. Categories

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | account_id | UUID | FK | |
| 3 | parent_id | INT | FK | |
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
> **Note:** `parent_id` tự tham chiếu `Categories.id`, hỗ trợ cây danh mục nhiều cấp. Khi ẩn danh mục cha cần đồng bộ hoặc chặn hiển thị khóa học thuộc danh mục con.
>
> **Status:** 0: Hidden (Ẩn), 1: Active (Hiển thị)


---

## 7. Comments

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | account_id | UUID | FK | |
| 3 | target_type | VARCHAR(50) | IDX | |
| 4 | target_id | VARCHAR(255) | IDX | |
| 5 | parent_id | INT | FK, IDX | |
| 6 | mention_id | UUID | FK | |
| 7 | content | TEXT | | |
| 8 | status | INT | | |
| 9 | created_at | DATETIME | | |
| 10 | updated_at | DATETIME | | |
| 11 | deleted_at | DATETIME | | |
> **Target:** `target_type + target_id` xác định đối tượng được bình luận theo mô hình polymorphic target. Forum dùng `THREAD`, hỏi đáp bài học dùng `LESSON`; dữ liệu cũ không xác định được đối tượng có thể dùng `LEGACY`.
>
> **Index:** Tạo index `(target_type, target_id)` để tải danh sách bình luận theo đối tượng và index `parent_id` để lấy reply nhanh.
>
> **Note:** `parent_id` hỗ trợ trả lời lồng nhau; `mention_id` lưu account được nhắc đến trong bình luận. `thread_id` đã được thay thế bằng `target_type/target_id` để bảng `Comments` dùng chung cho nhiều ngữ cảnh.
>
> **Status:** 0: Hidden (Ẩn), 1: Published (Hiển thị), 2: Spam/Reported (Vi phạm)


---

## 8. Commissions

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | account_id | UUID | FK | |
| 3 | instructor_ratio | DECIMAL(5,2) | | `>= 0 AND <= 100` |
| 4 | platform_ratio | DECIMAL(5,2) | | `>= 0 AND <= 100` |
| 5 | valid_from | DATETIME | | |
| 6 | valid_until | DATETIME | | |
| 7 | status | INT | | |
| 8 | metadata | JSONB | | |
| 9 | created_at | DATETIME | | |
| 10 | updated_at | DATETIME | | |

> **Bảng mới** — Quản lý phần trăm ăn chia doanh thu theo thời gian của từng giảng viên (Account).
>
> **Note:** Bảng nên vận hành append-only: đổi tỷ lệ thì tạo bản ghi mới, không sửa bản ghi đã được `Order_Details.commission_id` tham chiếu. Nên ràng buộc `instructor_ratio + platform_ratio = 100`.
>
> **Status:** 0: Inactive (Đã cũ), 1: Active (Đang áp dụng)


---

## 9. Coupons

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | UUID | PK | |
| 2 | account_id | UUID | FK | |
| 3 | code | TEXT | UQ |
| 4 | code_hash | VARCHAR(64) | UQ |
| 5 | name | VARCHAR(255) | |
| 6 | discount_type | INT | |
| 7 | discount_value | DECIMAL(18,6) | |
| 8 | min_discount | DECIMAL(18,6) | |
| 9 | max_discount | DECIMAL(18,6) | |
| 10 | quantity | INT | |
| 11 | reserved_quantity | INT | Def: 0 |
| 12 | valid_from | DATETIME | |
| 13 | valid_until | DATETIME | |
| 14 | status | INT | |
| 15 | metadata | JSONB | |
| 16 | created_at | DATETIME | |
| 17 | updated_at | DATETIME | |
| 18 | deleted_at | DATETIME | | |
> **Metadata:** Lưu các rule mềm của coupon như danh sách khóa học/danh mục áp dụng, giới hạn số lần dùng mỗi user, first purchase only, segment người dùng...
>
> **Note:** `discount_type`: 1 = phần trăm, 2 = số tiền cố định. Các rule cần query/report thường xuyên nên tách thành cột hoặc bảng riêng thay vì chỉ để trong metadata.
>
> **Status:** 0: Inactive (Tạm dừng), 1: Active (Đang áp dụng), 2: Expired (Hết hạn)


---

## 10. Courses

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
| 16 | metadata | JSONB | | |
| 17 | created_at | DATETIME | | |
| 18 | updated_at | DATETIME | | |
| 19 | published_at | DATETIME | C-IDX | |
| 20 | deleted_at | DATETIME | | |

> **Versioning:** `original_course_id` trỏ về phiên bản gốc, `version_number` quản lý các bản Draft/Published.
>
> **Metadata:** Lưu thông tin mở rộng như điều kiện cấp chứng chỉ, lý do từ chối gần nhất, SEO, outcomes, requirements.
>
> **Note:** `original_course_id` dùng cho versioning. Bản chỉnh sửa có thể trỏ về khóa học gốc; khi được duyệt thì merge nội dung về bản gốc.
>
> **Status:** 0: Hidden/Inactive (Ẩn/không hoạt động), 1: Published/Approved (Đã xuất bản/đã duyệt), 2: Draft (Bản nháp), 3: Rejected (Từ chối), 4: Pending (Chờ duyệt)


---

## 11. Devices

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
> **Note:** Dùng để quản lý phiên đăng nhập/thiết bị nhận thông báo. `device_token` cần được revoke khi đăng xuất hoặc token hết hạn.
>
> **Status:** 0: Revoked (Đã đăng xuất), 1: Active (Đang đăng nhập)


---

## 12. Enrollments

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | account_id | UUID | FK, C-UQ | |
| 3 | course_id | UUID | FK, C-UQ | |
| 4 | order_detail_id | UUID | FK | |
| 5 | progress | INT | | `>= 0 AND <= 100` |
| 6 | certificate_url | VARCHAR(255) | | |
| 7 | status | INT | | |
| 8 | created_at | DATETIME | | |
| 9 | completed_at | DATETIME | | |
> **Note:** Enrollment được tạo sau thanh toán thành công và liên kết về `order_detail_id` để truy vết quyền học phát sinh từ dòng đơn hàng nào.
>
> **Status:** 0: Dropped/Refunded (Đã huỷ/Hoàn tiền), 1: In Progress (Đang học), 2: Completed (Hoàn thành)


---

## 13. Favorites

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | account_id | UUID | FK, C-UQ | |
| 3 | course_id | UUID | FK, C-UQ | |
| 4 | status | INT | | |
| 5 | created_at | DATETIME | | |
> **Note:** Bảng wishlist/favorite mềm; không xóa cứng khi user bỏ yêu thích để giữ lịch sử tương tác.
>
> **Status:** 0: Removed (Đã bỏ), 1: Active (Yêu thích)


---

## 14. Follows

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | follower_id | UUID | FK, C-UQ | |
| 3 | followee_id | UUID | FK, C-UQ | |
| 4 | created_at | DATETIME | | |

> **Note:** `follower_id` là người theo dõi, `followee_id` là người được theo dõi. Cần chặn self-follow ở tầng service hoặc CHECK nếu DB hỗ trợ.


---

## 15. Hashtags

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | name | VARCHAR(255) | UQ | |
| 3 | usage_count | INT | | `>= 0` |
| 4 | status | INT | | |
| 5 | created_at | DATETIME | | |
| 6 | deleted_at | DATETIME | | |
> **Note:** `usage_count` nên được cập nhật khi gắn/bỏ hashtag khỏi thread; có thể rebuild định kỳ từ `Thread_Hashtags` nếu lệch số liệu.
>
> **Status:** 0: Hidden (Ẩn), 1: Active (Hoạt động)


---

## 16. Lesson_Progress

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
> **Note:** Mỗi account chỉ có một progress record cho một lesson. `last_watched_at` nên chuẩn hóa sang timestamp/duration nếu cần phân tích học tập.
>
> **Status:** 0:Dropped, 1:InProgress, 2:Completed


---

## 17. Lessons

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | module_id | INT | FK | |
| 3 | original_lesson_id | INT | FK | |
| 4 | title | VARCHAR(255) | | |
| 5 | content | TEXT | | |
| 6 | video_url | VARCHAR(255) | | |
| 7 | metadata | JSONB | | |
| 8 | version_number | INT | | `>= 1` |
| 9 | sort_order | INT | | `>= 0` |
| 10 | status | INT | | |
| 11 | created_at | DATETIME | | |
| 12 | updated_at | DATETIME | | |
| 13 | deleted_at | DATETIME | | |

> **Versioning:** Hỗ trợ versioning cho bài giảng tương tự Khóa học.
>
> **Metadata:** Lưu thông tin mở rộng của bài giảng như thời lượng video, tài nguyên nhúng, transcript, cấu hình preview/free lesson.
>
> **Note:** `original_lesson_id` trỏ về lesson gốc khi tạo phiên bản chỉnh sửa; `sort_order` quyết định thứ tự trong module.
>
> **Status:** 0: Hidden (Ẩn), 1: Draft (Bản nháp), 2: Published (Đã xuất bản)


---

## 18. Logs

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | account_id | UUID | FK, IDX | |
| 3 | action | VARCHAR(255) | IDX | |
| 4 | payload | JSONB | | |
| 5 | created_at | DATETIME | | |

> **Note:** Dùng cho audit/event log. `payload` nên lưu JSON có `target_type`, `target_id` khi log liên quan đến một thực thể cụ thể.


---

## 19. Members

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | account_id | UUID | FK, C-UQ | |
| 3 | topic_id | INT | FK, C-UQ | |
| 4 | created_at | DATETIME | | |

> **Note:** Bảng thành viên topic/forum; dùng để phân quyền, theo dõi hoặc notification theo topic.


---

## 20. Modules

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | course_id | UUID | FK | |
| 3 | original_module_id | INT | FK | |
| 4 | title | VARCHAR(255) | | |
| 5 | metadata | JSONB | | |
| 6 | version_number | INT | | `>= 1` |
| 7 | sort_order | INT | | `>= 0` |
| 8 | status | INT | | |
| 9 | created_at | DATETIME | | |
| 10 | updated_at | DATETIME | | |
| 11 | deleted_at | DATETIME | | |

> **Versioning:** Hỗ trợ versioning cho module tương tự Khóa học.
>
> **Metadata:** Lưu thông tin mở rộng của module như mục tiêu học tập, mô tả ngắn, thời lượng ước tính, cấu hình mở khóa.
>
> **Note:** `original_module_id` trỏ về module gốc khi tạo phiên bản chỉnh sửa; module bị xóa nên dùng `deleted_at` thay vì xóa cứng nếu đã có progress.
>
> **Status:** 0: Hidden (Ẩn), 1: Draft (Bản nháp), 2: Published (Đã xuất bản)


---

## 21. Notifications

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | account_id | UUID | FK, C-IDX | |
| 3 | title | VARCHAR(255) | | |
| 4 | message | TEXT | |
| 5 | is_read | BOOLEAN | Def: false |
| 6 | type | VARCHAR(50) | |
| 7 | reference_id | VARCHAR(255) | |
| 8 | created_at | DATETIME | | |
| 9 | updated_at | DATETIME | | |

> **Note:** Nên index `(account_id, is_read, created_at)` nếu màn hình thông báo thường xuyên lọc unread và sắp xếp mới nhất.


---

## 22. Order_Details

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | UUID | PK | |
| 2 | order_id | UUID | FK | |
| 3 | course_id | UUID | FK | |
| 4 | commission_id | INT | FK | |
| 5 | price | DECIMAL(18,6) | | `>= 0` |
| 6 | discount | INT | | `>= 0 AND <= 100` |
| 7 | status | INT | | |
| 8 | created_at | DATETIME | | |
| 9 | updated_at | DATETIME | | |
> **Commission:** `commission_id` trỏ tới bản ghi `Commissions` được áp dụng tại thời điểm tạo dòng đơn hàng. `Commissions` nên vận hành theo hướng append-only: đổi tỷ lệ thì tạo bản ghi mới, không sửa bản ghi cũ.
>
> **Note:** `price` là giá thực tính cho dòng đơn hàng sau discount/coupon theo logic hiện tại. Nếu sau này cần đối soát sâu hơn, cân nhắc đặt tên rõ hơn hoặc bổ sung snapshot.
>
> **Status:** 0: Refunded (Đã hoàn tiền), 1: Valid (Hợp lệ)


---

## 23. Orders

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
> **Note:** `total_price` là tổng tiền phải thanh toán của đơn sau khi áp dụng coupon. `order_code` dùng cho đối soát với cổng thanh toán.
>
> **Status:** 0:Pending, 1:Paid, 2:Refunded, 3:Cancelled


---

## 24. Pages

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | title | VARCHAR(255) | | |
| 3 | slug | VARCHAR(255) | UQ | |
| 4 | content | TEXT | | |
| 5 | metadata | JSONB | | |
| 6 | status | INT | | |
| 7 | created_at | DATETIME | | |
| 8 | updated_at | DATETIME | | |

> **Bảng mới** — Quản lý các trang tĩnh (Điều khoản, Chính sách...).
>
> **Note:** `slug` là khóa public để truy cập trang; nội dung có thể là HTML/Markdown tùy convention của frontend.
>
> **Metadata:** Lưu cấu hình hiển thị mở rộng, ví dụ `menuGroup`, `menuOrder`, `pageOrder`, `showInTermsMenu` cho các trang `/terms/...`.
>
> **Status:** 0: Hidden (Ẩn), 1: Published (Hiển thị)

---

## 25. Payments

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | UUID | PK | |
| 2 | order_id | UUID | FK | |
| 3 | transaction_code | VARCHAR(255) | UQ | |
| 4 | amount | DECIMAL(18,6) | | `> 0` |
| 5 | account_number | VARCHAR(255) | | |
| 6 | sender_bank_bin | VARCHAR(255) | | |
| 7 | sender_account_number | VARCHAR(255) | | |
| 8 | gateway | VARCHAR(32) | IDX | |
| 9 | gateway_transaction_no | VARCHAR(255) | C-UQ | |
| 10 | bank_code | VARCHAR(32) | | |
| 11 | card_type | VARCHAR(32) | | |
| 12 | gateway_response_code | VARCHAR(16) | | |
| 13 | gateway_transaction_status | VARCHAR(16) | | |
| 14 | paid_at | DATETIME | IDX | |
| 15 | raw_callback | JSONB | | |
| 16 | status | INT | | |
| 17 | created_at | DATETIME | | |
| 18 | updated_at | DATETIME | | |
> **Note:** Một order có thể có nhiều payment attempts nếu retry/cổng thanh toán khác nhau; `transaction_code` dùng để chống xử lý trùng webhook. `gateway + gateway_transaction_no` là unique có điều kiện khi `gateway_transaction_no` khác null.
>
> **Status:** 1: Pending (Chờ xử lý), 2: Success (Thành công), 3: Failed (Thất bại), 4: Refunded (Đã hoàn tiền)


---

## 26. Payouts

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | UUID | PK |
| 2 | account_id | UUID | FK |
| 3 | account_bank_id | UUID | FK |
| 4 | amount | DECIMAL(18,6) | |
| 5 | status | INT | |
| 6 | created_at | DATETIME | |
| 7 | updated_at | DATETIME | | |
> **Note:** Payout là yêu cầu rút tiền từ wallet về account bank. Nên khóa/ghi nhận số dư tại thời điểm tạo payout ở tầng nghiệp vụ để tránh chi vượt.
>
> **Status:** 1: Pending (Chờ duyệt), 2: Processing (Đang chuyển), 3: Completed (Hoàn tất), 4: Failed (Lỗi), 5: Rejected (Từ chối)


---

## 27. Questions

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
> **Note:** `answer` lưu đáp án/cấu hình chấm điểm dạng JSONB; nếu cần phân tích từng lựa chọn, cân nhắc chuẩn hóa thành bảng con.
>
> **Status:** 0: Inactive (Không dùng), 1: Active (Sử dụng)


---

## 28. Quiz_Questions

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | quiz_id | INT | FK, C-UQ | |
| 3 | question_id | INT | FK, C-UQ | |
| 4 | sort_order | INT | | `>= 0` |
| 5 | created_at | DATETIME | | |
| 6 | updated_at | DATETIME | | |
| 7 | deleted_at | DATETIME | | |

> **Note:** Bảng nối quiz-question, giữ thứ tự câu hỏi bằng `sort_order`. Composite unique `(quiz_id, question_id)` tránh gắn trùng câu hỏi vào cùng quiz.


---

## 29. Quiz_Results

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
> **Note:** `response_detail` lưu câu trả lời của học viên và thông tin chấm điểm tại thời điểm nộp bài.
>
> **Status:** 1: In Progress (Đang làm), 2: Submitted (Đã nộp/Chấm điểm)


---

## 30. Quizzes

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
> **Note:** `passing_score` nên thống nhất là thang điểm hoặc phần trăm trong API; nếu là phần trăm nên thêm CHECK `<= 100`.
>
> **Status:** 0: Hidden (Ẩn), 1: Draft (Bản nháp), 2: Published (Đã xuất bản)


---

## 31. Reports

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
>
> **Target:** `target_type + target_id` xác định đối tượng bị báo cáo theo mô hình polymorphic target (vd: COURSE, THREAD, COMMENT, REVIEW). Nên tạo index `(target_type, target_id)` nếu thường xuyên tra cứu theo đối tượng.


---

## 32. Reviews

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
>
> **Note:** `parent_id` hỗ trợ phản hồi review; nên giới hạn một review gốc cho mỗi `(account_id, course_id)` nếu chỉ cho phép mỗi học viên đánh giá một lần.


---

## 33. Roles

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | name | VARCHAR(255) | UQ | |
| 3 | description | VARCHAR(255) | | |
| 4 | status | INT | | |
| 5 | created_at | DATETIME | | |
| 6 | updated_at | DATETIME | | |
> **Note:** Role là dữ liệu nền tảng cho phân quyền; nên seed tối thiểu ADMIN, INSTRUCTOR, USER và không xóa cứng role đã gắn account.
>
> **Status:** 0: Inactive (Tạm khoá), 1: Active (Hoạt động)


---

## 34. System_Configs

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
>
> **Note:** `config_type` nên giới hạn giá trị như STRING, NUMBER, DECIMAL, BOOLEAN, JSON để service parse ổn định.

---

## 35. Supports

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | account_id | UUID | FK | |
| 3 | assignee_id | UUID | FK | |
| 4 | subject | VARCHAR(255) | | |
| 5 | content | TEXT | | |
| 6 | type | VARCHAR(50) | | |
| 7 | priority | INT | | |
| 8 | status | INT | IDX | |
| 9 | metadata | JSONB | | |
| 10 | created_at | DATETIME | | |
| 11 | updated_at | DATETIME | | |
| 12 | closed_at | DATETIME | | |
| 13 | deleted_at | DATETIME | | |

> **Metadata:** Lưu dữ liệu mở rộng như `related_type`, `related_id`, lịch sử trao đổi, file đính kèm, ghi chú nội bộ hoặc thông tin thiết bị/trình duyệt.
>
> **Note:** Dùng cho yêu cầu hỗ trợ/chăm sóc khách hàng dạng một bảng gọn. Nếu hội thoại hỗ trợ tăng nhiều, cân nhắc tách `Support_Messages`.
>
> **Status:** 0: Open (Mới), 1: In Progress (Đang xử lý), 2: Waiting Customer (Chờ khách hàng), 3: Resolved (Đã giải quyết), 4: Closed (Đã đóng), 5: Spam (Spam)


---

## 36. Thread_Hashtags

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | thread_id | INT | FK, C-UQ | |
| 3 | hashtag_id | INT | FK, C-UQ | |
| 4 | created_at | DATETIME | | |

> **Note:** Bảng nối thread-hashtag. Composite unique `(thread_id, hashtag_id)` tránh gắn trùng hashtag vào cùng thread.


---

## 37. Threads

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
> **Note:** `is_locked` chặn bình luận mới; `is_pinned` ưu tiên hiển thị trong topic/forum. `status = 1` hiện được dùng như pending/draft trong luồng duyệt forum.
>
> **Status:** 0: Hidden (Ẩn), 1: Pending/Draft (Chờ duyệt/Bản nháp), 2: Published (Đã xuất bản), 3: Rejected/Banned (Từ chối/Vi phạm)


---

## 38. Topics

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | account_id | UUID | FK | |
| 3 | title | VARCHAR(255) | | |
| 4 | slug | VARCHAR(255) | UQ | |
| 5 | description | VARCHAR(255) | | |
| 6 | avatar_url | VARCHAR(2048) | | |
| 7 | banner_url | VARCHAR(2048) | | |
| 8 | status | INT | | |
| 9 | created_at | DATETIME | | |
| 10 | updated_at | DATETIME | | |
| 11 | deleted_at | DATETIME | | |
> **Note:** Topic là danh mục forum. `account_id` là người tạo/quản trị topic; `slug` dùng cho URL public.
>
> **Status:** 0: Hidden (Ẩn), 1: Active (Hiển thị)


---

## 39. Votes

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | account_id | UUID | FK | |
| 3 | target_id | VARCHAR(255) | | |
| 4 | target_type | VARCHAR(255) | | |
| 5 | type | INT | | |
| 6 | value | BIT | | |
| 7 | created_at | DATETIME | | |
| 8 | updated_at | DATETIME | | |
| 9 | deleted_at | DATETIME | | |

> **Target:** `target_type + target_id` xác định đối tượng được vote theo mô hình polymorphic target (vd: THREAD, COMMENT, REVIEW). Nên tạo index `(target_type, target_id)` nếu thường xuyên tra cứu theo đối tượng.
>
> **Note:** `type` nên dùng để phân biệt hành động vote/reaction nếu cần nhiều loại tương tác; `value` biểu diễn chiều vote như up/down hoặc liked/unliked.


---

## 40. Wallets

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | UUID | PK | |
| 2 | account_id | UUID | FK | |
| 3 | remain | DECIMAL(18,6) | | `>= 0` |
| 4 | type | INT | | |
| 5 | status | INT | | |
| 6 | created_at | DATETIME | | |
| 7 | available_at | DATETIME | |
| 8 | target_type | VARCHAR(50) | |
| 9 | target_id | UUID | | |
> **Note:** `remain` là số dư hiện có; `available_at` dùng cho thời điểm tiền có thể rút nếu có cơ chế giữ tiền/chờ đối soát.
>
> **Status:** 0: Locked/Frozen (Đóng băng), 1: Active (Hoạt động)

---

## 41. Term_Modules

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | title | VARCHAR(255) | | |
| 3 | sort_order | INT | IDX | `>= 0` |
| 4 | status | INT | IDX | `IN (0, 1)` |
| 5 | metadata | JSONB | | |
| 6 | created_at | DATETIME | | |
| 7 | updated_at | DATETIME | | |

> **Note:** Đại diện cho một mục/menu cha trong trang Điều khoản. Có thể tồn tại khi chưa có trang con để quản trị viên tạo mục trước rồi thêm trang sau.
>
> **Metadata:** Cấu hình hiển thị bổ sung như icon, mô tả ngắn hoặc trạng thái mở rộng mặc định.
>
> **Status:** 0: Hidden (Ẩn), 1: Published (Hiển thị)

---

## 42. Terms

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK |
|---|--------|---------------|---------|-------|
| 1 | id | IDENTITY(1,1) | PK | |
| 2 | term_module_id | INT | FK, C-IDX | |
| 3 | title | VARCHAR(255) | | |
| 4 | url_path | VARCHAR(255) | UQ | |
| 5 | content | TEXT | | |
| 6 | sort_order | INT | C-IDX | `>= 0` |
| 7 | status | INT | C-IDX | `IN (0, 1)` |
| 8 | metadata | JSONB | | |
| 9 | created_at | DATETIME | | |
| 10 | updated_at | DATETIME | | |

> **Note:** Mỗi bản ghi là một trang điều khoản/chính sách thuộc một `Term_Module`. `url_path` lưu URL do quản trị viên nhập, không kèm dấu `/` ở đầu; ví dụ `terms/instructor/rewards`.
>
> **Metadata:** Lưu SEO hoặc các cấu hình nội dung mở rộng không cần dùng để lọc/sắp xếp thường xuyên.
>
> **Status:** 0: Draft/Hidden (Nháp/Ẩn), 1: Published (Hiển thị)



