# Kế hoạch: Hoàn thiện Dashboard Giảng viên & Trang Doanh thu

> Trạng thái: kế hoạch ban đầu — cần tinh chỉnh thêm.
> Ngữ cảnh: đã hoàn thiện thống kê admin dashboard; tiếp theo là dashboard giảng viên (`/instructor`) và trang Doanh thu (`/instructor/revenue`).

## 1. Mục tiêu

Làm cho các số liệu trên **Dashboard giảng viên** và **trang Doanh thu** hiển thị đúng, đầy đủ và nhất quán với dữ liệu thật (bỏ hardcode, bỏ field thiếu, fix biểu đồ, sao kê đầy đủ), đồng thời tăng tính hoàn thiện UI (course performance, bộ lọc thời gian, xử lý lỗi không trang trắng).

## 2. Quyết định thiết kế đã chốt (hỏi user 2026-09-02)

- **Doanh thu**: hiển thị **cả hai** — doanh thu (gross, tiền học viên trả) và **thu nhập ròng** (net sau hoa hồng, khớp số tiền thực vào ví giảng viên).
- **Tỷ lệ hoàn tiền (refundRate)**: `số đơn hoàn ĐÃ DUYỆT / tổng học viên (lượt đăng ký)` × 100.
- **Phạm vi**: toàn diện — sửa số liệu đúng + sao kê giao dịch đầy đủ ở trang doanh thu + course-performance + bộ lọc thời gian + xử lý trang trắng.

## 3. Vấn đề phát hiện khi nghiên cứu (hiện trạng)

### Backend — `InstructorDashboardServiceImpl` (trang Tổng quan)
- 🔴 **Hardcode giả**: `completionRate = 75.0`, `completionTrend = 0.0`, `ratingTrend = 0.0` (dòng ~59–61) — không phải dữ liệu thật.
- 🔴 **Thiếu field `refundRate`** trong `InstructorDashboardStatsDTO` nhưng FE đọc `stats.refundRate` → thẻ "Hoàn tiền" luôn 0.0%.
- 🟠 **Rating sai**: `ReviewRepository.getAverageRatingByInstructorEmail` + `countRatingsByInstructorEmail` (email-based) thiếu filter `parent IS NULL / status=1 / deletedAt IS NULL` → lời **reply rating=5** của chính GV bị tính vào điểm & phân bố. (Bản id-based `getAverageRatingByInstructorId` filter đủ nhưng không dùng.)
- 🟠 **"Học viên mới"** = `countStudentsByInstructorEmailAndDateRange` đếm theo **bản ghi enrollment** (không distinct, không lọc hoàn/dropped/status) → số có thể sai; bỏ sót lần mua lại (vì `EnrollmentListener` kích hoạt lại row cũ).
- 🟠 **`getCoursePerformance`**: đếm enrollment gồm cả refunded/dropped; `completed` dựa `progress>=100` không theo trạng thái active; rating khóa gồm reply/deleted; **không `@Transactional`** (nguy cơ LazyInitializationException); map status chỉ "active"/"draft".
- 🟠 **Doanh thu báo GROSS**, không nhân `instructorRatio` → "doanh thu" ≠ "thu nhập thực nhận" (ví `remain` là net). Cần trả kèm **net revenue**.
- 🟡 Chart nhãn `"T"+tháng` thiếu năm; không nhận tham số `months` (luôn 6 tháng cố định).
- 🟡 Email không chuẩn hoá; endpoint cho phép ADMIN (admin không có khóa → số 0).

### Frontend — `InstructorDashboard.jsx`
- 🔴 Biểu đồ **mất nhãn trục X**: FE `xAxisKey="name"` nhưng backend trả key `month` (mock cũ dùng `name`).
- 🟠 Subtitle biểu đồ "Tổng doanh thu:" nhưng đang hiển thị `monthRevenue` (doanh thu tháng) — không khớp tổng biểu đồ.
- 🟠 "Dựa trên 1,000+ đánh giá" bị hardcode.
- 🟠 Date filter là no-op (chỉ `console.log`); `StudentGrowthChart` không nhận `onFilterChange`; nút Đồng bộ/Xuất báo cáo không có handler.
- 🟠 `COURSE_PERFORMANCE` fetch nhưng không render; `PENDING_TASKS` hardcode `[]` không dùng.
- 🟠 Lỗi bất kỳ 1 request → `Promise.all` reject → hook `throw` → trang **trắng** (`if (!data) return null`).

### Frontend — Trang Doanh thu `InstructorRevenue.jsx`
- 🟠 Bảng sao kê **chỉ hiện payout** (từ `/wallet/transactions`); doanh thu/hoàn tiền không xuất hiện dù ví có tiền → empty state gây hiểu lầm.
- 🟠 Backend đã có `GET /wallet/history` (EARNING/WITHDRAWAL/REFUND/DEPOSIT) nhưng FE không khai hàm, hook không gọi.
- 🟡 `getWalletStats` (`/wallet/stats`) không nơi nào gọi.
- 🟡 Thẻ "Tổng doanh thu" = gross, "Số dư khả dụng" = net — cần làm rõ + bổ sung net.

### Về số 0 trong screenshot
Phần lớn số 0 là **dữ liệu thật** (tài khoản demo chưa có đơn/đánh giá trong tháng). Chỉ **75% (giả)** và **0.0% hoàn tiền (thiếu field)** là sai chắc chắn.

## 4. Triển khai

### Phần 1 — Backend: sửa số liệu cho đúng

**1A. `OrderDetailRepository`** — thêm query thu nhập ròng theo giảng viên (mirror WalletListener, nhân `instructorRatio`; pattern CASE coupon ADMIN như các query hiện có):
```java
Double sumInstructorEarningByAccountAndDateRange(Account account, LocalDateTime start, LocalDateTime end);
Double sumTotalInstructorEarningByAccount(Account account);
```

**1B. `EnrollmentRepository`** — thêm:
```java
// Học viên mới: DISTINCT + chỉ ACTIVE (status 1,2)
long countDistinctNewStudentsByInstructorEmailAndDateRange(String email, LocalDateTime start, LocalDateTime end);
// Tỷ lệ hoàn thành thật (chỉ enrollment đang học)
long countActiveByCourseAccountId(UUID accountId);
long countCompletedByCourseAccountId(UUID accountId); // status IN (1,2) AND progressPercent = 100
```

**1C. `RefundRepository`** — thêm:
```java
long countByOrderDetailCourseAccountIdAndStatus(UUID accountId, Integer status); // status = RefundStatus.APPROVED (2)
```

**1D. `ReviewRepository`** — sửa 2 query email-based thêm `r.deletedAt IS NULL AND r.status = 1 AND r.parent IS NULL` (đồng bộ bản id-based).

**1E. DTO**
- `InstructorDashboardStatsDTO`: + `monthNetRevenue`, `ratingCount`, `refundRate`.
- `ChartDataDTO`: + `netRevenue`.

**1F. `InstructorDashboardServiceImpl`** (sửa lõi)
- Inject `AccountRepository`, `RefundRepository`; resolve giảng viên theo email (dùng email canonical + accountId) cho query chính xác.
- `getStats`: bỏ hardcode → tính thật:
  - `completionRate = completed / activeEnrollments × 100`; `completionTrend` = trend enrollment hoàn thành tháng này vs tháng trước (`...AndCreatedAtBetween` đã có).
  - `refundRate = approvedRefunds / tổng enrollments × 100`.
  - `monthNetRevenue = sumInstructorEarningByAccountAndDateRange(...)`.
  - `newStudents` = distinct active trong kỳ.
  - `ratingCount` = tổng rating hợp lệ.
  - `ratingTrend`: nếu chưa có query theo tháng → giữ 0 hoặc tính đơn giản từ dữ liệu (quyết định khi code).
- `getRevenueChart(email, months)` / `getStudentGrowthChart(email, months)`: nhận `months` (mặc định 6); nhãn `T8/26` (có năm); chart doanh thu trả `revenue` + `netRevenue`.
- `getCoursePerformance`: `@Transactional`; đếm chỉ ACTIVE (status 1,2); rating lọc đúng; map status đầy đủ (active/draft/pending/rejected).

**1G. `InstructorDashboardController`**: thêm `@RequestParam(defaultValue="6") Integer months` cho 2 chart; cân nhắc role chỉ INSTRUCTOR (hoặc giữ ADMIN nhưng trả dữ liệu của chính user đang gọi).

### Phần 2 — Frontend Dashboard giảng viên

**2A. `InstructorDashboard.jsx`**
- `xAxisKey="name"` → `"month"` cho RevenueChart & StudentGrowthChart.
- Banner "Doanh thu tháng": hiện **gross** + phụ đề **"Thu nhập: {monthNetRevenue}"**.
- RevenueChart: vẽ **Doanh thu (gross)** + **Thu nhập ròng (net)**; subtitle = tổng đúng của biểu đồ (hoặc đổi nhãn cho đúng).
- Thẻ "Hoàn tiền" đọc `refundRate`; thẻ "Hoàn thành" đọc `completionRate` (đã thật).
- Rating chart: bỏ hardcode "1,000+ đánh giá" → `ratingCount`.
- Render **Hiệu suất khóa học** (`COURSE_PERFORMANCE`).
- Date filter gọi lại backend (months); thêm trạng thái **lỗi** — không trang trắng khi 1 request fail (đổi `Promise.all` → xử lý từng phần hoặc hiện message lỗi).
- (Cân nhắc) dùng `PENDING_TASKS` từ `/questions` + `/reviews`.

**2B. `useInstructorDashboard.js`**: truyền `months` từ filter; truyền `onFilterChange` cho StudentGrowthChart; format net revenue; loại bỏ hardcode trend nếu backend đã có.

### Phần 3 — Trang Doanh thu giảng viên

**3A. `walletService.js`**: thêm `getHistory()` → `GET /wallet/history`.
**3B. `useInstructorRevenue.js`**: fetch thêm `/wallet/history`.
**3C. `InstructorRevenue.jsx`**: bảng sao kê hiển thị đầy đủ earning/withdraw/refund/deposit (loại, dấu +/-, mã GD, trạng thái) — không chỉ payout; thẻ bổ sung: thu nhập ròng tháng + "Đang giữ 30 ngày" (`pendingRevenue`).

## 5. Tiêu chí chấp nhận (acceptance)

- [ ] Không còn hardcode `75.0` — completion rate tính từ enrollment thật.
- [ ] Thẻ "Hoàn tiền" hiển thị `refundRate` đúng (đơn hoàn ĐÃ DUYỆT / tổng học viên).
- [ ] Điểm đánh giá & phân bố sao không còn tính lời reply / review ẩn / đã xoá.
- [ ] Biểu đồ doanh thu/học viên có nhãn trục X (key `month`).
- [ ] Doanh thu hiển thị cả gross và thu nhập ròng (banner + biểu đồ + trang doanh thu).
- [ ] Sao kê giao dịch hiện đủ earning/withdraw/refund/deposit.
- [ ] Dashboard không bị trang trắng khi lỗi; có trạng thái lỗi.
- [ ] Compile backend OK, build web OK (không chạy unit test — user yêu cầu bỏ qua).

## 6. Câu hỏi mở / cần tinh chỉnh khi code

1. `ratingTrend` & `completionTrend`: tính thật theo tháng (cần query mới) hay tạm để 0 — quyết định khi code.
2. "Tổng học viên" dùng distinct hay tổng lượt đăng ký làm mẫu số cho refundRate (đã chọn: tổng lượt đăng ký để tránh >100%).
3. Có thay "Doanh thu tháng" (banner) bằng thu nhập ròng làm giá trị chính không, hay giữ gross làm chính + net phụ đề.
4. Course-performance: hiển thị dạng bảng/badge trong dashboard hay tách trang riêng.
5. Bộ lọc thời gian: cho cả dashboard (months 3/6/12) hay giữ mặc định 6.
