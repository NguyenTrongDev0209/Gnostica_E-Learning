# ERD - Danh sách bảng và trường (Đối chiếu)

> [!NOTE]
> **Phiên bản 7** — Bổ sung nhóm bảng Messaging (`Conversations`, `Conversation_Participants`, `Messages`) từ migration V8 và bảng `Reply_Templates` từ V13. `Order_Details` lưu snapshot giá gốc và phần trăm giảm giá khóa học; `Orders.coupon_price` lưu số tiền coupon đã chốt tại thời điểm tạo đơn.
>
> **Ký hiệu cột Ghi chú:** PK · FK · `UQ` (Unique) · `IDX` (Index) · `C-UQ` (Composite Unique) · `C-IDX` (Composite Index)

**Tổng số bảng: 48**

---

## 1. Account_Banks

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | UUID | PK, NOT NULL | | Khóa chính |
| 2 | account_id | UUID | FK, C-UQ | | ID tài khoản người dùng |
| 3 | bank_id | INT | FK, C-UQ | | ID ngân hàng |
| 4 | account_number | VARCHAR(255) | C-UQ, NOT NULL | | Số tài khoản ngân hàng |
| 5 | pin | VARCHAR(255) | | | Mã PIN xác thực rút tiền |
| 6 | status | INT | NOT NULL | | Trạng thái liên kết (0/1) |
| 7 | created_at | DATETIME | | | Ngày tạo |
| 8 | updated_at | DATETIME | | | Ngày cập nhật |
| 9 | deleted_at | DATETIME | | | Ngày xóa mềm |

> **C-UQ:** `(account_id, bank_id, account_number)` — Mỗi tài khoản chỉ liên kết 1 lần với 1 số tài khoản ngân hàng.
>
> **Status:** 0: Inactive (Ngừng dùng), 1: Active (Đang sử dụng)
>
> **Note:** Mỗi account chỉ nên có một tài khoản ngân hàng active tại một thời điểm nếu dùng làm tài khoản nhận payout mặc định.


---

## 2. Accounts

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | UUID | PK, NOT NULL | | Khóa chính |
| 2 | role_id | INT | FK | | ID vai trò (ADMIN/INSTRUCTOR/USER) |
| 3 | email | VARCHAR(255) | UQ, NOT NULL | | Email đăng nhập (duy nhất) |
| 4 | full_name | VARCHAR(255) | NOT NULL | | Họ tên người dùng |
| 5 | phone | VARCHAR(12) | | | Số điện thoại |
| 6 | password | VARCHAR(255) | | | Mật khẩu (mã hóa BCrypt) |
| 7 | avatar | VARCHAR(2048) | | | Ảnh đại diện (Cloudinary) |
| 8 | provider | VARCHAR(255) | IDX | | Nguồn đăng nhập (LOCAL/GOOGLE) |
| 9 | birth_day | DATE | | | Ngày sinh |
| 10 | metadata | JSONB | | | Thông tin mở rộng (bio, social...) |
| 11 | status | INT | IDX, NOT NULL | | Trạng thái tài khoản (0–3) |
| 12 | created_at | DATETIME | | | Ngày tạo |
| 13 | updated_at | DATETIME | | | Ngày cập nhật |
| 14 | deleted_at | DATETIME | | | Ngày xóa mềm |
> **Metadata:** Lưu hồ sơ mở rộng không cố định như thông tin đăng ký instructor, bio, social links, trạng thái xác minh bổ sung.
>
> **Status:** 0: Unverified (Chưa xác thực), 1: Active (Hoạt động), 2: Banned (Bị khoá), 3: Deleted (Chờ xoá)


---

## 3. Attachments

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | IDENTITY(1,1) | PK, NOT NULL | | Khóa chính |
| 2 | module_id | INT | FK | | ID chương (module) |
| 3 | file_url | VARCHAR(255) | NOT NULL | | Đường dẫn tài liệu (Bunny Storage) |
| 4 | file_type | VARCHAR(255) | | | Loại file (PDF, DOCX...) |
| 5 | status | INT | NOT NULL | | Trạng thái hiển thị (0/1) |
| 6 | created_at | DATETIME | | | Ngày tạo |
| 7 | updated_at | DATETIME | | | Ngày cập nhật |
| 8 | deleted_at | DATETIME | | | Ngày xóa mềm |
> **Note:** Attachment gắn với `Modules`; tài nguyên chính của lesson như video nên nằm ở `Lessons.video_url` hoặc `Lessons.metadata`.
>
> **Status:** 0: Hidden (Ẩn), 1: Available (Có sẵn)


---

## 4. Banks

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | IDENTITY(1,1) | PK, NOT NULL | | Khóa chính |
| 2 | external_id | INT | UQ | | ID ngân hàng từ nguồn ngoài |
| 3 | bank_code | VARCHAR(255) | | | Mã ngân hàng (VCB, VIB...) |
| 4 | bin | VARCHAR(255) | UQ | | Mã BIN định danh ngân hàng |
| 5 | short_name | VARCHAR(255) | | | Tên viết tắt |
| 6 | logo_url | VARCHAR(255) | | | Logo ngân hàng |
| 7 | status | INT | NOT NULL | | Trạng thái (0/1) |
| 8 | created_at | DATETIME | | | Ngày tạo |
| 9 | updated_at | DATETIME | | | Ngày cập nhật |
| 10 | deleted_at | DATETIME | | | Ngày xóa mềm |
> **Note:** Dữ liệu ngân hàng có thể đồng bộ từ nhà cung cấp bên ngoài qua `external_id`, `bank_code`, `bin`.
>
> **Status:** 0: Maintenance (Bảo trì), 1: Active (Hoạt động)


---

## 5. Banners

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | IDENTITY(1,1) | PK, NOT NULL | | Khóa chính |
| 2 | title | VARCHAR(255) | NOT NULL | | Tiêu đề banner |
| 3 | image_url | VARCHAR(1000) | | | Ảnh banner |
| 4 | link_url | VARCHAR(1000) | | | Đường dẫn khi bấm vào |
| 5 | alt_text | VARCHAR(255) | | | Văn bản thay thế (SEO) |
| 6 | target_type | VARCHAR(50) | IDX | | Phân loại banner (WEB/MOBILE...) |
| 7 | position | VARCHAR(50) | | | Vị trí hiển thị (HERO/SIDEBAR) |
| 8 | sort_order | INT | | `>= 0` | Thứ tự sắp xếp |
| 9 | status | INT | NOT NULL | | Trạng thái (0/1) |
| 10 | created_at | DATETIME | | | Ngày tạo |
| 11 | updated_at | DATETIME | | | Ngày cập nhật |

> **Note:** `target_type` dùng để phân loại banner (vd: WEB, MOBILE, APP_POPUP). `position` dùng để chỉ định vị trí (vd: HERO, SIDEBAR). `alt_text` hỗ trợ accessibility/SEO cho ảnh banner.
>
> **Status:** 0: Hidden (Ẩn), 1: Active (Hiển thị)

---

## 6. Categories

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | IDENTITY(1,1) | PK, NOT NULL | | Khóa chính |
| 2 | account_id | UUID | FK | | ID người tạo danh mục |
| 3 | parent_id | INT | FK | | ID danh mục cha (cây đa cấp) |
| 4 | name | VARCHAR(255) | NOT NULL | | Tên danh mục |
| 5 | slug | VARCHAR(255) | UQ, NOT NULL | | Slug URL (duy nhất) |
| 6 | description | VARCHAR(255) | | | Mô tả danh mục |
| 7 | thumbnail | VARCHAR(255) | | | Ảnh đại diện |
| 8 | color | VARCHAR(255) | | | Màu hiển thị |
| 9 | sort_order | INT | | `>= 0` | Thứ tự sắp xếp |
| 10 | status | INT | NOT NULL | | Trạng thái (0/1) |
| 11 | created_at | DATETIME | | | Ngày tạo |
| 12 | updated_at | DATETIME | | | Ngày cập nhật |
| 13 | deleted_at | DATETIME | | | Ngày xóa mềm |
> **Note:** `parent_id` tự tham chiếu `Categories.id`, hỗ trợ cây danh mục nhiều cấp. Khi ẩn danh mục cha cần đồng bộ hoặc chặn hiển thị khóa học thuộc danh mục con.
>
> **Status:** 0: Hidden (Ẩn), 1: Active (Hiển thị)


---

## 7. Comments

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | IDENTITY(1,1) | PK, NOT NULL | | Khóa chính |
| 2 | account_id | UUID | FK | | ID người bình luận |
| 3 | target_type | VARCHAR(50) | IDX, NOT NULL | | Loại đối tượng (THREAD/LESSON...) |
| 4 | target_id | VARCHAR(255) | IDX, NOT NULL | | ID đối tượng được bình luận |
| 5 | parent_id | INT | FK, IDX | | ID bình luận cha (reply lồng) |
| 6 | mention_id | UUID | FK | | ID người được nhắc đến |
| 7 | content | TEXT | NOT NULL | | Nội dung bình luận |
| 8 | status | INT | NOT NULL | | Trạng thái (0/1/2) |
| 9 | created_at | DATETIME | | | Ngày tạo |
| 10 | updated_at | DATETIME | | | Ngày cập nhật |
| 11 | deleted_at | DATETIME | | | Ngày xóa mềm |
> **Target:** `target_type + target_id` xác định đối tượng được bình luận theo mô hình polymorphic target. Forum dùng `THREAD`, hỏi đáp bài học dùng `LESSON`; dữ liệu cũ không xác định được đối tượng có thể dùng `LEGACY`.
>
> **Index:** Tạo index `(target_type, target_id)` để tải danh sách bình luận theo đối tượng và index `parent_id` để lấy reply nhanh.
>
> **Note:** `parent_id` hỗ trợ trả lời lồng nhau; `mention_id` lưu account được nhắc đến trong bình luận. `thread_id` đã được thay thế bằng `target_type/target_id` để bảng `Comments` dùng chung cho nhiều ngữ cảnh.
>
> **Status:** 0: Hidden (Ẩn), 1: Published (Hiển thị), 2: Spam/Reported (Vi phạm)


---

## 8. Commissions

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | IDENTITY(1,1) | PK, NOT NULL | | Khóa chính |
| 2 | account_id | UUID | FK | | ID giảng viên |
| 3 | instructor_ratio | DECIMAL(5,2) | NOT NULL | `>= 0 AND <= 100` | Tỷ lệ hoa hồng giảng viên (%) |
| 4 | platform_ratio | DECIMAL(5,2) | NOT NULL | `>= 0 AND <= 100` | Tỷ lệ hoa hồng nền tảng (%) |
| 5 | valid_from | DATETIME | | | Ngày bắt đầu áp dụng |
| 6 | valid_until | DATETIME | | | Ngày kết thúc áp dụng |
| 7 | status | INT | NOT NULL | | Trạng thái (0/1) |
| 8 | metadata | JSONB | NOT NULL | | Cấu hình mở rộng |
| 9 | created_at | DATETIME | | | Ngày tạo |
| 10 | updated_at | DATETIME | | | Ngày cập nhật |

> **Bảng mới** — Quản lý phần trăm ăn chia doanh thu theo thời gian của từng giảng viên (Account).
>
> **Note:** Bảng nên vận hành append-only: đổi tỷ lệ thì tạo bản ghi mới, không sửa bản ghi đã được `Order_Details.commission_id` tham chiếu. Nên ràng buộc `instructor_ratio + platform_ratio = 100`.
>
> **Status:** 0: Inactive (Đã cũ), 1: Active (Đang áp dụng)


---

## 9. Coupons

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | UUID | PK, NOT NULL | | Khóa chính |
| 2 | account_id | UUID | FK, NOT NULL | | ID người tạo coupon |
| 3 | code | TEXT | UQ, NOT NULL | | Mã giảm giá hiển thị |
| 4 | code_hash | VARCHAR(64) | UQ | | Mã băm của code (bảo mật) |
| 5 | name | VARCHAR(255) | NOT NULL | | Tên chương trình giảm giá |
| 6 | discount_type | INT | NOT NULL | | Loại giảm (1: %, 2: tiền) |
| 7 | discount_value | DECIMAL(18,6) | NOT NULL | | Giá trị giảm |
| 8 | min_discount | DECIMAL(18,6) | | | Giảm tối thiểu |
| 9 | max_discount | DECIMAL(18,6) | | | Giảm tối đa |
| 10 | quantity | INT | | | Số lượng mã phát hành |
| 11 | reserved_quantity | INT | NOT NULL | Def: 0 | Số mã đã đặt trước |
| 12 | valid_from | DATETIME | | | Ngày bắt đầu hiệu lực |
| 13 | valid_until | DATETIME | | | Ngày hết hạn |
| 14 | status | INT | NOT NULL | | Trạng thái (0/1/2) |
| 15 | metadata | JSONB | | | Quy tắc mở rộng (scope...) |
| 16 | created_at | DATETIME | | | Ngày tạo |
| 17 | updated_at | DATETIME | | | Ngày cập nhật |
| 18 | deleted_at | DATETIME | | | Ngày xóa mềm |
> **Metadata:** Lưu các rule mềm của coupon như danh sách khóa học/danh mục áp dụng, giới hạn số lần dùng mỗi user, first purchase only, segment người dùng...
>
> **Note:** `discount_type`: 1 = phần trăm, 2 = số tiền cố định. Các rule cần query/report thường xuyên nên tách thành cột hoặc bảng riêng thay vì chỉ để trong metadata.
>
> **Status:** 0: Inactive (Tạm dừng), 1: Active (Đang áp dụng), 2: Expired (Hết hạn)


---

## 10. Courses

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | UUID | PK, NOT NULL | | Khóa chính |
| 2 | account_id | UUID | FK | | ID giảng viên sở hữu |
| 3 | category_id | INT | FK, C-IDX | | ID danh mục |
| 4 | original_course_id | UUID | FK | | ID khóa gốc (versioning) |
| 5 | title | VARCHAR(255) | NOT NULL | | Tiêu đề khóa học |
| 6 | slug | VARCHAR(255) | UQ, NOT NULL | | Slug URL (duy nhất) |
| 7 | description | TEXT | | | Mô tả chi tiết |
| 8 | thumbnail | VARCHAR(255) | | | Ảnh bìa |
| 9 | price | DECIMAL(18,6) | NOT NULL | `>= 0` | Giá gốc |
| 10 | discount | INT | NOT NULL | `>= 0 AND <= 100` | Phần trăm giảm giá |
| 11 | level | VARCHAR(50) | | | Cấp độ (beginner...) |
| 12 | promo_video | VARCHAR(255) | | | Video giới thiệu (Bunny) |
| 13 | shared_count | INT | NOT NULL | `>= 0` | Số lượt chia sẻ |
| 14 | version_number | INT | NOT NULL | `>= 1` | Số phiên bản |
| 15 | status | INT | C-IDX, NOT NULL | | Trạng thái (0–4) |
| 16 | metadata | JSONB | | | Điều kiện chứng chỉ, SEO... |
| 17 | created_at | DATETIME | | | Ngày tạo |
| 18 | updated_at | DATETIME | | | Ngày cập nhật |
| 19 | published_at | DATETIME | C-IDX | | Ngày xuất bản |
| 20 | deleted_at | DATETIME | | | Ngày xóa mềm |

> **Versioning:** `original_course_id` trỏ về phiên bản gốc, `version_number` quản lý các bản Draft/Published.
>
> **Metadata:** Lưu thông tin mở rộng như điều kiện cấp chứng chỉ, lý do từ chối gần nhất, SEO, outcomes, requirements.
>
> **Note:** `original_course_id` dùng cho versioning. Bản chỉnh sửa có thể trỏ về khóa học gốc; khi được duyệt thì merge nội dung về bản gốc.
>
> **Status:** 0: Hidden/Inactive (Ẩn/không hoạt động), 1: Published/Approved (Đã xuất bản/đã duyệt), 2: Draft (Bản nháp), 3: Rejected (Từ chối), 4: Pending (Chờ duyệt)


---

## 11. Devices

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | UUID | PK, NOT NULL | | Khóa chính |
| 2 | account_id | UUID | FK | | ID tài khoản |
| 3 | device_token | VARCHAR(255) | NOT NULL | | Token đăng nhập thiết bị |
| 4 | device_type | VARCHAR(50) | | | Loại thiết bị |
| 5 | device_name | VARCHAR(255) | | | Tên thiết bị |
| 6 | ip_address | VARCHAR(50) | | | Địa chỉ IP |
| 7 | is_trusted | BIT | | | Thiết bị tin cậy |
| 8 | last_login | DATETIME | | | Lần đăng nhập gần nhất |
| 9 | status | INT | NOT NULL | | Trạng thái phiên (0/1) |
| 10 | created_at | DATETIME | | | Ngày tạo |
| 11 | updated_at | DATETIME | | | Ngày cập nhật |
| 12 | deleted_at | DATETIME | | | Ngày xóa mềm |
> **Note:** Dùng để quản lý phiên đăng nhập/thiết bị nhận thông báo. `device_token` cần được revoke khi đăng xuất hoặc token hết hạn.
>
> **Status:** 0: Revoked (Đã đăng xuất), 1: Active (Đang đăng nhập)


---

## 12. Enrollments

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | IDENTITY(1,1) | PK, NOT NULL | | Khóa chính |
| 2 | account_id | UUID | FK, C-UQ | | ID học viên |
| 3 | course_id | UUID | FK, C-UQ | | ID khóa học |
| 4 | order_detail_id | UUID | FK | | ID chi tiết đơn (truy vết quyền) |
| 5 | progress | INT | NOT NULL | `>= 0 AND <= 100` | Tiến độ hoàn thành (%) |
| 6 | certificate_url | VARCHAR(255) | | | URL chứng chỉ |
| 7 | status | INT | NOT NULL | | Trạng thái (0/1/2) |
| 8 | created_at | DATETIME | | | Ngày tạo |
| 9 | completed_at | DATETIME | | | Ngày hoàn thành |
> **Note:** Enrollment được tạo sau thanh toán thành công và liên kết về `order_detail_id` để truy vết quyền học phát sinh từ dòng đơn hàng nào.
>
> **Status:** 0: Dropped/Refunded (Đã huỷ/Hoàn tiền), 1: In Progress (Đang học), 2: Completed (Hoàn thành)


---

## 13. Favorites

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | IDENTITY(1,1) | PK, NOT NULL | | Khóa chính |
| 2 | account_id | UUID | FK, C-UQ | | ID người yêu thích |
| 3 | course_id | UUID | FK, C-UQ | | ID khóa học |
| 4 | status | INT | NOT NULL | | Trạng thái (0/1) |
| 5 | created_at | DATETIME | | | Ngày tạo |
> **Note:** Bảng wishlist/favorite mềm; không xóa cứng khi user bỏ yêu thích để giữ lịch sử tương tác.
>
> **Status:** 0: Removed (Đã bỏ), 1: Active (Yêu thích)


---

## 14. Follows

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | IDENTITY(1,1) | PK, NOT NULL | | Khóa chính |
| 2 | follower_id | UUID | FK, C-UQ | | ID người theo dõi |
| 3 | followee_id | UUID | FK, C-UQ | | ID người được theo dõi |
| 4 | created_at | DATETIME | | | Ngày tạo |

> **Note:** `follower_id` là người theo dõi, `followee_id` là người được theo dõi. Cần chặn self-follow ở tầng service hoặc CHECK nếu DB hỗ trợ.


---

## 15. Hashtags

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | IDENTITY(1,1) | PK, NOT NULL | | Khóa chính |
| 2 | name | VARCHAR(255) | UQ, NOT NULL | | Tên hashtag (duy nhất) |
| 3 | usage_count | INT | | `>= 0` | Số lần được dùng |
| 4 | status | INT | NOT NULL | | Trạng thái (0/1) |
| 5 | created_at | DATETIME | | | Ngày tạo |
| 6 | deleted_at | DATETIME | | | Ngày xóa mềm |
> **Note:** `usage_count` nên được cập nhật khi gắn/bỏ hashtag khỏi thread; có thể rebuild định kỳ từ `Thread_Hashtags` nếu lệch số liệu.
>
> **Status:** 0: Hidden (Ẩn), 1: Active (Hoạt động)


---

## 16. Lesson_Progress

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | IDENTITY(1,1) | PK, NOT NULL | | Khóa chính |
| 2 | account_id | UUID | FK, C-UQ | | ID học viên |
| 3 | lesson_id | INT | FK, C-UQ | | ID bài học |
| 4 | last_watched_at | VARCHAR(255) | | | Thời điểm xem gần nhất |
| 5 | status | INT | NOT NULL | | Trạng thái (0/1/2) |
| 6 | created_at | DATETIME | | | Ngày tạo |
| 7 | updated_at | DATETIME | | | Ngày cập nhật |
| 8 | completed_at | DATETIME | | | Ngày hoàn thành |
> **Note:** Mỗi account chỉ có một progress record cho một lesson. `last_watched_at` nên chuẩn hóa sang timestamp/duration nếu cần phân tích học tập.
>
> **Status:** 0:Dropped, 1:InProgress, 2:Completed


---

## 17. Lessons

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | IDENTITY(1,1) | PK, NOT NULL | | Khóa chính |
| 2 | module_id | INT | FK | | ID chương học |
| 3 | original_lesson_id | INT | FK | | ID bài gốc (versioning) |
| 4 | title | VARCHAR(255) | NOT NULL | | Tiêu đề bài học |
| 5 | content | TEXT | | | Nội dung bài học |
| 6 | video_url | VARCHAR(255) | | | URL video (Bunny HLS) |
| 7 | metadata | JSONB | | | Thời lượng, transcript, preview |
| 8 | version_number | INT | NOT NULL | `>= 1` | Số phiên bản |
| 9 | sort_order | INT | NOT NULL | `>= 0` | Thứ tự bài học |
| 10 | status | INT | NOT NULL | | Trạng thái (0/1/2) |
| 11 | created_at | DATETIME | | | Ngày tạo |
| 12 | updated_at | DATETIME | | | Ngày cập nhật |
| 13 | deleted_at | DATETIME | | | Ngày xóa mềm |

> **Versioning:** Hỗ trợ versioning cho bài giảng tương tự Khóa học.
>
> **Metadata:** Lưu thông tin mở rộng của bài giảng như thời lượng video, tài nguyên nhúng, transcript, cấu hình preview/free lesson.
>
> **Note:** `original_lesson_id` trỏ về lesson gốc khi tạo phiên bản chỉnh sửa; `sort_order` quyết định thứ tự trong module.
>
> **Status:** 0: Hidden (Ẩn), 1: Draft (Bản nháp), 2: Published (Đã xuất bản)


---

## 18. Logs

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | IDENTITY(1,1) | PK, NOT NULL | | Khóa chính |
| 2 | account_id | UUID | FK, IDX | | ID người thực hiện |
| 3 | action | VARCHAR(255) | IDX, NOT NULL | | Tên hành động |
| 4 | payload | JSONB | | | Dữ liệu chi tiết hành động |
| 5 | created_at | DATETIME | | | Ngày tạo |

> **Note:** Dùng cho audit/event log. `payload` nên lưu JSON có `target_type`, `target_id` khi log liên quan đến một thực thể cụ thể.


---

## 19. Members

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | IDENTITY(1,1) | PK, NOT NULL | | Khóa chính |
| 2 | account_id | UUID | FK, C-UQ | | ID thành viên |
| 3 | topic_id | INT | FK, C-UQ | | ID topic tham gia |
| 4 | created_at | DATETIME | | | Ngày tạo |

> **Note:** Bảng thành viên topic/forum; dùng để phân quyền, theo dõi hoặc notification theo topic.


---

## 20. Modules

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | IDENTITY(1,1) | PK, NOT NULL | | Khóa chính |
| 2 | course_id | UUID | FK | | ID khóa học |
| 3 | original_module_id | INT | FK | | ID chương gốc (versioning) |
| 4 | title | VARCHAR(255) | NOT NULL | | Tiêu đề chương |
| 5 | metadata | JSONB | | | Mục tiêu, thời lượng ước tính |
| 6 | version_number | INT | NOT NULL | `>= 1` | Số phiên bản |
| 7 | sort_order | INT | NOT NULL | `>= 0` | Thứ tự chương |
| 8 | status | INT | NOT NULL | | Trạng thái (0/1/2) |
| 9 | created_at | DATETIME | | | Ngày tạo |
| 10 | updated_at | DATETIME | | | Ngày cập nhật |
| 11 | deleted_at | DATETIME | | | Ngày xóa mềm |

> **Versioning:** Hỗ trợ versioning cho module tương tự Khóa học.
>
> **Metadata:** Lưu thông tin mở rộng của module như mục tiêu học tập, mô tả ngắn, thời lượng ước tính, cấu hình mở khóa.
>
> **Note:** `original_module_id` trỏ về module gốc khi tạo phiên bản chỉnh sửa; module bị xóa nên dùng `deleted_at` thay vì xóa cứng nếu đã có progress.
>
> **Status:** 0: Hidden (Ẩn), 1: Draft (Bản nháp), 2: Published (Đã xuất bản)


---

## 21. Notifications

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | IDENTITY(1,1) | PK, NOT NULL | | Khóa chính |
| 2 | account_id | UUID | FK, C-IDX | | ID người nhận |
| 3 | title | VARCHAR(255) | NOT NULL | | Tiêu đề thông báo |
| 4 | message | TEXT | | | Nội dung thông báo |
| 5 | is_read | BOOLEAN | NOT NULL | Def: false | Đã đọc chưa |
| 6 | type | VARCHAR(50) | | | Loại thông báo |
| 7 | reference_id | VARCHAR(255) | | | ID tham chiếu (order, thread...) |
| 8 | created_at | DATETIME | | | Ngày tạo |
| 9 | updated_at | DATETIME | | | Ngày cập nhật |

> **Note:** Nên index `(account_id, is_read, created_at)` nếu màn hình thông báo thường xuyên lọc unread và sắp xếp mới nhất.


---

## 22. Order_Details

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | UUID | PK, NOT NULL | | Khóa chính |
| 2 | order_id | UUID | FK | | ID đơn hàng |
| 3 | course_id | UUID | FK | | ID khóa học |
| 4 | commission_id | INT | FK | | ID tỷ lệ hoa hồng áp dụng |
| 5 | price | DECIMAL(18,6) | NOT NULL | `>= 0` | Giá gốc (snapshot) |
| 6 | discount | INT | NOT NULL | `>= 0 AND <= 100` | % giảm giá (snapshot) |
| 7 | status | INT | NOT NULL | | Trạng thái (0/1) |
| 8 | created_at | DATETIME | | | Ngày tạo |
| 9 | updated_at | DATETIME | | | Ngày cập nhật |
> **Commission:** `commission_id` trỏ tới bản ghi `Commissions` được áp dụng tại thời điểm tạo dòng đơn hàng. `Commissions` nên vận hành theo hướng append-only: đổi tỷ lệ thì tạo bản ghi mới, không sửa bản ghi cũ.
>
> **Snapshot giá:** `price` là giá gốc khóa học tại thời điểm tạo đơn, không được đọc lại từ `Courses.price` khi thanh toán, tính doanh thu hoặc đối soát. Số tiền sau giảm giá khóa học của detail là `price - (price × discount / 100)`.
>
> **Coupon:** Coupon không được trừ trực tiếp vào `Order_Details.price`; số tiền giảm coupon cụ thể được chốt một lần ở `Orders.coupon_price`. Với đơn có nhiều detail, coupon chỉ được tính trên tổng các detail thuộc scope coupon (toàn sàn, giảng viên, danh mục hoặc khóa học).
>
> **Status:** 0: Refunded (Đã hoàn tiền), 1: Valid (Hợp lệ)


---

## 23. Orders

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | UUID | PK, NOT NULL | | Khóa chính |
| 2 | account_id | UUID | FK, C-IDX | | ID người mua |
| 3 | coupon_id | UUID | FK | | ID coupon áp dụng |
| 4 | coupon_price | DECIMAL(18,6) | | `>= 0` | Số tiền coupon giảm |
| 5 | total_price | DECIMAL(18,6) | NOT NULL | `>= 0` | Tổng tiền thanh toán |
| 6 | payment_method | VARCHAR(255) | NOT NULL | | Phương thức thanh toán |
| 7 | order_code | BIGINT | UQ | | Mã đơn hàng (đối soát) |
| 8 | status | INT | NOT NULL | | Trạng thái (0–3) |
| 9 | created_at | DATETIME | C-IDX | | Ngày tạo |
| 10 | updated_at | DATETIME | | | Ngày cập nhật |
> **Công thức:** `subtotal = Σ(detail.price - detail.price × detail.discount / 100)` trên các detail hợp lệ. `total_price = max(0, subtotal - coupon_price)`.
>
> **Note:** `coupon_price` là số tiền cụ thể, không phải phần trăm. Giá trị này được tính sau khi kiểm tra điều kiện/scope của coupon và được giữ nguyên để đối soát lịch sử. `order_code` dùng cho đối soát với cổng thanh toán.
>
> **Status:** 0:Pending, 1:Paid, 2:Refunded, 3:Cancelled


---

## 24. Pages

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | IDENTITY(1,1) | PK, NOT NULL | | Khóa chính |
| 2 | title | VARCHAR(255) | NOT NULL | | Tiêu đề trang |
| 3 | slug | VARCHAR(255) | UQ, NOT NULL | | Slug URL (duy nhất) |
| 4 | content | TEXT | | | Nội dung trang (HTML/Markdown) |
| 5 | metadata | JSONB | NOT NULL | | Cấu hình hiển thị |
| 6 | status | INT | NOT NULL | | Trạng thái (0/1) |
| 7 | created_at | DATETIME | | | Ngày tạo |
| 8 | updated_at | DATETIME | | | Ngày cập nhật |

> **Bảng mới** — Quản lý các trang tĩnh (Điều khoản, Chính sách...).
>
> **Note:** `slug` là khóa public để truy cập trang; nội dung có thể là HTML/Markdown tùy convention của frontend.
>
> **Metadata:** Lưu cấu hình hiển thị mở rộng, ví dụ `menuGroup`, `menuOrder`, `pageOrder`, `showInTermsMenu` cho các trang `/terms/...`.
>
> **Status:** 0: Hidden (Ẩn), 1: Published (Hiển thị)

---

## 25. Payments

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | UUID | PK, NOT NULL | | Khóa chính |
| 2 | order_id | UUID | FK | | ID đơn hàng |
| 3 | payment_code | VARCHAR(12) | IDX | = order_code (mã hiển thị 12 số) | Mã thanh toán 12 số |
| 4 | amount | DECIMAL(18,6) | NOT NULL | `>= 0` | Số tiền thanh toán |
| 5 | gateway | VARCHAR(32) | IDX, NOT NULL | | Cổng thanh toán (PAYOS/VNPAY...) |
| 6 | gateway_transaction_no | VARCHAR(255) | C-UQ | | Mã giao dịch của cổng |
| 7 | paid_at | DATETIME | IDX | | Thời điểm thanh toán |
| 8 | payload | JSONB | Lưu thông tin ngân hàng/callback | | Dữ liệu callback |
| 9 | status | INT | NOT NULL | | Trạng thái (1–4) |
| 10 | created_at | DATETIME | | | Ngày tạo |
| 11 | updated_at | DATETIME | | | Ngày cập nhật |
> **Note:** Một order có thể có nhiều payment attempts nếu retry/cổng thanh toán khác nhau; `payment_code` = `order_code` (mã hiển thị 12 số, non-unique — chỉ index). Chống xử lý trùng webhook dùng `gateway + gateway_transaction_no` (unique có điều kiện khi `gateway_transaction_no` khác null). Phiên bản 7: Đơn FREE (0đ) có Payment record.
>
> **Status:** 1: Pending (Chờ xử lý), 2: Success (Thành công), 3: Failed (Thất bại), 4: Refunded (Đã hoàn tiền)


---

## 26. Payouts

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | UUID | PK, NOT NULL | | Khóa chính |
| 2 | account_id | UUID | FK | | ID giảng viên rút tiền |
| 3 | account_bank_id | UUID | FK | | ID tài khoản ngân hàng nhận |
| 4 | amount | DECIMAL(18,6) | NOT NULL | | Số tiền rút |
| 5 | status | INT | NOT NULL | | Trạng thái (1–6) |
| 6 | created_at | DATETIME | | | Ngày tạo |
| 7 | updated_at | DATETIME | | | Ngày cập nhật |
| 8 | gateway_payout_id | VARCHAR | unique | | ID payout của PayOS |
| 9 | payout_code | VARCHAR(12) | UQ | | Mã rút tiền 12 số |
| 10 | idempotency_key | VARCHAR | | | Khóa chống trùng |
| 11 | submission_attempts | INT | default 0 | | Số lần gửi lại |
| 12 | last_submission_at | DATETIME | | | Lần gửi gần nhất |
| 13 | last_submission_error | VARCHAR(500) | | | Lỗi lần gửi gần nhất |
| 14 | metadata | JSONB | | | Người duyệt, lý do từ chối |
> **Note:** Payout là yêu cầu rút tiền từ wallet về account bank. Nên khóa/ghi nhận số dư tại thời điểm tạo payout ở tầng nghiệp vụ để tránh chi vượt.
>
> **Status:** 1: Pending (Chờ duyệt), 2: Processing (Đang chuyển), 3: Completed (Hoàn tất), 4: Failed (Lỗi), 5: Rejected (Từ chối), 6: Awaiting approval (Chờ admin duyệt — lệnh >= 5.000.000đ, chưa submit PayOS cho tới khi admin approve)


---

## 27. Questions

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | IDENTITY(1,1) | PK, NOT NULL | | Khóa chính |
| 2 | course_id | UUID | FK | | ID khóa học |
| 3 | original_question_id | INT | FK | | ID câu gốc (versioning) |
| 4 | content | TEXT | NOT NULL | | Nội dung câu hỏi |
| 5 | level | VARCHAR(255) | | | Độ khó |
| 6 | explanation | TEXT | | | Giải thích đáp án |
| 7 | answer | JSONB | | | Đáp án & cấu hình chấm điểm |
| 8 | version_number | INT | NOT NULL | `>= 1` | Số phiên bản |
| 9 | status | INT | NOT NULL | | Trạng thái (0/1) |
| 10 | created_at | DATETIME | | | Ngày tạo |
| 11 | updated_at | DATETIME | | | Ngày cập nhật |

> **Versioning:** Hỗ trợ versioning cho câu hỏi tương tự Khóa học.
>
> **Note:** `answer` lưu đáp án/cấu hình chấm điểm dạng JSONB; nếu cần phân tích từng lựa chọn, cân nhắc chuẩn hóa thành bảng con.
>
> **Status:** 0: Inactive (Không dùng), 1: Active (Sử dụng)


---

## 28. Quiz_Questions

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | IDENTITY(1,1) | PK, NOT NULL | | Khóa chính |
| 2 | quiz_id | INT | FK, C-UQ | | ID bài quiz |
| 3 | question_id | INT | FK, C-UQ | | ID câu hỏi |
| 4 | sort_order | INT | NOT NULL | `>= 0` | Thứ tự câu hỏi |
| 5 | created_at | DATETIME | | | Ngày tạo |
| 6 | updated_at | DATETIME | | | Ngày cập nhật |
| 7 | deleted_at | DATETIME | | | Ngày xóa mềm |

> **Note:** Bảng nối quiz-question, giữ thứ tự câu hỏi bằng `sort_order`. Composite unique `(quiz_id, question_id)` tránh gắn trùng câu hỏi vào cùng quiz.


---

## 29. Quiz_Results

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | IDENTITY(1,1) | PK, NOT NULL | | Khóa chính |
| 2 | account_id | UUID | FK | | ID học viên làm bài |
| 3 | quiz_id | INT | FK | | ID quiz |
| 4 | point | DECIMAL(5,2) | | `>= 0` | Điểm số |
| 5 | total_questions | INT | | `>= 0` | Tổng số câu hỏi |
| 6 | correct_answers | INT | | `>= 0` | Số câu đúng |
| 7 | time | INT | | `>= 0` | Thời gian làm bài |
| 8 | response_detail | JSONB | | | Chi tiết đáp án đã nộp |
| 9 | status | INT | NOT NULL | | Trạng thái (1/2) |
| 10 | created_at | DATETIME | | | Ngày tạo |
| 11 | completed_at | DATETIME | | | Ngày nộp bài |

> **Cập nhật:** Đổi `point` thành `DECIMAL(5,2)` để lưu điểm chính xác tuyệt đối.
>
> **Note:** `response_detail` lưu câu trả lời của học viên và thông tin chấm điểm tại thời điểm nộp bài.
>
> **Status:** 1: In Progress (Đang làm), 2: Submitted (Đã nộp/Chấm điểm)


---

## 30. Quizzes

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | IDENTITY(1,1) | PK, NOT NULL | | Khóa chính |
| 2 | module_id | INT | FK | | ID chương chứa quiz |
| 3 | original_quiz_id | INT | FK | | ID quiz gốc (versioning) |
| 4 | title | VARCHAR(255) | NOT NULL | | Tiêu đề quiz |
| 5 | max_attempts | INT | NOT NULL | `>= 1` | Số lần làm tối đa |
| 6 | passing_score | DECIMAL(5,2) | NOT NULL | `>= 0` | Điểm đỗ |
| 7 | version_number | INT | NOT NULL | `>= 1` | Số phiên bản |
| 8 | status | INT | NOT NULL | | Trạng thái (0/1/2) |
| 9 | created_at | DATETIME | | | Ngày tạo |

> **Cập nhật:** Thêm `max_attempts` và `passing_score (DECIMAL)` cho cấu hình bài thi. Thêm versioning.
>
> **Note:** `passing_score` nên thống nhất là thang điểm hoặc phần trăm trong API; nếu là phần trăm nên thêm CHECK `<= 100`.
>
> **Status:** 0: Hidden (Ẩn), 1: Draft (Bản nháp), 2: Published (Đã xuất bản)


---

## 31. Reports

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | IDENTITY(1,1) | PK, NOT NULL | | Khóa chính |
| 2 | account_id | UUID | FK | | ID người báo cáo |
| 3 | target_id | VARCHAR(255) | NOT NULL | | ID đối tượng bị báo cáo |
| 4 | target_type | VARCHAR(255) | NOT NULL | | Loại đối tượng (COURSE/THREAD...) |
| 5 | reason | VARCHAR(255) | NOT NULL | | Lý do báo cáo |
| 6 | description | JSONB | | | Mô tả chi tiết |
| 7 | status | INT | NOT NULL | | Trạng thái (1–4) |
| 8 | created_at | DATETIME | | | Ngày tạo |
| 9 | updated_at | DATETIME | | | Ngày cập nhật |
| 10 | deleted_at | DATETIME | | | Ngày xóa mềm |
> **Status:** 1: Pending (Chờ xử lý), 2: Processing (Đang xử lý), 3: Resolved (Đã giải quyết), 4: Dismissed (Bỏ qua)
>
> **Target:** `target_type + target_id` xác định đối tượng bị báo cáo theo mô hình polymorphic target (vd: COURSE, THREAD, COMMENT, REVIEW). Nên tạo index `(target_type, target_id)` nếu thường xuyên tra cứu theo đối tượng.


---

## 32. Reviews

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | IDENTITY(1,1) | PK, NOT NULL | | Khóa chính |
| 2 | account_id | UUID | FK | | ID người đánh giá |
| 3 | course_id | UUID | FK, C-IDX | | ID khóa học |
| 4 | parent_id | INT | FK | | ID đánh giá cha (phản hồi) |
| 5 | rating | INT | NOT NULL | `>= 1 AND <= 5` | Số sao (1–5) |
| 6 | comment | TEXT | | | Nội dung đánh giá |
| 7 | status | INT | C-IDX, NOT NULL | | Trạng thái (0/1/2) |
| 8 | created_at | DATETIME | | | Ngày tạo |
| 9 | updated_at | DATETIME | | | Ngày cập nhật |
| 10 | deleted_at | DATETIME | | | Ngày xóa mềm |
> **Status:** 0: Hidden (Ẩn), 1: Published (Hiển thị), 2: Spam (Vi phạm)
>
> **Note:** `parent_id` hỗ trợ phản hồi review; nên giới hạn một review gốc cho mỗi `(account_id, course_id)` nếu chỉ cho phép mỗi học viên đánh giá một lần.


---

## 33. Roles

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | IDENTITY(1,1) | PK, NOT NULL | | Khóa chính |
| 2 | name | VARCHAR(255) | UQ, NOT NULL | | Tên vai trò (ADMIN/INSTRUCTOR/USER) |
| 3 | description | VARCHAR(255) | | | Mô tả vai trò |
| 4 | status | INT | NOT NULL | | Trạng thái (0/1) |
| 5 | created_at | DATETIME | | | Ngày tạo |
| 6 | updated_at | DATETIME | | | Ngày cập nhật |
> **Note:** Role là dữ liệu nền tảng cho phân quyền; nên seed tối thiểu ADMIN, INSTRUCTOR, USER và không xóa cứng role đã gắn account.
>
> **Status:** 0: Inactive (Tạm khoá), 1: Active (Hoạt động)


---

## 34. System_Configs

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | IDENTITY(1,1) | PK, NOT NULL | | Khóa chính |
| 2 | config_key | VARCHAR(255) | UQ, NOT NULL | | Tên cấu hình (duy nhất) |
| 3 | config_value | TEXT | | | Giá trị cấu hình |
| 4 | config_type | VARCHAR(50) | | | Kiểu (STRING/NUMBER/JSON...) |
| 5 | description | VARCHAR(255) | | | Mô tả cấu hình |
| 6 | created_at | DATETIME | | | Ngày tạo |
| 7 | updated_at | DATETIME | | | Ngày cập nhật |

> **Bảng mới** — Cấu hình hệ thống động thay vì dùng file .env (vd: MAX_UPLOAD_SIZE, DEFAULT_COMMISSION).
>
> **Note:** `config_type` nên giới hạn giá trị như STRING, NUMBER, DECIMAL, BOOLEAN, JSON để service parse ổn định.

---

## 35. Supports

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | IDENTITY(1,1) | PK, NOT NULL | | Khóa chính |
| 2 | account_id | UUID | FK | | ID người gửi yêu cầu |
| 3 | assignee_id | UUID | FK | | ID người phụ trách xử lý |
| 4 | subject | VARCHAR(255) | NOT NULL | | Tiêu đề yêu cầu |
| 5 | content | TEXT | | | Nội dung yêu cầu |
| 6 | type | VARCHAR(50) | | | Loại hỗ trợ |
| 7 | priority | INT | | | Mức ưu tiên |
| 8 | status | INT | IDX, NOT NULL | | Trạng thái (0–5) |
| 9 | metadata | JSONB | | | Thông tin mở rộng |
| 10 | created_at | DATETIME | | | Ngày tạo |
| 11 | updated_at | DATETIME | | | Ngày cập nhật |
| 12 | closed_at | DATETIME | | | Ngày đóng ticket |
| 13 | deleted_at | DATETIME | | | Ngày xóa mềm |

> **Metadata:** Lưu dữ liệu mở rộng như `related_type`, `related_id`, lịch sử trao đổi, file đính kèm, ghi chú nội bộ hoặc thông tin thiết bị/trình duyệt.
>
> **Note:** Dùng cho yêu cầu hỗ trợ/chăm sóc khách hàng dạng một bảng gọn. Nếu hội thoại hỗ trợ tăng nhiều, cân nhắc tách `Support_Messages`.
>
> **Status:** 0: Open (Mới), 1: In Progress (Đang xử lý), 2: Waiting Customer (Chờ khách hàng), 3: Resolved (Đã giải quyết), 4: Closed (Đã đóng), 5: Spam (Spam)


---

## 36. Thread_Hashtags

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | IDENTITY(1,1) | PK, NOT NULL | | Khóa chính |
| 2 | thread_id | INT | FK, C-UQ | | ID bài viết |
| 3 | hashtag_id | INT | FK, C-UQ | | ID hashtag |
| 4 | created_at | DATETIME | | | Ngày tạo |

> **Note:** Bảng nối thread-hashtag. Composite unique `(thread_id, hashtag_id)` tránh gắn trùng hashtag vào cùng thread.


---

## 37. Threads

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | IDENTITY(1,1) | PK, NOT NULL | | Khóa chính |
| 2 | account_id | UUID | FK | | ID người tạo bài viết |
| 3 | topic_id | INT | FK, C-IDX | | ID topic |
| 4 | title | VARCHAR(255) | NOT NULL | | Tiêu đề bài viết |
| 5 | slug | VARCHAR(255) | UQ, NOT NULL | | Slug URL (duy nhất) |
| 6 | content | TEXT | | | Nội dung bài viết |
| 7 | view_count | INT | NOT NULL | `>= 0` | Lượt xem |
| 8 | shared_count | INT | NOT NULL | `>= 0` | Lượt chia sẻ |
| 9 | is_locked | BIT | NOT NULL | | Khóa bình luận |
| 10 | is_pinned | BIT | NOT NULL | | Ghim bài viết |
| 11 | status | INT | C-IDX, NOT NULL | | Trạng thái (0–3) |
| 12 | created_at | DATETIME | C-IDX | | Ngày tạo |
| 13 | updated_at | DATETIME | | | Ngày cập nhật |
| 14 | deleted_at | DATETIME | | | Ngày xóa mềm |
> **Note:** `is_locked` chặn bình luận mới; `is_pinned` ưu tiên hiển thị trong topic/forum. `status = 1` hiện được dùng như pending/draft trong luồng duyệt forum.
>
> **Status:** 0: Hidden (Ẩn), 1: Pending/Draft (Chờ duyệt/Bản nháp), 2: Published (Đã xuất bản), 3: Rejected/Banned (Từ chối/Vi phạm)


---

## 38. Topics

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | IDENTITY(1,1) | PK, NOT NULL | | Khóa chính |
| 2 | account_id | UUID | FK | | ID người tạo topic |
| 3 | title | VARCHAR(255) | NOT NULL | | Tên topic |
| 4 | slug | VARCHAR(255) | UQ, NOT NULL | | Slug URL (duy nhất) |
| 5 | description | VARCHAR(255) | | | Mô tả |
| 6 | avatar_url | VARCHAR(2048) | | | Ảnh đại diện |
| 7 | banner_url | VARCHAR(2048) | | | Ảnh banner |
| 8 | status | INT | NOT NULL | | Trạng thái (0/1) |
| 9 | created_at | DATETIME | | | Ngày tạo |
| 10 | updated_at | DATETIME | | | Ngày cập nhật |
| 11 | deleted_at | DATETIME | | | Ngày xóa mềm |
> **Note:** Topic là danh mục forum. `account_id` là người tạo/quản trị topic; `slug` dùng cho URL public.
>
> **Status:** 0: Hidden (Ẩn), 1: Active (Hiển thị)


---

## 39. Votes

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | IDENTITY(1,1) | PK, NOT NULL | | Khóa chính |
| 2 | account_id | UUID | FK | | ID người vote |
| 3 | target_id | VARCHAR(255) | NOT NULL | | ID đối tượng vote |
| 4 | target_type | VARCHAR(255) | | | Loại đối tượng (THREAD/COMMENT...) |
| 5 | type | INT | NOT NULL | | Loại vote/reaction |
| 6 | value | BIT | | | Chiều vote (up/down) |
| 7 | created_at | DATETIME | | | Ngày tạo |
| 8 | updated_at | DATETIME | | | Ngày cập nhật |
| 9 | deleted_at | DATETIME | | | Ngày xóa mềm |

> **Target:** `target_type + target_id` xác định đối tượng được vote theo mô hình polymorphic target (vd: THREAD, COMMENT, REVIEW). Nên tạo index `(target_type, target_id)` nếu thường xuyên tra cứu theo đối tượng.
>
> **Note:** `type` nên dùng để phân biệt hành động vote/reaction nếu cần nhiều loại tương tác; `value` biểu diễn chiều vote như up/down hoặc liked/unliked.


---

## 40. Wallets

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | UUID | PK, NOT NULL | | Khóa chính |
| 2 | account_id | UUID | FK | | ID giảng viên sở hữu ví |
| 3 | remain | DECIMAL(18,6) | NOT NULL | `>= 0` | Số dư hiện tại |
| 4 | type | INT | NOT NULL | | Loại giao dịch ví (1/4/5/6) |
| 5 | status | INT | NOT NULL | | Trạng thái (0/1) |
| 6 | created_at | DATETIME | | | Ngày tạo |
| 7 | available_at | DATETIME | | | Thời điểm tiền khả dụng |
| 8 | target_type | VARCHAR(50) | | | Loại đối tượng liên quan |
| 9 | target_id | UUID | | | ID đối tượng liên quan |
> **Note:** `remain` là số dư hiện có; `available_at` dùng cho thời điểm tiền có thể rút nếu có cơ chế giữ tiền/chờ đối soát.
>
> **Status:** 0: Locked/Frozen (Đóng băng), 1: Active (Hoạt động)

---

## 41. Term_Modules

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | IDENTITY(1,1) | PK, NOT NULL | | Khóa chính |
| 2 | title | VARCHAR(255) | NOT NULL | | Tên nhóm điều khoản |
| 3 | sort_order | INT | IDX, NOT NULL | `>= 0` | Thứ tự hiển thị |
| 4 | status | INT | IDX, NOT NULL | `IN (0, 1)` | Trạng thái (0/1) |
| 5 | metadata | JSONB | | | Cấu hình hiển thị (icon...) |
| 6 | created_at | DATETIME | | | Ngày tạo |
| 7 | updated_at | DATETIME | | | Ngày cập nhật |

> **Note:** Đại diện cho một mục/menu cha trong trang Điều khoản. Có thể tồn tại khi chưa có trang con để quản trị viên tạo mục trước rồi thêm trang sau.
>
> **Metadata:** Cấu hình hiển thị bổ sung như icon, mô tả ngắn hoặc trạng thái mở rộng mặc định.
>
> **Status:** 0: Hidden (Ẩn), 1: Published (Hiển thị)

---

## 42. Terms

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | IDENTITY(1,1) | PK, NOT NULL | | Khóa chính |
| 2 | term_module_id | INT | FK, C-IDX, NOT NULL | | ID nhóm điều khoản |
| 3 | title | VARCHAR(255) | NOT NULL | | Tiêu đề trang |
| 4 | url_path | VARCHAR(255) | UQ | | Đường dẫn URL (duy nhất) |
| 5 | content | TEXT | NOT NULL | | Nội dung điều khoản |
| 6 | sort_order | INT | C-IDX, NOT NULL | `>= 0` | Thứ tự hiển thị |
| 7 | status | INT | C-IDX, NOT NULL | `IN (0, 1)` | Trạng thái (0/1) |
| 8 | metadata | JSONB | | | Cấu hình SEO/mở rộng |
| 9 | created_at | DATETIME | | | Ngày tạo |
| 10 | updated_at | DATETIME | | | Ngày cập nhật |

> **Note:** Mỗi bản ghi là một trang điều khoản/chính sách thuộc một `Term_Module`. `url_path` lưu URL do quản trị viên nhập, không kèm dấu `/` ở đầu; ví dụ `terms/instructor/rewards`.
>
> **Metadata:** Lưu SEO hoặc các cấu hình nội dung mở rộng không cần dùng để lọc/sắp xếp thường xuyên.
>
> **Status:** 0: Draft/Hidden (Nháp/Ẩn), 1: Published (Hiển thị)


---

## 43. Gifts

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | UUID | PK, NOT NULL | | Khóa chính |
| 2 | sender_id | UUID | FK, NOT NULL | | ID người tặng |
| 3 | receiver_id | UUID | FK, NOT NULL | | ID người nhận |
| 4 | course_id | UUID | FK, NOT NULL | | ID khóa học được tặng |
| 5 | order_id | UUID | FK | | ID đơn hàng thanh toán |
| 6 | token | VARCHAR(255) | UQ, NOT NULL | | Token nhận quà (duy nhất) |
| 7 | gift_code | VARCHAR(12) | UQ | | Mã quà tặng 12 số |
| 8 | message | TEXT | | | Lời nhắn kèm quà |
| 9 | status | INT | NOT NULL | | Trạng thái (0–3) |
| 10 | expired_at | DATETIME | | | Ngày hết hạn |
| 11 | created_at | DATETIME | | | Ngày tạo |
| 12 | updated_at | DATETIME | | | Ngày cập nhật |

> **Status:** 0: PENDING (Chờ nhận), 1: ACCEPTED (Đã nhận), 2: REJECTED (Từ chối), 3: EXPIRED (Hết hạn)

---

## 44. Refunds

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | UUID | PK, NOT NULL | | Khóa chính |
| 2 | refund_code | VARCHAR(12) | UQ | | Mã hoàn tiền 12 số |
| 3 | order_detail_id | UUID | FK, NOT NULL | | ID chi tiết đơn hoàn |
| 4 | account_id | UUID | FK, NOT NULL | | ID người yêu cầu |
| 5 | amount | DECIMAL(18,6) | NOT NULL | `>= 0` | Số tiền hoàn |
| 6 | reason | TEXT | | | Lý do hoàn tiền |
| 7 | status | INT | NOT NULL | | Trạng thái (1–3) |
| 8 | decision_type | VARCHAR(20) | | | Loại quyết định duyệt |
| 9 | created_at | DATETIME | | | Ngày tạo |
| 10 | updated_at | DATETIME | | | Ngày cập nhật |

> **Note:** Quản lý yêu cầu hoàn tiền. `decision_type` dùng để ghi nhận loại quyết định (AUTO_APPROVED, AUTO_REJECTED, MANUAL_APPROVED, MANUAL_REJECTED).
>
> **Status:** 1: PENDING (Đang chờ), 2: APPROVED (Đã duyệt), 3: REJECTED (Bị từ chối)


---

## 45. Conversations

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | UUID | PK, NOT NULL | | Khóa chính |
| 2 | course_id | UUID | FK, NOT NULL | | ID khóa học |
| 3 | student_id | UUID | FK, NOT NULL | | ID học viên |
| 4 | instructor_id | UUID | FK, NOT NULL | | ID giảng viên |
| 5 | last_message_id | UUID | FK | | ID tin nhắn cuối |
| 6 | last_message_text | VARCHAR(1000) | | | Nội dung tin cuối |
| 7 | last_message_at | TIMESTAMPTZ | | | Thời điểm tin cuối |
| 8 | created_at | TIMESTAMPTZ | NOT NULL | | Ngày tạo |
| 9 | updated_at | TIMESTAMPTZ | NOT NULL | | Ngày cập nhật |
| 10 | deleted_at | TIMESTAMPTZ | | | Ngày xóa mềm |

> **UQ:** `(course_id, student_id, instructor_id)` — mỗi khóa học chỉ có 1 hội thoại giữa 1 học viên và 1 giảng viên.
>
> **Note:** Hội thoại chat giữa học viên và giảng viên theo khóa học (tạo khi học viên có enrollment hợp lệ trong khóa học đã publish). `last_message_*` phục vụ hiển thị nhanh danh sách hội thoại.


---

## 46. Conversation_Participants

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | UUID | PK, NOT NULL | | Khóa chính |
| 2 | conversation_id | UUID | FK, NOT NULL | | ID hội thoại |
| 3 | account_id | UUID | FK, NOT NULL | | ID thành viên |
| 4 | role | VARCHAR(20) | NOT NULL | | Vai trò trong hội thoại |
| 5 | last_read_message_id | UUID | FK | | ID tin đã đọc gần nhất |
| 6 | last_read_at | TIMESTAMPTZ | | | Thời điểm đọc gần nhất |
| 7 | joined_at | TIMESTAMPTZ | NOT NULL | | Thời điểm tham gia |
| 8 | created_at | TIMESTAMPTZ | NOT NULL | | Ngày tạo |
| 9 | updated_at | TIMESTAMPTZ | NOT NULL | | Ngày cập nhật |

> **UQ:** `(conversation_id, account_id)` — mỗi account chỉ tham gia 1 lần trong một hội thoại.
>
> **Note:** `last_read_message_id` + `last_read_at` phục vụ đếm tin chưa đọc (unreadCount) cho từng bên.


---

## 47. Messages

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | UUID | PK, NOT NULL | | Khóa chính |
| 2 | conversation_id | UUID | FK, NOT NULL | | ID hội thoại |
| 3 | sender_id | UUID | FK, NOT NULL | | ID người gửi |
| 4 | client_message_id | UUID | C-UQ | | ID tin phía client (chống trùng) |
| 5 | content | TEXT | NOT NULL | | Nội dung tin nhắn |
| 6 | type | VARCHAR(20) | NOT NULL | | Loại tin nhắn (TEXT...) |
| 7 | created_at | TIMESTAMPTZ | NOT NULL | | Ngày gửi |
| 8 | edited_at | TIMESTAMPTZ | | | Ngày sửa |
| 9 | deleted_at | TIMESTAMPTZ | | | Ngày xóa mềm |

> **UQ:** `(sender_id, client_message_id)` — chống gửi trùng tin nhắn (idempotency).
>
> **Note:** Cursor pagination dùng index `(conversation_id, created_at DESC, id DESC)`. Real-time qua STOMP tới `/user/{email}/queue/messages`.


---

## 48. Reply_Templates

| # | Trường | Kiểu dữ liệu | Ghi chú | CHECK | Mô tả |
|---|--------|---------------|---------|-------|-------|
| 1 | id | INT | PK, NOT NULL | | Khóa chính |
| 2 | instructor_id | UUID | FK, NOT NULL | | ID giảng viên sở hữu |
| 3 | content | TEXT | NOT NULL | | Nội dung mẫu trả lời |
| 4 | created_at | DATETIME | | | Ngày tạo |
| 5 | updated_at | DATETIME | | | Ngày cập nhật |

> **Note:** Mẫu trả lời nhanh của giảng viên (dùng cho trang Q&A `InstructorQA`).
